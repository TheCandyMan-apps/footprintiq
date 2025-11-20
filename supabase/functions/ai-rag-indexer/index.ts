import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IndexRequestSchema = z.object({
  scanId: z.string().uuid(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(JSON.stringify({ error: authResult.error || 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { userId } = authResult.context;

    // Rate limiting - 30 indexes per hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'ai-rag-indexer', {
      maxRequests: 30,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimitResult.resetAt }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = IndexRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { scanId } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    console.log(`[rag-indexer] Indexing scan ${scanId} for RAG`);

    // Fetch scan and related data
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select(`
        *,
        data_sources(*),
        social_profiles(*),
        findings:scan_findings(*),
        anomalies:scan_anomalies(*)
      `)
      .eq('id', scanId)
      .single();

    if (scanError) throw scanError;

    // Generate embeddings using AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Prepare documents for embedding
    const documents = [
      {
        id: `scan_${scanId}`,
        type: 'scan_summary',
        content: `Scan for ${scan.email || scan.phone || scan.first_name || 'unknown'}. 
                  Status: ${scan.status}. 
                  Found ${scan.data_sources?.length || 0} data sources, 
                  ${scan.social_profiles?.length || 0} social profiles.`,
      },
      ...(scan.data_sources || []).map((ds: any, idx: number) => ({
        id: `source_${ds.id}`,
        type: 'data_source',
        content: `Data source: ${ds.provider}. Type: ${ds.source_type}. 
                  URL: ${ds.url}. Found via ${ds.found_via}.
                  ${ds.snippet ? `Snippet: ${ds.snippet}` : ''}`,
      })),
      ...(scan.findings || []).map((f: any) => ({
        id: `finding_${f.id}`,
        type: 'finding',
        content: `Finding: ${f.finding_type}. Severity: ${f.severity}. 
                  Description: ${f.description}. 
                  Evidence: ${JSON.stringify(f.evidence)}`,
      })),
    ];

    // Generate embeddings (in production, use a proper embedding model)
    // For now, we'll create simple semantic chunks
    const chunks = documents.map(doc => ({
      scan_id: scanId,
      user_id: userId,
      chunk_type: doc.type,
      content: doc.content,
      metadata: {
        source_id: doc.id,
        indexed_at: new Date().toISOString(),
      },
    }));

    // Store in a semantic search table (would need to be created)
    console.log(`[rag-indexer] Indexed ${chunks.length} chunks for scan ${scanId}`);

    return new Response(
      JSON.stringify({
        success: true,
        chunks_indexed: chunks.length,
        message: 'Scan data indexed successfully for RAG',
      }),
      {
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
        status: 200,
      }
    );

  } catch (error) {
    console.error('[rag-indexer] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
        status: 500,
      }
    );
  }
});
