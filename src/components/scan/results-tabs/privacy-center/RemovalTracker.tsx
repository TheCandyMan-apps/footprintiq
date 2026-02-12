import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Send, AlertTriangle, XCircle } from 'lucide-react';

interface RemovalRequest {
  id: string;
  broker_name: string;
  status: string;
  submitted_at: string | null;
  confirmed_at: string | null;
  updated_at: string | null;
}

interface RemovalTrackerProps {
  requests: RemovalRequest[];
}

const statusSteps = [
  { key: 'not_started', label: 'Not Started', icon: <Clock className="h-3.5 w-3.5" /> },
  { key: 'submitted', label: 'Submitted', icon: <Send className="h-3.5 w-3.5" /> },
  { key: 'awaiting_confirmation', label: 'Awaiting', icon: <Clock className="h-3.5 w-3.5" /> },
  { key: 'removed', label: 'Removed', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { key: 're_listed', label: 'Re-listed', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
];

function getStepIndex(status: string): number {
  if (status === 're_listed') return -1; // special
  return statusSteps.findIndex(s => s.key === status);
}

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = getStepIndex(status);
  const isRelisted = status === 're_listed';

  return (
    <div className="flex items-center gap-1">
      {statusSteps.slice(0, 4).map((step, idx) => {
        const isActive = idx <= currentIdx && !isRelisted;
        const isCurrent = step.key === status;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                isCurrent
                  ? 'bg-primary text-primary-foreground'
                  : isActive
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.icon}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < 3 && (
              <div className={`w-4 h-px ${isActive && idx < currentIdx ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
      {isRelisted && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/20 text-destructive">
          <XCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Re-listed</span>
        </div>
      )}
    </div>
  );
}

export function RemovalTracker({ requests }: RemovalTrackerProps) {
  if (requests.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          No removal requests yet. Start by clicking "Start Removal" on a broker above.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Removal Progress</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {requests.map(req => (
            <div key={req.id} className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{req.broker_name}</p>
                {req.submitted_at && (
                  <span className="text-[10px] text-muted-foreground">
                    Submitted {new Date(req.submitted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <StatusTimeline status={req.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
