import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { keyId } = await req.json();
    if (!keyId) {
      return new Response(JSON.stringify({ error: 'keyId required' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Verify ownership
    const { data: key } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('id', keyId)
      .single();

    if (!key || key.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Key not found or unauthorized' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Revoke
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq('id', keyId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('revoke-api-key error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
