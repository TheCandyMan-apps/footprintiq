import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PluginSubmission {
  title: string;
  description?: string;
  version: string;
  entry_url: string;
  manifest: Record<string, any>;
  tags: string[];
  icon_url?: string;
  documentation_url?: string;
  support_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const submission: PluginSubmission = await req.json();

    // Validate manifest structure
    if (!submission.manifest.id || !submission.manifest.name || !submission.manifest.methods) {
      return new Response(
        JSON.stringify({ error: 'Invalid manifest structure' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get user profile for author name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', user.id)
      .single();

    const authorName = profile?.full_name || profile?.email || user.email || 'Anonymous';

    // Create plugin
    const { data: plugin, error: insertError } = await supabase
      .from('plugins')
      .insert({
        title: submission.title,
        description: submission.description,
        author_id: user.id,
        author_name: authorName,
        version: submission.version,
        entry_url: submission.entry_url,
        manifest: submission.manifest,
        tags: submission.tags,
        status: 'draft',
        icon_url: submission.icon_url,
        documentation_url: submission.documentation_url,
        support_url: submission.support_url,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Plugin insert error:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Plugin created:', plugin.id);

    return new Response(
      JSON.stringify({ plugin }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );
  } catch (error) {
    console.error('Error in plugin-submit:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
