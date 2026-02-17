import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, AlertTriangle, XCircle, Send, Eye, MoreHorizontal } from 'lucide-react';
import { SovereigntyRequest, SovereigntyStatus } from '@/hooks/useSovereignty';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RequestPipelineProps {
  requests: SovereigntyRequest[];
  onUpdateStatus: (id: string, status: SovereigntyStatus) => void;
  onViewTemplate?: (request: SovereigntyRequest) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  showCheckboxes?: boolean;
}

const STATUS_CONFIG: Record<SovereigntyStatus, { label: string; icon: React.ReactNode; variant: string }> = {
  draft: { label: 'Draft', icon: <Eye className="h-3.5 w-3.5" />, variant: 'outline' },
  submitted: { label: 'Submitted', icon: <Send className="h-3.5 w-3.5" />, variant: 'default' },
  acknowledged: { label: 'Acknowledged', icon: <Clock className="h-3.5 w-3.5" />, variant: 'secondary' },
  processing: { label: 'Processing', icon: <Clock className="h-3.5 w-3.5 animate-spin" />, variant: 'secondary' },
  completed: { label: 'Removed', icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'success' },
  rejected: { label: 'Rejected', icon: <XCircle className="h-3.5 w-3.5" />, variant: 'destructive' },
  expired: { label: 'Expired', icon: <AlertTriangle className="h-3.5 w-3.5" />, variant: 'warning' },
};

const JURISDICTION_LABELS: Record<string, string> = {
  gdpr: 'GDPR',
  ccpa: 'CCPA',
  uk_sds: 'UK SDS',
};

const NEXT_STATUSES: Record<SovereigntyStatus, SovereigntyStatus[]> = {
  draft: ['submitted'],
  submitted: ['acknowledged', 'rejected'],
  acknowledged: ['processing', 'completed', 'rejected'],
  processing: ['completed', 'rejected'],
  completed: [],
  rejected: [],
  expired: [],
};

export function RequestPipeline({ requests, onUpdateStatus, onViewTemplate, selectedIds, onToggleSelect, showCheckboxes }: RequestPipelineProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Send className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No erasure requests yet</p>
        <p className="text-xs mt-1">Create your first request to start tracking removals</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const config = STATUS_CONFIG[req.status];
        const isOverdue = req.deadline_at && new Date(req.deadline_at) < new Date() &&
          !['completed', 'rejected'].includes(req.status);
        const nextStatuses = NEXT_STATUSES[req.status];

        return (
          <Card key={req.id} className={`p-4 ${isOverdue ? 'border-destructive/50' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {showCheckboxes && onToggleSelect && selectedIds && (
                  <Checkbox
                    checked={selectedIds.has(req.id)}
                    onCheckedChange={() => onToggleSelect(req.id)}
                    className="mt-0.5 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm truncate">{req.target_entity}</h4>
                  <Badge variant={config.variant as any} className="gap-1 text-xs">
                    {config.icon}
                    {config.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {JURISDICTION_LABELS[req.jurisdiction] || req.jurisdiction}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Overdue
                    </Badge>
                  )}
                </div>

                {req.target_url && (
                  <p className="text-xs text-muted-foreground truncate">{req.target_url}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {req.submitted_at && (
                    <span>Submitted {formatDistanceToNow(new Date(req.submitted_at), { addSuffix: true })}</span>
                  )}
                  {req.deadline_at && (
                    <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                      Deadline: {format(new Date(req.deadline_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                {req.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{req.notes}</p>
                )}
              </div>
              </div>

              {(nextStatuses.length > 0 || onViewTemplate) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                    {onViewTemplate && (
                      <DropdownMenuItem onClick={() => onViewTemplate(req)}>
                        <span className="flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5" />
                          View Template
                        </span>
                      </DropdownMenuItem>
                    )}
                    {nextStatuses.map((next) => (
                      <DropdownMenuItem key={next} onClick={() => onUpdateStatus(req.id, next)}>
                        <span className="flex items-center gap-2">
                          {STATUS_CONFIG[next].icon}
                          Mark as {STATUS_CONFIG[next].label}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
