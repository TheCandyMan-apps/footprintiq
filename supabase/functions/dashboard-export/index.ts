import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ExportRequestSchema = z.object({
  filters: z.object({
    workspace: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    severity: z.array(z.string()).optional(),
    provider: z.array(z.string()).optional(),
  }).optional(),
  format: z.enum(['csv']).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(JSON.stringify({ error: authResult.error || 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { userId, role = 'free' } = authResult.context;

    // Role check - must be analyst or admin
    if (role === 'viewer') {
      return new Response(JSON.stringify({ error: 'Export permission denied' }), {
        status: 403,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    // Rate limiting - 10 exports per hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'dashboard-export', {
      maxRequests: 10,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimitResult.resetAt }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = ExportRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { filters = {}, format = 'csv' } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Exporting data', { format, filters });

    // Fetch data
    let query = supabase
      .from('scan_results')
      .select('*')
      .eq('user_id', filters.workspace || userId)
      .order('created_at', { ascending: false });

    if (filters.from) query = query.gte('created_at', filters.from);
    if (filters.to) query = query.lte('created_at', filters.to);
    if (filters.severity) query = query.in('risk_level', filters.severity);
    if (filters.provider) query = query.in('provider', filters.provider);

    const { data: results, error: resultsError } = await query;

    if (resultsError) throw resultsError;

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: userId,
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
        headers: addSecurityHeaders({
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString()}.csv"`,
        }),
      });
    }

    throw new Error('Unsupported format');
  } catch (error) {
    console.error('Export error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
