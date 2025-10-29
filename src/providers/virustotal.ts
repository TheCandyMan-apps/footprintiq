import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeVirusTotalV3 } from "@/lib/normalize/virustotal_v3";
import { Finding } from "@/lib/ufm";
import { validateDomain, validateIP } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkVirusTotal(target: string, type: "domain" | "ip"): Promise<Finding[]> {
  try {
    const validated = type === "domain" ? validateDomain(target) : validateIP(target);
    return await wrapCall("virustotal", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'virustotal', target: validated, type }
      });

      if (error) throw new Error(`VirusTotal proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from VirusTotal');

      return normalizeVirusTotalV3(data, validated);
    }, { ttlMs: 12 * 3600e3 });
  } catch (error) {
    console.error("[virustotal] Error:", error);
    return [createSyntheticFinding("virustotal", (error as Error).message, "low")];
  }
}
