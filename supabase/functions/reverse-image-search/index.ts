import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReverseImageRequest {
  imageUrl: string;
  workspaceId: string;
}

interface ReverseImageMatch {
  url: string;
  site: string;
  thumbnail?: string;
  crawlDate?: string;
  width?: number;
  height?: number;
  size?: number;
  score?: number;
  matchPercent?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrl, workspaceId }: ReverseImageRequest = await req.json();

    if (!imageUrl || !workspaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageUrl, workspaceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to workspace
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'Access denied to workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check credits (10 credits required)
    const CREDIT_COST = 10;
    const { data: balanceData, error: balanceError } = await supabase.rpc(
      'get_credits_balance',
      { _workspace_id: workspaceId }
    );

    if (balanceError) {
      console.error('[ReverseImageSearch] Error checking balance:', balanceError);
      return new Response(
        JSON.stringify({ error: 'Failed to check credit balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const balance = balanceData || 0;
    if (balance < CREDIT_COST) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits',
          required: CREDIT_COST,
          current: balance
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if TinEye API key is configured
    const tineyeApiKey = Deno.env.get('TINEYE_API_KEY');
    
    let matches: ReverseImageMatch[] = [];
    
    if (!tineyeApiKey) {
      // Provider not configured - return sample data for testing
      console.log('[ReverseImageSearch] TinEye API key not configured, returning sample data');
      matches = [
        {
          url: 'https://example.com/image1.jpg',
          site: 'example.com',
          thumbnail: imageUrl,
          crawlDate: new Date().toISOString(),
          width: 800,
          height: 600,
        },
        {
          url: 'https://sample.org/photo.jpg',
          site: 'sample.org',
          thumbnail: imageUrl,
          crawlDate: new Date().toISOString(),
          width: 1024,
          height: 768,
        },
      ];
    } else {
      // Call TinEye API
      console.log('[ReverseImageSearch] Calling TinEye API');
      console.log('[ReverseImageSearch] Image URL:', imageUrl);
      console.log('[ReverseImageSearch] API Key configured:', !!tineyeApiKey);
      
      try {
        const tineyeUrl = new URL('https://api.tineye.com/rest/search/');
        tineyeUrl.searchParams.set('image_url', imageUrl);
        tineyeUrl.searchParams.set('limit', '20'); // Return up to 20 matches
        tineyeUrl.searchParams.set('sort', 'score'); // Sort by match score
        tineyeUrl.searchParams.set('order', 'desc'); // Best matches first

        console.log('[ReverseImageSearch] TinEye Request URL:', tineyeUrl.toString().replace(tineyeApiKey, 'REDACTED'));

        const tineyeResponse = await fetch(tineyeUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-API-KEY': tineyeApiKey,
          },
        });

        console.log('[ReverseImageSearch] TinEye Response Status:', tineyeResponse.status);
        console.log('[ReverseImageSearch] TinEye Response Headers:', JSON.stringify([...tineyeResponse.headers.entries()]));

        if (!tineyeResponse.ok) {
          const errorText = await tineyeResponse.text();
          console.error('[ReverseImageSearch] TinEye API error:', tineyeResponse.status, errorText);
          
          if (tineyeResponse.status === 429) {
            throw new Error('TinEye rate limit exceeded. Please try again in a moment.');
          } else if (tineyeResponse.status === 401 || tineyeResponse.status === 403) {
            throw new Error('TinEye API authentication failed. Please check your API key.');
          } else {
            throw new Error(`TinEye API error: ${tineyeResponse.status}`);
          }
        }

        const tineyeData = await tineyeResponse.json();
        
        console.log('[ReverseImageSearch] TinEye Full Response:', JSON.stringify(tineyeData).substring(0, 500));
        console.log(`[ReverseImageSearch] TinEye returned ${tineyeData.results?.matches?.length || 0} matches`);
        
        if (tineyeData.results?.matches?.length === 0) {
          console.log('[ReverseImageSearch] Zero matches - possible reasons:');
          console.log('  - Image may not exist in TinEye database');
          console.log('  - Image may be too new or rare');
          console.log('  - TinEye may have trouble accessing signed URL');
          console.log('  - Try testing with a well-known image URL');
        }

        // Transform TinEye response to our format
        if (tineyeData.results?.matches && Array.isArray(tineyeData.results.matches)) {
          matches = tineyeData.results.matches.map((match: any) => {
            // Get the first backlink for the source URL
            const backlink = match.backlinks && match.backlinks.length > 0 
              ? match.backlinks[0] 
              : null;

            return {
              url: backlink?.backlink || match.image_url,
              site: match.domain || 'unknown',
              thumbnail: match.image_url,
              crawlDate: backlink?.crawl_date || new Date().toISOString(),
              width: match.width,
              height: match.height,
              size: match.size,
              score: match.score,
              matchPercent: match.query_match_percent,
            };
          });
        }
      } catch (error) {
        console.error('[ReverseImageSearch] TinEye API call failed:', error);
        // Re-throw specific errors, wrap generic ones
        if (error.message.includes('TinEye')) {
          throw error;
        }
        throw new Error(`Failed to search TinEye: ${error.message}`);
      }
    }

    // Deduct credits after successful search
    const { error: spendError } = await supabase.rpc('spend_credits', {
      _workspace_id: workspaceId,
      _cost: CREDIT_COST,
      _reason: 'reverse_image_search',
      _meta: {
        imageUrl,
        matchCount: matches.length,
        timestamp: new Date().toISOString(),
      },
    });

    if (spendError) {
      console.error('[ReverseImageSearch] Error deducting credits:', spendError);
      // Continue anyway - we already did the search
    }

    console.log(`[ReverseImageSearch] Search completed: ${matches.length} matches found, ${CREDIT_COST} credits deducted`);

    return new Response(
      JSON.stringify({
        success: true,
        matches,
        creditsDeducted: CREDIT_COST,
        providerConfigured: !!tineyeApiKey,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[ReverseImageSearch] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
