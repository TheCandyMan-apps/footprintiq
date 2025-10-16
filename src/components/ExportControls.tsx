import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { Finding } from "@/lib/ufm";
import { exportAsJSON, exportAsCSV, exportAsPDF } from "@/lib/exports";
import { analytics } from "@/lib/analytics";
import { toast } from "sonner";

interface ExportControlsProps {
  findings: Finding[];
  redactPII: boolean;
  onRedactToggle: (enabled: boolean) => void;
}

export const ExportControls = ({ findings, redactPII, onRedactToggle }: ExportControlsProps) => {
  const handleExportJSON = () => {
    exportAsJSON(findings, redactPII);
    analytics.trackEvent('export_json', { findings: findings.length, redacted: redactPII ? 1 : 0 });
    toast.success("Exported as JSON");
  };

  const handleExportCSV = () => {
    exportAsCSV(findings, redactPII);
    analytics.trackEvent('export_csv', { findings: findings.length, redacted: redactPII ? 1 : 0 });
    toast.success("Exported as CSV");
  };

  const handleExportPDF = () => {
    exportAsPDF(findings, redactPII);
    analytics.trackEvent('export_pdf', { findings: findings.length, redacted: redactPII ? 1 : 0 });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <Switch
          id="redact-pii"
          checked={redactPII}
          onCheckedChange={onRedactToggle}
        />
        <Label htmlFor="redact-pii" className="cursor-pointer">
          <div className="font-semibold">Redact PII</div>
          <div className="text-xs text-muted-foreground">Mask emails, phones, and IPs in exports</div>
        </Label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleExportJSON}>
          <FileJson className="w-4 h-4 mr-2" />
          JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          PDF
        </Button>
      </div>
    </div>
  );
};
