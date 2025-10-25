import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeApify } from "@/lib/normalize/apify";
import { Finding } from "@/lib/ufm";

const API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN;
const BASE_URL = "https://api.apify.com/v2";

export async function checkApify(username: string, platform: string): Promise<Finding[]> {
  if (!API_TOKEN) {
    return [createSyntheticFinding("apify", "missing_key")];
  }

  try {
    return await wrapCall("apify", async () => {
      // This is a simplified example - actual Apify actor calls vary by actor
      const actorId = import.meta.env.VITE_APIFY_USERNAME_ACTOR || "apify/web-scraper";
      
      const response = await fetch(`${BASE_URL}/acts/${actorId}/runs?token=${API_TOKEN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "FootprintIQ",
        },
        body: JSON.stringify({
          username,
          platform,
        }),
      });

      if (!response.ok) throw new Error(`Apify API error: ${response.status}`);

      const data = await response.json();
      return normalizeApify(data, username);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[apify] Error:", error);
    return [createSyntheticFinding("apify", (error as Error).message, "low")];
  }
}
