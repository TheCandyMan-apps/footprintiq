import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import type { BrokerEntry } from './BrokerExposureSummary';

interface IdentityProfile {
  full_name: string;
  email: string;
  region: string;
  address: string;
}

interface RemovalWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broker: BrokerEntry | null;
  existingProfile: IdentityProfile | null;
  onSaveProfile: (profile: IdentityProfile) => void;
  onMarkSubmitted: (brokerId: string) => void;
}

function generateGDPRTemplate(profile: IdentityProfile, brokerName: string): string {
  return `Subject: Data Removal Request – Right to Erasure (GDPR / CCPA)

To whom it may concern at ${brokerName},

I am writing to request the deletion of all personal data you hold about me, in accordance with my rights under the General Data Protection Regulation (GDPR) Article 17, and/or the California Consumer Privacy Act (CCPA).

My details for identification:

Full Name: ${profile.full_name}
Email Address: ${profile.email}
${profile.region ? `Region: ${profile.region}` : ''}
${profile.address ? `Address: ${profile.address}` : ''}

I request that you:

1. Delete all personal information you hold about me
2. Confirm deletion within 30 days
3. Cease any further collection of my data
4. Remove my information from any public-facing directories or search results

If you are unable to comply, please provide a detailed explanation of the legal basis for retaining my data.

I look forward to your prompt response.

Regards,
${profile.full_name}`;
}

export function RemovalWorkflowModal({
  open,
  onOpenChange,
  broker,
  existingProfile,
  onSaveProfile,
  onMarkSubmitted,
}: RemovalWorkflowModalProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<IdentityProfile>(
    existingProfile || { full_name: '', email: '', region: '', address: '' }
  );
  const { toast } = useToast();

  const template = useMemo(
    () => (broker ? generateGDPRTemplate(profile, broker.name) : ''),
    [profile, broker]
  );

  const canProceed = profile.full_name.trim() !== '' && profile.email.trim() !== '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template);
    toast({ title: 'Copied', description: 'GDPR removal template copied to clipboard.' });
  };

  const handleNext = () => {
    if (step === 1) {
      onSaveProfile(profile);
      setStep(2);
    }
  };

  const handleSubmitted = () => {
    if (broker) {
      onMarkSubmitted(broker.id);
      onOpenChange(false);
      setStep(1);
      toast({ title: 'Marked as Submitted', description: `Removal request for ${broker.name} has been recorded.` });
    }
  };

  if (!broker) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setStep(1); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Remove from {broker.name}
            <Badge variant="outline" className="text-[10px]">Step {step}/2</Badge>
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Confirm your identity details to generate a removal request.'
              : 'Copy the template and submit your removal request.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={profile.region}
                onChange={(e) => setProfile(p => ({ ...p, region: e.target.value }))}
                placeholder="e.g. United Kingdom, California"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                placeholder="Optional — may help broker identify your record"
              />
            </div>
            <Button onClick={handleNext} disabled={!canProceed} className="w-full gap-2">
              Generate Template <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border bg-muted/30 p-3 max-h-60 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-foreground/80">
                {template}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={handleCopy} className="gap-2">
                <Copy className="h-4 w-4" /> Copy to Clipboard
              </Button>

              {broker.removal_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(broker.removal_url!, '_blank', 'noopener')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" /> Open {broker.name} Removal Page
                </Button>
              )}

              <Button onClick={handleSubmitted} className="gap-2 mt-2">
                <CheckCircle2 className="h-4 w-4" /> Mark as Submitted
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1 text-xs">
              <ChevronLeft className="h-3 w-3" /> Back to Profile
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
