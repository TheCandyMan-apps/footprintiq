import { useState, useCallback } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Papa from "papaparse";
import { toast } from "sonner";

interface BatchUploadProps {
  onBatchLoaded: (items: string[]) => void;
  scanType: string;
  maxItems?: number;
}

export const BatchUpload = ({ onBatchLoaded, scanType, maxItems = 10 }: BatchUploadProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);

  const validateItem = (item: string): boolean => {
    if (!item || item.trim().length === 0) return false;
    
    switch (scanType) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item);
      case 'ip':
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(item);
      case 'username':
        return /^[a-zA-Z0-9_-]{3,30}$/.test(item);
      case 'phone':
        return /^\+?[1-9]\d{1,14}$/.test(item);
      default:
        return true;
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        try {
          // Extract all values from first column
          const items: string[] = [];
          const errors: string[] = [];

          results.data.forEach((row: any, index) => {
            const value = Array.isArray(row) ? row[0] : row[Object.keys(row)[0]];
            if (value && typeof value === 'string') {
              const trimmed = value.trim();
              if (validateItem(trimmed)) {
                if (items.length < maxItems) {
                  items.push(trimmed);
                }
              } else {
                errors.push(`Row ${index + 1}: Invalid ${scanType}`);
              }
            }
          });

          if (items.length === 0) {
            toast.error("No valid items found in CSV");
            return;
          }

          if (items.length > maxItems) {
            toast.warning(`Loaded first ${maxItems} items (limit reached)`);
          }

          if (errors.length > 0 && errors.length < 5) {
            toast.warning(`Skipped ${errors.length} invalid items`);
          }

          setFileName(file.name);
          setItemCount(items.length);
          onBatchLoaded(items);
          
          toast.success(`Loaded ${items.length} ${scanType}(s) from CSV`);
        } catch (error) {
          console.error('CSV parse error:', error);
          toast.error("Failed to parse CSV file");
        }
      },
      error: (error) => {
        console.error('CSV error:', error);
        toast.error("Failed to read CSV file");
      },
      skipEmptyLines: true
    });

    // Reset input
    event.target.value = '';
  }, [scanType, maxItems, onBatchLoaded]);

  const handleClear = () => {
    setFileName(null);
    setItemCount(0);
    onBatchLoaded([]);
    toast.info("Batch upload cleared");
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Batch Upload</h3>
          <Badge variant="secondary" className="ml-auto">Max {maxItems} items</Badge>
        </div>

        {!fileName ? (
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">Upload CSV file</p>
                <p className="text-xs text-muted-foreground">
                  One {scanType} per line in first column
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </label>
            <div className="mt-2 p-2 bg-info/10 border border-info/20 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-info shrink-0 mt-0.5" />
              <p>
                CSV format: First column should contain {scanType}s. 
                Headers are optional and will be skipped automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">{itemCount} items loaded</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
