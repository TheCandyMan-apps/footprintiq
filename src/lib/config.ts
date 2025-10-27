import { z } from "zod";

/**
 * Client-side environment configuration with Zod validation
 * Only VITE_* variables are available in the browser
 */

const configSchema = z.object({
  supabase: z.object({
    url: z.string().url("Invalid Supabase URL"),
    publishableKey: z.string().min(1, "Supabase publishable key required"),
    projectId: z.string().min(1, "Supabase project ID required"),
  }),
  apify: z.object({
    apiToken: z.string().optional(),
    usernameActor: z.string().optional(),
  }),
  providers: z.object({
    allowDarkwebSources: z.boolean().default(false),
    allowEnterpriseEnrichment: z.boolean().default(false),
    maxConcurrency: z.number().int().positive().default(8),
    rateLimitPerMin: z.number().int().positive().default(30),
    globalTimeoutMs: z.number().int().positive().default(12000),
    defaultDailyQuota: z.number().int().positive().default(500),
    defaultMonthlyBudgetGBP: z.number().positive().default(50),
    hardFailAt95Pct: z.boolean().default(true),
  }),
  ai: z.object({
    enabled: z.boolean().default(true),
    ragMaxDocs: z.number().int().positive().default(40),
  }),
  monitoring: z.object({
    cronIntervalMin: z.number().int().positive().default(15),
    maxConcurrency: z.number().int().positive().default(6),
  }),
  alerts: z.object({
    webhookUrl: z.string().url().optional(),
  }),
  marketplace: z.object({
    reviewers: z.string().default(""),
    revenueSharePct: z.number().int().min(0).max(100).default(15),
    stripeConnectEnabled: z.boolean().default(false),
  }),
  slo: z.object({
    latencyP95Ms: z.number().int().positive().default(2500),
    errorRatePct: z.number().positive().max(100).default(1),
  }),
  status: z.object({
    publicBase: z.string().url().default("https://status.footprintiq.app"),
  }),
  backup: z.object({
    cronUtc: z.string().default("0 3 * * *"),
  }),
  secrets: z.object({
    rotationDays: z.number().int().positive().default(90),
  }),
});

type Config = z.infer<typeof configSchema>;

function validateConfig(): Config {
  const raw = {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    },
    apify: {
      apiToken: import.meta.env.VITE_APIFY_API_TOKEN,
      usernameActor: import.meta.env.VITE_APIFY_USERNAME_ACTOR,
    },
    providers: {
      allowDarkwebSources: import.meta.env.VITE_ALLOW_DARKWEB_SOURCES === "true",
      allowEnterpriseEnrichment: import.meta.env.VITE_ALLOW_ENTERPRISE_ENRICHMENT === "true",
      maxConcurrency: parseInt(import.meta.env.VITE_PROVIDER_MAX_CONCURRENCY || "8"),
      rateLimitPerMin: parseInt(import.meta.env.VITE_PROVIDER_RATE_LIMIT_PER_MIN || "30"),
      globalTimeoutMs: parseInt(import.meta.env.VITE_PROVIDER_GLOBAL_TIMEOUT_MS || "12000"),
      defaultDailyQuota: parseInt(import.meta.env.VITE_PROVIDER_DEFAULT_DAILY_QUOTA || "500"),
      defaultMonthlyBudgetGBP: parseFloat(import.meta.env.VITE_PROVIDER_DEFAULT_MONTHLY_BUDGET_GBP || "50"),
      hardFailAt95Pct: import.meta.env.VITE_PROVIDER_HARD_FAIL_AT_95PCT !== "false",
    },
    ai: {
      enabled: import.meta.env.VITE_AI_ANALYST_ENABLED !== "false",
      ragMaxDocs: parseInt(import.meta.env.VITE_RAG_MAX_DOCS || "40"),
    },
    monitoring: {
      cronIntervalMin: parseInt(import.meta.env.VITE_MONITOR_CRON_INTERVAL_MIN || "15"),
      maxConcurrency: parseInt(import.meta.env.VITE_MONITOR_MAX_CONCURRENCY || "6"),
    },
    alerts: {
      webhookUrl: import.meta.env.VITE_ALERT_WEBHOOK_URL,
    },
    marketplace: {
      reviewers: import.meta.env.VITE_MARKETPLACE_REVIEWERS || "",
      revenueSharePct: parseInt(import.meta.env.VITE_MARKETPLACE_REVENUE_SHARE_PCT || "15"),
      stripeConnectEnabled: import.meta.env.VITE_STRIPE_CONNECT_ENABLED === "true",
    },
    slo: {
      latencyP95Ms: parseInt(import.meta.env.VITE_SLO_LATENCY_P95_MS || "2500"),
      errorRatePct: parseFloat(import.meta.env.VITE_SLO_ERROR_RATE_PCT || "1"),
    },
    status: {
      publicBase: import.meta.env.VITE_STATUS_PUBLIC_BASE || "https://status.footprintiq.app",
    },
    backup: {
      cronUtc: import.meta.env.VITE_BACKUP_CRON_UTC || "0 3 * * *",
    },
    secrets: {
      rotationDays: parseInt(import.meta.env.VITE_SECRETS_ROTATION_DAYS || "90"),
    },
  };

  try {
    return configSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map((e) => e.path.join(".")).join(", ");
      throw new Error(
        `Configuration validation failed. Missing or invalid: ${missing}. Please check your .env file against .env.example`
      );
    }
    throw error;
  }
}

// Validate at module load time - fail fast
export const config = validateConfig();

// Re-export for convenience
export const supabaseConfig = config.supabase;
export const apifyConfig = config.apify;
export const providerConfig = config.providers;
export const aiConfig = config.ai;
export const monitoringConfig = config.monitoring;
export const alertsConfig = config.alerts;
export const marketplaceConfig = config.marketplace;
export const sloConfig = config.slo;
export const statusConfig = config.status;
export const backupConfig = config.backup;
export const secretsConfig = config.secrets;
