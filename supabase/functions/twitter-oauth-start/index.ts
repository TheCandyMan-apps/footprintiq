import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('TWITTER_CLIENT_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!clientId || !supabaseUrl) {
      throw new Error('Missing required environment variables');
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state temporarily in Supabase (you'll need to create a table for this)
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase
      .from('oauth_states')
      .insert({
        state,
        provider: 'twitter',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    // Build Twitter OAuth URL
    const redirectUri = `${supabaseUrl}/functions/v1/twitter-oauth-callback`;
    const scope = 'tweet.read users.read offline.access';
    
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', 'challenge');
    authUrl.searchParams.set('code_challenge_method', 'plain');

    console.log('Generated Twitter OAuth URL:', authUrl.toString());

    return new Response(
      JSON.stringify({ url: authUrl.toString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in twitter-oauth-start:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to start OAuth flow';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
