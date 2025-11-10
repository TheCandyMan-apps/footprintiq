import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Declare env vars at function level so they're accessible in catch blocks
  const WORKER_URL = Deno.env.get('VITE_MAIGRET_API_URL') ?? '';
  const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN') ?? '';
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  try {

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('🏥 Starting Maigret worker health check');
    console.log(`Worker URL: ${WORKER_URL}`);

    const healthUrl = `${WORKER_URL}/health`;
    let healthData: any = null;
    let usedFallback = false;

    // Check 1: Try health endpoint first
    console.log(`Checking ${healthUrl}`);
    try {
      const healthCheck = await fetch(healthUrl, {
        signal: AbortSignal.timeout(5000),
      });

      if (healthCheck.ok) {
        healthData = await healthCheck.json();
        console.log('✓ Health endpoint OK:', healthData);
      } else if (healthCheck.status === 404) {
        console.log('⚠️ Health endpoint returned 404, trying fallback probe...');
        usedFallback = true;
      } else {
        throw new Error(`Health endpoint failed: ${healthCheck.status}`);
      }
    } catch (error: any) {
      console.log('⚠️ Health endpoint failed, trying fallback probe:', error.message);
      usedFallback = true;
    }

    // Fallback: Probe /run endpoint if /health unavailable
    if (usedFallback) {
      console.log('Fallback: Sending test scan request to /run');
      const probeUrl = `${WORKER_URL}/run`;
      const probeResponse = await fetch(probeUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WORKER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernames: ['fp_healthcheck'],
          sites: ['github'],
          timeout: 5,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!probeResponse.ok) {
        throw new Error(`Fallback probe failed: ${probeResponse.status}`);
      }

      // Check if response is parsable
      const probeText = await probeResponse.text();
      if (probeText.length === 0) {
        throw new Error('Fallback probe returned empty response');
      }

      healthData = { status: 'healthy_via_fallback', probe: 'success' };
      console.log('✓ Fallback probe successful');
    }


    // Log health check result
    await supabase
      .from('worker_health_checks')
      .insert({
        worker_name: 'maigret-api',
        status: 'healthy',
        response_time_ms: Date.now(),
        metadata: {
          health_data: healthData,
          used_fallback: usedFallback,
        },
      });

    return new Response(
      JSON.stringify({
        status: 'healthy',
        worker_url: WORKER_URL,
        health_check: healthData,
        used_fallback: usedFallback,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Worker health check FAILED:', error);

    // Send alert email
    try {
      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'FootprintIQ Alerts <alerts@footprintiq.app>',
            to: ['admin@footprintiq.app'],
            subject: '🚨 Maigret Worker Health Alert',
            html: `
              <h2>Maigret Worker Health Check Failed</h2>
              <p><strong>Error:</strong> ${error.message}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Worker URL:</strong> ${Deno.env.get('VITE_MAIGRET_API_URL')}</p>
              <p>Action required: Check worker configuration and deployment.</p>
            `,
          }),
        });
        console.log('✓ Alert email sent to admin');
      }
    } catch (emailError) {
      console.error('Failed to send alert email:', emailError);
    }

    // Log failed check
    try {
      const logSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      
      await logSupabase
        .from('worker_health_checks')
        .insert({
          worker_name: 'maigret-api',
          status: 'failed',
          error_message: error.message,
        });
    } catch (logError) {
      console.error('Failed to log health check:', logError);
    }

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
