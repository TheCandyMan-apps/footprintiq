/**
 * Security validation utilities for edge functions
 * Prevents SQL injection, XSS, path traversal, and command injection
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Common regex patterns for security validation
 */
const PATTERNS = {
  // SQL injection detection
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b|--|;|\/\*|\*\/|xp_|sp_)/gi,
  
  // XSS detection
  XSS_SCRIPT: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  XSS_ONERROR: /onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=/gi,
  XSS_JAVASCRIPT: /javascript:/gi,
  
  // Path traversal
  PATH_TRAVERSAL: /\.\.[\/\\]/g,
  
  // Command injection
  COMMAND_INJECTION: /[;&|`$()]/g,
  
  // Email validation (RFC 5322 simplified)
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // UUID validation
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Phone number validation (international format)
  PHONE: /^\+?[1-9]\d{1,14}$/,
  
  // URL validation (basic)
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Alphanumeric with common safe characters
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?'"()]+$/,
};

/**
 * Sanitize string input to prevent injection attacks
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (!input) return "";
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");
  
  // Encode HTML special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
  
  return sanitized;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }
  
  if (email.length > 254) {
    return { valid: false, error: "Email is too long" };
  }
  
  if (!PATTERNS.EMAIL.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  return { valid: true };
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string): { valid: boolean; error?: string } {
  if (!uuid || typeof uuid !== "string") {
    return { valid: false, error: "UUID is required" };
  }
  
  if (!PATTERNS.UUID.test(uuid)) {
    return { valid: false, error: "Invalid UUID format" };
  }
  
  return { valid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Phone number is required" };
  }
  
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, error: "Phone number must be 10-15 digits" };
  }
  
  if (!PATTERNS.PHONE.test(cleaned)) {
    return { valid: false, error: "Invalid phone number format" };
  }
  
  return { valid: true };
}

/**
 * Validate URL
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }
  
  if (url.length > 2048) {
    return { valid: false, error: "URL is too long" };
  }
  
  if (!PATTERNS.URL.test(url)) {
    return { valid: false, error: "Invalid URL format" };
  }
  
  return { valid: true };
}

/**
 * Detect SQL injection attempts
 */
export function detectSQLInjection(input: string): { safe: boolean; threat?: string } {
  if (!input || typeof input !== "string") {
    return { safe: true };
  }
  
  if (PATTERNS.SQL_INJECTION.test(input)) {
    return { safe: false, threat: "Potential SQL injection detected" };
  }
  
  return { safe: true };
}

/**
 * Detect XSS attempts
 */
export function detectXSS(input: string): { safe: boolean; threat?: string } {
  if (!input || typeof input !== "string") {
    return { safe: true };
  }
  
  if (PATTERNS.XSS_SCRIPT.test(input) || 
      PATTERNS.XSS_ONERROR.test(input) || 
      PATTERNS.XSS_JAVASCRIPT.test(input)) {
    return { safe: false, threat: "Potential XSS attack detected" };
  }
  
  return { safe: true };
}

/**
 * Detect path traversal attempts
 */
export function detectPathTraversal(input: string): { safe: boolean; threat?: string } {
  if (!input || typeof input !== "string") {
    return { safe: true };
  }
  
  if (PATTERNS.PATH_TRAVERSAL.test(input)) {
    return { safe: false, threat: "Potential path traversal detected" };
  }
  
  return { safe: true };
}

/**
 * Detect command injection attempts
 */
export function detectCommandInjection(input: string): { safe: boolean; threat?: string } {
  if (!input || typeof input !== "string") {
    return { safe: true };
  }
  
  if (PATTERNS.COMMAND_INJECTION.test(input)) {
    return { safe: false, threat: "Potential command injection detected" };
  }
  
  return { safe: true };
}

/**
 * Comprehensive security validation
 */
export function validateInput(
  input: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    checkSQLInjection?: boolean;
    checkXSS?: boolean;
    checkPathTraversal?: boolean;
    checkCommandInjection?: boolean;
  } = {}
): { valid: boolean; sanitized?: string; error?: string; threat?: string } {
  const {
    maxLength = 1000,
    allowHtml = false,
    checkSQLInjection = true,
    checkXSS = true,
    checkPathTraversal = true,
    checkCommandInjection = true,
  } = options;
  
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Input is required" };
  }
  
  if (input.length > maxLength) {
    return { valid: false, error: `Input exceeds maximum length of ${maxLength}` };
  }
  
  // Security checks
  if (checkSQLInjection) {
    const sqlCheck = detectSQLInjection(input);
    if (!sqlCheck.safe) {
      return { valid: false, threat: sqlCheck.threat };
    }
  }
  
  if (checkXSS) {
    const xssCheck = detectXSS(input);
    if (!xssCheck.safe) {
      return { valid: false, threat: xssCheck.threat };
    }
  }
  
  if (checkPathTraversal) {
    const pathCheck = detectPathTraversal(input);
    if (!pathCheck.safe) {
      return { valid: false, threat: pathCheck.threat };
    }
  }
  
  if (checkCommandInjection) {
    const cmdCheck = detectCommandInjection(input);
    if (!cmdCheck.safe) {
      return { valid: false, threat: cmdCheck.threat };
    }
  }
  
  // Sanitize if needed
  const sanitized = allowHtml ? input.trim() : sanitizeString(input, maxLength);
  
  return { valid: true, sanitized };
}

/**
 * Validate request body against schema with security checks
 */
export function validateRequestBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): { valid: boolean; data?: T; error?: string; threat?: string } {
  try {
    // First parse with Zod
    const parsed = schema.parse(body);
    
    // Then run security checks on string fields
    const securityCheck = runSecurityChecks(parsed);
    if (!securityCheck.safe) {
      return { valid: false, threat: securityCheck.threat };
    }
    
    return { valid: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { valid: false, error: message };
    }
    return { valid: false, error: "Invalid request body" };
  }
}

/**
 * Run security checks recursively on all string fields
 */
function runSecurityChecks(obj: any): { safe: boolean; threat?: string } {
  if (typeof obj === "string") {
    const checks = [
      detectSQLInjection(obj),
      detectXSS(obj),
      detectPathTraversal(obj),
      detectCommandInjection(obj),
    ];
    
    for (const check of checks) {
      if (!check.safe) {
        return check;
      }
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      const check = runSecurityChecks(item);
      if (!check.safe) return check;
    }
  } else if (obj && typeof obj === "object") {
    for (const value of Object.values(obj)) {
      const check = runSecurityChecks(value);
      if (!check.safe) return check;
    }
  }
  
  return { safe: true };
}

/**
 * Log security event (for monitoring)
 */
export async function logSecurityEvent(
  supabase: any,
  event: {
    type: "sql_injection" | "xss" | "path_traversal" | "command_injection" | "auth_failure" | "rate_limit";
    severity: "low" | "medium" | "high" | "critical";
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint: string;
    payload?: unknown;
    message: string;
  }
) {
  try {
    await supabase.from("system_errors").insert({
      error_code: `SECURITY_${event.type.toUpperCase()}`,
      error_message: event.message,
      function_name: event.endpoint,
      user_id: event.userId,
      severity: event.severity,
      metadata: {
        type: event.type,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        payload: event.payload,
      },
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}
