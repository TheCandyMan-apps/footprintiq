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

    const { type, startDate, endDate } = await req.json();

    let data;
    let filename;

    if (type === "trends") {
      // Export trend data
      const { data: scans } = await supabaseClient
        .from("scans")
        .select("id, created_at, privacy_score, total_sources_found, high_risk_count, medium_risk_count, low_risk_count")
        .eq("user_id", user.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: true });

      data = scans;
      filename = `trends_${startDate}_to_${endDate}`;
    } else if (type === "scans") {
      // Export scan data
      const { data: scans } = await supabaseClient
        .from("scans")
        .select("*, data_sources(*), social_profiles(*)")
        .eq("user_id", user.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      data = scans;
      filename = `scans_${startDate}_to_${endDate}`;
    }

    // Convert to CSV or JSON based on request
    const format = new URL(req.url).searchParams.get("format") || "json";

    if (format === "csv" && data) {
      const csv = convertToCSV(data);
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    } else {
      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      });
    }
  } catch (error: any) {
    console.error("Export error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header];
      if (typeof value === "object") return JSON.stringify(value);
      return value;
    }).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
