import { getAIResponse } from "@/lib/aiRouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface AIInsightsPanelProps {
  scanData: unknown;
}

export default function AIInsightsPanel({ scanData }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { content } = await getAIResponse({
        systemPrompt: "You are a privacy expert. Give 3-5 concise, actionable steps.",
        userPrompt: `Scan result: ${JSON.stringify(scanData)}`,
        preferredModel: "gemini", // Using secure Lovable AI (gemini or gpt available)
      });
      setInsights(content);
    } catch (e) {
      setInsights("AI unavailable – please try again later.");
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
