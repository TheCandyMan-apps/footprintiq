import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the app URL for redirects - defaults to production URL
function getAppUrl(): string {
  // Use SITE_URL if set, otherwise fallback to a sensible default
  const siteUrl = Deno.env.get('SITE_URL');
  if (siteUrl) {
    return siteUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  // Fallback - this should be set in Supabase Edge Function secrets
  return 'https://footprintiq.lovable.app';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const appUrl = getAppUrl();

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('Twitter OAuth callback received:', { 
      hasCode: !!code, 
      hasState: !!state, 
      error,
      errorDescription 
    });

    if (error) {
      console.error('OAuth error from Twitter:', error, errorDescription);
      throw new Error(`Twitter OAuth error: ${errorDescription || error}`);
    }

    if (!code || !state) {
      console.error('Missing parameters:', { code: !!code, state: !!state });
      throw new Error('Missing code or state parameter');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const clientId = Deno.env.get('TWITTER_CLIENT_ID')!;
    const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET')!;

    if (!clientId || !clientSecret) {
      console.error('Missing Twitter credentials');
      throw new Error('Server configuration error');
    }

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify state and get code_verifier
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'twitter')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateData) {
      console.error('State verification failed:', stateError);
      throw new Error('Invalid or expired state - please try signing in again');
    }

    const codeVerifier = stateData.code_verifier;
    if (!codeVerifier) {
      console.error('No code_verifier found in state data');
      throw new Error('OAuth session corrupted - please try again');
    }

    console.log('State verified, user_id:', stateData.user_id);

    // Delete used state immediately
    await supabase.from('oauth_states').delete().eq('state', state);

    // Exchange code for access token
    const redirectUri = `${supabaseUrl}/functions/v1/twitter-oauth-callback`;
    
    console.log('Exchanging code for token with redirect_uri:', redirectUri);
    
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      throw new Error('Failed to exchange code for token - please try again');
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully obtained access token');

    // Get user info from Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Failed to fetch user info:', errorText);
      throw new Error('Failed to fetch Twitter profile');
    }

    const userData = await userResponse.json();
    const twitterUser = userData.data;

    console.log('Twitter user fetched:', { 
      id: twitterUser.id, 
      username: twitterUser.username 
    });

    // Get the user_id from the oauth_states table
    if (!stateData.user_id) {
      console.error('No user_id found in oauth state');
      throw new Error('OAuth state missing user information');
    }
    
    const userId = stateData.user_id;

    // Store the integration in the database
    const { error: integrationError } = await supabase
      .from('social_integrations')
      .upsert({
        user_id: userId,
        platform: 'twitter',
        platform_user_id: twitterUser.id,
        platform_username: twitterUser.username,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        metadata: {
          name: twitterUser.name,
          profile_image_url: twitterUser.profile_image_url,
        },
      }, {
        onConflict: 'user_id,platform'
      });

    if (integrationError) {
      console.error('Failed to store integration:', integrationError);
      // Don't throw - we can still redirect successfully
    } else {
      console.log('Integration stored successfully');
    }

    // Redirect to app with success message
    const redirectUrl = `${appUrl}/dashboard?twitter_auth=success`;
    console.log('Redirecting to:', redirectUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('Error in twitter-oauth-callback:', error);
    
    // Redirect to app with error
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const redirectUrl = `${appUrl}/?twitter_auth=error&message=${encodeURIComponent(errorMessage)}`;
    console.log('Error redirect to:', redirectUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });
  }
});
