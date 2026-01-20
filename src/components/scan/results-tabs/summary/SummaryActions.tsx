import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, RefreshCw, ChevronDown, FileJson, FileSpreadsheet, FileText } from 'lucide-react';

interface SummaryActionsProps {
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onNewScan?: () => void;
  disabled?: boolean;
}

export function SummaryActions({
  onExportJSON,
  onExportCSV,
  onExportPDF,
  onNewScan,
  disabled,
}: SummaryActionsProps) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5" disabled={disabled}>
            <Download className="h-3 w-3 mr-1" />
            Export
            <ChevronDown className="h-2.5 w-2.5 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={onExportJSON} disabled={disabled} className="text-xs">
            <FileJson className="h-3.5 w-3.5 mr-2" />
            JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportCSV} disabled={disabled} className="text-xs">
            <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPDF} disabled={disabled} className="text-xs">
            <FileText className="h-3.5 w-3.5 mr-2" />
            PDF Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="secondary" size="sm" className="h-7 text-[11px] px-2.5" onClick={onNewScan}>
        <RefreshCw className="h-3 w-3 mr-1" />
        New Scan
      </Button>
    </div>
  );
}
