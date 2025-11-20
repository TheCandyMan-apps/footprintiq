import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const SocialScanSchema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'facebook'], {
    errorMap: () => ({ message: "Platform must be twitter, linkedin, or facebook" })
  })
});

// Security helpers
async function validateAuth(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

async function checkRateLimit(supabase: any, userId: string, endpoint: string) {
  const { data: rateLimit } = await supabase.rpc('check_rate_limit', {
    p_identifier: userId,
    p_identifier_type: 'user',
    p_endpoint: endpoint,
    p_max_requests: 10,
    p_window_seconds: 3600
  });

  if (!rateLimit?.allowed) {
    const error = new Error('Rate limit exceeded');
    (error as any).status = 429;
    (error as any).resetAt = rateLimit?.reset_at;
    throw error;
  }
}

function addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...corsHeaders,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    ...headers,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Authentication
    const user = await validateAuth(req, supabase);
    const userId = user.id;

    // Rate limiting - 10 scans per hour
    await checkRateLimit(supabase, userId, 'social-media-scan');

    // Validate request body
    const body = await req.json();
    const { platform } = SocialScanSchema.parse(body);

    console.log(`[social-media-scan] Starting ${platform} scan for user ${userId}`);

    // Get the integration for this platform
    const { data: integration, error: integrationError } = await supabase
      .from('social_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single();

    if (integrationError || !integration) {
      throw new Error(`No ${platform} integration found. Please connect your account first.`);
    }

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
            user_id: userId,
            integration_id: integration.id,
            platform,
            ...finding,
          }))
        );

      if (insertError) {
        console.error('[social-media-scan] Error storing findings:', insertError);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[social-media-scan] Scan complete. Found ${findings.length} findings in ${duration}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        findings_count: findings.length,
        findings,
        duration
      }),
      { headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
    );

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[social-media-scan] Error:', {
      message: error.message,
      duration,
      timestamp: new Date().toISOString()
    });

    const status = error.status || 500;
    const message = error.message || 'Social media scan failed';

    return new Response(
      JSON.stringify({ 
        error: message,
        ...(error.resetAt && { retryAfter: error.resetAt })
      }),
      { 
        status,
        headers: addSecurityHeaders({ 'Content-Type': 'application/json' })
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
