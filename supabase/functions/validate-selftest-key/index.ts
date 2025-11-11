import { corsHeaders } from '../_shared/secure.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const SELFTEST_KEY = Deno.env.get('SELFTEST_KEY');
    
    if (!SELFTEST_KEY) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'SELFTEST_KEY not configured in backend',
          message: 'SELFTEST_KEY environment variable is not set'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    const { test_key } = await req.json();

    if (!test_key) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Missing test_key in request body'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    const isValid = test_key === SELFTEST_KEY;
    const expectedPrefix = SELFTEST_KEY.substring(0, 5);
    const receivedPrefix = test_key.substring(0, 5);

    return new Response(
      JSON.stringify({
        valid: isValid,
        expected_key_prefix: expectedPrefix + '*'.repeat(Math.max(0, SELFTEST_KEY.length - 5)),
        received_key_prefix: receivedPrefix + '*'.repeat(Math.max(0, test_key.length - 5)),
        message: isValid 
          ? 'SELFTEST_KEY matches - configuration is valid' 
          : `SELFTEST_KEY mismatch - backend expects key starting with "${expectedPrefix}", received key starting with "${receivedPrefix}"`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[validate-selftest-key] Error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }
});
