import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { entityId, scanId, modality = 'text' } = await req.json();
    console.log('Building fusion vectors for entity:', entityId);

    // Fetch entity data from various sources
    const { data: findings } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .eq('entity_type', 'username');

    const { data: profiles } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('scan_id', scanId);

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
      return new Response(
        JSON.stringify({ error: 'Insufficient text data for embeddings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        user_id: user.id,
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
        user_id: user.id,
        features: linguisticFeatures,
        model_version: 'v1.0',
        confidence: 0.8
      }, { onConflict: 'entity_id,user_id' });

    if (fingerprintError) throw fingerprintError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        vectorId: vectorData.id,
        dimensions: embeddings.length,
        features: linguisticFeatures
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Fusion builder error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
