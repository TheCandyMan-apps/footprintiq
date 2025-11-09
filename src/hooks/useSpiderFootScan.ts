import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase.functions.invoke('spiderfoot-scan', {
        body: request,
      });

      if (error) {
        console.error('SpiderFoot scan error:', error);
        toast({
          title: 'Scan Failed',
          description: error.message || 'Failed to start SpiderFoot scan',
          variant: 'destructive',
        });
        return null;
      }

      if (data?.success) {
        toast({
          title: 'Scan Started',
          description: `SpiderFoot scan initiated for ${request.target}`,
        });
        return data.scan_id;
      }

      return null;
    } catch (error) {
      console.error('Error starting SpiderFoot scan:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
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
