import { Button } from '@/components/ui/button';
import { Crosshair, X, ExternalLink, Globe } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';

interface FocusedEntityBannerProps {
  result: ScanResult;
  onView: () => void;
  onClear: () => void;
}

export function FocusedEntityBanner({ result, onView, onClear }: FocusedEntityBannerProps) {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  const platform = result.site || meta.platform || 'Unknown';
  const username = meta.username || meta.handle || '';
  let hostname = '';
  
  try {
    if (result.url) {
      hostname = new URL(result.url).hostname.replace('www.', '');
    }
  } catch {}

  return (
    <section className="border-t border-border/20 pt-3">
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Crosshair className="w-3 h-3 text-primary" />
        Focused Entity
      </h3>
      <div className="flex items-center justify-between gap-2 py-2 px-2.5 -mx-2 rounded-md bg-primary/5 border border-primary/15">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-foreground">{platform}</span>
              {username && (
                <span className="text-[11px] text-muted-foreground">@{username}</span>
              )}
            </div>
            {hostname && (
              <span className="text-[10px] text-muted-foreground/70">{hostname}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/10"
            onClick={onView}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View in Accounts
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={onClear}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
