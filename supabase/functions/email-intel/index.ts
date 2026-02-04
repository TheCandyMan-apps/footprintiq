import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ProviderStatus = 'success' | 'failed' | 'skipped' | 'not_configured' | 'tier_restricted';

interface ProviderResult {
  status: ProviderStatus;
  findingsCount: number;
  latencyMs: number;
  message?: string;
}

// Finding interface matching the actual database schema (id omitted - DB auto-generates UUID)
interface Finding {
  scan_id: string;
  workspace_id: string;
  provider: string;
  kind: string;
  severity: string;
  confidence: number;
  evidence: Array<{ key: string; value: string }>;
  observed_at: string;
  meta: Record<string, unknown>;
}

// Generate deterministic finding key for deduplication (stored in meta, NOT as id)
function generateFindingKey(provider: string, kind: string, unique: string): string {
  return `${provider}_${kind}_${unique.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { scanId, email, workspaceId, providers = ['hibp', 'abstract_email', 'abstract_email_reputation', 'ipqs_email'], userPlan = 'free' } = body;

    if (!email || !scanId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, scanId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[email-intel] Starting scan for ${email.slice(0, 5)}*** (scanId: ${scanId})`);
    console.log(`[email-intel] Requested providers: ${providers.join(', ')}`);
    console.log(`[email-intel] User plan: ${userPlan}`);

    const findings: Finding[] = [];
    const providerResults: Record<string, ProviderResult> = {};

    // Helper to log scan events
    const logScanEvent = async (providerId: string, stage: string, status: string, errorMessage?: string) => {
      try {
        await supabase.from('scan_events').insert({
          scan_id: scanId,
          provider: providerId,
          stage,
          status,
          error_message: errorMessage || null,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error(`[email-intel] Failed to log scan event for ${providerId}:`, e);
      }
    };

    // Helper to broadcast progress
    const broadcastProgress = async (message: string, completedCount: number) => {
      try {
        const channel = supabase.channel(`scan_progress:${scanId}`);
        await channel.send({
          type: 'broadcast',
          event: 'provider_complete',
          payload: {
            scanId,
            message,
            completedProviders: completedCount,
            totalProviders: providers.length,
          },
        });
      } catch (e) {
        console.error('[email-intel] Failed to broadcast progress:', e);
      }
    };

    // ==================== HIBP Provider ====================
    if (providers.includes('hibp')) {
      const startTime = Date.now();
      const HIBP_API_KEY = Deno.env.get('HIBP_API_KEY');

      if (!HIBP_API_KEY) {
        console.log('[email-intel] HIBP_API_KEY not configured');
        providerResults['hibp'] = { status: 'not_configured', findingsCount: 0, latencyMs: 0, message: 'API key not configured' };
        await logScanEvent('hibp', 'execution', 'not_configured', 'HIBP_API_KEY not set');
      } else {
        try {
          console.log(`[email-intel] Calling HIBP API for ${email.slice(0, 5)}***`);
          
          const response = await fetch(
            `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
            {
              headers: {
                'hibp-api-key': HIBP_API_KEY,
                'user-agent': 'FootprintIQ/1.0 (+https://footprintiq.app)',
              },
            }
          );

          const latency = Date.now() - startTime;
          console.log(`[email-intel] HIBP response status: ${response.status} (${latency}ms)`);

          if (response.status === 404) {
            // No breaches found - this is a success case
            findings.push({
              scan_id: scanId,
              workspace_id: workspaceId,
              provider: 'hibp',
              kind: 'breach.none',
              severity: 'info',
              confidence: 0.9,
              evidence: [{ key: 'Email', value: email }, { key: 'Status', value: 'Clean' }],
              observed_at: new Date().toISOString(),
              meta: {
                finding_key: generateFindingKey('hibp', 'no_breach', email),
                type: 'breach_check',
                title: 'No Breaches Found',
                description: 'This email was not found in any known data breaches.',
              },
            });
            providerResults['hibp'] = { status: 'success', findingsCount: 1, latencyMs: latency };
            await logScanEvent('hibp', 'execution', 'success');
          } else if (response.ok) {
            const breaches = await response.json() as any[];
            console.log(`[email-intel] HIBP found ${breaches.length} breaches`);

            // Create a finding for each breach
            for (const breach of breaches.slice(0, 20)) { // Limit to 20 breaches
              const hasSensitiveData = breach.IsSensitive || breach.DataClasses?.includes('Passwords');
              
              findings.push({
                scan_id: scanId,
                workspace_id: workspaceId,
                provider: 'hibp',
                kind: 'breach.hit',
                severity: hasSensitiveData ? 'high' : 'medium',
                confidence: 0.95,
                evidence: [
                  { key: 'Breach Name', value: breach.Name },
                  { key: 'Breach Date', value: breach.BreachDate || 'Unknown' },
                  { key: 'Domain', value: breach.Domain || 'N/A' },
                  { key: 'Records Affected', value: breach.PwnCount?.toLocaleString() || 'Unknown' },
                  { key: 'Data Types', value: (breach.DataClasses || []).join(', ') || 'Unknown' },
                  { key: 'Is Sensitive', value: String(!!breach.IsSensitive) },
                  { key: 'Is Verified', value: String(!!breach.IsVerified) },
                ],
                observed_at: new Date().toISOString(),
                meta: {
                  finding_key: generateFindingKey('hibp', 'breach', `${email}_${breach.Name}`),
                  type: 'breach_check',
                  title: `Breach: ${breach.Name}`,
                  description: `Email found in ${breach.Name} breach from ${breach.BreachDate || 'unknown date'}. ${breach.Description?.slice(0, 200) || ''}`,
                  raw_data: breach,
                },
              });
            }

            providerResults['hibp'] = { status: 'success', findingsCount: breaches.length, latencyMs: latency };
            await logScanEvent('hibp', 'execution', 'success');
          } else {
            console.error(`[email-intel] HIBP API error: ${response.status}`);
            providerResults['hibp'] = { status: 'failed', findingsCount: 0, latencyMs: latency, message: `HTTP ${response.status}` };
            await logScanEvent('hibp', 'execution', 'failed', `HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('[email-intel] HIBP error:', error);
          providerResults['hibp'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: error instanceof Error ? error.message : 'Unknown error' };
          await logScanEvent('hibp', 'execution', 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      await broadcastProgress('HIBP breach check complete', Object.keys(providerResults).length);
    }

    // ==================== Abstract Email Provider ====================
    if (providers.includes('abstract_email')) {
      const startTime = Date.now();
      const ABSTRACT_API_KEY = Deno.env.get('ABSTRACTAPI_EMAIL_VERIFICATION_KEY');

      if (!ABSTRACT_API_KEY) {
        console.log('[email-intel] ABSTRACTAPI_EMAIL_VERIFICATION_KEY not configured');
        providerResults['abstract_email'] = { status: 'not_configured', findingsCount: 0, latencyMs: 0, message: 'API key not configured' };
        await logScanEvent('abstract_email', 'execution', 'not_configured', 'ABSTRACTAPI_EMAIL_VERIFICATION_KEY not set');
      } else {
        try {
          console.log(`[email-intel] Calling Abstract Email API for ${email.slice(0, 5)}***`);
          
          const response = await fetch(
            `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`
          );

          const latency = Date.now() - startTime;

          if (response.ok) {
            const data = await response.json();
            console.log(`[email-intel] Abstract Email response:`, JSON.stringify(data).slice(0, 200));

            // Determine severity based on quality score and deliverability
            let severity = 'info';
            if (data.deliverability === 'UNDELIVERABLE' || data.is_disposable_email?.value) {
              severity = 'medium';
            } else if (data.is_catchall_email?.value || data.is_role_email?.value) {
              severity = 'low';
            }

            findings.push({
              scan_id: scanId,
              workspace_id: workspaceId,
              provider: 'abstract_email',
              kind: 'email.validation',
              severity,
              confidence: data.quality_score ? parseFloat(data.quality_score) : 0.7,
              evidence: [
                { key: 'Email', value: email },
                { key: 'Deliverability', value: data.deliverability || 'Unknown' },
                { key: 'Quality Score', value: data.quality_score || 'N/A' },
                { key: 'Valid Format', value: String(!!data.is_valid_format?.value) },
                { key: 'Free Email', value: String(!!data.is_free_email?.value) },
                { key: 'Disposable', value: String(!!data.is_disposable_email?.value) },
                { key: 'Role Email', value: String(!!data.is_role_email?.value) },
                { key: 'Catchall', value: String(!!data.is_catchall_email?.value) },
                { key: 'MX Found', value: String(!!data.is_mx_found?.value) },
                { key: 'SMTP Valid', value: String(!!data.is_smtp_valid?.value) },
              ],
              observed_at: new Date().toISOString(),
              meta: {
                finding_key: generateFindingKey('abstract_email', 'validation', email),
                type: 'email_intelligence',
                title: `Email Validation: ${data.deliverability || 'Unknown'}`,
                description: `Email format is ${data.is_valid_format?.value ? 'valid' : 'invalid'}. Deliverability: ${data.deliverability || 'unknown'}.`,
                raw_data: data,
              },
            });

            providerResults['abstract_email'] = { status: 'success', findingsCount: 1, latencyMs: latency };
            await logScanEvent('abstract_email', 'execution', 'success');
          } else {
            console.error(`[email-intel] Abstract Email API error: ${response.status}`);
            providerResults['abstract_email'] = { status: 'failed', findingsCount: 0, latencyMs: latency, message: `HTTP ${response.status}` };
            await logScanEvent('abstract_email', 'execution', 'failed', `HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('[email-intel] Abstract Email error:', error);
          providerResults['abstract_email'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: error instanceof Error ? error.message : 'Unknown error' };
          await logScanEvent('abstract_email', 'execution', 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      await broadcastProgress('Email validation complete', Object.keys(providerResults).length);
    }

    // ==================== IPQS Email Provider ====================
    if (providers.includes('ipqs_email')) {
      const startTime = Date.now();
      const IPQS_API_KEY = Deno.env.get('IPQS_API_KEY');

      if (!IPQS_API_KEY) {
        console.log('[email-intel] IPQS_API_KEY not configured');
        providerResults['ipqs_email'] = { status: 'not_configured', findingsCount: 0, latencyMs: 0, message: 'API key not configured' };
        await logScanEvent('ipqs_email', 'execution', 'not_configured', 'IPQS_API_KEY not set');
      } else {
        try {
          console.log(`[email-intel] Calling IPQS Email API for ${email.slice(0, 5)}***`);
          
          const response = await fetch(
            `https://ipqualityscore.com/api/json/email/${IPQS_API_KEY}/${encodeURIComponent(email)}`
          );

          const latency = Date.now() - startTime;

          if (response.ok) {
            const data = await response.json();
            console.log(`[email-intel] IPQS Email response:`, JSON.stringify(data).slice(0, 200));

            if (data.success !== false) {
              // Determine severity based on fraud score
              let severity = 'info';
              if (data.fraud_score >= 85) severity = 'high';
              else if (data.fraud_score >= 60) severity = 'medium';
              else if (data.fraud_score >= 40) severity = 'low';

              findings.push({
                scan_id: scanId,
                workspace_id: workspaceId,
                provider: 'ipqs_email',
                kind: 'email.fraud',
                severity,
                confidence: 0.85,
                evidence: [
                  { key: 'Email', value: email },
                  { key: 'Fraud Score', value: String(data.fraud_score || 0) },
                  { key: 'Valid', value: String(!!data.valid) },
                  { key: 'Disposable', value: String(!!data.disposable) },
                  { key: 'Leaked', value: String(!!data.leaked) },
                  { key: 'Recent Abuse', value: String(!!data.recent_abuse) },
                  { key: 'Spam Trap Score', value: String(data.spam_trap_score || 'N/A') },
                  { key: 'Catch All', value: String(!!data.catch_all) },
                  { key: 'Generic', value: String(!!data.generic) },
                  { key: 'Common', value: String(!!data.common) },
                  { key: 'DNS Valid', value: String(!!data.dns_valid) },
                  { key: 'Honeypot', value: String(!!data.honeypot) },
                  { key: 'Deliverability', value: data.deliverability || 'Unknown' },
                  { key: 'First Seen', value: data.first_seen?.human || 'Unknown' },
                ],
                observed_at: new Date().toISOString(),
                meta: {
                  finding_key: generateFindingKey('ipqs_email', 'fraud', email),
                  type: 'email_intelligence',
                  title: `Fraud Score: ${data.fraud_score || 0}/100`,
                  description: `Email risk assessment: ${data.fraud_score >= 85 ? 'High risk' : data.fraud_score >= 60 ? 'Medium risk' : data.fraud_score >= 40 ? 'Low risk' : 'Low risk'}. ${data.disposable ? 'Disposable email detected.' : ''} ${data.leaked ? 'Found in data leaks.' : ''}`,
                  raw_data: data,
                },
              });

              providerResults['ipqs_email'] = { status: 'success', findingsCount: 1, latencyMs: latency };
              await logScanEvent('ipqs_email', 'execution', 'success');
            } else {
              console.error(`[email-intel] IPQS returned error: ${data.message}`);
              providerResults['ipqs_email'] = { status: 'failed', findingsCount: 0, latencyMs: latency, message: data.message || 'API error' };
              await logScanEvent('ipqs_email', 'execution', 'failed', data.message || 'API error');
            }
          } else {
            console.error(`[email-intel] IPQS Email API error: ${response.status}`);
            providerResults['ipqs_email'] = { status: 'failed', findingsCount: 0, latencyMs: latency, message: `HTTP ${response.status}` };
            await logScanEvent('ipqs_email', 'execution', 'failed', `HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('[email-intel] IPQS Email error:', error);
          providerResults['ipqs_email'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: error instanceof Error ? error.message : 'Unknown error' };
          await logScanEvent('ipqs_email', 'execution', 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      await broadcastProgress('Fraud analysis complete', Object.keys(providerResults).length);
    }

    // ==================== Abstract Email Reputation Provider ====================
    if (providers.includes('abstract_email_reputation')) {
      const startTime = Date.now();
      const ABSTRACT_REPUTATION_KEY = Deno.env.get('ABSTRACTAPI_EMAIL_REPUTATION_KEY');

      if (!ABSTRACT_REPUTATION_KEY) {
        console.log('[email-intel] ABSTRACTAPI_EMAIL_REPUTATION_KEY not configured');
        providerResults['abstract_email_reputation'] = { status: 'not_configured', findingsCount: 0, latencyMs: 0, message: 'API key not configured' };
        await logScanEvent('abstract_email_reputation', 'execution', 'not_configured', 'ABSTRACTAPI_EMAIL_REPUTATION_KEY not set');
      } else {
        try {
          console.log(`[email-intel] Calling Abstract Email Reputation API for ${email.slice(0, 5)}***`);
          
          const response = await fetch(
            `https://emailreputation.abstractapi.com/v1/?api_key=${ABSTRACT_REPUTATION_KEY}&email=${encodeURIComponent(email)}`
          );

          const latency = Date.now() - startTime;

          if (response.ok) {
            const data = await response.json();
            console.log(`[email-intel] Abstract Email Reputation response:`, JSON.stringify(data).slice(0, 200));

            // Determine severity based on quality score
            let severity = 'info';
            const qualityScore = data.email_quality?.score || 0;
            if (qualityScore < 0.3) severity = 'high';
            else if (qualityScore < 0.5) severity = 'medium';
            else if (qualityScore < 0.7) severity = 'low';

            // Build evidence array
            const evidence = [
              { key: 'Email', value: email },
              { key: 'Quality Score', value: String(qualityScore) },
              { key: 'Deliverability', value: data.email_deliverability?.status || 'Unknown' },
              { key: 'Status Detail', value: data.email_deliverability?.status_detail || 'N/A' },
              { key: 'Valid Format', value: String(!!data.is_format_valid) },
              { key: 'SMTP Valid', value: String(!!data.is_smtp_valid) },
              { key: 'MX Valid', value: String(!!data.is_mx_valid) },
            ];

            // Add MX records if available
            if (data.mx_records?.length > 0) {
              evidence.push({ key: 'MX Records', value: data.mx_records.slice(0, 3).join(', ') });
            }

            findings.push({
              scan_id: scanId,
              workspace_id: workspaceId,
              provider: 'abstract_email_reputation',
              kind: 'email.reputation',
              severity,
              confidence: qualityScore,
              evidence,
              observed_at: new Date().toISOString(),
              meta: {
                finding_key: generateFindingKey('abstract_email_reputation', 'reputation', email),
                type: 'email_intelligence',
                title: `Email Quality: ${Math.round(qualityScore * 100)}%`,
                description: `Email quality score is ${Math.round(qualityScore * 100)}%. Deliverability: ${data.email_deliverability?.status || 'unknown'}.`,
                raw_data: data,
              },
            });

            providerResults['abstract_email_reputation'] = { status: 'success', findingsCount: 1, latencyMs: latency };
            await logScanEvent('abstract_email_reputation', 'execution', 'success');
          } else {
            console.error(`[email-intel] Abstract Email Reputation API error: ${response.status}`);
            providerResults['abstract_email_reputation'] = { status: 'failed', findingsCount: 0, latencyMs: latency, message: `HTTP ${response.status}` };
            await logScanEvent('abstract_email_reputation', 'execution', 'failed', `HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('[email-intel] Abstract Email Reputation error:', error);
          providerResults['abstract_email_reputation'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: error instanceof Error ? error.message : 'Unknown error' };
          await logScanEvent('abstract_email_reputation', 'execution', 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      await broadcastProgress('Email reputation complete', Object.keys(providerResults).length);
    }

    // ==================== Store Findings ====================
    let storedCount = 0;
    if (findings.length > 0) {
      console.log(`[email-intel] Storing ${findings.length} findings...`);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('findings')
        .insert(findings)
        .select('id');
      
      if (insertError) {
        console.error('[email-intel] Failed to store findings:', JSON.stringify(insertError));
        // Update scan_progress with error
        await supabase.from('scan_progress').update({
          message: `Email intel error: ${insertError.message || 'Failed to store findings'}`,
          updated_at: new Date().toISOString(),
        }).eq('scan_id', scanId);
      } else {
        storedCount = insertedData?.length || 0;
        console.log(`[email-intel] Successfully stored ${storedCount} findings`);
      }
    }

    // ==================== Update Scan Progress ====================
    const totalFindings = findings.length;
    const successCount = Object.values(providerResults).filter(r => r.status === 'success').length;

    await supabase.from('scan_progress').update({
      findings_count: totalFindings,
      completed_providers: Object.keys(providerResults).length,
      message: `Email intel complete: ${totalFindings} findings from ${successCount} providers`,
      updated_at: new Date().toISOString(),
    }).eq('scan_id', scanId);

    console.log(`[email-intel] Completed scan ${scanId}: ${totalFindings} findings, ${successCount}/${providers.length} providers successful`);

    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        findingsCount: totalFindings,
        providerResults,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[email-intel] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
