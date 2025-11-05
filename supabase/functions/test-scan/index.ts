import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    // Test with a known-good email that should return results from HIBP
    const testEmail = 'test@example.com';
    
    console.log('[test-scan] Running test scan with:', testEmail);

    // Call HIBP provider directly
    const hibpResult = await testHIBP(testEmail);
    
    // Call DeHashed if configured
    let dehashedResult = null;
    if (Deno.env.get('DEHASHED_API_KEY')) {
      try {
        dehashedResult = await testDeHashed(testEmail);
      } catch (error) {
        console.error('[test-scan] DeHashed test failed:', error);
      }
    }

    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      testTarget: testEmail,
      results: {
        hibp: hibpResult,
        dehashed: dehashedResult,
      },
      summary: {
        hibpFindings: hibpResult?.findings?.length || 0,
        dehashedFindings: dehashedResult?.findings?.length || 0,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[test-scan] Error:', error);
    return new Response(JSON.stringify({ 
      status: 'error', 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});

async function testHIBP(email: string) {
  const apiKey = Deno.env.get('HIBP_API_KEY');
  if (!apiKey) {
    return { findings: [], note: 'HIBP_API_KEY not configured' };
  }

  try {
    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'FootprintIQ-Test',
        },
      }
    );

    if (response.status === 404) {
      return { findings: [], note: 'No breaches found (404 - expected for test email)' };
    }

    if (!response.ok) {
      throw new Error(`HIBP returned ${response.status}`);
    }

    const breaches = await response.json();
    
    // Normalize to UFM format
    const findings = breaches.slice(0, 3).map((breach: any) => ({
      provider: 'hibp',
      kind: 'breach.credential_leak',
      severity: 'high',
      confidence: 0.9,
      observedAt: breach.BreachDate,
      evidence: [
        { key: 'breach_name', value: breach.Name },
        { key: 'domain', value: breach.Domain },
        { key: 'breach_date', value: breach.BreachDate },
      ],
    }));

    return { findings, totalBreaches: breaches.length };
  } catch (error) {
    console.error('[test-scan] HIBP error:', error);
    return { findings: [], error: (error as Error).message };
  }
}

async function testDeHashed(email: string) {
  const apiKey = Deno.env.get('DEHASHED_API_KEY');
  const username = Deno.env.get('DEHASHED_API_KEY_USERNAME');
  
  if (!apiKey || !username) {
    return { findings: [], note: 'DeHashed credentials not configured' };
  }

  try {
    const response = await fetch(
      `https://api.dehashed.com/search?query=email:${encodeURIComponent(email)}&size=3`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(`${username}:${apiKey}`)}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`DeHashed returned ${response.status}`);
    }

    const data = await response.json();
    const entries = data.entries || [];

    // Normalize to UFM format
    const findings = entries.map((entry: any) => ({
      provider: 'dehashed',
      kind: 'breach.credential_leak',
      severity: 'high',
      confidence: 0.85,
      observedAt: entry.obtained_at || new Date().toISOString(),
      evidence: [
        { key: 'email', value: entry.email },
        { key: 'username', value: entry.username },
        { key: 'database', value: entry.database_name },
      ].filter(e => e.value),
    }));

    return { findings, totalEntries: data.total || entries.length };
  } catch (error) {
    console.error('[test-scan] DeHashed error:', error);
    return { findings: [], error: (error as Error).message };
  }
}
