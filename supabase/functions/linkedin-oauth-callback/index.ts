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
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID')!;
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')!;

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify state
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'linkedin')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid or expired state');
    }

    await supabase.from('oauth_states').delete().eq('state', state);

    // Exchange code for access token
    const redirectUri = `${supabaseUrl}/functions/v1/linkedin-oauth-callback`;
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully obtained access token');

    // Get user info from LinkedIn
    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const linkedinUser = await userResponse.json();
    console.log('LinkedIn user:', linkedinUser);

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
        platform: 'linkedin',
        platform_user_id: linkedinUser.sub,
        platform_username: linkedinUser.email?.split('@')[0],
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        metadata: {
          name: linkedinUser.name,
          email: linkedinUser.email,
          picture: linkedinUser.picture,
        },
      }, {
        onConflict: 'user_id,platform'
      });

    if (integrationError) {
      console.error('Failed to store integration:', integrationError);
    }

    const redirectUrl = `${appUrl}/dashboard?linkedin_auth=success`;
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('Error in linkedin-oauth-callback:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${appUrl}/dashboard?linkedin_auth=error&message=${encodeURIComponent(errorMessage)}`,
      },
    });
  }
});
