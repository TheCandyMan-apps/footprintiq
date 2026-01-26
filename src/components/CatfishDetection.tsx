import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, AlertTriangle, CheckCircle2, Loader2, UserCheck, Lock, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeDialog } from './UpgradeDialog';
import { HelpIcon } from '@/components/ui/help-icon';

interface CatfishDetectionProps {
  scanId: string;
  scanType?: string;
  hasUsername?: boolean;
}

interface IdentityMismatchSignal {
  type: 'name_mismatch' | 'age_inconsistency' | 'location_conflict' | 'image_mismatch' | 'bio_conflict' | 'timeline_gap';
  description: string;
  sources: string[];
  confidence: number; // 0-100
}

interface AnalysisResult {
  success?: boolean;
  notApplicable?: boolean;
  message?: string;
  analysis: string;
  scores: {
    identityConsistency: number | null;
    authenticityScore: number | null;
    catfishRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'N/A';
  };
  correlationData: any;
  scanData: {
    socialProfilesCount?: number;
    dataSourcesCount?: number;
    platformPresencesCount?: number;
    identityGraph: any;
  };
  // New: explicit mismatch signals
  mismatchSignals?: IdentityMismatchSignal[];
}

/**
 * Severity Calculation Rules:
 * - Neutral: No signals detected → Don't render component
 * - Low: Single weak signal (confidence < 50)
 * - Medium: Multiple related signals OR single strong signal (confidence >= 50)
 * - High: 3+ signals with at least one high-confidence
 * - Critical: Only with corroborated evidence (4+ signals, multiple high-confidence)
 */
function calculateEvidenceBasedSeverity(
  signals: IdentityMismatchSignal[],
  identityConsistency: number | null,
  authenticityScore: number | null
): { severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null; canShow: boolean } {
  // No signals = don't show anything
  if (!signals || signals.length === 0) {
    return { severity: null, canShow: false };
  }

  const highConfidenceSignals = signals.filter(s => s.confidence >= 70);
  const moderateConfidenceSignals = signals.filter(s => s.confidence >= 50 && s.confidence < 70);
  const totalSignals = signals.length;

  // Critical: 4+ signals with at least 2 high-confidence (corroborated evidence)
  if (totalSignals >= 4 && highConfidenceSignals.length >= 2) {
    return { severity: 'CRITICAL', canShow: true };
  }

  // High: 3+ signals with at least one high-confidence
  if (totalSignals >= 3 && highConfidenceSignals.length >= 1) {
    return { severity: 'HIGH', canShow: true };
  }

  // Medium: Multiple related signals OR single strong signal
  if (totalSignals >= 2 || highConfidenceSignals.length >= 1) {
    return { severity: 'MEDIUM', canShow: true };
  }

  // Low: Single weak signal
  if (totalSignals === 1 && signals[0].confidence < 50) {
    return { severity: 'LOW', canShow: true };
  }

  // Default to Medium for single moderate signal
  if (totalSignals === 1) {
    return { severity: 'MEDIUM', canShow: true };
  }

  return { severity: null, canShow: false };
}

/**
 * Extract identity mismatch signals from analysis result
 * This parses the backend response to identify actual conflicts
 */
