import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ScanRequestSchema = z.object({
  scanId: z.string().uuid({ message: "Invalid scan ID format" }),
  scanType: z.enum(['username', 'personal_details', 'both'], { 
    errorMap: () => ({ message: "Invalid scan type" })
  }),
  username: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email({ message: "Invalid email address" }).max(255).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }).optional(),
}).refine(
  (data) => {
    // At least one identifier must be provided
    return data.username || data.email || data.phone || data.firstName;
  },
  { message: "At least one identifier (username, email, phone, or name) must be provided" }
);

interface ScanRequest {
  scanId: string;
  scanType: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

// Import shared PII masking utility
import { maskPII } from "../_shared/maskPII.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = ScanRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.issues 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const scanData = validation.data;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Starting OSINT scan:', maskPII(scanData));

    // API Keys (will be set by user)
    const PEOPLE_DATA_LABS_KEY = Deno.env.get('PEOPLE_DATA_LABS_KEY');
    const PIPL_KEY = Deno.env.get('PIPL_KEY');
    const WHITEPAGES_KEY = Deno.env.get('WHITEPAGES_KEY');
    const HUNTER_IO_KEY = Deno.env.get('HUNTER_IO_KEY');
    const HIBP_KEY = Deno.env.get('HIBP_API_KEY');
    const CLEARBIT_KEY = Deno.env.get('CLEARBIT_KEY');
    const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');

    const results = {
      dataSources: [] as any[],
      socialProfiles: [] as any[],
      breaches: [] as any[],
      phoneData: null as any,
      emailData: null as any,
    };

    // 1. People Data Labs Search
    if (PEOPLE_DATA_LABS_KEY && (scanData.email || scanData.phone)) {
      console.log('Searching People Data Labs...');
      try {
        const pdlParams = new URLSearchParams();
        if (scanData.email) pdlParams.append('email', scanData.email);
        if (scanData.phone) pdlParams.append('phone', scanData.phone);

        const pdlResponse = await fetch(
          `https://api.peopledatalabs.com/v5/person/search?${pdlParams}`,
          {
            headers: { 'X-Api-Key': PEOPLE_DATA_LABS_KEY },
          }
        );

        if (pdlResponse.ok) {
          const pdlData = await pdlResponse.json();
          if (pdlData.data && pdlData.data.length > 0) {
            const person = pdlData.data[0];
            results.dataSources.push({
              name: 'People Data Labs',
              category: 'People Intelligence',
              url: 'https://peopledatalabs.com',
              risk_level: 'high',
              data_found: Object.keys(person).filter(k => person[k]),
              metadata: {
                full_name: person.full_name || null,
                location: person.location_name || null,
                job_title: person.job_title || null,
                company: person.job_company_name || null,
                linkedin_url: person.linkedin_url || null,
                facebook_url: person.facebook_url || null,
                twitter_url: person.twitter_url || null,
                emails: person.emails || [],
                phone_numbers: person.phone_numbers || [],
                industry: person.industry || null,
                confidence: pdlData.likelihood || null,
              },
            });
          }
        }
      } catch (error) {
        console.error('PDL error:', error);
      }
    }

    // 2. Pipl Search
    if (PIPL_KEY && (scanData.email || scanData.phone)) {
      console.log('Searching Pipl...');
      try {
        const piplParams = new URLSearchParams({ key: PIPL_KEY });
        if (scanData.email) piplParams.append('email', scanData.email);
        if (scanData.phone) piplParams.append('phone', scanData.phone);

        const piplResponse = await fetch(
          `https://api.pipl.com/search/?${piplParams}`
        );

        if (piplResponse.ok) {
          const piplData = await piplResponse.json();
          if (piplData.person) {
            results.dataSources.push({
              name: 'Pipl',
              category: 'Identity Resolution',
              url: 'https://pipl.com',
              risk_level: 'high',
              data_found: ['Full Identity Profile', 'Contact Info', 'Social Profiles'],
              metadata: {
                names: piplData.person.names || [],
                addresses: piplData.person.addresses || [],
                phones: piplData.person.phones || [],
                emails: piplData.person.emails || [],
                jobs: piplData.person.jobs || [],
                educations: piplData.person.educations || [],
                images: piplData.person.images || [],
                urls: piplData.person.urls || [],
                match_confidence: piplData.match_requirements?.match_confidence || null,
              },
            });
          }
        }
      } catch (error) {
        console.error('Pipl error:', error);
      }
    }

