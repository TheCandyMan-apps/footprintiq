import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download, FileJson, FileSpreadsheet, Lock } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { exportAccountsToCSV, exportAccountsToJSON } from '@/utils/exporters';
import { toast } from 'sonner';

interface AccountsExportMenuProps {
  /** Currently visible/filtered results */
  filteredResults: ScanResult[];
  /** All results (pre-filter) */
  allResults: ScanResult[];
  jobId: string;
  /** LENS confidence scores by result id */
  scoreMap: Map<string, number>;
  /** Whether user has full (Pro) access */
  isFullAccess: boolean;
}

export function AccountsExportMenu({
  filteredResults,
  allResults,
  jobId,
  scoreMap,
  isFullAccess,
}: AccountsExportMenuProps) {
  const [open, setOpen] = useState(false);

  const handleExport = (scope: 'view' | 'all', format: 'csv' | 'json') => {
    const results = scope === 'view' ? filteredResults : allResults;
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const suffix = scope === 'view' ? 'filtered' : 'all';
    const filename = `footprintiq_accounts_${jobId}_${suffix}.${format}`;

    if (format === 'csv') {
      exportAccountsToCSV(results, jobId, filename, scoreMap);
    } else {
      exportAccountsToJSON(results, jobId, filename, scoreMap);
    }

    toast.success(`Exported ${results.length} accounts as ${format.toUpperCase()}`);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="text-[10px]">Export accounts</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal">
          Export current view ({filteredResults.length})
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => handleExport('view', 'csv')}
          className="text-xs gap-2"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Current view as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('view', 'json')}
          className="text-xs gap-2"
        >
          <FileJson className="h-3.5 w-3.5" />
          Current view as JSON
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal flex items-center gap-1">
          Export all results ({allResults.length})
          {!isFullAccess && <Lock className="h-2.5 w-2.5" />}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => isFullAccess ? handleExport('all', 'csv') : toast.error('Export all requires Pro plan')}
          className="text-xs gap-2"
          disabled={!isFullAccess}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          All results as CSV
          {!isFullAccess && <Lock className="h-2.5 w-2.5 ml-auto text-muted-foreground" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => isFullAccess ? handleExport('all', 'json') : toast.error('Export all requires Pro plan')}
          className="text-xs gap-2"
          disabled={!isFullAccess}
        >
          <FileJson className="h-3.5 w-3.5" />
          All results as JSON
          {!isFullAccess && <Lock className="h-2.5 w-2.5 ml-auto text-muted-foreground" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
