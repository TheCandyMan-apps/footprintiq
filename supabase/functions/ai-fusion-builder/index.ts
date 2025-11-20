import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateAuth } from "../_shared/auth-utils.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { addSecurityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FusionRequestSchema = z.object({
  entityId: z.string().uuid(),
  scanId: z.string().uuid(),
  modality: z.enum(['text', 'image', 'audio']).optional().default('text'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limiting (5 requests/hour - expensive operation)
    const rateLimitResult = await checkRateLimit(userId, 'user', 'ai-fusion-builder', {
      maxRequests: 5,
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
    const validation = FusionRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { entityId, scanId, modality } = validation.data;
    console.log(`[ai-fusion-builder] User ${userId} building fusion vectors for entity: ${entityId}`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch entity data from various sources  
    const { data: findings } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .eq('user_id', userId)
      .eq('entity_type', 'username');

    const { data: profiles } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('scan_id', scanId)
      .eq('user_id', userId);

    // Extract text features
    const textFeatures: string[] = [];
    if (profiles) {
      profiles.forEach(p => {
        if (p.bio) textFeatures.push(p.bio);
        if (p.description) textFeatures.push(p.description);
      });
    }
    if (findings) {
      findings.forEach(f => {
        if (f.description) textFeatures.push(f.description);
        if (f.evidence?.value) textFeatures.push(String(f.evidence.value));
      });
    }

    const combinedText = textFeatures.filter(t => t && t.length > 10).join(' ');

    if (!combinedText || combinedText.length < 20) {
      console.warn(`[ai-fusion-builder] Insufficient text data for entity ${entityId}`);
      return new Response(
        JSON.stringify({ error: 'Insufficient text data for embeddings' }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Generate embeddings via Lovable AI
    console.log('Generating embeddings for text length:', combinedText.length);
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: combinedText.substring(0, 8000), // Limit to 8k chars
        model: 'text-embedding-3-small',
      }),
    });

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      console.error('Embedding API error:', embeddingResponse.status, errText);
      throw new Error(`Embedding generation failed: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embeddings = embeddingData.data[0].embedding;

    // Store vector
    const { data: vectorData, error: vectorError } = await supabase
      .from('persona_vectors')
      .upsert({
        entity_id: entityId,
        user_id: userId,
        embeddings,
        modality,
        source: scanId,
        confidence: 0.85,
        metadata: {
          text_length: combinedText.length,
          profile_count: profiles?.length || 0,
          finding_count: findings?.length || 0
        }
      }, { onConflict: 'entity_id,user_id,modality' })
      .select()
      .single();

    if (vectorError) throw vectorError;

    // Extract linguistic fingerprint
    const linguisticFeatures = extractLinguisticFeatures(combinedText);
    
    const { error: fingerprintError } = await supabase
      .from('linguistic_fingerprints')
      .upsert({
        entity_id: entityId,
        user_id: userId,
        features: linguisticFeatures,
        model_version: 'v1.0',
        confidence: 0.8
      }, { onConflict: 'entity_id,user_id' });

    if (fingerprintError) throw fingerprintError;

    console.log(`[ai-fusion-builder] Successfully built fusion vectors for entity ${entityId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        vectorId: vectorData.id,
        dimensions: embeddings.length,
        features: linguisticFeatures
      }),
      { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );

  } catch (error: any) {
    console.error('[ai-fusion-builder] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});

function extractLinguisticFeatures(text: string) {
  const words = text.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // N-gram analysis
  const bigrams = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${words[i]} ${words[i+1]}`);
  }

  // Stylometric features
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const avgSentenceLength = words.length / sentences.length;
  const vocabularySize = new Set(words).size;
  const vocabularyRichness = vocabularySize / words.length;
  
  // Punctuation analysis
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const commas = (text.match(/,/g) || []).length;

  // Emoji detection
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojis = text.match(emojiRegex) || [];
  const emojiDensity = emojis.length / words.length;

  return {
    avg_word_length: avgWordLength,
    avg_sentence_length: avgSentenceLength,
    vocabulary_richness: vocabularyRichness,
    exclamation_ratio: exclamations / sentences.length,
    question_ratio: questions / sentences.length,
    comma_ratio: commas / sentences.length,
    emoji_density: emojiDensity,
    unique_bigrams: bigrams.size,
    total_words: words.length
  };
}
