/**
 * Spamhaus Input Validation
 * Strict validation for IP addresses and domains
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface IpValidationResult extends ValidationResult {
  version?: 4 | 6;
}

/**
 * Validate IPv4 address
 */
function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

/**
 * Validate IPv6 address (full and compressed forms)
 */
function isValidIPv6(ip: string): boolean {
  // Full IPv6 regex supporting all valid formats including compressed
  const ipv6Regex = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|::(?:[fF]{4}:)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/;
  return ipv6Regex.test(ip);
}

/**
 * Check if IP is in private/reserved range (should not be queried)
 */
function isPrivateIP(ip: string): boolean {
  if (isValidIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.0/8 (loopback)
    if (parts[0] === 127) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 169.254.0.0/16 (link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
  }
  
  if (isValidIPv6(ip)) {
    const lower = ip.toLowerCase();
    // Loopback
    if (lower === '::1') return true;
    // Link-local
    if (lower.startsWith('fe80:')) return true;
    // Unique local (fc00::/7)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  }
  
  return false;
}

/**
 * Validate IP address (IPv4 or IPv6)
 */
export function validateIp(ip: string): IpValidationResult {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, error: 'IP address is required' };
  }
  
  const trimmed = ip.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'IP address cannot be empty' };
  }
  
  if (trimmed.length > 45) { // Max IPv6 length
    return { valid: false, error: 'IP address too long' };
  }
  
  if (isValidIPv4(trimmed)) {
    if (isPrivateIP(trimmed)) {
      return { valid: false, error: 'Private/reserved IP addresses cannot be queried' };
    }
    return { valid: true, version: 4 };
  }
  
  if (isValidIPv6(trimmed)) {
    if (isPrivateIP(trimmed)) {
      return { valid: false, error: 'Private/reserved IP addresses cannot be queried' };
    }
    return { valid: true, version: 6 };
  }
  
  return { valid: false, error: 'Invalid IP address format' };
}

/**
 * Validate domain name
 */
export function validateDomain(domain: string): ValidationResult {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Domain is required' };
  }
  
  const trimmed = domain.trim().toLowerCase();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Domain cannot be empty' };
  }
  
  if (trimmed.length > 253) {
    return { valid: false, error: 'Domain name too long (max 253 characters)' };
  }
  
  // Remove trailing dot if present
  const normalized = trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
  
  // Check each label
  const labels = normalized.split('.');
  
  if (labels.length < 2) {
    return { valid: false, error: 'Domain must have at least two parts (e.g., example.com)' };
  }
  
  for (const label of labels) {
    if (label.length === 0) {
      return { valid: false, error: 'Domain contains empty label' };
    }
    
    if (label.length > 63) {
      return { valid: false, error: 'Domain label too long (max 63 characters)' };
    }
    
    // Labels must start with alphanumeric
    if (!/^[a-z0-9]/i.test(label)) {
      return { valid: false, error: 'Domain labels must start with a letter or number' };
    }
    
    // Labels must end with alphanumeric
    if (!/[a-z0-9]$/i.test(label)) {
      return { valid: false, error: 'Domain labels must end with a letter or number' };
    }
    
    // Labels can only contain alphanumeric and hyphens
    if (!/^[a-z0-9-]+$/i.test(label)) {
      return { valid: false, error: 'Domain labels can only contain letters, numbers, and hyphens' };
    }
  }
  
  // TLD must be at least 2 characters
  const tld = labels[labels.length - 1];
  if (tld.length < 2) {
    return { valid: false, error: 'Invalid top-level domain' };
  }
  
  // TLD should not be all numbers
  if (/^\d+$/.test(tld)) {
    return { valid: false, error: 'Top-level domain cannot be numeric' };
  }
  
  return { valid: true };
}

/**
 * Normalize domain for consistent caching
 */
export function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/\.+$/, '');
}

/**
 * Normalize IP for consistent caching
 */
export function normalizeIp(ip: string): string {
  return ip.trim().toLowerCase();
}

/**
 * Validate input based on type
 */
export function validateInput(
  inputType: 'ip' | 'domain',
  inputValue: string
): ValidationResult {
  if (inputType === 'ip') {
    return validateIp(inputValue);
  }
  if (inputType === 'domain') {
    return validateDomain(inputValue);
  }
  return { valid: false, error: `Unknown input type: ${inputType}` };
}