    // 3. WhitePages Pro
    if (WHITEPAGES_KEY && scanData.phone) {
      console.log('Searching WhitePages...');
      try {
        const wpResponse = await fetch(
          `https://proapi.whitepages.com/3.0/phone?phone=${encodeURIComponent(scanData.phone)}&api_key=${WHITEPAGES_KEY}`
        );

        if (wpResponse.ok) {
          const wpData = await wpResponse.json();
          results.phoneData = wpData;
          results.dataSources.push({
            name: 'WhitePages Pro',
            category: 'Phone Lookup',
            url: 'https://pro.whitepages.com',
            risk_level: 'medium',
            data_found: ['Phone Number', 'Carrier', 'Location', 'Line Type'],
            metadata: {
              phone_number: wpData.phone_number || null,
              is_valid: wpData.is_valid || null,
              country_code: wpData.country_calling_code || null,
              line_type: wpData.line_type || null,
              carrier: wpData.carrier || null,
              location: wpData.current_addresses?.[0]?.city || null,
              is_prepaid: wpData.is_prepaid || null,
              belongs_to: wpData.belongs_to || [],
            },
          });
        }
      } catch (error) {
        console.error('WhitePages error:', error);
      }
    }

    // 4. Have I Been Pwned
    if (HIBP_KEY && scanData.email) {
      console.log('Checking data breaches...');
      try {
        const hibpResponse = await fetch(
          `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(scanData.email)}`,
          {
            headers: {
              'hibp-api-key': HIBP_KEY,
              'user-agent': 'OSINT-Scanner',
            },
          }
        );

        if (hibpResponse.ok) {
          const breaches = await hibpResponse.json();
          results.breaches = breaches;
          results.dataSources.push({
            name: 'Have I Been Pwned',
            category: 'Data Breaches',
            url: 'https://haveibeenpwned.com',
            risk_level: 'high',
            data_found: [`Found in ${breaches.length} data breaches`],
            metadata: {
              breach_count: breaches.length,
              breaches: breaches.map((b: any) => ({
                name: b.Name,
                title: b.Title,
                domain: b.Domain,
                breach_date: b.BreachDate,
                added_date: b.AddedDate,
                modified_date: b.ModifiedDate,
                pwn_count: b.PwnCount,
                description: b.Description,
                data_classes: b.DataClasses,
                is_verified: b.IsVerified,
                is_sensitive: b.IsSensitive,
              })),
            },
          });
        }
      } catch (error) {
        console.error('HIBP error:', error);
      }
    }

    // 5. Hunter.io Email Intelligence
    if (HUNTER_IO_KEY && scanData.email) {
      console.log('Searching Hunter.io...');
      const dataFound: string[] = [];
      
      try {
        // Email Verification
        const verifyResponse = await fetch(
          `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(scanData.email)}&api_key=${HUNTER_IO_KEY}`
        );

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          results.emailData = verifyData.data;
          dataFound.push('Email Verification', 'Sources');
        }

        // Person Enrichment
        const personResponse = await fetch(
          `https://api.hunter.io/v2/people/find?email=${encodeURIComponent(scanData.email)}&api_key=${HUNTER_IO_KEY}`
        );

        if (personResponse.ok) {
          const personData = await personResponse.json();
          if (personData.data) {
            dataFound.push('Person Profile', 'Job Title', 'Social Links');
          }
        }

        // Combined Enrichment (Person + Company)
        const combinedResponse = await fetch(
          `https://api.hunter.io/v2/combined/find?email=${encodeURIComponent(scanData.email)}&api_key=${HUNTER_IO_KEY}`
        );

        if (combinedResponse.ok) {
          const combinedData = await combinedResponse.json();
          if (combinedData.data) {
            dataFound.push('Company Info', 'Organization Details');
          }
        }

        // Domain Search (extract domain from email)
        const domain = scanData.email.split('@')[1];
        if (domain) {
          const domainResponse = await fetch(
            `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${HUNTER_IO_KEY}`
          );

          if (domainResponse.ok) {
            const domainData = await domainResponse.json();
            if (domainData.data && domainData.data.emails) {
              dataFound.push(`${domainData.data.emails.length} Related Emails`, 'Company Domain');
            }
          }

          // Company Enrichment
          const companyResponse = await fetch(
            `https://api.hunter.io/v2/companies/find?domain=${domain}&api_key=${HUNTER_IO_KEY}`
          );

          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            if (companyData.data) {
              dataFound.push('Company Profile', 'Industry', 'Size');
            }
          }
        }

