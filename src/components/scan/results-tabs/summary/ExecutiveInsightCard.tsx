import { useState, useEffect, useMemo } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ExecutiveInsightCardProps {
  jobId: string;
  scanType: string;
  username: string;
  profileCount: number;
  breachCount: number;
  platformCount: number;
}

/**
 * Executive Insight — AI-generated 2–4 sentence summary of scan findings.
 * Neutral, professional tone. Only shown when scan is complete.
 */
export function ExecutiveInsightCard({
  jobId,
  scanType,
  username,
  profileCount,
  breachCount,
  platformCount,
}: ExecutiveInsightCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  // Deterministic fallback summary when AI is unavailable
  const fallback = useMemo(() => {
    const parts: string[] = [];

    if (scanType === "username") {
      parts.push(
        `A scan of the username "${username}" identified ${profileCount} profile${profileCount !== 1 ? "s" : ""} across ${platformCount} platform${platformCount !== 1 ? "s" : ""}.`
      );
    } else if (scanType === "email") {
      parts.push(
        `An email scan for "${username}" returned ${profileCount} associated record${profileCount !== 1 ? "s" : ""}.`
      );
    } else if (scanType === "phone") {
      parts.push(
        `A phone number lookup returned ${profileCount} signal${profileCount !== 1 ? "s" : ""} across ${platformCount} service${platformCount !== 1 ? "s" : ""}.`
      );
    } else {
      parts.push(
        `The scan returned ${profileCount} result${profileCount !== 1 ? "s" : ""} across ${platformCount} source${platformCount !== 1 ? "s" : ""}.`
      );
    }

    if (breachCount > 0) {
      parts.push(
        `${breachCount} breach exposure${breachCount !== 1 ? "s" : ""} were identified, which may warrant review.`
      );
    } else {
      parts.push("No known breach exposures were identified in this scan.");
    }

    parts.push(
      "Review the detailed sections below for a full breakdown of findings and recommended actions."
    );

    return parts.join(" ");
  }, [scanType, username, profileCount, breachCount, platformCount]);

  // Try to fetch AI-generated insight from analysis_json or edge function
  useEffect(() => {
    if (hasAttempted) return;

    const fetchInsight = async () => {
      setIsLoading(true);
      setHasAttempted(true);

      try {
        // First check if scan already has an AI analysis summary
        const { data: scanData } = await supabase
          .from("scans")
          .select("analysis_json")
          .eq("id", jobId)
          .maybeSingle();

        const analysis = scanData?.analysis_json as Record<string, any> | null;
        if (analysis?.summary && typeof analysis.summary === "string") {
          setInsight(analysis.summary);
          return;
        }

        // Fallback: generate via insight-stream edge function
        const { data: responseData } = await supabase.functions.invoke(
          "insight-stream",
          {
            body: {
              findings: [
                {
                  type: scanType || "username",
                  severity: breachCount > 0 ? "high" : "low",
                  title: `Scan summary: ${profileCount} profiles across ${platformCount} platforms, ${breachCount} breaches`,
                  provider: "footprintiq",
                },
              ],
              redact: true,
            },
          }
        );

        if (responseData?.data?.persona) {
          setInsight(responseData.data.persona);
        }
        // If no AI response, fallback renders automatically
      } catch {
        // Silent fail — fallback will display
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [jobId, hasAttempted, profileCount, breachCount, platformCount, scanType, username]);

  const displayText = insight || fallback;

  return (
    <div className="rounded-xl border border-border/30 bg-muted/10 shadow-card overflow-hidden">
      <div className="flex">
        {/* Left accent border */}
        <div className="w-1 shrink-0 bg-primary/40" />

        <div className="flex-1 p-5 space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary/70" />
            <h3 className="text-xs font-semibold tracking-[0.02em] text-foreground">
              Executive Insight
            </h3>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/50" />
              <span className="text-sm text-muted-foreground/60">
                Generating executive summary…
              </span>
            </div>
          ) : (
            <p className="text-[13.5px] leading-relaxed text-foreground/85">
              {displayText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
