import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { checkCredits, deductCredits } from "../_shared/credits.ts";
import JSZip from "https://esm.sh/jszip@3.10.1";
import jsPDF from "https://esm.sh/jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COST = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, selectedItems = [], workspaceId } = await req.json();

    if (!scanId || !workspaceId) {
      return new Response(
        JSON.stringify({ error: "scanId and workspaceId required" }),
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

    // Check and deduct credits
    const creditCheck = await checkCredits(workspaceId, CREDIT_COST);
    if (!creditCheck.success) {
      return new Response(
        JSON.stringify({ 
          error: creditCheck.error,
          balance: creditCheck.balance,
          required: CREDIT_COST
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct credits
    const deductResult = await deductCredits(
      workspaceId,
      CREDIT_COST,
      `Quick export evidence package for scan ${scanId}`
    );

    if (!deductResult.success) {
      return new Response(
        JSON.stringify({ error: "Failed to deduct credits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch scan data
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("*")
      .eq("id", scanId)
      .single();

    if (scanError || !scan) {
      return new Response(
        JSON.stringify({ error: "Scan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch findings
    const { data: findings } = await supabase
      .from("scan_findings")
      .select("*")
      .eq("scan_id", scanId)
      .order("created_at", { ascending: false });

    // Fetch selected case items if any
    let selectedData = [];
    if (selectedItems.length > 0) {
      const { data } = await supabase
        .from("case_items")
        .select("*")
        .in("id", selectedItems);
      selectedData = data || [];
    }

    // Create ZIP
    const zip = new JSZip();

    // 1. Add scan data JSON
    const scanDataJson = {
      scan,
      findings: findings || [],
      selectedItems: selectedData,
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
    };
    zip.file("scan-data.json", JSON.stringify(scanDataJson, null, 2));

    // 2. Add findings CSV
    const csvContent = generateCSV(findings || []);
    zip.file("findings.csv", csvContent);

    // 3. Generate PDF summary
    const pdf = new jsPDF();
    generatePDFSummary(pdf, scan, findings || [], selectedData);
    const pdfBlob = pdf.output("arraybuffer");
    zip.file("case-summary.pdf", pdfBlob);

    // 4. Add manifest
    const manifest = {
      exportType: "quick-evidence-package",
      scanId,
      workspaceId,
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      creditsCost: CREDIT_COST,
      fileCount: 3,
      findingsCount: (findings || []).length,
      selectedItemsCount: selectedData.length,
    };
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // Generate ZIP
    const zipData = await zip.generateAsync({ type: "base64" });

    return new Response(
      JSON.stringify({ zipData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Export error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateCSV(findings: any[]): string {
  const headers = ["ID", "Title", "Severity", "Type", "Provider", "Created At", "URL"];
  const rows = findings.map((f) => [
    f.id,
    escapeCsv(f.title || ""),
    f.severity || "",
    f.type || "",
    f.provider || "",
    f.created_at || "",
    f.url || "",
  ]);

  return [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generatePDFSummary(pdf: any, scan: any, findings: any[], selectedItems: any[]): void {
  let yPos = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text("Evidence Package - Case Summary", 20, yPos);
  yPos += 15;

  // Scan Info
  pdf.setFontSize(12);
  pdf.text(`Scan ID: ${scan.id}`, 20, yPos);
  yPos += 8;
  pdf.text(`Created: ${new Date(scan.created_at).toLocaleString()}`, 20, yPos);
  yPos += 8;
  pdf.text(`Username: ${scan.username || "N/A"}`, 20, yPos);
  yPos += 15;

  // Summary Statistics
  pdf.setFontSize(14);
  pdf.text("Summary Statistics", 20, yPos);
  yPos += 10;
  pdf.setFontSize(11);
  pdf.text(`Total Findings: ${findings.length}`, 25, yPos);
  yPos += 7;
  
  const severityCounts = findings.reduce((acc, f) => {
    acc[f.severity || "unknown"] = (acc[f.severity || "unknown"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(severityCounts).forEach(([severity, count]) => {
    pdf.text(`  ${severity}: ${count}`, 25, yPos);
    yPos += 6;
  });

  yPos += 10;
  pdf.text(`Selected Items: ${selectedItems.length}`, 25, yPos);
  yPos += 15;

  // Top Findings
  pdf.setFontSize(14);
  pdf.text("Top 10 Findings", 20, yPos);
  yPos += 10;
  pdf.setFontSize(9);

  findings.slice(0, 10).forEach((finding, idx) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }
    pdf.text(`${idx + 1}. ${finding.title || "Untitled"} [${finding.severity || "unknown"}]`, 25, yPos);
    yPos += 6;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.text(
    `Generated on ${new Date().toLocaleString()} | FootprintIQ Evidence Package`,
    20,
    pdf.internal.pageSize.height - 10
  );
}
