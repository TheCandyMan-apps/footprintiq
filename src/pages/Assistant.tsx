import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, FileText, TrendingUp, Shield, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

export default function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, isPremium } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAskAssistant = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the AI Assistant",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI Assistant is available for Pro users. Upgrade to access.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a question for the AI Assistant",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { prompt, userId: user.id },
      });

      if (error) throw error;

      setResponse(data.analysis || "No response generated");
    } catch (error: any) {
      console.error("AI Assistant error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="AI Enterprise Assistant | FootprintIQ"
        description="Get AI-powered insights and executive briefings about your digital footprint. Automated intelligence reporting for enterprise security."
        canonical="https://footprintiq.app/assistant"
      />
      <Header />
      
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AI Enterprise Assistant</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get intelligent insights, executive briefings, and strategic recommendations powered by advanced AI analysis
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <FileText className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Executive Briefings</CardTitle>
                <CardDescription>
                  Generate comprehensive reports for stakeholders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Trend Analysis</CardTitle>
                <CardDescription>
                  Identify patterns across your digital footprint
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
                <CardDescription>
                  Prioritized recommendations and action plans
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Chat Interface */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ask the Analyst</CardTitle>
              <CardDescription>
                Ask questions about your digital footprint, request insights, or get strategic recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: Analyze my organization's exposure trends over the last 30 days and provide recommendations..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              
              <Button 
                onClick={handleAskAssistant}
                disabled={isLoading || !prompt.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask Assistant
                  </>
                )}
              </Button>

              {/* Response Display */}
              {response && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap">{response}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Example Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Example Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>"What are the top 3 risks in my latest scan and how should I prioritize them?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>"Compare my privacy scores over the last 3 months and identify trends"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>"Generate an executive summary of our organization's digital footprint"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>"What actions should we take to improve our privacy score by 20 points?"</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
