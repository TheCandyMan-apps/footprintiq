import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/hooks/useWorkspace';

export interface ScanLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  provider?: string;
  message: string;
  data?: any;
}

export interface UsernameScanOptions {
  scanId?: string; // Optional pre-generated scan ID
  username: string;
  tags?: string;
  allSites?: boolean;
  artifacts?: string[];
  debugMode?: boolean;
  providers?: string[]; // New: selected tools to use
  workspaceId?: string; // ✅ NEW: optional workspace override for race condition prevention
}

export const useUsernameScan = () => {
  const { workspace } = useWorkspace();
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
    setDebugLogs([]);
    
    try {
      // ✅ STRICT USERNAME VALIDATION - Prevent "true", "false", empty, or invalid values
      const username = options.username;
      
      if (!username || typeof username !== 'string') {
        const error = 'Invalid username - must be a non-empty string';
        addLog({ level: 'error', message: error, data: { received: username, type: typeof username } });
        throw new Error(error);
      }
      
      const trimmedUsername = username.trim();
      if (trimmedUsername.length === 0) {
        const error = 'Username cannot be empty';
        addLog({ level: 'error', message: error });
        throw new Error(error);
      }
      
      // Reject obvious invalid/boolean-like values
      const invalidValues = ['true', 'false', 'null', 'undefined', 'nan', '0', '1'];
      if (invalidValues.includes(trimmedUsername.toLowerCase())) {
        const error = `Invalid username: "${trimmedUsername}" is not a valid target`;
        addLog({ level: 'error', message: error, data: { received: trimmedUsername } });
        throw new Error(error);
      }
      
      // Reject usernames that are too short (likely accidental)
      if (trimmedUsername.length < 2) {
        const error = 'Username must be at least 2 characters';
        addLog({ level: 'error', message: error });
        throw new Error(error);
      }
      
      addLog({ level: 'info', message: 'Starting username scan', data: { username: trimmedUsername } });
      
      // ✅ Check quota BEFORE starting scan
      const { canRunScan } = await import('@/lib/billing/quotas');
      const quotaCheck = canRunScan({
        plan: (workspace as any)?.plan,
        scans_used_monthly: (workspace as any)?.scans_used_monthly,
        scan_limit_monthly: (workspace as any)?.scan_limit_monthly,
      });
      
      if (!quotaCheck.allowed) {
        addLog({ level: 'error', message: 'Quota exceeded', data: quotaCheck });
        toast.error(quotaCheck.message || 'Monthly scan limit reached. Please upgrade your plan.');
        throw new Error(quotaCheck.message);
      }
      
      addLog({ level: 'debug', message: 'Quota check passed', data: { scansUsed: quotaCheck.scansUsed, scansLimit: quotaCheck.scansLimit } });
      
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
      
      // Use provided scanId or generate new one
      const batchId = options.scanId || crypto.randomUUID();
      addLog({ level: 'debug', message: options.scanId ? 'Using provided scan ID' : 'Generated batch ID', data: { batchId } });
      
      // ✅ Use provided workspaceId as override, fallback to hook workspace
      const workspaceId = options.workspaceId || workspace?.id;
      
      // Validate workspace
      if (!workspaceId) {
        addLog({ level: 'error', message: 'No workspace found - please refresh and try again' });
        throw new Error('Workspace not loaded');
      }
      
      addLog({ level: 'debug', message: 'Using workspace', data: { workspaceId } });
      
      // All validations passed, now set scanning state
      setIsScanning(true);

      // Default providers if not specified (exclude gosearch for Pro)
      const selectedProviders = options.providers?.length 
        ? options.providers 
        : ['maigret', 'sherlock'];
      
      // Call scan-orchestrate with multi-tool support - CORRECT FIELD NAMES
      const requestBody = {
        scanId: batchId,
        type: 'username' as const,           // ✅ Correct field name
        value: options.username,             // ✅ Correct field name  
        workspaceId: workspaceId,            // ✅ Use ensured workspace ID
        options: {
          noCache: true,                     // ✅ Force cache bypass for username scans
          providers: selectedProviders,      // ✅ Moved inside options
          platforms: options.tags ? options.tags.split(',').map(t => t.trim()) : undefined,
          all_sites: options.allSites,
          artifacts: options.artifacts,
        },
      };
      
      addLog({ level: 'info', message: 'Invoking n8n-scan-trigger for username scan', data: requestBody });
      
      // Route username scans through n8n for longer provider timeouts
      // ✅ CRITICAL: Pass pre-generated scanId so frontend and backend use same ID
      const { data, error } = await supabase.functions.invoke('n8n-scan-trigger', {
        body: {
          scanId: batchId,  // ✅ Pass pre-generated scan ID
          username: options.username,
          workspaceId: workspaceId,
          scanType: 'username',
        },
      });
      
      // Enhanced error handling - detect validation errors / timeouts
      if (error) {
        const errorMsg = error.message || 'Unknown error';
        const status = (error as any).status as number | undefined;
        const isTimeout = /timeout|timed out|AbortSignal/i.test(errorMsg || '') || status === 504 || status === 408;

        // Check for monthly limit reached (403 with specific message)
        if (status === 403 && errorMsg.includes('Monthly scan limit')) {
          addLog({
            level: 'error',
            message: errorMsg,
            data: { status, sentBody: requestBody }
          });
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }

        // Validation or bad request
        if (
          errorMsg.includes('type') ||
          errorMsg.includes('value') ||
          errorMsg.includes('workspaceId') ||
          errorMsg.includes('Invalid request') ||
          status === 400
        ) {
          addLog({
            level: 'error',
            message: 'Invalid scan request format',
            data: { error: errorMsg, sentBody: requestBody, status }
          });
          toast.error('Failed to start scan. Please refresh and try again.');
          throw new Error('Invalid scan request - missing or invalid fields');
        }

        if (isTimeout) {
          // Resilient handling for timeouts only
          addLog({ level: 'warn', message: 'Orchestrator timeout - continuing with background polling', data: error });
          return { jobId: batchId, status: 'queued' };
        }

        // All other errors: surface to user
        addLog({ level: 'error', message: 'Orchestrator error', data: error });
        throw new Error(errorMsg);
      }
      
      // Success - use scanId from n8n-scan-trigger response (returns { id, scanId, status })
      const scanId = data?.scanId || data?.id;
      if (!scanId) {
        addLog({ level: 'error', message: 'Server did not return a scan ID', data });
        throw new Error('Server did not return a scan ID');
      }
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
