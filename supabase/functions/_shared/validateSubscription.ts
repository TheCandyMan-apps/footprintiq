import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Validate user has required subscription tier
 * @returns {user_id, tier} if authorized, throws Response if not
 */
export async function validateSubscription(
  req: Request,
  requiredTier: 'free' | 'premium' | 'family' = 'premium'
): Promise<{ userId: string; tier: string }> {
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
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  
  if (authError || !user) {
    console.error('Authentication failed:', authError);
    throw new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Check if user is admin - admins bypass all subscription checks
  const { data: roleCheck } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleCheck?.role === 'admin') {
    console.log(`Admin user ${user.id} bypassing subscription check`);
    return {
      userId: user.id,
      tier: 'admin'
    };
  }

  // Check subscription tier using database function
  const { data, error } = await supabaseClient.rpc('has_subscription_tier', {
    _user_id: user.id,
    _required_tier: requiredTier,
  });

  if (error) {
    console.error('Subscription check failed:', error);
    throw new Response(
      JSON.stringify({ error: 'Failed to verify subscription' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!data) {
    console.log(`User ${user.id} attempted to access ${requiredTier} feature without subscription`);
    throw new Response(
      JSON.stringify({ 
        error: `${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} subscription required`,
        upgrade_required: true,
        required_tier: requiredTier
      }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Get actual tier for logging
  const { data: roleData } = await supabaseClient
    .from('user_roles')
    .select('subscription_tier')
    .eq('user_id', user.id)
    .single();

  return {
    userId: user.id,
    tier: roleData?.subscription_tier || 'free'
  };
}
