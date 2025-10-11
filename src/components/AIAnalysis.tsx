import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysisProps {
  scanId: string;
}

export const AIAnalysis = ({ scanId }: AIAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { scanId }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your privacy scan results",
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not generate AI analysis",
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
                  <Brain className="mr-2 h-4 w-4" />
                  Generate AI Analysis
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
      </CardContent>
    </Card>
  );
};
