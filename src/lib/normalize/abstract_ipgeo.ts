import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface AbstractIPGeoResult {
  ip_address: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  timezone?: {
    name: string;
    abbreviation: string;
  };
  connection?: {
    isp: string;
    organization: string;
  };
}

export function normalizeAbstractIPGeo(result: AbstractIPGeoResult, ip: string): Finding[] {
  const findings: Finding[] = [];
  
  findings.push({
    id: generateFindingId("abstract_ipgeo", "ip_geolocation", ip),
    type: "ip_exposure" as const,
    title: `IP Location: ${result.city || "Unknown"}, ${result.country || "Unknown"}`,
    description: `AbstractAPI geolocated ${ip} to ${result.city || "Unknown"}, ${result.region || ""} ${
      result.country || "Unknown"
    }.`,
    severity: "info" as any,
    confidence: 0.8,
    provider: "AbstractAPI IP Geo",
    providerCategory: "IP Intelligence",
    evidence: [
      { key: "City", value: result.city || "Unknown" },
      { key: "Region", value: result.region || "Unknown" },
      { key: "Country", value: result.country || "Unknown" },
      { key: "ISP", value: result.connection?.isp || "Unknown" },
      { key: "Timezone", value: result.timezone?.name || "Unknown" },
    ],
    impact: "Geographic location may reveal physical infrastructure location",
    remediation: [],
    tags: ["ip", "geolocation"],
    observedAt: new Date().toISOString(),
    raw: result,
  });
  
  return findings;
}
