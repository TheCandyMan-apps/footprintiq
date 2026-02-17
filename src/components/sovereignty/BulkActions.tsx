import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SovereigntyRequest, SovereigntyStatus } from '@/hooks/useSovereignty';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle, XCircle, Clock, Send, ChevronDown, X } from 'lucide-react';

interface BulkActionsProps {
  requests: SovereigntyRequest[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkUpdate: (ids: string[], status: SovereigntyStatus) => void;
}

const BULK_STATUSES: { status: SovereigntyStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'acknowledged', label: 'Acknowledged', icon: <Clock className="h-3.5 w-3.5" /> },
  { status: 'processing', label: 'Processing', icon: <Send className="h-3.5 w-3.5" /> },
  { status: 'completed', label: 'Completed', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  { status: 'rejected', label: 'Rejected', icon: <XCircle className="h-3.5 w-3.5" /> },
];

export function BulkActions({ requests, selectedIds, onToggle, onSelectAll, onClearSelection, onBulkUpdate }: BulkActionsProps) {
  const selectedCount = selectedIds.size;
  const allSelected = requests.length > 0 && selectedCount === requests.length;

  if (requests.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => allSelected ? onClearSelection() : onSelectAll()}
          />
          <span className="text-xs text-muted-foreground">
            {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
          </span>
        </div>

        {selectedCount > 0 && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  Bulk Update
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {BULK_STATUSES.map(({ status, label, icon }) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onBulkUpdate(Array.from(selectedIds), status)}
                  >
                    <span className="flex items-center gap-2">
                      {icon}
                      Mark all as {label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={onClearSelection} className="gap-1 text-xs">
              <X className="h-3 w-3" />
              Clear
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function BulkCheckbox({ id, selected, onToggle }: { id: string; selected: boolean; onToggle: (id: string) => void }) {
  return (
    <Checkbox
      checked={selected}
      onCheckedChange={() => onToggle(id)}
      className="shrink-0"
    />
  );
}
