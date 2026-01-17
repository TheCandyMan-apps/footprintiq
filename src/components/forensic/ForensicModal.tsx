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
import { Copy, Check, Shield, Clock, Lock, Layers, Search, ChevronRight, ExternalLink, CircleCheck, CircleAlert, Info, Sparkles, Network, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ForensicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: LensVerificationResult | null;
  url?: string;
  platform?: string;
  scanId?: string;
}

// Get dynamic headline based on confidence score
const getAssessmentHeadline = (score: number): string => {
  if (score >= 80) return "High confidence match";
  if (score >= 60) return "Moderate confidence match";
  return "Low confidence — requires verification";
};

// Get reliability label based on confidence score
const getReliabilityLabel = (score: number): string => {
  if (score >= 80) return "High Reliability";
  if (score >= 60) return "Moderate Reliability";
  return "Low Reliability";
};

// Standardized "What This Means" copy
const getWhatThisMeans = (): string => {
  return "This result appears to be a genuine profile, but certainty is never absolute. LENS evaluates public signals like username consistency, platform context, and evidence quality to estimate how likely this profile belongs to the same individual.";
};

// Get icon and color based on confidence
const getConfidenceIndicator = (score: number) => {
  if (score >= 80) {
    return { icon: CircleCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' };
  }
  if (score >= 60) {
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
  scanId,
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
            <a 
              href="/lens" 
              className="ml-auto text-xs font-normal text-muted-foreground hover:text-primary transition-colors"
            >
              What is LENS?
            </a>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Evidence-based confidence assessment
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Analyzed Profile */}
            {url && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="text-xs text-muted-foreground mb-1">Analyzed URL</div>
                {platform && (
                  <div className="text-base font-semibold mb-1 flex items-center gap-2">
                    {platform}
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="text-sm font-mono text-muted-foreground break-all">{url}</div>
              </div>
            )}

            {/* 1. Confidence Score Gauge - PRIMARY */}
            <div className="flex justify-center py-4">
              <ForensicConfidenceGauge score={result.confidenceScore} size={160} />
            </div>

            {/* 2. What This Means - Standardized Copy */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">What this means</h4>
              <p className="text-sm text-muted-foreground">
                {getWhatThisMeans()}{' '}
                <a 
                  href="/lens#how-lens-works" 
                  className="text-primary hover:underline"
                >
                  Learn how LENS evaluates confidence
                </a>
              </p>
            </div>

            {/* 3. Important Note - ALWAYS VISIBLE */}
            <div className="p-3 rounded-lg bg-muted/50 border border-muted-foreground/20">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Important:</span> Confidence reflects probability — not proof. 
                    LENS does not track people or make identity claims.
                  </p>
                  <a 
                    href="/lens#ethical-standard" 
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    Read about our ethical OSINT standard
                  </a>
                </div>
              </div>
            </div>

            <Separator />

            {/* Confidence Breakdown (Pro-only) */}
            <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Confidence Breakdown</h4>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary">
                  Pro
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px] text-center">
                      <p className="text-xs">Pro reveals how each signal contributes to confidence — not just the final score.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Blurred signal breakdown for free users */}
              <div className="space-y-2.5 select-none" style={{ filter: 'blur(4px)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Username consistency</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[85%] bg-primary/60 rounded-full" />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Platform context strength</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[72%] bg-primary/60 rounded-full" />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Cross-platform corroboration</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[45%] bg-amber-500/60 rounded-full" />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Metadata stability</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[68%] bg-primary/60 rounded-full" />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">68%</span>
                  </div>
                </div>
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Evidence Snapshot - Human Readable */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Evidence Snapshot</h4>
              <div className="space-y-0">
                {/* Platform */}
                <div className="flex items-center justify-between py-2.5 border-b border-muted">
                  <span className="text-sm text-muted-foreground">Platform</span>
                  <span className="text-sm font-medium">{platform || 'Unknown'}</span>
                </div>
                
                {/* URL Verified */}
                <div className="flex items-center justify-between py-2.5 border-b border-muted">
                  <span className="text-sm text-muted-foreground">Public URL verified</span>
                  <div className="flex items-center gap-1.5">
                    {result.urlVerified ? (
                      <>
                        <CircleCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-500">Yes</span>
                      </>
                    ) : (
                      <>
                        <CircleAlert className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-500">Partial</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Evidence Sources */}
                <div className="flex items-center justify-between py-2.5 border-b border-muted">
                  <span className="text-sm text-muted-foreground">Evidence sources</span>
                  <span className="text-sm font-medium">{result.providerCount}</span>
                </div>
                
                {/* Scan Reference */}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-muted-foreground">Scan reference</span>
                  <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                    {scanId ? scanId.slice(0, 8) : 'N/A'}
                  </code>
                </div>
              </div>
            </div>

            {/* LENS Pro Insight - Subtle, Trust-First */}
            <div className="p-4 rounded-lg bg-muted/30 border border-muted-foreground/20">
              <div className="flex items-start gap-3">
                <Network className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold">LENS Pro Insight</h5>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      LENS Pro provides deeper analysis by examining how this profile connects 
                      to other findings across scans.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pro users can see why confidence changes, compare related profiles, 
                      and surface corroborating or conflicting signals.
                    </p>
                  </div>
                  
                  {/* CTA with Tooltip */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a 
                          href="/pricing" 
                          className="inline-flex items-center gap-1.5 text-sm text-primary 
                                     hover:text-primary/80 transition-colors font-medium"
                        >
                          Learn more about LENS Pro
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-center">
                        <p className="text-xs">Pro adds depth and explanation — not surveillance.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Link & Evidence Network (Pro) - Disabled Teaser */}
            <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Network className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-muted-foreground">Link & Evidence Network</h5>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary">
                      Pro
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    See how this profile relates to others across scans.
                  </p>
                  <a 
                    href="/pricing" 
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    Unlock LENS Pro
                  </a>
                </div>
              </div>
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
                <span className="text-sm font-semibold">Show technical details</span>
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


            {/* Footer */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                LENS helps explain why a result appears and how reliable it is — not just that it exists.
              </p>
              <p>
                LENS analyzes public signals only and does not monitor accounts, access private data, or track individuals.
              </p>
              <a 
                href="/lens" 
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium mt-1"
              >
                Learn more about how LENS works
                <ExternalLink className="h-3 w-3" />
              </a>
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
