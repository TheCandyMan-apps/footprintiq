import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  removalRequestId: z.string().uuid({ message: "Invalid removal request ID format" }),
  userEmail: z.string().email({ message: "Invalid email address" }).max(255),
  userName: z.string().min(1).max(200),
});

// Data broker opt-out endpoints and procedures
const REMOVAL_PROCEDURES = {
  'PeopleSearchNow': {
    method: 'form',
    url: 'https://www.peoplesearchnow.com/opt-out',
    fields: ['email', 'name', 'address'],
    automated: false,
  },
  'WhitePages': {
    method: 'form',
    url: 'https://www.whitepages.com/suppression_requests',
    fields: ['name', 'phone', 'address'],
    automated: false,
  },
  'Spokeo': {
    method: 'form',
    url: 'https://www.spokeo.com/optout',
    fields: ['email', 'url'],
    automated: false,
  },
  'BeenVerified': {
    method: 'email',
    email: 'support@beenverified.com',
    subject: 'Data Removal Request',
    automated: false,
  },
  'Intelius': {
    method: 'form',
    url: 'https://www.intelius.com/optout',
    fields: ['name', 'email', 'address'],
    automated: false,
  },
};

// Import shared PII masking utilities
import { maskEmail } from "../_shared/maskPII.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.issues 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { removalRequestId, userEmail, userName } = validation.data;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate user ownership
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.split('Bearer ')[1]);
      if (user) {
        const { data: request } = await supabase.from('removal_requests').select('user_id').eq('id', removalRequestId).single();
        if (request && request.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Access denied' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    console.log('Processing automated removal:', removalRequestId, 'email:', maskEmail(userEmail));

    // Get removal request details
    const { data: request, error: requestError } = await supabase
      .from('removal_requests')
      .select('*')
      .eq('id', removalRequestId)
      .single();

    if (requestError) throw requestError;

    const procedure = REMOVAL_PROCEDURES[request.source_name as keyof typeof REMOVAL_PROCEDURES];
    
    if (!procedure) {
      return new Response(
        JSON.stringify({ 
          error: 'No removal procedure available for this source',
          manual_required: true 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let removalStatus = 'pending';
    let removalNotes = '';

    if (procedure.automated) {
      // Automated removal (not implemented for most data brokers)
      // This would require API access or automated form submission
      removalNotes = 'Automated removal initiated';
      removalStatus = 'in_progress';
    } else {
      // Generate manual removal instructions
      const instructions = generateRemovalInstructions(
        request.source_name,
        procedure,
        userEmail,
        userName
      );

      removalNotes = instructions;
      removalStatus = 'pending';
    }

    // Update removal request
    const { error: updateError } = await supabase
      .from('removal_requests')
      .update({
        status: removalStatus,
        notes: removalNotes,
      })
      .eq('id', removalRequestId);

    if (updateError) throw updateError;

    // Send email notification with instructions
    // (Would integrate with email service like SendGrid/Resend)
    console.log('Removal request updated - status:', removalStatus, 'automated:', procedure.automated);

    return new Response(
      JSON.stringify({
        success: true,
        status: removalStatus,
        instructions: removalNotes,
        manual_required: !procedure.automated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Automated removal error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred processing removal request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateRemovalInstructions(
  sourceName: string,
  procedure: any,
  userEmail: string,
  userName: string
): string {
  let instructions = `# Data Removal Instructions for ${sourceName}\n\n`;
  
  if (procedure.method === 'form') {
    instructions += `## Web Form Removal\n\n`;
    instructions += `1. Visit: ${procedure.url}\n`;
    instructions += `2. Fill out the form with the following information:\n`;
    procedure.fields.forEach((field: string) => {
      instructions += `   - ${field}\n`;
    });
    instructions += `3. Submit the form\n`;
    instructions += `4. Check your email for confirmation\n\n`;
    instructions += `**Estimated processing time: 3-7 business days**\n`;
  } else if (procedure.method === 'email') {
    instructions += `## Email Removal Request\n\n`;
    instructions += `Send an email to: ${procedure.email}\n\n`;
    instructions += `Subject: ${procedure.subject}\n\n`;
    instructions += `Body:\n`;
    instructions += `---\n`;
    instructions += `Dear ${sourceName} Support,\n\n`;
    instructions += `I am requesting the removal of my personal information from your database.\n\n`;
    instructions += `Name: ${userName}\n`;
    instructions += `Email: ${userEmail}\n\n`;
    instructions += `Please confirm when my data has been removed.\n\n`;
    instructions += `Thank you,\n`;
    instructions += `${userName}\n`;
    instructions += `---\n\n`;
    instructions += `**Estimated processing time: 7-14 business days**\n`;
  }

  instructions += `\n## What to Expect\n\n`;
  instructions += `- You should receive a confirmation email\n`;
  instructions += `- The removal process may take several days\n`;
  instructions += `- You may need to verify your identity\n`;
  instructions += `- Some sites may require you to re-submit if your data reappears\n`;

  return instructions;
}
