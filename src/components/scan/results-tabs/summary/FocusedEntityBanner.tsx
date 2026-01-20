import { Button } from '@/components/ui/button';
import { Crosshair, X, ExternalLink, Globe } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';

interface FocusedEntityBannerProps {
  result: ScanResult;
  onView: () => void;
  onClear: () => void;
}

export function FocusedEntityBanner({ result, onView, onClear }: FocusedEntityBannerProps) {
  const platform = result.site || 'Unknown';
  let hostname = '';
  
  try {
    if (result.url) {
      hostname = new URL(result.url).hostname.replace('www.', '');
    }
  } catch {}

  return (
    <section className="mb-3">
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Crosshair className="w-3 h-3" />
        Focused Entity
      </h3>
      <div className="flex items-center justify-between gap-2 py-1.5 px-2 -mx-2 rounded bg-primary/5 border border-primary/15">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
            <Globe className="w-3 h-3 text-primary" />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-medium text-foreground">{platform}</span>
            {hostname && (
              <span className="text-[10px] text-muted-foreground ml-1.5">{hostname}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] text-primary hover:text-primary"
            onClick={onView}
          >
            <ExternalLink className="w-2.5 h-2.5 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
            onClick={onClear}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </section>
  );
}
