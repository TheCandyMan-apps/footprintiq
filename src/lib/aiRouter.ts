import { supabase } from "@/integrations/supabase/client";

type Model = "gemini" | "gpt" | "grok";

interface AIResponse {
  content: string;
  modelUsed: Model;
}

/**
 * Secure AI router that calls backend edge function
 * NEVER exposes API keys to the client
 */
export async function getAIResponse({
  systemPrompt,
  userPrompt,
  preferredModel,
}: {
  systemPrompt: string;
  userPrompt: string;
  preferredModel?: Model;
}): Promise<AIResponse> {
  try {
    // Get user's preferred model from database if not specified
    let modelToUse = preferredModel;
    
    if (!modelToUse) {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('ai_preferred_model')
        .single();
      
      modelToUse = (prefs?.ai_preferred_model as Model) || 'gemini';
    }

    // Call secure edge function (API keys stored server-side)
    const { data, error } = await supabase.functions.invoke('ai-router', {
      body: {
        systemPrompt,
        userPrompt,
        preferredModel: modelToUse,
      },
    });

    if (error) throw error;
    
    return {
      content: data.content,
      modelUsed: data.modelUsed,
    };
  } catch (error) {
    console.error('AI Router Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

/**
 * Update user's preferred AI model
 */
export async function updatePreferredModel(model: Model): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      ai_preferred_model: model,
    });

  if (error) throw error;
}

/**
 * Get user's preferred AI model
 */
export async function getPreferredModel(): Promise<Model> {
  const { data } = await supabase
    .from('user_preferences')
    .select('ai_preferred_model')
    .single();

  return (data?.ai_preferred_model as Model) || 'gemini';
}
