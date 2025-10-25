import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeGoogleCSE } from "@/lib/normalize/googlecse";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const BASE_URL = "https://www.googleapis.com/customsearch/v1";

export async function checkGoogleCSE(query: string): Promise<Finding[]> {
  if (!API_KEY || !SEARCH_ENGINE_ID) {
    return [createSyntheticFinding("googlecse", "missing_key")];
  }

  try {
    return await wrapCall("googlecse", async () => {
      const response = await fetch(
        `${BASE_URL}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`,
        {
          headers: {
            "User-Agent": "FootprintIQ",
          },
        }
      );

      if (!response.ok) throw new Error(`Google CSE API error: ${response.status}`);

      const data = await response.json();
      return normalizeGoogleCSE(data, query);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[googlecse] Error:", error);
    return [createSyntheticFinding("googlecse", (error as Error).message, "low")];
  }
}
