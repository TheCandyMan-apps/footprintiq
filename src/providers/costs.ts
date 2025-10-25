interface SpendRecord {
  calls: number;
  successCalls: number;
  failedCalls: number;
  totalLatencyMs: number;
  totalCost: number;
  lastCall: number;
}

const dailySpend = new Map<string, SpendRecord>();
const monthlySpend = new Map<string, SpendRecord>();

const DEFAULT_DAILY_QUOTA = parseInt(import.meta.env.VITE_PROVIDER_DEFAULT_DAILY_QUOTA || "500");
const DEFAULT_MONTHLY_BUDGET_GBP = parseFloat(import.meta.env.VITE_PROVIDER_DEFAULT_MONTHLY_BUDGET_GBP || "50");
const HARD_FAIL_AT_95PCT = import.meta.env.VITE_PROVIDER_HARD_FAIL_AT_95PCT !== "false";

// Per-provider overrides (TODO: load from admin UI / backend)
const providerQuotas = new Map<string, number>();
const providerBudgets = new Map<string, number>();

function getDayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getOrCreateRecord(map: Map<string, SpendRecord>, key: string): SpendRecord {
  let record = map.get(key);
  if (!record) {
    record = {
      calls: 0,
      successCalls: 0,
      failedCalls: 0,
      totalLatencyMs: 0,
      totalCost: 0,
      lastCall: 0,
    };
    map.set(key, record);
  }
  return record;
}

export async function checkSpend(
  providerId: string,
  unitCost: number
): Promise<{ allowed: boolean; reason?: string }> {
  const dayKey = `${getDayKey()}:${providerId}`;
  const monthKey = `${getMonthKey()}:${providerId}`;
  
  const dailyRecord = getOrCreateRecord(dailySpend, dayKey);
  const monthlyRecord = getOrCreateRecord(monthlySpend, monthKey);
  
  const quota = providerQuotas.get(providerId) || DEFAULT_DAILY_QUOTA;
  const budget = providerBudgets.get(providerId) || DEFAULT_MONTHLY_BUDGET_GBP;
  
  // Check daily quota (soft warn at 80%, hard fail at 95%)
  const quotaUsagePct = (dailyRecord.calls / quota) * 100;
  if (quotaUsagePct >= 80) {
    console.warn(`[costs] ${providerId} daily quota at ${quotaUsagePct.toFixed(1)}% (${dailyRecord.calls}/${quota})`);
  }
  
  if (HARD_FAIL_AT_95PCT && quotaUsagePct >= 95) {
    return {
      allowed: false,
      reason: `Daily quota exceeded (${dailyRecord.calls}/${quota})`,
    };
  }
  
  // Check monthly budget (soft warn at 80%, hard fail at 95%)
  const budgetUsagePct = (monthlyRecord.totalCost / budget) * 100;
  if (budgetUsagePct >= 80) {
    console.warn(`[costs] ${providerId} monthly budget at ${budgetUsagePct.toFixed(1)}% (£${monthlyRecord.totalCost.toFixed(2)}/£${budget})`);
  }
  
  if (HARD_FAIL_AT_95PCT && budgetUsagePct >= 95) {
    return {
      allowed: false,
      reason: `Monthly budget exceeded (£${monthlyRecord.totalCost.toFixed(2)}/£${budget})`,
    };
  }
  
  return { allowed: true };
}

export async function recordCall(
  providerId: string,
  success: boolean,
  latencyMs: number,
  unitCost: number = 0.001
): Promise<void> {
  const dayKey = `${getDayKey()}:${providerId}`;
  const monthKey = `${getMonthKey()}:${providerId}`;
  
  const dailyRecord = getOrCreateRecord(dailySpend, dayKey);
  const monthlyRecord = getOrCreateRecord(monthlySpend, monthKey);
  
  dailyRecord.calls += 1;
  dailyRecord.totalLatencyMs += latencyMs;
  dailyRecord.lastCall = Date.now();
  
  monthlyRecord.calls += 1;
  monthlyRecord.totalLatencyMs += latencyMs;
  monthlyRecord.lastCall = Date.now();
  
  if (success) {
    dailyRecord.successCalls += 1;
    dailyRecord.totalCost += unitCost;
    monthlyRecord.successCalls += 1;
    monthlyRecord.totalCost += unitCost;
  } else {
    dailyRecord.failedCalls += 1;
    monthlyRecord.failedCalls += 1;
  }
}

export function getSpendSummary(providerId?: string): Record<string, any> {
  const summary: Record<string, any> = {};
  
  const processMap = (map: Map<string, SpendRecord>, period: string) => {
    map.forEach((record, key) => {
      if (providerId && !key.includes(providerId)) return;
      
      const [timeKey, pid] = key.split(":");
      if (!summary[pid]) {
        summary[pid] = { daily: {}, monthly: {} };
      }
      
      const periodData = {
        calls: record.calls,
        successRate: record.calls > 0 ? (record.successCalls / record.calls * 100).toFixed(1) + "%" : "0%",
        avgLatencyMs: record.calls > 0 ? Math.round(record.totalLatencyMs / record.calls) : 0,
        totalCost: record.totalCost.toFixed(4),
        lastCall: record.lastCall ? new Date(record.lastCall).toISOString() : null,
      };
      
      if (period === "daily") {
        summary[pid].daily[timeKey] = periodData;
      } else {
        summary[pid].monthly[timeKey] = periodData;
      }
    });
  };
  
  processMap(dailySpend, "daily");
  processMap(monthlySpend, "monthly");
  
  return summary;
}

export function setProviderQuota(providerId: string, quota: number): void {
  providerQuotas.set(providerId, quota);
  console.log(`[costs] Set quota for ${providerId}: ${quota} calls/day`);
}

export function setProviderBudget(providerId: string, budgetGBP: number): void {
  providerBudgets.set(providerId, budgetGBP);
  console.log(`[costs] Set budget for ${providerId}: £${budgetGBP}/month`);
}
