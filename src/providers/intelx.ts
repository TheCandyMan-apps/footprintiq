import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeIntelX } from "@/lib/normalize/intelx";
import { Finding } from "@/lib/ufm";
import { ensureAllowed } from "./policy";
import { validateQuery } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkIntelX(query: string): Promise<Finding[]> {
  // Check policy first
  const policyCheck = await ensureAllowed("intelx", "darkweb");
  if (!policyCheck.allowed) {
    return [createSyntheticFinding("intelx", policyCheck.reason || "gated_by_policy")];
  }

  try {
    const validated = validateQuery(query);
    return await wrapCall("intelx", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'intelx', target: validated }
      });

      if (error) throw new Error(`IntelX proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from IntelX');

      return normalizeIntelX(data, validated);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[intelx] Error:", error);
    return [createSyntheticFinding("intelx", (error as Error).message, "low")];
  }
}
