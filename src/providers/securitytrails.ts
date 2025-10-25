import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeSecurityTrails } from "@/lib/normalize/securitytrails_v2";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_SECURITYTRAILS_API_KEY;
const BASE_URL = "https://api.securitytrails.com/v1";

export async function checkSecurityTrails(domain: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("securitytrails", "missing_key")];
  }

  try {
    return await wrapCall("securitytrails", async () => {
      const response = await fetch(`${BASE_URL}/domain/${domain}/subdomains`, {
        headers: {
          "APIKEY": API_KEY,
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`SecurityTrails API error: ${response.status}`);

      const data = await response.json();
      return normalizeSecurityTrails(data, domain);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[securitytrails] Error:", error);
    return [createSyntheticFinding("securitytrails", (error as Error).message, "low")];
  }
}
