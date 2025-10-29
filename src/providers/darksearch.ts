import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeDarkSearch } from "@/lib/normalize/darksearch";
import { Finding } from "@/lib/ufm";
import { ensureAllowed } from "./policy";
import { validateQuery } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkDarkSearch(query: string): Promise<Finding[]> {
  // Check policy first
  const policyCheck = await ensureAllowed("darksearch", "darkweb");
  if (!policyCheck.allowed) {
    return [createSyntheticFinding("darksearch", policyCheck.reason || "gated_by_policy")];
  }

  try {
    const validated = validateQuery(query);
    return await wrapCall("darksearch", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'darksearch', target: validated }
      });

      if (error) throw new Error(`DarkSearch proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from DarkSearch');

      return normalizeDarkSearch(data, validated);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[darksearch] Error:", error);
    return [createSyntheticFinding("darksearch", (error as Error).message, "low")];
  }
}
