import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Lock, Database, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GDPRConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}

export function GDPRConsentModal({ open, onAccept, onDecline, loading }: GDPRConsentModalProps) {
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false);
  const [privacyPolicyConsent, setPrivacyPolicyConsent] = useState(false);

  const canAccept = dataProcessingConsent && privacyPolicyConsent;

  const handleAccept = () => {
    if (canAccept && !loading) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Privacy & Data Processing Consent</DialogTitle>
          </div>
          <DialogDescription className="text-sm sm:text-base">
            We take your privacy seriously. Please review and accept our data processing terms.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-6 max-h-[50vh]">
          <div className="space-y-6 pb-4">
            {/* What We Process */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">What Data We Process</h3>
                  <p className="text-sm text-muted-foreground">
                    We process your email, name, and scan-related data <strong>only for the purpose of providing our privacy scanning services</strong>. This includes:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                    <li>• Account authentication and management</li>
                    <li>• Performing privacy scans you request</li>
                    <li>• Storing scan results and findings</li>
                    <li>• Sending you notifications about your scans</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Protect Data */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">How We Protect Your Data</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• All data is encrypted at rest and in transit</li>
                    <li>• Access controls limit who can view your data</li>
                    <li>• Regular security audits and monitoring</li>
                    <li>• GDPR-compliant data handling practices</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Your Privacy Rights</h3>
                  <p className="text-sm text-muted-foreground">
                    Under GDPR, you have the right to:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                    <li>• Access your personal data</li>
                    <li>• Request data deletion (right to be forgotten)</li>
                    <li>• Export your data in a portable format</li>
                    <li>• Withdraw consent at any time</li>
                    <li>• Lodge a complaint with a supervisory authority</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-semibold mb-2 text-sm">Data Retention</h4>
              <p className="text-sm text-muted-foreground">
                We retain your data only as long as necessary to provide our services. 
                Scan results older than 30 days are automatically anonymized to protect your privacy.
              </p>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4 pt-4 border-t border-border">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={dataProcessingConsent}
                  onCheckedChange={(checked) => setDataProcessingConsent(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    I consent to FootprintIQ processing my personal data as described above
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Required to create an account and use our services
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={privacyPolicyConsent}
                  onCheckedChange={(checked) => setPrivacyPolicyConsent(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    I have read and agree to the{' '}
                    <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    {' '}and{' '}
                    <Link to="/terms" target="_blank" className="text-primary hover:underline">
                      Terms of Service
                    </Link>
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can review these documents at any time
                  </p>
                </div>
              </label>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t border-border flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!canAccept || loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Creating Account...' : 'Accept & Create Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
