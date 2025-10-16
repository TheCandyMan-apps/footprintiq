import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InsightData {
  persona: string;
  risks: string[];
  actions: string[];
}

export const useInsightStream = () => {
  const [data, setData] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = useCallback(async (findings: any[], redact = true) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const { data: responseData, error: invokeError } = await supabase.functions.invoke(
        'insight-stream',
        {
          body: { findings, redact }
        }
      );

      if (invokeError) {
        throw invokeError;
      }

      // Handle both streaming and non-streaming responses
      if (responseData?.type === "done") {
        setData(responseData.data);
      } else if (responseData?.persona && responseData?.risks && responseData?.actions) {
        setData(responseData);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Insight generation error:", err);
      setError(err.message || "Failed to generate insights");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, generateInsight };
};
