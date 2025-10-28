import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, eventType, eventId, payload, webhookId } = await req.json();

    if (action === 'trigger') {
      // Get active webhooks for this event type
      const { data: webhooks } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('is_active', true)
        .contains('events', [eventType]);

      if (!webhooks || webhooks.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No webhooks configured for this event' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Queue deliveries for each webhook
      const deliveries = webhooks.map(webhook => ({
        webhook_endpoint_id: webhook.id,
        event_type: eventType,
        event_id: eventId,
        payload: payload,
        status: 'pending',
      }));

      await supabase.from('webhook_deliveries').insert(deliveries);

      // Trigger immediate delivery attempts
      for (const webhook of webhooks) {
        await deliverWebhook(webhook, eventType, eventId, payload, supabase);
      }

      return new Response(
        JSON.stringify({ success: true, queued: webhooks.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'retry') {
      const { data: delivery } = await supabase
        .from('webhook_deliveries')
        .select('*, webhook_endpoints(*)')
        .eq('id', webhookId)
        .single();

      if (!delivery) {
        throw new Error('Delivery not found');
      }

      await deliverWebhook(
        delivery.webhook_endpoints,
        delivery.event_type,
        delivery.event_id,
        delivery.payload,
        supabase,
        delivery.attempt_number + 1
      );

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('[webhook-delivery] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function deliverWebhook(
  webhook: any,
  eventType: string,
  eventId: string,
  payload: any,
  supabase: any,
  attemptNumber: number = 1
) {
  const startTime = Date.now();
  const deliveryPayload = {
    event_type: eventType,
    event_id: eventId,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  // Generate signature
  const signature = await generateSignature(
    JSON.stringify(deliveryPayload),
    webhook.signing_secret
  );

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'User-Agent': 'FootprintIQ-Webhooks/1.0',
      },
      body: JSON.stringify(deliveryPayload),
    });

    const duration = Date.now() - startTime;
    const responseBody = await response.text();

    // Update delivery status
    await supabase
      .from('webhook_deliveries')
      .update({
        status: response.ok ? 'delivered' : 'failed',
        response_status: response.status,
        response_body: responseBody.substring(0, 1000),
        error_message: response.ok ? null : `HTTP ${response.status}`,
        delivered_at: response.ok ? new Date().toISOString() : null,
        duration_ms: duration,
        attempt_number: attemptNumber,
      })
      .eq('webhook_endpoint_id', webhook.id)
      .eq('event_id', eventId);

    // Update webhook stats
    if (response.ok) {
      await supabase
        .from('webhook_endpoints')
        .update({
          last_triggered_at: new Date().toISOString(),
          success_count: webhook.success_count + 1,
        })
        .eq('id', webhook.id);
    } else {
      await supabase
        .from('webhook_endpoints')
        .update({
          failure_count: webhook.failure_count + 1,
        })
        .eq('id', webhook.id);

      // Schedule retry if not exhausted
      const maxAttempts = webhook.retry_config?.max_attempts || 3;
      if (attemptNumber < maxAttempts) {
        const backoffMultiplier = webhook.retry_config?.backoff_multiplier || 2;
        const nextRetryMs = Math.pow(backoffMultiplier, attemptNumber) * 60000; // Minutes
        const nextRetryAt = new Date(Date.now() + nextRetryMs);

        await supabase
          .from('webhook_deliveries')
          .update({ next_retry_at: nextRetryAt.toISOString() })
          .eq('webhook_endpoint_id', webhook.id)
          .eq('event_id', eventId);
      }
    }

    console.log(`[webhook-delivery] Delivered to ${webhook.url}: ${response.status}`);

  } catch (error) {
    const duration = Date.now() - startTime;
    
    await supabase
      .from('webhook_deliveries')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: duration,
        attempt_number: attemptNumber,
      })
      .eq('webhook_endpoint_id', webhook.id)
      .eq('event_id', eventId);

    await supabase
      .from('webhook_endpoints')
      .update({
        failure_count: webhook.failure_count + 1,
      })
      .eq('id', webhook.id);

    console.error(`[webhook-delivery] Failed to deliver to ${webhook.url}:`, error);
  }
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}