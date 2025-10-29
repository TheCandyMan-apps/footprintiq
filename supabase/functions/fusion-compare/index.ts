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
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { entityA, entityB } = await req.json();
    console.log('Comparing entities:', entityA, entityB);

    // Fetch vectors for both entities
    const { data: vectorsA } = await supabase
      .from('persona_vectors')
      .select('*')
      .eq('entity_id', entityA)
      .eq('user_id', user.id);

    const { data: vectorsB } = await supabase
      .from('persona_vectors')
      .select('*')
      .eq('entity_id', entityB)
      .eq('user_id', user.id);

    if (!vectorsA?.length || !vectorsB?.length) {
      return new Response(
        JSON.stringify({ error: 'Vectors not found for one or both entities' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch linguistic fingerprints
    const { data: fingerprintA } = await supabase
      .from('linguistic_fingerprints')
      .select('*')
      .eq('entity_id', entityA)
      .eq('user_id', user.id)
      .single();

    const { data: fingerprintB } = await supabase
      .from('linguistic_fingerprints')
      .select('*')
      .eq('entity_id', entityB)
      .eq('user_id', user.id)
      .single();

    // Calculate multi-modal similarity
    const scores: Record<string, number> = {};
    const rationale: string[] = [];

    // Text similarity (if available)
    const textVectorA = vectorsA.find(v => v.modality === 'text');
    const textVectorB = vectorsB.find(v => v.modality === 'text');
    
    if (textVectorA && textVectorB) {
      const textSim = cosineSimilarity(textVectorA.embeddings, textVectorB.embeddings);
      scores.text = textSim;
      if (textSim > 0.7) {
        rationale.push(`High text similarity (${(textSim * 100).toFixed(1)}%)`);
      }
    }

    // Linguistic similarity
    if (fingerprintA && fingerprintB) {
      const lingScore = compareLinguisticFeatures(fingerprintA.features, fingerprintB.features);
      scores.linguistic = lingScore;
      if (lingScore > 0.75) {
        rationale.push(`Strong linguistic patterns match (${(lingScore * 100).toFixed(1)}%)`);
      }
    }

    // Image similarity (if available)
    const imageVectorA = vectorsA.find(v => v.modality === 'image');
    const imageVectorB = vectorsB.find(v => v.modality === 'image');
    
    if (imageVectorA && imageVectorB) {
      const imageSim = cosineSimilarity(imageVectorA.embeddings, imageVectorB.embeddings);
      scores.image = imageSim;
      if (imageSim > 0.9) {
        rationale.push(`Avatar match (${(imageSim * 100).toFixed(1)}%)`);
      }
    }

    // Calculate fused score with weights
    const weights = {
      text: 0.4,
      linguistic: 0.3,
      image: 0.3
    };

    let fusedScore = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([key, value]) => {
      const weight = weights[key as keyof typeof weights] || 0.1;
      fusedScore += value * weight;
      totalWeight += weight;
    });

    if (totalWeight > 0) {
      fusedScore = fusedScore / totalWeight;
    }

    // Store prediction
    const { data: prediction, error: predError } = await supabase
      .from('link_predictions')
      .upsert({
        entity_a: entityA,
        entity_b: entityB,
        user_id: user.id,
        probability: fusedScore,
        rationale: rationale,
        status: fusedScore > 0.85 ? 'review' : 'pending'
      }, { onConflict: 'entity_a,entity_b,user_id' })
      .select()
      .single();

    if (predError) throw predError;

    // Store explanation
    await supabase.from('ai_explanations').insert({
      user_id: user.id,
      prediction_id: prediction.id,
      explanation: rationale.join('. '),
      weights: scores,
      model_version: 'fusion-v1.0',
      confidence: fusedScore
    });

    return new Response(
      JSON.stringify({
        probability: fusedScore,
        rationale,
        scores,
        predictionId: prediction.id,
        recommendation: fusedScore > 0.85 ? 'Likely same person' : 
                       fusedScore > 0.6 ? 'Possible match' : 
                       'Different entities'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Fusion compare error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function compareLinguisticFeatures(featuresA: any, featuresB: any): number {
  const keys = ['avg_word_length', 'avg_sentence_length', 'vocabulary_richness', 
                'exclamation_ratio', 'question_ratio', 'emoji_density'];
  
  let totalScore = 0;
  let count = 0;
  
  keys.forEach(key => {
    if (featuresA[key] !== undefined && featuresB[key] !== undefined) {
      const valA = featuresA[key];
      const valB = featuresB[key];
      const maxVal = Math.max(Math.abs(valA), Math.abs(valB), 0.0001);
      const diff = Math.abs(valA - valB);
      const similarity = 1 - (diff / maxVal);
      totalScore += Math.max(0, similarity);
      count++;
    }
  });
  
  return count > 0 ? totalScore / count : 0;
}
