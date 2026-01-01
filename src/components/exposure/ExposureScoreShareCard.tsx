import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";
import { ExposureLevel, getExposureLevelColor, getExposureLevelLabel } from "@/lib/exposureScore";

interface ExposureScoreShareCardProps {
  score: number;
  level: ExposureLevel;
  insight: string;
  scanId: string;
}

const SHARE_TEXT = `I just checked my digital footprint.
My public exposure is higher than I expected.
See yours at footprintiq.app`;

export function ExposureScoreShareCard({ 
  score, 
  level, 
  insight,
  scanId 
}: ExposureScoreShareCardProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    analytics.trackEvent('exposure_score_share_click', {
      scan_id: scanId,
      score: score,
      level: level,
    });

    const shareData = {
      title: 'My Digital Exposure Score',
      text: SHARE_TEXT,
      url: 'https://footprintiq.app',
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        analytics.trackEvent('exposure_score_share_success', {
          scan_id: scanId,
          method: 'native',
        });
        toast({
          title: "Shared successfully",
          description: "Your exposure score has been shared.",
        });
      } else {
        await navigator.clipboard.writeText(SHARE_TEXT);
        analytics.trackEvent('exposure_score_share_success', {
          scan_id: scanId,
          method: 'clipboard',
        });
        toast({
          title: "Copied to clipboard",
          description: "Share text has been copied.",
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(SHARE_TEXT);
          analytics.trackEvent('exposure_score_share_success', {
            scan_id: scanId,
            method: 'clipboard_fallback',
          });
          toast({
            title: "Copied to clipboard",
            description: "Share text has been copied.",
          });
        } catch {
          toast({
            title: "Sharing failed",
            description: "Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleShare}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Share</span>
    </Button>
  );
}
