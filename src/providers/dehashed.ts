import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeDeHashed } from "@/lib/normalize/dehashed";
import { Finding } from "@/lib/ufm";
import { ensureAllowed } from "./policy";

const API_KEY = import.meta.env.VITE_DEHASHED_API_KEY;
const USERNAME = import.meta.env.VITE_DEHASHED_API_KEY_USERNAME;
const BASE_URL = "https://api.dehashed.com/search";

export async function checkDeHashed(query: string): Promise<Finding[]> {
  // Check policy first
  const policyCheck = await ensureAllowed("dehashed", "darkweb");
  if (!policyCheck.allowed) {
    return [createSyntheticFinding("dehashed", policyCheck.reason || "gated_by_policy")];
  }

  if (!API_KEY || !USERNAME) {
    return [createSyntheticFinding("dehashed", "missing_key")];
  }

  try {
    return await wrapCall("dehashed", async () => {
      const auth = btoa(`${USERNAME}:${API_KEY}`);
      const response = await fetch(`${BASE_URL}?query=${encodeURIComponent(query)}`, {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Accept": "application/json",
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`DeHashed API error: ${response.status}`);

      const data = await response.json();
      return normalizeDeHashed(data, query);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[dehashed] Error:", error);
    return [createSyntheticFinding("dehashed", (error as Error).message, "low")];
  }
}
