import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  addCoverPage,
  addSectionHeader,
  addSubsectionHeader,
  addStatCard,
  addPageFooters,
  addPageHeader,
  checkPageBreak,
  getTableStyles,
  addSeverityBadge,
  PDF_COLORS,
  SEVERITY_COLORS,
  setFont,
  setColor,
  PDF_SPACING,
  type PDFBranding,
} from "@/lib/pdfStyles";
import { 
  wrapText, 
  formatProviderTimeline,
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

      const branding: PDFBranding = {
        companyName: data.branding?.company_name || 'FootprintIQ',
        primaryColor: data.branding?.primary_color || '#2563eb',
        secondaryColor: data.branding?.secondary_color || '#0891b2',
        tagline: 'Open Source Intelligence Platform',
      };
      
      const target = data.scan.username || data.scan.email || data.scan.phone || 'N/A';

      // ========== COVER PAGE ==========
      setProgress("Creating cover page...");
      
      addCoverPage(doc, {
        title: 'OSINT Intelligence Report',
        subtitle: 'Comprehensive Analysis',
        target: target,
        scanId: data.scan.id,
        date: new Date(data.generatedAt),
        branding,
      });

      // ========== EXECUTIVE SUMMARY PAGE ==========
      doc.addPage();
      let yPos = addPageHeader(doc, 'Executive Summary', branding);

      setProgress("Adding executive summary...");

      // Statistics cards
      yPos += 5;
      yPos = addStatCard(doc, [
        { label: 'Total Findings', value: data.stats.totalFindings },
        { label: 'Critical', value: data.stats.critical, color: PDF_COLORS.danger },
        { label: 'High', value: data.stats.high, color: SEVERITY_COLORS.high },
        { label: 'Medium', value: data.stats.medium, color: PDF_COLORS.warning },
      ], yPos);

      yPos = addStatCard(doc, [
        { label: 'Low', value: data.stats.low, color: PDF_COLORS.info },
        { label: 'Providers', value: data.stats.providersExecuted },
        { label: 'False Positive Rate', value: `${data.stats.falsePositiveRate}%` },
      ], yPos + 5);

      // AI Summary
      yPos = checkPageBreak(doc, yPos, 60);
      yPos = addSectionHeader(doc, 'Analysis Summary', yPos + 10, { primaryColor: PDF_COLORS.primary });
      
      setFont(doc, 'body');
      setColor(doc, PDF_COLORS.slate700);
      const summaryLines = wrapText(doc, data.aiSummary || 'No summary available.', pageWidth - 40);
      summaryLines.forEach((line: string) => {
        yPos = checkPageBreak(doc, yPos, 8);
        doc.text(line, PDF_SPACING.margin, yPos);
        yPos += 6;
      });

      // ========== KEY FINDINGS SECTION ==========
      doc.addPage();
      yPos = addPageHeader(doc, 'Key Findings', branding);

      setProgress("Organizing findings...");

      // Group findings by severity
      const severityOrder = ["critical", "high", "medium", "low", "info"] as const;
      
      for (const severity of severityOrder) {
        const severityFindings = data.findings.filter((f: any) => f.severity === severity);
        
        if (severityFindings.length === 0) continue;

        yPos = checkPageBreak(doc, yPos, 50);
        
        // Severity header with badge
        const severityColor = SEVERITY_COLORS[severity] || PDF_COLORS.slate500;
        doc.setFillColor(severityColor.r, severityColor.g, severityColor.b);
        doc.rect(PDF_SPACING.margin, yPos - 2, 4, 12, 'F');
        
        setFont(doc, 'heading3');
        setColor(doc, PDF_COLORS.slate900);
        doc.text(`${severity.charAt(0).toUpperCase() + severity.slice(1)} Findings`, PDF_SPACING.margin + 10, yPos + 6);
        
        setFont(doc, 'small');
        setColor(doc, PDF_COLORS.slate500);
        doc.text(`(${severityFindings.length})`, PDF_SPACING.margin + 10 + doc.getTextWidth(`${severity.charAt(0).toUpperCase() + severity.slice(1)} Findings `) + 5, yPos + 6);
        
        yPos += 20;

        // Show top 10 findings per severity
        const topFindings = severityFindings.slice(0, 10);
        
        topFindings.forEach((finding: any, index: number) => {
          yPos = checkPageBreak(doc, yPos, 35);

          // Finding card background
          doc.setFillColor(248, 250, 252); // slate-50
          doc.roundedRect(PDF_SPACING.margin, yPos - 3, pageWidth - 40, 25, 2, 2, 'F');
          
          setFont(doc, 'bodyBold');
          setColor(doc, PDF_COLORS.slate900);
          doc.text(`${index + 1}. ${finding.provider || 'Unknown'} — ${finding.kind || 'Finding'}`, PDF_SPACING.margin + 5, yPos + 5);

          if (finding.description) {
            setFont(doc, 'small');
            setColor(doc, PDF_COLORS.slate600);
            const descLines = wrapText(doc, finding.description, pageWidth - 55);
            doc.text(descLines[0] + (descLines.length > 1 ? '...' : ''), PDF_SPACING.margin + 5, yPos + 14);
          }

          // AI annotations
          if (finding.meta?.ai) {
            setFont(doc, 'caption');
            setColor(doc, PDF_COLORS.slate400);
            const annotations: string[] = [];
            if (finding.meta.ai.falsePositive) annotations.push("FP");
            if (finding.meta.ai.priority) annotations.push(`P: ${finding.meta.ai.priority}`);
            if (annotations.length > 0) {
              doc.text(`AI: ${annotations.join(", ")}`, pageWidth - PDF_SPACING.margin - 5, yPos + 5, { align: 'right' });
            }
          }

          yPos += 30;
        });

        if (severityFindings.length > 10) {
          setFont(doc, 'small');
          setColor(doc, PDF_COLORS.slate400);
          doc.text(`+ ${severityFindings.length - 10} more ${severity} findings`, PDF_SPACING.margin + 10, yPos);
          yPos += 15;
        }
      }

      // ========== PROVIDER TIMELINE APPENDIX ==========
      if (data.providerEvents && data.providerEvents.length > 0) {
        doc.addPage();
        yPos = addPageHeader(doc, 'Appendix A: Provider Timeline', branding);

        setProgress("Adding provider timeline...");

        const timelineData = formatProviderTimeline(data.providerEvents);
        
        autoTable(doc, {
          startY: yPos,
          head: [["Provider", "Status", "Duration", "Results"]],
          body: timelineData.map((row: any) => [
            row.provider,
            row.status.charAt(0).toUpperCase() + row.status.slice(1),
            row.duration,
            row.results.toString(),
          ]),
          ...getTableStyles(PDF_COLORS.primary),
        });
      }

      // ========== ACTIVITY LOGS APPENDIX ==========
      if (data.activityLogs && data.activityLogs.length > 0) {
        doc.addPage();
        yPos = addPageHeader(doc, 'Appendix B: Activity Logs', branding);

        setProgress("Adding activity logs...");

        autoTable(doc, {
          startY: yPos,
          head: [["Time", "Action", "Entity", "User"]],
          body: data.activityLogs.slice(0, 50).map((log: any) => [
            new Date(log.created_at).toLocaleString(),
            log.action,
            `${log.entity_type}${log.entity_id ? `: ${log.entity_id.substring(0, 8)}...` : ""}`,
            log.profiles?.email || log.user_id?.substring(0, 8) + "..." || "—",
          ]),
          ...getTableStyles(PDF_COLORS.primary),
        });
      }

      // ========== ADD PAGE FOOTERS ==========
      setProgress("Finalizing PDF...");
      addPageFooters(doc, branding);

      // ========== SAVE PDF ==========
      const fileName = `OSINT_Report_${target.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
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
