import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertRow, Severity } from '@/types/dashboard';
import { formatTimestamp, formatConfidence } from '@/lib/format';
import { FileText, UserPlus, AlertCircle, Lock } from 'lucide-react';
import { ContextEnrichmentPanel, UrlOption } from '@/components/ContextEnrichmentPanel';
import { GatedContent, useResultsGating } from '@/components/billing/GatedContent';

interface AlertDrawerProps {
  alert: AlertRow | null;
  open: boolean;
  onClose: () => void;
  onExplain?: (alertId: string) => void;
  onAssign?: (alertId: string) => void;
  onAddToReport?: (alertId: string) => void;
  canAssign?: boolean;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  low: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  high: 'bg-red-500/10 text-red-700 border-red-500/20',
  critical: 'bg-red-600/20 text-red-800 border-red-600/30',
};

/**
 * Helper to extract all available URLs from an alert.
 * Returns an array of UrlOption for the dropdown.
 */
function getAlertUrls(alert: AlertRow | null): UrlOption[] {
  if (!alert) return [];
  
  const urls: UrlOption[] = [];
  
  if (alert.url) {
    urls.push({ label: 'Primary URL', url: alert.url });
  }
  if (alert.profile_url && alert.profile_url !== alert.url) {
    urls.push({ label: 'Profile URL', url: alert.profile_url });
  }
  if (alert.source_url && alert.source_url !== alert.url && alert.source_url !== alert.profile_url) {
    urls.push({ label: 'Source URL', url: alert.source_url });
  }
  if (alert.link && alert.link !== alert.url && alert.link !== alert.profile_url && alert.link !== alert.source_url) {
    urls.push({ label: 'Link', url: alert.link });
  }
  
  return urls;
}

/** Mask URL for free users - show domain only */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}/••••••`;
  } catch {
    return '••••••••••••';
  }
}

export function AlertDrawer({
  alert,
  open,
  onClose,
  onExplain,
  onAssign,
  onAddToReport,
  canAssign = false,
}: AlertDrawerProps) {
  const { canSeeSourceUrls, canSeeEvidence, canSeeConfidenceExplanation, canSeeContextEnrichment } = useResultsGating();

  if (!alert) return null;

  const urls = getAlertUrls(alert);
  const hasUrls = urls.length > 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            Alert Details
          </SheetTitle>
          <SheetDescription>
            {formatTimestamp(alert.time)}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="context" disabled={!hasUrls || !canSeeContextEnrichment}>
              Context
              {!canSeeContextEnrichment && <Lock className="w-3 h-3 ml-1.5 opacity-50" />}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-180px)] pr-4 mt-4">
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Summary Card */}
              <Card className="p-4 bg-card">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-lg mb-1">{alert.entity}</div>
                      <div className="text-sm text-muted-foreground">{alert.category}</div>
                    </div>
                    <Badge className={SEVERITY_COLORS[alert.severity]}>
                      {alert.severity}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Provider</div>
                      <div className="font-medium">{alert.provider}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Confidence</div>
                      <div className="font-medium">{formatConfidence(alert.confidence)}</div>
                      {/* Confidence explanation gated */}
                      <GatedContent 
                        isGated={!canSeeConfidenceExplanation} 
                        contentType="confidence"
                        compact
                        className="mt-1"
                      >
                        <span className="text-xs text-muted-foreground">
                          Based on source reliability and data freshness
                        </span>
                      </GatedContent>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Description - allowed for all */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {alert.description}
                </p>
              </div>

              {/* Evidence - gated for free users */}
              {alert.evidence && alert.evidence.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Evidence</h3>
                  <GatedContent 
                    isGated={!canSeeEvidence} 
                    contentType="evidence"
                    fallback={
                      <div className="space-y-2">
                        {alert.evidence.slice(0, 2).map((_, idx) => (
                          <Card key={idx} className="p-3 bg-muted/20">
                            <div className="h-16 bg-muted/50 rounded animate-pulse" />
                          </Card>
                        ))}
                      </div>
                    }
                  >
                    <div className="space-y-2">
                      {alert.evidence.map((item, idx) => (
                        <Card key={idx} className="p-3 bg-muted/20">
                          <pre className="text-xs overflow-x-auto text-foreground">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        </Card>
                      ))}
                    </div>
                  </GatedContent>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-4">
                {onExplain && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => onExplain(alert.id)}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Explain This Alert
                  </Button>
                )}

                {canAssign && onAssign && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => onAssign(alert.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign to Team Member
                  </Button>
                )}

                {onAddToReport && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => onAddToReport(alert.id)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Add to Report
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="context" className="mt-0">
              {!canSeeContextEnrichment ? (
                <GatedContent isGated contentType="context">
                  <div />
                </GatedContent>
              ) : hasUrls ? (
                <ContextEnrichmentPanel urls={urls} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No URL available for this alert.
                </p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
