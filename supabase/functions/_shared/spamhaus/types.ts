/**
 * Spamhaus Integration Types
 * All types are internal-only, compliant with Spamhaus ToS
 * NO raw list names (SBL/XBL/PBL/DBL/ZRD/HBL) exposed
 */

export type SpamhausVerdict = 'low' | 'medium' | 'high' | 'unknown';
export type SpamhausInputType = 'ip' | 'domain';

/**
 * Normalized Spamhaus signal - safe for client consumption
 * Contains only abstracted categories, no raw Spamhaus data
 */
export interface SpamhausSignal {
  provider: 'spamhaus';
  input: { type: SpamhausInputType; value: string };
  verdict: SpamhausVerdict;
  categories: string[];  // Abstracted: abuse_infrastructure, mail_reputation, etc.
  reasons: string[];     // Plain-language explanations, NO list names
  confidence: number;    // 0-1 derived score
  evidence: SpamhausEvidence[];
  fetchedAt: string;
  cacheHit: boolean;
}

/**
 * Non-reversible evidence entry
 * Keys are generic indicators, not Spamhaus-specific
 */
export interface SpamhausEvidence {
  kind: 'internal';
  key: string;   // e.g., 'abuse_infra', 'mail_reputation', 'threat_type'
  value: string; // e.g., 'true', 'poor', 'spam_source'
}

/**
 * Error codes for Spamhaus operations
 */
export type SpamhausErrorCode = 
  | 'auth_failed'
  | 'rate_limited'
  | 'not_found'
  | 'validation_error'
  | 'api_error'
  | 'not_configured'
  | 'timeout';

export interface SpamhausError {
  code: SpamhausErrorCode;
  message: string;
  retryAfter?: number; // seconds until retry allowed
}

/**
 * Result type for all Spamhaus operations
 */
export type SpamhausResult = 
  | { success: true; data: SpamhausSignal }
  | { success: false; error: SpamhausError };

/**
 * Request payload for spamhaus-enrich edge function
 */
export interface SpamhausEnrichRequest {
  inputType: SpamhausInputType;
  inputValue: string;
  scanId?: string;
  skipCache?: boolean;
}

/**
 * Internal raw response types (never exposed to client)
 * These are used only for parsing Spamhaus API responses
 */
export interface RawSIAResponse {
  status?: string;
  results?: Array<{
    dataset?: string;
    listed?: boolean;
    type?: string;
    asn?: number;
    asn_name?: string;
    cc?: string;
    organization?: string;
    first_seen?: string;
    last_seen?: string;
  }>;
  // Additional fields omitted - never stored
}

export interface RawPDNSResponse {
  records?: Array<{
    rrtype?: string;
    rrdata?: string;
    first_seen?: string;
    last_seen?: string;
    count?: number;
  }>;
  // Additional fields omitted - never stored
}

export interface RawDQSResponse {
  status?: string;
  listed?: boolean;
  categories?: string[];
  // Additional fields omitted - never stored
}

/**
 * Token management for SIA authentication
 */
export interface SIAToken {
  token: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Cache entry structure
 */
export interface SpamhausCacheEntry {
  signal: SpamhausSignal;
  cachedAt: number;
  ttlMs: number;
}
