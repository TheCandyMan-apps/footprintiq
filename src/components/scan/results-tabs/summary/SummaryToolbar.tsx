import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface SummaryToolbarProps {
  onRescan?: () => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export function SummaryToolbar({ onRescan, onExport, isExporting }: SummaryToolbarProps) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRescan}
        className="h-8 text-xs"
      >
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
        Re-scan
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExport}
        disabled={isExporting}
        className="h-8 text-xs"
      >
        <Download className="w-3.5 h-3.5 mr-1.5" />
        Export
      </Button>
    </div>
  );
}
