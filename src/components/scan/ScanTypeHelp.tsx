import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { type ScanType } from '@/lib/providers/registry';
import { getScanTypeMeta, getProviderCountForScanType } from '@/lib/scan/scanTypeMeta';

interface ScanTypeHelpProps {
  scanType: ScanType;
}

export function ScanTypeHelp({ scanType }: ScanTypeHelpProps) {
  const meta = getScanTypeMeta(scanType);
  const providerCount = getProviderCountForScanType(scanType);

  if (!meta) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 space-y-3" side="right">
          <div>
            <p className="font-medium text-sm">{meta.description}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Accepted formats:</span>
            <div className="flex flex-wrap gap-1">
              {meta.acceptedFormats.map((format, i) => (
                <code key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {format}
                </code>
              ))}
            </div>
          </div>

          {meta.normalisationInfo && (
            <p className="text-xs text-muted-foreground italic">
              {meta.normalisationInfo}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <Badge variant="outline" className="text-xs">
              {providerCount} providers
            </Badge>
            {meta.workerNames.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {meta.workerNames.length} workers
              </Badge>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
