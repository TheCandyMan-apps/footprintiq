import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a random code verifier (43-128 characters)
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, 64);
}

// Create S256 code challenge from verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('TWITTER_CLIENT_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!clientId || !supabaseUrl) {
      console.error('Missing Twitter OAuth configuration:', { 
        hasClientId: !!clientId, 
        hasSupabaseUrl: !!supabaseUrl 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Twitter integration not configured', 
          code: 'INTEGRATION_NOT_CONFIGURED',
          message: 'Twitter OAuth credentials have not been set up. Please contact the administrator.'
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body for flow type
    let flowType = 'sign_in'; // Default to sign-in flow
    try {
      const body = await req.json();
      if (body.flowType === 'link') {
        flowType = 'link';
      }
    } catch {
      // No body or invalid JSON - use default
    }

    // Check for authenticated user (optional for sign-in, required for linking)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const supabase = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        {
          global: {
            headers: { Authorization: authHeader }
          }
        }
      );

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!userError && user) {
        userId = user.id;
        console.log('Authenticated user starting OAuth:', user.id);
      }
    }

    // For linking flow, user must be authenticated
    if (flowType === 'link' && !userId) {
      throw new Error('Authentication required to link Twitter account');
    }

    console.log('Starting Twitter OAuth:', { flowType, hasUser: !!userId });

    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    console.log('Generated PKCE:', { 
      verifierLength: codeVerifier.length,
      challengeLength: codeChallenge.length 
    });

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // Create service role client for inserting oauth state
    const serviceSupabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Store state, code verifier, and flow type
    const { error: insertError } = await serviceSupabase
      .from('oauth_states')
      .insert({
        state,
        provider: 'twitter',
        user_id: userId, // Can be null for sign-in flow
        code_verifier: codeVerifier,
        flow_type: flowType,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    if (insertError) {
      console.error('Failed to store OAuth state:', insertError);
      throw new Error('Failed to initialize OAuth flow');
    }

    // Build Twitter OAuth URL - request email scope for sign-in
    const redirectUri = `${supabaseUrl}/functions/v1/twitter-oauth-callback`;
    const scope = 'tweet.read users.read offline.access';
    
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log('Generated Twitter OAuth URL with S256 PKCE for flow:', flowType);

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
