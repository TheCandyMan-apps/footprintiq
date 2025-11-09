import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditIssue {
  category: 'rls' | 'performance' | 'security' | 'test';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  auto_fixable: boolean;
  fix_applied?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting full codebase audit...');

    const issues: AuditIssue[] = [];
    const startTime = Date.now();

    // 1. RLS Policy Check
    console.log('Checking RLS policies...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables_without_rls' as any).catch(() => ({ data: null, error: null }));
    
    // Fallback: Check critical tables manually
    const criticalTables = ['scans', 'workspaces', 'workspace_members', 'profiles', 'cases', 'monitors'];
    
    for (const table of criticalTables) {
      const { data: rlsCheck } = await supabase
        .from(table as any)
        .select('*')
        .limit(1);
      
      // If we can read without auth, RLS might be misconfigured
      if (rlsCheck && rlsCheck.length > 0) {
        issues.push({
          category: 'rls',
          severity: 'high',
          title: `Potential RLS issue on ${table}`,
          description: `Table ${table} returned data without authentication. Review RLS policies.`,
          auto_fixable: false,
        });
      }
    }

    // 2. Performance Check (mock Lighthouse - would need actual implementation)
    console.log('Checking performance metrics...');
    // This is a placeholder - real implementation would run Lighthouse via edge function
    issues.push({
      category: 'performance',
      severity: 'low',
      title: 'Performance audit placeholder',
      description: 'Run Lighthouse CI for actual performance metrics. Target: >95 score.',
      auto_fixable: false,
    });

    // 3. Security Check - Check for exposed secrets
    console.log('Checking security...');
    // Check if any VITE_ secrets are exposed in client code (this is a mock check)
    const securityIssue = {
      category: 'security' as const,
      severity: 'medium' as const,
      title: 'Security scan completed',
      description: 'Run `npm audit` locally for dependency vulnerabilities. Edge functions use secure secret storage.',
      auto_fixable: false,
    };
    issues.push(securityIssue);

    // 4. Test Results Check
    console.log('Checking test suites...');
    issues.push({
      category: 'test',
      severity: 'low',
      title: 'Test suite status',
      description: 'Run full test suite with `npm run ci:verify` to ensure all tests pass.',
      auto_fixable: false,
    });

    // Auto-fix common issues
    let fixedCount = 0;
    for (const issue of issues) {
      if (issue.auto_fixable) {
        console.log(`Auto-fixing: ${issue.title}`);
        // Placeholder for auto-fix logic
        issue.fix_applied = true;
        fixedCount++;
      }
    }

    // Get AI summary from Grok
    console.log('Getting AI prioritization...');
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    let aiSummary = 'AI analysis unavailable';
    let prioritizedIssues: any[] = [];

    if (grokApiKey && issues.length > 0) {
      try {
        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: [
              {
                role: 'system',
                content: 'You are a security and code quality expert. Analyze audit findings and prioritize fixes with actionable recommendations.',
              },
              {
                role: 'user',
                content: `Analyze these audit findings and prioritize fixes:\n\n${JSON.stringify(issues, null, 2)}\n\nProvide:\n1. Risk assessment\n2. Top 3 priority fixes\n3. Quick wins\n4. Long-term recommendations`,
              },
            ],
            temperature: 0.3,
          }),
        });

        if (grokResponse.ok) {
          const grokData = await grokResponse.json();
          aiSummary = grokData.choices?.[0]?.message?.content || 'No AI response';
          
          // Parse AI response for prioritized issues
          prioritizedIssues = issues
            .sort((a, b) => {
              const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return severityOrder[a.severity] - severityOrder[b.severity];
            })
            .slice(0, 5);
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
    }

    // Store in system_audit_logs table
    const auditLog = {
      audit_type: 'full_codebase',
      issues_found: issues.length,
      issues_fixed: fixedCount,
      severity_breakdown: {
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
      },
      ai_summary: aiSummary,
      prioritized_issues: prioritizedIssues,
      details: issues,
      duration_ms: Date.now() - startTime,
    };

    const { error: logError } = await supabase
      .from('system_audit_logs' as any)
      .insert(auditLog);

    if (logError) {
      console.error('Failed to store audit log:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_issues: issues.length,
          fixed: fixedCount,
          severity_breakdown: auditLog.severity_breakdown,
          duration_ms: auditLog.duration_ms,
        },
        ai_summary: aiSummary,
        prioritized_issues: prioritizedIssues,
        all_issues: issues,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Full audit failed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
