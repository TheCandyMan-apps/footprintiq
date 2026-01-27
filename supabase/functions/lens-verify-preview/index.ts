import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  profileId: string;
  platform: string;
  username: string;
  url?: string;
  scanId: string;
}

type ConfidenceLevel = "likely" | "unclear" | "unlikely";

interface VerifyResponse {
  confidenceLevel: ConfidenceLevel;
  explanation: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has already used their preview
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("lens_preview_used")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error checking profile:", profileError);
    }

    if (profile?.lens_preview_used) {
      return new Response(
        JSON.stringify({ error: "Free preview already used. Upgrade to Pro for unlimited LENS verifications." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const body: VerifyRequest = await req.json();
    const { profileId, platform, username, url, scanId } = body;

    if (!profileId || !platform || !username || !scanId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[lens-verify-preview] Processing for user ${user.id}, profile: ${platform}/${username}`);

    // Fetch additional context from the scan
    const { data: scanData } = await supabase
      .from("scans")
      .select("username, email, phone, scan_type")
      .eq("id", scanId)
      .single();

    const targetIdentifier = scanData?.username || scanData?.email || scanData?.phone || username;

    // Use Lovable AI to analyze the profile connection
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    let result: VerifyResponse;

    if (LOVABLE_API_KEY) {
      // Call Lovable AI for intelligent analysis
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are LENS, a calm and professional identity verification assistant for FootprintIQ.
Your role is to assess whether a discovered social media profile likely belongs to the same person as the search target.

Guidelines:
- Be neutral and non-alarmist
- Avoid absolute certainty unless evidence is very strong
- Focus on observable patterns (username similarity, platform type, profile metadata)
- Keep explanations to 2-3 sentences maximum
- Never fabricate evidence or make assumptions beyond what is provided

Respond with a JSON object containing:
- confidenceLevel: "likely" | "unclear" | "unlikely"
- explanation: A 2-3 sentence explanation in calm, professional language`
            },
            {
              role: "user",
              content: `Analyze this profile match:

Search Target: "${targetIdentifier}"
Scan Type: ${scanData?.scan_type || "username"}

Found Profile:
- Platform: ${platform}
- Username: ${username}
${url ? `- URL: ${url}` : ""}

Based on the username similarity and platform type, assess the likelihood this profile belongs to the same person.`
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("AI response error:", aiResponse.status, errorText);
        // Fall back to heuristic analysis
        result = performHeuristicAnalysis(targetIdentifier, platform, username);
      } else {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || "";
        
        try {
          // Parse the JSON response from AI
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            result = {
              confidenceLevel: parsed.confidenceLevel || "unclear",
              explanation: parsed.explanation || "Unable to determine confidence level.",
            };
          } else {
            result = performHeuristicAnalysis(targetIdentifier, platform, username);
          }
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          result = performHeuristicAnalysis(targetIdentifier, platform, username);
        }
      }
    } else {
      // No AI key available, use heuristic analysis
      result = performHeuristicAnalysis(targetIdentifier, platform, username);
    }

    console.log(`[lens-verify-preview] Result for ${platform}/${username}: ${result.confidenceLevel}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[lens-verify-preview] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Heuristic analysis when AI is not available
 */
function performHeuristicAnalysis(
  targetIdentifier: string,
  platform: string,
  username: string
): VerifyResponse {
  const targetLower = targetIdentifier.toLowerCase().replace(/[^a-z0-9]/g, "");
  const usernameLower = username.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Calculate similarity
  const exactMatch = targetLower === usernameLower;
  const containsTarget = usernameLower.includes(targetLower) || targetLower.includes(usernameLower);
  
  // Calculate Levenshtein distance for partial matches
  const similarity = calculateSimilarity(targetLower, usernameLower);

  if (exactMatch) {
    return {
      confidenceLevel: "likely",
      explanation: `The username "${username}" on ${platform} exactly matches the search identifier. This profile is likely connected to the same individual.`,
    };
  }

  if (containsTarget || similarity > 0.8) {
    return {
      confidenceLevel: "likely",
      explanation: `The username "${username}" on ${platform} closely resembles the search identifier. Pattern similarity suggests a probable connection.`,
    };
  }

  if (similarity > 0.5) {
    return {
      confidenceLevel: "unclear",
      explanation: `The username "${username}" on ${platform} has some similarity to the search identifier, but additional context would be needed to confirm a connection.`,
    };
  }

  return {
    confidenceLevel: "unlikely",
    explanation: `The username "${username}" on ${platform} does not closely match the search identifier. This may be a different individual or an unrelated account.`,
  };
}

/**
 * Calculate string similarity (0 to 1)
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  const longerLength = longer.length;
  if (longerLength === 0) return 1;

  const distance = levenshteinDistance(longer, shorter);
  return (longerLength - distance) / longerLength;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
