import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeAbuseIPDB } from "@/lib/normalize/abuseipdb";
import { Finding } from "@/lib/ufm";
import { validateIP } from "./validation";

const API_KEY = import.meta.env.VITE_ABUSEIPDB_API_KEY;
const BASE_URL = "https://api.abuseipdb.com/api/v2";

export async function checkAbuseIPDB(ip: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("abuseipdb", "missing_key")];
  }

  try {
    const validated = validateIP(ip);
    return await wrapCall("abuseipdb", async () => {
      const response = await fetch(`${BASE_URL}/check?ipAddress=${validated}&maxAgeInDays=90&verbose`, {
        headers: {
          "Key": API_KEY,
          "Accept": "application/json",
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`AbuseIPDB API error: ${response.status}`);

      const data = await response.json();
      return normalizeAbuseIPDB(data, validated);
    }, { ttlMs: 12 * 3600e3 });
  } catch (error) {
    console.error("[abuseipdb] Error:", error);
    return [createSyntheticFinding("abuseipdb", (error as Error).message, "low")];
  }
}
