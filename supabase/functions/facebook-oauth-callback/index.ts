import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the app URL for redirects
function getAppUrl(): string {
  const appUrl = Deno.env.get('APP_URL');
  if (appUrl) {
    return appUrl.replace(/\/$/, '');
  }
  return 'https://footprintiq.app';
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

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const clientId = Deno.env.get('FACEBOOK_APP_ID')!;
    const clientSecret = Deno.env.get('FACEBOOK_APP_SECRET')!;

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify state
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'facebook')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid or expired state');
    }

    await supabase.from('oauth_states').delete().eq('state', state);

    // Exchange code for access token
    const redirectUri = `${supabaseUrl}/functions/v1/facebook-oauth-callback`;
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully obtained access token');

    // Get user info from Facebook
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${tokens.access_token}`
    );

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const facebookUser = await userResponse.json();
    console.log('Facebook user:', facebookUser);

    // Get the user_id from the oauth_states table
    if (!stateData.user_id) {
      console.error('No user_id found in oauth state');
      throw new Error('OAuth state missing user information');
    }
    
    const userId = stateData.user_id;

    // Store the integration
    const { error: integrationError } = await supabase
      .from('social_integrations')
      .upsert({
        user_id: userId,
        platform: 'facebook',
        platform_user_id: facebookUser.id,
        platform_username: facebookUser.name,
        access_token: tokens.access_token,
        refresh_token: null,
        token_expires_at: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        metadata: {
          name: facebookUser.name,
          email: facebookUser.email,
          picture: facebookUser.picture?.data?.url,
        },
      }, {
        onConflict: 'user_id,platform'
      });

    if (integrationError) {
      console.error('Failed to store integration:', integrationError);
    }

    const redirectUrl = `${appUrl}/dashboard?facebook_auth=success`;
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('Error in facebook-oauth-callback:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${appUrl}/dashboard?facebook_auth=error&message=${encodeURIComponent(errorMessage)}`,
      },
    });
  }
});
