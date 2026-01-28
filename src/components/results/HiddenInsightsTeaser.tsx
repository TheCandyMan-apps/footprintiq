/**
 * HiddenInsightsTeaser Component
 * 
 * Shows blurred AI insights that Pro users would see, creating FOMO and curiosity.
 * The actual content is placeholder text to prevent inspect-element bypasses.
 */

import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HiddenInsightsTeaserProps {
  /** Number of signals found to generate dynamic teaser copy */
  signalsCount: number;
  className?: string;
}

/**
 * Generate placeholder insight lines based on signal count
 * These are intentionally vague to create curiosity
 */
function generatePlaceholderInsights(count: number): string[] {
  const insights = [
    'Cross-platform correlation suggests consistent identity usage patterns across multiple services.',
    'Profile metadata indicates potential privacy exposure through linked accounts.',
    'Activity timeline shows registration patterns spanning multiple years.',
    'Source verification confirms high confidence on primary platform associations.',
  ];
  
  // Return 2-4 insights based on signal count
  const numInsights = Math.min(4, Math.max(2, Math.floor(count / 10)));
  return insights.slice(0, numInsights);
}

export function HiddenInsightsTeaser({
  signalsCount,
  className,
}: HiddenInsightsTeaserProps) {
  const navigate = useNavigate();
  const placeholderInsights = generatePlaceholderInsights(signalsCount);
  
  return (
    <Card className={cn('overflow-hidden border-border/50', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">AI Insights</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
            Pro
          </span>
        </div>
        
        {/* Blurred insights container */}
        <div className="relative">
          {/* Blurred content */}
          <div 
            className="space-y-2.5 select-none pointer-events-none"
            style={{ filter: 'blur(6px)' }}
            aria-hidden="true"
          >
            {placeholderInsights.map((insight, i) => (
              <div 
                key={i}
                className="p-2.5 rounded-lg bg-muted/30 border border-border/30"
              >
                <p className="text-xs text-foreground leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
          
          {/* Overlay with CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-background/70 to-background/95 rounded-lg">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {placeholderInsights.length} AI insights generated
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unlock Pro to reveal findings
                </p>
              </div>
              <Button 
                variant="default"
                size="sm"
                className="h-8 px-4 gap-1.5"
                onClick={() => navigate('/pricing')}
              >
                Unlock AI Analysis
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
