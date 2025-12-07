import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
  progress?: number;
  resultCount?: number;
}

interface ScanStatusIndicatorProps {
  scanId: string;
  onComplete?: () => void;
  compact?: boolean;
  className?: string;
}

export function ScanStatusIndicator({ 
  scanId, 
  onComplete, 
  compact = false,
  className 
}: ScanStatusIndicatorProps) {
  const [scanStatus, setScanStatus] = useState<'pending' | 'running' | 'completed' | 'failed' | 'cancelled'>('pending');
  const [overallProgress, setOverallProgress] = useState(0);
  const [providers, setProviders] = useState<Map<string, ProviderStatus>>(new Map());
  const [totalProviders, setTotalProviders] = useState(0);
  const [completedProviders, setCompletedProviders] = useState(0);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalFindings, setTotalFindings] = useState(0);
  
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  // Timer for elapsed time
  useEffect(() => {
    if (scanStatus === 'running' || scanStatus === 'pending') {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [scanStatus]);

  // Subscribe to realtime updates - single unified channel
  useEffect(() => {
    console.log('[ScanStatusIndicator] Subscribing to scan progress for:', scanId);
    
    // Use single channel with colon separator (matches n8n-scan-progress backend)
    const channel = supabase.channel(`scan_progress:${scanId}`);

    channel
      .on('broadcast', { event: 'provider_update' }, (payload) => {
        console.log('[ScanStatusIndicator] Provider update:', payload);
        const data = payload.payload;
        
        if (data.provider) {
          setProviders(prev => {
            const updated = new Map(prev);
            // Map backend status to frontend status
            let status: ProviderStatus['status'] = 'running';
            if (data.status === 'success' || data.status === 'completed') {
              status = 'completed';
            } else if (data.status === 'failed' || data.status === 'error') {
              status = 'failed';
            } else if (data.status === 'loading' || data.status === 'running') {
              status = 'running';
            }
            
            updated.set(data.provider, {
              name: data.provider,
              status,
              message: data.message,
              resultCount: data.resultCount
            });
            return updated;
          });
          
          // Update progress counters
          if (data.status === 'success' || data.status === 'completed') {
            setCompletedProviders(prev => prev + 1);
            setScanStatus('running');
          }
          
          // Update total providers if provided
          if (data.totalProviders) {
            setTotalProviders(data.totalProviders);
          }
        }
      })
      .on('broadcast', { event: 'scan_complete' }, (payload) => {
        console.log('[ScanStatusIndicator] Scan complete:', payload);
        setScanStatus('completed');
        setOverallProgress(100);
        if (payload.payload?.findingsCount !== undefined) {
          setTotalFindings(payload.payload.findingsCount);
        } else if (payload.payload?.totalFindings !== undefined) {
          setTotalFindings(payload.payload.totalFindings);
        }
        onComplete?.();
      })
      .on('broadcast', { event: 'scan_failed' }, (payload) => {
        console.log('[ScanStatusIndicator] Scan failed:', payload);
        setScanStatus('failed');
      })
      .on('broadcast', { event: 'scan_cancelled' }, () => {
        console.log('[ScanStatusIndicator] Scan cancelled');
        setScanStatus('cancelled');
        onComplete?.();
      })
      .subscribe((status) => {
        console.log('[ScanStatusIndicator] Channel subscription status:', status);
      });

    return () => {
      console.log('[ScanStatusIndicator] Unsubscribing from channel');
      supabase.removeChannel(channel);
    };
  }, [scanId, onComplete]);

  const getStatusIcon = () => {
    switch (scanStatus) {
      case 'pending':
        return <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />;
      case 'running':
        return <Activity className="w-5 h-5 text-primary animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (scanStatus) {
      case 'pending':
        return <Badge variant="outline" className="text-xs">Initializing</Badge>;
      case 'running':
        return <Badge variant="default" className="text-xs bg-primary">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-xs">Cancelled</Badge>;
    }
  };

  const getProviderStatusIcon = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const providerArray = Array.from(providers.values());
  const isActive = scanStatus === 'running' || scanStatus === 'pending';

  if (compact && !isExpanded) {
    return (
      <Card 
        className={cn(
          "p-3 cursor-pointer hover:shadow-[var(--shadow-glow)] transition-[var(--transition-smooth)]",
          className
        )}
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">Scan Status</span>
                {getStatusBadge()}
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                {completedProviders}/{totalProviders} providers
              </div>
              {isActive && (
                <div className="text-xs text-muted-foreground">
                  {formatTime(elapsedTime)}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Scan Status</h3>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{completedProviders} of {totalProviders} providers completed</span>
              {isActive && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(elapsedTime)}
                  </span>
                </>
              )}
              {totalFindings > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {totalFindings} findings
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-semibold">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

      {/* Provider Progress */}
      {providerArray.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Provider Status</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {providerArray.map((provider) => (
              <div 
                key={provider.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
              >
                {getProviderStatusIcon(provider.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium truncate">{provider.name}</span>
                    {provider.resultCount !== undefined && provider.resultCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {provider.resultCount} results
                      </Badge>
                    )}
                  </div>
                  {provider.message && (
                    <p className="text-xs text-muted-foreground truncate">{provider.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {scanStatus === 'completed' && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-500 font-medium">
            ✓ Scan completed successfully! Found {totalFindings} results across {completedProviders} providers.
          </p>
        </div>
      )}
      
      {scanStatus === 'failed' && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">
            Scan failed. Please try again or contact support if the issue persists.
          </p>
        </div>
      )}

      {scanStatus === 'cancelled' && (
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground font-medium">
            Scan was cancelled.
          </p>
        </div>
      )}
    </Card>
  );
}
