import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting scheduled audit run');

    // Find an admin user to run audit as
    const { data: adminUser } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (!adminUser) {
      console.error('No admin user found for scheduled audit');
      return new Response(
        JSON.stringify({ error: 'No admin user available' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role token for audit function
    const { data: { session } } = await supabaseClient.auth.admin.createUser({
      email: `audit-system-${Date.now()}@system.internal`,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { system: true, purpose: 'scheduled_audit' }
    });

    if (!session) {
      throw new Error('Failed to create audit session');
    }

    // Run audit
    const { data: auditResult, error: auditError } = await supabaseClient.functions.invoke(
      'audit-scans',
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (auditError) {
      throw new Error(`Audit failed: ${auditError.message}`);
    }

    console.log('Audit completed:', auditResult);

    // Check success rate threshold
    const successRate = auditResult.success_rate;
    const threshold = 90;

    if (successRate < threshold) {
      console.warn(`⚠️ Success rate (${successRate}%) below threshold (${threshold}%)`);

      // Send alert to admins
      const { data: admins } = await supabaseClient
        .from('profiles')
        .select('email, user_id')
        .in(
          'user_id',
          supabaseClient
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin')
        );

      if (admins && admins.length > 0) {
        // Log alert (email function can be added separately)
        console.log(`Alert sent to ${admins.length} admins`);
        
        // Create bug report for low success rate
        await supabaseClient.from('bugs').insert({
          title: `Audit Success Rate Below Threshold: ${successRate}%`,
          description: `Automated audit detected success rate of ${successRate}%, which is below the ${threshold}% threshold. ${auditResult.failed} tests failed out of ${auditResult.total_tests}.`,
          severity: successRate < 80 ? 'critical' : 'high',
          status: 'open',
          metadata: {
            audit_run_id: auditResult.suite_run_id,
            success_rate: successRate,
            failed_count: auditResult.failed,
            total_tests: auditResult.total_tests,
          },
        });
      }
    } else {
      console.log(`✓ Audit passed with ${successRate}% success rate`);
    }

    // Cleanup temporary audit user
    await supabaseClient.auth.admin.deleteUser(session.user.id);

    return new Response(
      JSON.stringify({
        success: true,
        audit_run_id: auditResult.suite_run_id,
        success_rate: successRate,
        total_tests: auditResult.total_tests,
        passed: auditResult.passed,
        failed: auditResult.failed,
        warnings: auditResult.warnings,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Scheduled audit error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
