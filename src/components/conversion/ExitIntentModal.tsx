/**
 * ExitIntentModal — Triggers when user moves cursor toward browser chrome (desktop)
 * or after inactivity timeout (mobile). Shows a last-chance upgrade/scan prompt.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExitIntentModalProps {
  /** Whether the user has already completed a scan */
  hasScanned?: boolean;
}

export function ExitIntentModal({ hasScanned = false }: ExitIntentModalProps) {
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const navigate = useNavigate();

  const handleExit = useCallback(() => {
    // Only trigger once per session
    if (triggered) return;
    if (sessionStorage.getItem('exit_intent_shown')) return;

    setTriggered(true);
    sessionStorage.setItem('exit_intent_shown', 'true');
    setOpen(true);
  }, [triggered]);

  useEffect(() => {
    // Desktop: mouse leaves viewport toward top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        handleExit();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleExit]);

  const handleCTA = () => {
    setOpen(false);
    if (hasScanned) {
      navigate('/pricing');
    } else {
      navigate('/free-scan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg">
              {hasScanned ? 'Don\'t leave your data exposed' : 'Wait — check your exposure first'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            {hasScanned
              ? 'You found public profiles linked to your identity. Upgrade to see the full picture and get remediation steps.'
              : 'Over 500 platforms are checked in seconds. See what\'s publicly linked to your username — free.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Button onClick={handleCTA} className="w-full gap-2 h-11">
            {hasScanned ? 'View Upgrade Options' : 'Run a Free Scan'}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            No thanks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
