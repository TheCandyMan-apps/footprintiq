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
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={disabled}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={onExportJSON} disabled={disabled}>
            <FileJson className="h-4 w-4 mr-2" />
            JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportCSV} disabled={disabled}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPDF} disabled={disabled}>
            <FileText className="h-4 w-4 mr-2" />
            PDF Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onNewScan}>
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        New Scan
      </Button>
    </div>
  );
}
