import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeDarkSearch } from "@/lib/normalize/darksearch";
import { Finding } from "@/lib/ufm";
import { ensureAllowed } from "./policy";
import { validateQuery } from "./validation";

const API_KEY = import.meta.env.VITE_DARKSEARCH_API_KEY;
const BASE_URL = "https://darksearch.io/api";

export async function checkDarkSearch(query: string): Promise<Finding[]> {
  // Check policy first
  const policyCheck = await ensureAllowed("darksearch", "darkweb");
  if (!policyCheck.allowed) {
    return [createSyntheticFinding("darksearch", policyCheck.reason || "gated_by_policy")];
  }

  if (!API_KEY) {
    return [createSyntheticFinding("darksearch", "missing_key")];
  }

  try {
    const validated = validateQuery(query);
    return await wrapCall("darksearch", async () => {
      const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(validated)}`, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`DarkSearch API error: ${response.status}`);

      const data = await response.json();
      return normalizeDarkSearch(data, validated);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[darksearch] Error:", error);
    return [createSyntheticFinding("darksearch", (error as Error).message, "low")];
  }
}
