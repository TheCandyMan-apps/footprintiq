import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export async function logAudit(
  workspaceId: string,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('audit_logs' as any).insert({
      workspace_id: workspaceId,
      user_id: user?.id,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      metadata: entry.metadata || {},
    });
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
}

export const AuditActions = {
  // Workspace actions
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  WORKSPACE_DELETED: 'workspace.deleted',
  
  // Member actions
  MEMBER_INVITED: 'member.invited',
  MEMBER_ADDED: 'member.added',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  
  // API Key actions
  API_KEY_CREATED: 'api_key.created',
  API_KEY_REVOKED: 'api_key.revoked',
  API_KEY_USED: 'api_key.used',
  
  // Scan actions
  SCAN_CREATED: 'scan.created',
  SCAN_COMPLETED: 'scan.completed',
  SCAN_DELETED: 'scan.deleted',
  
  // Monitor actions
  MONITOR_CREATED: 'monitor.created',
  MONITOR_PAUSED: 'monitor.paused',
  MONITOR_RESUMED: 'monitor.resumed',
  MONITOR_DELETED: 'monitor.deleted',
  
  // Case actions
  CASE_CREATED: 'case.created',
  CASE_UPDATED: 'case.updated',
  CASE_CLOSED: 'case.closed',
  CASE_EVIDENCE_ADDED: 'case.evidence_added',
  
  // Billing actions
  SUBSCRIPTION_UPGRADED: 'subscription.upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription.downgraded',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
} as const;
