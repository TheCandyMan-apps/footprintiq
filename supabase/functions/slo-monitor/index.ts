import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SLOCheck {
  slo_id: string;
  name: string;
  slo_type: string;
  target_value: number;
  measurement_window: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting SLO monitoring check');

    // Fetch active SLO definitions
    const { data: slos, error: sloError } = await supabaseAdmin
      .from('slo_definitions')
      .select('*')
      .eq('is_active', true);

    if (sloError || !slos) {
      console.error('Failed to fetch SLOs:', sloError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch SLOs' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Checking ${slos.length} SLOs`);

    const violations: any[] = [];

    for (const slo of slos) {
      let measuredValue = 0;
      let isViolation = false;

      // Simulate metric collection based on SLO type
      if (slo.slo_type === 'latency') {
        // Get recent latency metrics (simulated)
        measuredValue = 1200 + Math.random() * 2000; // Simulate p95 latency
        isViolation = measuredValue > slo.target_value;
      } else if (slo.slo_type === 'error_rate') {
        // Get recent error rate (simulated)
        measuredValue = Math.random() * 2; // 0-2% error rate
        isViolation = measuredValue > slo.target_value;
      } else if (slo.slo_type === 'availability') {
        // Get availability (simulated)
        measuredValue = 99.5 + Math.random() * 0.6; // 99.5-100.1%
        isViolation = measuredValue < slo.target_value;
      } else if (slo.slo_type === 'custom') {
        // Custom checks (e.g., circuit breakers)
        measuredValue = Math.floor(Math.random() * 3); // 0-2 stuck breakers
        isViolation = measuredValue > slo.target_value;
      }

      // Insert measurement
      const { error: measurementError } = await supabaseAdmin
        .from('slo_measurements')
        .insert({
          slo_id: slo.id,
          measured_value: measuredValue,
          is_violation: isViolation,
          metadata: {
            slo_name: slo.name,
            slo_type: slo.slo_type,
            target_value: slo.target_value,
          },
        });

      if (measurementError) {
        console.error(`Failed to insert measurement for ${slo.name}:`, measurementError);
      }

      if (isViolation) {
        violations.push({
          slo_name: slo.name,
          measured_value: measuredValue,
          target_value: slo.target_value,
          severity: slo.severity,
        });

        // Check if we should trigger an alert
        await checkAndTriggerAlert(supabaseAdmin, slo, measuredValue);
      }

      console.log(`${slo.name}: ${measuredValue.toFixed(2)} (target: ${slo.target_value}) - ${isViolation ? 'VIOLATION' : 'OK'}`);
    }

    console.log(`SLO check complete. ${violations.length} violations found.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        slos_checked: slos.length,
        violations: violations.length,
        violation_details: violations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in slo-monitor:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function checkAndTriggerAlert(supabase: any, slo: any, measuredValue: number) {
  // Check for sustained violations over measurement window
  const windowMinutes = parseInt(slo.measurement_window.replace(/[^0-9]/g, '')) || 15;
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const { data: recentMeasurements } = await supabase
    .from('slo_measurements')
    .select('is_violation')
    .eq('slo_id', slo.id)
    .gte('measured_at', windowStart.toISOString());

  if (!recentMeasurements || recentMeasurements.length < 2) {
    return; // Not enough data
  }

  const violationCount = recentMeasurements.filter((m: any) => m.is_violation).length;
  const violationRate = violationCount / recentMeasurements.length;

  // Trigger alert if >50% of recent measurements are violations
  if (violationRate > 0.5) {
    const { data: existingAlert } = await supabase
      .from('alert_events')
      .select('id')
      .eq('title', `SLO Violation: ${slo.name}`)
      .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .maybeSingle();

    if (!existingAlert) {
      await supabase
        .from('alert_events')
        .insert({
          severity: slo.severity,
          title: `SLO Violation: ${slo.name}`,
          message: `${slo.name} has been in violation for ${windowMinutes} minutes. Current value: ${measuredValue.toFixed(2)}, Target: ${slo.target_value}`,
          metadata: {
            slo_id: slo.id,
            slo_name: slo.name,
            measured_value: measuredValue,
            target_value: slo.target_value,
            violation_rate: violationRate,
          },
        });

      console.log(`Alert triggered for ${slo.name}`);
    }
  }
}
