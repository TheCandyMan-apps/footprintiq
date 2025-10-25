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
