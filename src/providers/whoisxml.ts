import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeWHOISXML } from "@/lib/normalize/whoisxml";
import { Finding } from "@/lib/ufm";
import { validateDomain } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkWHOISXML(domain: string): Promise<Finding[]> {
  try {
    const validated = validateDomain(domain);
    return await wrapCall("whoisxml", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'whoisxml', target: validated }
      });

      if (error) throw new Error(`WHOISXML proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from WHOISXML');

      return normalizeWHOISXML(data, validated);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[whoisxml] Error:", error);
    return [createSyntheticFinding("whoisxml", (error as Error).message, "low")];
  }
}
