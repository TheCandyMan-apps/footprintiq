import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Link2, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTierGating } from "@/hooks/useTierGating";
import { cn } from "@/lib/utils";

const SHARE_TEXT = `I just checked my digital footprint.
Didn't expect this 😬
Check yours:
https://footprintiq.app`;

interface ViralSharePromptProps {
  className?: string;
  compact?: boolean;
  onDismiss?: () => void;
}

export function ViralSharePrompt({ className, compact = false, onDismiss }: ViralSharePromptProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFree, isLoading } = useTierGating();
  const [dismissed, setDismissed] = useState(false);

  // Only show for free users
  if (isLoading || !isFree || dismissed) return null;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: SHARE_TEXT });
      } else {
        await navigator.clipboard.writeText(SHARE_TEXT);
        toast({
          title: "Copied to clipboard!",
          description: "Share text copied. Paste it anywhere to share.",
        });
      }
    } catch (error) {
      // User cancelled or error
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(SHARE_TEXT);
        toast({
          title: "Copied to clipboard!",
          description: "Share text copied. Paste it anywhere to share.",
        });
      }
    }
  };

  const handleNewScan = () => {
    navigate('/scan');
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (compact) {
    return (
      <div className={cn("pt-3 mt-3 border-t border-border/30", className)}>
        <p className="text-xs text-muted-foreground/80 text-center mb-2">
          — or —
        </p>
        <p className="text-xs text-center mb-2">
          😳 Think this is bad? Check what's public about your friends.
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewScan}
            className="text-xs h-7"
          >
            <Link2 className="h-3 w-3 mr-1" />
            Check your exposure
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-xs h-7"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "relative p-6 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/40 ring-1 ring-primary/20 shadow-md",
      className
    )}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="text-center max-w-md mx-auto">
        {/* Headline */}
        <h3 className="text-lg font-semibold mb-2">
          😳 Think this is bad? Check what's public about your friends.
        </h3>

        {/* Social proof line */}
        <p className="text-sm font-medium text-primary mb-2">
          Most people share this with a friend before upgrading.
        </p>

        {/* Body */}
        <p className="text-sm text-muted-foreground mb-5">
          Most people don't realise how exposed they are until they see it.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleNewScan} className="gap-2">
            <Link2 className="h-4 w-4" />
            🔗 Check your exposure
          </Button>
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            📤 Share this scan
          </Button>
        </div>
      </div>
    </Card>
  );
}
