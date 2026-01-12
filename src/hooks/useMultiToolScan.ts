import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActiveScanContext } from '@/contexts/ActiveScanContext';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';

export interface MultiToolScanRequest {
  target: string;
  targetType: 'username' | 'email' | 'ip' | 'domain';
  tools: string[];
  workspaceId: string;
}

export interface ToolProgress {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  message: string;
  resultCount?: number;
}

export interface ScanProgress {
  stage: string;
  message: string;
  progress: number;
  tools?: ToolProgress[];
}

export function useMultiToolScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const { startTracking } = useActiveScanContext();
  const navigate = useNavigate();

  const startMultiToolScan = async (request: MultiToolScanRequest) => {
    setIsScanning(true);
    setProgress({
      stage: 'initializing',
      message: 'Starting multi-tool scan...',
      progress: 0,
      tools: request.tools.map(tool => ({
        name: tool,
        status: 'pending',
        message: 'Waiting...',
      })),
    });

    try {
      console.log('[useMultiToolScan] Starting multi-tool scan:', {
        target: request.target,
        targetType: request.targetType,
        tools: request.tools,
        workspaceId: request.workspaceId,
      });

      // Generate scan ID upfront
      const scanId = self.crypto.randomUUID();

      // Start tracking
      startTracking({
        scanId,
        type: 'advanced',
        target: request.target,
        startedAt: new Date().toISOString(),
      });

      // Subscribe to progress updates
      const progressChannel = supabase
        .channel(`multi-tool-progress:${scanId}`)
        .on('broadcast', { event: 'tool_progress' }, (payload: any) => {
          const update = payload.payload;
          console.log('[useMultiToolScan] Tool progress:', update);
          
          setProgress(prev => {
            if (!prev) return null;
            
            const updatedTools = prev.tools?.map(tool => {
              if (tool.name === update.toolName) {
                return {
                  ...tool,
                  status: update.status,
                  message: update.message,
                  resultCount: update.resultCount,
                };
              }
              return tool;
            });

            return {
              ...prev,
              stage: update.stage || prev.stage,
              message: update.globalMessage || prev.message,
              progress: update.progress || prev.progress,
              tools: updatedTools,
            };
          });
        })
        .on('broadcast', { event: 'scan_complete' }, (payload: any) => {
          console.log('[useMultiToolScan] Scan complete:', payload);
          setProgress({
            stage: 'completed',
            message: 'All tools completed successfully',
            progress: 100,
            tools: progress?.tools?.map(t => ({ ...t, status: t.status === 'running' ? 'completed' : t.status })),
          });
          
          toast.success('Multi-tool scan completed', {
            description: 'View results to see correlated findings',
            action: {
              label: 'View Results',
              onClick: () => navigate(`/results/${scanId}`),
            },
          });
          
          setTimeout(() => {
            setIsScanning(false);
            navigate(`/results/${scanId}`);
          }, 2000);
        })
        .on('broadcast', { event: 'scan_failed' }, (payload: any) => {
          console.error('[useMultiToolScan] Scan failed:', payload);
          toast.error('Multi-tool scan failed', {
            description: payload.payload?.error || 'Some tools failed to complete',
          });
          setIsScanning(false);
        })
        .subscribe();

      // Invoke the edge function
      const { data, error } = await supabase.functions.invoke('multi-tool-orchestrate', {
        body: {
          ...request,
          scanId,
        },
      });

      if (error) {
        console.error('[useMultiToolScan] Edge function error:', error);
        
        // Parse structured error response if available
        let errorCode = '';
        let errorMessage = error.message || 'Failed to start multi-tool scan';
        let errorTitle = 'Scan Failed';
        
        // Try to extract error code from structured response
        try {
          if (typeof error === 'object' && error !== null) {
            const errObj = error as Record<string, unknown>;
            errorCode = (errObj.code || errObj.error || '') as string;
            if (errObj.message) {
              errorMessage = errObj.message as string;
            }
          }
        } catch (e) {
          // Parsing failed, use defaults
        }
        
        // Handle tier restriction errors - Upgrade required, NOT a failure
        if (errorCode === 'scan_blocked_by_tier' || errorCode === 'no_providers_available_for_tier' || errorCode === 'free_any_scan_exhausted') {
          toast.error('Upgrade required', {
            description: errorMessage || 'This scan type is available on Pro.',
            action: {
              label: 'Upgrade Now',
              onClick: () => navigate('/settings/billing')
            },
            duration: 8000
          });
          progressChannel.unsubscribe();
          setIsScanning(false);
          return null;
        }
        
        // Handle email verification requirement
        if (errorCode === 'email_verification_required') {
          toast.error('Verify your email', {
            description: 'Please verify your email to use your free advanced scan.',
            duration: 8000
          });
          progressChannel.unsubscribe();
          setIsScanning(false);
          return null;
        }
        
        // Track error in Sentry (only for actual failures, not tier restrictions)
        Sentry.captureException(error, {
          tags: {
            category: 'multi_tool_scan',
            error_type: 'orchestration_failed',
            workspace_id: request.workspaceId,
          },
          contexts: {
            scan: {
              target: request.target,
              targetType: request.targetType,
              tools: request.tools,
            },
          },
          level: 'error',
        });

        // Provide specific error messages for known error types
        if (errorMessage?.includes('Insufficient credits')) {
          errorTitle = 'Insufficient Credits';
          errorMessage = 'You need more credits to run this scan. Please purchase additional credits.';
        } else if (errorMessage?.includes('Not a member')) {
          errorTitle = 'Access Denied';
          errorMessage = 'You do not have access to this workspace.';
        } else if (errorMessage?.includes('No tools available')) {
          errorTitle = 'Tools Unavailable';
          errorMessage = 'All selected tools are currently unavailable. Please try again later.';
        }

        toast.error(errorTitle, {
          description: errorMessage,
        });

        progressChannel.unsubscribe();
        setIsScanning(false);
        return null;
      }

      console.log('[useMultiToolScan] Scan started successfully:', data);
      
      return { scanId, data };
    } catch (error) {
      console.error('[useMultiToolScan] Unexpected error:', error);
      
      // Track unexpected errors in Sentry
      Sentry.captureException(error, {
        tags: {
          category: 'multi_tool_scan',
          error_type: 'unexpected_error',
          workspace_id: request.workspaceId,
        },
        contexts: {
          scan: {
            target: request.target,
            targetType: request.targetType,
            tools: request.tools,
          },
        },
        level: 'error',
      });

      toast.error('Scan Failed', {
        description: 'An unexpected error occurred. Please try again.',
      });
      
      setIsScanning(false);
      return null;
    }
  };

  return {
    isScanning,
    progress,
    startMultiToolScan,
  };
}
