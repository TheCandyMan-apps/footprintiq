/**
 * PII redaction utilities for role-based access control
 */

export function redactEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.***';
  const [domainName, tld] = domain.split('.');
  return `${local[0]}***@${domainName[0]}***.${tld}`;
}

export function redactPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***-***-****';
  return `***-***-${digits.slice(-4)}`;
}

export function redactName(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return `${name[0]}***`;
  return parts.map((p, i) => i === 0 ? p : `${p[0]}***`).join(' ');
}

export function redactUsername(username: string): string {
  if (username.length <= 3) return '***';
  return `${username.slice(0, 2)}***${username.slice(-1)}`;
}

export function redactIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length !== 4) return '***.***.***.***';
  return `${parts[0]}.***.***.${parts[3]}`;
}

export function shouldRedact(role: string | null): boolean {
  return role === 'viewer';
}

export function redactPII(text: string, role: string | null): string {
  if (!shouldRedact(role)) return text;

  // Email pattern
  let redacted = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (match) =>
    redactEmail(match)
  );

  // Phone pattern
  redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, (match) =>
    redactPhone(match)
  );

  // IP pattern
  redacted = redacted.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, (match) =>
    redactIP(match)
  );

  return redacted;
}

export function redactEntityName(entity: string, role: string | null): string {
  if (!shouldRedact(role)) return entity;

  // Check if email
  if (entity.includes('@')) return redactEmail(entity);

  // Check if phone
  if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(entity)) return redactPhone(entity);

  // Check if IP
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(entity)) return redactIP(entity);

  // Default to username redaction
  return redactUsername(entity);
}

// Alias for compatibility
export function redactValue(value: string, type: string): string {
  return redactEntityName(value, 'viewer');
}

// Redact findings array
export function redactFindings(findings: any[], redact: boolean): any[] {
  if (!redact) return findings;
  
  return findings.map(finding => ({
    ...finding,
    evidence: finding.evidence?.map((e: any) => ({
      ...e,
      value: typeof e.value === 'string' ? redactPII(e.value, 'viewer') : e.value,
    })),
  }));
}
