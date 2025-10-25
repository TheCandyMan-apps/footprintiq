import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeVirusTotalV3 } from "@/lib/normalize/virustotal_v3";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_VT_API_KEY;
const BASE_URL = "https://www.virustotal.com/api/v3";

export async function checkVirusTotal(target: string, type: "domain" | "ip"): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("virustotal", "missing_key")];
  }

  try {
    return await wrapCall("virustotal", async () => {
      const endpoint = type === "domain" ? "domains" : "ip_addresses";
      const response = await fetch(`${BASE_URL}/${endpoint}/${target}`, {
        headers: {
          "x-apikey": API_KEY,
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`VirusTotal API error: ${response.status}`);

      const data = await response.json();
      return normalizeVirusTotalV3(data, target);
    }, { ttlMs: 12 * 3600e3 });
  } catch (error) {
    console.error("[virustotal] Error:", error);
    return [createSyntheticFinding("virustotal", (error as Error).message, "low")];
  }
}
