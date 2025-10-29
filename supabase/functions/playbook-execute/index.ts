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
    const { playbookId, triggerData } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch playbook
    const { data: playbook, error: playbookError } = await supabase
      .from('playbooks')
      .select('*')
      .eq('id', playbookId)
      .single();

    if (playbookError || !playbook) {
      throw new Error('Playbook not found');
    }

    if (!playbook.enabled) {
      throw new Error('Playbook is disabled');
    }

    const definition = playbook.definition as any;
    const steps = definition.steps || [];

    // Create run record
    const { data: run, error: runError } = await supabase
      .from('playbook_runs')
      .insert({
        playbook_id: playbookId,
        triggered_by: user.id,
        trigger_data: triggerData || {},
        status: 'running',
        steps_total: steps.length,
      })
      .select()
      .single();

    if (runError) {
      throw new Error('Failed to create playbook run');
    }

    const executionLog: any[] = [];
    let stepsExecuted = 0;

    try {
      for (const step of steps) {
        const stepStartTime = Date.now();
        let stepResult: any;

        try {
          switch (step.run) {
            case 'send_to_misp':
              stepResult = await executeIntegrationStep(supabase, 'misp', triggerData);
              break;
            case 'notify_slack':
              stepResult = await executeIntegrationStep(supabase, 'slack', triggerData);
              break;
            case 'notify_teams':
              stepResult = await executeIntegrationStep(supabase, 'teams', triggerData);
              break;
            case 'send_email':
              stepResult = await executeIntegrationStep(supabase, 'email', triggerData);
              break;
            case 'create_case':
              stepResult = await executeCreateCase(supabase, triggerData, user.id);
              break;
            case 'create_alert':
              stepResult = await executeCreateAlert(supabase, triggerData, user.id);
              break;
            default:
              throw new Error(`Unknown step action: ${step.run}`);
          }

          stepsExecuted++;
          executionLog.push({
            step: step.run,
            status: 'success',
            result: stepResult,
            duration_ms: Date.now() - stepStartTime,
          });

        } catch (stepError) {
          executionLog.push({
            step: step.run,
            status: 'failed',
            error: stepError instanceof Error ? stepError.message : 'Unknown error',
            duration_ms: Date.now() - stepStartTime,
          });
          throw stepError;
        }
      }

      // Update run as completed
      await supabase
        .from('playbook_runs')
        .update({
          status: 'completed',
          steps_executed: stepsExecuted,
          execution_log: executionLog,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id);

      // Update playbook stats
      await supabase
        .from('playbooks')
        .update({
          run_count: playbook.run_count + 1,
          last_run_at: new Date().toISOString(),
          last_run_status: 'completed',
        })
        .eq('id', playbookId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          runId: run.id,
          stepsExecuted,
          executionLog 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (executionError) {
      // Update run as failed
      await supabase
        .from('playbook_runs')
        .update({
          status: 'failed',
          steps_executed: stepsExecuted,
          execution_log: executionLog,
          error_message: executionError instanceof Error ? executionError.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id);

      // Update playbook stats
      await supabase
        .from('playbooks')
        .update({
          run_count: playbook.run_count + 1,
          last_run_at: new Date().toISOString(),
          last_run_status: 'failed',
        })
        .eq('id', playbookId);

      throw executionError;
    }

  } catch (error) {
    console.error('Error in playbook-execute:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function executeIntegrationStep(supabase: any, connectorType: string, triggerData: any) {
  // Find first enabled connector of this type
  const { data: connector } = await supabase
    .from('integration_connectors')
    .select('id')
    .eq('connector_type', connectorType)
    .eq('enabled', true)
    .limit(1)
    .single();

  if (!connector) {
    throw new Error(`No enabled ${connectorType} connector found`);
  }

  // Call integration-deliver function
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const response = await fetch(`${supabaseUrl}/functions/v1/integration-deliver`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: JSON.stringify({
      connectorId: connector.id,
      event: triggerData,
    }),
  });

  if (!response.ok) {
    throw new Error(`Integration delivery failed: ${response.statusText}`);
  }

  return await response.json();
}

async function executeCreateCase(supabase: any, triggerData: any, userId: string) {
  const { data: caseData, error } = await supabase
    .from('legal_cases')
    .insert({
      title: triggerData.summary || 'Automated Case',
      description: triggerData.description || 'Created by playbook automation',
      status: 'open',
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create case');
  }

  return { caseId: caseData.id, caseNumber: caseData.case_number };
}

async function executeCreateAlert(supabase: any, triggerData: any, userId: string) {
  const { data: alert, error } = await supabase
    .from('alerts')
    .insert({
      user_id: userId,
      type: triggerData.alert_type || 'automated',
      severity: triggerData.severity || 'medium',
      title: triggerData.summary || 'Automated Alert',
      message: triggerData.description || 'Created by playbook automation',
      metadata: triggerData,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create alert');
  }

  return { alertId: alert.id };
}