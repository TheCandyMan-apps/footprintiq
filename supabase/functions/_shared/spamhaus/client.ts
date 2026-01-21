/**
 * Spamhaus API Client
 * Handles SIA (Spamhaus Intelligence API), PDNS, and DQS queries
 * All responses are normalized and abstracted before return
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type {
  SpamhausResult,
  SpamhausSignal,
  SpamhausInputType,
  SIAToken,
  RawSIAResponse,
  RawDQSResponse,
} from './types.ts';
import { validateIp, validateDomain, normalizeIp, normalizeDomain } from './validation.ts';
import { processSIAResponse, processDQSResponse, deriveVerdict } from './abstraction.ts';

// API Endpoints
const SIA_BASE_URL = 'https://api.spamhaus.org/api';
const SIA_AUTH_URL = `${SIA_BASE_URL}/v1/login`;
const SIA_INTEL_URL = `${SIA_BASE_URL}/intel/v2/byobject`;
const PDNS_BASE_URL = 'https://api.spamhaus.org/api/pdns/v1';
const DQS_BASE_URL = 'https://apibl.spamhaus.net/lookup/v1';

// Cache TTL (24 hours default)
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Spamhaus Client Class
 * Manages authentication tokens and API calls
 */
class SpamhausClient {
  private token: SIAToken | null = null;
  
