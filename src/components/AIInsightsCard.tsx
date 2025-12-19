import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Info, TrendingUp, Shield, Loader2, Crown, Zap, Phone, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Finding } from "@/lib/ufm";
import { AIActionButton } from "@/components/AIActionButton";
import { enableMonitoring } from "@/lib/monitoring";
import { HelpIcon } from "@/components/ui/help-icon";
import { cn } from "@/lib/utils";

interface AIAction {
  title: string;
  description: string;
  type: 'removal' | 'monitoring' | 'security' | 'privacy';
  priority: 'high' | 'medium' | 'low';
  sourceIds?: string[];
}

interface PhoneInsightsResponse {
  summary: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  keySignals: string[];
  recommendedActions: string[];
  confidence: number;
  fallbackMode?: boolean;
  fallbackReason?: string;
}

interface AIInsightsCardProps {
  findings: Finding[];
  subscriptionTier: string;
  scanId: string;
  userId?: string;
  dataSources?: Array<{ id: string; name: string; category: string }>;
  scanType?: 'username' | 'email' | 'phone' | 'personal_details';
}

export const AIInsightsCard = ({ 
  findings, 
  subscriptionTier, 
  scanId, 
  userId, 
  dataSources = [],
  scanType = 'username'
}: AIInsightsCardProps) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [phoneInsights, setPhoneInsights] = useState<PhoneInsightsResponse | null>(null);
  const [actions, setActions] = useState<AIAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const { toast } = useToast();

  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';
  const isPhoneScan = scanType === 'phone';

  const generateInsights = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI correlation analysis is available for Premium subscribers.",
        variant: "destructive",
      });
      return;
    }

    if (findings.length === 0) {
      toast({
        title: "No Data",
        description: "No findings available to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setIsFallbackMode(false);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-correlation', {
        body: { 
          findings: findings.slice(0, 50), // Limit to 50 findings to avoid token limits
          scanType 
        },
      });

      if (functionError) {
        // Supabase wraps non-2xx edge function responses in `functionError`.
        const ctx = (functionError as any)?.context;

        let parsedBody: any = null;
        try {
          if (data && typeof data === 'object') parsedBody = data;
          else if (typeof ctx?.body === 'string' && ctx.body.trim()) parsedBody = JSON.parse(ctx.body);
          else if (ctx?.body && typeof ctx.body === 'object') parsedBody = ctx.body;
        } catch {
          // ignore parse errors
        }

        const actualError = parsedBody?.error || '';
        const errorCode = parsedBody?.code || '';
        const errorStatus = Number(parsedBody?.status ?? ctx?.status ?? 0);
        const wrapperError = functionError.message || '';
        const errorLower = (actualError + ' ' + wrapperError).toLowerCase();

        console.log('[AIInsightsCard] Error details:', {
          actualError,
          errorCode,
          errorStatus,
          wrapperError,
          ctxStatus: ctx?.status,
        });

        // Prefer structured codes/status, then text patterns.
        if (errorCode === 'RATE_LIMIT_EXCEEDED' || errorStatus === 429 || errorLower.includes('rate limit')) {
          setError('Rate limit exceeded. Please wait a few minutes and try again.');
        } else if (errorCode === 'PAYMENT_REQUIRED' || errorStatus === 402 || errorLower.includes('credits')) {
          setError('Insufficient credits. Please add credits to your workspace to use AI features.');
        } else if (errorLower.includes('premium') || errorLower.includes('upgrade')) {
          setError('Premium subscription required for AI insights');
        } else if (actualError) {
          setError(actualError);
        } else if (wrapperError.includes('non-2xx')) {
          setError('AI service temporarily unavailable. Please try again in a moment.');
        } else {
          setError(wrapperError || 'Unable to generate insights');
        }
        return;
      }

      // Check for fallback mode
      if (data?.fallbackMode) {
        setIsFallbackMode(true);
      }

      // Handle phone scan response
      if (isPhoneScan && data?.summary) {
        setPhoneInsights({
          summary: data.summary,
          riskScore: data.riskScore || 0,
          riskLevel: data.riskLevel || 'low',
          keySignals: data.keySignals || [],
          recommendedActions: data.recommendedActions || [],
          confidence: data.confidence || 0.8,
          fallbackMode: data.fallbackMode,
          fallbackReason: data.fallbackReason,
        });
        toast({
          title: data.fallbackMode ? "Analysis Complete (Fallback)" : "AI Analysis Complete",
          description: `Risk Level: ${data.riskLevel?.toUpperCase()} - ${data.keySignals?.length || 0} signals detected`,
        });
      } else if (data?.analysis) {
        // Handle standard scan response
        setInsights(data.analysis);
        setActions(data.actions || []);
        toast({
          title: data.fallbackMode ? "Analysis Complete (Fallback)" : "AI Analysis Complete",
          description: `Analyzed ${data.findings_analyzed} findings with ${data.actions?.length || 0} suggested actions`,
        });
      } else {
        throw new Error('No analysis returned');
      }
    } catch (err) {
      console.error('[AIInsightsCard] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      toast({
        title: "Analysis Failed",
        description: "Unable to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseInsights = (text: string): string[] => {
    const lines = text
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[•\-*\d.]+\s*/, ''));

    return lines;
  };

  const executeAction = async (action: AIAction): Promise<void> => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to execute actions.",
        variant: "destructive",
      });
      return;
    }

    try {
      switch (action.type) {
        case 'removal':
          if (action.sourceIds && action.sourceIds.length > 0) {
            for (const sourceId of action.sourceIds) {
              const source = dataSources.find(s => s.id === sourceId);
              if (source) {
                await supabase.from("removal_requests").insert({
                  user_id: userId,
                  scan_id: scanId,
                  source_id: sourceId,
                  source_name: source.name,
                  source_type: source.category,
                  status: 'pending',
                });
              }
            }
            toast({
              title: "Removal Requests Initiated",
              description: `Started removal process for ${action.sourceIds.length} source(s)`,
            });
          } else {
            toast({
              title: "Manual Action Required",
              description: action.description,
            });
          }
          break;

        case 'monitoring':
          const { error: monitoringError } = await enableMonitoring(scanId, userId);
          if (monitoringError) throw monitoringError;
          toast({
            title: "Monitoring Enabled",
            description: "You'll receive alerts for new data exposures",
          });
          break;

        case 'security':
        case 'privacy':
          toast({
            title: "Action Guidance",
            description: action.description,
            duration: 8000,
          });
          break;

        default:
          toast({
            title: "Action Noted",
            description: action.description,
          });
      }
    } catch (error) {
      console.error('[AIInsightsCard] Action execution error:', error);
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : "Failed to execute action",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-destructive/10 border-destructive/20';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-muted/10 border-border';
    }
  };

  const hasContent = insights || phoneInsights;

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {isPhoneScan ? (
            <Phone className="h-5 w-5 text-primary" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" />
          )}
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <HelpIcon helpKey="ai_insights" />
          {!isPremium && <Badge variant="secondary"><Crown className="h-3 w-3 mr-1" />Premium</Badge>}
          {isFallbackMode && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
              <AlertCircle className="h-3 w-3 mr-1" />
              Fallback Mode
            </Badge>
          )}
        </div>
        {!hasContent && (
          <Button 
            onClick={generateInsights} 
            disabled={loading || !isPremium}
            size="sm"
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        )}
      </div>

      {!isPremium && !hasContent && (
        <div className="text-center py-8 text-muted-foreground">
          <Crown className="h-12 w-12 mx-auto mb-3 text-primary/50" />
          <p className="text-sm mb-2">AI-powered correlation analysis is a Premium feature</p>
          <p className="text-xs">Upgrade to unlock advanced insights and risk detection</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Phone scan insights display */}
      {phoneInsights && (
        <div className="space-y-4">
          {isFallbackMode && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                AI service temporarily unavailable. Showing deterministic analysis based on findings.
              </p>
            </div>
          )}

          {/* Risk Score Display */}
          <div className={cn(
            "p-4 rounded-lg border",
            getRiskBgColor(phoneInsights.riskLevel)
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Risk Assessment</span>
              <Badge className={cn("uppercase", getRiskColor(phoneInsights.riskLevel))}>
                {phoneInsights.riskLevel}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{phoneInsights.riskScore}</div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      phoneInsights.riskLevel === 'high' ? 'bg-destructive' :
                      phoneInsights.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    )}
                    style={{ width: `${phoneInsights.riskScore}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Confidence: {Math.round(phoneInsights.confidence * 100)}%
            </p>
          </div>

          {/* Summary */}
          <div className="p-4 bg-background/50 rounded-lg border border-border/50">
            <p className="text-sm leading-relaxed">{phoneInsights.summary}</p>
          </div>

          {/* Key Signals */}
          {phoneInsights.keySignals.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Key Signals
              </h4>
              <div className="space-y-2">
                {phoneInsights.keySignals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <p className="text-sm">{signal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {phoneInsights.recommendedActions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Recommended Actions
              </h4>
              <div className="space-y-2">
                {phoneInsights.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                    <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                    <p className="text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Disclaimer */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground italic">
              Phone intelligence is probabilistic. Results reflect aggregated public and commercial signals, not guaranteed identity.
            </p>
          </div>

          <Button 
            onClick={generateInsights} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Regenerate Insights
          </Button>
        </div>
      )}

      {/* Standard scan insights display */}
      {insights && !phoneInsights && (
        <div className="space-y-3">
          {isFallbackMode && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                AI service temporarily unavailable. Showing deterministic analysis based on findings.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              AI-generated analysis of {findings.length} findings
            </p>
          </div>
          
          <div className="space-y-2">
            {parseInsights(insights).map((insight, index) => {
              let Icon = Info;
              let colorClass = "text-blue-500";
              
              if (insight.toLowerCase().includes('risk') || insight.toLowerCase().includes('critical') || insight.toLowerCase().includes('vulnerability')) {
                Icon = AlertTriangle;
                colorClass = "text-destructive";
              } else if (insight.toLowerCase().includes('pattern') || insight.toLowerCase().includes('correlation')) {
                Icon = TrendingUp;
                colorClass = "text-primary";
              } else if (insight.toLowerCase().includes('recommend') || insight.toLowerCase().includes('action')) {
                Icon = Shield;
                colorClass = "text-green-500";
              }

              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              );
            })}
          </div>

          {actions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Recommended Actions</h4>
                <Badge variant="secondary" className="text-xs">{actions.length}</Badge>
              </div>
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <AIActionButton
                    key={index}
                    action={action}
                    onExecute={executeAction}
                  />
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={generateInsights} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Regenerate Insights
          </Button>
        </div>
      )}
    </Card>
  );
};
