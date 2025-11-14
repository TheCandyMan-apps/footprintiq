import { Upload, List, Download, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface BulkScanMockupProps {
  step: number;
}

export function BulkScanMockup({ step }: BulkScanMockupProps) {
  return (
    <motion.div 
      className="w-full h-full p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {step === 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Upload className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Bulk Upload</h3>
          </div>
          <div className="bg-background rounded-lg border-2 border-dashed border-primary/50 p-12 text-center space-y-4">
            <div className="text-sm text-muted-foreground">Drop CSV file or click to browse</div>
            <div className="text-xs text-muted-foreground">Supports up to 10,000 targets per upload</div>
          </div>
          <div className="bg-muted/50 rounded-lg border border-border p-4">
            <div className="text-xs font-medium mb-2">Sample Format:</div>
            <div className="font-mono text-xs text-muted-foreground">
              email,name<br />
              user1@example.com,John Doe<br />
              user2@example.com,Jane Smith
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <List className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Processing Queue</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-primary/10 rounded-lg border border-primary/20 p-3 text-center">
              <div className="text-xl font-bold text-primary">1,247</div>
              <div className="text-xs text-muted-foreground">Total Targets</div>
            </div>
            <div className="bg-muted rounded-lg border border-border p-3 text-center">
              <div className="text-xl font-bold">892</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="bg-accent/10 rounded-lg border border-accent/20 p-3 text-center">
              <div className="text-xl font-bold text-accent">355</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
          </div>
          <div className="space-y-2">
            {[72, 45, 20].map((progress, i) => (
              <div key={i} className="bg-background rounded border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs">Batch {i + 1}</span>
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-4">
            <List className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Results Stream</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-4 space-y-2">
            {['user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example.com'].map((email, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                <span className="text-sm font-mono">{email}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">12 Results</span>
                  <span className="text-xs text-muted-foreground">View →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <Download className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Export & Schedule</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div>
              <div className="text-sm font-medium mb-3">Export Format</div>
              <div className="grid grid-cols-3 gap-2">
                {['CSV', 'JSON', 'PDF'].map((format) => (
                  <div key={format} className="p-3 bg-primary/10 border border-primary/20 rounded text-sm text-center">
                    {format}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">Schedule Recurring Scan</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Run this scan daily at 2:00 AM UTC</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
