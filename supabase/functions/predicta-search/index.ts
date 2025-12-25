import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_IP = 10; // 10 searches per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_IP) return false;
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    console.warn(`[predicta-search] Rate limit exceeded for IP: ${ip.substring(0, 8)}...`);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Too many requests. Please try again later.',
        provider: 'predictasearch',
      }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
    );
  }

  try {
    const { query, queryType } = await req.json();
    
    if (!query || !queryType) {
      throw new Error('Missing required parameters: query and queryType');
    }

    // Input validation
    if (typeof query !== 'string' || query.length < 1 || query.length > 500) {
      throw new Error('Query must be a string between 1 and 500 characters');
    }
    if (!['username', 'email', 'phone', 'name'].includes(queryType)) {
      throw new Error('Invalid queryType. Must be: username, email, phone, or name');
    }

    const apiKey = Deno.env.get('PREDICTA_SEARCH_API_KEY');
    if (!apiKey) {
      throw new Error('PREDICTA_SEARCH_API_KEY not configured');
    }

    console.log(`Predicta Search request: ${queryType} - ${query}`);

    const response = await fetch('https://dev.predictasearch.com/api/search', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        query_type: queryType,
        networks: ['all']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Predicta Search API error: ${response.status} - ${errorText}`);
      
      // Handle quota exhausted (402) gracefully - return soft failure instead of throwing
      if (response.status === 402) {
        console.warn('[predicta-search] API quota exhausted - returning soft failure');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'quota_exhausted',
            provider: 'predictasearch',
            retry: false,
            message: 'Predicta Search API quota exhausted. Please try again later.',
          }),
          {
            status: 200, // Return 200 so the caller doesn't throw
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Handle rate limiting (429) gracefully
      if (response.status === 429) {
        console.warn('[predicta-search] API rate limited - returning soft failure');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'rate_limited',
            provider: 'predictasearch',
            retry: true,
            message: 'Predicta Search API rate limited. Please try again in a few minutes.',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // For other errors, throw to be caught by the catch block
      throw new Error(`Predicta Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Log remaining credits from response header and warn if low
    const creditBalance = response.headers.get('x-credit-balance');
    if (creditBalance) {
      const credits = parseInt(creditBalance, 10);
      console.log(`Predicta Search credits remaining: ${credits}`);
      
      // Warn if credits are running low
      if (credits < 100) {
        console.warn(`[predicta-search] LOW CREDITS WARNING: Only ${credits} credits remaining!`);
      } else if (credits < 500) {
        console.warn(`[predicta-search] Credits running low: ${credits} remaining`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        provider: 'predictasearch',
        cached: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in predicta-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        provider: 'predictasearch',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
