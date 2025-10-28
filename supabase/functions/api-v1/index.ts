import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-api-key, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Extract API key from header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      throw new Error('API key required');
    }

    // Validate API key and get workspace
    const keyHash = await hashApiKey(apiKey);
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('*, workspaces(*)')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (!apiKeyData) {
      throw new Error('Invalid API key');
    }

    // Check rate limits
    const { data: rateLimit } = await supabase
      .from('api_rate_limits')
      .select('*')
      .eq('workspace_id', apiKeyData.workspace_id)
      .eq('api_key_id', apiKeyData.id)
      .gte('window_start', new Date(Date.now() - 3600000).toISOString())
      .single();

    if (rateLimit && rateLimit.request_count >= rateLimit.max_requests) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment rate limit counter
    if (rateLimit) {
      await supabase
        .from('api_rate_limits')
        .update({ request_count: rateLimit.request_count + 1 })
        .eq('id', rateLimit.id);
    } else {
      await supabase.from('api_rate_limits').insert({
        workspace_id: apiKeyData.workspace_id,
        api_key_id: apiKeyData.id,
        window_start: new Date().toISOString(),
        request_count: 1,
      });
    }

    // Route the request
    const url = new URL(req.url);
    const path = url.pathname.replace('/api-v1/', '');
    const [resource, ...parts] = path.split('/');

    let responseData;
    let statusCode = 200;

    switch (resource) {
      case 'scans':
        responseData = await handleScans(req, parts, apiKeyData, supabase);
        break;
      case 'findings':
        responseData = await handleFindings(req, parts, apiKeyData, supabase);
        break;
      case 'monitors':
        responseData = await handleMonitors(req, parts, apiKeyData, supabase);
        break;
      case 'health':
        responseData = { status: 'healthy', timestamp: new Date().toISOString() };
        break;
      default:
        statusCode = 404;
        responseData = { error: 'Resource not found' };
    }

    // Log the request
    const duration = Date.now() - startTime;
    await supabase.from('api_request_logs').insert({
      workspace_id: apiKeyData.workspace_id,
      api_key_id: apiKeyData.id,
      method: req.method,
      endpoint: path,
      status_code: statusCode,
      duration_ms: duration,
      user_agent: req.headers.get('user-agent'),
    });

    return new Response(
      JSON.stringify(responseData),
      { 
        status: statusCode, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit?.max_requests?.toString() || '1000',
          'X-RateLimit-Remaining': (rateLimit ? rateLimit.max_requests - rateLimit.request_count : 1000).toString(),
        } 
      }
    );

  } catch (error) {
    console.error('[api-v1] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleScans(req: Request, parts: string[], apiKeyData: any, supabase: any) {
  const method = req.method;
  const scanId = parts[0];

  if (method === 'GET') {
    if (scanId) {
      // Get specific scan
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .eq('user_id', apiKeyData.user_id)
        .single();
      if (error) throw error;
      return data;
    } else {
      // List scans
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', apiKeyData.user_id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return { scans: data };
    }
  }

  if (method === 'POST') {
    // Create scan
    const body = await req.json();
    const { data, error } = await supabase
      .from('scans')
      .insert({
        user_id: apiKeyData.user_id,
        scan_type: body.scan_type || 'quick',
        username: body.username,
        email: body.email,
        phone: body.phone,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  throw new Error('Method not allowed');
}

async function handleFindings(req: Request, parts: string[], apiKeyData: any, supabase: any) {
  const scanId = parts[0];
  
  if (req.method === 'GET' && scanId) {
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('severity', { ascending: false });
    if (error) throw error;
    return { findings: data };
  }

  throw new Error('Method not allowed');
}

async function handleMonitors(req: Request, parts: string[], apiKeyData: any, supabase: any) {
  const monitorId = parts[0];

  if (req.method === 'GET') {
    if (monitorId) {
      const { data, error } = await supabase
        .from('monitors')
        .select('*')
        .eq('id', monitorId)
        .eq('user_id', apiKeyData.user_id)
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('monitors')
        .select('*')
        .eq('user_id', apiKeyData.user_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { monitors: data };
    }
  }

  throw new Error('Method not allowed');
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}