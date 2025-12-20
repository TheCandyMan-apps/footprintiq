/**
 * Scan Input Validation
 * Validates and normalizes user input for different scan types
 */

import { z } from 'zod';
import { type ScanType } from '@/lib/providers/registry';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedValue?: string;
  hint?: string;
}

// Email validation
const emailSchema = z.string().email('Please enter a valid email address');

// Phone validation - accepts various formats, normalizes to E.164
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
const e164Regex = /^\+[1-9]\d{6,14}$/;

// Domain validation
const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

// Username validation - alphanumeric with common special chars
const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,62}[a-zA-Z0-9]?$/;

/**
 * Normalize phone number to E.164 format
 */
function normalizePhone(input: string): string {
  // Remove all non-numeric characters except leading +
  let cleaned = input.replace(/[^\d+]/g, '');
  
  // If no + prefix and looks like UK number starting with 0
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0') && cleaned.length >= 10) {
      // UK local format -> E.164
      cleaned = '+44' + cleaned.substring(1);
    } else if (cleaned.startsWith('00')) {
      // International format with 00 prefix
      cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.length >= 10) {
      // Assume US/international, add +
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
}

/**
 * Validate email input
 */
function validateEmail(input: string): ValidationResult {
  const trimmed = input.trim().toLowerCase();
  
  if (!trimmed) {
    return { isValid: false, hint: 'Enter an email address (e.g., user@example.com)' };
  }
  
  try {
    emailSchema.parse(trimmed);
    return { isValid: true, normalizedValue: trimmed };
  } catch {
    // Check for common issues
    if (!trimmed.includes('@')) {
      return { isValid: false, error: 'Missing @ symbol', hint: 'Format: user@domain.com' };
    }
    if (!trimmed.includes('.')) {
      return { isValid: false, error: 'Missing domain extension', hint: 'Format: user@domain.com' };
    }
    return { isValid: false, error: 'Invalid email format', hint: 'Format: user@domain.com' };
  }
}

/**
 * Validate phone input
 */
function validatePhone(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, hint: 'Enter phone number (e.g., +447700900123)' };
  }
  
  // Basic format check
  if (!phoneRegex.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Invalid phone number format',
      hint: 'Use E.164 format: +447700900123 or local: 07700 900123'
    };
  }
  
  const normalized = normalizePhone(trimmed);
  
  // Check if normalized version is valid E.164
  if (!e164Regex.test(normalized)) {
    return { 
      isValid: false, 
      error: 'Could not normalize to E.164 format',
      hint: 'Include country code (e.g., +44 for UK, +1 for US)'
    };
  }
  
  return { isValid: true, normalizedValue: normalized };
}

/**
 * Validate domain input
 */
function validateDomain(input: string): ValidationResult {
  let trimmed = input.trim().toLowerCase();
  
  if (!trimmed) {
    return { isValid: false, hint: 'Enter a domain (e.g., example.com)' };
  }
  
  // Remove protocol if present
  trimmed = trimmed.replace(/^(https?:\/\/)?(www\.)?/, '');
  // Remove trailing slashes and paths
  trimmed = trimmed.split('/')[0];
  
  if (!domainRegex.test(trimmed)) {
    if (!trimmed.includes('.')) {
      return { isValid: false, error: 'Missing domain extension', hint: 'Format: example.com' };
    }
    return { isValid: false, error: 'Invalid domain format', hint: 'Format: example.com or subdomain.example.com' };
  }
  
  return { isValid: true, normalizedValue: trimmed };
}

/**
 * Validate username input
 */
function validateUsername(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, hint: 'Enter a username (e.g., john_doe)' };
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Username too short', hint: 'Minimum 2 characters' };
  }
  
  if (trimmed.length > 64) {
    return { isValid: false, error: 'Username too long', hint: 'Maximum 64 characters' };
  }
  
  if (!usernameRegex.test(trimmed)) {
    if (/^[._-]/.test(trimmed) || /[._-]$/.test(trimmed)) {
      return { 
        isValid: false, 
        error: 'Cannot start or end with special characters',
        hint: 'Use letters and numbers at start/end'
      };
    }
    if (/\s/.test(trimmed)) {
      return { isValid: false, error: 'Spaces not allowed', hint: 'Use underscores instead' };
    }
    return { 
      isValid: false, 
      error: 'Invalid characters detected',
      hint: 'Use letters, numbers, underscores, dots, or hyphens'
    };
  }
  
  return { isValid: true, normalizedValue: trimmed };
}

/**
 * Main validation function
 */
export function validateScanInput(scanType: ScanType, input: string): ValidationResult {
  switch (scanType) {
    case 'email':
      return validateEmail(input);
    case 'phone':
      return validatePhone(input);
    case 'domain':
      return validateDomain(input);
    case 'username':
      return validateUsername(input);
    default:
      return { isValid: true, normalizedValue: input.trim() };
  }
}

/**
 * Get format hint for a scan type (shown before user types)
 */
export function getFormatHint(scanType: ScanType): string {
  switch (scanType) {
    case 'email':
      return 'user@example.com';
    case 'phone':
      return '+447700900123 or 07700 900123';
    case 'domain':
      return 'example.com';
    case 'username':
      return 'john_doe';
    default:
      return '';
  }
}
