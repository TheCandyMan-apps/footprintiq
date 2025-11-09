import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCodeRequest {
  action: 'create_code';
}

interface ApplyCodeRequest {
  action: 'apply_code';
  code: string;
}

interface GetStatsRequest {
  action: 'get_stats';
}

type RequestBody = CreateCodeRequest | ApplyCodeRequest | GetStatsRequest;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { action } = body;

    // Handle create referral code
    if (action === 'create_code') {
      // Check if user already has an active code
      const { data: existingCode } = await supabaseClient
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (existingCode) {
        return new Response(
          JSON.stringify({ code: existingCode }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate new code using database function
      const { data: codeText, error: generateError } = await supabaseClient
        .rpc('generate_referral_code', { _user_id: user.id });

      if (generateError) {
        throw generateError;
      }

      // Create code record
      const { data: newCode, error: insertError } = await supabaseClient
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: codeText,
          uses: 0,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log(`Created referral code ${codeText} for user ${user.id}`);

      return new Response(
        JSON.stringify({ code: newCode }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle apply referral code
    if (action === 'apply_code') {
      const { code } = body as ApplyCodeRequest;

      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate code exists and is active
      const { data: referralCode, error: codeError } = await supabaseClient
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (codeError || !referralCode) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired referral code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if code has reached max uses
      if (referralCode.max_uses && referralCode.uses >= referralCode.max_uses) {
        return new Response(
          JSON.stringify({ error: 'Referral code has reached maximum uses' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if code is expired
      if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Referral code has expired' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user can't refer themselves
      if (referralCode.user_id === user.id) {
        return new Response(
          JSON.stringify({ error: 'You cannot use your own referral code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user was already referred
      const { data: existingReferral } = await supabaseClient
        .from('referrals')
        .select('*')
        .eq('referee_id', user.id)
        .single();

      if (existingReferral) {
        return new Response(
          JSON.stringify({ error: 'You have already been referred by someone' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create referral record
      const { data: referral, error: referralError } = await supabaseClient
        .from('referrals')
        .insert({
          referrer_id: referralCode.user_id,
          referee_id: user.id,
          referral_code: code.toUpperCase(),
          status: 'pending',
        })
        .select()
        .single();

      if (referralError) {
        throw referralError;
      }

      // Increment code uses
      await supabaseClient
        .from('referral_codes')
        .update({ uses: referralCode.uses + 1 })
        .eq('id', referralCode.id);

      // Update referrer stats
      await supabaseClient.rpc('update_referral_stats', {
        _user_id: referralCode.user_id,
      });

      console.log(`User ${user.id} applied referral code ${code} from ${referralCode.user_id}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Referral code applied! Complete your first scan to earn bonus credits.',
          referral 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle get stats
    if (action === 'get_stats') {
      // Get referral code
      const { data: code } = await supabaseClient
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      // Get stats
      const { data: stats } = await supabaseClient
        .from('referral_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get recent referrals
      const { data: recentReferrals } = await supabaseClient
        .from('referrals')
        .select(`
          *,
          referee:referee_id (
            email
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({
          code: code || null,
          stats: stats || {
            total_referrals: 0,
            successful_referrals: 0,
            pending_referrals: 0,
            total_credits_earned: 0,
          },
          recent_referrals: recentReferrals || [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in referral-manage function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
