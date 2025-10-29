import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeGoogleCSE } from "@/lib/normalize/googlecse";
import { Finding } from "@/lib/ufm";
import { validateQuery } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkGoogleCSE(query: string): Promise<Finding[]> {
  try {
    const validated = validateQuery(query);
    return await wrapCall("googlecse", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'googlecse', target: validated }
      });

      if (error) throw new Error(`Google CSE proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from Google CSE');

      return normalizeGoogleCSE(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[googlecse] Error:", error);
    return [createSyntheticFinding("googlecse", (error as Error).message, "low")];
  }
}
