import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export type SovereigntyStatus = 'draft' | 'submitted' | 'acknowledged' | 'processing' | 'completed' | 'rejected' | 'expired';
export type Jurisdiction = 'gdpr' | 'ccpa' | 'uk_sds';
export type RequestType = 'erasure' | 'rectification' | 'access';

export interface SovereigntyRequest {
  id: string;
  user_id: string;
  workspace_id: string;
  target_entity: string;
  target_url: string | null;
  jurisdiction: Jurisdiction;
  request_type: RequestType;
  status: SovereigntyStatus;
  submitted_at: string | null;
  deadline_at: string | null;
  acknowledged_at: string | null;
  completed_at: string | null;
  evidence_url: string | null;
  template_data: Record<string, any>;
  notes: string | null;
  scan_id: string | null;
  finding_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SovereigntyScore {
  id: string;
  overall_score: number;
  factors: Record<string, any>;
  exposure_count: number;
  removals_completed: number;
  removals_pending: number;
  calculated_at: string;
}

export interface CreateRequestInput {
  target_entity: string;
  target_url?: string;
  jurisdiction: Jurisdiction;
  request_type: RequestType;
  notes?: string;
  scan_id?: string;
  finding_id?: string;
}

// Legal deadline days by jurisdiction
const DEADLINE_DAYS: Record<Jurisdiction, number> = {
  gdpr: 30,
  ccpa: 45,
  uk_sds: 30,
};

export function useSovereignty() {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['sovereignty-requests', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('sovereignty_requests')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SovereigntyRequest[];
    },
    enabled: !!workspace?.id,
  });

  const { data: latestScore } = useQuery({
    queryKey: ['sovereignty-score', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return null;
      const { data, error } = await supabase
        .from('sovereignty_scores')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SovereigntyScore | null;
    },
    enabled: !!workspace?.id,
  });

  const createRequest = useMutation({
    mutationFn: async (input: CreateRequestInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !workspace?.id) throw new Error('Not authenticated');

      const submittedAt = new Date().toISOString();
      const deadlineDays = DEADLINE_DAYS[input.jurisdiction];
      const deadlineAt = new Date(Date.now() + deadlineDays * 86400000).toISOString();

      const { data, error } = await supabase
        .from('sovereignty_requests')
        .insert({
          user_id: user.id,
          workspace_id: workspace.id,
          target_entity: input.target_entity,
          target_url: input.target_url || null,
          jurisdiction: input.jurisdiction,
          request_type: input.request_type,
          status: 'submitted',
          submitted_at: submittedAt,
          deadline_at: deadlineAt,
          notes: input.notes || null,
          scan_id: input.scan_id || null,
          finding_id: input.finding_id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sovereignty-requests'] });
      toast.success('Erasure request created');
    },
    onError: (err: Error) => {
      toast.error(`Failed to create request: ${err.message}`);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, evidence_url }: { id: string; status: SovereigntyStatus; evidence_url?: string }) => {
      const updates: Record<string, any> = { status };
      if (status === 'acknowledged') updates.acknowledged_at = new Date().toISOString();
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        if (evidence_url) updates.evidence_url = evidence_url;
      }

      const { error } = await supabase
        .from('sovereignty_requests')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sovereignty-requests'] });
      toast.success('Request status updated');
    },
  });

  // Computed stats
  const stats = {
    total: requests.length,
    active: requests.filter(r => ['submitted', 'acknowledged', 'processing'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    pending: requests.filter(r => r.status === 'submitted').length,
    overdue: requests.filter(r => {
      if (!r.deadline_at || r.status === 'completed' || r.status === 'rejected') return false;
      return new Date(r.deadline_at) < new Date();
    }).length,
    successRate: requests.length > 0
      ? Math.round((requests.filter(r => r.status === 'completed').length / requests.length) * 100)
      : 0,
  };

  // Calculate sovereignty score from current data
  const calculatedScore = Math.min(100, Math.max(0,
    50 + (stats.completed * 5) - (stats.overdue * 10) - (stats.rejected * 3) + (stats.successRate > 50 ? 20 : 0)
  ));

  return {
    requests,
    requestsLoading,
    latestScore,
    stats,
    calculatedScore,
    createRequest,
    updateStatus,
  };
}
