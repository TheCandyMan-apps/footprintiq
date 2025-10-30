import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Common validation schemas for edge functions
 */

export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email().max(254),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  username: z.string().trim().min(1).max(39).regex(/^[a-zA-Z0-9_-]+$/),
  url: z.string().url().max(2048),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  cacheKey: z.string().trim().min(1).max(255).regex(/^[a-zA-Z0-9:_-]+$/),
  cacheValue: z.unknown(),
  cacheTTL: z.number().int().min(1).max(86400), // 1 second to 1 day
};

export const AgentExecuteSchema = z.object({
  agentId: commonSchemas.uuid,
  workspaceId: commonSchemas.uuid.optional(),
});

export const CacheGetSchema = z.object({
  key: commonSchemas.cacheKey,
});

export const CacheSetSchema = z.object({
  key: commonSchemas.cacheKey,
  value: commonSchemas.cacheValue,
  type: z.enum(['query', 'report', 'analytics', 'other']).default('query'),
  ttl: commonSchemas.cacheTTL.default(3600),
});

export const IncidentCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  impact: z.string().max(1000).optional(),
  affected_services: z.array(z.string().max(100)).max(50).optional(),
  slack_thread_url: commonSchemas.url.optional(),
});

export const ExportDataSchema = z.object({
  scanId: commonSchemas.uuid.optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const GraphQuerySchema = z.object({
  query: z.string().trim().min(1).max(500),
  entityType: z.enum(['email', 'phone', 'username', 'domain', 'ip']).optional(),
  depth: z.number().int().min(1).max(3).default(2),
});

/**
 * Validates input and returns typed result or throws
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validates input and returns safe result with error
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
  };
}
