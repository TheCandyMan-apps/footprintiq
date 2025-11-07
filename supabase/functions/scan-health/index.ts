import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/secure.ts';

// Health check endpoint to verify scan configuration
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    // Check environment variables (without revealing values)
    const envStatus = {
      supabase: {
        url: !!Deno.env.get('SUPABASE_URL'),
        anonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
        serviceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      },
      providers: {
        apify: !!Deno.env.get('APIFY_API_TOKEN'),
        hibp: !!Deno.env.get('HIBP_API_KEY'),
        dehashed: !!Deno.env.get('DEHASHED_API_KEY'),
        dehashedUsername: !!Deno.env.get('DEHASHED_API_KEY_USERNAME'),
        clearbit: !!Deno.env.get('CLEARBIT_API_KEY'),
        fullcontact: !!Deno.env.get('FULLCONTACT_API_KEY'),
        censys: !!(Deno.env.get('CENSYS_API_KEY_UID') && Deno.env.get('CENSYS_API_KEY_SECRET')),
        shodan: !!Deno.env.get('SHODAN_API_KEY'),
        virustotal: !!Deno.env.get('VIRUSTOTAL_API_KEY'),
      },
      cache: {
        upstashUrl: !!Deno.env.get('UPSTASH_REDIS_REST_URL'),
        upstashToken: !!Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
      },
    };

    // Test cache connectivity
    let cacheStatus = 'unknown';
    try {
      const upstashUrl = Deno.env.get('UPSTASH_REDIS_REST_URL')?.replace(/['"]/g, '');
      const upstashToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN')?.replace(/['"]/g, '');
      
      if (upstashUrl && upstashToken) {
        const testRes = await fetch(`${upstashUrl}/ping`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
        cacheStatus = testRes.ok ? 'connected' : 'error';
      } else {
        cacheStatus = 'not_configured';
      }
    } catch (e) {
      cacheStatus = 'error';
      console.error('[scan-health] Cache test failed:', e);
    }

    // Supported providers list (only implemented ones)
    const supportedProviders = [
      'hibp', 'dehashed', 'clearbit', 'fullcontact',
      'censys', 'binaryedge', 'otx', 'shodan', 'virustotal',
      'securitytrails', 'urlscan',
      'apify-social', 'apify-osint', 'apify-darkweb'
    ];

    // Recommended defaults per scan type
    const recommendedDefaults = {
      email: ['hibp', 'dehashed', 'clearbit', 'fullcontact'],
      username: ['dehashed', 'apify-social'],
      domain: ['urlscan', 'securitytrails', 'shodan', 'virustotal'],
      phone: ['fullcontact'],
    };

    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: envStatus,
        cache: {
          status: cacheStatus,
          provider: 'upstash-redis',
        },
        providers: {
          supported: supportedProviders,
          enabled: supportedProviders.filter(p => {
            // Check if provider has necessary env vars
            if (p === 'hibp') return envStatus.providers.hibp;
            if (p === 'dehashed') return envStatus.providers.dehashed && envStatus.providers.dehashedUsername;
            if (p === 'clearbit') return envStatus.providers.clearbit;
            if (p === 'fullcontact') return envStatus.providers.fullcontact;
            if (p === 'censys') return envStatus.providers.censys;
            if (p === 'shodan') return envStatus.providers.shodan;
            if (p === 'virustotal') return envStatus.providers.virustotal;
            if (p.startsWith('apify-')) return envStatus.providers.apify;
            // Free/public providers
            return true;
          }),
        },
        defaults: recommendedDefaults,
        version: '1.0.0',
      }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[scan-health] Error:', error);
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
