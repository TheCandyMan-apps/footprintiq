import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PDFReportButtonProps {
  scanId: string;
}

export function PDFReportButton({ scanId }: PDFReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf-report", {
        body: { scanId },
      });

      if (error) throw error;

      const scan = data.scan;
      
      // Create PDF
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("FootprintIQ Privacy Report", 20, 25);
      
      // Privacy Score
      doc.setFontSize(16);
      doc.text(`Privacy Score: ${scan.privacy_score || "N/A"}`, 20, 50);
      
      // Summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text("Summary", 20, 65);
      doc.setFontSize(10);
      doc.text(`Total Sources: ${scan.total_sources_found}`, 20, 72);
      doc.text(`High Risk: ${scan.high_risk_count} | Medium: ${scan.medium_risk_count} | Low: ${scan.low_risk_count}`, 20, 78);
      
      // Data Sources Table
      if (scan.data_sources && scan.data_sources.length > 0) {
        const tableData = scan.data_sources.map((source: any) => [
          source.name,
          source.category,
          source.risk_level,
          source.data_found?.join(", ") || "N/A",
        ]);

        autoTable(doc, {
          startY: 90,
          head: [["Source", "Category", "Risk", "Data Found"]],
          body: tableData,
          theme: "striped",
        });
      }
      
      // Save PDF
      doc.save(`footprintiq-report-${scanId}.pdf`);
      
      toast({ title: "Success", description: "PDF report generated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={generatePDF} loading={loading} variant="outline">
      <FileText className="h-4 w-4" />
      {loading ? "Generating..." : "Download PDF"}
    </Button>
  );
}
