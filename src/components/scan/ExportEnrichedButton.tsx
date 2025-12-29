import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useResultsGating } from "@/components/billing/GatedContent";
import { useNavigate } from "react-router-dom";

interface ExportEnrichedButtonProps {
  scanId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportEnrichedButton({ scanId, variant = "default", size = "default" }: ExportEnrichedButtonProps) {
  const { workspace } = useWorkspace();
  const [isExporting, setIsExporting] = useState(false);
  const { canExportDetails } = useResultsGating();
  const navigate = useNavigate();

  const handleExport = async () => {
    if (!canExportDetails) {
      toast.error("Export requires Pro plan", {
        action: {
          label: "Upgrade",
          onClick: () => navigate("/settings/billing"),
        },
      });
      return;
    }

    if (!workspace?.id) {
      toast.error("No workspace selected");
      return;
    }

    setIsExporting(true);

    try {
      console.log('[Export] Fetching enriched report data for scan:', scanId);
      
      const { data, error } = await supabase.functions.invoke('export-enriched-report', {
        body: {
          scanId,
          workspaceId: workspace.id
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'insufficient_credits') {
          toast.error(`Insufficient credits. Need 10 credits, have ${data.balance}`);
        } else {
          toast.error(`Export failed: ${data.error}`);
        }
        return;
      }

      console.log('[Export] Received data, generating PDF directly');
      
      // Generate PDF directly using jsPDF instead of html2canvas (much faster and more reliable)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FootprintIQ', margin, 15);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('OSINT Intelligence Report', margin, 23);
      
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleString()} | Scan: ${scanId.slice(0, 8)}...`, margin, 30);

      yPos = 45;

      // Summary section
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scan Summary', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Profiles Found: ${data.profile_count || 0}`, margin, yPos);
      yPos += 5;
      pdf.text(`Findings: ${data.finding_count || 0}`, margin, yPos);
      yPos += 5;
      pdf.text(`Enrichments: ${data.enrichment_count || 0}`, margin, yPos);
      yPos += 5;
      pdf.text(`Credits Used: ${data.credits_spent || 10}`, margin, yPos);
      yPos += 15;

      // Parse profiles from HTML data or use raw data
      // Since we have the edge function data, we can extract info
      const profileCount = data.profile_count || 0;
      const findingCount = data.finding_count || 0;

      // Profiles section
      if (profileCount > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Social Media Profiles (${profileCount})`, margin, yPos);
        yPos += 10;

        // Add note about full details
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(107, 114, 128);
        pdf.text('For detailed profile information, see the dashboard view.', margin, yPos);
        yPos += 10;
        pdf.setTextColor(31, 41, 55);
      }

      // Findings table
      if (findingCount > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Findings Summary (${findingCount})`, margin, yPos);
        yPos += 8;

        // Create a simple findings summary table
        autoTable(pdf, {
          startY: yPos,
          head: [['Metric', 'Count']],
          body: [
            ['Total Profiles', String(profileCount)],
            ['Total Findings', String(findingCount)],
            ['Enrichments Applied', String(data.enrichment_count || 0)],
          ],
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: margin, right: margin },
        });

        yPos = (pdf as any).lastAutoTable.finalY + 15;
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(
          `Page ${i} of ${pageCount} | FootprintIQ OSINT Report | Confidential`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Download PDF
      pdf.save(`osint-enriched-report-${scanId.slice(0, 8)}.pdf`);

      console.log('[Export] PDF generated successfully');
      toast.success(`Report exported successfully! (10 credits used)`, {
        description: `${data.finding_count} findings, ${data.enrichment_count} enrichments`
      });

    } catch (error: any) {
      console.error('[Export] Error:', error);
      toast.error(`Failed to export report: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Show gated state for free users
  if (!canExportDetails) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => navigate("/settings/billing")}
        className="gap-2 text-muted-foreground"
      >
        <Lock className="h-4 w-4" />
        Export Report
        <span className="text-xs text-primary ml-1">Pro</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isExporting ? "Exporting..." : "Export Report (10 credits)"}
    </Button>
  );
}
