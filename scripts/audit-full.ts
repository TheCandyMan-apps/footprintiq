import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface AuditResult {
  success: boolean;
  summary: {
    total_issues: number;
    fixed: number;
    severity_breakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    duration_ms: number;
  };
  ai_summary: string;
  prioritized_issues: any[];
  all_issues: any[];
}

async function runFullAudit() {
  console.log('🔍 Starting full codebase audit...\n');
  
  try {
    const { data, error } = await supabase.functions.invoke('audit-full', {
      body: {},
    });

    if (error) {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    }

    const result = data as AuditResult;

    console.log('📊 Audit Summary:');
    console.log(`   Total Issues: ${result.summary.total_issues}`);
    console.log(`   Auto-Fixed: ${result.summary.fixed}`);
    console.log(`   Duration: ${result.summary.duration_ms}ms\n`);

    console.log('🎯 Severity Breakdown:');
    console.log(`   Critical: ${result.summary.severity_breakdown.critical}`);
    console.log(`   High: ${result.summary.severity_breakdown.high}`);
    console.log(`   Medium: ${result.summary.severity_breakdown.medium}`);
    console.log(`   Low: ${result.summary.severity_breakdown.low}\n`);

    if (result.ai_summary && result.ai_summary !== 'AI analysis unavailable') {
      console.log('🤖 AI Analysis:');
      console.log(result.ai_summary);
      console.log('\n');
    }

    if (result.prioritized_issues.length > 0) {
      console.log('⚡ Priority Issues:');
      result.prioritized_issues.forEach((issue, idx) => {
        console.log(`${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        console.log(`   ${issue.description}`);
        if (issue.auto_fixable) {
          console.log(`   ✅ Auto-fixable${issue.fix_applied ? ' (FIXED)' : ''}`);
        }
        console.log('');
      });
    }

    // Exit with error code if critical or high severity issues found
    const criticalCount = result.summary.severity_breakdown.critical;
    const highCount = result.summary.severity_breakdown.high;
    
    if (criticalCount > 0) {
      console.error(`❌ Found ${criticalCount} critical issue(s). Please fix immediately.`);
      process.exit(1);
    } else if (highCount > 0) {
      console.warn(`⚠️  Found ${highCount} high severity issue(s). Consider fixing soon.`);
      process.exit(0);
    } else {
      console.log('✅ Audit passed! No critical or high severity issues found.');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Unexpected error during audit:', error);
    process.exit(1);
  }
}

runFullAudit();
