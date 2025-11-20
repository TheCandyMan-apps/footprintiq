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

const AlertFiltersSchema = z.object({
  filters: z.object({
    workspace: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    severity: z.array(z.string()).optional(),
    provider: z.array(z.string()).optional(),
    entity: z.string().max(100).optional(),
  }).optional(),
  page: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const SEVERITY_MAP: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  'low': 'low',
  'medium': 'medium',
  'high': 'high',
  'critical': 'critical',
};

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

    const { userId } = authResult.context;

    // Rate limiting - 60 requests per minute
    const rateLimitResult = await checkRateLimit(userId, 'user', 'dashboard-alerts', {
      maxRequests: 60,
      windowSeconds: 60
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimitResult.resetAt }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = AlertFiltersSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { filters = {}, page = 0, limit = 50 } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching alerts', { filters, page, limit });

    let query = supabase
      .from('scan_results')
      .select('*', { count: 'exact' })
      .eq('user_id', filters.workspace || userId)
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
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
