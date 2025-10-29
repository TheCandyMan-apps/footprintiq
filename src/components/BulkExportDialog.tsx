import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { exportAsJSON, exportAsCSV, exportAsPDF } from "@/lib/exports";

interface BulkExportDialogProps {
  findings: any[];
  onExport?: () => void;
}

export function BulkExportDialog({ findings, onExport }: BulkExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"json" | "csv" | "pdf">("json");
  const [redactPII, setRedactPII] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (findings.length === 0) {
      toast.error("No findings to export");
      return;
    }

    setExporting(true);
    try {
      switch (format) {
        case "json":
          exportAsJSON(findings, redactPII);
          break;
        case "csv":
          exportAsCSV(findings, redactPII);
          break;
        case "pdf":
          await exportAsPDF(findings, redactPII);
          break;
      }

      toast.success(`Exported ${findings.length} findings as ${format.toUpperCase()}`);
      setOpen(false);
      onExport?.();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export findings");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Bulk Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Findings</DialogTitle>
          <DialogDescription>
            Export {findings.length} findings in your preferred format
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <FileJson className="h-4 w-4" />
                  JSON (structured data)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (spreadsheet)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  PDF (report)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="redact"
                checked={redactPII}
                onCheckedChange={(checked) => setRedactPII(checked === true)}
              />
              <Label htmlFor="redact" className="cursor-pointer">
                Redact PII (emails, phones)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
              />
              <Label htmlFor="metadata" className="cursor-pointer">
                Include metadata
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
