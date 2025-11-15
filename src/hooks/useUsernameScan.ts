import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScanLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  provider?: string;
  message: string;
  data?: any;
}

export interface UsernameScanOptions {
  username: string;
  tags?: string;
  allSites?: boolean;
  artifacts?: string[];
  debugMode?: boolean;
  providers?: string[]; // New: selected tools to use
}

export const useUsernameScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [debugLogs, setDebugLogs] = useState<ScanLog[]>([]);
  const [debugMode, setDebugMode] = useState(false);

  const addLog = useCallback((log: Omit<ScanLog, 'timestamp'>) => {
    const newLog = {
      ...log,
      timestamp: new Date().toISOString(),
    };
    setDebugLogs(prev => [...prev, newLog]);
    
    if (debugMode) {
      const emoji = log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : log.level === 'debug' ? '🔍' : '✅';
      console.log(`${emoji} [${log.level.toUpperCase()}]${log.provider ? ` [${log.provider}]` : ''}: ${log.message}`, log.data || '');
    }
  }, [debugMode]);

  const startScan = useCallback(async (options: UsernameScanOptions) => {
    setIsScanning(true);
    setDebugLogs([]);
    
    try {
      addLog({ level: 'info', message: 'Starting username scan', data: { username: options.username } });
      
      // Session check
      addLog({ level: 'debug', message: 'Checking authentication session' });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        addLog({ level: 'warn', message: 'Session invalid, attempting refresh' });
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          addLog({ level: 'error', message: 'Session refresh failed', data: refreshError });
          toast.error('Please log in again');
          throw new Error('Authentication required');
        }
        addLog({ level: 'info', message: 'Session refreshed successfully' });
      }
      
      // Generate client-side batch ID for tracking
      const batchId = crypto.randomUUID();
      addLog({ level: 'debug', message: 'Generated batch ID', data: { batchId } });
      
      // Default providers if not specified
      const selectedProviders = options.providers?.length 
        ? options.providers 
        : ['maigret', 'whatsmyname', 'gosearch'];
      
      // Call scan-orchestrate with multi-tool support
      const requestBody = {
        scan_type: 'username' as const,
        username: options.username,
        providers: selectedProviders,
        options: {
          platforms: options.tags ? options.tags.split(',').map(t => t.trim()) : undefined,
          all_sites: options.allSites,
          artifacts: options.artifacts,
        },
        timeout: 60, // Longer timeout for multi-tool scans
      };
      
      addLog({ level: 'info', message: 'Invoking scan-orchestrate', data: requestBody });
      
      const { data, error } = await supabase.functions.invoke('scan-orchestrate', {
        body: requestBody,
      });
      
      // Resilient error handling - even on error, return scanId for polling
      if (error) {
        addLog({ 
          level: 'warn', 
          message: 'Orchestrator response slow/timeout - continuing with background polling',
          data: error 
        });
        
        // Return batchId as fallback for results page polling
        return { jobId: batchId, status: 'queued' };
      }
      
      // Success - use scan_id from orchestrator response
      const scanId = data?.scan_id || data?.job_id || batchId;
      const statusCode = data?.status;
      
      addLog({ 
        level: 'info', 
        message: `Multi-tool scan initiated: ${selectedProviders.join(', ')}`, 
        data: { scanId, statusCode, providers: selectedProviders } 
      });
      
      return { jobId: scanId, status: statusCode === 'queued' ? 'queued' : 'started' };
      
    } catch (error) {
      addLog({ level: 'error', message: 'Scan failed', data: error });
      throw error;
    } finally {
      setIsScanning(false);
    }
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  return {
    isScanning,
    debugLogs,
    debugMode,
    setDebugMode,
    startScan,
    clearLogs,
    addLog,
  };
};
