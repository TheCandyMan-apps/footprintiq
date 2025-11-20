import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication - require user login
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    
    const userId = authResult.context.userId;

    // Rate limiting - 20 requests/hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'global-analytics', {
      maxRequests: 20,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    console.log(`[global-analytics] User ${userId} fetching analytics`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get scans from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('id, privacy_score, total_sources_found')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (scansError) throw scansError;

    // Get all data sources from these scans
    const scanIds = scans?.map(s => s.id) || [];
    const { data: sources, error: sourcesError } = await supabase
      .from('data_sources')
      .select('category, risk_level')
      .in('scan_id', scanIds);

    if (sourcesError) throw sourcesError;

    // Calculate metrics
    const totalScans = scans?.length || 0;
    const totalExposures = sources?.length || 0;
    
    const validScores = scans?.filter(s => s.privacy_score) || [];
    const averageRiskScore = validScores.length > 0
      ? Math.round(validScores.reduce((acc, s) => acc + (s.privacy_score || 0), 0) / validScores.length)
      : 0;

    // Top categories
    const categoryCount = new Map<string, number>();
    sources?.forEach(source => {
      const current = categoryCount.get(source.category) || 0;
      categoryCount.set(source.category, current + 1);
    });

    const topCategories = Array.from(categoryCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Mock region data (in production, this would come from actual geographic data)
    const regionData = [
      { country: "United States", exposures: Math.floor(totalExposures * 0.4), scans: Math.floor(totalScans * 0.4) },
      { country: "United Kingdom", exposures: Math.floor(totalExposures * 0.15), scans: Math.floor(totalScans * 0.15) },
      { country: "Germany", exposures: Math.floor(totalExposures * 0.12), scans: Math.floor(totalScans * 0.12) },
      { country: "France", exposures: Math.floor(totalExposures * 0.1), scans: Math.floor(totalScans * 0.1) },
      { country: "Canada", exposures: Math.floor(totalExposures * 0.08), scans: Math.floor(totalScans * 0.08) }
    ];

    const metrics = {
      totalScans,
      totalExposures,
      averageRiskScore,
      topCategories,
      regionData,
      industryData: [] // Can be expanded with actual industry tracking
    };

    return new Response(
      JSON.stringify(metrics),
      { status: 200, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );

  } catch (error) {
    console.error('[global-analytics] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
