/**
 * Credits management utilities
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

interface CreditsResult {
  success: boolean;
  balance?: number;
  error?: string;
  required?: number;
}

/**
 * Check if workspace has sufficient credits
 */
export async function checkCredits(
  workspaceId: string,
  required: number
): Promise<CreditsResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase
    .rpc('get_credits_balance', { _workspace_id: workspaceId });

  if (error) {
    console.error('[credits] Error checking balance:', error);
    return { success: false, error: 'failed_to_check_balance' };
  }

  const balance = data || 0;

  if (balance < required) {
    return {
      success: false,
      error: 'insufficient_credits',
      balance,
      required
    };
  }

  return { success: true, balance };
}

/**
 * Deduct credits from workspace
 */
export async function deductCredits(
  workspaceId: string,
  amount: number,
  description: string
): Promise<CreditsResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase
    .rpc('spend_credits', {
      _workspace_id: workspaceId,
      _amount: amount,
      _description: description
    });

  if (error) {
    console.error('[credits] Error deducting credits:', error);
    return { success: false, error: error.message };
  }

  if (!data.success) {
    return {
      success: false,
      error: data.error,
      balance: data.current_balance,
      required: data.required
    };
  }

  // Check for low balance alert (fire and forget)
  supabase.functions.invoke('check-low-balance', {
    body: { workspaceId }
  }).catch(err => console.warn('[credits] Failed to check low balance:', err));

  return {
    success: true,
    balance: data.new_balance
  };
}

/**
 * Add credits to workspace
 */
export async function addCredits(
  workspaceId: string,
  amount: number,
  description: string,
  transactionType: string = 'purchase'
): Promise<CreditsResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase
    .rpc('add_credits', {
      _workspace_id: workspaceId,
      _amount: amount,
      _description: description,
      _transaction_type: transactionType
    });

  if (error) {
    console.error('[credits] Error adding credits:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    balance: data.new_balance
  };
}

/**
 * Get credits balance
 */
export async function getBalance(workspaceId: string): Promise<number> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase
    .rpc('get_credits_balance', { _workspace_id: workspaceId });

  if (error) {
    console.error('[credits] Error getting balance:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Credit costs by scan type
 */
export const CREDIT_COSTS = {
  basic: 1,
  advanced: 5,
  darkweb: 10,
  dating: 3,
  nsfw: 3,
  deep_web: 15
};
