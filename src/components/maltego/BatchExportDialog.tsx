import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileJson, FileSpreadsheet, Image, Package, Loader2, Download } from 'lucide-react';
import { batchExport, exportToZip } from '@/lib/maltegoExport';
import { toast } from 'sonner';

interface MaltegoScan {
  id: string;
  entity: string;
  created_at: string;
  results: any;
  scan_type: string;
}

interface BatchExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scans: MaltegoScan[];
}

export function BatchExportDialog({ open, onOpenChange, scans }: BatchExportDialogProps) {
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'png'>('json');
  const [useZip, setUseZip] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSelectAll = () => {
    if (selectedScans.size === scans.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(scans.map(s => s.id)));
    }
  };

  const handleToggleScan = (scanId: string) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(scanId)) {
      newSelected.delete(scanId);
    } else {
      newSelected.add(scanId);
    }
    setSelectedScans(newSelected);
  };

  const handleExport = async () => {
    if (selectedScans.size === 0) {
      toast.error('Please select at least one scan to export');
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      const selectedData = scans
        .filter(scan => selectedScans.has(scan.id))
        .map(scan => scan.results)
        .filter(Boolean);

      if (useZip && exportFormat !== 'png') {
        // Export as ZIP
        await exportToZip(
          selectedData,
          exportFormat,
          `maltego-batch-${new Date().toISOString().split('T')[0]}.zip`
        );
        toast.success(`Exported ${selectedScans.size} graphs as ZIP`);
      } else {
        // Individual exports
        await batchExport(
          selectedData.map(data => ({ data })),
          exportFormat,
          (current, total) => {
            setProgress((current / total) * 100);
          }
        );
        toast.success(`Exported ${selectedScans.size} graphs`);
      }

      onOpenChange(false);
      setSelectedScans(new Set());
      setProgress(0);
    } catch (error: any) {
      console.error('[BatchExport] Error:', error);
      toast.error(error.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Batch Export Maltego Graphs</DialogTitle>
          <DialogDescription>
            Select scans and export format to download multiple graphs at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="format-json" />
                <Label htmlFor="format-json" className="flex items-center gap-2 cursor-pointer">
                  <FileJson className="h-4 w-4" />
                  JSON (Graph Data)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="format-csv" />
                <Label htmlFor="format-csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (Nodes & Edges)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="format-png" disabled />
                <Label htmlFor="format-png" className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                  <Image className="h-4 w-4" />
                  PNG (Not available for batch)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* ZIP Option */}
          {exportFormat !== 'png' && (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="use-zip"
                checked={useZip}
                onCheckedChange={(checked) => setUseZip(checked as boolean)}
              />
              <Label htmlFor="use-zip" className="flex items-center gap-2 cursor-pointer">
                <Package className="h-4 w-4" />
                Bundle as ZIP archive
              </Label>
            </div>
          )}

          {/* Scan Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Select Scans ({selectedScans.size}/{scans.length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedScans.size === scans.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg p-2">
              <div className="space-y-2">
                {scans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No Maltego scans available
                  </div>
                ) : (
                  scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={scan.id}
                        checked={selectedScans.has(scan.id)}
                        onCheckedChange={() => handleToggleScan(scan.id)}
                      />
                      <Label
                        htmlFor={scan.id}
                        className="flex-1 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{scan.entity}</span>
                          <Badge variant="secondary" className="text-xs">
                            {scan.results?.nodes?.length || 0} nodes
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(scan.created_at).toLocaleDateString()} at{' '}
                          {new Date(scan.created_at).toLocaleTimeString()}
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exporting...</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedScans.size === 0 || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {selectedScans.size} Graph{selectedScans.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
