import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';

// Test scan endpoint to verify pipeline with known-good data
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'method_not_allowed' }),
      { status: 405, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );
  }

  // Authenticate user
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'missing_authorization_header' }),
      { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'invalid_or_expired_token' }),
        { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    // Use a known test email (or provide one in request body)
    const { testEmail } = await req.json().catch(() => ({ testEmail: 'test@example.com' }));

    console.log(`[test-scan] Running test scan for ${testEmail}`);

    // Test HIBP provider
    const hibpResults = await testProvider('hibp', testEmail, 'email');
    
    // Test DeHashed provider (if configured)
    const dehashedResults = await testProvider('dehashed', testEmail, 'email');

    const results = {
      status: 'completed',
      testEmail,
      timestamp: new Date().toISOString(),
      providers: {
        hibp: {
          tested: true,
          success: hibpResults.success,
          findingsCount: hibpResults.findings?.length || 0,
          error: hibpResults.error,
        },
        dehashed: {
          tested: true,
          success: dehashedResults.success,
          findingsCount: dehashedResults.findings?.length || 0,
          error: dehashedResults.error,
        },
      },
      summary: {
        totalFindings: (hibpResults.findings?.length || 0) + (dehashedResults.findings?.length || 0),
        providersSuccessful: [hibpResults.success, dehashedResults.success].filter(Boolean).length,
        providersFailed: [!hibpResults.success, !dehashedResults.success].filter(Boolean).length,
      },
    };

    return new Response(
      JSON.stringify(results),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[test-scan] Error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      }
    );
  }
});

async function testProvider(provider: string, target: string, type: string) {
  try {
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call provider-proxy
    const { data, error } = await supabaseService.functions.invoke('provider-proxy', {
      body: { provider, target, type, options: {} }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      findings: data?.findings || [],
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
