import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeFullHunt } from "@/lib/normalize/fullhunt";
import { Finding } from "@/lib/ufm";
import { validateDomain } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkFullHunt(domain: string): Promise<Finding[]> {
  try {
    const validated = validateDomain(domain);
    return await wrapCall("fullhunt", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'fullhunt', target: validated }
      });

      if (error) throw new Error(`FullHunt proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from FullHunt');

      return normalizeFullHunt(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[fullhunt] Error:", error);
    return [createSyntheticFinding("fullhunt", (error as Error).message, "low")];
  }
}
