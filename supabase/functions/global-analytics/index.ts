import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

/**
 * Check if IP has exceeded rate limit using in-memory tracking
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  // Increment count
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: Extract IP address
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    const rateLimitOk = checkRateLimit(ip);
    if (!rateLimitOk) {
      console.warn(`Rate limit exceeded for IP: ${ip.substring(0, 8)}...`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": "60",
            ...corsHeaders 
          },
        }
      );
    }
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
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in global-analytics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
