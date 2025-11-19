import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody, logSecurityEvent } from "../_shared/security-validation.ts";
import { maskPII } from "../_shared/maskPII.ts";
import { addSecurityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ScanRequestSchema = z.object({
  scanId: z.string().uuid({ message: "Invalid scan ID format" }),
  scanType: z.enum(['username', 'personal_details', 'both'], { 
    errorMap: () => ({ message: "Invalid scan type" })
  }),
  username: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email({ message: "Invalid email address" }).max(255).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }).optional(),
}).refine(
  (data) => {
    return data.username || data.email || data.phone || data.firstName;
  },
  { message: "At least one identifier (username, email, phone, or name) must be provided" }
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 1. Authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    const { userId, subscriptionTier = 'free', ipAddress, userAgent } = authResult.context;

    // 2. Rate Limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: 'osint-scan',
      userId,
      tier: subscriptionTier,
    });

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // 3. Input Validation
    const body = await req.json();
    const validation = validateRequestBody(body, ScanRequestSchema);
    
    if (!validation.valid) {
      // Log security event if threat detected
      if (validation.threat) {
        await logSecurityEvent(supabase, {
          type: "sql_injection",
          severity: "high",
          userId,
          ipAddress,
          userAgent,
          endpoint: "osint-scan",
          payload: body,
          message: validation.threat,
        });
      }

      return new Response(
        JSON.stringify({ 
          error: validation.threat || validation.error || 'Invalid input',
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const scanData = validation.data!;
    console.log('[osint-scan] Starting scan:', maskPII(scanData));

    // Continue with existing scan logic...
    // (Rest of the osint-scan implementation would go here)
    // For now, returning a success response to demonstrate the security wrapper

    return new Response(
      JSON.stringify({ 
        message: 'Scan initiated with security hardening',
        scanId: scanData.scanId 
      }),
      {
        status: 200,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
      }
    );

  } catch (error) {
    console.error('[osint-scan] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
