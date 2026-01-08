/**
 * Single source of truth for provider credit costs
 */
export const PROVIDER_COSTS: Record<string, number> = {
  hibp: 1,
  dehashed: 3,
  intelx: 3,
  pipl: 4,
  hunter: 2,
  fullhunt: 2,
  clearbit: 2,
  fullcontact: 2,
  censys: 2,
  binaryedge: 2,
  shodan: 2,
  securitytrails: 2,
  otx: 1,
  virustotal: 2,
  abuseipdb: 1,
  urlscan: 1,
  googlecse: 1,
  darksearch: 2,
  gosearch: 2,
  apify: 5,
  "apify-social": 4,
  "apify-osint": 5,
  "apify-darkweb": 7,
  maigret: 2,
  sherlock: 1,
  holehe: 1,
  abstract_ipgeo: 1,
  abstract_company: 1,
  
  // Email intelligence (IPQS)
  ipqs_email: 2,
  
  // IP/URL/DarkWeb intelligence (IPQS)
  ipqs_ip: 1,
  ipqs_url: 1,
  ipqs_darkweb: 1,

  // Phone intelligence providers (higher cost due to premium APIs)
  abstract_phone: 2,
  ipqs_phone: 3,
  numverify: 2,
  twilio_lookup: 3,
  
  // Phone messaging presence
  whatsapp_check: 2,
  telegram_check: 2,
  signal_check: 1,
  
  // Phone OSINT presence
  phone_osint: 2,
  truecaller: 3,
  phone_reputation: 2,
  caller_hint: 3,
  
  // Perplexity AI (real-time web intelligence)
  perplexity_osint: 3,
};

/**
 * Get credit cost for a provider (default 1 if not in map)
 */
export function getProviderCost(provider: string): number {
  return PROVIDER_COSTS[provider] ?? 1;
}

// ========== Spend tracking (existing functionality) ==========

interface SpendRecord {
  calls: number;
  success: number;
  latencyMs: number[];
  cost: number;
  lastCall?: string;
}

const dailySpend = new Map<string, Map<string, SpendRecord>>();
const monthlySpend = new Map<string, Map<string, SpendRecord>>();

function getDayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getOrCreateRecord(map: Map<string, Map<string, SpendRecord>>, key: string, providerId: string): SpendRecord {
  if (!map.has(key)) {
    map.set(key, new Map());
  }
  const dayMap = map.get(key)!;
  if (!dayMap.has(providerId)) {
    dayMap.set(providerId, { calls: 0, success: 0, latencyMs: [], cost: 0 });
  }
  return dayMap.get(providerId)!;
}

export function recordCall(providerId: string, success: boolean, latencyMs: number, unitCost: number = 0): void {
  const dayKey = getDayKey();
  const monthKey = getMonthKey();
  
  const dailyRecord = getOrCreateRecord(dailySpend, dayKey, providerId);
  const monthlyRecord = getOrCreateRecord(monthlySpend, monthKey, providerId);
  
  for (const record of [dailyRecord, monthlyRecord]) {
    record.calls++;
    if (success) record.success++;
    record.latencyMs.push(latencyMs);
    record.cost += unitCost;
    record.lastCall = new Date().toISOString();
  }
}

export function getSpendSummary(providerId?: string): Record<string, any> {
  const dayKey = getDayKey();
  const monthKey = getMonthKey();
  
  const summary: Record<string, any> = {};
  
  const dayData = dailySpend.get(dayKey);
  const monthData = monthlySpend.get(monthKey);
  
  if (!providerId) {
    // Return all providers
    const allProviders = new Set([
      ...(dayData?.keys() || []),
      ...(monthData?.keys() || [])
    ]);
    
    for (const pid of allProviders) {
      const daily = dayData?.get(pid);
      const monthly = monthData?.get(pid);
      
      summary[pid] = {
        daily: formatRecord(daily),
        monthly: formatRecord(monthly),
      };
    }
  } else {
    // Return specific provider
    summary[providerId] = {
      daily: formatRecord(dayData?.get(providerId)),
      monthly: formatRecord(monthData?.get(providerId)),
    };
  }
  
  return summary;
}

function formatRecord(record?: SpendRecord) {
  if (!record) return { calls: 0, success: 0, errorPct: 0, p95: 0, cost: 0 };
  
  const errorPct = record.calls > 0 ? ((record.calls - record.success) / record.calls) * 100 : 0;
  const sorted = [...record.latencyMs].sort((a, b) => a - b);
  const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
  
  return {
    calls: record.calls,
    success: record.success,
    errorPct: Math.round(errorPct * 10) / 10,
    p95: Math.round(p95),
    cost: Math.round(record.cost * 100) / 100,
    lastCall: record.lastCall,
  };
}
