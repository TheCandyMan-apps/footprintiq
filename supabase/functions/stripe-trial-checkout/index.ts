import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Free Trial has been removed from FootprintIQ.
// This endpoint returns 410 Gone to surface a clear error to any stale callers.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log('[stripe-trial-checkout] Called — Free trials are no longer available.');

  return new Response(
    JSON.stringify({ error: 'Free trials are no longer available. Please upgrade directly to Pro.' }),
    {
      status: 410,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
