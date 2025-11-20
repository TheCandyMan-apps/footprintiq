import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FindingSchema = z.object({
  site: z.string().min(1).max(200),
  url: z.string().url().optional(),
  status: z.string().min(1).max(50),
  confidence: z.number().min(0).max(1).optional(),
  rawData: z.any().optional(),
});

const SnapshotRequestSchema = z.object({
  username: z.string().min(1).max(100),
  workspaceId: z.string().uuid(),
  scanId: z.string().uuid().optional(),
  findings: z.array(FindingSchema).min(1).max(100),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limiting (60 snapshots/hour)
    const rateLimitResult = await checkRateLimit(userId, 'user', 'maigret-store-snapshot', {
      maxRequests: 60,
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

    // Input validation
    const body = await req.json();
    const validation = SnapshotRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const { username, workspaceId, scanId, findings } = validation.data;
    console.log(`📸 Storing snapshot for user ${userId}, username: ${username}, findings: ${findings.length}`);

    // Store each finding as a snapshot
    const snapshots = findings.map(finding => ({
      username,
      site: finding.site,
      url: finding.url || null,
      status: finding.status,
      confidence: finding.confidence || null,
      raw_data: finding.rawData || null,
      scan_id: scanId || null,
      workspace_id: workspaceId,
    }));

    const { data, error } = await supabase
      .from('maigret_profile_snapshots')
      .insert(snapshots)
      .select();

    if (error) {
      console.error('❌ Error storing snapshots:', error);
      throw error;
    }

    console.log(`✅ Stored ${data.length} snapshots`);

    return new Response(
      JSON.stringify({
        success: true,
        snapshotsStored: data.length,
        snapshots: data,
      }),
      {
        status: 200,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      }
    );
  } catch (error: any) {
    console.error('❌ Error in maigret-store-snapshot:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      }
    );
  }
});
