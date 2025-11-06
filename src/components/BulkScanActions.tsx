import { Button } from '@/components/ui/button';
import { Archive, X } from 'lucide-react';

interface BulkScanActionsProps {
  selectedCount: number;
  onClear: () => void;
  onArchive: () => void;
}

export function BulkScanActions({ selectedCount, onClear, onArchive }: BulkScanActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {selectedCount} scan{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={onArchive}
      >
        <Archive className="h-4 w-4 mr-2" />
        Archive Selected
      </Button>
    </div>
  );
}
