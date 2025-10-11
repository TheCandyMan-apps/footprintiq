import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { scanId } = await req.json();
    console.log('Running correlation engine for scan:', scanId);

    // Get scan data
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError) throw scanError;

    // Get all data sources for this scan
    const { data: dataSources, error: dsError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('scan_id', scanId);

    if (dsError) throw dsError;

    // Get all social profiles for this scan
    const { data: socialProfiles, error: spError } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('scan_id', scanId);

    if (spError) throw spError;

    // Correlation logic
    const correlations = {
      emailMatches: [] as any[],
      phoneMatches: [] as any[],
      nameMatches: [] as any[],
      usernameMatches: [] as any[],
      addressMatches: [] as any[],
      relativeMatches: [] as any[],
      confidence: 0,
    };

    // Cross-reference data sources
    const email = scan.email;
    const phone = scan.phone;
    const fullName = `${scan.first_name} ${scan.last_name}`.trim();
    const username = scan.username;

    // Email correlations
    if (email) {
      const emailSources = dataSources.filter(ds => 
        ds.data_found.some((field: string) => 
          field.toLowerCase().includes('email')
        )
      );
      correlations.emailMatches = emailSources.map(ds => ({
        source: ds.name,
        category: ds.category,
        confidence: 0.95,
      }));
    }

    // Phone correlations
    if (phone) {
      const phoneSources = dataSources.filter(ds => 
        ds.data_found.some((field: string) => 
          field.toLowerCase().includes('phone')
        )
      );
      correlations.phoneMatches = phoneSources.map(ds => ({
        source: ds.name,
        category: ds.category,
        confidence: 0.90,
      }));
    }

    // Name correlations
    if (fullName) {
      const nameSources = dataSources.filter(ds => 
        ds.data_found.some((field: string) => 
          field.toLowerCase().includes('name')
        )
      );
      correlations.nameMatches = nameSources.map(ds => ({
        source: ds.name,
        category: ds.category,
        confidence: 0.85,
      }));
    }

    // Username correlations across social profiles
    if (username && socialProfiles) {
      correlations.usernameMatches = socialProfiles.map(sp => ({
        platform: sp.platform,
        username: sp.username,
        url: sp.profile_url,
        confidence: 0.80,
      }));
    }

    // Calculate overall correlation confidence
    const totalMatches = 
      correlations.emailMatches.length +
      correlations.phoneMatches.length +
      correlations.nameMatches.length +
      correlations.usernameMatches.length;

    correlations.confidence = Math.min(
      100,
      (totalMatches / (dataSources.length + (socialProfiles?.length || 0))) * 100
    );

    // Identify potential duplicate profiles
    const duplicateProfiles: any[] = [];
    if (socialProfiles && socialProfiles.length > 1) {
      const platformGroups = new Map<string, any[]>();
      
      socialProfiles.forEach(profile => {
        if (!platformGroups.has(profile.platform)) {
          platformGroups.set(profile.platform, []);
        }
        platformGroups.get(profile.platform)!.push(profile);
      });

      platformGroups.forEach((profiles, platform) => {
        if (profiles.length > 1) {
          duplicateProfiles.push({
            platform,
            count: profiles.length,
            profiles: profiles.map(p => p.username),
          });
        }
      });
    }

    // Cross-platform identity linkage
    const identityGraph = {
      primaryIdentifiers: {
        email: scan.email,
        phone: scan.phone,
        name: fullName,
        username: scan.username,
      },
      linkedProfiles: socialProfiles?.map(sp => ({
        platform: sp.platform,
        url: sp.profile_url,
        confidence: 0.75,
      })) || [],
      dataExposures: dataSources.map(ds => ({
        source: ds.name,
        category: ds.category,
        riskLevel: ds.risk_level,
        dataTypes: ds.data_found,
      })),
    };

    console.log('Correlation analysis complete:', {
      totalMatches,
      confidence: correlations.confidence,
      duplicates: duplicateProfiles.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        correlations,
        duplicateProfiles,
        identityGraph,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Correlation engine error:', error);
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
