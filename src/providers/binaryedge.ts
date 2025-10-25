import { wrapCall, createSyntheticFinding } from "./runtime";
import { normalizeBinaryEdge } from "@/lib/normalize/binaryedge";
import { Finding } from "@/lib/ufm";

const API_KEY = import.meta.env.VITE_BINARYEDGE_API_KEY;
const BASE_URL = "https://api.binaryedge.io/v2";

export async function checkBinaryEdge(ip: string): Promise<Finding[]> {
  if (!API_KEY) {
    return [createSyntheticFinding("binaryedge", "missing_key")];
  }

  try {
    return await wrapCall("binaryedge", async () => {
      const response = await fetch(`${BASE_URL}/query/ip/${ip}`, {
        headers: {
          "X-Key": API_KEY,
          "User-Agent": "FootprintIQ",
        },
      });

      if (!response.ok) throw new Error(`BinaryEdge API error: ${response.status}`);

      const data = await response.json();
      return normalizeBinaryEdge(data, ip);
    }, { ttlMs: 24 * 3600e3 });
  } catch (error) {
    console.error("[binaryedge] Error:", error);
    return [createSyntheticFinding("binaryedge", (error as Error).message, "low")];
  }
}
