import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Download, FileJson, FileSpreadsheet, FileText, 
  RefreshCw, Share2, ChevronDown 
} from 'lucide-react';

interface ResultsToolbarProps {
  onExportJSON: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onNewScan: () => void;
  onShare?: () => void;
  disabled?: boolean;
}

export function ResultsToolbar({
  onExportJSON,
  onExportCSV,
  onExportPDF,
  onNewScan,
  onShare,
  disabled = false,
}: ResultsToolbarProps) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="h-7 px-2 text-xs gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={onExportJSON} className="text-xs">
            <FileJson className="w-3.5 h-3.5 mr-2" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportCSV} className="text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPDF} className="text-xs">
            <FileText className="w-3.5 h-3.5 mr-2" />
            PDF Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* New Scan */}
      <Button
        variant="outline"
        size="sm"
        onClick={onNewScan}
        className="h-7 px-2 text-xs gap-1"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">New Scan</span>
      </Button>

      {/* Share (optional) */}
      {onShare && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="h-7 px-2 text-xs gap-1"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      )}
    </div>
  );
}
