import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Free Trial emails have been removed from FootprintIQ.
// This endpoint returns 410 Gone to surface a clear error to any stale callers.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[send-trial-email] Called — Trial email sending is no longer supported.');

  return new Response(
    JSON.stringify({ error: 'Trial email sending is no longer available.' }),
    {
      status: 410,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
