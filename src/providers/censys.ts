import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeCensys } from "@/lib/normalize/censys";
import { Finding } from "@/lib/ufm";
import { validateDomain, validateIP } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkCensys(target: string, type: "domain" | "ip"): Promise<Finding[]> {
  try {
    const validated = type === "domain" ? validateDomain(target) : validateIP(target);
    return await wrapCall("censys", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'censys', target: validated, type }
      });

      if (error) throw new Error(`Censys proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from Censys');

      return normalizeCensys(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[censys] Error:", error);
    return [createSyntheticFinding("censys", (error as Error).message, "low")];
  }
}
