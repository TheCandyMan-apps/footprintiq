import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WORKER_URL = Deno.env.get('VITE_MAIGRET_API_URL') ?? '';
    const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN') ?? '';
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('🏥 Starting Maigret worker health check');
    console.log(`Worker URL: ${WORKER_URL}`);

    // Test with known username
    const testUsername = 'test_health_check';
    const healthUrl = `${WORKER_URL}/health`;
    const scanUrl = `${WORKER_URL}/scan/${testUsername}`;

    // Check 1: Basic health endpoint
    console.log(`Checking ${healthUrl}`);
    const healthCheck = await fetch(healthUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (!healthCheck.ok) {
      throw new Error(`Health endpoint failed: ${healthCheck.status}`);
    }

    const healthData = await healthCheck.json();
    console.log('✓ Health endpoint OK:', healthData);

    // Check 2: Test scan with timeout
    console.log(`Testing scan: ${scanUrl}`);
    const scanCheck = await fetch(scanUrl, {
      headers: { 'X-Worker-Token': WORKER_TOKEN },
      signal: AbortSignal.timeout(10000),
    });

    if (!scanCheck.ok) {
      throw new Error(`Scan test failed: ${scanCheck.status}`);
    }

    // Check if we get streaming data
    let hasData = false;
    const reader = scanCheck.body?.getReader();
    if (reader) {
      const { value, done } = await reader.read();
      hasData = !done && value && value.length > 0;
      reader.cancel();
    }

    console.log(`✓ Scan endpoint OK, streaming: ${hasData}`);

    // Log health check result
    await supabase
      .from('worker_health_checks')
      .insert({
        worker_name: 'maigret-api',
        status: 'healthy',
        response_time_ms: Date.now(),
        metadata: {
          health_endpoint: healthData,
          scan_streaming: hasData,
        },
      });

    return new Response(
      JSON.stringify({
        status: 'healthy',
        worker_url: WORKER_URL,
        health_check: healthData,
        scan_streaming: hasData,
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
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
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
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
      const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      
      await supabase
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
