import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderStatus {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'failed';
  message?: string;
  resultCount?: number;
}

interface ScanProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanId: string | null;
  onComplete?: () => void;
}

export function ScanProgressDialog({ open, onOpenChange, scanId, onComplete }: ScanProgressDialogProps) {
  const [progress, setProgress] = useState(0);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!scanId || !open) return;

    // Reset state
    setProgress(0);
    setProviders([]);
    setCreditsUsed(0);
    setStatus('running');

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`scan_progress_${scanId}`)
      .on(
        'broadcast',
        { event: 'provider_update' },
        (payload: any) => {
          const { provider, status: providerStatus, message, resultCount, creditsUsed: credits } = payload.payload;

          setProviders((prev) => {
            const existing = prev.find((p) => p.name === provider);
            if (existing) {
              return prev.map((p) =>
                p.name === provider
                  ? { ...p, status: providerStatus, message, resultCount }
                  : p
              );
            }
            return [...prev, { name: provider, status: providerStatus, message, resultCount }];
          });

          if (credits) {
            setCreditsUsed(credits);
          }

          // Calculate progress
          setProviders((currentProviders) => {
            const completed = currentProviders.filter(
              (p) => p.status === 'success' || p.status === 'failed'
            ).length;
            const total = currentProviders.length;
            if (total > 0) {
              setProgress(Math.round((completed / total) * 100));
            }
            return currentProviders;
          });
        }
      )
      .on(
        'broadcast',
        { event: 'scan_complete' },
        (payload: any) => {
          setStatus('completed');
          setProgress(100);
          if (payload.payload.creditsUsed) {
            setCreditsUsed(payload.payload.creditsUsed);
          }
          toast.success('Scan completed successfully');
          onComplete?.();
        }
      )
      .on(
        'broadcast',
        { event: 'scan_failed' },
        (payload: any) => {
          setStatus('failed');
          toast.error(payload.payload.error || 'Scan failed');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, open, onComplete]);

  const handleCancel = async () => {
    if (!scanId) return;
    
    setIsCancelling(true);
    try {
      const { error } = await supabase.functions.invoke('cancel-scan', {
        body: { scanId },
      });

      if (error) throw error;

      setStatus('cancelled');
      toast.info('Scan cancelled');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel scan');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Done</Badge>;
      case 'loading':
        return <Badge variant="default" className="bg-blue-500">Loading</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Scan Progress</DialogTitle>
              <DialogDescription>
                Real-time updates from providers
              </DialogDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {creditsUsed > 0 && (
                <span className="font-medium">
                  {creditsUsed} credits used
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Provider List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {providers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Initializing scan...</p>
              </div>
            ) : (
              providers.map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(provider.status)}
                    <div className="flex-1">
                      <div className="font-medium">{provider.name}</div>
                      {provider.message && (
                        <div className="text-sm text-muted-foreground">
                          {provider.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {provider.resultCount !== undefined && provider.resultCount > 0 && (
                      <Badge variant="outline">
                        {provider.resultCount} results
                      </Badge>
                    )}
                    {getStatusBadge(provider.status)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {status === 'completed' && 'Scan completed successfully'}
              {status === 'failed' && 'Scan failed'}
              {status === 'cancelled' && 'Scan cancelled'}
              {status === 'running' && 'Scan in progress...'}
            </div>
            <div className="flex gap-2">
              {status === 'running' && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel Scan
                    </>
                  )}
                </Button>
              )}
              <Button
                variant={status === 'completed' ? 'default' : 'outline'}
                onClick={() => onOpenChange(false)}
              >
                {status === 'completed' ? 'View Results' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
