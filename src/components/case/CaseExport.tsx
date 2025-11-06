import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CaseExportProps {
  caseId: string;
}

export function CaseExport({ caseId }: CaseExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportForensic = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-case", {
        body: { caseId },
      });

      if (error) throw error;

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data.package, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forensic-package-${caseId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Forensic package exported with chain of custody");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export case");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExportForensic}
      loading={isExporting}
      variant="outline"
      size="sm"
    >
      <Package className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export Forensic Package"}
    </Button>
  );
}
