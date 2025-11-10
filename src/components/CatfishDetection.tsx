import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, UserCheck, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeDialog } from './UpgradeDialog';

interface CatfishDetectionProps {
  scanId: string;
}

interface AnalysisResult {
  analysis: string;
  scores: {
    identityConsistency: number;
    authenticityScore: number;
    catfishRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  correlationData: any;
  scanData: {
    socialProfilesCount: number;
    dataSourcesCount: number;
    identityGraph: any;
  };
}

export const CatfishDetection = ({ scanId }: CatfishDetectionProps) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();
  const { isPremium } = useSubscription();

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
      toast({
        title: "Analysis Complete",
        description: "Catfish detection and identity correlation completed",
      });
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'MEDIUM': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'HIGH': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'CRITICAL': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getRiskEmoji = (risk: string) => {
    switch (risk) {
      case 'LOW': return '✅';
      case 'MEDIUM': return '⚠️';
      case 'HIGH': return '🔴';
      case 'CRITICAL': return '🚨';
      default: return '🔍';
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

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>AI-Powered Catfish Detection</CardTitle>
            <CardDescription>
              Identity correlation, behavioral analysis, and authenticity verification
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="text-center py-8">
            {!isPremium && (
              <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Lock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-primary mb-1">Premium Feature</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro to unlock catfish detection and identity verification
                </p>
              </div>
            )}
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Run comprehensive catfish detection to verify identity authenticity through:
            </p>
            <ul className="text-sm text-muted-foreground mb-6 space-y-2 text-left max-w-md mx-auto">
              <li>✓ Cross-platform identity correlation</li>
              <li>✓ Behavioral pattern analysis</li>
              <li>✓ Profile age and activity verification</li>
              <li>✓ Social media facial matching</li>
              <li>✓ Username consistency checking</li>
            </ul>
            <Button onClick={runDetection} disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Identity...
                </>
              ) : (
                <>
                  {!isPremium && <Lock className="mr-2 h-4 w-4" />}
                  {isPremium && <Shield className="mr-2 h-4 w-4" />}
                  {isPremium ? 'Run Catfish Detection' : 'Upgrade to Unlock'}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Risk Level Alert */}
            <Alert className={`border-2 ${getRiskColor(result.scores.catfishRisk)}/20`}>
              <div className="flex items-center gap-2">
                {getRiskIcon(result.scores.catfishRisk)}
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span>{getRiskEmoji(result.scores.catfishRisk)}</span>
                    Catfish Risk: <strong className="text-primary">{result.scores.catfishRisk}</strong>
                  </h4>
                  <AlertDescription>
                    {result.scores.catfishRisk === 'LOW' && 'Identity appears authentic with strong verification signals'}
                    {result.scores.catfishRisk === 'MEDIUM' && 'Some inconsistencies detected, exercise caution'}
                    {result.scores.catfishRisk === 'HIGH' && 'Multiple red flags detected, high probability of fake identity'}
                    {result.scores.catfishRisk === 'CRITICAL' && 'Severe authenticity concerns, likely catfish profile'}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Identity Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{result.scores.identityConsistency}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cross-platform verification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Authenticity Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{result.scores.authenticityScore}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Overall confidence level
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Data Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {result.scanData.socialProfilesCount + result.scanData.dataSourcesCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.scanData.socialProfilesCount} profiles, {result.scanData.dataSourcesCount} sources
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Detailed Analysis</CardTitle>
                <CardDescription>Expand sections to view in-depth findings</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {formatAnalysis(result.analysis)}
                </Accordion>
              </CardContent>
            </Card>

            {/* Identity Graph */}
            {result.scanData.identityGraph && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Identity Correlation Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(result.scanData.identityGraph, null, 2)}
                  </pre>
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
          </div>
        )}
        <UpgradeDialog 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog} 
          feature="Catfish detection and identity verification"
        />
      </CardContent>
    </Card>
  );
};
