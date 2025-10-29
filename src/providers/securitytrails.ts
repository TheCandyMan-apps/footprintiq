import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeSecurityTrails } from "@/lib/normalize/securitytrails_v2";
import { Finding } from "@/lib/ufm";
import { validateDomain } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkSecurityTrails(domain: string): Promise<Finding[]> {
  try {
    const validated = validateDomain(domain);
    return await wrapCall("securitytrails", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'securitytrails', target: validated }
      });

      if (error) throw new Error(`SecurityTrails proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from SecurityTrails');

      return normalizeSecurityTrails(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[securitytrails] Error:", error);
    return [createSyntheticFinding("securitytrails", (error as Error).message, "low")];
  }
}
