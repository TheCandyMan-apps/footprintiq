import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as Sentry from '@sentry/react';

export interface SpiderFootScanRequest {
  target: string;
  target_type: 'email' | 'ip' | 'domain' | 'username' | 'phone';
  modules?: string[];
  workspace_id: string;
}

export interface SpiderFootScan {
  id: string;
  workspace_id: string;
  user_id: string;
  target: string;
  target_type: string;
  modules: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  scan_id: string | null;
  total_events: number;
  results: any[];
  correlations: any[];
  error: string | null;
  credits_used: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSpiderFootScan() {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState<SpiderFootScan | null>(null);

  const startScan = async (request: SpiderFootScanRequest): Promise<string | null> => {
    setIsScanning(true);
    
    try {
      console.log('[useSpiderFootScan] Starting scan with request:', {
        target: request.target,
        target_type: request.target_type,
        modules: request.modules?.length,
        workspace_id: request.workspace_id
      });

      const { data, error } = await supabase.functions.invoke('spiderfoot-scan', {
        body: request,
      });

      if (error) {
        console.error('[useSpiderFootScan] Edge function error:', {
          message: error.message,
          context: error.context,
          details: error
        });
        
        // Track error in Sentry
        Sentry.captureException(error, {
          tags: {
            category: 'spiderfoot',
            error_type: 'scan_start_failed',
            workspace_id: request.workspace_id,
          },
          contexts: {
            spiderfoot: {
              target: request.target,
              target_type: request.target_type,
              modules_count: request.modules?.length || 0,
            },
          },
          level: 'error',
        });
        
        // Provide more specific error messages
        let errorMessage = error.message || 'Failed to start SpiderFoot scan';
        let errorTitle = 'Scan Failed';
        
        if (error.message?.includes('not configured') || error.message?.includes('localhost')) {
          errorTitle = 'SpiderFoot Unavailable';
          errorMessage = 'SpiderFoot service is not configured. Check status in admin panel or contact support.';
        } else if (error.message?.includes('Insufficient credits')) {
          errorTitle = 'Insufficient Credits';
          errorMessage = 'You need more credits to run this scan. Please purchase additional credits.';
        } else if (error.message?.includes('Not a member')) {
          errorTitle = 'Access Denied';
          errorMessage = 'You do not have access to this workspace.';
        } else if (error.message?.includes('500') || error.message?.includes('Internal')) {
          errorTitle = 'SpiderFoot Unavailable';
          errorMessage = 'SpiderFoot worker is experiencing issues. Check status in admin panel or retry later.';
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });
        return null;
      }

      if (data?.success && data?.scan_id) {
        console.log('[useSpiderFootScan] Scan started successfully:', data.scan_id);
        toast({
          title: 'Scan Started',
          description: `SpiderFoot scan initiated for ${request.target}`,
        });
        return data.scan_id;
      }

      console.warn('[useSpiderFootScan] No scan_id returned');
      return null;
    } catch (error) {
      console.error('[useSpiderFootScan] Unexpected error:', error);
      
      // Track unexpected errors in Sentry
      Sentry.captureException(error, {
        tags: {
          category: 'spiderfoot',
          error_type: 'scan_unexpected_error',
          workspace_id: request.workspace_id,
        },
        contexts: {
          spiderfoot: {
            target: request.target,
            target_type: request.target_type,
          },
        },
        level: 'error',
      });
      
      toast({
        title: 'SpiderFoot Unavailable',
        description: 'An unexpected error occurred with SpiderFoot. Check status in admin panel or retry later.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const fetchScan = async (scanId: string): Promise<SpiderFootScan | null> => {
    try {
      const { data, error } = await supabase
        .from('spiderfoot_scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (error) {
        console.error('Error fetching scan:', error);
        return null;
      }

      setCurrentScan(data as SpiderFootScan);
      return data as SpiderFootScan;
    } catch (error) {
      console.error('Error fetching scan:', error);
      return null;
    }
  };

  const listScans = async (workspaceId: string, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('spiderfoot_scans')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error listing scans:', error);
        return [];
      }

      return data as SpiderFootScan[];
    } catch (error) {
      console.error('Error listing scans:', error);
      return [];
    }
  };

  return {
    startScan,
    fetchScan,
    listScans,
    isScanning,
    currentScan,
  };
}
