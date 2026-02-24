/**
 * BlurredRiskGauge Component
 * 
 * Creates visual curiosity by showing a blurred risk score that Free users can't access.
 * The actual score is calculated but rendered with CSS blur to create upgrade incentive.
 * 
 * Security: The blurred content shows placeholder values, not actual sensitive data.
 */

import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BlurredRiskGaugeProps {
  /** Number of signals found */
  signalsCount: number;
  /** Number of high-confidence findings */
  highConfidenceCount: number;
  /** Number of exposures/breaches */
  exposuresCount: number;
  /** Override the calculated score with a fixed value (0-100) */
  scoreOverride?: number;
  /** Contextual label shown beneath the blurred score */
  contextLabel?: string;
  className?: string;
}

/**
 * Calculate a preview risk score (0-100) based on findings
 * This is a simplified calculation for curiosity purposes
 */
function calculatePreviewRiskScore(signals: number, highConf: number, exposures: number): number {
  // Base score from signal volume
  let score = Math.min(30, signals * 2);
  
  // Add weight for high-confidence findings
  score += Math.min(35, highConf * 5);
  
  // Exposures heavily increase risk
  score += Math.min(35, exposures * 15);
  
  return Math.min(100, Math.max(15, score));
}

/**
 * Get risk level label and color based on score
 */
function getRiskLevel(score: number): { label: string; colorClass: string } {
  if (score >= 75) return { label: 'High', colorClass: 'text-destructive' };
  if (score >= 50) return { label: 'Moderate', colorClass: 'text-amber-500' };
  if (score >= 25) return { label: 'Low', colorClass: 'text-emerald-500' };
  return { label: 'Minimal', colorClass: 'text-emerald-600' };
}

export function BlurredRiskGauge({
  signalsCount,
  highConfidenceCount,
  exposuresCount,
  scoreOverride,
  contextLabel,
  className,
}: BlurredRiskGaugeProps) {
  const navigate = useNavigate();
  
  // Use override or calculate the preview score
  const previewScore = scoreOverride ?? calculatePreviewRiskScore(signalsCount, highConfidenceCount, exposuresCount);
  const { label, colorClass } = getRiskLevel(previewScore);
  
  // Calculate gauge fill percentage
  const fillPercentage = previewScore;
  
  return (
    <Card className={cn('overflow-hidden border-border/50', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
            <Lock className="h-3 w-3 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Risk Assessment</h3>
        </div>
        
        {/* Blurred gauge container */}
        <div className="relative">
          {/* Blurred content - actual gauge */}
          <div 
            className="select-none pointer-events-none"
            style={{ filter: 'blur(8px)' }}
            aria-hidden="true"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold">{previewScore}%</span>
              <span className={cn('text-lg font-semibold', colorClass)}>{label}</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-destructive rounded-full transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
            
            {/* Scale labels */}
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </div>
          
          {/* Overlay with CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-background/60 to-background/90 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Risk score calculated
              </span>
            </div>
            {contextLabel && (
              <p className="text-xs text-muted-foreground mb-2 text-center max-w-[220px]">{contextLabel}</p>
            )}
            <Button 
              variant="default"
              size="sm"
              className="h-8 px-4 gap-1.5"
              onClick={() => navigate('/pricing')}
            >
              Unlock to view
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
