/**
 * Security Monitoring Utilities
 * 
 * Helper functions for tracking security events, auth failures, rate limiting,
 * and suspicious activity patterns across the application.
 * 
 * Usage in Edge Functions:
 * ```typescript
 * import { logSecurityEvent, SecurityEventType } from './security/monitoring.ts';
 * 
 * logSecurityEvent({
 *   type: SecurityEventType.AUTH_FAILURE,
 *   userId: user?.id,
 *   ip: getClientIp(req),
 *   metadata: { reason: 'invalid_password' }
 * });
 * ```
 */

export enum SecurityEventType {
  AUTH_FAILURE = 'auth_failure',
  AUTH_SUCCESS = 'auth_success',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRIVILEGE_ESCALATION_ATTEMPT = 'privilege_escalation_attempt',
  FILE_UPLOAD_VIOLATION = 'file_upload_violation',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
}

export enum SecurityLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface SecurityEvent {
  type: SecurityEventType;
  level?: SecurityLevel;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Log a security event with structured data
 * Automatically determines severity level based on event type
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const level = event.level || getDefaultLevel(event.type);
  const timestamp = event.timestamp || new Date().toISOString();

  const logEntry = {
    ...event,
    level,
    timestamp,
    // Redact sensitive data in logs
    email: event.email ? redactEmail(event.email) : undefined,
    ip: event.ip ? redactIp(event.ip) : undefined,
  };

  const prefix = `[SECURITY-${level.toUpperCase()}]`;
  
  switch (level) {
    case SecurityLevel.CRITICAL:
    case SecurityLevel.ERROR:
      console.error(prefix, JSON.stringify(logEntry));
      break;
    case SecurityLevel.WARN:
      console.warn(prefix, JSON.stringify(logEntry));
      break;
    default:
      console.log(prefix, JSON.stringify(logEntry));
  }
}

/**
 * Get default security level for event type
 */
function getDefaultLevel(type: SecurityEventType): SecurityLevel {
  switch (type) {
    case SecurityEventType.PRIVILEGE_ESCALATION_ATTEMPT:
    case SecurityEventType.SQL_INJECTION_ATTEMPT:
      return SecurityLevel.CRITICAL;
    
    case SecurityEventType.UNAUTHORIZED_ACCESS:
    case SecurityEventType.XSS_ATTEMPT:
    case SecurityEventType.SUSPICIOUS_ACTIVITY:
      return SecurityLevel.ERROR;
    
    case SecurityEventType.RATE_LIMIT_EXCEEDED:
    case SecurityEventType.AUTH_FAILURE:
    case SecurityEventType.FILE_UPLOAD_VIOLATION:
      return SecurityLevel.WARN;
    
    case SecurityEventType.AUTH_SUCCESS:
    default:
      return SecurityLevel.INFO;
  }
}

/**
 * Redact email for logging (show first 2 chars + domain)
 * Example: jo***@example.com
 */
function redactEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.substring(0, 2)}***@${domain}`;
}

/**
 * Redact IP address for logging (show first 2 octets)
 * Example: 192.168.***.***
 */
function redactIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length !== 4) return '***';
  return `${parts[0]}.${parts[1]}.***.***`;
}

/**
 * Extract client IP from request headers
 * Checks x-forwarded-for, x-real-ip, and falls back to connection IP
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Track authentication failures for rate limiting
 * Returns true if threshold exceeded
 */
const authFailureMap = new Map<string, number[]>();
const AUTH_FAILURE_THRESHOLD = 5;
const AUTH_FAILURE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function trackAuthFailure(identifier: string): boolean {
  const now = Date.now();
  const timestamps = authFailureMap.get(identifier) || [];
  
  // Filter out old timestamps
  const recentTimestamps = timestamps.filter(
    (ts) => now - ts < AUTH_FAILURE_WINDOW_MS
  );
  
  recentTimestamps.push(now);
  authFailureMap.set(identifier, recentTimestamps);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, values] of authFailureMap.entries()) {
      const recent = values.filter((ts) => now - ts < AUTH_FAILURE_WINDOW_MS);
      if (recent.length === 0) {
        authFailureMap.delete(key);
      } else {
        authFailureMap.set(key, recent);
      }
    }
  }
  
  return recentTimestamps.length >= AUTH_FAILURE_THRESHOLD;
}

/**
 * Reset authentication failure count for identifier
 */
export function resetAuthFailures(identifier: string): void {
  authFailureMap.delete(identifier);
}

/**
 * Detect suspicious patterns in user input
 * Returns array of detected threats
 */
export function detectSuspiciousPatterns(input: string): string[] {
  const threats: string[] = [];
  
  // SQL injection patterns
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(--|\#|\/\*)/,
    /(\bOR\b.*=.*)/i,
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      threats.push('sql_injection');
      break;
    }
  }
  
  // XSS patterns
  const xssPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b[^>]*>/i,
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      threats.push('xss');
      break;
    }
  }
  
  // Path traversal
  if (/\.\.\/|\.\.\\/.test(input)) {
    threats.push('path_traversal');
  }
  
  return threats;
}

/**
 * Validate file upload for security
 * Returns validation result with errors if any
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateFileUpload(
  file: File,
  options: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): FileValidationResult {
  const errors: string[] = [];
  
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
  } = options;
  
  // Check file size
  if (file.size > maxSizeBytes) {
    errors.push(`File size ${file.size} exceeds maximum ${maxSizeBytes} bytes`);
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed`);
  }
  
  // Check file extension
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(ext)) {
    errors.push(`File extension ${ext} not allowed`);
  }
  
  // Check for suspicious filename patterns
  const threats = detectSuspiciousPatterns(file.name);
  if (threats.length > 0) {
    errors.push(`Suspicious filename pattern detected: ${threats.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
