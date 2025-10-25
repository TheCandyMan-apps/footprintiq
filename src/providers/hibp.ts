import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeHibp, type HibpBreach } from "@/lib/normalize/hibp";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_HIBP_API_KEY;
const BASE_URL = "https://haveibeenpwned.com/api/v3";

export async function checkHIBP(email: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("hibp", "missing_key")];
  }

  try {
    return await wrapCall("hibp", async () => {
      const response = await fetch(`${BASE_URL}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
        headers: {
          "hibp-api-key": API_KEY,
          "User-Agent": "FootprintIQ",
        },
      });

      if (response.status === 404) return [];
      if (!response.ok) throw new Error(`HIBP API error: ${response.status}`);

      const breaches: HibpBreach[] = await response.json();
      return normalizeHibp(breaches, email);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[hibp] Error:", error);
    return [createSyntheticFinding("hibp", (error as Error).message, "low")];
  }
}
