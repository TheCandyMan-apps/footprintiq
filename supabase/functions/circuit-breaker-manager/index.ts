import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CircuitBreakerAction {
  action: 'check' | 'record_success' | 'record_failure' | 'manual_reset' | 'get_health';
  provider_id: string;
  error_message?: string;
  latency_ms?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Internal authentication check
    const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN');
    const authHeader = req.headers.get('x-internal-token');
    
    if (!authHeader || authHeader !== WORKER_TOKEN) {
      console.warn('Unauthorized access attempt to circuit-breaker-manager');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Valid internal token required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, provider_id, error_message, latency_ms }: CircuitBreakerAction = await req.json();

    if (!provider_id) {
      return new Response(
        JSON.stringify({ error: 'provider_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get current circuit breaker state
    const { data: cbState, error: cbError } = await supabaseAdmin
      .from('circuit_breaker_states')
      .select('*')
      .eq('provider_id', provider_id)
      .single();

    if (cbError && cbError.code !== 'PGRST116') {
      console.error('Error fetching circuit breaker state:', cbError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch circuit breaker state' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Initialize if doesn't exist
    if (!cbState) {
      await supabaseAdmin
        .from('circuit_breaker_states')
        .insert({
          provider_id,
          state: 'closed',
          failure_threshold: 5,
          success_threshold: 2,
        });
    }

    const state = cbState || { state: 'closed', failure_count: 0, success_count: 0 };

    if (action === 'check') {
      // Check if circuit allows call
      const now = new Date();
      
      if (state.state === 'open') {
        const nextAttempt = state.next_attempt_at ? new Date(state.next_attempt_at) : now;
        
        if (now < nextAttempt) {
          // Still in cooldown
          await recordEvent(supabaseAdmin, provider_id, 'call_blocked', state.state, state.state);
          await supabaseAdmin
            .from('circuit_breaker_states')
            .update({ total_calls_blocked: (state.total_calls_blocked || 0) + 1 })
            .eq('provider_id', provider_id);
          
          return new Response(
            JSON.stringify({ 
              allowed: false, 
              state: 'open',
              reason: 'Circuit breaker is open',
              next_attempt_at: nextAttempt.toISOString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } else {
          // Cooldown expired, transition to half-open
          await transitionState(supabaseAdmin, provider_id, state, 'half_open');
          return new Response(
            JSON.stringify({ allowed: true, state: 'half_open' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      } else if (state.state === 'half_open') {
        // Allow limited calls in half-open state
        return new Response(
          JSON.stringify({ allowed: true, state: 'half_open' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Circuit is closed, allow call
      return new Response(
        JSON.stringify({ allowed: true, state: 'closed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'record_success') {
      await handleSuccess(supabaseAdmin, provider_id, state, latency_ms);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'record_failure') {
      await handleFailure(supabaseAdmin, provider_id, state, error_message);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'manual_reset') {
      await transitionState(supabaseAdmin, provider_id, state, 'closed', true);
      return new Response(
        JSON.stringify({ success: true, message: 'Circuit breaker manually reset' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'get_health') {
      const { data: health } = await supabaseAdmin
        .from('provider_health')
        .select('*')
        .eq('provider_id', provider_id)
        .single();
      
      return new Response(
        JSON.stringify({ health: health || null, circuit_breaker: state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Error in circuit-breaker-manager:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function handleSuccess(supabase: any, providerId: string, state: any, latencyMs?: number) {
  const newSuccessCount = (state.success_count || 0) + 1;
  
  await recordEvent(supabase, providerId, 'call_success', state.state, state.state, newSuccessCount);
  
  const updates: any = {
    success_count: newSuccessCount,
    failure_count: 0,
    last_success_at: new Date().toISOString(),
  };

  if (state.state === 'half_open' && newSuccessCount >= state.success_threshold) {
    // Transition to closed
    updates.state = 'closed';
    updates.success_count = 0;
    await recordEvent(supabase, providerId, 'reset', state.state, 'closed');
  }

  await supabase
    .from('circuit_breaker_states')
    .update(updates)
    .eq('provider_id', providerId);

  // Update health
  await updateProviderHealth(supabase, providerId, true, latencyMs);
}

async function handleFailure(supabase: any, providerId: string, state: any, errorMessage?: string) {
  const newFailureCount = (state.failure_count || 0) + 1;
  
  await recordEvent(supabase, providerId, 'call_failure', state.state, state.state, undefined, newFailureCount, errorMessage);
  
  const updates: any = {
    failure_count: newFailureCount,
    success_count: 0,
    last_failure_at: new Date().toISOString(),
  };

  if (state.state === 'half_open' || (state.state === 'closed' && newFailureCount >= state.failure_threshold)) {
    // Trip the circuit
    const cooldownMs = state.cooldown_period_ms || 60000;
    updates.state = 'open';
    updates.opened_at = new Date().toISOString();
    updates.next_attempt_at = new Date(Date.now() + cooldownMs).toISOString();
    updates.total_trips = (state.total_trips || 0) + 1;
    updates.failure_count = 0;
    
    await recordEvent(supabase, providerId, 'trip', state.state, 'open', undefined, newFailureCount);
  }

  await supabase
    .from('circuit_breaker_states')
    .update(updates)
    .eq('provider_id', providerId);

  // Update health
  await updateProviderHealth(supabase, providerId, false);
}

async function transitionState(supabase: any, providerId: string, state: any, newState: string, manual = false) {
  const updates: any = {
    state: newState,
    failure_count: 0,
    success_count: 0,
  };

  if (newState === 'half_open') {
    updates.half_opened_at = new Date().toISOString();
  } else if (newState === 'closed') {
    updates.opened_at = null;
    updates.half_opened_at = null;
    updates.next_attempt_at = null;
  }

  await supabase
    .from('circuit_breaker_states')
    .update(updates)
    .eq('provider_id', providerId);

  await recordEvent(supabase, providerId, manual ? 'reset' : 'half_open', state.state, newState);
}

async function recordEvent(
  supabase: any, 
  providerId: string, 
  eventType: string, 
  previousState: string, 
  newState: string,
  successCount?: number,
  failureCount?: number,
  errorMessage?: string
) {
  await supabase
    .from('circuit_breaker_events')
    .insert({
      provider_id: providerId,
      event_type: eventType,
      previous_state: previousState,
      new_state: newState,
      success_count: successCount,
      failure_count: failureCount,
      error_message: errorMessage,
    });
}

async function updateProviderHealth(supabase: any, providerId: string, isSuccess: boolean, latencyMs?: number) {
  const { data: health } = await supabase
    .from('provider_health')
    .select('*')
    .eq('provider_id', providerId)
    .single();

  if (!health) {
    await supabase
      .from('provider_health')
      .insert({
        provider_id: providerId,
        health_score: isSuccess ? 100 : 80,
        is_healthy: isSuccess,
        recent_error_count: isSuccess ? 0 : 1,
      });
    return;
  }

  // Calculate new health score (simple algorithm)
  let newScore = health.health_score || 100;
  if (isSuccess) {
    newScore = Math.min(100, newScore + 2);
  } else {
    newScore = Math.max(0, newScore - 10);
  }

  const updates: any = {
    health_score: newScore,
    is_healthy: newScore >= 70,
    is_degraded: newScore < 70 && newScore >= 40,
    is_critical: newScore < 40,
    recent_error_count: isSuccess ? 0 : (health.recent_error_count || 0) + 1,
    last_checked_at: new Date().toISOString(),
  };

  if (latencyMs) {
    updates.recent_avg_latency_ms = latencyMs;
  }

  await supabase
    .from('provider_health')
    .update(updates)
    .eq('provider_id', providerId);
}
