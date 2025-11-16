import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  hexToRgb, 
  addPageNumbers, 
  addBrandedHeader, 
  wrapText, 
  formatProviderTimeline,
  checkAddPage,
  type BrandingSettings 
} from "@/lib/pdfHelpers";

interface ComprehensivePDFReportProps {
  scanId: string;
}

export function ComprehensivePDFReport({ scanId }: ComprehensivePDFReportProps) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");

  const generatePDF = async () => {
    setGenerating(true);
    setProgress("Fetching report data...");

    try {
      // Fetch comprehensive report data
      const { data, error } = await supabase.functions.invoke("generate-comprehensive-report", {
        body: { scanId },
      });

      if (error) throw error;

      setProgress("Building PDF document...");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 40;

      const branding: BrandingSettings = data.branding || {};
      const primaryColor = branding.primary_color || "#8b5cf6";
      const secondaryColor = branding.secondary_color || "#ec4899";

      // ========== COVER PAGE ==========
      setProgress("Creating cover page...");

      // Header background
      const [r, g, b] = hexToRgb(primaryColor);
      doc.setFillColor(r, g, b);
      doc.rect(0, 0, pageWidth, 80, "F");

      // Company name/logo
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text(
        branding.company_name || "FootprintIQ",
        pageWidth / 2,
        30,
        { align: "center" }
      );

      // Report title
      doc.setFontSize(32);
      doc.text("OSINT Intelligence Report", pageWidth / 2, 55, { align: "center" });

      // Reset colors
      doc.setTextColor(0, 0, 0);
      yPos = 100;

      // Scan metadata
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Scan Details", 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Target: ${data.scan.username || data.scan.email || data.scan.phone || "N/A"}`, 20, yPos);
      yPos += 7;
      doc.text(`Scan Type: ${data.scan.scan_type}`, 20, yPos);
      yPos += 7;
      doc.text(`Scan ID: ${data.scan.id}`, 20, yPos);
      yPos += 7;
      doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, 20, yPos);
      yPos += 15;

      // Confidential watermark
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text("CONFIDENTIAL - For Internal Use Only", pageWidth / 2, 280, { align: "center" });

      // ========== EXECUTIVE SUMMARY PAGE ==========
      doc.addPage();
      yPos = 40;

      setProgress("Adding executive summary...");

      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", 20, yPos);
      yPos += 12;

      // AI Summary
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const summaryLines = wrapText(doc, data.aiSummary, pageWidth - 40);
      summaryLines.forEach((line: string) => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });
      yPos += 10;

      // Statistics grid
      doc.setFont("helvetica", "bold");
      doc.text("Key Statistics", 20, yPos);
      yPos += 10;

      const stats = [
        ["Total Findings", data.stats.totalFindings.toString()],
        ["Critical", data.stats.critical.toString()],
        ["High", data.stats.high.toString()],
        ["Medium", data.stats.medium.toString()],
        ["Low", data.stats.low.toString()],
        ["Providers Executed", data.stats.providersExecuted.toString()],
        ["False Positive Rate", `${data.stats.falsePositiveRate}%`],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: stats,
        theme: "striped",
        headStyles: { fillColor: hexToRgb(primaryColor) },
        margin: { left: 20, right: 20 },
      });

      // ========== KEY FINDINGS SECTION ==========
      doc.addPage();
      yPos = 40;

      setProgress("Organizing findings...");

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Key Findings", 20, yPos);
      yPos += 15;

      // Group findings by severity
      const severityOrder = ["critical", "high", "medium", "low", "info"];
      
      for (const severity of severityOrder) {
        const severityFindings = data.findings.filter((f: any) => f.severity === severity);
        
        if (severityFindings.length === 0) continue;

        yPos = checkAddPage(doc, yPos, 40);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const severityColors: Record<string, string> = {
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#3b82f6",
          info: "#64748b",
        };
        const [sr, sg, sb] = hexToRgb(severityColors[severity]);
        doc.setTextColor(sr, sg, sb);
        doc.text(`${severity.toUpperCase()} (${severityFindings.length})`, 20, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 10;

        // Show top 10 findings per severity
        const topFindings = severityFindings.slice(0, 10);
        
        topFindings.forEach((finding: any, index: number) => {
          yPos = checkAddPage(doc, yPos, 30);

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${finding.provider} - ${finding.kind}`, 25, yPos);
          yPos += 6;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          
          if (finding.description) {
            const descLines = wrapText(doc, finding.description, pageWidth - 50);
            descLines.forEach((line: string) => {
              yPos = checkAddPage(doc, yPos, 6);
              doc.text(line, 25, yPos);
              yPos += 5;
            });
          }

          // AI annotations
          if (finding.meta?.ai) {
            doc.setFontSize(9);
            doc.setTextColor(128, 128, 128);
            const annotations: string[] = [];
            if (finding.meta.ai.falsePositive) annotations.push("False Positive");
            if (finding.meta.ai.priority) annotations.push(`Priority: ${finding.meta.ai.priority}`);
            if (finding.meta.ai.confidenceOverride) annotations.push(`Confidence: ${finding.meta.ai.confidenceOverride}%`);
            
            if (annotations.length > 0) {
              yPos = checkAddPage(doc, yPos, 5);
              doc.text(`AI: ${annotations.join(", ")}`, 25, yPos);
              yPos += 5;
            }
            doc.setTextColor(0, 0, 0);
          }

          yPos += 5;
        });

        if (severityFindings.length > 10) {
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text(`... and ${severityFindings.length - 10} more ${severity} findings`, 25, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 10;
        }
      }

      // ========== PROVIDER TIMELINE APPENDIX ==========
      if (data.providerEvents && data.providerEvents.length > 0) {
        doc.addPage();
        yPos = 40;

        setProgress("Adding provider timeline...");

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Appendix A: Provider Timeline", 20, yPos);
        yPos += 15;

        const timelineData = formatProviderTimeline(data.providerEvents);
        
        autoTable(doc, {
          startY: yPos,
          head: [["Provider", "Status", "Duration", "Results"]],
          body: timelineData.map((row: any) => [
            row.provider,
            row.status,
            row.duration,
            row.results.toString(),
          ]),
          theme: "striped",
          headStyles: { fillColor: hexToRgb(secondaryColor) },
          margin: { left: 20, right: 20 },
        });
      }

      // ========== ACTIVITY LOGS APPENDIX ==========
      if (data.activityLogs && data.activityLogs.length > 0) {
        doc.addPage();
        yPos = 40;

        setProgress("Adding activity logs...");

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Appendix B: Activity Logs", 20, yPos);
        yPos += 15;

        autoTable(doc, {
          startY: yPos,
          head: [["Time", "Action", "Entity", "User"]],
          body: data.activityLogs.slice(0, 50).map((log: any) => [
            new Date(log.created_at).toLocaleString(),
            log.action,
            `${log.entity_type}${log.entity_id ? `: ${log.entity_id.substring(0, 8)}...` : ""}`,
            log.profiles?.email || log.user_id.substring(0, 8) + "...",
          ]),
          theme: "striped",
          headStyles: { fillColor: hexToRgb(secondaryColor) },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 },
        });
      }

      // ========== ADD PAGE NUMBERS ==========
      setProgress("Finalizing PDF...");
      addPageNumbers(doc, branding);

      // ========== SAVE PDF ==========
      const fileName = `OSINT_Report_${data.scan.username || "scan"}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      toast.success("Comprehensive report generated successfully!");
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast.error(`Failed to generate report: ${error.message}`);
    } finally {
      setGenerating(false);
      setProgress("");
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={generating}
      variant="default"
      size="sm"
      className="gap-2"
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress}
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Generate Full Report (PDF)
        </>
      )}
    </Button>
  );
}
