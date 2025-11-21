import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

interface ActivityLogParams {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Centralized activity logging utility for edge functions
 * Logs user actions to activity_logs table for audit trails
 */
export async function logActivity(params: ActivityLogParams): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase.from('activity_logs').insert({
      user_id: params.userId,
      action: params.action,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      organization_id: params.organizationId || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      metadata: params.metadata || null,
    });

    if (error) {
      console.error('[activityLogger] Failed to log activity:', error);
    }
  } catch (error) {
    // Fail silently to not break main operations
    console.error('[activityLogger] Exception logging activity:', error);
  }
}
