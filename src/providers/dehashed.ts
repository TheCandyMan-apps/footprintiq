import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeDeHashed } from "@/lib/normalize/dehashed";
import { Finding } from "@/lib/ufm";
import { ensureAllowed } from "./policy";
import { validateQuery } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkDeHashed(query: string): Promise<Finding[]> {
  // Check policy first
  const policyCheck = await ensureAllowed("dehashed", "darkweb");
  if (!policyCheck.allowed) {
    return [createSyntheticFinding("dehashed", policyCheck.reason || "gated_by_policy")];
  }

  try {
    const validated = validateQuery(query);
    return await wrapCall("dehashed", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'dehashed', target: validated }
      });

      if (error) throw new Error(`DeHashed proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from DeHashed');

      return normalizeDeHashed(data, validated);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[dehashed] Error:", error);
    return [createSyntheticFinding("dehashed", (error as Error).message, "low")];
  }
}
