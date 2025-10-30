import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SEVERITY_MAP: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  'low': 'low',
  'medium': 'medium',
  'high': 'high',
  'critical': 'critical',
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

    const { filters = {}, page = 0, limit = 50 } = await req.json();

    console.log('Fetching alerts', { filters, page, limit });

    let query = supabase
      .from('scan_results')
      .select('*', { count: 'exact' })
      .eq('user_id', filters.workspace || user.id)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    // Apply filters
    if (filters.from) {
      query = query.gte('created_at', filters.from);
    }
    if (filters.to) {
      query = query.lte('created_at', filters.to);
    }
    if (filters.severity && filters.severity.length > 0) {
      query = query.in('severity', filters.severity);
    }
    if (filters.provider && filters.provider.length > 0) {
      query = query.in('provider', filters.provider);
    }
    if (filters.entity) {
      query = query.ilike('entity', `%${filters.entity}%`);
    }

    const { data: results, error: resultsError, count } = await query;

    if (resultsError) throw resultsError;

    // Transform to AlertRow format
    const rows = results?.map((result) => ({
      id: result.id,
      time: result.created_at,
      entity: result.data?.username || result.data?.email || result.data?.name || 'Unknown',
      provider: result.provider,
      severity: SEVERITY_MAP[result.risk_level] || 'low',
      confidence: Math.round(Math.random() * 40 + 60), // Mock confidence
      category: result.category || 'General',
      description: result.description || 'No description available',
      evidence: result.data ? [result.data] : [],
    })) || [];

    const response = {
      rows,
      total: count || 0,
    };

    console.log(`Alerts fetched: ${rows.length} of ${count}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
