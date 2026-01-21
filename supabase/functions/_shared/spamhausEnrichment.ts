/**
 * Spamhaus Enrichment Helper
 * 
 * Handles calling spamhaus-enrich for IPs/domains found in scan results.
 * Used by scan-orchestrate to enqueue enrichment after primary scan completes.
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

export interface EnrichmentTarget {
  type: 'ip' | 'domain';
  value: string;
}

export interface EnrichmentResult {
  target: EnrichmentTarget;
  success: boolean;
  signal?: any;
  error?: string;
}

/**
 * Extract unique IPs and domains from scan findings.
 * Deduplicates and normalizes values.
 */
export function extractEnrichmentTargets(findings: any[]): EnrichmentTarget[] {
  const targets = new Map<string, EnrichmentTarget>();
  
  // IP regex pattern
  const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  
  // Domain regex pattern (simplified, catches most common domains)
  const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
  
  // Common false positive domains to exclude
  const EXCLUDED_DOMAINS = new Set([
    'example.com', 'example.org', 'example.net',
    'localhost', 'test.com', 'placeholder.com',
  ]);
  
  for (const finding of findings) {
    // Check evidence array
    if (finding.evidence && Array.isArray(finding.evidence)) {
      for (const ev of finding.evidence) {
        const value = String(ev.value || '');
        
        // Extract IPs
        const ips = value.match(ipv4Regex) || [];
        for (const ip of ips) {
          // Skip private/local IPs
          if (!isPrivateIP(ip)) {
            targets.set(`ip:${ip}`, { type: 'ip', value: ip });
          }
        }
        
        // Extract domains from URL keys
        if (ev.key === 'url' || ev.key === 'profile_url' || ev.key === 'link') {
          try {
            const url = new URL(value);
            const domain = url.hostname.toLowerCase();
            if (!EXCLUDED_DOMAINS.has(domain) && isValidDomain(domain)) {
              targets.set(`domain:${domain}`, { type: 'domain', value: domain });
            }
          } catch {
            // Not a valid URL, try regex
            const domains = value.match(domainRegex) || [];
            for (const domain of domains) {
              const normalized = domain.toLowerCase();
              if (!EXCLUDED_DOMAINS.has(normalized) && isValidDomain(normalized)) {
                targets.set(`domain:${normalized}`, { type: 'domain', value: normalized });
              }
            }
          }
        }
      }
    }
    
    // Check meta object
    if (finding.meta && typeof finding.meta === 'object') {
      const metaStr = JSON.stringify(finding.meta);
      
      // Extract IPs from meta
      const ips = metaStr.match(ipv4Regex) || [];
      for (const ip of ips) {
        if (!isPrivateIP(ip)) {
          targets.set(`ip:${ip}`, { type: 'ip', value: ip });
        }
      }
      
      // Check specific meta fields for domains
      const domainFields = ['domain', 'host', 'server', 'mx_host'];
      for (const field of domainFields) {
        if (finding.meta[field] && typeof finding.meta[field] === 'string') {
          const domain = finding.meta[field].toLowerCase();
          if (isValidDomain(domain)) {
            targets.set(`domain:${domain}`, { type: 'domain', value: domain });
          }
        }
      }
    }
  }
  
  // Limit to first 10 targets to avoid excessive API calls
  return Array.from(targets.values()).slice(0, 10);
}

/**
 * Check if an IP is private/local
 */
function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return true;
  
  // 10.x.x.x
  if (parts[0] === 10) return true;
  // 172.16-31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 127.x.x.x
  if (parts[0] === 127) return true;
  // 0.x.x.x
  if (parts[0] === 0) return true;
  
  return false;
}

/**
 * Basic domain validation
 */
function isValidDomain(domain: string): boolean {
  // Must have at least one dot
  if (!domain.includes('.')) return false;
  // Must not be too short
  if (domain.length < 4) return false;
  // Must not be an IP
  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) return false;
  // Must not start/end with dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  
  return true;
}

/**
 * Call spamhaus-enrich for each target and store results
 */
export async function enrichTargets(
  supabaseService: SupabaseClient,
  scanId: string,
  targets: EnrichmentTarget[],
  authHeader: string
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];
  
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  
  for (const target of targets) {
    try {
      console.log(`[spamhausEnrichment] Enriching ${target.type}: ${target.value}`);
      
      // Call spamhaus-enrich edge function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/spamhaus-enrich`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          inputType: target.type,
          inputValue: target.value,
          scanId: scanId,
          skipCache: false,
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Store in scan_enrichments table
        const { error: insertError } = await supabaseService
          .from('scan_enrichments')
          .upsert({
            scan_id: scanId,
            enrichment_type: 'spamhaus',
            input_type: target.type,
            input_value: target.value,
            signal: result.data,
            verdict: result.data.verdict,
            confidence: result.data.confidence,
          }, {
            onConflict: 'scan_id,enrichment_type,input_type,input_value',
          });
        
        if (insertError) {
          console.error(`[spamhausEnrichment] Failed to store enrichment:`, insertError);
        }
        
        results.push({
          target,
          success: true,
          signal: result.data,
        });
      } else {
        // Handle Pro-required or other errors gracefully
        const errorCode = result.error?.code || 'UNKNOWN';
        console.log(`[spamhausEnrichment] Enrichment skipped for ${target.value}: ${errorCode}`);
        
        results.push({
          target,
          success: false,
          error: result.error?.message || 'Enrichment failed',
        });
      }
    } catch (error) {
      console.error(`[spamhausEnrichment] Error enriching ${target.value}:`, error);
      results.push({
        target,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return results;
}

/**
 * Main enrichment orchestrator - called after primary scan completes.
 * Only runs for Pro users (enforced by spamhaus-enrich itself).
 */
export async function runSpamhausEnrichment(
  supabaseService: SupabaseClient,
  scanId: string,
  findings: any[],
  authHeader: string
): Promise<void> {
  console.log(`[spamhausEnrichment] Starting enrichment for scan ${scanId}`);
  
  // Extract unique targets from findings
  const targets = extractEnrichmentTargets(findings);
  
  if (targets.length === 0) {
    console.log(`[spamhausEnrichment] No IPs/domains found for enrichment`);
    return;
  }
  
  console.log(`[spamhausEnrichment] Found ${targets.length} targets for enrichment`);
  
  // Enrich all targets
  const results = await enrichTargets(supabaseService, scanId, targets, authHeader);
  
  const successCount = results.filter(r => r.success).length;
  console.log(`[spamhausEnrichment] Completed enrichment: ${successCount}/${targets.length} successful`);
}
