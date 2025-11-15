import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle, AlertCircle, X, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { detectScanPipeline } from '@/utils/scanPipeline';

interface ProviderStatus {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'failed' | 'retrying';
  message?: string;
  resultCount?: number;
  retryCount?: number;
  maxRetries?: number;
}

interface TopFinding {
  site: string;
  url: string | null;
  status: string | null;
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
  const [totalResults, setTotalResults] = useState(0);
  const [isSavingCase, setIsSavingCase] = useState(false);
  const [providersCompleted, setProvidersCompleted] = useState(0);
  const [providersTotal, setProvidersTotal] = useState(0);
  const [lastEventAt, setLastEventAt] = useState(Date.now());
  const [showInactivityHint, setShowInactivityHint] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [topFindings, setTopFindings] = useState<TopFinding[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [pipelineType, setPipelineType] = useState<'simple' | 'advanced' | null>(null);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play a pleasant success sound (C major chord)
      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Add second note for harmony
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.value = 659.25; // E5
      oscillator2.type = 'sine';
      gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.1);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      oscillator2.start(audioContext.currentTime + 0.1);
      oscillator2.stop(audioContext.currentTime + 0.6);
    } catch (error) {
      console.log('Could not play success sound:', error);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  useEffect(() => {
    if (!scanId || !open) return;

    console.log('[ScanProgressDialog] Subscribing to channels for scanId:', scanId);

    // Reset state
    setProgress(5); // Show 5% to indicate we're listening
    setProviders([]);
    setCreditsUsed(0);
    setStatus('running');
    setTotalResults(0);
    setIsSavingCase(false);
    setProvidersCompleted(0);
    setProvidersTotal(0);
    setLastEventAt(Date.now());
    setShowInactivityHint(false);
    setShowTimeoutWarning(false);
    setTopFindings([]);
    setShowPreview(false);
    setPipelineType(null);

    // Detect pipeline type and check if scan exists
    const initializePipeline = async () => {
      // Wait 2 seconds before checking - gives edge function time to create records
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pipeline = await detectScanPipeline(scanId);
      setPipelineType(pipeline);
      console.log('[ScanProgressDialog] Detected pipeline:', pipeline);

      // If no pipeline detected after 2s, scan likely failed to start
      if (!pipeline) {
        console.error('[ScanProgressDialog] No pipeline detected - scan may have failed to start');
        setStatus('failed');
        toast.error('Scan failed to start', {
          description: 'The scan request may have been invalid. Please try again.',
          duration: 5000,
        });
        return;
      }

      if (pipeline === 'simple') {
        // Start polling maigret_results for Simple pipeline
        startSimplePipelinePolling();
      } else if (pipeline === 'advanced') {
        // Use existing Advanced pipeline subscriptions (already set up below)
        console.log('[ScanProgressDialog] Using Advanced pipeline mode');
      }
    };

    initializePipeline();

    // Simple pipeline polling - polls maigret_results every 3 seconds
    const startSimplePipelinePolling = () => {
      const pollInterval = setInterval(async () => {
        try {
          const { data: result, error } = await supabase
            .from('maigret_results')
            .select('*')
            .eq('job_id', scanId)
            .maybeSingle();

          if (error) {
            console.error('[ScanProgressDialog] Simple polling error:', error);
            return;
          }

          if (!result) return;

          // Map status to progress
          if (result.status === 'queued') {
            setProgress(5);
          } else if (result.status === 'running') {
            setProgress(50);
          } else if (result.status === 'completed') {
            setProgress(100);
            setStatus('completed');
            
            // Extract results from summary
            const summary = result.summary as any;
            const summaryArray = Array.isArray(summary) ? summary : [];
            setTotalResults(summaryArray.length);

            // Fetch top findings
            const mapped = summaryArray.slice(0, 10).map((item: any) => ({
              site: item.evidence?.find((e: any) => e.key === 'site')?.value || 'Unknown',
              url: item.evidence?.find((e: any) => e.key === 'url')?.value || null,
              status: item.evidence?.find((e: any) => e.key === 'status')?.value || 'found',
            }));
            setTopFindings(mapped);

            if (summaryArray.length > 0) {
              setShowPreview(true);
              playSuccessSound();
              triggerConfetti();
              toast.success(`Scan completed - ${summaryArray.length} results found`);
            } else {
              toast.info('No results found', {
                description: 'Try a broader query or different username variant',
                duration: 5000,
              });
            }

            // Auto-navigate after showing preview
            setTimeout(() => {
              onComplete?.();
            }, 3000);

            clearInterval(pollInterval);
          } else if (result.status === 'failed') {
            setProgress(0);
            setStatus('failed');
            toast.error('Scan failed');
            clearInterval(pollInterval);
          }

          setLastEventAt(Date.now());
        } catch (error) {
          console.error('[ScanProgressDialog] Simple polling error:', error);
        }
      }, 3000); // Poll every 3 seconds

      // Cleanup function will clear this interval
      return pollInterval;
    };

    // Fetch top findings from scan_findings table or maigret_results
    const fetchTopFindings = async () => {
      try {
        // First try scan_findings (for advanced/orchestrator scans)
        const { data: findings, error: findingsError } = await supabase
          .from('scan_findings')
          .select('site, url, status')
          .eq('job_id', scanId)
          .order('site', { ascending: true })
          .limit(10);

        if (!findingsError && findings && findings.length > 0) {
          setTopFindings(findings as TopFinding[]);
          setTotalResults(findings.length);
          return;
        }

        // Fallback to maigret_results (for simple username scans)
        const { data: maigretResult, error: maigretError } = await supabase
          .from('maigret_results')
          .select('summary')
          .eq('job_id', scanId)
          .maybeSingle();

        if (!maigretError && maigretResult?.summary) {
          const summary = maigretResult.summary as any;
          const summaryArray = Array.isArray(summary) ? summary : [];
          
          const mapped = summaryArray.slice(0, 10).map((item: any) => ({
            site: item.evidence?.find((e: any) => e.key === 'site')?.value || 'Unknown',
            url: item.evidence?.find((e: any) => e.key === 'url')?.value || null,
            status: item.evidence?.find((e: any) => e.key === 'status')?.value || 'found',
          }));
          
          setTopFindings(mapped);
          setTotalResults(summaryArray.length);
        }
      } catch (error) {
        console.error('[ScanProgressDialog] Error fetching top findings:', error);
      }
    };

    // Subscribe to real-time updates for scan_findings
    const findingsChannel = supabase
      .channel(`scan_findings_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_findings',
          filter: `job_id=eq.${scanId}`,
        },
        (payload) => {
          console.debug('[ScanProgressDialog] New finding:', payload);
          const finding = payload.new as TopFinding;
          
          setTopFindings(prev => {
            const updated = [...prev, finding];
            return updated.slice(0, 10); // Keep only top 10
          });
          
          setTotalResults(prev => prev + 1);
        }
      )
      .subscribe();

    // Subscribe to real-time updates for maigret_results (simple scans)
    const maigretResultsChannel = supabase
      .channel(`maigret_results_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maigret_results',
          filter: `job_id=eq.${scanId}`,
        },
        (payload) => {
          console.debug('[ScanProgressDialog] Maigret result inserted:', payload);
          const result = payload.new as any;
          
          if (result.summary) {
            const summary = result.summary as any;
            const summaryArray = Array.isArray(summary) ? summary : [];
            
            const mapped = summaryArray.slice(0, 10).map((item: any) => ({
              site: item.evidence?.find((e: any) => e.key === 'site')?.value || 'Unknown',
              url: item.evidence?.find((e: any) => e.key === 'url')?.value || null,
              status: item.evidence?.find((e: any) => e.key === 'status')?.value || 'found',
            }));
            
            setTopFindings(mapped);
            setTotalResults(summaryArray.length);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'maigret_results',
          filter: `job_id=eq.${scanId}`,
        },
        (payload) => {
          console.debug('[ScanProgressDialog] Maigret result updated:', payload);
          const result = payload.new as any;
          
          if (result.status === 'completed' && result.summary) {
            const summary = result.summary as any;
            const summaryArray = Array.isArray(summary) ? summary : [];
            
            const mapped = summaryArray.slice(0, 10).map((item: any) => ({
              site: item.evidence?.find((e: any) => e.key === 'site')?.value || 'Unknown',
              url: item.evidence?.find((e: any) => e.key === 'url')?.value || null,
              status: item.evidence?.find((e: any) => e.key === 'status')?.value || 'found',
            }));
            
            setTopFindings(mapped);
            setTotalResults(summaryArray.length);
            
            // Show preview when maigret scan completes
            if (summaryArray.length > 0) {
              setShowPreview(true);
            }
          }
        }
      )
      .subscribe();

    // Helper to upsert provider status
    const upsertProvider = (
      name: string, 
      status: ProviderStatus['status'], 
      message?: string,
      retryCount?: number,
      maxRetries?: number
    ) => {
      setProviders((prev) => {
        const existing = prev.find((p) => p.name === name);
        if (existing) {
          return prev.map((p) =>
            p.name === name 
              ? { 
                  ...p, 
                  status, 
                  message: message || p.message,
                  retryCount: retryCount !== undefined ? retryCount : p.retryCount,
                  maxRetries: maxRetries !== undefined ? maxRetries : p.maxRetries
                } 
              : p
          );
        }
        return [...prev, { name, status, message: message || '', retryCount, maxRetries }];
      });
    };

    // Subscribe to authoritative scan_jobs table for accurate progress (Advanced pipeline only)
    const jobChannel = pipelineType === 'advanced' ? supabase
      .channel(`scan_jobs_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scan_jobs',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          console.debug('[ScanProgressDialog] scan_jobs UPDATE:', payload);
          const job = payload.new as any;
          
          setLastEventAt(Date.now());
          
          if (job.providers_completed !== undefined && job.providers_total !== undefined) {
            setProvidersCompleted(job.providers_completed);
            setProvidersTotal(job.providers_total);
            
            if (job.providers_total > 0) {
              const pct = Math.round((job.providers_completed / job.providers_total) * 100);
              setProgress(Math.max(5, Math.min(pct, 95))); // Clamp between 5-95%
            }
          }
          
          if (job.status === 'finished') {
            setStatus('completed');
            setProgress(100);
          } else if (job.status === 'error') {
            setStatus('failed');
          } else if (job.status === 'canceled') {
            setStatus('cancelled');
          }
        }
      )
      .subscribe() : null;

    // Subscribe to Maigret scan progress updates (Advanced username scans only)
    const maigretChannel = pipelineType === 'advanced' ? supabase
      .channel(`scan_progress_${scanId}`)
      .on('broadcast', { event: 'provider_update' }, (payload: any) => {
        console.debug('[ScanProgressDialog] Maigret provider_update:', payload);
        const update = payload.payload;
        upsertProvider(update.provider, update.status, update.message);
        
        setLastEventAt(Date.now());

        if (update.creditsUsed !== undefined) {
          setCreditsUsed(update.creditsUsed);
        }
        
        // Use providersCompleted/totalProviders if available
        if (update.providersCompleted !== undefined && update.totalProviders !== undefined) {
          setProvidersCompleted(update.providersCompleted);
          setProvidersTotal(update.totalProviders);
          if (update.totalProviders > 0) {
            const pct = Math.round((update.providersCompleted / update.totalProviders) * 100);
            setProgress(Math.max(5, Math.min(pct, 95)));
          }
        }
      })
      .on('broadcast', { event: 'scan_complete' }, async (payload: any) => {
        console.debug('[ScanProgressDialog] Maigret scan_complete:', payload);
        setStatus('completed');
        setProgress(100);
        setLastEventAt(Date.now());
        
        const resultsCount = payload.payload?.resultsCount || payload.payload?.totalFindings || 0;
        setTotalResults(resultsCount);
        
        if (resultsCount === 0) {
          // Zero results - save partial case and show helpful toast
          toast.info('No results found', {
            description: 'Try a broader query or different username variant',
            duration: 5000,
          });
          void handleZeroResults(); // Fire and forget
        } else {
          // Fetch final findings and show preview
          fetchTopFindings().then(() => {
            setShowPreview(true);
          });
          playSuccessSound();
          triggerConfetti();
          toast.success(`Scan completed - ${resultsCount} results found`);
        }
        
        setTimeout(() => onComplete?.(), 3000); // Extra time to view preview
      })
      .on('broadcast', { event: 'scan_failed' }, (payload: any) => {
        console.debug('[ScanProgressDialog] Maigret scan_failed:', payload);
        setStatus('failed');
        setLastEventAt(Date.now());
        toast.error(payload.payload.error || 'Scan failed');
      })
      .on('broadcast', { event: 'scan_cancelled' }, () => {
        console.debug('[ScanProgressDialog] Maigret scan_cancelled');
        setStatus('cancelled');
        setLastEventAt(Date.now());
        toast.info('Scan cancelled');
        setTimeout(() => onComplete?.(), 1000);
      })
      .subscribe() : null;
    
    // Inactivity watchdog
    const watchdogInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastEvent = now - lastEventAt;
      
      if (status !== 'running') {
        return; // Don't show warnings if scan completed/failed/cancelled
      }
      
      if (timeSinceLastEvent > 60000 && timeSinceLastEvent < 120000) {
        // 60-120 seconds: show hint
        setShowInactivityHint(true);
      } else if (timeSinceLastEvent >= 120000) {
        // 120+ seconds: show timeout warning
        setShowInactivityHint(false);
        setShowTimeoutWarning(true);
      } else {
        setShowInactivityHint(false);
        setShowTimeoutWarning(false);
      }
    }, 5000); // Check every 5 seconds

    // Subscribe to orchestrator progress updates (Advanced scans only)
    const orchestratorChannel = pipelineType === 'advanced' ? supabase
      .channel(`scan_progress:${scanId}`)
      .on('broadcast', { event: 'progress' }, (payload: any) => {
        console.debug('[ScanProgressDialog] Orchestrator progress:', payload);
        const update = payload.payload;
        
        // Map orchestrator messages to provider updates
        if (update.message) {
          const queryMatch = update.message.match(/Querying (.+)\.\.\./);
          const completedMatch = update.message.match(/Completed (.+)\.\.\./);
          const retryMatch = update.message.match(/Retry (\d+)\/(\d+) for (.+)\.\.\./);
          
          if (retryMatch) {
            const [, current, max, providerName] = retryMatch;
            upsertProvider(
              providerName, 
              'retrying', 
              `Retrying (${current}/${max})...`,
              parseInt(current),
              parseInt(max)
            );
          } else if (queryMatch) {
            upsertProvider(queryMatch[1], 'loading', 'Querying...');
          } else if (completedMatch) {
            const findingsText = update.findingsCount !== undefined 
              ? ` (${update.findingsCount} findings)` 
              : '';
            upsertProvider(completedMatch[1], 'success', `Completed${findingsText}`);
          } else if (update.error) {
            const providerName = update.provider || 'Provider';
            upsertProvider(providerName, 'failed', update.message);
          }
        }

        // Update overall progress from orchestrator
        if (update.completedProviders !== undefined && update.totalProviders !== undefined) {
          const pct = (update.completedProviders / update.totalProviders) * 100;
          setProgress(Math.min(pct, 95));
        }

        if (update.creditsUsed !== undefined) {
          setCreditsUsed(update.creditsUsed);
        }

        // Handle completion
        if (update.status === 'completed') {
          console.debug('[ScanProgressDialog] Orchestrator completed');
          setStatus('completed');
          setProgress(100);
          
          const resultsCount = update.resultsCount || update.findingsCount || 0;
          setTotalResults(resultsCount);
          
          if (resultsCount === 0) {
            // Zero results - save partial case and show helpful toast
            toast.info('No results found', {
              description: 'Try a broader query or different identifier',
              duration: 5000,
            });
            void handleZeroResults(); // Fire and forget
          } else {
            // Fetch final findings and show preview
            fetchTopFindings().then(() => {
              setShowPreview(true);
            });
            playSuccessSound();
            triggerConfetti();
            toast.success(`Scan completed - ${resultsCount} results found`);
          }
          
          setTimeout(() => onComplete?.(), 3000); // Extra time to view preview
        } else if (update.status === 'failed') {
          console.debug('[ScanProgressDialog] Orchestrator failed');
          setStatus('failed');
          toast.error(update.message || 'Scan failed');
        }
      })
      .on('broadcast', { event: 'scan_cancelled' }, () => {
        console.debug('[ScanProgressDialog] Orchestrator scan_cancelled');
        setStatus('cancelled');
        toast.info('Scan cancelled');
        setTimeout(() => onComplete?.(), 1000);
      })
      .subscribe() : null;

    return () => {
      clearInterval(watchdogInterval);
      if (jobChannel) supabase.removeChannel(jobChannel);
      if (maigretChannel) supabase.removeChannel(maigretChannel);
      if (orchestratorChannel) supabase.removeChannel(orchestratorChannel);
      supabase.removeChannel(findingsChannel);
      supabase.removeChannel(maigretResultsChannel);
    };
  }, [scanId, open, onComplete, status, lastEventAt, pipelineType]);

  const handleZeroResults = async () => {
    if (!scanId || isSavingCase) return;
    
    setIsSavingCase(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch scan details
      const { data: scan } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (!scan) return;

      // Save partial case with zero results
      const { error: caseError } = await supabase
        .from('cases')
        .insert({
          title: `No Results Scan - ${scan.scan_type || 'Unknown'}`,
          description: `Scan completed with no findings. Target: ${scan.email || scan.username || scan.phone || 'N/A'}. Consider trying broader search terms or alternative identifiers.`,
          user_id: user.id,
          scan_id: scanId,
          status: 'closed',
          priority: 'low',
          results: [], // Empty results
        });

      if (caseError) {
        console.error('[ScanProgressDialog] Failed to save zero-results case:', caseError);
      } else {
        console.log('[ScanProgressDialog] Saved zero-results case for scan:', scanId);
      }
    } catch (error) {
      console.error('[ScanProgressDialog] Error in handleZeroResults:', error);
    } finally {
      setIsSavingCase(false);
    }
  };

  const handleCancel = async () => {
    if (!scanId) return;
    
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-scan', {
        body: { scanId },
      });

      if (error) {
        // Check if it's already terminal (400 error)
        if (error.message?.includes('already')) {
          toast.info(error.message);
          onOpenChange(false);
          return;
        }
        throw error;
      }

      setStatus('cancelled');
      toast.info(data?.message || 'Scan cancelled');
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('[ScanProgressDialog] Cancel error:', error);
      
      // Handle scan not found specifically
      if (error.message?.includes('Scan not found') || error.message?.includes('404')) {
        toast.error('Cannot cancel - scan not found', {
          description: 'This scan may have failed to start. Try closing the dialog.',
          duration: 5000,
        });
        setStatus('failed'); // Update status so retry button shows
      } else if (error.message?.includes('already')) {
        toast.info(error.message);
        onOpenChange(false);
      } else {
        toast.error('Failed to cancel scan', {
          description: error.message || 'Please try closing the dialog',
        });
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetry = async () => {
    if (!scanId) return;
    
    try {
      // Close the dialog
      onOpenChange(false);
      
      // Fetch scan details to retry with same parameters
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (scanError || !scan) {
        toast.error('Unable to retry - scan details not found');
        return;
      }

      toast.info('Retrying scan with same parameters...');
      
      // Trigger callback to restart the scan
      setTimeout(() => {
        onComplete?.();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to retry scan');
    }
  };

  const getStatusIcon = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'retrying':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ProviderStatus['status'], retryCount?: number, maxRetries?: number) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Done</Badge>;
      case 'loading':
        return <Badge variant="default" className="bg-blue-500">Loading</Badge>;
      case 'retrying':
        return (
          <Badge variant="default" className="bg-yellow-500">
            Retry {retryCount}/{maxRetries}
          </Badge>
        );
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
              <div className="flex items-center gap-2">
                {providersTotal > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {providersCompleted} / {providersTotal} providers
                  </span>
                )}
                <span className="text-muted-foreground">{progress}%</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Inactivity hints */}
            {showInactivityHint && (
              <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 animate-fade-in">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Still working – slow provider responses...</span>
              </div>
            )}
            {showTimeoutWarning && (
              <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 animate-fade-in">
                <AlertCircle className="h-3 w-3" />
                <span>Timeout waiting for provider updates. You can retry or cancel below.</span>
              </div>
            )}
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

          {/* Results Preview Section */}
          {showPreview && topFindings.length > 0 && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Scan Results Preview</h3>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {totalResults} total findings
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Providers Scanned</p>
                  <p className="text-2xl font-bold">{providersCompleted}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Results Found</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalResults}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Top Findings:</p>
                <ScrollArea className="h-[120px] w-full rounded-md border">
                  <div className="p-2 space-y-2">
                    {topFindings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 p-2 rounded bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{finding.site}</p>
                          {finding.url && (
                            <a
                              href={finding.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary truncate flex items-center gap-1"
                            >
                              <span className="truncate">{finding.url}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          )}
                        </div>
                        <Badge variant="outline" className="flex-shrink-0 text-xs">
                          {finding.status || 'Found'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Viewing full results in a moment...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
            <div className="text-sm order-2 sm:order-1">
              {status === 'completed' && totalResults > 0 && (
                <span className="text-green-600 dark:text-green-400 font-medium animate-fade-in">
                  🎉 Found {totalResults} results!
                </span>
              )}
              {status === 'completed' && totalResults === 0 && (
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  ⚠️ No results found - partial case saved
                </span>
              )}
              {status === 'failed' && (
                <span className="text-destructive font-medium">Scan failed - you can retry</span>
              )}
              {status === 'cancelled' && (
                <span className="text-muted-foreground">Scan cancelled - partial results saved</span>
              )}
              {status === 'running' && (
                <span className="text-muted-foreground">
                  Scan in progress... {providers.filter(p => p.status === 'success').length}/{providers.length} providers complete
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 order-1 sm:order-2">
              {status === 'running' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 sm:flex-none"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel Scan
                    </>
                  )}
                </Button>
              )}
              {status === 'failed' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleRetry}
                  className="flex-1 sm:flex-none"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Retry Scan
                </Button>
              )}
              {(status === 'completed' || status === 'cancelled') && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
