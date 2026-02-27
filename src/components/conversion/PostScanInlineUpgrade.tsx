/**
 * PostScanInlineUpgrade - Contextual inline upgrade card shown after Free results
 * Replaces aggressive modals with a natural, data-driven CTA at the scroll endpoint.
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRight, TrendingUp, Eye, Network, FileText } from 'lucide-react';
import { InlineUpgradeModal } from '@/components/results/InlineUpgradeModal';

interface PostScanInlineUpgradeProps {
  exposureCount: number;
  hiddenCount: number;
  highConfidenceCount: number;
}

export function PostScanInlineUpgrade({ exposureCount, hiddenCount, highConfidenceCount }: PostScanInlineUpgradeProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Dynamic headline based on scan data */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  You found {exposureCount} exposures — Pro reveals the full picture
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {hiddenCount > 0
                  ? `${hiddenCount} findings are hidden. Pro shows every result with risk scoring, evidence, and removal guidance.`
                  : `Get risk-ranked results, confidence scoring, and actionable removal steps.`}
              </p>
            </div>

            {/* Value props grid - mobile-friendly */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: TrendingUp, label: 'Risk scoring', desc: 'Know what matters most' },
                { icon: Eye, label: 'Full evidence', desc: 'See every finding' },
                { icon: Network, label: 'Connection map', desc: 'How identities link' },
                { icon: FileText, label: 'Export reports', desc: 'PDF & CSV ready' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                  <Icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-foreground">{label}</div>
                    <div className="text-[10px] text-muted-foreground">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA - large touch target for mobile */}
            <Button
              onClick={() => setShowModal(true)}
              size="lg"
              className="w-full gap-2 h-12 text-base font-semibold"
            >
              Switch to Pro Intelligence
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-[10px] text-muted-foreground/60 text-center">
              Trusted by privacy-conscious individuals and professionals.
            </p>
          </div>
        </CardContent>
      </Card>
      <InlineUpgradeModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
