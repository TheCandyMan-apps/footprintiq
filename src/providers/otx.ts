import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeOTX } from "@/lib/normalize/otx";
import { Finding } from "@/lib/ufm";
import { validateDomain, validateIP } from "./validation";

const API_KEY = import.meta.env.VITE_ALIENVAULT_API_KEY;
const BASE_URL = "https://otx.alienvault.com/api/v1";

export async function checkOTX(target: string, type: "domain" | "ip"): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("otx", "missing_key")];
  }

  try {
    const validated = type === "domain" ? validateDomain(target) : validateIP(target);
    return await wrapCall("otx", async () => {
      const endpoint = type === "domain" ? "indicators/domain" : "indicators/IPv4";
      const response = await fetch(`${BASE_URL}/${endpoint}/${validated}/general`, {
        headers: {
          "X-OTX-API-KEY": API_KEY,
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`OTX API error: ${response.status}`);

      const data = await response.json();
      return normalizeOTX(data, validated);
    }, { ttlMs: 12 * 3600e3 });
  } catch (error) {
    console.error("[otx] Error:", error);
    return [createSyntheticFinding("otx", (error as Error).message, "low")];
  }
}
