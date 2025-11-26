/**
 * Shared AI Usage Logging Utility
 * Logs all AI model usage to ai_logs table for analytics
 */

interface AILogParams {
  userId?: string;
  workspaceId?: string;
  model: string;
  promptLength: number;
  responseLength?: number;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Log AI usage to ai_logs table
 * Fails gracefully - logging errors won't break the main flow
 */
export async function logAIUsage(
  supabase: any,
  params: AILogParams
): Promise<void> {
  try {
    const { error } = await supabase.from('ai_logs').insert({
      user_id: params.userId || null,
      workspace_id: params.workspaceId || null,
      model: params.model,
      prompt_length: params.promptLength,
      response_length: params.responseLength || null,
      success: params.success ?? true,
      error_message: params.errorMessage || null,
    });

    if (error) {
      console.error('[aiLogger] Failed to log AI usage:', error);
    }
  } catch (error) {
    // Don't throw - logging failure shouldn't break the main flow
    console.error('[aiLogger] Exception logging AI usage:', error);
  }
}
