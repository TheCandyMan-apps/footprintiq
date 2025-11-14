import { Database, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnrichmentMockupProps {
  step: number;
}

export function EnrichmentMockup({ step }: EnrichmentMockupProps) {
  return (
    <div className="w-full h-full p-8 animate-fade-in">
      {step === 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Search className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Input Target</h3>
          </div>
          <div className="bg-background rounded-lg border-2 border-border p-6 space-y-4">
            <input
              type="text"
              placeholder="Enter email, phone, or domain..."
              className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-foreground placeholder:text-muted-foreground"
              value="john.doe@company.com"
              readOnly
            />
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-primary/10 rounded border border-primary/20 text-sm">
                <span className="text-primary font-medium">Email Detected</span>
              </div>
              <div className="flex-1 px-3 py-2 bg-muted rounded border border-border text-sm text-center">
                15 APIs Available
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Database className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Select Data Sources</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Social Media APIs', 'Breach Databases', 'Professional Networks', 'Domain Records', 'Phone Lookup', 'Email Verification'].map((api, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  i < 4 ? "bg-primary/10 border-primary" : "bg-muted border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  {i < 4 && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  <span className="text-sm font-medium">{api}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-2 animate-spin" />
            <h3 className="text-xl font-semibold">Querying APIs...</h3>
          </div>
          <div className="space-y-2">
            {['LinkedIn API', 'Twitter API', 'Have I Been Pwned', 'Hunter.io'].map((api, i) => (
              <div key={i} className="bg-background rounded-lg border border-border p-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm flex-1">{api}</span>
                <span className="text-xs text-muted-foreground">Processing...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Results Dashboard</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-primary/10 rounded-lg border border-primary/20 p-4 text-center">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-xs text-muted-foreground">Profiles Found</div>
            </div>
            <div className="bg-accent/10 rounded-lg border border-accent/20 p-4 text-center">
              <div className="text-2xl font-bold text-accent">3</div>
              <div className="text-xs text-muted-foreground">Breaches</div>
            </div>
            <div className="bg-muted rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold">87%</div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
          </div>
          <div className="space-y-2">
            {['LinkedIn Profile', 'Twitter Account', 'Data Breach (2023)'].map((item, i) => (
              <div key={i} className="bg-background rounded border border-border p-3 flex items-center justify-between">
                <span className="text-sm">{item}</span>
                <span className="text-xs text-primary">View Details →</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
