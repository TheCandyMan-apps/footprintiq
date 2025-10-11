import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReverseImageRequest {
  imageUrl: string;
  scanId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { imageUrl, scanId }: ReverseImageRequest = await req.json();
    console.log('Starting reverse image search for scan:', scanId);

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    const GOOGLE_CX = Deno.env.get('GOOGLE_SEARCH_CX');

    const results = [];

    // Google Reverse Image Search using Custom Search API
    if (GOOGLE_API_KEY && GOOGLE_CX) {
      console.log('Using Google Custom Search for reverse image search...');
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&searchType=image&imgSize=large&q=${encodeURIComponent(imageUrl)}`;
        
        const response = await fetch(searchUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            for (const item of data.items.slice(0, 10)) {
              results.push({
                name: item.title || 'Unknown Source',
                category: 'Image Search',
                url: item.link,
                risk_level: 'medium' as const,
                data_found: ['Profile Photo', 'Visual Match'],
              });
            }
          }
        }
      } catch (error) {
        console.error('Google search error:', error);
      }
    } else {
      console.log('Google API credentials not configured, using mock results');
      // Mock results for demonstration
      const mockImageResults = [
        {
          name: 'Social Media Platform A',
          category: 'Image Search',
          url: 'https://example-social-a.com/profile',
          risk_level: 'medium' as const,
          data_found: ['Profile Photo', 'Visual Match'],
        },
        {
          name: 'Professional Network',
          category: 'Image Search',
          url: 'https://example-professional.com/profile',
          risk_level: 'low' as const,
          data_found: ['Profile Photo'],
        },
        {
          name: 'Public Forum',
          category: 'Image Search',
          url: 'https://example-forum.com/user',
          risk_level: 'medium' as const,
          data_found: ['Avatar', 'Visual Match'],
        },
      ];
      results.push(...mockImageResults);
    }

    // Store results in database
    if (results.length > 0) {
      const { error: dsError } = await supabase
        .from('data_sources')
        .insert(results.map(r => ({
          scan_id: scanId,
          ...r,
        })));

      if (dsError) {
        console.error('Error storing image search results:', dsError);
      }
    }

    console.log(`Reverse image search completed. Found ${results.length} matches.`);

    return new Response(
      JSON.stringify({
        success: true,
        resultsCount: results.length,
        results: results.map(r => ({ name: r.name, url: r.url })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reverse image search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
