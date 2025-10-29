import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeHibp, type HibpBreach } from "@/lib/normalize/hibp";
import { Finding } from "@/lib/ufm";
import { supabase } from "@/integrations/supabase/client";

export async function checkHIBP(email: string): Promise<Finding[]> {
  try {
    return await wrapCall("hibp", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'hibp', target: email }
      });

      if (error) throw new Error(`HIBP proxy error: ${error.message}`);
      if (!data) return [];

      return normalizeHibp(data as HibpBreach[], email);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[hibp] Error:", error);
    return [createSyntheticFinding("hibp", (error as Error).message, "low")];
  }
}
