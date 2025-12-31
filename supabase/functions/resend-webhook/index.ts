import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[resend-webhook][${timestamp}] ${step}`, details ? JSON.stringify(details) : '');
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // For click events
    click?: {
      link: string;
      timestamp: string;
    };
    // For bounce events
    bounce?: {
      message: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ResendWebhookEvent = await req.json();
    
    logStep('Received webhook', { type: payload.type, emailId: payload.data?.email_id });

    if (!payload.type || !payload.data?.email_id) {
      logStep('ERROR: Invalid webhook payload');
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const emailId = payload.data.email_id;
    const eventTime = new Date().toISOString();

    // Map Resend event types to our database columns
    let updateData: Record<string, string> = {};
    
    switch (payload.type) {
      case 'email.delivered':
        updateData = { delivered_at: eventTime };
        break;
      case 'email.opened':
        // Only update if not already opened (track first open)
        updateData = { opened_at: eventTime };
        break;
      case 'email.clicked':
        // Only update if not already clicked (track first click)
        updateData = { clicked_at: eventTime };
        break;
      case 'email.bounced':
      case 'email.delivery_delayed':
        updateData = { bounced_at: eventTime };
        break;
      default:
        logStep('Unhandled event type', { type: payload.type });
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    // Update the email notification record
    // Use a conditional update to only set first occurrence
    const { data: existing, error: fetchError } = await supabase
      .from('email_notifications')
      .select('id, opened_at, clicked_at')
      .eq('resend_id', emailId)
      .maybeSingle();

    if (fetchError) {
      logStep('ERROR: Failed to fetch email record', { error: fetchError.message });
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!existing) {
      logStep('No matching email record found', { emailId });
      return new Response(JSON.stringify({ success: true, notFound: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // For opened and clicked, only update if not already set
    if (payload.type === 'email.opened' && existing.opened_at) {
      logStep('Already opened, skipping', { emailId });
      return new Response(JSON.stringify({ success: true, alreadyTracked: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (payload.type === 'email.clicked' && existing.clicked_at) {
      logStep('Already clicked, skipping', { emailId });
      return new Response(JSON.stringify({ success: true, alreadyTracked: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { error: updateError } = await supabase
      .from('email_notifications')
      .update(updateData)
      .eq('id', existing.id);

    if (updateError) {
      logStep('ERROR: Failed to update email record', { error: updateError.message });
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    logStep('Successfully updated email tracking', { type: payload.type, emailId });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    logStep('ERROR: Webhook processing failed', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