  /**
   * Get or refresh SIA authentication token
   */
  private async getToken(): Promise<string | null> {
    const username = Deno.env.get('SPAMHAUS_SIA_USERNAME');
    const password = Deno.env.get('SPAMHAUS_SIA_PASSWORD');
    
    if (!username || !password) {
      console.warn('[SpamhausClient] SIA credentials not configured');
      return null;
    }
    
    // Check if existing token is still valid (with 5 min buffer)
    if (this.token && this.token.expiresAt > Date.now() + 5 * 60 * 1000) {
      return this.token.token;
    }
    
    try {
      console.log('[SpamhausClient] Authenticating with SIA...');
      
      const response = await fetch(SIA_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          realm: 'intel',
        }),
      });
      
      if (!response.ok) {
        console.error(`[SpamhausClient] Auth failed: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.token) {
        // Tokens typically valid for 1 hour
        this.token = {
          token: data.token,
          expiresAt: Date.now() + 55 * 60 * 1000, // 55 minutes to be safe
        };
        console.log('[SpamhausClient] SIA authentication successful');
        return this.token.token;
      }
      
      return null;
    } catch (error) {
      console.error('[SpamhausClient] Auth error:', error);
      return null;
    }
  }
  
  /**
   * Check cache for existing result
   */
  private async checkCache(
    inputType: SpamhausInputType,
    inputValue: string
  ): Promise<SpamhausSignal | null> {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const cacheKey = `spamhaus:${inputType}:${inputValue}`;
    
    try {
      const { data } = await supabase
        .from('cache_entries')
        .select('cache_value, expires_at')
        .eq('cache_key', cacheKey)
        .single();
      
      if (data && new Date(data.expires_at) > new Date()) {
        const signal = data.cache_value as SpamhausSignal;
        return { ...signal, cacheHit: true };
      }
    } catch {
      // Cache miss or error
    }
    
    return null;
  }
  
  /**
   * Store result in cache
   */
  private async setCache(
    inputType: SpamhausInputType,
    inputValue: string,
    signal: SpamhausSignal,
    ttlMs: number = DEFAULT_CACHE_TTL_MS
  ): Promise<void> {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const cacheKey = `spamhaus:${inputType}:${inputValue}`;
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();
    
    try {
      await supabase
        .from('cache_entries')
        .upsert({
          cache_key: cacheKey,
          cache_type: 'spamhaus_signal',
          cache_value: signal,
          ttl_seconds: Math.floor(ttlMs / 1000),
          expires_at: expiresAt,
          hit_count: 1,
        }, {
          onConflict: 'cache_key',
        });
    } catch (error) {
      console.error('[SpamhausClient] Cache write error:', error);
    }
  }
  
  /**
   * Lookup IP reputation via SIA
   */
  async lookupIp(ip: string, skipCache = false): Promise<SpamhausResult> {
    const validation = validateIp(ip);
    if (!validation.valid) {
      return {
        success: false,
        error: { code: 'validation_error', message: validation.error || 'Invalid IP' },
      };
    }
    
    const normalized = normalizeIp(ip);
    
    // Check cache
    if (!skipCache) {
      const cached = await this.checkCache('ip', normalized);
      if (cached) {
        console.log(`[SpamhausClient] Cache hit for IP: ${normalized}`);
        return { success: true, data: cached };
      }
    }
    
    // Get auth token
    const token = await this.getToken();
    if (!token) {
      return {
        success: false,
        error: { code: 'not_configured', message: 'Spamhaus SIA not configured' },
      };
    }
    
    try {
      const url = `${SIA_INTEL_URL}/cidr/${normalized}/32`;
      console.log(`[SpamhausClient] Querying SIA for IP: ${normalized}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.status === 404) {
        // Not listed - clean result
        const signal = this.createCleanSignal('ip', normalized);
        await this.setCache('ip', normalized, signal);
        return { success: true, data: signal };
      }
      
      if (response.status === 429) {
        return {
          success: false,
          error: { code: 'rate_limited', message: 'Spamhaus rate limit exceeded', retryAfter: 60 },
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: { code: 'api_error', message: `SIA API error: ${response.status}` },
        };
      }
      
      const rawData: RawSIAResponse = await response.json();
      const processed = processSIAResponse(rawData);
      
      const signal: SpamhausSignal = {
        provider: 'spamhaus',
        input: { type: 'ip', value: normalized },
        verdict: deriveVerdict(processed.categories, processed.confidence),
        categories: processed.categories,
        reasons: processed.reasons,
        confidence: processed.confidence,
        evidence: processed.evidence,
        fetchedAt: new Date().toISOString(),
        cacheHit: false,
      };
      
      await this.setCache('ip', normalized, signal);
      return { success: true, data: signal };
      
    } catch (error) {
      console.error('[SpamhausClient] IP lookup error:', error);
      return {
        success: false,
        error: { code: 'api_error', message: 'Failed to query Spamhaus SIA' },
      };
    }
  }
  
  /**
   * Lookup domain reputation via SIA
   */
  async lookupDomain(domain: string, skipCache = false): Promise<SpamhausResult> {
    const validation = validateDomain(domain);
    if (!validation.valid) {
      return {
        success: false,
        error: { code: 'validation_error', message: validation.error || 'Invalid domain' },
      };
    }
    
    const normalized = normalizeDomain(domain);
    
    // Check cache
    if (!skipCache) {
      const cached = await this.checkCache('domain', normalized);
      if (cached) {
        console.log(`[SpamhausClient] Cache hit for domain: ${normalized}`);
        return { success: true, data: cached };
      }
    }
    
    // Get auth token
    const token = await this.getToken();
    if (!token) {
      return {
        success: false,
        error: { code: 'not_configured', message: 'Spamhaus SIA not configured' },
      };
    }
    
    try {
      const url = `${SIA_INTEL_URL}/domain/${encodeURIComponent(normalized)}`;
      console.log(`[SpamhausClient] Querying SIA for domain: ${normalized}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.status === 404) {
        const signal = this.createCleanSignal('domain', normalized);
        await this.setCache('domain', normalized, signal);
        return { success: true, data: signal };
      }
      
      if (response.status === 429) {
        return {
          success: false,
          error: { code: 'rate_limited', message: 'Spamhaus rate limit exceeded', retryAfter: 60 },
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: { code: 'api_error', message: `SIA API error: ${response.status}` },
        };
      }
      
      const rawData: RawSIAResponse = await response.json();
      const processed = processSIAResponse(rawData);
      
      const signal: SpamhausSignal = {
        provider: 'spamhaus',
        input: { type: 'domain', value: normalized },
        verdict: deriveVerdict(processed.categories, processed.confidence),
        categories: processed.categories,
        reasons: processed.reasons,
        confidence: processed.confidence,
        evidence: processed.evidence,
        fetchedAt: new Date().toISOString(),
        cacheHit: false,
      };
      
      await this.setCache('domain', normalized, signal);
      return { success: true, data: signal };
      
    } catch (error) {
      console.error('[SpamhausClient] Domain lookup error:', error);
      return {
        success: false,
        error: { code: 'api_error', message: 'Failed to query Spamhaus SIA' },
      };
    }
  }
  
  /**
   * Query Passive DNS
   */
  async passiveDns(target: string, skipCache = false): Promise<SpamhausResult> {
    // Validate input (can be IP or domain)
    const ipValidation = validateIp(target);
    const domainValidation = validateDomain(target);
    
    let inputType: SpamhausInputType;
    let normalized: string;
    
    if (ipValidation.valid) {
      inputType = 'ip';
      normalized = normalizeIp(target);
    } else if (domainValidation.valid) {
      inputType = 'domain';
      normalized = normalizeDomain(target);
    } else {
      return {
        success: false,
        error: { code: 'validation_error', message: 'Input must be a valid IP or domain' },
      };
    }
    
    // Check cache with pdns prefix
    const cacheKey = `pdns_${inputType}`;
    if (!skipCache) {
      const cached = await this.checkCache(cacheKey as SpamhausInputType, normalized);
      if (cached) {
        return { success: true, data: cached };
      }
    }
    
    const token = await this.getToken();
    if (!token) {
      return {
        success: false,
        error: { code: 'not_configured', message: 'Spamhaus PDNS not configured' },
      };
    }
    
    try {
      const url = `${PDNS_BASE_URL}/lookup?q=${encodeURIComponent(normalized)}`;
      console.log(`[SpamhausClient] Querying PDNS for: ${normalized}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.status === 404) {
        const signal = this.createCleanSignal(inputType, normalized);
        return { success: true, data: signal };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: { code: 'api_error', message: `PDNS API error: ${response.status}` },
        };
      }
      
      // PDNS returns DNS history - abstract to categories
      const rawData = await response.json();
      const recordCount = rawData.records?.length || 0;
      
      const signal: SpamhausSignal = {
        provider: 'spamhaus',
        input: { type: inputType, value: normalized },
        verdict: recordCount > 50 ? 'medium' : 'low',
        categories: recordCount > 0 ? ['newly_observed'] : [],
        reasons: recordCount > 0 ? ['DNS activity observed in passive monitoring'] : [],
        confidence: Math.min(0.8, 0.3 + recordCount * 0.01),
        evidence: [
          { kind: 'internal', key: 'dns_activity_level', value: recordCount > 50 ? 'high' : recordCount > 10 ? 'moderate' : 'low' },
        ],
        fetchedAt: new Date().toISOString(),
        cacheHit: false,
      };
      
      return { success: true, data: signal };
      
    } catch (error) {
      console.error('[SpamhausClient] PDNS lookup error:', error);
      return {
        success: false,
        error: { code: 'api_error', message: 'Failed to query Spamhaus PDNS' },
      };
    }
  }
  
  /**
   * Query DQS for content reputation
   */
  async contentReputation(domain: string, skipCache = false): Promise<SpamhausResult> {
    const validation = validateDomain(domain);
    if (!validation.valid) {
      return {
        success: false,
        error: { code: 'validation_error', message: validation.error || 'Invalid domain' },
      };
    }
    
    const normalized = normalizeDomain(domain);
    const dqsKey = Deno.env.get('SPAMHAUS_DQS_KEY');
    
    if (!dqsKey) {
      return {
        success: false,
        error: { code: 'not_configured', message: 'Spamhaus DQS not configured' },
      };
    }
    
    // Check cache with dqs prefix
    if (!skipCache) {
      const cached = await this.checkCache('domain', `dqs_${normalized}`);
      if (cached) {
        return { success: true, data: cached };
      }
    }
    
    try {
      const url = `${DQS_BASE_URL}/${encodeURIComponent(normalized)}`;
      console.log(`[SpamhausClient] Querying DQS for: ${normalized}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${dqsKey}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.status === 404) {
        const signal = this.createCleanSignal('domain', normalized);
        await this.setCache('domain', `dqs_${normalized}`, signal);
        return { success: true, data: signal };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: { code: 'api_error', message: `DQS API error: ${response.status}` },
        };
      }
      
      const rawData: RawDQSResponse = await response.json();
      const processed = processDQSResponse(rawData);
      
      const signal: SpamhausSignal = {
        provider: 'spamhaus',
        input: { type: 'domain', value: normalized },
        verdict: deriveVerdict(processed.categories, processed.confidence),
        categories: processed.categories,
        reasons: processed.reasons,
        confidence: processed.confidence,
        evidence: processed.evidence,
        fetchedAt: new Date().toISOString(),
        cacheHit: false,
      };
      
      await this.setCache('domain', `dqs_${normalized}`, signal);
      return { success: true, data: signal };
      
    } catch (error) {
      console.error('[SpamhausClient] DQS lookup error:', error);
      return {
        success: false,
        error: { code: 'api_error', message: 'Failed to query Spamhaus DQS' },
      };
    }
  }
  
  /**
   * Create a clean signal for unlisted targets
   */
  private createCleanSignal(inputType: SpamhausInputType, value: string): SpamhausSignal {
    return {
      provider: 'spamhaus',
      input: { type: inputType, value },
      verdict: 'low',
      categories: [],
      reasons: ['No threat indicators found'],
      confidence: 0.9,
      evidence: [{ kind: 'internal', key: 'threat_detected', value: 'false' }],
      fetchedAt: new Date().toISOString(),
      cacheHit: false,
    };
  }
}

// Export singleton instance
export const spamhausClient = new SpamhausClient();
