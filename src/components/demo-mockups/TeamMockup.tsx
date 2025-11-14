import { Users, UserPlus, Shield, FileText } from 'lucide-react';

interface TeamMockupProps {
  step: number;
}

export function TeamMockup({ step }: TeamMockupProps) {
  return (
    <div className="w-full h-full p-8 animate-fade-in">
      {step === 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Users className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Create Workspace</h3>
          </div>
          <div className="bg-background rounded-lg border-2 border-border p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Workspace Name</label>
              <input
                type="text"
                placeholder="Security Team"
                className="w-full px-4 py-3 bg-muted rounded-lg border border-border"
                value="Security Operations"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Settings</label>
                {['Data Isolation', 'Custom Branding'].map((setting) => (
                  <div key={setting} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked readOnly className="rounded" />
                    <span>{setting}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Members</label>
                <div className="px-3 py-2 bg-primary/10 border border-primary/20 rounded text-sm text-center">
                  0 members
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <UserPlus className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Invite Members</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                className="flex-1 px-4 py-2 bg-muted rounded border border-border"
              />
              <select className="px-4 py-2 bg-muted rounded border border-border">
                <option>Admin</option>
                <option>Analyst</option>
                <option>Viewer</option>
              </select>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                Invite
              </button>
            </div>
            <div className="space-y-2">
              {[
                { name: 'John Smith', role: 'Admin', status: 'Active' },
                { name: 'Sarah Johnson', role: 'Analyst', status: 'Pending' },
                { name: 'Mike Wilson', role: 'Viewer', status: 'Active' }
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Manage Permissions</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div className="text-sm font-medium mb-3">Role: Analyst</div>
            <div className="space-y-3">
              {[
                { permission: 'Run Scans', granted: true },
                { permission: 'View Sensitive Data', granted: true },
                { permission: 'Export Reports', granted: false },
                { permission: 'Manage Billing', granted: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded border border-border">
                  <span className="text-sm">{item.permission}</span>
                  <div className={`w-10 h-6 rounded-full flex items-center ${item.granted ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${item.granted ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-4">
            <FileText className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Activity Audit Log</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-4 space-y-2">
            {[
              { user: 'John Smith', action: 'Ran scan on domain.com', time: '2 min ago' },
              { user: 'Sarah Johnson', action: 'Exported report', time: '15 min ago' },
              { user: 'Mike Wilson', action: 'Viewed scan results', time: '1 hour ago' },
              { user: 'John Smith', action: 'Updated workspace settings', time: '2 hours ago' },
            ].map((log, i) => (
              <div key={i} className="flex items-start justify-between p-3 bg-muted/50 rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">{log.user}</div>
                  <div className="text-xs text-muted-foreground">{log.action}</div>
                </div>
                <span className="text-xs text-muted-foreground">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
