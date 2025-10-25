import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeURLScan } from "@/lib/normalize/urlscan";
import { Finding } from "@/lib/ufm";
import { validateQuery } from "./validation";

const API_KEY = import.meta.env.VITE_URLSCAN_API_KEY;
const BASE_URL = "https://urlscan.io/api/v1";

export async function checkURLScan(query: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("urlscan", "missing_key")];
  }

  try {
    const validated = validateQuery(query);
    return await wrapCall("urlscan", async () => {
      const response = await fetch(`${BASE_URL}/search/?q=${encodeURIComponent(validated)}`, {
        headers: {
          "API-Key": API_KEY,
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`URLScan API error: ${response.status}`);

      const data = await response.json();
      return normalizeURLScan(data, validated);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[urlscan] Error:", error);
    return [createSyntheticFinding("urlscan", (error as Error).message, "low")];
  }
}
