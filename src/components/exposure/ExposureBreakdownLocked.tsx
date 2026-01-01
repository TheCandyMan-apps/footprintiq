import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analytics } from "@/lib/analytics";

interface ExposureBreakdownLockedProps {
  scanId: string;
}

export function ExposureBreakdownLocked({ scanId }: ExposureBreakdownLockedProps) {
  const navigate = useNavigate();

  const handleUnlock = () => {
    analytics.trackEvent('exposure_breakdown_unlock_click', {
      scan_id: scanId,
    });
    navigate('/pricing');
  };

  return (
    <Card className="border-border/50 bg-muted/30 backdrop-blur-sm">
      <CardContent className="py-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            <span className="font-medium">Exposure Breakdown Locked</span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>See:</p>
            <ul className="space-y-1">
              <li>• Which profiles increase your score</li>
              <li>• How identifiers connect across platforms</li>
              <li>• What attackers look for first</li>
              <li>• How to reduce exposure</li>
            </ul>
          </div>

          <Button 
            onClick={handleUnlock}
            className="gap-2"
          >
            Unlock Full Exposure Analysis
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
