import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeApify } from "@/lib/normalize/apify";
import { Finding } from "@/lib/ufm";
import { validateUsername } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkApify(username: string, platform: string): Promise<Finding[]> {
  try {
    const validated = validateUsername(username);
    return await wrapCall("apify", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'apify', target: validated, options: { platform } }
      });

      if (error) throw new Error(`Apify proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from Apify');

      return normalizeApify(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[apify] Error:", error);
    return [createSyntheticFinding("apify", (error as Error).message, "low")];
  }
}
