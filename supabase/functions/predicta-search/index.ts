import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, queryType } = await req.json();
    
    if (!query || !queryType) {
      throw new Error('Missing required parameters: query and queryType');
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
      throw new Error(`Predicta Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Log remaining credits from response header
    const creditBalance = response.headers.get('x-credit-balance');
    if (creditBalance) {
      console.log(`Predicta Search credits remaining: ${creditBalance}`);
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
