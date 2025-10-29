import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeHunter } from "@/lib/normalize/hunter";
import { Finding } from "@/lib/ufm";
import { validateDomain } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkHunter(domain: string): Promise<Finding[]> {
  try {
    const validated = validateDomain(domain);
    return await wrapCall("hunter", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'hunter', target: validated }
      });

      if (error) throw new Error(`Hunter proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from Hunter');

      return normalizeHunter(data, validated);
    }, { ttlMs: 30 * 24 * 3600e3 });
  } catch (error) {
    console.error("[hunter] Error:", error);
    return [createSyntheticFinding("hunter", (error as Error).message, "low")];
  }
}
