import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Shield, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2,
  Info,
  Lock,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTierGating } from '@/hooks/useTierGating';
import { supabase } from '@/integrations/supabase/client';

interface HighRiskSignal {
  signal_type: string;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  context: string;
  verified: boolean;
  action_required: boolean;
}

interface HighRiskIntelligenceSectionProps {
  scanId: string;
  optedIn?: boolean;
}

export function HighRiskIntelligenceSection({ 
  scanId,
  optedIn = false,
}: HighRiskIntelligenceSectionProps) {
  const [signals, setSignals] = useState<HighRiskSignal[]>([]);
  const [lensNotes, setLensNotes] = useState<string>('');
  const [exposureDelta, setExposureDelta] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { isFree, isPro, isBusiness } = useTierGating();

  const canAccess = isPro || isBusiness;
  const canSeeRawData = isBusiness; // Only Enterprise/Business sees full details

  useEffect(() => {
    if (!scanId || !optedIn) {
      setLoading(false);
      return;
    }

    loadHighRiskFindings();
  }, [scanId, optedIn]);

  const loadHighRiskFindings = async () => {
    try {
      const { data, error } = await supabase
        .from('findings')
        .select('*')
        .eq('scan_id', scanId)
        .eq('provider', 'osint-high-risk-worker')
        .order('confidence', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedSignals: HighRiskSignal[] = data.map((finding: any) => ({
          signal_type: finding.kind?.replace('high_risk_', '') || 'unknown',
          confidence: finding.confidence || 0.5,
          risk_level: finding.severity || 'medium',
          summary: finding.evidence?.summary || 'No summary available',
          context: finding.evidence?.context || '',
          verified: finding.status === 'verified',
          action_required: finding.evidence?.action_required || false,
        }));

        setSignals(mappedSignals);
        
        // Generate LENS notes based on signals
        const actionRequired = mappedSignals.filter(s => s.action_required).length;
        if (mappedSignals.length === 0) {
          setLensNotes('No high-risk signals detected in monitored sources.');
        } else if (actionRequired > 0) {
          setLensNotes(`${actionRequired} finding(s) warrant review. LENS has filtered unreliable data.`);
        } else {
          setLensNotes(`${mappedSignals.length} signals analyzed. No immediate action required.`);
        }
        
        // Calculate exposure delta
        const delta = mappedSignals.reduce((acc, s) => {
          const base = s.verified ? 10 : 3;
          const mult = s.risk_level === 'critical' ? 2.5 : 
                       s.risk_level === 'high' ? 2 : 
                       s.risk_level === 'medium' ? 1.5 : 1;
          return acc + (base * mult);
        }, 0);
        setExposureDelta(Math.min(Math.round(delta), 50));
      }
    } catch (error) {
      console.error('[HighRiskIntelligenceSection] Error loading findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string, confidence: number) => {
    // Low confidence signals are always muted regardless of risk level
    if (confidence < 0.4) {
      return 'bg-muted/50 text-muted-foreground border-border';
    }
    
    switch (level) {
      case 'critical': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'low': return 'bg-muted/50 text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence < 0.4) return 'Historical';
    if (confidence < 0.7) return 'Informational';
    return 'Review Suggested';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence < 0.4) return 'text-muted-foreground';
    if (confidence < 0.7) return 'text-blue-600';
    return 'text-amber-600';
  };

  const getSignalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'leak': 'Paste Archive Reference',
      'breach': 'Historical Compilation',
      'dark_web': 'Indexed Archive Reference',
      'malware': 'Aggregator Reference',
    };
    return labels[type] || 'Indexed Reference';
  };

  // Not opted in - show minimal prompt
  if (!optedIn) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base text-muted-foreground">
              High-Risk Intelligence
            </CardTitle>
            <Badge variant="outline" className="ml-auto text-xs">
              Not enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            High-Risk Intelligence was not enabled for this scan. 
            Enable it on your next scan to check additional threat sources.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Free tier - show upgrade prompt
  if (!canAccess) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base text-muted-foreground">
              High-Risk Intelligence
            </CardTitle>
            <Badge variant="secondary" className="ml-auto text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Pro+
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro or Business to access enhanced threat detection from 
            additional OSINT sources including breach compilations and dark web monitoring.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/pricing">View Plans</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary animate-pulse" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Separate signals by confidence for display
  const historicalSignals = signals.filter(s => s.confidence < 0.4);
  const informationalSignals = signals.filter(s => s.confidence >= 0.4 && s.confidence < 0.7);
  const reviewSignals = signals.filter(s => s.confidence >= 0.7);
  
  const hasSignals = signals.length > 0;
  const actionRequiredCount = reviewSignals.length;

  return (
    <Card className={actionRequiredCount > 0 ? 'border-amber-500/20' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${
              actionRequiredCount > 0 
                ? 'bg-amber-500/10' 
                : 'bg-accent/10'
            }`}>
              <Shield className={`h-4 w-4 ${
                actionRequiredCount > 0 
                  ? 'text-amber-500' 
                  : 'text-accent'
              }`} />
            </div>
            <CardTitle className="text-base">
              High-Risk Intelligence
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (LENS Filtered)
              </span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {reviewSignals.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
                {reviewSignals.length} for review
              </Badge>
            )}
            {informationalSignals.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {informationalSignals.length} informational
              </Badge>
            )}
            {historicalSignals.length > 0 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {historicalSignals.length} historical
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="mt-2 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{lensNotes}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasSignals ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <div>
              <p className="font-medium text-foreground">No significant exposures detected</p>
              <p className="text-sm text-muted-foreground">
                Your target was not found in monitored high-risk sources.
              </p>
            </div>
          </div>
        ) : (
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between px-3"
              >
                <span className="text-sm">
                  {actionRequiredCount > 0 
                    ? `${actionRequiredCount} reference(s) suggest calm review`
                    : 'View indexed references'
                  }
                </span>
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 pt-3">
              {/* Toggle for business tier raw data */}
              {canSeeRawData && (
                <div className="flex items-center justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Show Details
                      </>
                    )}
                  </Button>
                </div>
              )}

              {signals.map((signal, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getRiskLevelColor(signal.risk_level, signal.confidence)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-foreground">
                          {getSignalTypeLabel(signal.signal_type)}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConfidenceColor(signal.confidence)}`}
                        >
                          {getConfidenceLabel(signal.confidence)}
                        </Badge>
                        {signal.confidence < 0.4 && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            No action required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {signal.summary}
                      </p>
                      {canSeeRawData && showDetails && signal.context && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {signal.context}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground">
                        Confidence
                      </div>
                      <div className={`font-medium ${getConfidenceColor(signal.confidence)}`}>
                        {Math.round(signal.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <strong>Analyst Note:</strong> High-risk intelligence sources are inherently 
                unreliable. Confidence below 40% indicates historical or contextual data only—no 
                action required. References above 70% suggest calm review. LENS has filtered 
                speculative and unsubstantiated signals.
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
