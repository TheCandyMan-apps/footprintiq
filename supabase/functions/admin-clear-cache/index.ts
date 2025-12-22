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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { cacheType = 'phone', pattern } = body;

    // Build the delete query
    let query = supabase.from('cache_entries').delete();

    if (pattern) {
      // Delete by specific pattern (e.g., phone number)
      query = query.ilike('cache_key', `%${pattern}%`);
    } else if (cacheType === 'phone') {
      // Delete all phone-related cache entries
      query = query.or('cache_key.ilike.%phone%,cache_type.eq.phone_scan');
    } else if (cacheType === 'all') {
      // Delete all cache entries
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    } else {
      query = query.eq('cache_type', cacheType);
    }

    const { data: deleted, error: deleteError, count } = await query.select('id');

    if (deleteError) {
      console.error('Cache clear error:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to clear cache', details: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const deletedCount = deleted?.length || 0;
    console.log(`Admin ${user.email} cleared ${deletedCount} cache entries (type: ${cacheType}, pattern: ${pattern || 'none'})`);

    return new Response(JSON.stringify({
      success: true,
      cleared: deletedCount,
      cacheType,
      pattern: pattern || null,
      clearedBy: user.email,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin clear cache error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
