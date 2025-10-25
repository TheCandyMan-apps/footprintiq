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
