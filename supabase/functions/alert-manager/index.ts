import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRule {
  id: string;
  workspace_id: string;
  name: string;
  rule_type: 'threshold' | 'anomaly' | 'trend' | 'composite';
  metric_type: string;
  metric_target: string;
  condition: any;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  notification_channels: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, ...params } = await req.json();

    switch (action) {
      case 'evaluate_rules':
        return await evaluateRules(supabaseClient);
      
      case 'acknowledge_alert':
        return await acknowledgeAlert(supabaseClient, params);
      
      case 'resolve_alert':
        return await resolveAlert(supabaseClient, params);
      
      case 'send_test_notification':
        return await sendTestNotification(supabaseClient, params);
      
      case 'train_anomaly_baseline':
        return await trainAnomalyBaseline(supabaseClient, params);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

async function evaluateRules(supabase: any) {
  // Get all enabled rules that need evaluation
  const { data: rules, error: rulesError } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('is_enabled', true)
    .or(`last_evaluated_at.is.null,last_evaluated_at.lt.${new Date(Date.now() - 60000).toISOString()}`);

  if (rulesError) throw rulesError;

  const results = [];

  for (const rule of rules || []) {
    try {
      const shouldAlert = await evaluateRule(supabase, rule);
      
      if (shouldAlert) {
        await fireAlert(supabase, rule);
        results.push({ rule_id: rule.id, status: 'fired' });
      } else {
        results.push({ rule_id: rule.id, status: 'ok' });
      }

      // Update last evaluated timestamp
      await supabase
        .from('alert_rules')
        .update({ last_evaluated_at: new Date().toISOString() })
        .eq('id', rule.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.push({ rule_id: rule.id, status: 'error', error: message });
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function evaluateRule(supabase: any, rule: AlertRule): Promise<boolean> {
  const { metric_type, metric_target, condition, rule_type } = rule;

  if (rule_type === 'threshold') {
    return await evaluateThresholdRule(supabase, rule);
  } else if (rule_type === 'anomaly') {
    return await evaluateAnomalyRule(supabase, rule);
  } else if (rule_type === 'trend') {
    return await evaluateTrendRule(supabase, rule);
  }

  return false;
}

async function evaluateThresholdRule(supabase: any, rule: AlertRule): Promise<boolean> {
  const { metric_type, metric_target, condition } = rule;
  
  let currentValue: number;

  // Fetch current metric value based on type
  if (metric_type === 'slo') {
    const { data } = await supabase
      .from('slo_compliance')
      .select('success_rate')
      .eq('slo_id', metric_target)
      .order('period_start', { ascending: false })
      .limit(1)
      .single();
    
    currentValue = data?.success_rate || 100;
  } else if (metric_type === 'cost') {
    const { data } = await supabase
      .from('provider_costs')
      .select('total_cost_gbp')
      .eq('provider_id', metric_target)
      .gte('period_start', new Date(Date.now() - 86400000).toISOString())
      .limit(1)
      .single();
    
    currentValue = data?.total_cost_gbp || 0;
  } else if (metric_type === 'error_rate') {
    const { data } = await supabase
      .from('provider_metrics')
      .select('error_rate')
      .eq('provider_id', metric_target)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    currentValue = data?.error_rate || 0;
  } else {
    return false;
  }

  // Evaluate condition
  const { operator, threshold } = condition;
  
  switch (operator) {
    case 'gt': return currentValue > threshold;
    case 'gte': return currentValue >= threshold;
    case 'lt': return currentValue < threshold;
    case 'lte': return currentValue <= threshold;
    case 'eq': return currentValue === threshold;
    default: return false;
  }
}

async function evaluateAnomalyRule(supabase: any, rule: AlertRule): Promise<boolean> {
  const { metric_type, metric_target } = rule;

  // Get baseline
  const { data: baseline } = await supabase
    .from('anomaly_baselines')
    .select('*')
    .eq('metric_type', metric_type)
    .eq('metric_target', metric_target)
    .eq('workspace_id', rule.workspace_id)
    .single();

  if (!baseline) return false;

  // Get current value (simplified)
  const { data: metrics } = await supabase
    .from('provider_metrics')
    .select('latency_avg')
    .eq('provider_id', metric_target)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (!metrics) return false;

  const currentValue = metrics.latency_avg;
  const zScore = Math.abs((currentValue - baseline.mean_value) / baseline.std_dev);

  return zScore > baseline.sigma_threshold;
}

async function evaluateTrendRule(supabase: any, rule: AlertRule): Promise<boolean> {
  // Simplified trend detection - check if metric is consistently increasing/decreasing
  const { metric_type, metric_target, condition } = rule;
  
  const { data: recentMetrics } = await supabase
    .from('provider_metrics')
    .select('latency_avg, timestamp')
    .eq('provider_id', metric_target)
    .order('timestamp', { ascending: false })
    .limit(10);

  if (!recentMetrics || recentMetrics.length < 5) return false;

  const values = recentMetrics.map((m: any) => m.latency_avg);
  let increasing = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i-1] < values[i]) increasing++;
  }

  const trend_pct = increasing / (values.length - 1);
  
  return condition.direction === 'increasing' ? trend_pct > 0.7 : trend_pct < 0.3;
}

async function fireAlert(supabase: any, rule: AlertRule) {
  // Check if alert already firing
  const { data: existing } = await supabase
    .from('active_alerts')
    .select('id')
    .eq('alert_rule_id', rule.id)
    .eq('status', 'firing')
    .single();

  if (existing) return; // Already firing

  // Create new alert
  const alert = {
    alert_rule_id: rule.id,
    workspace_id: rule.workspace_id,
    severity: rule.severity,
    title: rule.name,
    message: `Alert: ${rule.name} triggered`,
    status: 'firing',
  };

  const { data: newAlert, error } = await supabase
    .from('active_alerts')
    .insert(alert)
    .select()
    .single();

  if (error) throw error;

  // Update rule last triggered
  await supabase
    .from('alert_rules')
    .update({ last_triggered_at: new Date().toISOString() })
    .eq('id', rule.id);

  // Send notifications
  await sendNotifications(supabase, rule, newAlert);

  // Add to history
  await supabase
    .from('alert_history')
    .insert({
      alert_rule_id: rule.id,
      workspace_id: rule.workspace_id,
      severity: rule.severity,
      title: rule.name,
      message: alert.message,
      fired_at: new Date().toISOString(),
    });
}

async function sendNotifications(supabase: any, rule: AlertRule, alert: any) {
  const channelIds = rule.notification_channels || [];

  for (const channelId of channelIds) {
    const { data: channel } = await supabase
      .from('notification_channels')
      .select('*')
      .eq('id', channelId)
      .eq('is_enabled', true)
      .single();

    if (!channel) continue;

    try {
      if (channel.channel_type === 'webhook') {
        await sendWebhookNotification(channel.config, alert);
      } else if (channel.channel_type === 'email') {
        await sendEmailNotification(supabase, channel.config, alert);
      }

      await supabase
        .from('notification_channels')
        .update({ 
          last_used_at: new Date().toISOString(),
          success_count: channel.success_count + 1
        })
        .eq('id', channelId);
    } catch (error) {
      await supabase
        .from('notification_channels')
        .update({ failure_count: channel.failure_count + 1 })
        .eq('id', channelId);
    }
  }
}

async function sendWebhookNotification(config: any, alert: any) {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({
      alert_id: alert.id,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      fired_at: alert.fired_at,
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.statusText}`);
  }
}

async function sendEmailNotification(supabase: any, config: any, alert: any) {
  // Use Supabase edge function to send email
  const { error } = await supabase.functions.invoke('send-support-email', {
    body: {
      to: config.email,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      message: alert.message,
    }
  });

  if (error) throw error;
}

async function acknowledgeAlert(supabase: any, params: any) {
  const { alert_id } = params;

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('active_alerts')
    .update({
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: user.id,
    })
    .eq('id', alert_id);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function resolveAlert(supabase: any, params: any) {
  const { alert_id } = params;

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('active_alerts')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq('id', alert_id);

  if (error) throw error;

  // Update history
  const { data: alert } = await supabase
    .from('active_alerts')
    .select('*')
    .eq('id', alert_id)
    .single();

  if (alert) {
    const duration = Math.floor((new Date(alert.resolved_at).getTime() - new Date(alert.fired_at).getTime()) / 60000);
    
    await supabase
      .from('alert_history')
      .update({
        resolved_at: alert.resolved_at,
        duration_minutes: duration,
        acknowledged: alert.status === 'acknowledged',
      })
      .eq('alert_rule_id', alert.alert_rule_id)
      .eq('fired_at', alert.fired_at);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendTestNotification(supabase: any, params: any) {
  const { channel_id } = params;

  const { data: channel } = await supabase
    .from('notification_channels')
    .select('*')
    .eq('id', channel_id)
    .single();

  if (!channel) throw new Error('Channel not found');

  const testAlert = {
    id: 'test',
    severity: 'info',
    title: 'Test Alert',
    message: 'This is a test notification from FootprintIQ',
    fired_at: new Date().toISOString(),
  };

  if (channel.channel_type === 'webhook') {
    await sendWebhookNotification(channel.config, testAlert);
  } else if (channel.channel_type === 'email') {
    await sendEmailNotification(supabase, channel.config, testAlert);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function trainAnomalyBaseline(supabase: any, params: any) {
  const { workspace_id, metric_type, metric_target } = params;

  // Get historical data (last 30 days)
  const { data: metrics } = await supabase
    .from('provider_metrics')
    .select('latency_avg')
    .eq('provider_id', metric_target)
    .gte('timestamp', new Date(Date.now() - 30 * 86400000).toISOString());

  if (!metrics || metrics.length < 100) {
    throw new Error('Insufficient data for training');
  }

  const values = metrics.map((m: any) => m.latency_avg);
  
  // Calculate statistics
  const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
  const variance = values.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / values.length;
  const std_dev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Upsert baseline
  const { error } = await supabase
    .from('anomaly_baselines')
    .upsert({
      workspace_id,
      metric_type,
      metric_target,
      mean_value: mean,
      std_dev,
      min_value: min,
      max_value: max,
      sample_count: values.length,
      last_trained_at: new Date().toISOString(),
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ 
      success: true,
      baseline: { mean, std_dev, min, max, sample_count: values.length }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}