function extractMismatchSignals(result: AnalysisResult): IdentityMismatchSignal[] {
  const signals: IdentityMismatchSignal[] = [];
  
  // Check for explicit mismatch signals from backend
  if (result.mismatchSignals && result.mismatchSignals.length > 0) {
    return result.mismatchSignals;
  }

  // Derive signals from scores if not explicitly provided
  const { identityConsistency, authenticityScore } = result.scores;
  const correlationData = result.correlationData || {};
  
  // Low identity consistency indicates mismatches
  if (identityConsistency !== null && identityConsistency < 70) {
    signals.push({
      type: 'name_mismatch',
      description: 'Cross-platform identity inconsistency detected',
      sources: ['identity_correlation'],
      confidence: Math.max(0, 100 - identityConsistency),
    });
  }

  // Check correlation data for specific conflicts
  if (correlationData.nameConflicts && correlationData.nameConflicts.length > 0) {
    signals.push({
      type: 'name_mismatch',
      description: `Name variations detected across ${correlationData.nameConflicts.length} platforms`,
      sources: correlationData.nameConflicts.map((c: any) => c.platform || 'unknown'),
      confidence: 65,
    });
  }

  if (correlationData.ageConflicts && correlationData.ageConflicts.length > 0) {
    signals.push({
      type: 'age_inconsistency',
      description: 'Conflicting age information found',
      sources: correlationData.ageConflicts.map((c: any) => c.platform || 'unknown'),
      confidence: 70,
    });
  }

  if (correlationData.locationConflicts && correlationData.locationConflicts.length > 0) {
    signals.push({
      type: 'location_conflict',
      description: 'Geographic location inconsistencies detected',
      sources: correlationData.locationConflicts.map((c: any) => c.platform || 'unknown'),
      confidence: 55,
    });
  }

  if (correlationData.imageAnalysis?.mismatchDetected) {
    signals.push({
      type: 'image_mismatch',
      description: 'Profile images may not match across platforms',
      sources: ['image_analysis'],
      confidence: correlationData.imageAnalysis.confidence || 60,
    });
  }

  if (correlationData.bioConflicts && correlationData.bioConflicts.length > 0) {
    signals.push({
      type: 'bio_conflict',
      description: 'Contradictory biographical information found',
      sources: correlationData.bioConflicts.map((c: any) => c.platform || 'unknown'),
      confidence: 50,
    });
  }

  // Timeline gaps (e.g., account created after claimed employment)
  if (correlationData.timelineAnomalies && correlationData.timelineAnomalies.length > 0) {
    signals.push({
      type: 'timeline_gap',
      description: 'Timeline inconsistencies detected in account history',
      sources: ['timeline_analysis'],
      confidence: 60,
    });
  }

  return signals;
}

const SEVERITY_CONFIG = {
  LOW: {
    color: 'bg-green-500/10 border-green-500/30',
    textColor: 'text-green-600',
    icon: CheckCircle2,
    label: 'Low Concern',
    description: 'Minor inconsistency detected. Likely a data quality issue rather than identity fraud.',
  },
  MEDIUM: {
    color: 'bg-yellow-500/10 border-yellow-500/30',
    textColor: 'text-yellow-600',
    icon: AlertTriangle,
    label: 'Moderate Concern',
    description: 'Some profile attributes conflict. Manual verification recommended.',
  },
  HIGH: {
    color: 'bg-orange-500/10 border-orange-500/30',
    textColor: 'text-orange-600',
    icon: AlertTriangle,
    label: 'Elevated Concern',
    description: 'Multiple red flags detected across sources. Exercise caution.',
  },
  CRITICAL: {
    color: 'bg-destructive/10 border-destructive/30',
    textColor: 'text-destructive',
    icon: AlertTriangle,
    label: 'Significant Concern',
    description: 'Corroborated evidence of identity inconsistencies. Thorough verification strongly advised.',
  },
};

const SIGNAL_TYPE_LABELS: Record<IdentityMismatchSignal['type'], string> = {
  name_mismatch: 'Name Mismatch',
  age_inconsistency: 'Age Inconsistency',
  location_conflict: 'Location Conflict',
  image_mismatch: 'Image Mismatch',
  bio_conflict: 'Bio Conflict',
  timeline_gap: 'Timeline Gap',
};

