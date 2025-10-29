import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeAbuseIPDB } from "@/lib/normalize/abuseipdb";
import { Finding } from "@/lib/ufm";
import { validateIP } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkAbuseIPDB(ip: string): Promise<Finding[]> {
  try {
    const validated = validateIP(ip);
    return await wrapCall("abuseipdb", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'abuseipdb', target: validated }
      });

      if (error) throw new Error(`AbuseIPDB proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from AbuseIPDB');

      return normalizeAbuseIPDB(data, validated);
    }, { ttlMs: 12 * 3600e3 });
  } catch (error) {
    console.error("[abuseipdb] Error:", error);
    return [createSyntheticFinding("abuseipdb", (error as Error).message, "low")];
  }
}
