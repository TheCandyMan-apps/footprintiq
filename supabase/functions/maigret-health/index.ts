import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Use unified OSINT worker
  const WORKER_URL = Deno.env.get('OSINT_WORKER_URL') ?? '';
  const WORKER_TOKEN = Deno.env.get('OSINT_WORKER_TOKEN') ?? '';
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('🏥 Starting OSINT worker health check');
    console.log(`Worker URL: ${WORKER_URL}`);

    if (!WORKER_URL) {
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          error: 'OSINT_WORKER_URL not configured',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const baseUrl = WORKER_URL.replace('/scan', '');
    const healthUrl = `${baseUrl}/health`;
    let healthData: any = null;
    let usedFallback = false;

    // Check 1: Try health endpoint first
    console.log(`Checking ${healthUrl}`);
    try {
      const healthCheck = await fetch(healthUrl, {
        signal: AbortSignal.timeout(10000),
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

    // Worker doesn't have /health endpoint - try test endpoints
    if (usedFallback) {
      try {
        // Test Sherlock installation
        const testSherlockUrl = `${baseUrl}/test-sherlock`;
        const testResponse = await fetch(testSherlockUrl, {
          signal: AbortSignal.timeout(10000),
        });
        
        if (testResponse.ok) {
          healthData = { 
            status: 'healthy', 
            note: 'Worker responding via test-sherlock endpoint',
            worker_url: WORKER_URL
          };
          usedFallback = true;
        } else {
          healthData = { 
            status: 'unknown', 
            note: 'Worker does not expose health/test endpoints',
            worker_url: WORKER_URL
          };
        }
      } catch {
        healthData = { 
          status: 'unknown', 
          note: 'Worker health check endpoints unavailable',
          worker_url: WORKER_URL
        };
      }
    }

    // Log health check result
    await supabase
      .from('worker_health_checks')
      .insert({
        worker_name: 'osint-multitool-worker',
        status: healthData?.status === 'healthy' ? 'healthy' : 'unknown',
        response_time_ms: Date.now(),
        metadata: {
          health_data: healthData,
          used_fallback: usedFallback,
        },
      });

    return new Response(
      JSON.stringify({
        status: healthData?.status === 'healthy' ? 'healthy' : 'unknown',
        worker: 'osint-multitool-worker',
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
            from: 'FootprintIQ Alerts <onboarding@resend.dev>',
            to: [Deno.env.get("ADMIN_EMAIL") || "robin.s.clifford@gmail.com"],
            subject: '🚨 OSINT Worker Health Alert',
            html: `
              <h2>OSINT Worker Health Check Failed</h2>
              <p><strong>Error:</strong> ${error.message}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Worker URL:</strong> ${WORKER_URL}</p>
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
          worker_name: 'osint-multitool-worker',
          status: 'failed',
          error_message: error.message,
        });
    } catch (logError) {
      console.error('Failed to log health check:', logError);
    }

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        worker: 'osint-multitool-worker',
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
