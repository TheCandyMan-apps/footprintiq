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
        toast.success('Session refreshed—retry scan');
      }
      
      addLog({ level: 'debug', message: 'Authentication verified', data: { userId: user?.id } });
      
      // Invoke scan with timeout protection
      addLog({ level: 'info', message: 'Invoking scan function' });
      
      const { data, error } = await supabase.functions.invoke('enqueue-maigret-scan', {
        body: {
          username: options.username,
          tags: options.tags,
          all_sites: options.allSites,
          artifacts: options.artifacts,
        },
      });
      
      if (error) {
        addLog({ level: 'error', message: 'Scan invocation failed', data: error });
        throw error;
      }
      
      addLog({ level: 'info', message: 'Scan started successfully', data: { jobId: data.jobId } });
      
      return data;
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