        if (dataFound.length > 0) {
          results.dataSources.push({
            name: 'Hunter.io',
            category: 'Email Intelligence',
            url: 'https://hunter.io',
            risk_level: 'medium',
            data_found: dataFound,
            metadata: {
              email: scanData.email,
              result: results.emailData?.result || null,
              score: results.emailData?.score || null,
              regexp: results.emailData?.regexp || null,
              gibberish: results.emailData?.gibberish || null,
              disposable: results.emailData?.disposable || null,
              webmail: results.emailData?.webmail || null,
              mx_records: results.emailData?.mx_records || null,
              smtp_server: results.emailData?.smtp_server || null,
              smtp_check: results.emailData?.smtp_check || null,
              sources: results.emailData?.sources || [],
            },
          });
        }
      } catch (error) {
        console.error('Hunter.io error:', error);
      }
    }

    // 5b. Hunter.io Email Finder (if name is provided without email)
    if (HUNTER_IO_KEY && !scanData.email && scanData.firstName && scanData.lastName) {
      console.log('Attempting Hunter.io email discovery...');
      try {
        // Try common domains if we have enough info
        const commonDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];
        
        for (const domain of commonDomains) {
          const finderResponse = await fetch(
            `https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${encodeURIComponent(scanData.firstName)}&last_name=${encodeURIComponent(scanData.lastName)}&api_key=${HUNTER_IO_KEY}`
          );

          if (finderResponse.ok) {
            const finderData = await finderResponse.json();
            if (finderData.data && finderData.data.email) {
              results.dataSources.push({
                name: 'Hunter.io Email Discovery',
                category: 'Email Intelligence',
                url: 'https://hunter.io',
                risk_level: 'medium',
                data_found: ['Potential Email', 'Confidence Score', 'Sources'],
              });
              break;
            }
          }
        }
      } catch (error) {
        console.error('Hunter.io finder error:', error);
      }
    }

    // 6. Apify Sherlock Actor - comprehensive username search
    if (APIFY_API_TOKEN && scanData.username) {
      console.log('Running Apify Sherlock Actor for username reconnaissance...');
      const cleanUsername = scanData.username.startsWith('@') 
        ? scanData.username.slice(1) 
        : scanData.username;

      try {
        // Start Sherlock Actor run using the correct API format
        console.log(`Starting Sherlock Actor for username: ${cleanUsername}`);
        const actorRunResponse = await fetch(
          `https://api.apify.com/v2/acts/misceres~sherlock/runs?token=${APIFY_API_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              usernames: [cleanUsername],
            }),
          }
        );

        console.log(`Sherlock Actor response status: ${actorRunResponse.status}`);
        
        if (!actorRunResponse.ok) {
          const errorText = await actorRunResponse.text();
          console.error(`Sherlock Actor failed: ${actorRunResponse.status} - ${errorText}`);
          throw new Error(`Failed to start Sherlock Actor: ${actorRunResponse.status}`);
        }

        const runData = await actorRunResponse.json();
        const runId = runData.data.id;
        const defaultDatasetId = runData.data.defaultDatasetId;
        console.log(`Sherlock Actor started - Run ID: ${runId}, Dataset ID: ${defaultDatasetId}`);

        // Poll for completion
        let attempts = 0;
        const maxAttempts = 30;
        let runCompleted = false;

        while (attempts < maxAttempts && !runCompleted) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const statusResponse = await fetch(
            `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
          );

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            const status = statusData.data.status;
            console.log(`Sherlock status (attempt ${attempts + 1}): ${status}`);

            if (status === 'SUCCEEDED') {
              runCompleted = true;
              
              // Fetch dataset items using the API endpoint you provided
              console.log(`Fetching results from dataset: ${defaultDatasetId}`);
              const resultsResponse = await fetch(
                `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${APIFY_API_TOKEN}`
              );

              if (resultsResponse.ok) {
                const resultsData = await resultsResponse.json();
                console.log(`Sherlock found ${resultsData.length} result items`);
                console.log('Sample result:', JSON.stringify(resultsData[0], null, 2));

                // Process results
                for (const result of resultsData) {
                  if (result.links && Array.isArray(result.links)) {
                    console.log(`Processing ${result.links.length} links for username: ${result.username || cleanUsername}`);
                    
                    for (const link of result.links) {
                      try {
                        const url = new URL(link);
                        let platform = url.hostname.replace('www.', '').split('.')[0];
                        platform = platform.charAt(0).toUpperCase() + platform.slice(1);

                        results.socialProfiles.push({
                          platform: platform,
                          username: result.username || cleanUsername,
                          profile_url: link,
                          found: true,
                          first_seen: new Date().toISOString(),
                          is_verified: false,
                          metadata: {
                            source: 'Apify Sherlock',
                            discovered_at: new Date().toISOString(),
                          },
                        });
                      } catch (urlError) {
                        console.error('Error parsing URL:', link, urlError);
                      }
                    }
                  }
                }
                
                console.log(`Added ${results.socialProfiles.length} social profiles from Sherlock`);
              } else {
                const errorText = await resultsResponse.text();
                console.error(`Failed to fetch results: ${resultsResponse.status} - ${errorText}`);
              }
            } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
              console.error(`Sherlock run ${status}`);
              runCompleted = true;
            }
          } else {
            console.error(`Status check failed: ${statusResponse.status}`);
          }
          
          attempts++;
        }

        if (!runCompleted) {
          console.warn(`Sherlock timed out after ${maxAttempts * 2} seconds`);
        }
      } catch (error) {
        console.error('Apify Sherlock error:', error instanceof Error ? error.message : error);
      }
    } else if (!APIFY_API_TOKEN && scanData.username) {
      console.log('APIFY_API_TOKEN not configured - skipping Sherlock Actor');
    }

    // 7. Fallback: Manual social platform checks (always run as backup)
    if (scanData.username) {
      console.log('Searching social platforms (manual checks)...');
      const cleanUsername = scanData.username.startsWith('@') 
        ? scanData.username.slice(1) 
        : scanData.username;

      const socialPlatforms = [
        { name: 'Twitter/X', url: `https://twitter.com/${cleanUsername}`, check: 'https://api.twitter.com/2/users/by/username/' },
        { name: 'Instagram', url: `https://instagram.com/${cleanUsername}`, check: `https://www.instagram.com/${cleanUsername}/` },
        { name: 'Facebook', url: `https://facebook.com/${cleanUsername}`, check: `https://www.facebook.com/${cleanUsername}` },
        { name: 'LinkedIn', url: `https://linkedin.com/in/${cleanUsername}`, check: `https://www.linkedin.com/in/${cleanUsername}` },
        { name: 'TikTok', url: `https://tiktok.com/@${cleanUsername}`, check: `https://www.tiktok.com/@${cleanUsername}` },
        { name: 'Reddit', url: `https://reddit.com/user/${cleanUsername}`, check: `https://www.reddit.com/user/${cleanUsername}/about.json` },
        { name: 'GitHub', url: `https://github.com/${cleanUsername}`, check: `https://api.github.com/users/${cleanUsername}` },
        { name: 'YouTube', url: `https://youtube.com/@${cleanUsername}`, check: `https://www.youtube.com/@${cleanUsername}` },
        { name: 'Pinterest', url: `https://pinterest.com/${cleanUsername}`, check: `https://www.pinterest.com/${cleanUsername}/` },
        { name: 'Tumblr', url: `https://${cleanUsername}.tumblr.com`, check: `https://${cleanUsername}.tumblr.com` },
        { name: 'Medium', url: `https://medium.com/@${cleanUsername}`, check: `https://medium.com/@${cleanUsername}` },
        { name: 'Twitch', url: `https://twitch.tv/${cleanUsername}`, check: `https://www.twitch.tv/${cleanUsername}` },
        { name: 'Discord', url: `discord://${cleanUsername}`, check: null },
        { name: 'Snapchat', url: `https://snapchat.com/add/${cleanUsername}`, check: null },
        { name: 'Telegram', url: `https://t.me/${cleanUsername}`, check: `https://t.me/${cleanUsername}` },
      ];

      for (const platform of socialPlatforms) {
        try {
          console.log(`Checking ${platform.name} for ${cleanUsername}...`);
          if (platform.check) {
            const response = await fetch(platform.check, {
              method: 'GET',
              redirect: 'follow',
            });
            
            console.log(`${platform.name} response status: ${response.status}`);
            if (response.ok || response.status === 200) {
              let metadata: any = {
                status_code: response.status,
                found_at: new Date().toISOString(),
              };

              // Try to extract additional data from API responses
              try {
                const data = await response.json();
                
                // GitHub specific enrichment
                if (platform.name === 'GitHub' && data.login) {
                  metadata = {
                    ...metadata,
                    account_id: data.id?.toString(),
                    full_name: data.name || null,
                    bio: data.bio || null,
                    avatar_url: data.avatar_url || null,
                    followers: data.followers?.toString() || null,
                    following: data.following || null,
                    public_repos: data.public_repos || null,
                    company: data.company || null,
                    location: data.location || null,
                    blog: data.blog || null,
                    created_at: data.created_at || null,
                  };
                }

                // Reddit specific enrichment
                if (platform.name === 'Reddit' && data.data) {
                  const user = data.data;
                  metadata = {
                    ...metadata,
                    account_id: user.id || null,
                    full_name: user.subreddit?.title || null,
                    karma: user.total_karma || null,
                    avatar_url: user.icon_img || null,
                    created_at: user.created ? new Date(user.created * 1000).toISOString() : null,
                    is_verified: user.verified || false,
                    is_gold: user.is_gold || false,
                  };
                }
              } catch (parseError) {
                // If we can't parse JSON, just use basic metadata
                console.log(`Could not parse ${platform.name} data`);
              }

              results.socialProfiles.push({
                platform: platform.name,
                username: cleanUsername,
                profile_url: platform.url,
                found: true,
                first_seen: new Date().toISOString(),
                is_verified: metadata.is_verified || false,
                account_id: metadata.account_id || null,
                full_name: metadata.full_name || null,
                bio: metadata.bio || null,
                avatar_url: metadata.avatar_url || null,
                account_type: metadata.account_type || 'personal',
                followers: metadata.followers || null,
                metadata: metadata,
              });
            }
          } else {
            // For platforms without API, mark as potential with basic metadata
            results.socialProfiles.push({
              platform: platform.name,
              username: cleanUsername,
              profile_url: platform.url,
              found: true,
              first_seen: new Date().toISOString(),
              is_verified: false,
              metadata: {
                check_method: 'manual',
                note: 'Platform requires manual verification',
              },
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`${platform.name} check failed:`, errorMessage);
        }
      }
    }

    // Store results in database
    if (results.dataSources.length > 0) {
      const { error: dsError } = await supabase
        .from('data_sources')
        .insert(results.dataSources.map(ds => ({
          scan_id: scanData.scanId,
          ...ds,
        })));

      if (dsError) console.error('Error storing data sources:', dsError);
    }

    if (results.socialProfiles.length > 0) {
      const { error: spError } = await supabase
        .from('social_profiles')
        .insert(results.socialProfiles.map(sp => ({
          scan_id: scanData.scanId,
          ...sp,
        })));

      if (spError) console.error('Error storing social profiles:', spError);
    }

    // Calculate privacy score
    const highRiskCount = results.dataSources.filter(ds => ds.risk_level === 'high').length;
    const mediumRiskCount = results.dataSources.filter(ds => ds.risk_level === 'medium').length;
    const lowRiskCount = results.dataSources.filter(ds => ds.risk_level === 'low').length;
    const breachPenalty = results.breaches.length * 10;
    const socialPenalty = results.socialProfiles.length * 2;

    const privacyScore = Math.max(0, 100 - (
      highRiskCount * 15 + 
      mediumRiskCount * 10 + 
      lowRiskCount * 5 + 
      breachPenalty + 
      socialPenalty
    ));

    // Update scan record
    const { error: updateError } = await supabase
      .from('scans')
      .update({
        privacy_score: privacyScore,
        total_sources_found: results.dataSources.length + results.socialProfiles.length,
        high_risk_count: highRiskCount,
        medium_risk_count: mediumRiskCount,
        low_risk_count: lowRiskCount,
      })
      .eq('id', scanData.scanId);

    if (updateError) console.error('Error updating scan:', updateError);

    console.log('Scan completed:', {
      dataSources: results.dataSources.length,
      socialProfiles: results.socialProfiles.length,
      breaches: results.breaches.length,
      privacyScore,
    });

    return new Response(
      JSON.stringify({
        success: true,
        results: {
          dataSources: results.dataSources.length,
          socialProfiles: results.socialProfiles.length,
          breaches: results.breaches.length,
          privacyScore,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scan error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your scan request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
