import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ForensicConfidenceGauge } from './ForensicConfidenceGauge';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { Copy, Check, Shield, Clock, Lock, Layers, Search, ChevronRight, ExternalLink, CircleCheck, CircleAlert, Info } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ForensicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: LensVerificationResult | null;
  url?: string;
  platform?: string;
}

// Get dynamic headline based on confidence score
const getAssessmentHeadline = (score: number): string => {
  if (score >= 75) return "Strong match detected";
  if (score >= 50) return "Likely match, but not definitive";
  if (score >= 31) return "Weak match — limited evidence";
  return "Insufficient evidence to confirm";
};

// Get reliability label based on confidence score
const getReliabilityLabel = (score: number): string => {
  if (score >= 75) return "High reliability";
  if (score >= 50) return "Moderate reliability";
  if (score >= 31) return "Low reliability";
  return "Unreliable";
};

// Get body copy based on confidence band
const getAssessmentBody = (score: number): string => {
  if (score >= 75) {
    return "This profile shows strong alignment with the scanned identity across multiple independent signals.";
  }
  if (score >= 50) {
    return "This profile shares several indicators with the scanned identity, but there isn't enough corroborating evidence to confirm a strong match.";
  }
  if (score >= 31) {
    return "Limited signals align with the scanned identity. This result should be treated as tentative and requires additional verification.";
  }
  return "There is insufficient public evidence to establish a meaningful connection between this profile and the scanned identity.";
};

// Get "What This Means" copy based on confidence band
const getWhatThisMeans = (score: number): string => {
  if (score >= 75) {
    return "A high confidence result indicates strong signal alignment across multiple verification checks. This result can be treated with reasonable certainty, though independent verification is always recommended.";
  }
  if (score >= 50) {
    return "A moderate confidence result suggests that some signals align, but others are missing or inconclusive. This does not mean the result is incorrect — only that it should be treated with caution and verified alongside other findings.";
  }
  if (score >= 31) {
    return "A low confidence result means that very few signals could be verified. This result should be considered tentative and may require manual review or additional scanning.";
  }
  return "An unreliable result indicates that LENS could not establish sufficient evidence to validate this finding. The profile may still be relevant, but additional investigation is strongly recommended.";
};

// Get icon and color based on confidence
const getConfidenceIndicator = (score: number) => {
  if (score >= 75) {
    return { icon: CircleCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' };
  }
  if (score >= 50) {
    return { icon: Info, color: 'text-amber-500', bgColor: 'bg-amber-500/10' };
  }
  return { icon: CircleAlert, color: 'text-destructive', bgColor: 'bg-destructive/10' };
};

export function ForensicModal({
  open,
  onOpenChange,
  result,
  url,
  platform,
}: ForensicModalProps) {
  const [copied, setCopied] = useState(false);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const { toast } = useToast();

  if (!result) return null;

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(result.verificationHash);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Verification hash copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const getSslIcon = (status: string) => {
    if (status.toLowerCase().includes('valid')) {
      return <Lock className="h-4 w-4 text-green-500" />;
    } else if (status.toLowerCase().includes('none')) {
      return <Lock className="h-4 w-4 text-destructive" />;
    }
    return <Lock className="h-4 w-4 text-amber-500" />;
  };

  const getConsistencyColor = (consistency: string) => {
    switch (consistency.toLowerCase()) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const confidenceIndicator = getConfidenceIndicator(result.confidenceScore);
  const ConfidenceIcon = confidenceIndicator.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            LENS Forensic Analysis
            {result.cached && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Cached
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Analyzed Profile */}
            {url && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="text-xs text-muted-foreground mb-1">Analyzed Profile</div>
                {platform && (
                  <div className="text-base font-semibold mb-1 flex items-center gap-2">
                    {platform}
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="text-sm font-mono text-muted-foreground break-all">{url}</div>
              </div>
            )}

            {/* Assessment Section */}
            <div className={`p-4 rounded-lg border ${confidenceIndicator.bgColor}`}>
              <div className="flex items-start gap-3">
                <ConfidenceIcon className={`h-5 w-5 mt-0.5 ${confidenceIndicator.color}`} />
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1">
                    {getAssessmentHeadline(result.confidenceScore)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {result.confidenceScore}% confidence · {getReliabilityLabel(result.confidenceScore)}
                  </p>
                  <p className="text-sm">
                    {getAssessmentBody(result.confidenceScore)}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence Score Gauge */}
            <div className="flex justify-center py-2">
              <ForensicConfidenceGauge score={result.confidenceScore} size={140} />
            </div>

            <Separator />

            {/* What LENS Looked At */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">What LENS looked at</h4>
              <p className="text-sm text-muted-foreground">
                LENS evaluates each result using multiple public-signal checks, including:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Username structure and consistency</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Platform context and profile type</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Cross-platform corroboration (where available)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Metadata completeness and stability</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Each signal contributes to the confidence estimate shown above.
              </p>
            </div>

            <Separator />

            {/* What This Means */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">What this means</h4>
              <p className="text-sm text-muted-foreground">
                {getWhatThisMeans(result.confidenceScore)}
              </p>
            </div>

            <Separator />

            {/* Recommended Next Steps */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Recommended next steps</h4>
              <p className="text-sm text-muted-foreground">
                To improve confidence, consider:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <span>Reviewing activity and content on this profile manually</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <span>Checking for the same username or links on other platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <span>Running LENS on related profiles from this scan</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <span>Looking for shared bios, links, or posting patterns</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Higher confidence usually comes from multiple independent confirmations, not a single signal.
              </p>
            </div>

            <Separator />

            {/* Technical Evidence (Advanced) - Collapsible */}
            <Collapsible open={technicalOpen} onOpenChange={setTechnicalOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors">
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${technicalOpen ? 'rotate-90' : ''}`} />
                <span className="text-sm font-semibold">Technical Evidence (Advanced)</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-4">
                <p className="text-xs text-muted-foreground">
                  For transparency and verification. Public data only.
                </p>

                {/* Evidence Snapshot */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    Evidence Snapshot
                  </h5>
                  <div className="p-3 rounded-lg bg-muted/30 border font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                    {result.hashedContent}
                  </div>
                </div>

                {/* Metadata Summary */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    Metadata Summary
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-muted/30 border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                        <Clock className="h-3 w-3" />
                        Source Age
                      </div>
                      <div className="text-xs font-medium">
                        {result.metadata.sourceAge || 'Unknown'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30 border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                        {getSslIcon(result.metadata.sslStatus)}
                        SSL Status
                      </div>
                      <div className="text-xs font-medium">
                        {result.metadata.sslStatus || 'Unknown'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30 border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                        <Layers className="h-3 w-3" />
                        Platform Match
                      </div>
                      <div className={`text-xs font-medium ${getConsistencyColor(result.metadata.platformConsistency)}`}>
                        {result.metadata.platformConsistency || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital Fingerprint */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    Digital Fingerprint (SHA-256)
                  </h5>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-lg bg-muted/30 border font-mono text-xs break-all">
                      {result.verificationHash}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyHash}
                      className="shrink-0 h-8 w-8"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This cryptographic hash serves as a tamper-proof ledger ID for this verification.
                  </p>
                </div>

                {/* Verified timestamp */}
                {result.verifiedAt && (
                  <div className="text-xs text-muted-foreground pt-1">
                    Verified at: {format(new Date(result.verifiedAt), 'PPpp')}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Footer */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                LENS helps explain why a result appears and how reliable it is — not just that it exists.
              </p>
              <p>
                LENS analyzes public signals only and does not monitor accounts, access private data, or track individuals.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
