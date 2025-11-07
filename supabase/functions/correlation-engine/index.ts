import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateSubscription } from "../_shared/validateSubscription.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  scanId: z.string().uuid({ message: "Invalid scan ID format" }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate premium subscription
    const { userId } = await validateSubscription(req, 'premium');
    console.log('Premium feature access granted for user:', userId);

    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
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
    
    const { scanId } = validation.data;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate user ownership via RLS (userId already validated above)
    const { data: scanCheck } = await supabase.from('scans').select('user_id').eq('id', scanId).eq('user_id', userId).single();
    if (!scanCheck) {
      return new Response(
        JSON.stringify({ error: 'Scan not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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

    // Import confidence scoring utilities
    const { calculateProviderConfidence } = await import('../_shared/confidenceScoring.ts');
    
    // Email correlations
    if (email) {
      const emailSources = dataSources.filter(ds => 
        ds.data_found.some((field: string) => 
          field.toLowerCase().includes('email')
        )
      );
      const emailConfidence = calculateProviderConfidence(
        emailSources.map(ds => ds.name),
        dataSources.length
      );
      correlations.emailMatches = emailSources.map(ds => ({
        source: ds.name,
        category: ds.category,
        confidence: emailConfidence / 100,
      }));
    }

    // Phone correlations
    if (phone) {
      const phoneSources = dataSources.filter(ds => 
        ds.data_found.some((field: string) => 
          field.toLowerCase().includes('phone')
        )
      );
      const phoneConfidence = calculateProviderConfidence(
        phoneSources.map(ds => ds.name),
        dataSources.length
      );
      correlations.phoneMatches = phoneSources.map(ds => ({
        source: ds.name,
        category: ds.category,
        confidence: phoneConfidence / 100,
      }));
    }

    // Name correlations
    if (fullName) {
      const nameSources = dataSources.filter(ds => 
        ds.data_found.some((field: string) => 
          field.toLowerCase().includes('name')
        )
      );
      const nameConfidence = calculateProviderConfidence(
        nameSources.map(ds => ds.name),
        dataSources.length
      );
      correlations.nameMatches = nameSources.map(ds => ({
        source: ds.name,
        category: ds.category,
        confidence: nameConfidence / 100,
      }));
    }

    // Username correlations across social profiles
    if (username && socialProfiles) {
      const usernameConfidence = calculateProviderConfidence(
        socialProfiles.map(sp => sp.platform),
        socialProfiles.length
      );
      correlations.usernameMatches = socialProfiles.map(sp => ({
        platform: sp.platform,
        username: sp.username,
        url: sp.profile_url,
        confidence: (sp.confidence_score || usernameConfidence) / 100,
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

    console.log('Correlation analysis complete - matches:', totalMatches, 'confidence:', correlations.confidence);

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
    console.error('Correlation engine error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred processing correlation analysis' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
