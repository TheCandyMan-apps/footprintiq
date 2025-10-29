import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeOTX } from "@/lib/normalize/otx";
import { Finding } from "@/lib/ufm";
import { validateDomain, validateIP } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkOTX(target: string, type: "domain" | "ip"): Promise<Finding[]> {
  try {
    const validated = type === "domain" ? validateDomain(target) : validateIP(target);
    return await wrapCall("otx", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'otx', target: validated, type }
      });

      if (error) throw new Error(`OTX proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from OTX');

      return normalizeOTX(data, validated);
    }, { ttlMs: 12 * 3600e3 });
  } catch (error) {
    console.error("[otx] Error:", error);
    return [createSyntheticFinding("otx", (error as Error).message, "low")];
  }
}
