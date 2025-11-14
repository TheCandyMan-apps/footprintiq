import { Eye, AlertTriangle, Shield, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DarkWebMockupProps {
  step: number;
}

export function DarkWebMockup({ step }: DarkWebMockupProps) {
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
            <Eye className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Configure Monitors</h3>
          </div>
          <div className="bg-background rounded-lg border-2 border-border p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Keywords</label>
              <input
                type="text"
                placeholder="company.com, admin@company.com"
                className="w-full px-4 py-3 bg-muted rounded-lg border border-border"
                value="company.com"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Marketplaces', 'Forums', 'Paste Sites', 'Chat Rooms'].map((source) => (
                <div key={source} className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-center">
                  {source}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Activity className="w-12 h-12 text-primary mx-auto mb-2 animate-pulse" />
            <h3 className="text-xl font-semibold">Live Surveillance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-background rounded-lg border border-border p-4">
              <div className="text-2xl font-bold text-primary mb-1">12</div>
              <div className="text-xs text-muted-foreground">Active Sources</div>
            </div>
            <div className="bg-background rounded-lg border border-border p-4">
              <div className="text-2xl font-bold text-accent mb-1">3</div>
              <div className="text-xs text-muted-foreground">New Alerts</div>
            </div>
          </div>
          <div className="space-y-2">
            {['Dark Market Alpha', 'RaidForums Clone', 'Pastebin'].map((source, i) => (
              <div key={i} className="bg-background rounded border border-border p-3 flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-primary animate-pulse" : "bg-muted")} />
                <span className="text-sm flex-1">{source}</span>
                <span className="text-xs text-muted-foreground">Monitoring</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Alert Triggered</h3>
          </div>
          <div className="bg-destructive/10 rounded-lg border-2 border-destructive/50 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded font-medium">HIGH PRIORITY</span>
              <span className="text-sm text-muted-foreground">2 minutes ago</span>
            </div>
            <div className="text-sm font-medium">Company credentials found on marketplace</div>
            <div className="text-xs text-muted-foreground">Source: Dark Market Alpha</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-4">
            <Shield className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Threat Analysis</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Risk Level</div>
                <div className="text-sm font-semibold text-destructive">High</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Affected Accounts</div>
                <div className="text-sm font-semibold">23</div>
              </div>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Recommended Actions</div>
              <div className="space-y-2">
                {['Force password reset', 'Enable MFA', 'Monitor for unauthorized access'].map((action, i) => (
                  <div key={i} className="text-xs flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
