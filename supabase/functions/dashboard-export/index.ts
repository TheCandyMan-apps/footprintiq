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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check user role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roles || roles.role === 'viewer') {
      throw new Error('Export permission denied');
    }

    const { filters = {}, format = 'csv' } = await req.json();

    console.log('Exporting data', { format, filters });

    // Fetch data
    let query = supabase
      .from('scan_results')
      .select('*')
      .eq('user_id', filters.workspace || user.id)
      .order('created_at', { ascending: false });

    if (filters.from) query = query.gte('created_at', filters.from);
    if (filters.to) query = query.lte('created_at', filters.to);
    if (filters.severity) query = query.in('risk_level', filters.severity);
    if (filters.provider) query = query.in('provider', filters.provider);

    const { data: results, error: resultsError } = await query;

    if (resultsError) throw resultsError;

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'export',
      resource_type: 'dashboard_alerts',
      metadata: { format, count: results?.length || 0, filters },
    });

    if (format === 'csv') {
      const headers = ['Time', 'Entity', 'Provider', 'Severity', 'Category', 'Description'];
      const rows = results?.map(r => [
        r.created_at,
        r.data?.username || r.data?.email || r.data?.name || 'Unknown',
        r.provider,
        r.risk_level,
        r.category || 'General',
        r.description || '',
      ]) || [];

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString()}.csv"`,
        },
      });
    }

    throw new Error('Unsupported format');
  } catch (error) {
    console.error('Export error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
