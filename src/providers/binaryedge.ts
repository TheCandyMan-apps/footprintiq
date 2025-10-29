import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeBinaryEdge } from "@/lib/normalize/binaryedge";
import { Finding } from "@/lib/ufm";
import { validateIP } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkBinaryEdge(ip: string): Promise<Finding[]> {
  try {
    const validated = validateIP(ip);
    return await wrapCall("binaryedge", async () => {
      const { data, error } = await supabase.functions.invoke('provider-proxy', {
        body: { provider: 'binaryedge', target: validated }
      });

      if (error) throw new Error(`BinaryEdge proxy error: ${error.message}`);
      if (!data) throw new Error('No data returned from BinaryEdge');

      return normalizeBinaryEdge(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[binaryedge] Error:", error);
    return [createSyntheticFinding("binaryedge", (error as Error).message, "low")];
  }
}
