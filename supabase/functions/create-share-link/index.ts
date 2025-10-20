import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    const { scanId, expiresInDays, password } = await req.json();

    // Verify scan ownership
    const { data: scan, error: scanError } = await supabaseClient
      .from("scans")
      .select("id")
      .eq("id", scanId)
      .eq("user_id", user.id)
      .single();

    if (scanError || !scan) {
      throw new Error("Scan not found");
    }

    // Generate random share token
    const shareToken = crypto.randomUUID();

    // Calculate expiration
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    // Create shared report
    const { data: sharedReport, error } = await supabaseClient
      .from("shared_reports")
      .insert({
        user_id: user.id,
        scan_id: scanId,
        share_token: shareToken,
        expires_at: expiresAt?.toISOString(),
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) throw error;

    const shareUrl = `${req.headers.get("origin")}/shared/${shareToken}`;

    return new Response(
      JSON.stringify({ 
        shareUrl, 
        token: shareToken,
        expiresAt: expiresAt?.toISOString() 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Share link error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
