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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const clientId = Deno.env.get('TWITTER_CLIENT_ID')!;
    const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET')!;

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify state
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'twitter')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid or expired state');
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('state', state);

    // Exchange code for access token
    const redirectUri = `${supabaseUrl}/functions/v1/twitter-oauth-callback`;
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
        code_verifier: 'challenge',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully obtained access token');

    // Get user info from Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();
    const twitterUser = userData.data;

    console.log('Twitter user:', twitterUser);

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
    }

    // Redirect to app with success message
    const appUrl = url.origin;
    const redirectUrl = `${appUrl}/dashboard?twitter_auth=success`;
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('Error in twitter-oauth-callback:', error);
    
    // Redirect to app with error
    const url = new URL(req.url);
    const appUrl = url.origin;
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${appUrl}/?twitter_auth=error&message=${encodeURIComponent(errorMessage)}`,
      },
    });
  }
});
