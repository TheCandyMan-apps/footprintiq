import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const from = url.searchParams.get('from') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = url.searchParams.get('to') || new Date().toISOString();
    const workspace = url.searchParams.get('workspace') || user.id;

    console.log('Fetching source breakdown', { from, to, workspace });

    const { data: results, error: resultsError } = await supabase
      .from('scan_results')
      .select('provider')
      .eq('user_id', workspace)
      .gte('created_at', from)
      .lte('created_at', to);

    if (resultsError) throw resultsError;

    // Count by provider
    const providerCounts = new Map<string, number>();
    results?.forEach((result) => {
      const count = providerCounts.get(result.provider) || 0;
      providerCounts.set(result.provider, count + 1);
    });

    const sources = Array.from(providerCounts.entries())
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count);

    console.log(`Source breakdown: ${sources.length} providers`);

    return new Response(JSON.stringify(sources), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error computing sources:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
