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
      
      // Invoke scan with retry logic
      addLog({ level: 'info', message: 'Invoking scan function' });
      
      let lastError: any;
      const maxRetries = 3;
      const delays = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          addLog({ 
            level: 'debug', 
            message: `Scan attempt ${attempt}/${maxRetries}` 
          });
          
          const { data, error } = await supabase.functions.invoke('enqueue-maigret-scan', {
            body: {
              username: options.username,
              tags: options.tags,
              all_site: options.allSites,
              artifacts: options.artifacts,
            },
          });
          
          if (error) {
            lastError = error;
            
            // Check if error is retryable
            const isRetryable = 
              error.message?.includes('timeout') ||
              error.message?.includes('network') ||
              error.message?.includes('unavailable') ||
              error.message?.includes('503') ||
              error.message?.includes('502');
            
            if (!isRetryable || attempt >= maxRetries) {
              addLog({ 
                level: 'error', 
                message: 'Scan invocation failed (non-retryable or max retries)', 
                data: error 
              });
              throw error;
            }
            
            // Wait before retry
            const delay = delays[attempt - 1] || 4000;
            addLog({ 
              level: 'warn', 
              message: `Retrying in ${delay}ms due to: ${error.message}`,
              data: { attempt, delay } 
            });
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          addLog({ 
            level: 'info', 
            message: 'Scan started successfully', 
            data: { jobId: data.jobId, attempts: attempt } 
          });
          
          return data;
        } catch (err: any) {
          lastError = err;
          
          if (attempt >= maxRetries) {
            addLog({ 
              level: 'error', 
              message: 'Scan failed after all retries', 
              data: err 
            });
            throw err;
          }
          
          const delay = delays[attempt - 1] || 4000;
          addLog({ 
            level: 'warn', 
            message: `Retrying in ${delay}ms due to exception`,
            data: { attempt, delay, error: err.message } 
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError;
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
