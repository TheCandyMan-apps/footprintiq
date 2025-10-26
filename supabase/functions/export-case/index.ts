import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId } = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: "caseId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.split("Bearer ")[1]);
      userId = user?.id || null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch case details
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("user_id", userId)
      .single();

    if (caseError || !caseData) {
      return new Response(
        JSON.stringify({ error: "Case not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch evidence
    const { data: evidence } = await supabase
      .from("case_evidence")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    // Fetch notes
    const { data: notes } = await supabase
      .from("case_notes")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    // Fetch comments
    const { data: comments } = await supabase
      .from("case_comments")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    // Build forensic package
    const forensicPackage = {
      metadata: {
        caseId,
        title: caseData.title,
        status: caseData.status,
        priority: caseData.priority,
        exportedAt: new Date().toISOString(),
        exportedBy: userId,
      },
      case: caseData,
      evidence: evidence || [],
      notes: notes || [],
      comments: comments || [],
      chainOfCustody: [
        {
          action: "CASE_CREATED",
          timestamp: caseData.created_at,
          actor: userId,
        },
        {
          action: "EVIDENCE_EXPORTED",
          timestamp: new Date().toISOString(),
          actor: userId,
        },
      ],
      integrity: {
        checksum: await generateChecksum(JSON.stringify(caseData)),
        algorithm: "SHA-256",
      },
    };

    return new Response(
      JSON.stringify({ package: forensicPackage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Export case error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
