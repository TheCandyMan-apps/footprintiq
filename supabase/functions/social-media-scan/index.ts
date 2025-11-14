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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { platform } = await req.json();

    // Get the integration for this platform
    const { data: integration, error: integrationError } = await supabase
      .from('social_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .single();

    if (integrationError || !integration) {
      throw new Error(`No ${platform} integration found`);
    }

    console.log(`Starting ${platform} scan for user ${user.id}`);

    const findings = [];

    // Scan based on platform
    if (platform === 'twitter') {
      const twitterFindings = await scanTwitter(integration);
      findings.push(...twitterFindings);
    } else if (platform === 'linkedin') {
      const linkedinFindings = await scanLinkedIn(integration);
      findings.push(...linkedinFindings);
    } else if (platform === 'facebook') {
      const facebookFindings = await scanFacebook(integration);
      findings.push(...facebookFindings);
    }

    // Store findings in database
    if (findings.length > 0) {
      const { error: insertError } = await supabase
        .from('social_media_findings')
        .insert(
          findings.map(finding => ({
            user_id: user.id,
            integration_id: integration.id,
            platform,
            ...finding,
          }))
        );

      if (insertError) {
        console.error('Error storing findings:', insertError);
      }
    }

    console.log(`Scan complete. Found ${findings.length} findings.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        findings_count: findings.length,
        findings 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in social-media-scan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Scan failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function scanTwitter(integration: any) {
  const findings = [];
  
  try {
    // Fetch user's profile info
    const profileResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=description,public_metrics,profile_image_url,location', {
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      const user = profileData.data;

      // Profile visibility finding
      findings.push({
        finding_type: 'profile',
        title: 'Public Twitter Profile',
        description: `Your Twitter profile is public with ${user.public_metrics?.followers_count || 0} followers`,
        content: {
          username: integration.platform_username,
          followers: user.public_metrics?.followers_count,
          following: user.public_metrics?.following_count,
          tweets: user.public_metrics?.tweet_count,
          bio: user.description,
          location: user.location,
        },
        url: `https://twitter.com/${integration.platform_username}`,
        visibility: 'public',
        risk_level: 'low',
      });

      // Check for location exposure
      if (user.location) {
        findings.push({
          finding_type: 'location',
          title: 'Location Information Exposed',
          description: `Your location "${user.location}" is visible on your profile`,
          content: { location: user.location },
          visibility: 'public',
          risk_level: 'medium',
        });
      }
    }

    // Fetch recent tweets
    const tweetsResponse = await fetch('https://api.twitter.com/2/users/me/tweets?max_results=10&tweet.fields=created_at,public_metrics', {
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
      },
    });

    if (tweetsResponse.ok) {
      const tweetsData = await tweetsResponse.json();
      const tweets = tweetsData.data || [];

      findings.push({
        finding_type: 'posts',
        title: 'Recent Public Tweets',
        description: `Found ${tweets.length} recent public tweets`,
        content: { 
          tweet_count: tweets.length,
          tweets: tweets.slice(0, 5).map((t: any) => ({
            text: t.text,
            created_at: t.created_at,
            likes: t.public_metrics?.like_count,
          }))
        },
        visibility: 'public',
        risk_level: 'medium',
      });
    }

  } catch (error) {
    console.error('Twitter scan error:', error);
  }

  return findings;
}

async function scanLinkedIn(integration: any) {
  const findings = [];
  
  try {
    // Fetch user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
      },
    });

    if (profileResponse.ok) {
      const profile = await profileResponse.json();

      findings.push({
        finding_type: 'profile',
        title: 'LinkedIn Professional Profile',
        description: 'Your LinkedIn profile is publicly visible',
        content: {
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        },
        visibility: 'public',
        risk_level: 'low',
      });

      // Email exposure finding
      if (profile.email) {
        findings.push({
          finding_type: 'email',
          title: 'Email Address Visible',
          description: `Your email ${profile.email} may be visible to connections`,
          content: { email: profile.email },
          visibility: 'connections',
          risk_level: 'medium',
        });
      }
    }

  } catch (error) {
    console.error('LinkedIn scan error:', error);
  }

  return findings;
}

async function scanFacebook(integration: any) {
  const findings = [];
  
  try {
    // Fetch user profile
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${integration.access_token}`
    );

    if (profileResponse.ok) {
      const profile = await profileResponse.json();

      findings.push({
        finding_type: 'profile',
        title: 'Facebook Profile',
        description: 'Your Facebook profile information',
        content: {
          name: profile.name,
          email: profile.email,
          facebook_id: profile.id,
        },
        visibility: 'friends',
        risk_level: 'low',
      });

      if (profile.email) {
        findings.push({
          finding_type: 'email',
          title: 'Email Associated with Facebook',
          description: `Email ${profile.email} is linked to your Facebook account`,
          content: { email: profile.email },
          visibility: 'private',
          risk_level: 'low',
        });
      }
    }

  } catch (error) {
    console.error('Facebook scan error:', error);
  }

  return findings;
}
