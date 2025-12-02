import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Core tables to export (most important for migration)
const CORE_TABLES = [
  'scans',
  'findings',
  'profiles',
  'workspaces',
  'workspace_members',
  'user_roles',
  'credits_ledger',
  'scan_events',
  'cases',
  'case_items',
  'case_notes',
  'api_keys',
  'watchlist_entries',
  'removal_requests',
];

// All tables for full export
const ALL_TABLES = [
  ...CORE_TABLES,
  'activity_logs',
  'ai_insights',
  'ai_generated_reports',
  'alert_rules',
  'anomalies',
  'audit_activity',
  'audit_log',
  'audit_logs',
  'background_jobs',
  'cache_entries',
  'case_comments',
  'case_evidence',
  'chain_of_custody',
  'clients',
  'compliance_reports',
  'compromised_credentials',
  'darkweb_mentions',
  'data_broker_exposures',
  'entity_nodes',
  'entity_relationships',
  'evidence_artifacts',
  'incidents',
  'link_predictions',
  'maigret_results',
  'notification_preferences',
  'notifications',
  'referral_codes',
  'referrals',
  'referral_stats',
  'scan_artifacts',
  'scan_jobs',
  'social_media_findings',
  'subscriptions',
  'support_tickets',
  'system_errors',
  'threat_intel_feeds',
  'workflows',
  'workflow_runs',
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create client with user's token to verify auth
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service role client for full access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { exportType = "schema", tables = [] } = await req.json();
    
    console.log(`[database-export] Export type: ${exportType}, tables: ${tables.join(", ") || "default"}`);

    let result: Record<string, unknown> = {};

    if (exportType === "schema") {
      result = await exportSchema(supabase);
    } else if (exportType === "core-data") {
      result = await exportTableData(supabase, CORE_TABLES);
    } else if (exportType === "all-data") {
      result = await exportTableData(supabase, ALL_TABLES);
    } else if (exportType === "selected" && tables.length > 0) {
      result = await exportTableData(supabase, tables);
    } else if (exportType === "full") {
      const schema = await exportSchema(supabase);
      const data = await exportTableData(supabase, ALL_TABLES);
      result = { schema, data };
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid export type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        exportType,
        timestamp: new Date().toISOString(),
        ...result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[database-export] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Export failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportSchema(supabase: SupabaseClient<any, any, any>) {
  // Get RLS policies for each table using the database function
  const policies: Record<string, unknown[]> = {};
  const tableNames = ALL_TABLES;
  
  for (const tableName of tableNames) {
    try {
      const { data: tablePolicies } = await supabase.rpc('pg_get_table_policies', { table_name: tableName });
      if (tablePolicies && Array.isArray(tablePolicies) && tablePolicies.length > 0) {
        policies[tableName] = tablePolicies;
      }
    } catch (e) {
      console.log(`[database-export] Could not get policies for ${tableName}`);
    }
  }

  // Document table existence
  const tableSchemas: Record<string, unknown> = {};
  for (const tableName of tableNames) {
    tableSchemas[tableName] = {
      exists: true,
      note: "See migration files for full schema definition"
    };
  }

  return {
    tables: tableNames,
    policies,
    tableSchemas,
    note: "For complete schema, export migration files from supabase/migrations folder"
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportTableData(
  supabase: SupabaseClient<any, any, any>,
  tables: string[]
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const counts: Record<string, number> = {};

  for (const tableName of tables) {
    try {
      // Get row count first
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      counts[tableName] = count || 0;

      // Export data in batches for large tables
      if (count && count > 10000) {
        // For very large tables, just export sample + count
        const { data: sampleData } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);
        
        data[tableName] = {
          type: 'sample',
          totalCount: count,
          sampleSize: sampleData?.length || 0,
          sample: sampleData || [],
          note: `Table has ${count} rows. Only latest 1000 exported. Use pagination for full export.`
        };
      } else {
        // Export all data for smaller tables
        const { data: tableData, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false, nullsFirst: false });
        
        if (error) {
          errors[tableName] = error.message;
        } else {
          data[tableName] = {
            type: 'full',
            count: tableData?.length || 0,
            rows: tableData || []
          };
        }
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Unknown error';
      errors[tableName] = errMessage;
    }
  }

  return { data, counts, errors };
}
