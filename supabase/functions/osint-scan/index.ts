import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  scanId: string;
  scanType: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const scanData: ScanRequest = await req.json();
    console.log('Starting OSINT scan:', scanData.scanId);

    // API Keys (will be set by user)
    const PEOPLE_DATA_LABS_KEY = Deno.env.get('PEOPLE_DATA_LABS_KEY');
    const PIPL_KEY = Deno.env.get('PIPL_KEY');
    const WHITEPAGES_KEY = Deno.env.get('WHITEPAGES_KEY');
    const HUNTER_IO_KEY = Deno.env.get('HUNTER_IO_KEY');
    const HIBP_KEY = Deno.env.get('HIBP_API_KEY');
    const CLEARBIT_KEY = Deno.env.get('CLEARBIT_KEY');

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

    // 6. Sherlock-style username search across social platforms
    if (scanData.username) {
      console.log('Searching social platforms...');
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
          if (platform.check) {
            const response = await fetch(platform.check, {
              method: 'HEAD',
              redirect: 'follow',
            });
            
            if (response.ok || response.status === 200) {
              results.socialProfiles.push({
                platform: platform.name,
                username: cleanUsername,
                profile_url: platform.url,
                found: true,
                first_seen: new Date().toISOString(),
              });
            }
          } else {
            // For platforms without API, mark as potential
            results.socialProfiles.push({
              platform: platform.name,
              username: cleanUsername,
              profile_url: platform.url,
              found: true,
              first_seen: new Date().toISOString(),
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
    console.error('Scan error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
