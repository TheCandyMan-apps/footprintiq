import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AuditLogSchema = z.object({
  action: z.string().min(1).max(100),
  resource_type: z.string().min(1).max(50),
  resource_id: z.string().max(255).optional(),
  metadata: z.record(z.any()).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limiting - 100 requests/hour for audit logging
    const rateLimitResult = await checkRateLimit(userId, 'user', 'dashboard-audit', {
      maxRequests: 100,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Input validation
    const body = await req.json();
    const validation = AuditLogSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { action, resource_type, resource_id, metadata } = validation.data;

    console.log(`[dashboard-audit] User ${userId} logging audit event`, { action, resource_type });

    const { error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type,
        resource_id,
        metadata,
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
    });
  } catch (error) {
    console.error('[dashboard-audit] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Audit log failed', message }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
