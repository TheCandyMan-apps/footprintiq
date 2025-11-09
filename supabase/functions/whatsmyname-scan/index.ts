import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { retryWithBackoff } from '../_shared/retryWithBackoff.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSMYNAME_WORKER_URL = Deno.env.get('WHATSMYNAME_WORKER_URL') || 'http://whatsmyname-worker:8080';
const CREDIT_COST = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check subscription tier (premium required)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('subscription_tier, role')
      .eq('user_id', user.id)
      .single();

    const isPremium = userRole?.subscription_tier === 'premium' || 
                      userRole?.subscription_tier === 'enterprise' ||
                      userRole?.role === 'admin';

    if (!isPremium) {
      return new Response(JSON.stringify({ 
        error: 'Premium subscription required',
        upgrade_required: true,
        teaser: 'Upgrade to Premium for 500+ site username checks!'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { username, filters, workspaceId } = await req.json();

    if (!username || !workspaceId) {
      throw new Error('Username and workspaceId required');
    }

    console.log('[whatsmyname-scan] Scanning username:', username);

    // Check and deduct credits
    const { data: balance } = await supabase.rpc('get_credits_balance', {
      _workspace_id: workspaceId
    });

    if (!balance || balance < CREDIT_COST) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient credits',
        required: CREDIT_COST,
        current: balance || 0
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits
    const { error: creditError } = await supabase.rpc('spend_credits', {
      _workspace_id: workspaceId,
      _cost: CREDIT_COST,
      _reason: `WhatsMyName scan: ${username}`,
      _meta: { username, filters }
    });

    if (creditError) {
      throw new Error(`Credit deduction failed: ${creditError.message}`);
    }

    console.log(`[WhatsMyName] Calling worker at ${WHATSMYNAME_WORKER_URL} for username: ${username}`);
    
    // Call WhatsMyName worker with retry logic
    const workerResponse = await retryWithBackoff(
      async () => {
        const response = await fetch(`${WHATSMYNAME_WORKER_URL}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            filters: filters || ''
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Worker returned ${response.status}: ${errorText}`);
        }
        
        return response;
      },
      {
        maxAttempts: 3,
        delays: [2000, 4000, 6000],
        onRetry: (attempt, error) => {
          console.log(`[WhatsMyName] Retry ${attempt}/3 for ${username} - ${error.message}`);
        }
      },
      { providerId: 'whatsmyname' }
    );

    const workerData = await workerResponse.json();

    console.log('[whatsmyname-scan] Scan complete, found results:', 
      workerData.results?.sites?.length || 0);

    return new Response(JSON.stringify({
      success: true,
      username,
      results: workerData.results,
      credits_used: CREDIT_COST,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[whatsmyname-scan] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
