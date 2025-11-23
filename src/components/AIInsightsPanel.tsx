import { getAIResponse } from "@/lib/aiRouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface AIInsightsPanelProps {
  scanData: {
    jobId: string;
    scanType?: 'username' | 'email' | 'phone' | 'domain';
    exposures?: number;
    presence?: number;
    breaches?: number;
    dataBrokers?: number;
    darkWeb?: number;
    providers?: Record<string, number>;
    statuses?: Record<string, string>;
  };
}

export default function AIInsightsPanel({ scanData }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      // Build context-aware prompt based on scan type
      const scanType = scanData.scanType || 'email';
      let systemPrompt = "You are a privacy and OSINT expert. Give 3-5 concise, actionable steps.";
      let contextPrompt = "";
      
      if (scanType === 'username') {
        contextPrompt = `Username scan found ${scanData.presence || 0} platform presences across ${scanData.exposures || 0} total exposures. 
Providers: Maigret (${scanData.providers?.maigret || 0}), Sherlock (${scanData.providers?.sherlock || 0}), GoSearch (${scanData.providers?.gosearch || 0}), Apify Social (${scanData.providers?.apifySocial || 0}).
Provider statuses: ${JSON.stringify(scanData.statuses || {})}.
Focus on platform presence, digital footprint reduction, and account security.`;
      } else {
        contextPrompt = `Scan found ${scanData.breaches || 0} breaches, ${scanData.exposures || 0} exposures, ${scanData.dataBrokers || 0} data broker listings, ${scanData.darkWeb || 0} dark web mentions.
Focus on breach response, data broker opt-outs, and security hardening.`;
      }
      
      const { content } = await getAIResponse({
        systemPrompt,
        userPrompt: contextPrompt,
        preferredModel: "gemini", // Using secure Lovable AI (gemini or gpt available)
      });
      setInsights(content);
    } catch (e: any) {
      const errorMessage = e?.message || "AI unavailable – please try again later.";
      setInsights(`⚠️ ${errorMessage}`);
      console.error('AI Insights error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-lg bg-card p-4 shadow-card">
      <Button
        onClick={generate}
        disabled={loading}
        className="mb-3 w-full rounded bg-gradient-to-r from-primary to-accent py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:scale-105"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Thinking…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Insights
          </>
        )}
      </Button>
      {insights && (
        <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
          {insights}
        </div>
      )}
    </Card>
  );
}
