import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ParsedTarget {
  type: 'email' | 'username' | 'domain' | 'phone';
  value: string;
  row: number;
}

interface BatchScanUploaderProps {
  onTargetsParsed: (targets: ParsedTarget[]) => void;
  disabled?: boolean;
}

export const BatchScanUploader = ({ onTargetsParsed, disabled }: BatchScanUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedTargets, setParsedTargets] = useState<ParsedTarget[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const detectTargetType = (value: string): ParsedTarget['type'] | null => {
    const cleaned = value.trim().toLowerCase();
    
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      return 'email';
    }
    
    // Phone (basic patterns)
    if (/^[\d\s\-\+\(\)]{10,}$/.test(cleaned)) {
      return 'phone';
    }
    
    // Domain
    if (/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(cleaned)) {
      return 'domain';
    }
    
    // Username (alphanumeric with underscores/dots)
    if (/^[a-z0-9_\.]{3,30}$/i.test(cleaned) && !cleaned.includes('@')) {
      return 'username';
    }
    
    return null;
  };

  const parseCSV = async (text: string): Promise<ParsedTarget[]> => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const targets: ParsedTarget[] = [];
    const newErrors: string[] = [];

    // Skip header if it looks like a header
    const startIndex = lines[0]?.toLowerCase().includes('email') || 
                       lines[0]?.toLowerCase().includes('target') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma, semicolon, or tab
      const values = line.split(/[,;\t]/).map(v => v.trim()).filter(v => v);
      
      for (const value of values) {
        const type = detectTargetType(value);
        if (type) {
          targets.push({ type, value, row: i + 1 });
        } else {
          newErrors.push(`Row ${i + 1}: Could not detect type for "${value}"`);
        }
      }
    }

    setErrors(newErrors);
    return targets;
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV or TXT file');
      return;
    }

    setParsing(true);
    try {
      const text = await file.text();
      const targets = await parseCSV(text);
      
      if (targets.length === 0) {
        toast.error('No valid targets found in file');
        return;
      }

      setParsedTargets(targets);
      onTargetsParsed(targets);
      
      toast.success(`Successfully parsed ${targets.length} targets`);
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse file');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const typeCounts = parsedTargets.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card hover:shadow-glow hover:scale-105 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Upload Batch Targets
        </CardTitle>
        <CardDescription>
          Upload a CSV or TXT file with targets (one per line or comma-separated)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileInput}
            disabled={disabled || parsing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="space-y-4">
            {parsing ? (
              <>
                <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Parsing targets...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Drop your CSV file here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {parsedTargets.length > 0 && (
          <Alert className="bg-primary/10 border-primary/30">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Parsed {parsedTargets.length} targets</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <Badge key={type} variant="outline" className="capitalize">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive" className="max-h-32 overflow-y-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">{errors.length} warnings:</p>
              <ul className="text-xs space-y-1">
                {errors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {errors.length > 5 && (
                  <li className="text-muted-foreground">...and {errors.length - 5} more</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Supported formats:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>One target per line</li>
            <li>Comma, semicolon, or tab-separated values</li>
            <li>Auto-detects: emails, usernames, domains, phone numbers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
