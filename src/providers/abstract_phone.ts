import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeAbstractPhone } from "@/lib/normalize/abstract_phone";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_ABSTRACTAPI_PHONE_VALIDATION_KEY;
const BASE_URL = "https://phonevalidation.abstractapi.com/v1";

export async function checkAbstractPhone(phone: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("abstract_phone", "missing_key")];
  }

  try {
    return await wrapCall("abstract_phone", async () => {
      const response = await fetch(`${BASE_URL}/?api_key=${API_KEY}&phone=${encodeURIComponent(phone)}`, {
        headers: {
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`AbstractAPI Phone error: ${response.status}`);

      const data = await response.json();
      return normalizeAbstractPhone(data, phone);
    }, { ttlMs: 30 * 24 * 3600e3 });
  } catch (error) {
    console.error("[abstract_phone] Error:", error);
    return [createSyntheticFinding("abstract_phone", (error as Error).message, "low")];
  }
}
