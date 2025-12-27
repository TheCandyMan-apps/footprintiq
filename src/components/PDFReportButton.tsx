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
      
      // Privacy Score Card
      yPos += 10;
      const privacyScore = scan.privacy_score || 0;
      const scoreColor = privacyScore < 40 
        ? PDF_COLORS.success 
        : privacyScore <= 70 
        ? { r: 202, g: 138, b: 4 } // warning
        : PDF_COLORS.danger;
      
      yPos = addStatCard(doc, [
        { label: 'Privacy Score', value: `${privacyScore}/100`, color: scoreColor },
        { label: 'Total Sources', value: scan.total_sources_found || 0 },
        { label: 'High Risk', value: scan.high_risk_count || 0, color: PDF_COLORS.danger },
        { label: 'Medium Risk', value: scan.medium_risk_count || 0, color: { r: 202, g: 138, b: 4 } },
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
      
      // Data Sources Table
      if (scan.data_sources && scan.data_sources.length > 0) {
        yPos = checkPageBreak(doc, yPos, 80);
        yPos = addSectionHeader(doc, 'Data Sources Found', yPos + 15);
        
        const tableData = scan.data_sources.slice(0, 20).map((source: any) => [
          source.name || 'Unknown',
          source.category || 'General',
          source.risk_level || 'Unknown',
          (source.data_found?.join(", ") || "—").substring(0, 40),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Source", "Category", "Risk Level", "Data Found"]],
          body: tableData,
          ...getTableStyles(),
        });
        
        // Show count if more sources exist
        if (scan.data_sources.length > 20) {
          const finalY = (doc as any).lastAutoTable.finalY;
          setFont(doc, 'small');
          setColor(doc, PDF_COLORS.slate500);
          doc.text(`... and ${scan.data_sources.length - 20} more sources`, PDF_SPACING.margin, finalY + 10);
        }
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
