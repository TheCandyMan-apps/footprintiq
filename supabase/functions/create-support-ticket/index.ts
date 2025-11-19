import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { errorResponse, safeError } from '../_shared/errors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse(new Error('Missing authorization'), 401, 'AUTH_FAILED', corsHeaders);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse(authError || new Error('Unauthorized'), 401, 'AUTH_FAILED', corsHeaders);
    }

    const { subject, description, category, workspace_id } = await req.json();

    if (!subject || !description) {
      return errorResponse(new Error('Missing required fields'), 400, 'INVALID_INPUT', corsHeaders);
    }

    // Create ticket
    const { data: ticket, error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        workspace_id: workspace_id || null,
        user_id: user.id,
        created_by: user.id,
        subject,
        description,
        category: category || 'technical',
        status: 'new',
        priority: 'medium',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[create-support-ticket] Insert error:', insertError);
      return errorResponse(insertError, 500, 'SERVER_ERROR', corsHeaders);
    }

    console.log(`[create-support-ticket] Created ticket ${ticket.id} for user ${user.id}`);

    return new Response(JSON.stringify({ ticket }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = safeError(error);
    return errorResponse(error, 500, 'SERVER_ERROR', corsHeaders);
  }
});
