/**
 * Reputation & Abuse Signals Card
 * 
 * Displays normalized reputation intelligence for Pro users.
 * Shows locked teaser with upgrade CTA for Free users.
 * 
 * IMPORTANT COPY CONSTRAINTS:
 * - Never display "Spamhaus", list names, or "blacklisted" language
 * - Use "Reputation signals indicate..." or "Abuse intelligence suggests..."
 * - Verdict is advisory only - final decisions remain with user
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Lock, Shield, AlertTriangle, CheckCircle, HelpCircle, Clock, Info, Mail, Server, Globe, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReputationSignal {
  verdict: 'low' | 'medium' | 'high' | 'unknown';
  categories: string[];
  reasons: string[];
  confidence: number;
  fetchedAt: string;
}

interface ScanEnrichment {
  id: string;
  enrichment_type: string;
  input_type: string;
  input_value: string;
  signal: ReputationSignal;
  verdict: string;
  confidence: number;
  created_at: string;
}

interface ReputationSignalsCardProps {
  scanId: string;
}

// Map internal categories to user-friendly labels
const CATEGORY_LABELS: Record<string, string> = {
  'abuse_infrastructure': 'Abuse Infrastructure Indicators',
  'mail_reputation': 'Mail Reputation Risk',
  'phishing_risk': 'Phishing Risk Indicators',
  'spam_source': 'Spam Source Signals',
  'botnet': 'Botnet Activity Indicators',
  'malware_distribution': 'Malware Distribution Risk',
  'dynamic_ip': 'Dynamic IP Assignment',
  'hosting_risk': 'Hosting Risk Indicators',
  'domain_reputation': 'Domain Reputation Signals',
};

// Map verdicts to visual styles
const VERDICT_CONFIG = {
  low: {
    label: 'Low Risk',
    color: 'bg-green-500/10 text-green-700 border-green-500/30',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  medium: {
    label: 'Moderate Risk',
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  high: {
    label: 'High Risk',
    color: 'bg-red-500/10 text-red-700 border-red-500/30',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  unknown: {
    label: 'Unknown',
    color: 'bg-muted text-muted-foreground border-muted',
    icon: HelpCircle,
    iconColor: 'text-muted-foreground',
  },
};

export function ReputationSignalsCard({ scanId }: ReputationSignalsCardProps) {
  const { workspace } = useWorkspace();
  const [enrichments, setEnrichments] = useState<ScanEnrichment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPro = workspace?.plan && workspace.plan !== 'free';

  useEffect(() => {
    if (!scanId || !isPro) {
      setLoading(false);
      return;
    }

    loadEnrichments();
  }, [scanId, isPro]);

  const loadEnrichments = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('scan_enrichments')
        .select('*')
        .eq('scan_id', scanId)
        .eq('enrichment_type', 'spamhaus');

      if (fetchError) throw fetchError;
      // Map the JSONB signal to our typed interface
      const mappedData = (data || []).map((row: any) => ({
        ...row,
        signal: row.signal as ReputationSignal,
      })) as ScanEnrichment[];
      setEnrichments(mappedData);
    } catch (err) {
      console.error('[ReputationSignalsCard] Error loading enrichments:', err);
      setError('Failed to load reputation signals');
    } finally {
      setLoading(false);
    }
  };

  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Locked teaser for free users
  if (!isPro) {
    return (
      <>
        <Card className="relative overflow-hidden border-dashed border-2 border-muted-foreground/30">
          <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex flex-col items-center justify-center p-6 text-center">
            <Lock className="h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg mb-1">Reputation & Abuse Signals (Pro)</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Identify domains and infrastructure with elevated abuse indicators using trusted intelligence signals.
            </p>
            
            {/* Feature bullets */}
            <ul className="text-sm text-muted-foreground space-y-1.5 mb-4 text-left">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary/70" />
                <span>Mail reputation risk</span>
              </li>
              <li className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5 text-primary/70" />
                <span>Abuse infrastructure indicators</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-primary/70" />
                <span>Passive DNS context</span>
              </li>
            </ul>
            
            <Button onClick={() => setShowUpgradeModal(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Unlock Pro signals
            </Button>
            
            <p className="text-[10px] text-muted-foreground/60 mt-3">
              Advisory signals. No monitoring. Ethical OSINT.
            </p>
          </div>
          
          {/* Blurred preview content */}
          <CardHeader className="opacity-30 select-none">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-base">Reputation & Abuse Signals</CardTitle>
            </div>
            <CardDescription>Advisory reputation intelligence</CardDescription>
          </CardHeader>
          <CardContent className="opacity-30 select-none space-y-3">
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle>Unlock deeper reputation signals</DialogTitle>
              </div>
              <DialogDescription className="text-left">
                Pro adds an intelligence layer that helps you spot risky domains, abuse infrastructure, and suspicious hosting patterns — without dumping raw lists or noisy data.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">Derived reputation verdicts (low/medium/high)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">Explainable categories and reasons</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">Passive DNS context to reduce false positives</span>
                </li>
              </ul>
            </div>
            
            <DialogFooter className="flex-col gap-3 sm:flex-col">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/billing'}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
              <p className="text-[11px] text-center text-muted-foreground">
                Ethical OSINT • Advisory only • Cancel anytime
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <Skeleton className="h-5 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Reputation & Abuse Signals</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // No enrichments found
  if (enrichments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Reputation & Abuse Signals</CardTitle>
          </div>
          <CardDescription>No IP or domain signals available for this scan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Reputation signals are generated when scans discover IP addresses or domains.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render enrichments
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Reputation & Abuse Signals</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {enrichments.length} signal{enrichments.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription>
          Advisory reputation intelligence for discovered infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enrichments.map((enrichment) => {
          const signal = enrichment.signal;
          const verdictConfig = VERDICT_CONFIG[signal.verdict] || VERDICT_CONFIG.unknown;
          const VerdictIcon = verdictConfig.icon;

          return (
            <div 
              key={enrichment.id} 
              className="border rounded-lg p-4 space-y-3"
            >
              {/* Header with input and verdict */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {enrichment.input_type.toUpperCase()}
                  </Badge>
                  <span className="font-medium text-sm">{enrichment.input_value}</span>
                </div>
                <Badge className={cn('border', verdictConfig.color)}>
                  <VerdictIcon className={cn('h-3 w-3 mr-1', verdictConfig.iconColor)} />
                  {verdictConfig.label}
                </Badge>
              </div>

              {/* Categories */}
              {signal.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {signal.categories.map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Reasons */}
              {signal.reasons.length > 0 && (
                <div className="space-y-1">
                  {signal.reasons.map((reason, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      • {reason}
                    </p>
                  ))}
                </div>
              )}

              {/* Confidence and timestamp */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>
                  Confidence: {Math.round(signal.confidence * 100)}%
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Signals updated: {format(new Date(signal.fetchedAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
            </div>
          );
        })}

        {/* Advisory disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong>Advisory only.</strong> Reputation signals are informational and should be 
            considered alongside other evidence. Final risk assessment decisions remain with the analyst.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReputationSignalsCard;
