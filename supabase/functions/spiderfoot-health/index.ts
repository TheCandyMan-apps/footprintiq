import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is authenticated
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if SpiderFoot is configured
    const spiderfootUrl = Deno.env.get('SPIDERFOOT_API_URL');
    const spiderfootKey = Deno.env.get('SPIDERFOOT_API_KEY');

    if (!spiderfootUrl || spiderfootUrl.includes('localhost:5001')) {
      console.log('[spiderfoot-health] SpiderFoot not configured or using localhost');
      return new Response(
        JSON.stringify({
          status: 'not_configured',
          configured: false,
          url_set: !!spiderfootUrl,
          is_localhost: spiderfootUrl?.includes('localhost') || false,
          message: 'SpiderFoot API URL not configured or still points to localhost'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to ping SpiderFoot API
    try {
      const healthUrl = `${spiderfootUrl.replace(/\/$/, '')}/api`;
      const pingController = new AbortController();
      const timeoutId = setTimeout(() => pingController.abort(), 5000);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (spiderfootKey) {
        headers['Authorization'] = `Bearer ${spiderfootKey}`;
      }

      const pingResponse = await fetch(healthUrl, {
        method: 'GET',
        headers,
        signal: pingController.signal
      });

      clearTimeout(timeoutId);

      if (pingResponse.ok || pingResponse.status === 401) {
        // 401 means the API is reachable but needs auth (which is fine, it's responding)
        console.log('[spiderfoot-health] SpiderFoot API is reachable');
        return new Response(
          JSON.stringify({
            status: 'ok',
            configured: true,
            url: spiderfootUrl,
            has_api_key: !!spiderfootKey,
            reachable: true,
            message: 'SpiderFoot is configured and reachable'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.warn('[spiderfoot-health] SpiderFoot API returned non-ok status:', pingResponse.status);
      return new Response(
        JSON.stringify({
          status: 'unreachable',
          configured: true,
          url: spiderfootUrl,
          has_api_key: !!spiderfootKey,
          reachable: false,
          http_status: pingResponse.status,
          message: `SpiderFoot configured but returned HTTP ${pingResponse.status}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (pingError) {
      console.error('[spiderfoot-health] Failed to ping SpiderFoot API:', pingError);
      return new Response(
        JSON.stringify({
          status: 'unreachable',
          configured: true,
          url: spiderfootUrl,
          has_api_key: !!spiderfootKey,
          reachable: false,
          error: pingError.message,
          message: 'SpiderFoot configured but unreachable'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[spiderfoot-health] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
