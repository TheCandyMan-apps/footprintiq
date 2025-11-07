import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeResult {
  ip: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  formatted?: string;
  provider: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ip } = await req.json();
    
    if (!ip) {
      throw new Error("IP address is required");
    }

    const opencageKey = Deno.env.get('OPENCAGE_API_KEY');
    const abstractKey = Deno.env.get('ABSTRACTAPI_IP_GEOLOCATION_KEY');

    let result: GeocodeResult | null = null;

    // Try OpenCage first
    if (opencageKey) {
      try {
        console.log(`Geocoding ${ip} with OpenCage...`);
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(ip)}&key=${opencageKey}&no_annotations=1`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const location = data.results[0];
            result = {
              ip,
              lat: location.geometry.lat,
              lng: location.geometry.lng,
              city: location.components.city || location.components.town,
              country: location.components.country,
              formatted: location.formatted,
              provider: 'opencage'
            };
            console.log('OpenCage geocoding successful');
          }
        }
      } catch (error) {
        console.error('OpenCage error:', error);
      }
    }

    // Fallback to AbstractAPI
    if (!result && abstractKey) {
      try {
        console.log(`Falling back to AbstractAPI for ${ip}...`);
        const response = await fetch(
          `https://ipgeolocation.abstractapi.com/v1/?api_key=${abstractKey}&ip_address=${ip}`
        );

        if (response.ok) {
          const data = await response.json();
          result = {
            ip,
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            city: data.city,
            country: data.country,
            formatted: `${data.city}, ${data.country}`,
            provider: 'abstractapi'
          };
          console.log('AbstractAPI geocoding successful');
        }
      } catch (error) {
        console.error('AbstractAPI error:', error);
      }
    }

    if (!result) {
      throw new Error('Geocoding failed with all providers');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in geocode-ip:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
