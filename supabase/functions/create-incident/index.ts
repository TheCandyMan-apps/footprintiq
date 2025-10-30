import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { IncidentCreateSchema, safeParse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check admin role
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!role || role.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Validate incident data
    const body = await req.json();
    const validation = safeParse(IncidentCreateSchema, body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid incident data', details: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const incidentData = validation.data!;

    // Generate incident number using the database function
    const { data: incidentNumberResult, error: numberError } = await supabase
      .rpc('generate_incident_number');

    if (numberError || !incidentNumberResult) {
      console.error('Failed to generate incident number:', numberError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate incident number' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create incident
    const { data: incident, error: insertError } = await supabase
      .from('incidents')
      .insert({
        incident_number: incidentNumberResult,
        title: incidentData.title,
        description: incidentData.description,
        severity: incidentData.severity,
        impact: incidentData.impact,
        affected_services: incidentData.affected_services || [],
        created_by: user.id,
        slack_thread_url: incidentData.slack_thread_url,
        status: 'investigating',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create incident:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create initial update
    await supabase
      .from('incident_updates')
      .insert({
        incident_id: incident.id,
        status: 'investigating',
        message: `Incident ${incident.incident_number} created: ${incidentData.title}`,
        created_by: user.id,
        is_public: true,
      });

    console.log('Incident created:', incident.incident_number);

    return new Response(
      JSON.stringify({ incident }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );
  } catch (error) {
    console.error('Error in create-incident:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
