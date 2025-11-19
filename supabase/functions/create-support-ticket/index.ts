import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { errorResponse, safeError } from '../_shared/errors.ts';
import { authenticateRequest } from '../_shared/auth-utils.ts';
import { rateLimitMiddleware } from '../_shared/enhanced-rate-limiter.ts';
import { validateRequestBody, sanitizeString } from '../_shared/security-validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TicketSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  category: z.enum(['technical', 'billing', 'feature_request', 'bug_report', 'other']).default('technical'),
  workspace_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authentication with new auth utils
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    const { userId, subscriptionTier, ipAddress } = authResult.context;

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: 'create-support-ticket',
      userId,
      tier: subscriptionTier,
    });

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Input validation
    const body = await req.json();
    const validation = validateRequestBody(body, TicketSchema);

    if (!validation.valid) {
      if (validation.threat) {
        await supabase.from("security_events").insert({
          event_type: "xss",
          severity: "high",
          user_id: userId,
          ip_address: ipAddress,
          endpoint: "create-support-ticket",
          message: validation.threat,
          payload: body,
        });
      }
      return errorResponse(new Error(validation.error || 'Invalid input'), 400, 'INVALID_INPUT', corsHeaders);
    }

    const { subject, description, category, workspace_id } = validation.data!;

    // Sanitize HTML content
    const sanitizedSubject = sanitizeString(subject, 200);
    const sanitizedDescription = sanitizeString(description, 5000);

    // Create ticket
    const { data: ticket, error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        workspace_id: workspace_id || null,
        user_id: userId,
        created_by: userId,
        subject: sanitizedSubject,
        description: sanitizedDescription,
        category,
        status: 'new',
        priority: 'medium',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[create-support-ticket] Insert error:', insertError);
      return errorResponse(insertError, 500, 'SERVER_ERROR', corsHeaders);
    }

    console.log(`[create-support-ticket] Created ticket ${ticket.id} for user ${userId}`);

    return new Response(JSON.stringify({ ticket }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = safeError(error);
    return errorResponse(error, 500, 'SERVER_ERROR', corsHeaders);
  }
});
