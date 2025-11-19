import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody } from "../_shared/security-validation.ts";
import { requireCSRF } from "../_shared/csrf-validation.ts";
import { addSecurityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-csrf-token",
};

const ExportRequestSchema = z.object({
  type: z.enum(['trends', 'scans'], { 
    errorMap: () => ({ message: "Type must be 'trends' or 'scans'" })
  }),
  startDate: z.string().datetime({ message: "Invalid start date" }),
  endDate: z.string().datetime({ message: "Invalid end date" }),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 1. CSRF Protection (sensitive data export)
    const csrfError = requireCSRF(req);
    if (csrfError) {
      return csrfError;
    }

    // 2. Authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    const { userId, subscriptionTier = 'free' } = authResult.context;

    // 3. Rate Limiting (exports are expensive)
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: 'export',
      userId,
      tier: subscriptionTier,
    });

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // 4. Input Validation
    const body = await req.json();
    const validation = validateRequestBody(body, ExportRequestSchema);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error || 'Invalid input' }),
        { 
          status: 400, 
          headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
        }
      );
    }
    
    const { type, startDate, endDate } = validation.data!;

    let data;
    let filename;

    if (type === "trends") {
      // Export trend data
      const { data: scans } = await supabase
        .from("scans")
        .select("id, created_at, privacy_score, total_sources_found, high_risk_count, medium_risk_count, low_risk_count")
        .eq("user_id", userId)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: true });

      data = scans;
      filename = `trends_${startDate}_to_${endDate}`;
    } else if (type === "scans") {
      // Export scan data
      const { data: scans } = await supabase
        .from("scans")
        .select("*, data_sources(*), social_profiles(*)")
        .eq("user_id", userId)
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
        headers: addSecurityHeaders({
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        }),
      });
    } else {
      return new Response(JSON.stringify(data, null, 2), {
        headers: addSecurityHeaders({
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        }),
      });
    }
  } catch (error: any) {
    console.error("[export-data] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to export data'
      }), 
      {
        status: 500,
        headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }),
      }
    );
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
