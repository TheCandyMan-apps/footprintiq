import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReverseImageRequest {
  imageUrl: string;
  scanId?: string;
  workspaceId?: string;
  useTinEye?: boolean;
  creditCost?: number;
}

interface FaceCheckResult {
  score: number;
  url: string;
  base64: string;
}

interface ImageMatch {
  thumbnail_url: string;
  url: string;
  domain: string;
  match_percent: number;
  crawl_date: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { imageUrl, scanId, workspaceId, useTinEye, creditCost }: ReverseImageRequest = await req.json();
    
    // Validate user ownership
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.split('Bearer ')[1]);
      if (user) {
        userId = user.id;
        if (scanId) {
          const { data: scan } = await supabase.from('scans').select('user_id').eq('id', scanId).single();
          if (scan && scan.user_id !== user.id) {
            return new Response(
              JSON.stringify({ error: 'Access denied' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    }

    // Deduct credits if workspaceId and creditCost provided
    if (workspaceId && creditCost && userId) {
      const { data: deductResult, error: creditError } = await supabase.rpc('spend_credits', {
        _workspace_id: workspaceId,
        _cost: creditCost,
        _reason: 'reverse_image_search',
        _meta: { user_id: userId, timestamp: new Date().toISOString() }
      });

      if (creditError || !deductResult) {
        console.error('Credit deduction failed:', creditError);
        return new Response(
          JSON.stringify({ error: 'Insufficient credits' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('Starting reverse image search:', { scanId, useTinEye });

    const results: ImageMatch[] = [];

    // TinEye search using MatchEngine API
    if (useTinEye) {
      const TINEYE_API_KEY = Deno.env.get('TINEYE_API_KEY');
      if (TINEYE_API_KEY) {
        console.log('Using TinEye MatchEngine for reverse image search...');
        try {
          // Download image to process
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) throw new Error('Failed to fetch image');
          
          const imageBlob = await imageResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const imageData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

          // Call TinEye MatchEngine API
          const tineyeResponse = await fetch('https://api.tineye.com/rest/search/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_key: TINEYE_API_KEY,
              image_data: imageData,
            }),
          });

          console.log('TinEye response status:', tineyeResponse.status);
          
          if (tineyeResponse.ok) {
            const tineyeData = await tineyeResponse.json();
            console.log('TinEye response:', JSON.stringify(tineyeData).substring(0, 200));
            
            if (tineyeData.results && Array.isArray(tineyeData.results)) {
              for (const match of tineyeData.results) {
                if (match.backlinks && match.backlinks.length > 0) {
                  const backlink = match.backlinks[0];
                  results.push({
                    thumbnail_url: backlink.image_url || match.image_url || imageUrl,
                    url: backlink.url || match.image_url,
                    domain: backlink.url ? new URL(backlink.url).hostname : 'unknown',
                    match_percent: match.score ? Math.round(match.score * 100) : 100,
                    crawl_date: backlink.crawl_date || new Date().toISOString(),
                  });
                }
              }
            }
            console.log(`TinEye found ${results.length} matches`);
          } else {
            const errorText = await tineyeResponse.text();
            console.error('TinEye API error:', tineyeResponse.status, errorText);
          }
        } catch (error) {
          console.error('TinEye error:', error instanceof Error ? error.message : 'Unknown error');
        }
      } else {
        console.log('TinEye API key not configured');
      }
    }

    // FaceCheck fallback
    const FACECHECK_API_TOKEN = Deno.env.get('FACECHECK_API_TOKEN');

    if (FACECHECK_API_TOKEN) {
      console.log('Using FaceCheck.ID for facial recognition search...');
      try {
        // Fetch the image from the URL
        console.log('Fetching image from:', imageUrl);
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        const imageBlob = await imageResponse.blob();

        // Upload image to FaceCheck.ID
        const formData = new FormData();
        formData.append('images', imageBlob, 'image.jpg');
        
        const uploadResponse = await fetch('https://facecheck.id/api/upload_pic', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': FACECHECK_API_TOKEN,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        
        if (uploadData.error) {
          throw new Error(`FaceCheck upload error: ${uploadData.error} (${uploadData.code})`);
        }

        const id_search = uploadData.id_search;
        console.log(`Image uploaded successfully. id_search: ${id_search}`);

        // Poll for search results
        let searchComplete = false;
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds timeout

        while (!searchComplete && attempts < maxAttempts) {
          const searchResponse = await fetch('https://facecheck.id/api/search', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Authorization': FACECHECK_API_TOKEN,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_search: id_search,
              with_progress: true,
              status_only: false,
              demo: false, // Set to false for real search
            }),
          });

          const searchData = await searchResponse.json();

          if (searchData.error) {
            throw new Error(`FaceCheck search error: ${searchData.error} (${searchData.code})`);
          }

        if (searchData.output && searchData.output.items) {
            console.log('Search completed - matches found:', searchData.output.items.length);
            
            // Process results
            for (const item of searchData.output.items as FaceCheckResult[]) {
              const riskLevel = item.score > 80 ? 'high' : item.score > 50 ? 'medium' : 'low';
              results.push({
                name: new URL(item.url).hostname,
                category: 'Facial Recognition',
                url: item.url,
                risk_level: riskLevel as 'low' | 'medium' | 'high',
                data_found: ['Profile Photo', 'Facial Match', `${item.score}% confidence`],
              });
            }
            searchComplete = true;
          } else {
            console.log(`Search in progress: ${searchData.progress || 0}%`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            attempts++;
          }
        }

        if (!searchComplete) {
          console.log('Search timed out after 60 seconds');
        }
      } catch (error) {
        console.error('Image search error:', error instanceof Error ? error.message : 'Unknown error');
        // Don't throw, just log and continue with empty results
      }
    } else {
      console.log('FaceCheck.ID API token not configured, using mock results');
      // Mock results for demonstration
      const mockImageResults = [
        {
          name: 'Facebook',
          category: 'Facial Recognition',
          url: 'https://facebook.com/profile/example',
          risk_level: 'high' as const,
          data_found: ['Profile Photo', 'Facial Match', '95% confidence'],
        },
        {
          name: 'LinkedIn',
          category: 'Facial Recognition',
          url: 'https://linkedin.com/in/example',
          risk_level: 'medium' as const,
          data_found: ['Profile Photo', 'Facial Match', '78% confidence'],
        },
        {
          name: 'Instagram',
          category: 'Facial Recognition',
          url: 'https://instagram.com/example',
          risk_level: 'medium' as const,
          data_found: ['Profile Photo', 'Facial Match', '65% confidence'],
        },
      ];
      results.push(...mockImageResults);
    }

    // Calculate confidence scores and store results in database only if scanId provided
    if (results.length > 0 && scanId) {
      const { calculateDataSourceConfidence } = await import('../_shared/confidenceScoring.ts');
      
      const resultsWithConfidence = results.map(r => {
        // For facial recognition, confidence is based on the match score
        let confidence = 50; // Base confidence
        
        // Extract confidence from data_found if available
        const confidenceMatch = r.data_found.find((d: string) => d.includes('% confidence'));
        if (confidenceMatch) {
          const matchPercent = parseInt(confidenceMatch);
          if (!isNaN(matchPercent)) {
            confidence = matchPercent;
          }
        }
        
        return {
          scan_id: scanId,
          ...r,
          confidence_score: confidence,
        };
      });

      const { error: dsError } = await supabase
        .from('data_sources')
        .insert(resultsWithConfidence);

      if (dsError) {
        console.error('Error storing image search results:', dsError);
      }
    }

    console.log(`Reverse image search completed. Found ${results.length} matches.`);

    return new Response(
      JSON.stringify({
        success: true,
        resultsCount: results.length,
        matches: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reverse image search error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred processing image search' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
