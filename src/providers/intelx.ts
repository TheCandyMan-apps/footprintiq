import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeIntelX } from "@/lib/normalize/intelx";
import { Finding } from "@/lib/ufm";
import { ensureAllowed } from "./policy";

const API_KEY = import.meta.env.VITE_INTELX_API_KEY;
const BASE_URL = "https://2.intelx.io";

export async function checkIntelX(query: string): Promise<Finding[]> {
  // Check policy first
  const policyCheck = await ensureAllowed("intelx", "darkweb");
  if (!policyCheck.allowed) {
    return [createSyntheticFinding("intelx", policyCheck.reason || "gated_by_policy")];
  }

  if (!API_KEY) {
    return [createSyntheticFinding("intelx", "missing_key")];
  }

  try {
    return await wrapCall("intelx", async () => {
      const response = await fetch(`${BASE_URL}/intelligent/search`, {
        method: "POST",
        headers: {
          "x-key": API_KEY,
          "Content-Type": "application/json",
          "User-Agent": "FootprintIQ",
        },
        body: JSON.stringify({
          term: query,
          maxresults: 100,
          media: 0,
          sort: 4,
        }),
      });

      if (!response.ok) throw new Error(`IntelX API error: ${response.status}`);

      const data = await response.json();
      return normalizeIntelX(data, query);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[intelx] Error:", error);
    return [createSyntheticFinding("intelx", (error as Error).message, "low")];
  }
}
