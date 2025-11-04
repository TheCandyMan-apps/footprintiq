import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/hooks/useWorkspace';

export interface AdvancedScanOptions {
  deepWeb?: boolean;
  socialMedia?: boolean;
  faceRecognition?: boolean;
  behavioralAnalysis?: boolean;
  threatForecasting?: boolean;
  correlationEngine?: boolean;
}

export interface ScanProgress {
  stage: string;
  progress: number;
  message: string;
}

export function useAdvancedScan() {
  const { workspace } = useWorkspace();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });

  const startAdvancedScan = async (
    scanData: {
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    },
    options: AdvancedScanOptions = {}
  ) => {
    setIsScanning(true);
    setProgress({ stage: 'initializing', progress: 0, message: 'Starting scan...' });

    try {
      // Create initial scan via orchestrator (expects type, value, workspaceId)
      if (!workspace?.id) {
        throw new Error('No workspace selected');
      }

      let type: 'email' | 'username' | 'domain' | 'phone';
      let value: string | undefined;

      if (scanData.email) {
        type = 'email';
        value = scanData.email;
      } else if (scanData.username) {
        type = 'username';
        value = scanData.username;
      } else if (scanData.phone) {
        type = 'phone';
        value = scanData.phone;
      } else {
        throw new Error('Please provide an email, username, or phone');
      }

      const { data: orchestrateData, error: orchestrateError } = await supabase.functions.invoke('scan-orchestrate', {
        body: {
          type,
          value: value!,
          workspaceId: workspace.id,
          options: { includeDarkweb: !!options.deepWeb },
        },
      });

      if (orchestrateError) throw orchestrateError;
      if (!orchestrateData?.scanId) throw new Error('Scan orchestration failed');
      const scan = { id: orchestrateData.scanId as string };

      setProgress({ stage: 'scanning', progress: 30, message: 'Scanning data sources...' });

      // Optional: Dark web monitoring
      if (options.deepWeb && (scanData.email || scanData.username)) {
        setProgress({ stage: 'darkweb', progress: 40, message: 'Scanning dark web...' });
        
        const targetValue = scanData.email || scanData.username!;
        const { error: darkwebError } = await supabase
          .from('darkweb_targets')
          .insert({
            workspace_id: workspace!.id,
            type: scanData.email ? 'email' : 'username',
            value: targetValue,
            active: true,
          });

        if (!darkwebError) {
          await supabase.functions.invoke('darkweb/monitor', {
            body: { target: targetValue },
          });
        }
      }

      // Optional: Face recognition - skip if no image available
      if (options.faceRecognition) {
        setProgress({ stage: 'face', progress: 50, message: 'Running face recognition...' });
        await supabase.functions.invoke('reverse-image-search', {
          body: { scanId: scan.id },
        });
      }

      // Optional: Behavioral analysis
      if (options.behavioralAnalysis) {
        setProgress({ stage: 'behavioral', progress: 60, message: 'Analyzing behavior patterns...' });
        await supabase.functions.invoke('behavioral-analysis', {
          body: { scanId: scan.id },
        });
      }

      // Optional: Correlation engine
      if (options.correlationEngine) {
        setProgress({ stage: 'correlation', progress: 70, message: 'Correlating data...' });
        await supabase.functions.invoke('correlation-engine', {
          body: { scanId: scan.id },
        });
      }

      // AI Analysis
      setProgress({ stage: 'ai', progress: 80, message: 'Running AI analysis...' });
      await supabase.functions.invoke('ai-analysis', {
        body: { scanId: scan.id },
      });

      // Index for RAG
      setProgress({ stage: 'indexing', progress: 90, message: 'Indexing for AI...' });
      await supabase.functions.invoke('ai-rag-indexer', {
        body: { scanId: scan.id },
      });

      // Optional: Generate threat forecast
      if (options.threatForecasting) {
        setProgress({ stage: 'forecasting', progress: 95, message: 'Generating threat forecast...' });
        await supabase.functions.invoke('threat-forecast-generator');
      }

      setProgress({ stage: 'complete', progress: 100, message: 'Scan complete!' });
      toast.success('Advanced scan completed successfully');

      return scan;

    } catch (error) {
      console.error('Advanced scan error:', error);
      toast.error('Advanced scan failed: ' + (error as Error).message);
      throw error;
    } finally {
      setIsScanning(false);
    }
  };

  return {
    startAdvancedScan,
    isScanning,
    progress,
  };
}
