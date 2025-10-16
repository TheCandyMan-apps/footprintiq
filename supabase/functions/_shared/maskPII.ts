/**
 * Masks personally identifiable information (PII) for logging purposes
 * to comply with GDPR and prevent sensitive data exposure in logs
 */
export const maskPII = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const masked = { ...data };

  // Mask email addresses
  if (masked.email && typeof masked.email === 'string') {
    const emailParts = masked.email.split('@');
    if (emailParts.length === 2) {
      const local = emailParts[0];
      const domain = emailParts[1];
      masked.email = local.length > 2 
        ? `${local.substring(0, 2)}***@${domain}`
        : `***@${domain}`;
    }
  }

  // Mask phone numbers
  if (masked.phone && typeof masked.phone === 'string') {
    const digitsOnly = masked.phone.replace(/\D/g, '');
    masked.phone = digitsOnly.length >= 4 
      ? `***${digitsOnly.slice(-4)}`
      : '***';
  }

  // Mask first name
  if (masked.firstName && typeof masked.firstName === 'string') {
    masked.firstName = masked.firstName.length > 1
      ? `${masked.firstName[0]}***`
      : '***';
  }

  // Mask last name  
  if (masked.lastName && typeof masked.lastName === 'string') {
    masked.lastName = masked.lastName.length > 1
      ? `${masked.lastName[0]}***`
      : '***';
  }

  // Mask first_name (snake_case variant)
  if (masked.first_name && typeof masked.first_name === 'string') {
    masked.first_name = masked.first_name.length > 1
      ? `${masked.first_name[0]}***`
      : '***';
  }

  // Mask last_name (snake_case variant)
  if (masked.last_name && typeof masked.last_name === 'string') {
    masked.last_name = masked.last_name.length > 1
      ? `${masked.last_name[0]}***`
      : '***';
  }

  // Mask name field
  if (masked.name && typeof masked.name === 'string') {
    masked.name = masked.name.length > 1
      ? `${masked.name[0]}***`
      : '***';
  }

  // Mask username (partial)
  if (masked.username && typeof masked.username === 'string') {
    masked.username = masked.username.length > 3
      ? `${masked.username.substring(0, 3)}***`
      : '***';
  }

  return masked;
};

/**
 * Masks an email address for logging
 */
export const maskEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '***';
  }
  
  const emailParts = email.split('@');
  if (emailParts.length === 2) {
    const local = emailParts[0];
    const domain = emailParts[1];
    return local.length > 2 
      ? `${local.substring(0, 2)}***@${domain}`
      : `***@${domain}`;
  }
  
  return '***';
};

/**
 * Masks an IP address for logging (keeps first two octets)
 */
export const maskIP = (ip: string): string => {
  if (!ip || typeof ip !== 'string') {
    return '***';
  }
  
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***.`;
  }
  
  // IPv6 or other format
  return `${ip.substring(0, 8)}***`;
};
