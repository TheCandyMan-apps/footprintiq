import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeAbstractCompany } from "@/lib/normalize/abstract_company";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_ABSTRACTAPI_COMPANY_ENRICHMENT_KEY;
const BASE_URL = "https://companyenrichment.abstractapi.com/v1";

export async function checkAbstractCompany(domain: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("abstract_company", "missing_key")];
  }

  try {
    return await wrapCall("abstract_company", async () => {
      const response = await fetch(`${BASE_URL}/?api_key=${API_KEY}&domain=${domain}`, {
        headers: {
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`AbstractAPI Company error: ${response.status}`);

      const data = await response.json();
      return normalizeAbstractCompany(data, domain);
    }, { ttlMs: 30 * 24 * 3600e3 });
  } catch (error) {
    console.error("[abstract_company] Error:", error);
    return [createSyntheticFinding("abstract_company", (error as Error).message, "low")];
  }
}
