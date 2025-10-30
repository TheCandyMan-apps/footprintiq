/**
 * Client-side provider API wrapper
 * Routes all provider calls through secure Edge Functions
 * Never exposes API keys to the browser
 */

import { supabase } from "@/integrations/supabase/client";

export interface Finding {
  provider: string;
  kind: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  observedAt: string;
  latencyMs?: number;
  reason?: string;
  evidence?: Array<{ key: string; value: string }>;
}

export interface ProviderResponse {
  findings: Finding[];
}

/**
 * Execute a provider scan through the secure Edge Function proxy
 * 
 * @param providerId - Provider identifier (e.g., 'hibp', 'intelx', 'dehashed')
 * @param payload - Provider-specific payload (target, options, etc.)
 * @returns Normalized UFM findings
 * 
 * @example
 * ```ts
 * const result = await runProvider('hibp', { target: 'user@example.com' });
 * console.log(result.findings);
 * ```
 */
export async function runProvider(
  providerId: string,
  payload: any
): Promise<ProviderResponse> {
  const { data, error } = await supabase.functions.invoke(
    `providers/${providerId}`,
    {
      body: payload,
    }
  );

  if (error) {
    console.error(`Provider ${providerId} error:`, error);
    throw new Error(`${providerId}_error: ${error.message}`);
  }

  return data as ProviderResponse;
}

/**
 * Run multiple providers in parallel
 * Useful for comprehensive scans across multiple data sources
 * 
 * @param providers - Array of [providerId, payload] tuples
 * @returns Array of results (or errors for failed providers)
 */
export async function runProviders(
  providers: Array<[string, any]>
): Promise<Array<ProviderResponse | Error>> {
  const promises = providers.map(async ([id, payload]) => {
    try {
      return await runProvider(id, payload);
    } catch (err) {
      return err as Error;
    }
  });

  return Promise.all(promises);
}
