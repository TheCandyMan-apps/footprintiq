import { Finding } from "./ufm";

export interface RiskChip {
  label: string;
  severity: "critical" | "high" | "medium" | "low";
  count: number;
}

export const mapFindingsToRiskChips = (findings: Finding[]): RiskChip[] => {
  const riskMap = new Map<string, RiskChip>();

  findings.forEach((finding) => {
    let label: string;
    let severity = finding.severity as "critical" | "high" | "medium" | "low";

    switch (finding.type) {
      case "breach":
        label = "Credential Exposure";
        break;
      case "ip_exposure":
        // Check for critical ports
        const criticalPorts = finding.evidence.find(e => 
          e.key.toLowerCase().includes('port') && 
          [23, 3389, 445, 21, 22].includes(Number(e.value))
        );
        label = criticalPorts ? "Critical Port Exposed" : "IP Exposure";
        break;
      case "domain_reputation":
        label = "Domain Reputation Issue";
        break;
      case "phone_intelligence":
        label = "Phone Data Exposure";
        break;
      case "identity":
        label = "Personal Info Disclosure";
        break;
      case "social_media":
        label = "Social Media Presence";
        severity = "low"; // Override to low for social
        break;
      default:
        label = "Information Disclosure";
    }

    const existing = riskMap.get(label);
    if (existing) {
      existing.count++;
      // Keep highest severity
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (severityOrder[severity] > severityOrder[existing.severity]) {
        existing.severity = severity;
      }
    } else {
      riskMap.set(label, { label, severity, count: 1 });
    }
  });

  return Array.from(riskMap.values()).sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
};

export const getRiskDescription = (chip: RiskChip): string => {
  const descriptions: Record<string, string> = {
    "Credential Exposure": "Your credentials have been found in data breaches",
    "Critical Port Exposed": "Dangerous network ports are publicly accessible",
    "IP Exposure": "Your IP address and services are visible to scanners",
    "Domain Reputation Issue": "Your domain may be flagged by security services",
    "Phone Data Exposure": "Your phone number appears in public databases",
    "Personal Info Disclosure": "Personal information is publicly available",
    "Social Media Presence": "Public social media profiles detected",
    "Information Disclosure": "Various information exposures detected",
  };

  return descriptions[chip.label] || "Security issue detected";
};
