import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeURLScan } from "@/lib/normalize/urlscan";
import { Finding } from "@/lib/ufm";
import { validateQuery } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkURLScan(query: string): Promise<Finding[]> {
  try {
    const validated = validateQuery(query);
    return await wrapCall("urlscan", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'urlscan', target: validated }
      });

      if (error) throw new Error(`URLScan proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from URLScan');

      return normalizeURLScan(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[urlscan] Error:", error);
    return [createSyntheticFinding("urlscan", (error as Error).message, "low")];
  }
}
