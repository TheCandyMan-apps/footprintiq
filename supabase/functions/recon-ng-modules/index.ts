import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    const WORKER_URL = Deno.env.get('RECON_NG_WORKER_URL') || 'http://localhost:8080';
    const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN');

    console.log(`[ReconNG Modules] Action: ${action}`);

    // Handle different actions
    switch (action) {
      case 'list': {
        // List marketplace modules
        const response = await fetch(`${WORKER_URL}/modules/marketplace`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}`);
        }

        const data = await response.json();
        
        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'installed': {
        // List installed modules
        const response = await fetch(`${WORKER_URL}/modules/installed`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}`);
        }

        const data = await response.json();
        
        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'install': {
        const { module } = await req.json();

        if (!module) {
          throw new Error('Module name is required');
        }

        console.log(`[ReconNG Modules] Installing module: ${module}`);

        const response = await fetch(`${WORKER_URL}/modules/install`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WORKER_TOKEN}`,
          },
          body: JSON.stringify({ module }),
        });

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        const { module } = await req.json();

        if (!module) {
          throw new Error('Module name is required');
        }

        console.log(`[ReconNG Modules] Updating module: ${module}`);

        const response = await fetch(`${WORKER_URL}/modules/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WORKER_TOKEN}`,
          },
          body: JSON.stringify({ module }),
        });

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'info': {
        const { module } = await req.json();

        if (!module) {
          throw new Error('Module name is required');
        }

        const response = await fetch(`${WORKER_URL}/modules/info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ module }),
        });

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}`);
        }

        const data = await response.json();

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('[ReconNG Modules] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
