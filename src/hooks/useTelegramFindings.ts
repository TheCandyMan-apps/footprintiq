/**
 * useTelegramFindings – Fetches Telegram-specific findings and lazy-loads artifacts.
 *
 * Findings come from the `findings` table (provider = 'telegram').
 * Large artifacts (messages, graph) come from `scan_artifacts` (source = 'telegram')
 * and are loaded on-demand to keep initial page load fast.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TelegramFinding {
  id: string;
  scan_id: string;
  provider: string;
  kind: string;
  severity: string;
  evidence: any;
  meta: any;
  created_at: string;
}

export interface TelegramArtifact {
  id: string;
  artifact_type: string;
  data: any;
  created_at: string;
}

export interface TelegramData {
  /** Lightweight summary findings from the findings table */
  findings: TelegramFinding[];
  /** On-demand heavy artifacts from scan_artifacts */
  artifacts: Record<string, TelegramArtifact | null>;
  /** Whether initial findings are loading */
  loading: boolean;
  /** Which artifact types are currently being fetched */
  artifactLoading: Record<string, boolean>;
  /** Load a specific artifact type on demand */
  loadArtifact: (artifactType: string) => Promise<void>;
  /** Convenience: does this scan have any telegram data? */
  hasTelegramData: boolean;
}

export function useTelegramFindings(scanId: string | null): TelegramData {
  const [findings, setFindings] = useState<TelegramFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [artifacts, setArtifacts] = useState<Record<string, TelegramArtifact | null>>({});
  const [artifactLoading, setArtifactLoading] = useState<Record<string, boolean>>({});

  // Load lightweight findings on mount
  useEffect(() => {
    if (!scanId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('findings')
          .select('id, scan_id, provider, kind, severity, evidence, meta, created_at')
          .eq('scan_id', scanId)
          .eq('provider', 'telegram')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[useTelegramFindings] Error loading findings:', error);
        }
        setFindings(data || []);
      } catch (err) {
        console.error('[useTelegramFindings] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [scanId]);

  // Lazy-load a specific artifact type from scan_artifacts
  const loadArtifact = useCallback(async (artifactType: string) => {
    if (!scanId || artifacts[artifactType] !== undefined || artifactLoading[artifactType]) return;

    setArtifactLoading(prev => ({ ...prev, [artifactType]: true }));
    try {
      const { data, error } = await supabase
        .from('scan_artifacts')
        .select('id, artifact_type, data, created_at')
        .eq('scan_id', scanId)
        .eq('source', 'telegram')
        .eq('artifact_type', artifactType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(`[useTelegramFindings] Error loading artifact ${artifactType}:`, error);
        setArtifacts(prev => ({ ...prev, [artifactType]: null }));
      } else {
        setArtifacts(prev => ({ ...prev, [artifactType]: data }));
      }
    } catch (err) {
      console.error(`[useTelegramFindings] Unexpected error loading artifact:`, err);
      setArtifacts(prev => ({ ...prev, [artifactType]: null }));
    } finally {
      setArtifactLoading(prev => ({ ...prev, [artifactType]: false }));
    }
  }, [scanId, artifacts, artifactLoading]);

  return {
    findings,
    artifacts,
    loading,
    artifactLoading,
    loadArtifact,
    hasTelegramData: findings.length > 0,
  };
}
