import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DOMPurify from "dompurify";
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

      // Create a temporary container for HTML rendering with DOMPurify sanitization
      const container = document.createElement('div');
      // Sanitize HTML to prevent XSS - allow only safe tags for PDF rendering
      container.innerHTML = DOMPurify.sanitize(data.html, {
        ALLOWED_TAGS: ['html', 'head', 'body', 'meta', 'title', 'style', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br'],
        ALLOWED_ATTR: ['style', 'href', 'class', 'id', 'charset'],
        ALLOW_DATA_ATTR: false
      });
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      document.body.appendChild(container);

      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= 297; // A4 height in mm

      // Add additional pages if content is longer
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= 297;
      }

      // Download PDF
      pdf.save(`osint-enriched-report-${scanId.slice(0, 8)}.pdf`);

      toast.success(`Report exported successfully! (10 credits used)`, {
        description: `${data.finding_count} findings, ${data.enrichment_count} enrichments`
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast.error("Failed to export report");
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
