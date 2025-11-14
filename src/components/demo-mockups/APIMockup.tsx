import { Key, Webhook, Code, BarChart3 } from 'lucide-react';

interface APIMockupProps {
  step: number;
}

export function APIMockup({ step }: APIMockupProps) {
  return (
    <div className="w-full h-full p-8 animate-fade-in">
      {step === 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Key className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Generate API Key</h3>
          </div>
          <div className="bg-background rounded-lg border-2 border-border p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Key Name</label>
              <input
                type="text"
                placeholder="Production API Key"
                className="w-full px-4 py-2 bg-muted rounded border border-border"
                value="Production API Key"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Permissions</label>
                <div className="space-y-1">
                  {['Read', 'Write', 'Admin'].map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={perm !== 'Admin'} readOnly className="rounded" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Rate Limit</label>
                <div className="px-3 py-2 bg-primary/10 border border-primary/20 rounded text-sm text-center">
                  5,000 / hour
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Webhook className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Configure Webhooks</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Webhook URL</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-muted rounded border border-border font-mono text-sm"
                value="https://api.company.com/webhook"
                readOnly
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Events</label>
              <div className="grid grid-cols-2 gap-2">
                {['scan.completed', 'alert.triggered', 'result.found', 'error.occurred'].map((event) => (
                  <div key={event} className="p-2 bg-primary/10 border border-primary/20 rounded text-xs font-mono">
                    {event}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Code className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Test Integration</h3>
          </div>
          <div className="bg-muted/50 rounded-lg border border-border p-4 font-mono text-xs space-y-3">
            <div>
              <div className="text-muted-foreground mb-1">Request</div>
              <div className="bg-background rounded p-3 border border-border">
                <span className="text-primary">POST</span> /api/v1/scan<br />
                <span className="text-muted-foreground">{"{"}</span><br />
                &nbsp;&nbsp;<span className="text-accent">"target"</span>: <span className="text-primary">"user@example.com"</span><br />
                <span className="text-muted-foreground">{"}"}</span>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Response (200 OK)</div>
              <div className="bg-background rounded p-3 border border-border text-primary">
                <span className="text-muted-foreground">{"{"}</span><br />
                &nbsp;&nbsp;<span className="text-accent">"scan_id"</span>: <span className="text-primary">"abc123"</span>,<br />
                &nbsp;&nbsp;<span className="text-accent">"status"</span>: <span className="text-primary">"processing"</span><br />
                <span className="text-muted-foreground">{"}"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-4">
            <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Monitor Usage</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-background rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold text-primary">3,247</div>
              <div className="text-xs text-muted-foreground">API Calls Today</div>
            </div>
            <div className="bg-background rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold">98.5%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="bg-background rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold text-accent">1,753</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
          <div className="bg-background rounded-lg border border-border p-4">
            <div className="h-32 flex items-end gap-1">
              {[60, 75, 45, 90, 70, 85, 65].map((height, i) => (
                <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center mt-2">Last 7 Days</div>
          </div>
        </div>
      )}
    </div>
  );
}
