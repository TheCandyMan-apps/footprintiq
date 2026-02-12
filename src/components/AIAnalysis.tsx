import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeDialog } from './UpgradeDialog';

interface AIAnalysisProps {
  scanId: string;
}

export const AIAnalysis = ({ scanId }: AIAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();
  const { isPremium } = useSubscription();

  const generateAnalysis = async () => {
    if (!isPremium) {
      setShowUpgradeDialog(true);
      return;
    }

    setLoading(true);
    try {
      console.log('[AIAnalysis] Invoking ai-analysis for scan:', scanId);
      
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { scanId }
      });

      console.log('[AIAnalysis] Response:', { data, error });

      if (error) {
        // Detect specific error types and provide actionable messages
        const errorMsg = error.message || String(error);
        
        if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
          throw new Error('🚦 Rate limit exceeded. Please wait a few minutes and try again.');
        }
        
        if (errorMsg.includes('No data') || errorMsg.includes('no findings') || errorMsg.includes('no profile')) {
          throw new Error('📊 No scan data available for analysis. Please wait for the scan to complete or try running the scan again.');
        }
        
        if (errorMsg.includes('credits') || errorMsg.includes('payment') || errorMsg.includes('402')) {
          throw new Error('💳 Insufficient credits. Please add credits to continue using AI analysis.');
        }
        
        throw new Error(errorMsg);
      }

      if (!data?.analysis || typeof data.analysis !== 'string' || data.analysis.trim().length === 0) {
        throw new Error('⚠️ AI analysis returned no content. Please try regenerating the analysis.');
      }

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your privacy scan results",
      });
    } catch (error) {
      console.error('[AIAnalysis] Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Could not generate AI analysis. Please try again.";
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    // Split by sections and format
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={idx} className="text-lg font-semibold mt-6 mb-2">{line.replace(/\*\*/g, '')}</h3>;
      }
      if (line.startsWith('###')) {
        return <h4 key={idx} className="text-md font-semibold mt-4 mb-2">{line.replace(/###/g, '')}</h4>;
      }
      if (line.trim().startsWith('-')) {
        return <li key={idx} className="ml-6 mb-1">{line.replace(/^-\s*/, '')}</li>;
      }
      if (line.trim()) {
        return <p key={idx} className="mb-2">{line}</p>;
      }
      return <br key={idx} />;
    });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>AI-Powered Privacy Analysis</CardTitle>
            <CardDescription>
              Get personalized insights and recommendations powered by AI
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8">
            {!isPremium && (
              <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Lock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-primary mb-1">Pro Intelligence Feature</p>
                <p className="text-sm text-muted-foreground">
                  Activate Pro Intelligence Mode for AI-powered attribution analysis
                </p>
              </div>
            )}
            <p className="text-muted-foreground mb-4">
              Generate an AI analysis to get detailed insights about your privacy scan results,
              including risk prioritization, action plans, and personalized recommendations.
            </p>
            <Button onClick={generateAnalysis} disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  {!isPremium && <Lock className="mr-2 h-4 w-4" />}
                  {isPremium && <Brain className="mr-2 h-4 w-4" />}
                  {isPremium ? 'Generate AI Analysis' : 'Upgrade to Unlock'}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {formatAnalysis(analysis)}
            </div>
            <Button 
              onClick={generateAnalysis} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Regenerate Analysis
                </>
              )}
            </Button>
          </div>
        )}
        <UpgradeDialog 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog} 
          feature="AI-powered privacy analysis"
        />
      </CardContent>
    </Card>
  );
};
