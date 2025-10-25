import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeFullHunt } from "@/lib/normalize/fullhunt";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_FULLHUNT_API_KEY;
const BASE_URL = "https://fullhunt.io/api/v1";

export async function checkFullHunt(domain: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("fullhunt", "missing_key")];
  }

  try {
    return await wrapCall("fullhunt", async () => {
      const response = await fetch(`${BASE_URL}/domain/${domain}/subdomains`, {
        headers: {
          "X-API-KEY": API_KEY,
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`FullHunt API error: ${response.status}`);

      const data = await response.json();
      return normalizeFullHunt(data, domain);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[fullhunt] Error:", error);
    return [createSyntheticFinding("fullhunt", (error as Error).message, "low")];
  }
}
