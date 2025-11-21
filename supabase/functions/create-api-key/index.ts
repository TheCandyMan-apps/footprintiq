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

    const { name } = await req.json();
    if (!name?.trim()) {
      return new Response(JSON.stringify({ error: 'Name required' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Generate API key
    const keyBytes = crypto.getRandomValues(new Uint8Array(32));
    const keyHex = Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const apiKey = `fpiq_${keyHex}`;
    const keyPrefix = apiKey.slice(0, 12);

    // Hash the key for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store in DB
    const { data: keyRecord, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: name.trim(),
        key_prefix: keyPrefix,
        key_hash: keyHash,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ key: apiKey, id: keyRecord.id }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('create-api-key error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
