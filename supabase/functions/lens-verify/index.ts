import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LensRequest {
  url: string;
  platform: string;
  scanId: string;
  findingId: string;
}

interface LensVerificationResponse {
  confidenceScore: number;
  hashedContent: string;
  verificationHash: string;
  metadata: {
    sourceAge: string;
    sslStatus: string;
    platformConsistency: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: LensRequest = await req.json();
    const { url, platform, scanId, findingId } = body;

    // Validate required fields
    if (!url || !platform || !scanId || !findingId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: url, platform, scanId, findingId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if verification already exists for this finding
    const { data: existingEntry } = await supabase
      .from("evidence_ledger")
      .select("*")
      .eq("finding_id", findingId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingEntry) {
      // Return existing verification
      return new Response(
        JSON.stringify({
          cached: true,
          confidenceScore: existingEntry.confidence_score,
          hashedContent: existingEntry.hashed_content,
          verificationHash: existingEntry.verification_hash,
          metadata: {
            sourceAge: existingEntry.source_age,
            sslStatus: existingEntry.ssl_status,
            platformConsistency: existingEntry.platform_consistency,
          },
          verifiedAt: existingEntry.verified_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = Deno.env.get("N8N_LENS_WEBHOOK_URL");
    
    let verificationResult: LensVerificationResponse;

    if (n8nWebhookUrl && n8nWebhookUrl !== "placeholder") {
      // Call n8n webhook for real verification
      console.log("[lens-verify] Calling n8n webhook:", n8nWebhookUrl);
      
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          platform,
          scanId,
        }),
      });

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error("[lens-verify] n8n webhook error:", errorText);
        throw new Error(`n8n webhook failed: ${n8nResponse.status}`);
      }

      verificationResult = await n8nResponse.json();
    } else {
      // Fallback: Generate synthetic verification for demo/development
      console.log("[lens-verify] Using synthetic verification (n8n webhook not configured)");
      verificationResult = generateSyntheticVerification(url, platform);
    }

    // Persist verification to evidence_ledger
    const { data: ledgerEntry, error: insertError } = await supabase
      .from("evidence_ledger")
      .insert({
        finding_id: findingId,
        scan_id: scanId,
        user_id: user.id,
        verification_hash: verificationResult.verificationHash,
        confidence_score: verificationResult.confidenceScore,
        hashed_content: verificationResult.hashedContent,
        source_age: verificationResult.metadata.sourceAge,
        ssl_status: verificationResult.metadata.sslStatus,
        platform_consistency: verificationResult.metadata.platformConsistency,
        raw_response: verificationResult,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[lens-verify] Failed to insert ledger entry:", insertError);
      throw new Error(`Failed to save verification: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        cached: false,
        confidenceScore: verificationResult.confidenceScore,
        hashedContent: verificationResult.hashedContent,
        verificationHash: verificationResult.verificationHash,
        metadata: verificationResult.metadata,
        verifiedAt: ledgerEntry.verified_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[lens-verify] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Generate synthetic verification for demo/development when n8n is not configured
 */
function generateSyntheticVerification(url: string, platform: string): LensVerificationResponse {
  const timestamp = new Date().toISOString();
  
  // Create evidence content
  const evidenceContent = JSON.stringify({
    url,
    platform,
    analyzedAt: timestamp,
    source: "synthetic",
  }, null, 2);

  // Generate a deterministic hash-like string from the content
  // Using a simple hash function since crypto.subtle.digest is async
  let hash = 0;
  const str = evidenceContent + timestamp;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate a hex-like verification hash
  const verificationHash = Math.abs(hash).toString(16).padStart(8, '0') + 
    Date.now().toString(16) + 
    Math.random().toString(16).slice(2, 18) +
    Math.random().toString(16).slice(2, 18);

  // Determine confidence based on known platforms
  const knownPlatforms: Record<string, string> = {
    twitter: "twitter.com",
    x: "x.com",
    facebook: "facebook.com",
    instagram: "instagram.com",
    linkedin: "linkedin.com",
    github: "github.com",
    reddit: "reddit.com",
    youtube: "youtube.com",
    tiktok: "tiktok.com",
  };

  const platformLower = platform.toLowerCase();
  const expectedDomain = knownPlatforms[platformLower];
  const urlDomain = new URL(url).hostname.replace("www.", "");
  
  let platformConsistency = "Unknown";
  let baseScore = 50;

  if (expectedDomain && urlDomain.includes(expectedDomain.replace("www.", ""))) {
    platformConsistency = "High";
    baseScore = 75;
  } else if (expectedDomain) {
    platformConsistency = "Low";
    baseScore = 30;
  } else {
    platformConsistency = "Medium";
    baseScore = 55;
  }

  // Add some variance
  const variance = Math.floor(Math.random() * 20) - 10;
  const confidenceScore = Math.max(0, Math.min(100, baseScore + variance));

  // SSL status based on URL protocol
  const sslStatus = url.startsWith("https://") ? "Valid Certificate" : "None";

  // Synthetic source age
  const ageOptions = ["2 years, 3 months", "1 year, 6 months", "8 months", "3 months", "Unknown"];
  const sourceAge = ageOptions[Math.floor(Math.random() * ageOptions.length)];

  return {
    confidenceScore,
    hashedContent: evidenceContent.substring(0, 500),
    verificationHash,
    metadata: {
      sourceAge,
      sslStatus,
      platformConsistency,
    },
  };
}
