import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the app URL for redirects - defaults to production URL
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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!clientId || !clientSecret) {
      console.error('Missing Twitter credentials');
      throw new Error('Server configuration error');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify state and get code_verifier and flow_type
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
    const flowType = stateData.flow_type || 'sign_in';
    const existingUserId = stateData.user_id;

    if (!codeVerifier) {
      console.error('No code_verifier found in state data');
      throw new Error('OAuth session corrupted - please try again');
    }

    console.log('State verified:', { flowType, hasExistingUser: !!existingUserId });

    // Delete used state immediately
    await supabase.from('oauth_states').delete().eq('state', state);

    // Exchange code for access token
    const redirectUri = `${supabaseUrl}/functions/v1/twitter-oauth-callback`;
    
    console.log('Exchanging code for token...');
    
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

    let userId: string;
    let isNewUser = false;

    if (flowType === 'link' && existingUserId) {
      // Account linking flow - user was already authenticated
      userId = existingUserId;
      console.log('Linking Twitter to existing user:', userId);
    } else {
      // Sign-in flow - find or create user
      console.log('Sign-in flow: checking for existing user with Twitter ID:', twitterUser.id);
      
      // First, check if this Twitter account is already linked to a user
      const { data: existingIntegration } = await supabase
        .from('social_integrations')
        .select('user_id')
        .eq('platform', 'twitter')
        .eq('platform_user_id', twitterUser.id)
        .single();

      if (existingIntegration) {
        // User exists with this Twitter account
        userId = existingIntegration.user_id;
        console.log('Found existing user with Twitter integration:', userId);
      } else {
        // Create a new user account
        // Generate a unique email since Twitter doesn't provide email via API
        const twitterEmail = `${twitterUser.username}@twitter.footprintiq.local`;
        
        console.log('Creating new user for Twitter account:', twitterUser.username);
        
        // Check if user with this generated email exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUserByEmail = existingUsers?.users?.find(u => u.email === twitterEmail);
        
        if (existingUserByEmail) {
          userId = existingUserByEmail.id;
          console.log('Found existing user by email:', userId);
        } else {
          // Create new user with admin API
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: twitterEmail,
            email_confirm: true,
            user_metadata: {
              full_name: twitterUser.name,
              avatar_url: twitterUser.profile_image_url,
              twitter_username: twitterUser.username,
              provider: 'twitter',
            },
          });

          if (createError || !newUser.user) {
            console.error('Failed to create user:', createError);
            throw new Error('Failed to create user account');
          }

          userId = newUser.user.id;
          isNewUser = true;
          console.log('Created new user:', userId);
        }
      }
    }

    // Store/update the integration in the database
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
    } else {
      console.log('Integration stored successfully');
    }

    // For sign-in flow, create a session
    let redirectUrl: string;
    
    if (flowType === 'sign_in' || !existingUserId) {
      // Generate a magic link for the user to sign in
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${twitterUser.username}@twitter.footprintiq.local`,
        options: {
          redirectTo: `${appUrl}/dashboard`,
        },
      });

      if (signInError || !signInData?.properties?.hashed_token) {
        console.error('Failed to generate sign-in link:', signInError);
        // Fall back to redirect with success message (user will need to sign in manually)
        redirectUrl = `${appUrl}/auth?twitter_auth=success&message=${encodeURIComponent('Twitter account connected! Please sign in to continue.')}`;
      } else {
        // Redirect through Supabase auth to establish session
        const token = signInData.properties.hashed_token;
        redirectUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(`${appUrl}/dashboard?twitter_auth=success`)}`;
      }
    } else {
      // Account linking flow - redirect back with success
      redirectUrl = `${appUrl}/dashboard?twitter_auth=success&linked=true`;
    }

    console.log('Redirecting to:', redirectUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('Error in twitter-oauth-callback:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const redirectUrl = `${appUrl}/auth?twitter_auth=error&message=${encodeURIComponent(errorMessage)}`;
    console.log('Error redirect to:', redirectUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });
  }
});
