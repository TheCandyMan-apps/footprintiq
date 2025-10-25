import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeHunter } from "@/lib/normalize/hunter";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_HUNTER_IO_KEY;
const BASE_URL = "https://api.hunter.io/v2";

export async function checkHunter(domain: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("hunter", "missing_key")];
  }

  try {
    return await wrapCall("hunter", async () => {
      const response = await fetch(`${BASE_URL}/domain-search?domain=${domain}&api_key=${API_KEY}`, {
        headers: {
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`Hunter API error: ${response.status}`);

      const data = await response.json();
      return normalizeHunter(data, domain);
    }, { ttlMs: 30 * 24 * 3600e3 });
  } catch (error) {
    console.error("[hunter] Error:", error);
    return [createSyntheticFinding("hunter", (error as Error).message, "low")];
  }
}
