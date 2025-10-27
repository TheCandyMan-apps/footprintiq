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

    // Create or sign in user with Supabase
    // Use Twitter ID as email substitute
    const email = `${twitterUser.id}@twitter.oauth`;
    const password = crypto.randomUUID(); // Random password for OAuth users

    // Try to sign up (will fail if user exists)
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        provider: 'twitter',
        twitter_id: twitterUser.id,
        twitter_username: twitterUser.username,
        avatar_url: twitterUser.profile_image_url,
        full_name: twitterUser.name,
      },
    });

    let userId = signUpData?.user?.id;

    // If user exists, get their ID
    if (signUpError && signUpError.message.includes('already registered')) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);
      userId = existingUser?.id;
    }

    if (!userId) {
      throw new Error('Failed to create or find user');
    }

    // Generate a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (sessionError) {
      throw new Error('Failed to generate session');
    }

    // Redirect to app with session
    const appUrl = url.origin;
    const redirectUrl = `${appUrl}/?twitter_auth=success#access_token=${sessionData.properties.hashed_token}`;
    
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
