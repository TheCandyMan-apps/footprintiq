import { supabase } from '@/integrations/supabase/client';
import { createHash } from 'crypto';

export interface ThreatIndicator {
  type: string;
  value: string;
  indicatorType?: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export async function collectOTXFeed(apiKey: string, workspaceId: string): Promise<ThreatIndicator[]> {
  const indicators: ThreatIndicator[] = [];
  
  try {
    const response = await fetch('https://otx.alienvault.com/api/v1/pulses/subscribed', {
      headers: { 'X-OTX-API-KEY': apiKey },
    });
    
    if (!response.ok) throw new Error(`OTX API error: ${response.status}`);
    
    const data = await response.json();
    
    for (const pulse of data.results?.slice(0, 100) || []) {
      for (const indicator of pulse.indicators || []) {
        indicators.push({
          type: mapOTXType(indicator.type),
          value: indicator.indicator,
          indicatorType: indicator.type,
          confidence: pulse.TLP === 'white' ? 0.7 : 0.9,
          severity: mapOTXSeverity(pulse.adversary || 'unknown'),
          source: `OTX Pulse: ${pulse.name}`,
          tags: pulse.tags || [],
          metadata: {
            pulse_id: pulse.id,
            created: pulse.created,
            adversary: pulse.adversary,
          },
        });
      }
    }
  } catch (error) {
    console.error('OTX feed collection error:', error);
  }
  
  return indicators;
}

export async function collectShodanFeed(apiKey: string, query: string = 'vuln'): Promise<ThreatIndicator[]> {
  const indicators: ThreatIndicator[] = [];
  
  try {
    const response = await fetch(
      `https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${query}`,
      { method: 'GET' }
    );
    
    if (!response.ok) throw new Error(`Shodan API error: ${response.status}`);
    
    const data = await response.json();
    
    for (const match of data.matches?.slice(0, 50) || []) {
      indicators.push({
        type: 'ip',
        value: match.ip_str,
        indicatorType: 'ipv4-addr',
        confidence: match.vulns ? 0.8 : 0.5,
        severity: match.vulns && Object.keys(match.vulns).length > 0 ? 'high' : 'medium',
        source: `Shodan: ${match.org || 'Unknown'}`,
        tags: match.tags || [],
        metadata: {
          port: match.port,
          org: match.org,
          hostnames: match.hostnames,
          vulns: match.vulns ? Object.keys(match.vulns) : [],
        },
      });
    }
  } catch (error) {
    console.error('Shodan feed collection error:', error);
  }
  
  return indicators;
}

export async function collectGreyNoiseFeed(apiKey: string): Promise<ThreatIndicator[]> {
  const indicators: ThreatIndicator[] = [];
  
  try {
    const response = await fetch('https://api.greynoise.io/v3/community/ips', {
      headers: { 'key': apiKey },
    });
    
    if (!response.ok) throw new Error(`GreyNoise API error: ${response.status}`);
    
    const data = await response.json();
    
    for (const item of data.ips?.slice(0, 100) || []) {
      if (item.classification === 'malicious') {
        indicators.push({
          type: 'ip',
          value: item.ip,
          indicatorType: 'ipv4-addr',
          confidence: 0.85,
          severity: 'high',
          source: `GreyNoise: ${item.name || 'Malicious IP'}`,
          tags: item.tags || [],
          metadata: {
            classification: item.classification,
            first_seen: item.first_seen,
            last_seen: item.last_seen,
            actor: item.actor,
          },
        });
      }
    }
  } catch (error) {
    console.error('GreyNoise feed collection error:', error);
  }
  
  return indicators;
}

export async function normalizeAndStoreIndicators(
  workspaceId: string,
  indicators: ThreatIndicator[],
  feedName: string
): Promise<number> {
  let stored = 0;
  
  for (const indicator of indicators) {
    const hash = createHash('sha256')
      .update(`${indicator.type}:${indicator.value}:${feedName}`)
      .digest('hex');
    
    try {
      // Upsert with merge on conflict
      const { error } = await supabase
        .from('threat_intel' as any)
        .upsert({
          workspace_id: workspaceId,
          type: indicator.type,
          value: indicator.value,
          indicator_type: indicator.indicatorType,
          confidence: indicator.confidence,
          severity: indicator.severity,
          source: indicator.source,
          source_feed: feedName,
          tags: indicator.tags || [],
          metadata: indicator.metadata || {},
          hash,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        }, {
          onConflict: 'workspace_id,hash',
          ignoreDuplicates: false,
        });
      
      if (!error) stored++;
    } catch (error) {
      console.error(`Failed to store indicator ${indicator.value}:`, error);
    }
  }
  
  return stored;
}

function mapOTXType(otxType: string): string {
  const mapping: Record<string, string> = {
    'IPv4': 'ip',
    'IPv6': 'ip',
    'domain': 'domain',
    'hostname': 'domain',
    'URL': 'url',
    'email': 'email',
    'FileHash-MD5': 'hash',
    'FileHash-SHA1': 'hash',
    'FileHash-SHA256': 'hash',
  };
  return mapping[otxType] || 'unknown';
}

function mapOTXSeverity(adversary: string): 'low' | 'medium' | 'high' | 'critical' {
  const lower = adversary.toLowerCase();
  if (lower.includes('apt') || lower.includes('nation')) return 'critical';
  if (lower.includes('ransomware') || lower.includes('trojan')) return 'high';
  if (lower.includes('malware') || lower.includes('botnet')) return 'medium';
  return 'low';
}
