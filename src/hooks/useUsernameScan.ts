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
      
      // Call scan-start with resilient pattern (same as SimpleScanForm)
      const requestBody = {
        username: options.username,
        platforms: options.tags ? options.tags.split(',').map(t => t.trim()) : undefined,
        batch_id: batchId,
        timeout: 25, // 25s timeout for quick feedback
      };
      
      addLog({ level: 'info', message: 'Invoking scan-start', data: requestBody });
      
      const { data, error } = await supabase.functions.invoke('scan-start', {
        body: requestBody,
      });
      
      // Resilient error handling - even on error, return batchId for polling
      if (error) {
        addLog({ 
          level: 'warn', 
          message: 'Worker response slow/timeout - continuing with background polling',
          data: error 
        });
        
        // Return batchId for results page polling
        return { jobId: batchId, status: 'queued' };
      }
      
      // Success - use job_id from response or fallback to batchId
      const jobId = data?.job_id || batchId;
      const statusCode = data?.status;
      
      addLog({ 
        level: 'info', 
        message: statusCode === 'queued' ? 'Scan queued (202)' : 'Scan started (201)', 
        data: { jobId, statusCode } 
      });
      
      return { jobId, status: statusCode === 'queued' ? 'queued' : 'started' };
      
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
