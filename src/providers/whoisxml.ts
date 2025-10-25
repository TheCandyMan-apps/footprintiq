import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeWHOISXML } from "@/lib/normalize/whoisxml";
import { Finding } from "@/lib/ufm";
import { validateDomain } from "./validation";

const API_KEY = import.meta.env.VITE_WHOISXML_API_KEY;
const BASE_URL = "https://www.whoisxmlapi.com/whoisserver/WhoisService";

export async function checkWHOISXML(domain: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("whoisxml", "missing_key")];
  }

  try {
    const validated = validateDomain(domain);
    return await wrapCall("whoisxml", async () => {
      const response = await fetch(
        `${BASE_URL}?apiKey=${API_KEY}&domainName=${validated}&outputFormat=JSON`,
        {
          headers: {
            "User-Agent": "FootprintIQ",
          },
        }
      );

      if (!response.ok) throw new Error(`WHOISXML API error: ${response.status}`);

      const data = await response.json();
      return normalizeWHOISXML(data, validated);
    }, { ttlMs: 7 * 24 * 3600e3 });
  } catch (error) {
    console.error("[whoisxml] Error:", error);
    return [createSyntheticFinding("whoisxml", (error as Error).message, "low")];
  }
}
