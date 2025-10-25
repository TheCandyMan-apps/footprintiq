import { z } from 'zod';

/**
 * Input validation schemas for provider adapters
 * Prevents injection attacks and wasted API quota
 */

export const domainSchema = z.string()
  .trim()
  .min(1, 'Domain required')
  .max(255, 'Domain too long')
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
    'Invalid domain format'
  );

export const ipv4Schema = z.string()
  .trim()
  .ip({ version: 'v4', message: 'Invalid IPv4 address' });

export const emailSchema = z.string()
  .trim()
  .email('Invalid email format')
  .max(254, 'Email too long');

export const usernameSchema = z.string()
  .trim()
  .min(1, 'Username required')
  .max(39, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters');

export const phoneSchema = z.string()
  .trim()
  .min(10, 'Phone number too short')
  .max(15, 'Phone number too long')
  .regex(/^\+?[0-9\s()-]+$/, 'Invalid phone number format');

export const searchQuerySchema = z.string()
  .trim()
  .min(1, 'Query required')
  .max(500, 'Query too long')
  .regex(/^[^<>{}]+$/, 'Query contains invalid characters');

/**
 * Validates input and returns validated value or throws ZodError
 */
export function validateDomain(domain: string): string {
  return domainSchema.parse(domain);
}

export function validateIP(ip: string): string {
  return ipv4Schema.parse(ip);
}

export function validateEmail(email: string): string {
  return emailSchema.parse(email);
}

export function validateUsername(username: string): string {
  return usernameSchema.parse(username);
}

export function validatePhone(phone: string): string {
  return phoneSchema.parse(phone);
}

export function validateQuery(query: string): string {
  return searchQuerySchema.parse(query);
}
