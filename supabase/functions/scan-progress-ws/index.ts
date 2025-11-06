import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgradeHeader = req.headers.get('upgrade') || '';
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 400, headers: corsHeaders });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log('[WS] Client connected');
    socket.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established' }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WS] Received message:', data);

      if (data.type === 'subscribe' && data.scanId) {
        const scanId = data.scanId;
        console.log('[WS] Client subscribing to scan:', scanId);

        // Initialize Supabase client
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Subscribe to realtime channel for this scan
        const channel = supabase.channel(`scan_progress:${scanId}`);
        
        channel
          .on('broadcast', { event: 'provider_update' }, (payload) => {
            console.log('[WS] Broadcasting provider update:', payload);
            try {
              socket.send(JSON.stringify({
                type: 'provider_update',
                ...payload.payload
              }));
            } catch (error) {
              console.error('[WS] Error sending to client:', error);
            }
          })
          .subscribe((status) => {
            console.log('[WS] Channel subscription status:', status);
            if (status === 'SUBSCRIBED') {
              socket.send(JSON.stringify({
                type: 'subscribed',
                scanId,
                message: 'Subscribed to scan updates'
              }));
            }
          });

        // Clean up on socket close
        socket.addEventListener('close', () => {
          console.log('[WS] Client disconnected, cleaning up channel');
          supabase.removeChannel(channel);
        });
      }
    } catch (error) {
      console.error('[WS] Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  };

  socket.onerror = (error) => {
    console.error('[WS] WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('[WS] Client disconnected');
  };

  return response;
});
