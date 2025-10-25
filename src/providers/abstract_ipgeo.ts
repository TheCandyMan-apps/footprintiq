import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeAbstractIPGeo } from "@/lib/normalize/abstract_ipgeo";
import { Finding } from "@/lib/ufm";
import { validateIP } from "./validation";

const API_KEY = import.meta.env.VITE_ABSTRACTAPI_IP_GEOLOCATION_KEY;
const BASE_URL = "https://ipgeolocation.abstractapi.com/v1";

export async function checkAbstractIPGeo(ip: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("abstract_ipgeo", "missing_key")];
  }

  try {
    const validated = validateIP(ip);
    return await wrapCall("abstract_ipgeo", async () => {
      const response = await fetch(`${BASE_URL}/?api_key=${API_KEY}&ip_address=${validated}`, {
        headers: {
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`AbstractAPI IPGeo error: ${response.status}`);

      const data = await response.json();
      return normalizeAbstractIPGeo(data, validated);
    }, { ttlMs: 30 * 24 * 3600e3 });
  } catch (error) {
    console.error("[abstract_ipgeo] Error:", error);
    return [createSyntheticFinding("abstract_ipgeo", (error as Error).message, "low")];
  }
}
