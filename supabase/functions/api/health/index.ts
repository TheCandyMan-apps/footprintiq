import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok } from '../../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simple health check - query workspaces table
    const { error } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1);

    const healthy = !error;

    return ok({
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: healthy ? 'up' : 'down',
    }, healthy ? 200 : 503);
  } catch (error) {
    console.error('Health check error:', error);
    return ok({
      status: 'down',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 503);
  }
});
