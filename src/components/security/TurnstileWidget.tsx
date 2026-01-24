/**
 * TurnstileWidget - Alias for TurnstileGate
 * 
 * This file provides a convenient import path at src/components/security/
 * for the Cloudflare Turnstile verification widget.
 * 
 * The actual implementation lives in src/components/auth/TurnstileGate.tsx
 */

export { 
  TurnstileGate as TurnstileWidget, 
  type TurnstileGateRef as TurnstileWidgetRef, 
  type TurnstileGateProps as TurnstileWidgetProps 
} from '@/components/auth/TurnstileGate';

// Also export the original names for flexibility
export { 
  TurnstileGate, 
  type TurnstileGateRef, 
  type TurnstileGateProps 
} from '@/components/auth/TurnstileGate';
