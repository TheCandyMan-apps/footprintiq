import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

export async function logAudit(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string | null,
  action: string,
  meta: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase.from('audit_activity').insert({
      workspace_id: workspaceId,
      user_id: userId,
      action,
      meta,
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
