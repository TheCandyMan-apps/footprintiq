import type { Finding } from "./ufm";

/**
 * Demo mode - generates mock findings for marketing and testing
 * No API keys or real scans required
 */

export function generateDemoFindings(type: "email" | "domain" | "ip" | "phone" | "comprehensive"): Finding[] {
  const baseDate = new Date().toISOString();

  const demoFindings: Record<string, Finding[]> = {
    email: [
      {
        id: "demo_hibp_breach_1",
        type: "breach",
        title: "Breach: Adobe (2013)",
        description: "Your email was found in the Adobe data breach from October 2013. 152,445,165 accounts were affected.",
        severity: "high",
        confidence: 0.95,
        provider: "Have I Been Pwned",
        providerCategory: "Breach Detection",
        evidence: [
          { key: "Breach Name", value: "Adobe" },
          { key: "Breach Date", value: "2013-10-04" },
          { key: "Affected Accounts", value: "152,445,165" },
          { key: "Data Types Exposed", value: "Email addresses, Password hints, Passwords, Usernames" },
        ],
        impact: "4 types of personal data exposed including passwords",
        remediation: [
          "Change your password for Adobe immediately",
          "Enable two-factor authentication if available",
          "Check if any other accounts use the same password",
        ],
        tags: ["breach", "email", "password"],
        observedAt: baseDate,
      },
      {
        id: "demo_pdl_identity_1",
        type: "identity",
        title: "5 Personal Data Points Found",
        description: "Extensive personal information is available in people-search databases.",
        severity: "medium",
        confidence: 0.7,
        provider: "People Data Labs",
        providerCategory: "Identity Enrichment",
        evidence: [
          { key: "Full Name", value: "John Doe" },
          { key: "Location", value: "San Francisco, CA" },
          { key: "Job Title", value: "Software Engineer" },
          { key: "Company", value: "Tech Corp" },
          { key: "LinkedIn Profile", value: "https://linkedin.com/in/johndoe" },
        ],
        impact: "Personal and professional information can be used for social engineering",
        remediation: [
          "Submit opt-out requests to people-search sites",
          "Review privacy settings on professional networks",
          "Use FootprintIQ's automated data removal service",
        ],
        tags: ["identity", "pii", "people_search"],
        observedAt: baseDate,
      },
    ],
    domain: [
      {
        id: "demo_vt_reputation_1",
        type: "domain_reputation",
        title: "Domain Flagged by 3 Security Vendors",
        description: "Your domain has been flagged as suspicious by 3 out of 89 security vendors.",
        severity: "medium",
        confidence: 0.8,
        provider: "VirusTotal",
        providerCategory: "Domain Reputation",
        evidence: [
          { key: "Domain", value: "example.com" },
          { key: "Detections", value: "3/89" },
          { key: "Detection Rate", value: "3.4%" },
        ],
        impact: "Potential security concerns detected",
        remediation: [
          "Scan website for malware",
          "Review third-party scripts",
          "Submit false positive report if needed",
        ],
        tags: ["domain", "reputation", "security"],
        observedAt: baseDate,
      },
      {
        id: "demo_builtwith_tech_1",
        type: "domain_tech",
        title: "2 Potentially Outdated Technologies Detected",
        description: "Your website uses technologies that may be vulnerable if not updated.",
        severity: "medium",
        confidence: 0.75,
        provider: "BuiltWith",
        providerCategory: "Technology Profiling",
        evidence: [
          { key: "CMS", value: "WordPress v5.8" },
          { key: "JavaScript Library", value: "jQuery v3.5.1" },
        ],
        impact: "Outdated technologies may expose site to attacks",
        remediation: [
          "Update all software to latest versions",
          "Enable automatic security updates",
          "Remove unused plugins",
        ],
        tags: ["domain", "technology", "vulnerability"],
        observedAt: baseDate,
      },
    ],
    ip: [
      {
        id: "demo_shodan_port_1",
        type: "ip_exposure",
        title: "Open Port 22/TCP on 192.168.1.1",
        description: "SSH is exposed on port 22. This service is commonly targeted by brute-force attacks.",
        severity: "medium",
        confidence: 0.9,
        provider: "Shodan",
        providerCategory: "IP Intelligence",
        evidence: [
          { key: "IP Address", value: "192.168.1.1" },
          { key: "Port", value: 22 },
          { key: "Protocol", value: "TCP" },
          { key: "Service", value: "OpenSSH" },
        ],
        impact: "Exposed SSH service may be vulnerable to attacks",
        remediation: [
          "Use key-based authentication",
          "Disable root login",
          "Implement fail2ban",
        ],
        tags: ["ip", "port", "exposure", "ssh"],
        observedAt: baseDate,
      },
    ],
    phone: [
      {
        id: "demo_ipqs_phone_1",
        type: "phone_intelligence",
        title: "Phone Number Security Risk Detected",
        description: "+1-555-0123 has been leaked in data breaches.",
        severity: "high",
        confidence: 0.75,
        provider: "IPQualityScore",
        providerCategory: "Phone Intelligence",
        evidence: [
          { key: "Phone Number", value: "+1-555-0123" },
          { key: "Carrier", value: "Verizon" },
          { key: "Leaked in Database", value: true },
          { key: "Fraud Score", value: "68/100" },
        ],
        impact: "Phone number exposed and may be targeted",
        remediation: [
          "Change phone number if possible",
          "Enable carrier PIN protection",
          "Be alert for SIM-swapping attacks",
        ],
        tags: ["phone", "fraud", "leak"],
        observedAt: baseDate,
      },
    ],
    comprehensive: [],
  };

  // Comprehensive includes all types
  demoFindings.comprehensive = [
    ...demoFindings.email,
    ...demoFindings.domain,
    ...demoFindings.ip,
    ...demoFindings.phone,
  ];

  return demoFindings[type] || [];
}
