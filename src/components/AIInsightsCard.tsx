import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Info, TrendingUp, Shield, Loader2, Crown, Zap } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Finding } from "@/lib/ufm";
import { AIActionButton } from "@/components/AIActionButton";
import { enableMonitoring } from "@/lib/monitoring";

interface AIAction {
  title: string;
  description: string;
  type: 'removal' | 'monitoring' | 'security' | 'privacy';
  priority: 'high' | 'medium' | 'low';
  sourceIds?: string[];
}

interface AIInsightsCardProps {
  findings: Finding[];
  subscriptionTier: string;
  scanId: string;
  userId?: string;
  dataSources?: Array<{ id: string; name: string; category: string }>;
}

export const AIInsightsCard = ({ findings, subscriptionTier, scanId, userId, dataSources = [] }: AIInsightsCardProps) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [actions, setActions] = useState<AIAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';

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

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-correlation', {
        body: { findings: findings.slice(0, 50) }, // Limit to 50 findings to avoid token limits
      });

      if (functionError) {
        if (functionError.message?.includes('Premium') || functionError.message?.includes('upgrade')) {
          setError('Premium subscription required for AI insights');
        } else {
          throw functionError;
        }
        return;
      }

      if (data?.analysis) {
        setInsights(data.analysis);
        setActions(data.actions || []);
        toast({
          title: "AI Analysis Complete",
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
    // Split by common bullet point indicators and newlines
    const lines = text
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[•\-*\d.]+\s*/, '')); // Remove bullet points

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
          // Request removal for all relevant sources
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
          // Enable monitoring for the scan
          const { error: monitoringError } = await enableMonitoring(scanId, userId);
          if (monitoringError) throw monitoringError;
          toast({
            title: "Monitoring Enabled",
            description: "You'll receive alerts for new data exposures",
          });
          break;

        case 'security':
        case 'privacy':
          // For security/privacy actions, show guidance
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

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
          {!isPremium && <Badge variant="secondary"><Crown className="h-3 w-3 mr-1" />Premium</Badge>}
        </div>
        {!insights && (
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

      {!isPremium && !insights && (
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

      {insights && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              AI-generated analysis of {findings.length} findings
            </p>
          </div>
          
          <div className="space-y-2">
            {parseInsights(insights).map((insight, index) => {
              // Determine icon based on content
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
