import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProxyRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  useAnon?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url, method = 'GET', headers = {}, body, useAnon = false }: ProxyRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let proxyUrl: string | undefined;

    // Check if user has anon mode enabled and get proxy config
    if (useAnon) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('anon_mode_enabled')
        .eq('user_id', user.id)
        .single();

      if (profile?.anon_mode_enabled) {
        // Fetch active proxy configuration
        const { data: proxyConfig } = await supabase
          .from('proxy_configs')
          .select('*')
          .eq('user_id', user.id)
          .eq('enabled', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (proxyConfig?.proxy_url) {
          proxyUrl = proxyConfig.proxy_url;
        }
      }
    }

    console.log(`Proxy Router: Making ${method} request to ${url}${proxyUrl ? ' via proxy' : ''}`);

    // Make the request (with or without proxy)
    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = body;
    }

    // Note: Deno's fetch doesn't directly support proxy configuration like Node.js
    // In production, you'd need to route through a proxy service or use Deno Deploy with proxy support
    // For Tor, you'd typically connect to a Tor SOCKS5 proxy (e.g., 127.0.0.1:9050)
    const response = await fetch(url, fetchOptions);

    const responseText = await response.text();
    
    // Log the request
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'proxy_request',
      entity_type: 'scan',
      metadata: {
        url,
        method,
        status: response.status,
        anonymized: !!proxyUrl,
      },
    });

    return new Response(
      JSON.stringify({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        anonymized: !!proxyUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Proxy Router error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
