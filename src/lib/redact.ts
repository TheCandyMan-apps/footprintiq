/**
 * PII Redaction utilities
 * Masks sensitive information in findings and exports
 */

export function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***";
  const maskedLocal = local.length > 2 ? local.substring(0, 2) + "***" : "***";
  const [domainName, tld] = domain.split(".");
  const maskedDomain = domainName.length > 2 ? domainName.substring(0, 2) + "***" : "***";
  return `${maskedLocal}@${maskedDomain}.${tld}`;
}

export function redactPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) return "***-***-****";
  const lastFour = digits.slice(-4);
  return `***-***-${lastFour}`;
}

export function redactIP(ip: string): string {
  const parts = ip.split(".");
  if (parts.length !== 4) return "***.***.***.***";
  return `${parts[0]}.${parts[1]}.***.***`;
}

export function redactName(name: string): string {
  const parts = name.split(" ");
  if (parts.length === 1) {
    return name.length > 2 ? name.substring(0, 2) + "***" : "***";
  }
  return parts.map((p, i) => (i === 0 ? p : p.charAt(0) + "***")).join(" ");
}

export function redactValue(value: unknown, key?: string): unknown {
  if (typeof value !== "string") return value;

  const lowerKey = key?.toLowerCase() || "";

  // Email
  if (lowerKey.includes("email") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return redactEmail(value);
  }

  // Phone
  if (lowerKey.includes("phone") || /^\+?\d[\d\s\-\(\)]{7,}$/.test(value)) {
    return redactPhone(value);
  }

  // IP
  if (lowerKey.includes("ip") || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
    return redactIP(value);
  }

  // Name
  if (lowerKey.includes("name") && !lowerKey.includes("username") && !lowerKey.includes("domain")) {
    return redactName(value);
  }

  return value;
}

export function redactFindings<T>(findings: T[], enabled: boolean): T[] {
  if (!enabled) return findings;

  return findings.map((finding: any) => {
    const redacted = { ...finding };

    // Redact evidence
    if (redacted.evidence && Array.isArray(redacted.evidence)) {
      redacted.evidence = redacted.evidence.map((e: any) => ({
        ...e,
        value: redactValue(e.value, e.key),
      }));
    }

    // Redact description
    if (redacted.description) {
      const emailMatch = redacted.description.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      if (emailMatch) {
        redacted.description = redacted.description.replace(emailMatch[0], redactEmail(emailMatch[0]));
      }
    }

    return redacted;
  });
}
