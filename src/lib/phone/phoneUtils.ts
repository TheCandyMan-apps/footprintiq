/**
 * Phone number utilities
 * E.164 normalization, validation, and formatting
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string | null;
  formatted: string | null;
  country?: string;
  error?: string;
}

/**
 * Strip all non-digit characters except leading +
 */
export function stripNonDigits(phone: string): string {
  const hasPlus = phone.trim().startsWith('+');
  const digits = phone.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Normalize phone number to E.164 format
 * Returns null if cannot normalize
 */
export function normalizeToE164(phone: string): string | null {
  const stripped = stripNonDigits(phone);
  
  // Already has +
  if (stripped.startsWith('+')) {
    const digits = stripped.slice(1);
    // Must be 7-15 digits
    if (digits.length >= 7 && digits.length <= 15) {
      return stripped;
    }
    return null;
  }
  
  // US/Canada detection (10 digits or 11 starting with 1)
  if (stripped.length === 10) {
    return `+1${stripped}`;
  }
  if (stripped.length === 11 && stripped.startsWith('1')) {
    return `+${stripped}`;
  }
  
  // UK detection (10-11 digits starting with 0)
  if (stripped.startsWith('0') && stripped.length >= 10 && stripped.length <= 11) {
    return `+44${stripped.slice(1)}`;
  }
  
  // For other cases, assume the user should add country code
  if (stripped.length >= 7 && stripped.length <= 15) {
    return `+${stripped}`;
  }
  
  return null;
}

/**
 * Format phone for display (with spaces/dashes)
 */
export function formatPhoneDisplay(e164: string): string {
  if (!e164.startsWith('+')) return e164;
  
  const digits = e164.slice(1);
  
  // US/Canada format: +1 (xxx) xxx-xxxx
  if (digits.startsWith('1') && digits.length === 11) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // UK format: +44 xxxx xxxxxx
  if (digits.startsWith('44') && digits.length >= 12) {
    return `+44 ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  
  // Generic international format
  return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
}

/**
 * Validate phone number input
 */
export function validatePhone(phone: string): PhoneValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, normalized: null, formatted: null, error: 'Phone number required' };
  }
  
  const stripped = stripNonDigits(phone);
  const digitCount = stripped.replace(/\+/g, '').length;
  
  if (digitCount < 7) {
    return { 
      isValid: false, 
      normalized: null, 
      formatted: null, 
      error: 'Phone number too short (min 7 digits)' 
    };
  }
  
  if (digitCount > 15) {
    return { 
      isValid: false, 
      normalized: null, 
      formatted: null, 
      error: 'Phone number too long (max 15 digits)' 
    };
  }
  
  const normalized = normalizeToE164(phone);
  
  if (!normalized) {
    return { 
      isValid: false, 
      normalized: null, 
      formatted: null, 
      error: 'Could not normalize to E.164 format' 
    };
  }
  
  return {
    isValid: true,
    normalized,
    formatted: formatPhoneDisplay(normalized),
    country: detectCountry(normalized),
  };
}

/**
 * Detect country from E.164 number
 */
export function detectCountry(e164: string): string | undefined {
  if (!e164.startsWith('+')) return undefined;
  
  const digits = e164.slice(1);
  
  // Common country codes
  if (digits.startsWith('1')) return 'US/CA';
  if (digits.startsWith('44')) return 'GB';
  if (digits.startsWith('49')) return 'DE';
  if (digits.startsWith('33')) return 'FR';
  if (digits.startsWith('61')) return 'AU';
  if (digits.startsWith('81')) return 'JP';
  if (digits.startsWith('86')) return 'CN';
  if (digits.startsWith('91')) return 'IN';
  if (digits.startsWith('55')) return 'BR';
  if (digits.startsWith('7')) return 'RU';
  
  return undefined;
}

/**
 * Auto-format phone input as user types
 */
export function autoFormatPhoneInput(value: string, previousValue?: string): string {
  // If backspacing, don't auto-format
  if (previousValue && value.length < previousValue.length) {
    return value;
  }
  
  // If starts with +, preserve it
  if (value.startsWith('+')) {
    // Allow + followed by digits, spaces, dashes, parentheses
    return value.replace(/[^\d\s\-\(\)\+]/g, '');
  }
  
  // Strip non-phone characters
  return value.replace(/[^\d\s\-\(\)\+]/g, '');
}

/**
 * Get example phone numbers for different formats
 */
export const PHONE_EXAMPLES = [
  { format: 'E.164 (recommended)', example: '+447712345678' },
  { format: 'US/Canada', example: '+1 415 555 2671' },
  { format: 'UK', example: '+44 7712 345678' },
  { format: 'With formatting', example: '(415) 555-2671' },
];