export const CatfishDetection = ({ scanId, scanType, hasUsername }: CatfishDetectionProps) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();
  const { isPremium } = useSubscription();

  const isUsernameBasedScan = hasUsername || scanType === 'username' || scanType === 'social_media';

  // Extract mismatch signals from result
  const mismatchSignals = useMemo(() => {
    if (!result) return [];
    return extractMismatchSignals(result);
  }, [result]);

  // Calculate evidence-based severity
  const { severity, canShow } = useMemo(() => {
    if (!result) return { severity: null, canShow: false };
    return calculateEvidenceBasedSeverity(
      mismatchSignals,
      result.scores.identityConsistency,
      result.scores.authenticityScore
    );
  }, [result, mismatchSignals]);

  useEffect(() => {
    if (isPremium && scanId && !result && !loading && isUsernameBasedScan) {
      runDetection();
    }
  }, [scanId, isPremium, isUsernameBasedScan]);

  const runDetection = async () => {
    if (!isPremium) {
      setShowUpgradeDialog(true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('behavioral-analysis', {
        body: { scanId }
      });

      if (error) throw error;

      setResult(data);
      
      if (!data.notApplicable) {
        toast({
          title: "Analysis Complete",
          description: "Identity correlation analysis completed",
        });
      }
    } catch (error) {
      console.error('Error running catfish detection:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not complete analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    const lines = text.split('\n');
    const sections: { [key: string]: string[] } = {};
    let currentSection = 'Overview';
    
    lines.forEach(line => {
      if (line.startsWith('**') && line.endsWith('**')) {
        currentSection = line.replace(/\*\*/g, '').trim();
        sections[currentSection] = [];
      } else if (line.trim()) {
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(line);
      }
    });

    return Object.entries(sections).map(([section, content], sectionIdx) => (
      <AccordionItem key={sectionIdx} value={`section-${sectionIdx}`}>
        <AccordionTrigger className="text-left font-semibold">
          {section}
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2">
            {content.map((line, idx) => {
              const cleanLine = line.replace(/^[-*]\s*/, '').trim();
              const hasScore = /(\d+)%/.test(cleanLine);
              
              return (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    {hasScore ? (
                      cleanLine.split(/(\d+%)/).map((part, i) => 
                        /\d+%/.test(part) ? (
                          <strong key={i} className="text-primary font-bold">{part}</strong>
                        ) : part
                      )
                    ) : cleanLine}
                  </span>
                </li>
              );
            })}
          </ul>
        </AccordionContent>
      </AccordionItem>
    ));
  };

  // Don't render for non-username scans that returned notApplicable
  if (result?.notApplicable) {
    return null; // Don't render at all - not applicable
  }

  // If we have a result but no mismatch signals detected, don't render the component
  if (result && !canShow) {
    return null; // No identity mismatch signals = don't show catfish detection
  }

  // Pre-analysis state - show prompt to run (only for premium username scans)
  if (!result && isPremium && isUsernameBasedScan) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                Identity Verification Available
                <HelpIcon helpKey="catfish_detection" />
              </CardTitle>
              <CardDescription>
                Run analysis to check for identity inconsistencies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={runDetection} disabled={loading} variant="outline" size="sm">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Check for Inconsistencies
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Non-premium or non-username scan - don't render
  if (!result) {
    return null;
  }

  // We have result AND mismatch signals - render the full component
  const severityConfig = severity ? SEVERITY_CONFIG[severity] : null;
  const SeverityIcon = severityConfig?.icon || Info;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="flex items-center gap-2">
              Identity Consistency Analysis
              <HelpIcon helpKey="catfish_detection" />
            </CardTitle>
            <CardDescription>
              {mismatchSignals.length} inconsistenc{mismatchSignals.length === 1 ? 'y' : 'ies'} detected across profiles
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Severity Alert - Only shown when we have signals */}
        {severityConfig && (
          <Alert className={`border ${severityConfig.color}`}>
            <SeverityIcon className={`h-4 w-4 ${severityConfig.textColor}`} />
            <AlertTitle className={severityConfig.textColor}>
              {severityConfig.label}
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm">
              {severityConfig.description}
            </AlertDescription>
          </Alert>
        )}

        {/* Mismatch Signals List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Detected Inconsistencies
          </h4>
          <div className="space-y-2">
            {mismatchSignals.map((signal, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Badge variant="outline" className="text-xs">
                    {SIGNAL_TYPE_LABELS[signal.type]}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{signal.description}</p>
                  {signal.sources.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Sources: {signal.sources.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`text-xs font-medium ${
                    signal.confidence >= 70 ? 'text-orange-600' : 
                    signal.confidence >= 50 ? 'text-yellow-600' : 
                    'text-muted-foreground'
                  }`}>
                    {signal.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Identity Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {result.scores.identityConsistency === null ? '—' : `${result.scores.identityConsistency}%`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cross-platform match rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const profiles = result.scanData.socialProfilesCount ?? result.scanData.platformPresencesCount ?? 0;
                const sources = result.scanData.dataSourcesCount ?? 0;
                return (
                  <>
                    <div className="text-2xl font-bold">{profiles + sources}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {profiles} profiles, {sources} sources
                    </p>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Signals Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mismatchSignals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Identity inconsistencies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        {result.analysis && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Detailed Analysis</CardTitle>
              <CardDescription className="text-xs">Expand sections for findings</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {formatAnalysis(result.analysis)}
              </Accordion>
            </CardContent>
          </Card>
        )}

        <Button 
          onClick={runDetection} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Re-analyzing...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Re-run Analysis
            </>
          )}
        </Button>
      </CardContent>
      
      <UpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog} 
        feature="Identity verification and consistency analysis"
      />
    </Card>
  );
};
