import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewRequest {
  plugin_id: string;
  decision: 'approved' | 'rejected';
  notes?: string;
  test_results?: Record<string, any>;
  security_scan?: Record<string, any>;
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

    // Check if user is admin/reviewer
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!role || role.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const review: ReviewRequest = await req.json();

    // Get plugin
    const { data: plugin, error: pluginError } = await supabase
      .from('plugins')
      .select('*')
      .eq('id', review.plugin_id)
      .single();

    if (pluginError || !plugin) {
      return new Response(
        JSON.stringify({ error: 'Plugin not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Create review record
    const { data: reviewRecord, error: reviewError } = await supabase
      .from('plugin_reviews')
      .insert({
        plugin_id: review.plugin_id,
        reviewer_id: user.id,
        decision: review.decision,
        notes: review.notes,
        test_results: review.test_results,
        security_scan: review.security_scan,
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Review insert error:', reviewError);
      return new Response(
        JSON.stringify({ error: reviewError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update plugin status
    const newStatus = review.decision === 'approved' ? 'approved' : 'rejected';
    const updates: any = {
      status: newStatus,
    };

    if (review.decision === 'approved') {
      updates.published_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('plugins')
      .update(updates)
      .eq('id', review.plugin_id);

    if (updateError) {
      console.error('Plugin update error:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Plugin reviewed:', review.plugin_id, newStatus);

    return new Response(
      JSON.stringify({ review: reviewRecord, status: newStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in plugin-review:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
