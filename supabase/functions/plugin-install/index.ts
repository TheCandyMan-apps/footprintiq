import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InstallRequest {
  plugin_id: string;
  workspace_id: string;
  config?: Record<string, any>;
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

    const install: InstallRequest = await req.json();

    // Verify plugin exists and is approved
    const { data: plugin, error: pluginError } = await supabase
      .from('plugins')
      .select('*')
      .eq('id', install.plugin_id)
      .eq('status', 'approved')
      .single();

    if (pluginError || !plugin) {
      return new Response(
        JSON.stringify({ error: 'Plugin not found or not approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Install or update plugin
    const { data: installation, error: installError } = await supabase
      .from('plugin_installs')
      .upsert({
        workspace_id: install.workspace_id,
        plugin_id: install.plugin_id,
        user_id: user.id,
        enabled: true,
        config: install.config || {},
      }, {
        onConflict: 'workspace_id,plugin_id',
      })
      .select()
      .single();

    if (installError) {
      console.error('Plugin install error:', installError);
      return new Response(
        JSON.stringify({ error: installError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Plugin installed:', install.plugin_id, 'workspace:', install.workspace_id);

    return new Response(
      JSON.stringify({ installation, plugin }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in plugin-install:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
