import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReVerificationPanelProps {
  requests: SovereigntyRequest[];
  onReVerify: (id: string) => void;
}

export function ReVerificationPanel({ requests, onReVerify }: ReVerificationPanelProps) {
  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());

  const completedRequests = requests.filter(r => r.status === 'completed');

  const getVerificationStatus = (req: SovereigntyRequest) => {
    if (!req.completed_at) return 'unknown';
    const daysSinceCompleted = Math.floor((Date.now() - new Date(req.completed_at).getTime()) / 86400000);
    if (daysSinceCompleted > 30) return 'needs-recheck';
    if (daysSinceCompleted > 14) return 'due-soon';
    return 'recent';
  };

  const handleReVerify = (id: string) => {
    setVerifyingIds(prev => new Set(prev).add(id));
    onReVerify(id);
    // Simulate verification delay
    setTimeout(() => {
      setVerifyingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  if (completedRequests.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No completed removals to re-verify yet</p>
      </Card>
    );
  }

  const needsRecheck = completedRequests.filter(r => getVerificationStatus(r) === 'needs-recheck');
  const dueSoon = completedRequests.filter(r => getVerificationStatus(r) === 'due-soon');
  const recent = completedRequests.filter(r => getVerificationStatus(r) === 'recent');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          Re-Verification Status
          {needsRecheck.length > 0 && (
            <Badge variant="destructive" className="text-xs ml-auto">
              {needsRecheck.length} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-md bg-destructive/10">
            <p className="text-lg font-bold text-destructive">{needsRecheck.length}</p>
            <p className="text-[10px] text-muted-foreground">Need Recheck</p>
          </div>
          <div className="text-center p-2 rounded-md bg-yellow-500/10">
            <p className="text-lg font-bold text-yellow-600">{dueSoon.length}</p>
            <p className="text-[10px] text-muted-foreground">Due Soon</p>
          </div>
          <div className="text-center p-2 rounded-md bg-green-500/10">
            <p className="text-lg font-bold text-green-600">{recent.length}</p>
            <p className="text-[10px] text-muted-foreground">Verified</p>
          </div>
        </div>

        {/* Items needing recheck */}
        {[...needsRecheck, ...dueSoon].slice(0, 5).map(req => {
          const status = getVerificationStatus(req);
          const isVerifying = verifyingIds.has(req.id);

          return (
            <div key={req.id} className="flex items-center justify-between gap-2 text-sm border rounded-md p-2">
              <div className="flex items-center gap-2 min-w-0">
                {status === 'needs-recheck' ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
                )}
                <span className="truncate font-medium">{req.target_entity}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground">
                  {req.completed_at && formatDistanceToNow(new Date(req.completed_at), { addSuffix: true })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleReVerify(req.id)}
                  disabled={isVerifying}
                >
                  <RefreshCw className={`h-3 w-3 ${isVerifying ? 'animate-spin' : ''}`} />
                  {isVerifying ? 'Checking…' : 'Re-verify'}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
