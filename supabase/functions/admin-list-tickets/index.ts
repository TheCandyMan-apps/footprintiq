import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { errorResponse, safeError } from '../_shared/errors.ts';
import { authenticateRequest } from '../_shared/auth-utils.ts';
import { rateLimitMiddleware } from '../_shared/enhanced-rate-limiter.ts';
import { validateInput } from '../_shared/security-validation.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authentication with admin check
    const authResult = await authenticateRequest(req, { requireAdmin: true });
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    const { userId, subscriptionTier, ipAddress } = authResult.context;

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: 'admin-list-tickets',
      userId,
      tier: subscriptionTier,
    });

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const category = url.searchParams.get('category');

    // Validate query parameters to prevent SQL injection
    if (status) {
      const validation = validateInput(status, { maxLength: 50, checkSQLInjection: true });
      if (!validation.valid) {
        return errorResponse(new Error('Invalid status parameter'), 400, 'INVALID_INPUT', corsHeaders);
      }
    }
    if (priority) {
      const validation = validateInput(priority, { maxLength: 50, checkSQLInjection: true });
      if (!validation.valid) {
        return errorResponse(new Error('Invalid priority parameter'), 400, 'INVALID_INPUT', corsHeaders);
      }
    }
    if (category) {
      const validation = validateInput(category, { maxLength: 100, checkSQLInjection: true });
      if (!validation.valid) {
        return errorResponse(new Error('Invalid category parameter'), 400, 'INVALID_INPUT', corsHeaders);
      }
    }

    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        profiles:user_id(email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);

    const { data: tickets, error: fetchError } = await query;

    if (fetchError) {
      console.error('[admin-list-tickets] Fetch error:', fetchError);
      return errorResponse(fetchError, 500, 'SERVER_ERROR', corsHeaders);
    }

    return new Response(JSON.stringify({ tickets }), {
      status: 200,
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
    });
  } catch (error) {
    const err = safeError(error);
    return errorResponse(error, 500, 'SERVER_ERROR', corsHeaders);
  }
});
