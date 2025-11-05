import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    // Check environment variables
    const envCheck = {
      core: {
        supabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        supabaseAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
        supabaseServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      },
      providers: {
        hibp: !!Deno.env.get('HIBP_API_KEY'),
        dehashed: !!Deno.env.get('DEHASHED_API_KEY') && !!Deno.env.get('DEHASHED_API_KEY_USERNAME'),
        clearbit: !!Deno.env.get('CLEARBIT_API_KEY'),
        fullcontact: !!Deno.env.get('FULLCONTACT_API_KEY'),
        censys: !!Deno.env.get('CENSYS_API_KEY_UID') && !!Deno.env.get('CENSYS_API_KEY_SECRET'),
        shodan: !!Deno.env.get('SHODAN_API_KEY'),
        virustotal: !!Deno.env.get('VIRUSTOTAL_API_KEY'),
        apify: !!Deno.env.get('APIFY_API_TOKEN'),
      },
      cache: {
        upstashUrl: !!Deno.env.get('UPSTASH_REDIS_REST_URL'),
        upstashToken: !!Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
      },
    };

    // Test Upstash connection
    let cacheHealthy = false;
    const upstashUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const upstashToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');
    
    if (upstashUrl && upstashToken) {
      try {
        const response = await fetch(`${upstashUrl}/ping`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
        cacheHealthy = response.ok;
      } catch {
        cacheHealthy = false;
      }
    }

    // Define supported providers (only ones implemented in provider-proxy)
    const SUPPORTED_PROVIDERS = [
      'hibp', 'dehashed', 'clearbit', 'fullcontact',
      'censys', 'binaryedge', 'otx', 'shodan', 'virustotal',
      'securitytrails', 'urlscan',
      'apify-social', 'apify-osint', 'apify-darkweb'
    ];

    // Define defaults per scan type
    const DEFAULT_PROVIDERS = {
      email: ['hibp', 'dehashed', 'clearbit', 'fullcontact'],
      username: ['dehashed', 'apify-social'],
      domain: ['urlscan', 'securitytrails', 'shodan', 'virustotal'],
      phone: ['fullcontact'],
    };

    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      cache: {
        configured: envCheck.cache.upstashUrl && envCheck.cache.upstashToken,
        healthy: cacheHealthy,
      },
      providers: {
        supported: SUPPORTED_PROVIDERS,
        defaults: DEFAULT_PROVIDERS,
        enabled: Object.entries(envCheck.providers)
          .filter(([_, enabled]) => enabled)
          .map(([name]) => name),
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[scan-health] Error:', error);
    return new Response(JSON.stringify({ 
      status: 'error', 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});
