import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  calculateExposureScore, 
  getExposureLevelColor, 
  getExposureLevelBgColor,
  getExposureLevelLabel,
  ExposureScoreResult 
} from "@/lib/exposureScore";
import { Finding } from "@/lib/ufm";
import { ExposureBreakdownLocked } from "./ExposureBreakdownLocked";
import { ExposureBreakdownPro } from "./ExposureBreakdownPro";
import { ExposureScoreShareCard } from "./ExposureScoreShareCard";
import { analytics } from "@/lib/analytics";
import { useEffect, useMemo } from "react";

interface DigitalExposureScoreProps {
  scanId: string;
  findings: Finding[];
  userPlan: 'free' | 'pro' | 'business';
  className?: string;
}

export function DigitalExposureScore({ 
  scanId, 
  findings, 
  userPlan,
  className 
}: DigitalExposureScoreProps) {
  const isPro = userPlan === 'pro' || userPlan === 'business';
  
  const scoreResult: ExposureScoreResult = useMemo(() => {
    return calculateExposureScore(findings);
  }, [findings]);

  // Track view
  useEffect(() => {
    analytics.trackEvent('exposure_score_view', {
      scan_id: scanId,
      score: scoreResult.score,
      level: scoreResult.level,
      user_tier: userPlan,
    });
  }, [scanId, scoreResult.score, scoreResult.level, userPlan]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Score Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Digital Exposure Score</CardTitle>
            </div>
            <ExposureScoreShareCard 
              score={scoreResult.score} 
              level={scoreResult.level}
              insight={scoreResult.insight}
              scanId={scanId}
            />
          </div>
          <p className="text-sm text-muted-foreground">Based on publicly accessible data sources</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Large Score */}
            <div className={cn(
              "flex flex-col items-center justify-center w-32 h-32 rounded-full border-4",
              getExposureLevelBgColor(scoreResult.level)
            )}>
              <span className={cn("text-4xl font-bold", getExposureLevelColor(scoreResult.level))}>
                {scoreResult.score}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>

            {/* Level and Insight */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm font-medium px-3 py-1",
                  getExposureLevelBgColor(scoreResult.level),
                  getExposureLevelColor(scoreResult.level)
                )}
              >
                {getExposureLevelLabel(scoreResult.level)}
              </Badge>
              <p className="text-sm text-muted-foreground max-w-md">
                {scoreResult.insight}
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Exposure Categories</h4>
            <div className="grid gap-2">
              {scoreResult.categories.map((category) => (
                <div 
                  key={category.id}
                  className="flex items-center gap-2 text-sm"
                >
                  {category.detected ? (
                    <CheckCircle2 className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <span className={cn(
                    category.detected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {category.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Section */}
      {isPro ? (
        <ExposureBreakdownPro 
          categories={scoreResult.categories}
          scanId={scanId}
        />
      ) : (
        <ExposureBreakdownLocked scanId={scanId} />
      )}
    </div>
  );
}
