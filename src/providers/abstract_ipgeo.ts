import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeAbstractIPGeo } from "@/lib/normalize/abstract_ipgeo";
import { Finding } from "@/lib/ufm";
import { validateIP } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkAbstractIPGeo(ip: string): Promise<Finding[]> {
  try {
    const validated = validateIP(ip);
    return await wrapCall("abstract_ipgeo", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'abstract_ipgeo', target: validated }
      });

      if (error) throw new Error(`Abstract IPGeo proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from IP geolocation');

      return normalizeAbstractIPGeo(data, validated);
    }, { ttlMs: 30 * 24 * 3600e3 });
  } catch (error) {
    console.error("[abstract_ipgeo] Error:", error);
    return [createSyntheticFinding("abstract_ipgeo", (error as Error).message, "low")];
  }
}
