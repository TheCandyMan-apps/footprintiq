import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Shield,
  Info,
  Clock,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import { EnrichmentDialog } from './EnrichmentDialog';
import { QuickAnalysisDialog } from './QuickAnalysisDialog';

interface Evidence {
  key?: string;
  value?: string | number | boolean | unknown;
  metadata?: Record<string, unknown>;
}

interface FindingCardProps {
  finding: {
    id: string;
    provider: string;
    kind: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    confidence: number;
    observed_at: string;
    evidence: Evidence[];
    meta?: Record<string, any>;
  };
}

const REMEDIATION_SUGGESTIONS: Record<string, string[]> = {
  'breach.password': [
    'Immediately change your password on the affected service',
    'Enable two-factor authentication if available',
    'Use a unique, strong password (12+ characters with mix of types)',
    'Consider using a password manager to generate and store passwords',
    'Check if other accounts use the same password and update them',
  ],
  'breach.email': [
    'Monitor your email for suspicious activity',
    'Enable spam filtering and be cautious of phishing attempts',
    'Consider creating a new email address for sensitive accounts',
    'Review all accounts associated with this email',
    'Set up email forwarding if you decide to abandon this address',
  ],
  'identity.exposed': [
    'Review privacy settings on all social media accounts',
    'Remove unnecessary personal information from public profiles',
    'Set up Google Alerts for your name to monitor mentions',
    'Consider opting out of people search sites',
    'Be cautious about sharing personal information online',
  ],
  'social_media.profile': [
    'Review and update privacy settings on this platform',
    'Remove old posts that contain sensitive information',
    'Limit who can see your profile and posts',
    'Be selective about accepting friend/follow requests',
    'Regularly audit your connected apps and permissions',
  ],
  default: [
    'Review the exposed information and assess the risk',
    'Consider contacting the service provider to request removal',
    'Update your privacy settings on related platforms',
    'Monitor for any suspicious activity related to this exposure',
    'Document this finding for your records',
  ],
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
    case 'high':
      return <AlertTriangle className="w-5 h-5" />;
    case 'medium':
      return <Info className="w-5 h-5" />;
    case 'low':
    case 'info':
      return <CheckCircle2 className="w-5 h-5" />;
    default:
      return <Shield className="w-5 h-5" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    case 'high':
      return 'text-orange-600 dark:text-orange-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'low':
      return 'text-blue-600 dark:text-blue-400';
    case 'info':
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getRemediationSteps = (kind: string, severity: string): string[] => {
  // Try exact match first
  if (REMEDIATION_SUGGESTIONS[kind]) {
    return REMEDIATION_SUGGESTIONS[kind];
  }
  
  // Try category match (e.g., "breach.password" -> "breach")
  const category = kind.split('.')[0];
  const categoryMatch = Object.keys(REMEDIATION_SUGGESTIONS).find(key => 
    key.startsWith(category)
  );
  
  if (categoryMatch && REMEDIATION_SUGGESTIONS[categoryMatch]) {
    return REMEDIATION_SUGGESTIONS[categoryMatch];
  }
  
  // Return default suggestions
  return REMEDIATION_SUGGESTIONS.default;
};

export function FindingCard({ finding }: FindingCardProps) {
  const { workspace } = useWorkspace();
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isRemediationOpen, setIsRemediationOpen] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentOpen, setEnrichmentOpen] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const remediationSteps = getRemediationSteps(finding.kind, finding.severity);
  const severityColor = getSeverityColor(finding.severity);

  const handleQuickAnalysis = async () => {
    if (!workspace?.id) {
      toast.error("No workspace selected");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisOpen(true);
    setAnalysisData(null);

    try {
      const { data, error } = await supabase.functions.invoke('quick-analysis', {
        body: {
          findingId: finding.id,
          workspaceId: workspace.id
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'insufficient_credits') {
          toast.error(`Insufficient credits. Need 2 credits, have ${data.balance}`);
        } else if (data.error === 'rate_limit_exceeded') {
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          toast.error(`Analysis failed: ${data.error}`);
        }
        setAnalysisOpen(false);
        return;
      }

      setAnalysisData(data.analysis);
      toast.success(`Quick analysis complete! (2 credits used)`);
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze finding");
      setAnalysisOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeepEnrichment = async () => {
    if (!workspace?.id) {
      toast.error("No workspace selected");
      return;
    }

    setIsEnriching(true);
    setEnrichmentOpen(true);
    setEnrichmentData(null);

    try {
      const { data, error } = await supabase.functions.invoke('enrich-finding', {
        body: {
          findingId: finding.id,
          workspaceId: workspace.id
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'insufficient_credits') {
          toast.error(`Insufficient credits. Need 5 credits, have ${data.balance}`);
        } else if (data.error === 'rate_limit_exceeded') {
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          toast.error(`Enrichment failed: ${data.error}`);
        }
        setEnrichmentOpen(false);
        return;
      }

      setEnrichmentData(data.enrichment);
      toast.success(`Deep enrichment complete! (5 credits used)`);
    } catch (error: any) {
      console.error('Enrichment error:', error);
      toast.error("Failed to enrich finding");
      setEnrichmentOpen(false);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`mt-1 ${severityColor}`}>
            {getSeverityIcon(finding.severity)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge 
                variant={
                  finding.severity === 'critical' || finding.severity === 'high' 
                    ? 'destructive' 
                    : finding.severity === 'medium' 
                    ? 'default' 
                    : 'secondary'
                }
              >
                {finding.severity.toUpperCase()}
              </Badge>
              <span className="text-sm font-semibold text-foreground">
                {finding.provider}
              </span>
              <span className="text-xs text-muted-foreground">
                • {finding.kind}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {finding.kind.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(finding.observed_at).toLocaleDateString()} {new Date(finding.observed_at).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {Math.round(finding.confidence * 100)}% confidence
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Action Buttons */}
      <div className="flex gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleQuickAnalysis}
          disabled={isAnalyzing}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          {isAnalyzing ? "Analyzing..." : "Quick Analysis (2 credits)"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeepEnrichment}
          disabled={isEnriching}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isEnriching ? "Enriching..." : "Deep Enrichment (5 credits)"}
        </Button>
      </div>

      {/* Evidence Section */}
      {finding.evidence && finding.evidence.length > 0 && (
        <Collapsible open={isEvidenceOpen} onOpenChange={setIsEvidenceOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between mb-2"
            >
              <span className="font-medium">Evidence ({finding.evidence.length} items)</span>
              {isEvidenceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="space-y-3">
                {finding.evidence
                  .filter(ev => ev.key && ev.value !== undefined)
                  .map((ev, idx) => (
                    <div key={idx} className="border-b border-border last:border-0 pb-2 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase min-w-[120px]">
                          {ev.key!.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm text-foreground break-all flex-1">
                          {String(ev.value)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Remediation Section */}
      <Collapsible open={isRemediationOpen} onOpenChange={setIsRemediationOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between mt-3"
          >
            <span className="font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Remediation Steps
            </span>
            {isRemediationOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="border border-border rounded-lg p-4 bg-accent/5">
            <ol className="space-y-2 list-decimal list-inside">
              {remediationSteps.map((step, idx) => (
                <li key={idx} className="text-sm text-foreground">
                  <span className="ml-2">{step}</span>
                </li>
              ))}
            </ol>
            {finding.meta?.url && (
              <div className="mt-4 pt-3 border-t border-border">
                <a 
                  href={finding.meta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View source
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Additional Metadata */}
      {finding.meta && Object.keys(finding.meta).length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Show technical details
          </summary>
          <div className="mt-2 p-3 bg-muted/20 rounded text-xs font-mono overflow-auto max-h-40">
            <pre>{JSON.stringify(finding.meta, null, 2)}</pre>
          </div>
        </details>
      )}

      <QuickAnalysisDialog
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
        analysis={analysisData}
        isLoading={isAnalyzing}
        creditsSpent={2}
      />

      <EnrichmentDialog
        open={enrichmentOpen}
        onOpenChange={setEnrichmentOpen}
        enrichment={enrichmentData}
        isLoading={isEnriching}
        creditsSpent={5}
      />
    </Card>
  );
}
