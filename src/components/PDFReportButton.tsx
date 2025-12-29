import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  addCoverPage, 
  addSectionHeader, 
  addStatCard, 
  addPageFooters,
  addPageHeader,
  checkPageBreak,
  getTableStyles,
  PDF_COLORS,
  setFont,
  setColor,
  PDF_SPACING,
  SEVERITY_COLORS,
  type PDFBranding,
} from "@/lib/pdfStyles";

interface PDFReportButtonProps {
  scanId: string;
}

export function PDFReportButton({ scanId }: PDFReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setLoading(true);
    
    toast({ 
      title: "Preparing Report...", 
      description: "Generating your privacy report" 
    });

    try {
      console.log(`[Export] Generating privacy report for scan ${scanId}`);
      const { data, error } = await supabase.functions.invoke("generate-pdf-report", {
        body: { scanId },
      });

      if (error) throw error;

      const scan = data.scan;
      const stats = data.stats || {};
      const findings = scan.findings || [];
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Determine target
      const target = scan.username || scan.email || scan.phone || 'N/A';
      
      // Cover Page
      addCoverPage(doc, {
        title: 'Privacy Assessment Report',
        subtitle: 'Digital Footprint Analysis',
        target: target,
        scanId: scanId,
        date: new Date(),
        branding: {
          companyName: 'FootprintIQ',
          tagline: 'Open Source Intelligence Platform',
        },
      });
      
      // Executive Summary Page
      doc.addPage();
      let yPos = addPageHeader(doc, 'Executive Summary');
      
      // Privacy Score Card - use stats from edge function
      yPos += 10;
      const privacyScore = scan.privacy_score || 0;
      const totalFindings = stats.totalFindings || findings.length || 0;
      const highRiskCount = stats.highRiskCount || 0;
      const mediumRiskCount = stats.mediumRiskCount || 0;
      
      const scoreColor = privacyScore < 40 
        ? PDF_COLORS.success 
        : privacyScore <= 70 
        ? { r: 202, g: 138, b: 4 } // warning
        : PDF_COLORS.danger;
      
      yPos = addStatCard(doc, [
        { label: 'Privacy Score', value: `${privacyScore}/100`, color: scoreColor },
        { label: 'Total Findings', value: totalFindings },
        { label: 'High Risk', value: highRiskCount, color: PDF_COLORS.danger },
        { label: 'Medium Risk', value: mediumRiskCount, color: { r: 202, g: 138, b: 4 } },
      ], yPos);
      
      // Risk Assessment
      yPos = addSectionHeader(doc, 'Risk Assessment', yPos + 10);
      
      setFont(doc, 'body');
      setColor(doc, PDF_COLORS.slate700);
      
      const riskText = privacyScore < 40 
        ? 'Low risk — Your digital footprint is well protected with minimal exposure detected.'
        : privacyScore <= 70 
        ? 'Medium risk — Some areas need attention. Review the findings below for recommended actions.'
        : 'High risk — Immediate action recommended. Multiple exposure points detected.';
      
      const riskLines = doc.splitTextToSize(riskText, pageWidth - 40);
      riskLines.forEach((line: string) => {
        doc.text(line, PDF_SPACING.margin, yPos);
        yPos += 6;
      });
      
      // Findings Table - use actual findings from response
      if (findings.length > 0) {
        yPos = checkPageBreak(doc, yPos, 80);
        yPos = addSectionHeader(doc, 'Findings Detail', yPos + 15);
        
        // Group findings by provider for better organization
        const tableData = findings.slice(0, 30).map((finding: any) => {
          // Extract site/platform from evidence if available
          const evidence = Array.isArray(finding.evidence) ? finding.evidence : [];
          const siteEvidence = evidence.find((e: any) => e.key === 'site' || e.key === 'platform');
          const urlEvidence = evidence.find((e: any) => e.key === 'url');
          
          const displayName = siteEvidence?.value || finding.kind || 'Finding';
          const displayUrl = urlEvidence?.value || '';
          
          return [
            finding.provider || 'Unknown',
            displayName.substring(0, 25),
            finding.severity || 'unknown',
            `${Math.round((finding.confidence || 0) * 100)}%`,
            displayUrl.substring(0, 30) || '—',
          ];
        });

        autoTable(doc, {
          startY: yPos,
          head: [["Provider", "Finding", "Severity", "Confidence", "URL"]],
          body: tableData,
          ...getTableStyles(),
        });
        
        // Show count if more findings exist
        if (findings.length > 30) {
          const finalY = (doc as any).lastAutoTable.finalY;
          setFont(doc, 'small');
          setColor(doc, PDF_COLORS.slate500);
          doc.text(`... and ${findings.length - 30} more findings`, PDF_SPACING.margin, finalY + 10);
        }
      } else {
        yPos += 20;
        setFont(doc, 'body');
        setColor(doc, PDF_COLORS.slate500);
        doc.text('No findings data available for this scan.', PDF_SPACING.margin, yPos);
      }
      
      // Add professional footers
      addPageFooters(doc, { companyName: 'FootprintIQ' });
      
      // Save PDF
      doc.save(`footprintiq-privacy-report-${scanId.substring(0, 8)}.pdf`);
      
      console.log('[Export] Privacy report PDF generated successfully');
      toast({ 
        title: "Report Generated", 
        description: "PDF report downloaded successfully" 
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      const errorMsg = error?.message || 'Unknown error occurred';
      toast({ 
        title: "Export Failed", 
        description: `Could not generate PDF: ${errorMsg}`, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={generatePDF} disabled={loading} variant="outline" className="gap-2">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}
