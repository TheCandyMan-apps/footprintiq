import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token',
};

interface HealthLogRequest {
  worker: string;
  worker_url?: string;
  status: string;
  healthy: boolean;
  responseTime?: number;
  tools?: {
    sherlock?: boolean;
    maigret?: boolean;
    whatsmyname?: boolean;
    holehe?: boolean;
    gosearch?: boolean;
  };
  error?: string;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate callback token for n8n requests
    const callbackToken = req.headers.get('x-callback-token');
    const expectedToken = Deno.env.get('N8N_CALLBACK_TOKEN');
    
    // Allow requests with valid callback token OR service role key
    const authHeader = req.headers.get('authorization');
    const isServiceRole = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const isValidCallback = callbackToken && expectedToken && callbackToken === expectedToken;
    
    if (!isServiceRole && !isValidCallback) {
      // For development/testing, allow requests without strict auth
      console.warn('Request without proper authentication - allowing for monitoring purposes');
    }

    const body: HealthLogRequest = await req.json();

    // Validate required fields
    if (!body.worker || body.status === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: worker, status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare the health log entry
    const healthLog = {
      worker_name: body.worker,
      worker_url: body.worker_url || 'https://osint-multitool-worker-312297078337.europe-west1.run.app',
      status: body.status,
      healthy: body.healthy ?? false,
      response_time_ms: body.responseTime || null,
      tools_status: body.tools ? {
        sherlock: body.tools.sherlock ?? null,
        maigret: body.tools.maigret ?? null,
        whatsmyname: body.tools.whatsmyname ?? null,
        holehe: body.tools.holehe ?? null,
        gosearch: body.tools.gosearch ?? null,
      } : null,
      error_message: body.error || null,
      checked_at: body.timestamp || new Date().toISOString(),
    };

    // Insert the health log
    const { data, error } = await supabase
      .from('worker_health_logs')
      .insert(healthLog)
      .select()
      .single();

    if (error) {
      console.error('Failed to insert health log:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to log health check', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Health check logged:', {
      id: data.id,
      worker: body.worker,
      healthy: body.healthy,
      status: body.status,
    });

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        message: 'Health check logged successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in worker-health-log:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
