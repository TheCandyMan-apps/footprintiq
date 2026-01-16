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
import { ForensicConfidenceGauge } from './ForensicConfidenceGauge';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { Copy, Check, Shield, Clock, Lock, Layers, Search } from 'lucide-react';
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

export function ForensicModal({
  open,
  onOpenChange,
  result,
  url,
  platform,
}: ForensicModalProps) {
  const [copied, setCopied] = useState(false);
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
            {/* URL being analyzed */}
            {url && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="text-xs text-muted-foreground mb-1">Analyzed URL</div>
                <div className="text-sm font-mono break-all">{url}</div>
                {platform && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {platform}
                  </Badge>
                )}
              </div>
            )}

            {/* Confidence Score Gauge */}
            <div className="flex justify-center py-4">
              <ForensicConfidenceGauge score={result.confidenceScore} />
            </div>

            <Separator />

            {/* Evidence Snapshot */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Evidence Snapshot
              </h4>
              <div className="p-3 rounded-lg bg-muted/30 border font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                {result.hashedContent}
              </div>
            </div>

            <Separator />

            {/* Metadata Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Metadata Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Source Age */}
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    Source Age
                  </div>
                  <div className="text-sm font-medium">
                    {result.metadata.sourceAge || 'Unknown'}
                  </div>
                </div>

                {/* SSL Status */}
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    {getSslIcon(result.metadata.sslStatus)}
                    SSL Status
                  </div>
                  <div className="text-sm font-medium">
                    {result.metadata.sslStatus || 'Unknown'}
                  </div>
                </div>

                {/* Platform Consistency */}
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Layers className="h-3 w-3" />
                    Platform Match
                  </div>
                  <div className={`text-sm font-medium ${getConsistencyColor(result.metadata.platformConsistency)}`}>
                    {result.metadata.platformConsistency || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Digital Fingerprint */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Digital Fingerprint (SHA-256)
              </h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 rounded-lg bg-muted/30 border font-mono text-xs break-all">
                  {result.verificationHash}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyHash}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This cryptographic hash serves as a tamper-proof ledger ID for this verification.
              </p>
            </div>

            {/* Verified timestamp */}
            {result.verifiedAt && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                Verified at: {format(new Date(result.verifiedAt), 'PPpp')}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
