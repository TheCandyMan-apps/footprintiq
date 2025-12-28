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
import { FileText, UserPlus, AlertCircle } from 'lucide-react';
import { ContextEnrichmentPanel } from '@/components/ContextEnrichmentPanel';

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
  low: 'bg-accent/20 text-accent border-accent/30',
  medium: 'bg-primary/20 text-primary border-primary/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
  critical: 'bg-destructive text-destructive-foreground border-destructive',
};

/**
 * Helper to extract the relevant URL from an alert.
 * Checks: url, profile_url, source_url, link fields.
 */
function getAlertUrl(alert: AlertRow | null): string | null {
  if (!alert) return null;
  return alert.url || alert.profile_url || alert.source_url || alert.link || null;
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
  if (!alert) return null;

  const alertUrl = getAlertUrl(alert);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary" />
            Alert Details
          </SheetTitle>
          <SheetDescription>
            {formatTimestamp(alert.time)}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="context" disabled={!alertUrl}>
              Context
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-180px)] pr-4 mt-4">
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Summary Card */}
              <Card className="p-4">
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
                    </div>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {alert.description}
                </p>
              </div>

              {/* Evidence */}
              {alert.evidence && alert.evidence.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Evidence</h3>
                  <div className="space-y-2">
                    {alert.evidence.map((item, idx) => (
                      <Card key={idx} className="p-3 bg-muted/30">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </Card>
                    ))}
                  </div>
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
              {alertUrl ? (
                <ContextEnrichmentPanel url={alertUrl} />
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
