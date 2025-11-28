import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface AuditCheck {
  component: string;
  status: 'success' | 'failure' | 'warning';
  message: string;
  details?: Record<string, any>;
}

interface AuditResult {
  success: boolean;
  status: 'success' | 'failure' | 'warning';
  checks: AuditCheck[];
  failureRate: number;
  aiSummary: string;
  aiPriority: string;
  recommendations: string[];
}

async function runFullAudit() {
  console.log('🔍 Starting full system audit...\n');
  
  try {
    const { data, error } = await supabase.functions.invoke('system-audit/run', {
      body: { auditType: 'full_system' },
    });

    if (error) {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    }

    const result = data as AuditResult;

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    SYSTEM AUDIT REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const statusIcon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`📊 Overall Status: ${statusIcon} ${result.status.toUpperCase()}`);
    console.log(`📈 Failure Rate: ${result.failureRate.toFixed(1)}%\n`);

    // Check breakdown
    console.log('───────────────────────────────────────────────────────────');
    console.log('                    CHECK RESULTS');
    console.log('───────────────────────────────────────────────────────────\n');

    const successChecks = result.checks.filter(c => c.status === 'success');
    const warningChecks = result.checks.filter(c => c.status === 'warning');
    const failureChecks = result.checks.filter(c => c.status === 'failure');

    console.log(`   ✅ Passed:   ${successChecks.length}`);
    console.log(`   ⚠️  Warnings: ${warningChecks.length}`);
    console.log(`   ❌ Failed:   ${failureChecks.length}`);
    console.log(`   📋 Total:    ${result.checks.length}\n`);

    // Detailed results
    if (failureChecks.length > 0) {
      console.log('❌ FAILURES:');
      failureChecks.forEach((check, idx) => {
        console.log(`   ${idx + 1}. [${check.component}] ${check.message}`);
        if (check.details) {
          console.log(`      Details: ${JSON.stringify(check.details)}`);
        }
      });
      console.log('');
    }

    if (warningChecks.length > 0) {
      console.log('⚠️  WARNINGS:');
      warningChecks.forEach((check, idx) => {
        console.log(`   ${idx + 1}. [${check.component}] ${check.message}`);
        if (check.details) {
          console.log(`      Details: ${JSON.stringify(check.details)}`);
        }
      });
      console.log('');
    }

    if (successChecks.length > 0) {
      console.log('✅ PASSED:');
      successChecks.forEach((check) => {
        console.log(`   • [${check.component}] ${check.message}`);
      });
      console.log('');
    }

    // AI Analysis
    if (result.aiSummary) {
      console.log('───────────────────────────────────────────────────────────');
      console.log('                    AI ANALYSIS');
      console.log('───────────────────────────────────────────────────────────\n');
      console.log(`🤖 Priority: ${result.aiPriority.toUpperCase()}`);
      console.log(`\n📝 Summary:\n   ${result.aiSummary}\n`);
      
      if (result.recommendations && result.recommendations.length > 0) {
        console.log('💡 Recommendations:');
        result.recommendations.forEach((rec, idx) => {
          console.log(`   ${idx + 1}. ${rec}`);
        });
        console.log('');
      }
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    // Exit with appropriate code
    if (result.status === 'failure') {
      console.error('❌ Audit FAILED. Fix critical issues before production deployment.');
      process.exit(1);
    } else if (result.status === 'warning') {
      console.warn('⚠️  Audit passed with WARNINGS. Review before production deployment.');
      process.exit(0);
    } else {
      console.log('✅ Audit PASSED! System is ready for production.');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Unexpected error during audit:', error);
    process.exit(1);
  }
}

runFullAudit();
