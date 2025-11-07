import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'missing_auth' }),
        { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    const { ip_address } = await req.json();

    if (!ip_address) {
      return new Response(
        JSON.stringify({ error: 'ip_address_required' }),
        { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: cached, error: cacheError } = await supabaseService
      .from('ip_geocode_cache')
      .select('*')
      .eq('ip_address', ip_address)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached && !cacheError) {
      console.log(`[ip-geocode] Cache hit for ${ip_address}`);
      return new Response(
        JSON.stringify(cached),
        { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    // Call Abstract API
    const apiKey = Deno.env.get('ABSTRACTAPI_IP_GEOLOCATION_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'api_not_configured' }),
        { status: 503, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    const apiUrl = `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}&ip_address=${ip_address}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Structure the result
    const result = {
      ip_address,
      country: data.country,
      country_code: data.country_code,
      region: data.region,
      city: data.city,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      isp: data.connection?.isp_name || null,
      timezone: data.timezone?.name || null,
      metadata: {
        continent: data.continent,
        postal_code: data.postal_code,
        flag: data.flag,
        currency: data.currency,
        languages: data.security?.languages || []
      },
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Cache the result
    await supabaseService
      .from('ip_geocode_cache')
      .upsert(result, { onConflict: 'ip_address' });

    console.log(`[ip-geocode] Geocoded ${ip_address}: ${result.city}, ${result.country}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ip-geocode] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'geocode_failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );
  }
});
