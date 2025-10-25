import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeCensys } from "@/lib/normalize/censys";
import { Finding } from "@/lib/ufm";
import { validateDomain, validateIP } from "./validation";

const API_KEY_UID = import.meta.env.VITE_CENSYS_API_KEY_UID;
const API_KEY_SECRET = import.meta.env.VITE_CENSYS_API_KEY_SECRET;
const BASE_URL = "https://search.censys.io/api/v2";

export async function checkCensys(target: string, type: "domain" | "ip"): Promise<Finding[]> {
  if (!API_KEY_UID || !API_KEY_SECRET) {
    return [createSyntheticFinding("censys", "missing_key")];
  }

  try {
    // Validate input
    const validated = type === "domain" ? validateDomain(target) : validateIP(target);
    return await wrapCall("censys", async () => {
      const auth = btoa(`${API_KEY_UID}:${API_KEY_SECRET}`);
      const endpoint = type === "domain" ? "hosts/search" : "hosts/search";
      const query = type === "domain" ? `services.dns.names: "${validated}"` : `ip: "${validated}"`;
      
      const response = await fetch(`${BASE_URL}/${endpoint}?q=${encodeURIComponent(query)}`, {
        headers: {
          "Authorization": `Basic ${auth}`,
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`Censys API error: ${response.status}`);

      const data = await response.json();
      return normalizeCensys(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[censys] Error:", error);
    return [createSyntheticFinding("censys", (error as Error).message, "low")];
  }
}
