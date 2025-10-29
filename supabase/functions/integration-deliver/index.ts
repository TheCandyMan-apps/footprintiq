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
    const { connectorId, event } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch connector config
    const { data: connector, error: connectorError } = await supabase
      .from('integration_connectors')
      .select('*')
      .eq('id', connectorId)
      .single();

    if (connectorError || !connector) {
      throw new Error('Connector not found');
    }

    if (!connector.enabled) {
      throw new Error('Connector is disabled');
    }

    // Create event log
    const { data: eventLog, error: eventError } = await supabase
      .from('integration_events')
      .insert({
        connector_id: connectorId,
        event_type: event.event,
        entity_id: event.entity_id,
        payload: event,
        status: 'pending',
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating event log:', eventError);
    }

    const startTime = Date.now();
    let deliveryResult: any;

    try {
      // Route to appropriate integration
      switch (connector.connector_type) {
        case 'slack':
          deliveryResult = await deliverToSlack(connector.config, event);
          break;
        case 'teams':
          deliveryResult = await deliverToTeams(connector.config, event);
          break;
        case 'email':
          deliveryResult = await deliverToEmail(connector.config, event);
          break;
        case 'misp':
          deliveryResult = await deliverToMISP(connector.config, event);
          break;
        case 'elastic':
          deliveryResult = await deliverToElastic(connector.config, event);
          break;
        case 'splunk':
          deliveryResult = await deliverToSplunk(connector.config, event);
          break;
        case 'thehive':
          deliveryResult = await deliverToTheHive(connector.config, event);
          break;
        default:
          throw new Error(`Unsupported connector type: ${connector.connector_type}`);
      }

      const latency = Date.now() - startTime;

      // Update connector status
      await supabase
        .from('integration_connectors')
        .update({
          last_delivery_at: new Date().toISOString(),
          last_delivery_status: 'success',
          latency_ms: latency,
        })
        .eq('id', connectorId);

      // Update event log
      if (eventLog) {
        await supabase
          .from('integration_events')
          .update({
            status: 'sent',
            delivered_at: new Date().toISOString(),
          })
          .eq('id', eventLog.id);
      }

      return new Response(
        JSON.stringify({ success: true, latency }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (deliveryError) {
      const latency = Date.now() - startTime;
      const errorMessage = deliveryError instanceof Error ? deliveryError.message : 'Unknown error';

      // Update connector status
      await supabase
        .from('integration_connectors')
        .update({
          last_delivery_at: new Date().toISOString(),
          last_delivery_status: 'failed',
          latency_ms: latency,
        })
        .eq('id', connectorId);

      // Update event log
      if (eventLog) {
        await supabase
          .from('integration_events')
          .update({
            status: 'failed',
            error_message: errorMessage,
            attempts: eventLog.attempts + 1,
          })
          .eq('id', eventLog.id);
      }

      throw deliveryError;
    }

  } catch (error) {
    console.error('Error in integration-deliver:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function deliverToSlack(config: any, event: any) {
  const { webhook_url } = config;
  if (!webhook_url) throw new Error('Slack webhook URL not configured');

  const blocks: any[] = [
    {
      type: "header",
      text: { type: "plain_text", text: event.summary || event.event }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Severity:* ${event.severity || 'N/A'}` },
        { type: "mrkdwn", text: `*Entity:* ${event.entity_id || 'N/A'}` }
      ]
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: event.summary || 'No summary available' }
    }
  ];

  if (event.link) {
    blocks.push({
      type: "actions",
      elements: [{
        type: "button",
        text: { type: "plain_text", text: "View Details" },
        url: event.link
      }]
    });
  }

  const message = {
    text: `*${event.event}*`,
    blocks
  };

  const response = await fetch(webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Slack delivery failed: ${response.statusText}`);
  }

  return { success: true };
}

async function deliverToTeams(config: any, event: any) {
  const { webhook_url } = config;
  if (!webhook_url) throw new Error('Teams webhook URL not configured');

  const message = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    "summary": event.summary || event.event,
    "themeColor": event.severity === 'critical' ? 'FF0000' : event.severity === 'high' ? 'FFA500' : '0078D7',
    "title": event.event,
    "sections": [{
      "activityTitle": event.summary || 'New Alert',
      "facts": [
        { "name": "Severity", "value": event.severity || 'N/A' },
        { "name": "Entity", "value": event.entity_id || 'N/A' }
      ],
      "text": event.summary || 'No details available'
    }],
    "potentialAction": event.link ? [{
      "@type": "OpenUri",
      "name": "View Details",
      "targets": [{ "os": "default", "uri": event.link }]
    }] : []
  };

  const response = await fetch(webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Teams delivery failed: ${response.statusText}`);
  }

  return { success: true };
}

async function deliverToEmail(config: any, event: any) {
  const { to_addresses } = config;
  if (!to_addresses) throw new Error('Email addresses not configured');

  // Would integrate with Resend or similar email service
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) throw new Error('RESEND_API_KEY not configured');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'alerts@footprintiq.com',
      to: Array.isArray(to_addresses) ? to_addresses : [to_addresses],
      subject: `[${event.severity?.toUpperCase() || 'ALERT'}] ${event.summary || event.event}`,
      html: `
        <h2>${event.event}</h2>
        <p><strong>Severity:</strong> ${event.severity || 'N/A'}</p>
        <p><strong>Entity:</strong> ${event.entity_id || 'N/A'}</p>
        <p>${event.summary || 'No details available'}</p>
        ${event.link ? `<p><a href="${event.link}">View Details</a></p>` : ''}
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed: ${response.statusText}`);
  }

  return { success: true };
}

async function deliverToMISP(config: any, event: any) {
  const { url, api_key } = config;
  if (!url || !api_key) throw new Error('MISP URL or API key not configured');

  const mispEvent = {
    Event: {
      info: event.summary || event.event,
      threat_level_id: event.severity === 'critical' ? 1 : event.severity === 'high' ? 2 : 3,
      analysis: 0,
      distribution: 0,
      Attribute: []
    }
  };

  const response = await fetch(`${url}/events/add`, {
    method: 'POST',
    headers: {
      'Authorization': api_key,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(mispEvent),
  });

  if (!response.ok) {
    throw new Error(`MISP delivery failed: ${response.statusText}`);
  }

  return { success: true };
}

async function deliverToElastic(config: any, event: any) {
  const { url, api_key, index } = config;
  if (!url || !api_key) throw new Error('Elasticsearch URL or API key not configured');

  const indexName = index || 'footprintiq-alerts';
  const document = {
    ...event,
    '@timestamp': new Date().toISOString(),
    source: 'footprintiq',
  };

  const response = await fetch(`${url}/${indexName}/_doc`, {
    method: 'POST',
    headers: {
      'Authorization': `ApiKey ${api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    throw new Error(`Elasticsearch delivery failed: ${response.statusText}`);
  }

  return { success: true };
}

async function deliverToSplunk(config: any, event: any) {
  const { url, token } = config;
  if (!url || !token) throw new Error('Splunk URL or token not configured');

  const splunkEvent = {
    event: {
      ...event,
      source: 'footprintiq',
    },
    time: Math.floor(Date.now() / 1000),
  };

  const response = await fetch(`${url}/services/collector/event`, {
    method: 'POST',
    headers: {
      'Authorization': `Splunk ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(splunkEvent),
  });

  if (!response.ok) {
    throw new Error(`Splunk delivery failed: ${response.statusText}`);
  }

  return { success: true };
}

async function deliverToTheHive(config: any, event: any) {
  const { url, api_key } = config;
  if (!url || !api_key) throw new Error('TheHive URL or API key not configured');

  const alert = {
    title: event.summary || event.event,
    description: event.summary || 'Alert from FootprintIQ',
    severity: event.severity === 'critical' ? 3 : event.severity === 'high' ? 2 : 1,
    source: 'footprintiq',
    sourceRef: event.entity_id || `event-${Date.now()}`,
    type: 'external',
  };

  const response = await fetch(`${url}/api/alert`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(alert),
  });

  if (!response.ok) {
    throw new Error(`TheHive delivery failed: ${response.statusText}`);
  }

  return { success: true };
}