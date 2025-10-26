import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeAbstractPhone } from "@/lib/normalize/abstract_phone";
import { Finding } from "@/lib/ufm";
import { validatePhone } from "./validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkAbstractPhone(phone: string): Promise<Finding[]> {
  try {
    const validated = validatePhone(phone);
    return await wrapCall("abstract_phone", async () => {
      const { data, error } = await supabase.functions.invoke('abstract-phone', {
        body: { phone: validated }
      });

      if (error) throw new Error(`Abstract Phone error: ${error.message}`);
      if (!data) throw new Error('No data returned from phone validation');

      return normalizeAbstractPhone(data, validated);
    }, { ttlMs: 30 * 24 * 3600e3 });
  } catch (error) {
    console.error("[abstract_phone] Error:", error);
    return [createSyntheticFinding("abstract_phone", (error as Error).message, "low")];
  }
}
