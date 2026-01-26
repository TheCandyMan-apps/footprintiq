/**
 * PII masking utilities for plan-gated content
 * Applied only for Free users; Pro sees raw evidence
 */

/**
 * Masks an email address for Free users
 * @example maskEmail("john.doe@gmail.com") => "j***.d**@g***.com"
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '***@***.***';
  
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return '***@***.***';
  
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf('.');
  
  if (dotIndex === -1) return `${maskPart(local)}@***.***`;
  
  const domainName = domain.slice(0, dotIndex);
  const tld = domain.slice(dotIndex + 1);
  
  return `${maskPart(local)}@${maskPart(domainName)}.${tld}`;
}

/**
 * Masks a phone number for Free users
 * @example maskPhone("+447700900123") => "+44 **** *** 123"
 * @example maskPhone("07700 900123") => "**** *** 123"
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '*** *** ****';
  
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '*** *** ****';
  
  // Keep country code if present (starts with +)
  const hasCountryCode = phone.startsWith('+');
  const lastFour = digits.slice(-4);
  
  if (hasCountryCode && digits.length > 10) {
    // International format: keep country code + last 4
    const countryCode = digits.slice(0, digits.length - 10);
    return `+${countryCode} **** *** ${lastFour}`;
  }
  
  // Standard format: mask all but last 4
  return `**** *** ${lastFour}`;
}

/**
 * Masks a username for Free users
 * @example maskUsername("johndoe123") => "jo***23"
 */
export function maskUsername(username: string): string {
  if (!username || typeof username !== 'string') return '***';
  if (username.length <= 4) return '***';
  
  const start = username.slice(0, 2);
  const end = username.slice(-2);
  return `${start}***${end}`;
}

/**
 * Masks a name for Free users
 * @example maskName("John Doe") => "J*** D**"
 */
export function maskName(name: string): string {
  if (!name || typeof name !== 'string') return '***';
  
  const parts = name.trim().split(/\s+/);
  return parts.map(part => {
    if (part.length <= 1) return part;
    return `${part[0]}${'*'.repeat(Math.min(part.length - 1, 3))}`;
  }).join(' ');
}

/**
 * Masks an IP address for Free users
 * @example maskIP("192.168.1.100") => "192.***.***100"
 */
export function maskIP(ip: string): string {
  if (!ip || typeof ip !== 'string') return '***.***.***.***';
  
  const parts = ip.split('.');
  if (parts.length !== 4) return '***.***.***.***';
  
  return `${parts[0]}.***.***.${parts[3]}`;
}

/**
 * Masks a URL path while keeping the domain visible
 * Example: maskUrl("https://twitter.com/johndoe/status/123") returns "https://twitter.com/jo.../..."
 */
export function maskUrl(url: string): string {
  if (!url || typeof url !== 'string') return '***';
  
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    
    if (pathParts.length === 0) return url;
    
    const maskedPath = pathParts.length > 1 
      ? `/${maskPart(pathParts[0])}/...`
      : `/${maskPart(pathParts[0])}`;
    
    return `${parsed.origin}${maskedPath}`;
  } catch {
    return '***';
  }
}

/**
 * Auto-detect and mask any PII in a string
 */
export function maskEvidence(evidence: string): string {
  if (!evidence || typeof evidence !== 'string') return '***';
  
  let masked = evidence;
  
  // Mask emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  masked = masked.replace(emailRegex, (match) => maskEmail(match));
  
  // Mask phone numbers
  const phoneRegex = /\+?\d[\d\s().]{7,}\d/g;
  masked = masked.replace(phoneRegex, (match) => maskPhone(match));
  
  // Mask IP addresses
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  masked = masked.replace(ipRegex, (match) => maskIP(match));
  
  return masked;
}

/**
 * Helper: mask part of a string keeping first char
 */
function maskPart(str: string): string {
  if (!str || str.length === 0) return '***';
  if (str.length === 1) return str;
  if (str.length <= 3) return `${str[0]}**`;
  return `${str[0]}${'*'.repeat(Math.min(str.length - 1, 3))}`;
}

/**
 * Apply masking based on user's plan
 */
export function applyMasking(value: string, type: 'email' | 'phone' | 'username' | 'name' | 'ip' | 'url' | 'auto', shouldMask: boolean): string {
  if (!shouldMask) return value;
  
  switch (type) {
    case 'email': return maskEmail(value);
    case 'phone': return maskPhone(value);
    case 'username': return maskUsername(value);
    case 'name': return maskName(value);
    case 'ip': return maskIP(value);
    case 'url': return maskUrl(value);
    case 'auto': return maskEvidence(value);
    default: return value;
  }
}
