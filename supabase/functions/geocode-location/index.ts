import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const { latitude, longitude, bounds } = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENCAGE_API_KEY');
    if (!apiKey) {
      console.error('OPENCAGE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    // Build OpenCage API URL
    const params = new URLSearchParams({
      q: `${latitude},${longitude}`,
      key: apiKey,
      add_request: JSON.stringify({
        name: 'Robin Clifford',
        org: 'Footprint IQ',
        email: 'admin@footprintiq.app'
      }),
      pretty: '1',
      no_annotations: '0'
    });

    // Add bounds for high-precision mode
    if (bounds) {
      params.append('bounds', bounds);
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?${params.toString()}`;

    console.log('Calling OpenCage API for:', { latitude, longitude, bounds });

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('OpenCage API error:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Geocoding failed', 
          details: data.status?.message || 'Unknown error' 
        }),
        { status: response.status, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    if (!data.results || data.results.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No results found',
          fallback: 'Location data unavailable—check provider'
        }),
        { status: 404, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    const result = data.results[0];
    const components = result.components;

    // Extract relevant location information
    const locationData = {
      formatted: result.formatted,
      address: {
        road: components.road,
        city: components.city || components.town || components.village,
        state: components.state,
        postcode: components.postcode,
        country: components.country,
        country_code: components.country_code?.toUpperCase()
      },
      region: determineRegion(components.country_code),
      continent: components.continent,
      coordinates: {
        lat: result.geometry.lat,
        lng: result.geometry.lng
      },
      timezone: result.annotations?.timezone,
      currency: result.annotations?.currency,
      confidence: result.confidence
    };

    console.log('Geocoding successful:', locationData);

    return new Response(
      JSON.stringify(locationData),
      { 
        status: 200, 
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        fallback: 'Location data unavailable—check provider',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' } 
      }
    );
  }
});

function determineRegion(countryCode: string | undefined): string {
  if (!countryCode) return 'Unknown';

  const countryCodeUpper = countryCode.toUpperCase();

  // US
  if (countryCodeUpper === 'US') return 'US';

  // EU countries
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  if (euCountries.includes(countryCodeUpper)) return 'EU';

  // Asia-Pacific
  const asiaPacificCountries = [
    'CN', 'JP', 'KR', 'IN', 'ID', 'TH', 'VN', 'PH', 'MY', 'SG',
    'AU', 'NZ', 'TW', 'HK', 'PK', 'BD', 'MM', 'KH', 'LA', 'MN',
    'NP', 'LK', 'BN', 'TL', 'FJ', 'PG', 'WS', 'TO', 'VU', 'SB'
  ];
  if (asiaPacificCountries.includes(countryCodeUpper)) return 'Asia-Pacific';

  return 'Other';
}
