/**
 * WelcomeInterstitial - Post-signup value comparison shown once after email verification.
 * Catches users at peak intent before they land on the dashboard.
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FREE_FEATURES = [
  { label: '10 scans/month', included: true },
  { label: 'Basic username scanning', included: true },
  { label: 'Limited results (10 findings)', included: true },
  { label: 'Risk scoring & confidence', included: false },
  { label: 'Removal guidance', included: false },
  { label: 'Export reports', included: false },
  { label: 'Connection mapping', included: false },
];

const PRO_FEATURES = [
  { label: '100 scans/month', included: true },
  { label: 'Multi-tool OSINT engine', included: true },
  { label: 'All findings unlocked', included: true },
  { label: 'Risk scoring & confidence', included: true },
  { label: 'Removal guidance', included: true },
  { label: 'Export reports (PDF & CSV)', included: true },
  { label: 'Connection mapping', included: true },
];

interface WelcomeInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeInterstitial({ isOpen, onClose }: WelcomeInterstitialProps) {
  const navigate = useNavigate();

  const handleContinueFree = () => {
    onClose();
  };

  const handleViewPro = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">Welcome to FootprintIQ</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Your account is ready. Here's what you get — and what Pro unlocks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Free column */}
          <div className="rounded-lg border border-border/50 p-3 space-y-3">
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">Free</Badge>
              <p className="text-xs text-muted-foreground mt-1">Your current plan</p>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map(({ label, included }) => (
                <li key={label} className="flex items-start gap-1.5 text-xs">
                  {included ? (
                    <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-muted-foreground/40 mt-0.5 shrink-0" />
                  )}
                  <span className={included ? 'text-foreground' : 'text-muted-foreground/50'}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro column */}
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 space-y-3">
            <div className="text-center">
              <Badge className="text-xs bg-primary text-primary-foreground">Pro</Badge>
              <p className="text-xs text-muted-foreground mt-1">£14.99/mo</p>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map(({ label, included }) => (
                <li key={label} className="flex items-start gap-1.5 text-xs">
                  <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={handleViewPro} className="w-full gap-2">
            <Zap className="h-4 w-4" />
            Explore Pro
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleContinueFree} className="w-full text-muted-foreground text-sm">
            Continue with Free
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
