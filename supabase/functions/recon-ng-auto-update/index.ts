import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[Auto-Update] Starting module auto-update check');

    const WORKER_URL = Deno.env.get('RECON_NG_WORKER_URL') || 'http://localhost:8080';
    const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN');

    // Get all enabled auto-update configs
    const { data: configs, error: configError } = await supabase
      .from('recon_ng_auto_updates')
      .select('*, workspaces(id, name)')
      .eq('enabled', true);

    if (configError) throw configError;

    console.log(`[Auto-Update] Found ${configs?.length || 0} enabled auto-update configs`);

    const results = [];

    for (const config of configs || []) {
      try {
        // Check if it's time to update based on schedule
        const lastCheck = config.last_check_at ? new Date(config.last_check_at) : null;
        const now = new Date();
        
        if (lastCheck) {
          const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
          const shouldCheck = 
            (config.schedule === 'daily' && hoursSinceLastCheck >= 24) ||
            (config.schedule === 'weekly' && hoursSinceLastCheck >= 168);
          
          if (!shouldCheck) {
            console.log(`[Auto-Update] Skipping workspace ${config.workspace_id} - not due yet`);
            continue;
          }
        }

        console.log(`[Auto-Update] Checking updates for workspace ${config.workspace_id}`);

        // Get installed modules
        const installedResponse = await fetch(`${WORKER_URL}/modules/installed`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!installedResponse.ok) {
          throw new Error(`Failed to get installed modules: ${installedResponse.status}`);
        }

        const installedData = await installedResponse.json();
        const installedModules = installedData.modules || [];

        // Filter modules to watch if specified
        const modulesToUpdate = config.modules_to_watch?.length > 0
          ? installedModules.filter((m: string) => config.modules_to_watch.includes(m))
          : installedModules;

        console.log(`[Auto-Update] Checking ${modulesToUpdate.length} modules for updates`);

        // Get marketplace info for all modules
        const marketplaceResponse = await fetch(`${WORKER_URL}/modules/marketplace`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!marketplaceResponse.ok) {
          throw new Error(`Failed to get marketplace modules: ${marketplaceResponse.status}`);
        }

        const marketplaceData = await marketplaceResponse.json();
        const allModules = marketplaceData.modules || [];

        const updatedModules = [];
        const failedModules = [];

        // Check and update each module
        for (const moduleName of modulesToUpdate) {
          try {
            const moduleInfo = allModules.find((m: any) => m.name === moduleName);
            
            if (!moduleInfo) {
              console.log(`[Auto-Update] Module ${moduleName} not found in marketplace`);
              continue;
            }

            const oldVersion = moduleInfo.version;

            // Attempt update
            const updateResponse = await fetch(`${WORKER_URL}/modules/update`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WORKER_TOKEN}`,
              },
              body: JSON.stringify({ module: moduleName }),
            });

            const updateData = await updateResponse.json();

            if (updateData.success) {
              updatedModules.push(moduleName);

              // Record in history
              await supabase.from('recon_ng_update_history').insert({
                workspace_id: config.workspace_id,
                module_name: moduleName,
                old_version: oldVersion,
                new_version: oldVersion, // Worker doesn't return new version
                status: 'success',
                changelog: `Auto-updated from v${oldVersion}`,
              });

              console.log(`[Auto-Update] Successfully updated ${moduleName}`);
            } else {
              failedModules.push({ module: moduleName, error: updateData.error });
              
              // Record failure
              await supabase.from('recon_ng_update_history').insert({
                workspace_id: config.workspace_id,
                module_name: moduleName,
                old_version: oldVersion,
                new_version: oldVersion,
                status: 'failed',
                error_message: updateData.error || 'Update failed',
              });

              console.error(`[Auto-Update] Failed to update ${moduleName}: ${updateData.error}`);
            }
          } catch (error) {
            console.error(`[Auto-Update] Error updating ${moduleName}:`, error);
            failedModules.push({ module: moduleName, error: error.message });
          }
        }

        // Update last_check_at and last_update_at
        await supabase
          .from('recon_ng_auto_updates')
          .update({
            last_check_at: now.toISOString(),
            last_update_at: updatedModules.length > 0 ? now.toISOString() : config.last_update_at,
          })
          .eq('id', config.id);

        // Send notification if enabled and there were updates
        if (config.notification_enabled && (updatedModules.length > 0 || failedModules.length > 0)) {
          // TODO: Implement notification system (email, in-app, etc.)
          console.log(`[Auto-Update] Notification: ${updatedModules.length} updated, ${failedModules.length} failed`);
        }

        results.push({
          workspace_id: config.workspace_id,
          workspace_name: config.workspaces?.name,
          updated: updatedModules,
          failed: failedModules,
          total_checked: modulesToUpdate.length,
        });

      } catch (error) {
        console.error(`[Auto-Update] Error processing workspace ${config.workspace_id}:`, error);
        results.push({
          workspace_id: config.workspace_id,
          error: error.message,
        });
      }
    }

    console.log(`[Auto-Update] Completed. Processed ${results.length} workspaces`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Auto-Update] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
