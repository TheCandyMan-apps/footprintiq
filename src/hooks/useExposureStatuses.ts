/**
 * Hook for managing exposure resolution statuses.
 * Handles CRUD operations and score recalculation.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ExposureStatus = 'active' | 'resolved' | 'in_progress' | 'ignored';

export interface ExposureStatusRecord {
  id: string;
  user_id: string;
  scan_id: string | null;
  finding_id: string;
  platform_name: string;
  status: ExposureStatus;
  previous_status: string | null;
  score_before: number | null;
  score_after: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExposureStatusHistoryRecord {
  id: string;
  user_id: string;
  finding_id: string;
  platform_name: string;
  old_status: string | null;
  new_status: string;
  score_change: number | null;
  created_at: string;
}

export function useExposureStatuses(scanId?: string) {
  const [statuses, setStatuses] = useState<Record<string, ExposureStatusRecord>>({});
  const [history, setHistory] = useState<ExposureStatusHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load statuses for the current user
  const loadStatuses = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('exposure_statuses')
        .select('*')
        .eq('user_id', user.id);

      if (scanId) {
        query = query.eq('scan_id', scanId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const map: Record<string, ExposureStatusRecord> = {};
      (data || []).forEach((s: any) => {
        map[s.finding_id] = s as ExposureStatusRecord;
      });
      setStatuses(map);
    } catch (err) {
      console.error('Failed to load exposure statuses:', err);
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  // Load resolution history (Pro feature)
  const loadHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('exposure_status_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory((data || []) as ExposureStatusHistoryRecord[]);
    } catch (err) {
      console.error('Failed to load status history:', err);
    }
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  // Update exposure status
  const updateStatus = useCallback(async (
    findingId: string,
    platformName: string,
    newStatus: ExposureStatus,
    scoreBefore?: number,
    scoreAfter?: number,
    notes?: string,
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Sign in required', variant: 'destructive' });
        return null;
      }

      const existing = statuses[findingId];
      const previousStatus = existing?.status || 'active';

      // Upsert status
      const { data, error } = await supabase
        .from('exposure_statuses')
        .upsert({
          user_id: user.id,
          scan_id: scanId || null,
          finding_id: findingId,
          platform_name: platformName,
          status: newStatus,
          previous_status: previousStatus,
          score_before: scoreBefore ?? null,
          score_after: scoreAfter ?? null,
          notes: notes || null,
        }, { onConflict: 'user_id,finding_id' })
        .select()
        .single();

      if (error) throw error;

      // Insert history record
      const scoreChange = (scoreAfter != null && scoreBefore != null)
        ? scoreAfter - scoreBefore
        : null;

      await supabase
        .from('exposure_status_history')
        .insert({
          user_id: user.id,
          finding_id: findingId,
          platform_name: platformName,
          old_status: previousStatus,
          new_status: newStatus,
          score_change: scoreChange,
        });

      // Update local state
      setStatuses(prev => ({
        ...prev,
        [findingId]: data as ExposureStatusRecord,
      }));

      const statusLabels: Record<string, string> = {
        resolved: 'Resolved',
        in_progress: 'In Progress',
        ignored: 'Ignored',
        active: 'Active',
      };

      toast({
        title: `Marked as ${statusLabels[newStatus]}`,
        description: scoreChange && scoreChange > 0
          ? `Exposure Reduced +${scoreChange} points`
          : `${platformName} status updated`,
      });

      return data as ExposureStatusRecord;
    } catch (err: any) {
      console.error('Failed to update exposure status:', err);
      toast({ title: 'Failed to update status', description: err.message, variant: 'destructive' });
      return null;
    }
  }, [statuses, scanId, toast]);

  const getStatus = useCallback((findingId: string): ExposureStatus => {
    return statuses[findingId]?.status as ExposureStatus || 'active';
  }, [statuses]);

  const getResolvedCount = useCallback(() => {
    return Object.values(statuses).filter(s => s.status === 'resolved').length;
  }, [statuses]);

  const getScoreImprovement = useCallback(() => {
    const resolved = Object.values(statuses).filter(s => s.status === 'resolved');
    if (resolved.length === 0) return 0;
    return resolved.reduce((sum, s) => {
      if (s.score_after != null && s.score_before != null) {
        return sum + (s.score_after - s.score_before);
      }
      return sum;
    }, 0);
  }, [statuses]);

  return {
    statuses,
    history,
    loading,
    updateStatus,
    getStatus,
    getResolvedCount,
    getScoreImprovement,
    loadHistory,
    reload: loadStatuses,
  };
}
