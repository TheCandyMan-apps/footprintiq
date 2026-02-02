/**
 * Identifier Detection Utility
 * 
 * Auto-detects the type of identifier input (email, phone, username, or full name)
 * and normalizes the data for submission to the scan pipeline.
 */

export type IdentifierType = 'email' | 'phone' | 'username' | 'fullname';

export interface DetectionResult {
  type: IdentifierType;
  normalized: {
    email?: string;
    phone?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Detects the type of identifier from user input and normalizes it
 * 
 * Detection priority:
 * 1. Email: Contains @ followed by a domain (e.g., user@example.com)
 * 2. Phone: Starts with + or contains 7+ consecutive digits
 * 3. Full name: Contains whitespace (split into firstName + lastName)
 * 4. Username: Default fallback
 * 
 * @param input - The raw user input string
 * @returns DetectionResult with type and normalized fields
 */
export function detectIdentifierType(input: string): DetectionResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return {
      type: 'username',
      normalized: { username: '' }
    };
  }
  
  // Email detection: contains @ with a valid domain pattern
  // Must have @ followed by at least one character, a dot, and more characters
  if (/@.+\..+/.test(trimmed)) {
    return {
      type: 'email',
      normalized: { email: trimmed.toLowerCase() }
    };
  }
  
  // Phone detection: starts with + OR is primarily numeric
  // Must start with + OR contain only digits and phone separators (spaces, dashes, parens, dots)
  // This prevents usernames like "matchu12181990" from being detected as phone numbers
  const digits = trimmed.replace(/\D/g, '');
  const isPhoneLike = trimmed.startsWith('+') || 
    (digits.length >= 7 && /^[\d\s\-().+]+$/.test(trimmed));
  
  if (isPhoneLike) {
    return {
      type: 'phone',
      normalized: { phone: trimmed }
    };
  }
  
  // Full name detection: contains whitespace between words
  if (/\s/.test(trimmed)) {
    const parts = trimmed.split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return {
      type: 'fullname',
      normalized: { firstName, lastName }
    };
  }
  
  // Default: treat as username
  return {
    type: 'username',
    normalized: { username: trimmed }
  };
}

/**
 * Returns a human-readable label for the identifier type
 */
export function getIdentifierLabel(type: IdentifierType): string {
  switch (type) {
    case 'email':
      return 'Email';
    case 'phone':
      return 'Phone';
    case 'fullname':
      return 'Full Name';
    case 'username':
    default:
      return 'Username';
  }
}
