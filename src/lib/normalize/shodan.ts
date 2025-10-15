import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface ShodanResult {
  ip_str: string;
  port: number;
  transport: string;
  product?: string;
  version?: string;
  org?: string;
  isp?: string;
  asn?: string;
  location?: {
    country_name?: string;
    city?: string;
  };
  vulns?: string[];
  tags?: string[];
  timestamp: string;
}

const CRITICAL_PORTS = [21, 23, 445, 3389, 5432, 3306, 27017, 6379];
const HIGH_RISK_PORTS = [22, 25, 80, 443, 8080, 8443];

export function normalizeShodan(results: ShodanResult[], ip: string): Finding[] {
  return results.map((result) => {
    const isCritical = CRITICAL_PORTS.includes(result.port);
    const isHighRisk = HIGH_RISK_PORTS.includes(result.port);
    const hasVulns = result.vulns && result.vulns.length > 0;

    let severity: "critical" | "high" | "medium" = "medium";
    if (hasVulns) severity = "critical";
    else if (isCritical) severity = "high";
    else if (isHighRisk) severity = "medium";

    const portDescription = getPortDescription(result.port);

    return {
      id: generateFindingId("shodan", "ip_exposure", `${result.ip_str}_${result.port}`),
      type: "ip_exposure" as const,
      title: `Open Port ${result.port}/${result.transport.toUpperCase()} on ${result.ip_str}`,
      description: `${portDescription.service} is exposed on port ${result.port}. ${portDescription.risk}`,
      severity,
      confidence: 0.9,
      provider: "Shodan",
      providerCategory: "IP Intelligence",
      evidence: [
        { key: "IP Address", value: result.ip_str },
        { key: "Port", value: result.port },
        { key: "Protocol", value: result.transport.toUpperCase() },
        { key: "Service", value: result.product || "Unknown" },
        { key: "Version", value: result.version || "Unknown" },
        { key: "Organization", value: result.org || "Unknown" },
        { key: "ISP", value: result.isp || "Unknown" },
        { key: "Location", value: result.location ? `${result.location.city || ""}, ${result.location.country_name || ""}`.trim() : "Unknown" },
        ...(hasVulns ? [{ key: "Vulnerabilities", value: result.vulns!.join(", ") }] : []),
      ],
      impact: hasVulns
        ? `${result.vulns!.length} known vulnerabilities detected. Immediate action required.`
        : `Exposed ${portDescription.service.toLowerCase()} service may be vulnerable to attacks.`,
      remediation: portDescription.remediation,
      tags: ["ip", "port", "exposure", result.transport, ...(hasVulns ? ["vulnerable"] : [])],
      observedAt: result.timestamp || new Date().toISOString(),
      raw: result,
    };
  });
}

function getPortDescription(port: number): { service: string; risk: string; remediation: string[] } {
  const descriptions: Record<number, { service: string; risk: string; remediation: string[] }> = {
    21: {
      service: "FTP",
      risk: "FTP transmits credentials in plain text and is highly vulnerable to attacks.",
      remediation: [
        "Close port 21 and disable FTP service",
        "Use SFTP (port 22) or FTPS instead",
        "Enable firewall rules to block external FTP access",
        "If FTP is required, use strong authentication and IP whitelisting",
      ],
    },
    22: {
      service: "SSH",
      risk: "SSH is commonly targeted by brute-force attacks.",
      remediation: [
        "Use key-based authentication instead of passwords",
        "Disable root login via SSH",
        "Change the default SSH port if possible",
        "Implement fail2ban or similar intrusion prevention",
        "Restrict SSH access to known IP addresses",
      ],
    },
    23: {
      service: "Telnet",
      risk: "Telnet is extremely insecure and transmits all data in plain text.",
      remediation: [
        "Close port 23 and disable Telnet service immediately",
        "Use SSH (port 22) instead for remote access",
        "Update router/device firmware to disable Telnet",
        "Enable firewall rules to block Telnet access",
      ],
    },
    3389: {
      service: "RDP (Remote Desktop)",
      risk: "RDP is a frequent target for ransomware and brute-force attacks.",
      remediation: [
        "Close port 3389 or restrict access via VPN",
        "Enable Network Level Authentication (NLA)",
        "Use strong passwords and account lockout policies",
        "Keep Windows and RDP client updated",
        "Monitor RDP logs for suspicious login attempts",
      ],
    },
    445: {
      service: "SMB (Windows File Sharing)",
      risk: "SMB vulnerabilities have been exploited by major ransomware (e.g., WannaCry).",
      remediation: [
        "Close port 445 to the internet immediately",
        "Disable SMBv1 protocol",
        "Apply latest Windows security patches",
        "Use VPN for remote file access",
        "Enable firewall rules to block external SMB access",
      ],
    },
  };

  return (
    descriptions[port] || {
      service: `Port ${port}`,
      risk: "This service is exposed to the internet and may be vulnerable.",
      remediation: [
        "Verify if this port needs to be publicly accessible",
        "Close the port or restrict access via firewall",
        "Keep service software updated",
        "Monitor logs for suspicious activity",
      ],
    }
  );
}
