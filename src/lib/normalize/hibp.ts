import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface HibpBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  LogoPath: string;
}

export function normalizeHibp(breaches: HibpBreach[], email: string): Finding[] {
  return breaches
    .filter((b) => !b.IsFabricated && !b.IsSpamList && !b.IsRetired)
    .map((breach) => {
      const severity = breach.IsSensitive
        ? "critical"
        : breach.PwnCount > 10_000_000
        ? "high"
        : "medium";

      return {
        id: generateFindingId("hibp", "breach", breach.Name),
        type: "breach" as const,
        title: `Breach: ${breach.Title}`,
        description: `Your email ${email} was found in the ${breach.Title} data breach on ${breach.BreachDate}. ${breach.PwnCount.toLocaleString()} accounts were affected.`,
        severity: severity as any,
        confidence: breach.IsVerified ? 0.95 : 0.8,
        provider: "Have I Been Pwned",
        providerCategory: "Breach Detection",
        evidence: [
          { key: "Breach Name", value: breach.Name },
          { key: "Breach Date", value: breach.BreachDate },
          { key: "Affected Accounts", value: breach.PwnCount.toLocaleString() },
          { key: "Data Types Exposed", value: breach.DataClasses.join(", ") },
          { key: "Verified", value: breach.IsVerified },
        ],
        impact: `${breach.DataClasses.length} types of personal data exposed including: ${breach.DataClasses.slice(0, 3).join(", ")}${breach.DataClasses.length > 3 ? "..." : ""}`,
        remediation: [
          `Change your password for ${breach.Domain || "this service"} immediately`,
          "Enable two-factor authentication if available",
          "Check if any other accounts use the same password and update them",
          "Monitor your accounts for suspicious activity",
          "Consider using a password manager to generate unique passwords",
        ],
        tags: ["breach", "email", "password", ...breach.DataClasses.map((c) => c.toLowerCase())],
        observedAt: new Date().toISOString(),
        url: breach.LogoPath ? `https://haveibeenpwned.com/API/v3/breach/${breach.Name}` : undefined,
        raw: breach,
      };
    });
}
