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
