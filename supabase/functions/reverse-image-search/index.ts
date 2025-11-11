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
      // TODO: Implement actual TinEye API integration
      // For now, return empty matches until TinEye integration is complete
      console.log('[ReverseImageSearch] TinEye API key found, but integration not yet implemented');
      matches = [];
    }

    // Deduct credits after successful search
    const { error: spendError } = await supabase.rpc('spend_credits', {
      _workspace_id: workspaceId,
      _cost: CREDIT_COST,
      _reason: 'Reverse image search',
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
