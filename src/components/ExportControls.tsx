import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { Finding } from "@/lib/ufm";
import { exportAsJSON, exportAsCSV, exportAsPDF } from "@/lib/exports";
import { analytics } from "@/lib/analytics";
import { notify } from "@/lib/notifications";
import { ScheduledExportDialog } from "@/components/ScheduledExportDialog";

interface ExportControlsProps {
  findings: Finding[];
  redactPII: boolean;
  onRedactToggle: (enabled: boolean) => void;
}

export const ExportControls = ({ findings, redactPII, onRedactToggle }: ExportControlsProps) => {
  const [scheduledDialogOpen, setScheduledDialogOpen] = useState(false);

  const handleExportJSON = () => {
    exportAsJSON(findings, redactPII);
    analytics.trackEvent('export_json', { findings: findings.length, redacted: redactPII ? 1 : 0 });
    notify.exportComplete("JSON", findings.length);
  };

  const handleExportCSV = () => {
    exportAsCSV(findings, redactPII);
    analytics.trackEvent('export_csv', { findings: findings.length, redacted: redactPII ? 1 : 0 });
    notify.exportComplete("CSV", findings.length);
  };

  const handleExportPDF = async () => {
    const exportPromise = exportAsPDF(findings, redactPII);
    
    notify.promise(exportPromise, {
      loading: "Generating PDF...",
      success: () => {
        analytics.trackEvent('export_pdf', { findings: findings.length, redacted: redactPII ? 1 : 0 });
        return `PDF exported successfully (${findings.length} findings)`;
      },
      error: "Failed to export PDF"
    });
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setScheduledDialogOpen(true)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule
        </Button>
      </div>

      <ScheduledExportDialog 
        open={scheduledDialogOpen}
        onOpenChange={setScheduledDialogOpen}
      />
    </div>
  );
};
