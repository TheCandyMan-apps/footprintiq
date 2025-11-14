import { Lock, Link2, Shield, Activity } from 'lucide-react';

interface SSOMockupProps {
  step: number;
}

export function SSOMockup({ step }: SSOMockupProps) {
  return (
    <div className="w-full h-full p-8 animate-fade-in">
      {step === 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Link2 className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Provider Setup</h3>
          </div>
          <div className="bg-background rounded-lg border-2 border-border p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">Select Identity Provider</label>
              <div className="grid grid-cols-3 gap-3">
                {['Okta', 'Azure AD', 'Google'].map((provider, i) => (
                  <div
                    key={provider}
                    className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                      i === 0 ? 'bg-primary/10 border-primary' : 'bg-muted border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-medium">{provider}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-border">
              <label className="text-sm text-muted-foreground mb-2 block">Protocol</label>
              <div className="flex gap-2">
                {['SAML 2.0', 'OAuth 2.0'].map((protocol) => (
                  <div key={protocol} className="flex-1 p-2 bg-primary/10 border border-primary/20 rounded text-sm text-center">
                    {protocol}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Link2 className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">User Mapping</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div>
              <div className="text-sm font-medium mb-3">Attribute Mapping</div>
              <div className="space-y-2">
                {[
                  { attribute: 'Email', mapped: 'user.email' },
                  { attribute: 'First Name', mapped: 'user.firstName' },
                  { attribute: 'Last Name', mapped: 'user.lastName' },
                  { attribute: 'Department', mapped: 'user.department' },
                ].map((mapping, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                    <div className="flex-1 text-sm">{mapping.attribute}</div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={mapping.mapped}
                        readOnly
                        className="w-full px-3 py-1.5 bg-background rounded border border-border text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-border">
              <label className="text-sm text-muted-foreground mb-2 block">Default Role for New Users</label>
              <select className="w-full px-3 py-2 bg-muted rounded border border-border">
                <option>Viewer</option>
                <option>Analyst</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Security Policies</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div className="space-y-3">
              {[
                { policy: 'Enforce Multi-Factor Authentication', enabled: true },
                { policy: 'Session Timeout (30 minutes)', enabled: true },
                { policy: 'IP Allowlist', enabled: false },
                { policy: 'Require Strong Passwords', enabled: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded border border-border">
                  <span className="text-sm">{item.policy}</span>
                  <div className={`w-10 h-6 rounded-full flex items-center ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-border">
              <label className="text-sm text-muted-foreground mb-2 block">Allowed IP Ranges</label>
              <input
                type="text"
                placeholder="192.168.1.0/24"
                className="w-full px-3 py-2 bg-muted rounded border border-border text-sm font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-4">
            <Activity className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Monitor Authentication</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-background rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold text-primary">142</div>
              <div className="text-xs text-muted-foreground">Active Sessions</div>
            </div>
            <div className="bg-background rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold">98.2%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="bg-background rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold text-destructive">3</div>
              <div className="text-xs text-muted-foreground">Failed Attempts</div>
            </div>
          </div>
          <div className="bg-background rounded-lg border border-border p-4">
            <div className="text-sm font-medium mb-3">Recent Authentication Logs</div>
            <div className="space-y-2">
              {[
                { user: 'john@company.com', status: 'Success', time: '2 min ago' },
                { user: 'sarah@company.com', status: 'Success', time: '15 min ago' },
                { user: 'unknown@external.com', status: 'Failed', time: '1 hour ago' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                  <span className="font-mono">{log.user}</span>
                  <span className={log.status === 'Success' ? 'text-primary' : 'text-destructive'}>
                    {log.status}
                  </span>
                  <span className="text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
