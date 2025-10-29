import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeAbstractCompany } from "@/lib/normalize/abstract_company";
import { Finding } from "@/lib/ufm";
import { validateDomain } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkAbstractCompany(domain: string): Promise<Finding[]> {
  try {
    const validated = validateDomain(domain);
    return await wrapCall("abstract_company", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'abstract_company', target: validated }
      });

      if (error) throw new Error(`Abstract Company proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from company enrichment');

      return normalizeAbstractCompany(data, validated);
    }, { ttlMs: 30 * 24 * 3600e3 });
  } catch (error) {
    console.error("[abstract_company] Error:", error);
    return [createSyntheticFinding("abstract_company", (error as Error).message, "low")];
  }
}
