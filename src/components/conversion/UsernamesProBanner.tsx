/**
 * UsernamesProBanner - Subtle contextual Pro banner for the /usernames tool page.
 * Shows after user has been on page for a few seconds, non-intrusive.
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UsernamesProBanner() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <Card className="border-primary/15 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Want removal guidance for these results?
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Pro maps your exposure and shows what to do next.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="default"
              className="gap-1.5 h-8 text-xs"
              onClick={() => navigate('/pricing')}
            >
              See Pro
              <ArrowRight className="h-3 w-3" />
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded hover:bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
