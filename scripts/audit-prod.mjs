#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

const results = {
  timestamp: new Date().toISOString(),
  rls: { status: 'pending', findings: [] },
  performance: { status: 'pending', scores: {} },
  security: { status: 'pending', vulnerabilities: {} },
  tests: { status: 'pending', summary: '' },
  overall: 'pending'
};

async function checkRLS() {
  console.log('🔒 Checking Row Level Security...');
  try {
    // Run Supabase linter to check RLS policies
    const { stdout } = await execAsync('npx supabase db lint --level error');
    const issues = stdout.match(/error:/gi) || [];
    
    results.rls = {
      status: issues.length === 0 ? 'passed' : 'failed',
      findings: issues.length === 0 ? ['All tables have proper RLS policies'] : [
        `Found ${issues.length} RLS policy issues`,
        'Check Supabase logs for details'
      ]
    };
  } catch (error) {
    results.rls = {
      status: 'warning',
      findings: ['Could not run RLS checks - ensure Supabase CLI is configured']
    };
  }
}

async function checkPerformance() {
  console.log('⚡ Running Lighthouse performance audit...');
  try {
    // Build the app first
    await execAsync('npm run build');
    
    // Start preview server in background
    const server = exec('npx vite preview --port 4173');
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      // Run Lighthouse
      const { stdout } = await execAsync(
        'npx lighthouse http://localhost:4173 --quiet --output=json --chrome-flags="--headless"'
      );
      
      const lighthouse = JSON.parse(stdout);
      const scores = {
        performance: Math.round(lighthouse.categories.performance.score * 100),
        accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
        seo: Math.round(lighthouse.categories.seo.score * 100)
      };
      
      results.performance = {
        status: scores.performance >= 90 ? 'passed' : 'failed',
        scores,
        findings: [
          `Performance: ${scores.performance}/100`,
          `Accessibility: ${scores.accessibility}/100`,
          `Best Practices: ${scores.bestPractices}/100`,
          `SEO: ${scores.seo}/100`
        ]
      };
    } finally {
      // Kill the server
      server.kill();
    }
  } catch (error) {
    results.performance = {
      status: 'warning',
      scores: {},
      findings: ['Could not run Lighthouse - ensure Chrome is installed']
    };
  }
}

async function checkSecurity() {
  console.log('🛡️ Running security audit...');
  try {
    const { stdout } = await execAsync('npm audit --json');
    const audit = JSON.parse(stdout);
    
    const vulnCounts = {
      critical: audit.metadata?.vulnerabilities?.critical || 0,
      high: audit.metadata?.vulnerabilities?.high || 0,
      moderate: audit.metadata?.vulnerabilities?.moderate || 0,
      low: audit.metadata?.vulnerabilities?.low || 0
    };
    
    const totalVulns = Object.values(vulnCounts).reduce((a, b) => a + b, 0);
    
    results.security = {
      status: vulnCounts.critical === 0 && vulnCounts.high === 0 ? 'passed' : 'failed',
      vulnerabilities: vulnCounts,
      findings: [
        `Total vulnerabilities: ${totalVulns}`,
        `Critical: ${vulnCounts.critical}`,
        `High: ${vulnCounts.high}`,
        `Moderate: ${vulnCounts.moderate}`,
        `Low: ${vulnCounts.low}`
      ]
    };
  } catch (error) {
    // npm audit returns exit code 1 if vulnerabilities found
    if (error.stdout) {
      const audit = JSON.parse(error.stdout);
      const vulnCounts = {
        critical: audit.metadata?.vulnerabilities?.critical || 0,
        high: audit.metadata?.vulnerabilities?.high || 0,
        moderate: audit.metadata?.vulnerabilities?.moderate || 0,
        low: audit.metadata?.vulnerabilities?.low || 0
      };
      
      const totalVulns = Object.values(vulnCounts).reduce((a, b) => a + b, 0);
      
      results.security = {
        status: vulnCounts.critical === 0 && vulnCounts.high === 0 ? 'warning' : 'failed',
        vulnerabilities: vulnCounts,
        findings: [
          `Total vulnerabilities: ${totalVulns}`,
          `Critical: ${vulnCounts.critical}`,
          `High: ${vulnCounts.high}`,
          `Moderate: ${vulnCounts.moderate}`,
          `Low: ${vulnCounts.low}`
        ]
      };
    } else {
      results.security = {
        status: 'error',
        vulnerabilities: {},
        findings: ['Failed to run npm audit']
      };
    }
  }
}

async function runTests() {
  console.log('🧪 Running tests...');
  try {
    const { stdout } = await execAsync('npm run test:run');
    
    results.tests = {
      status: 'passed',
      summary: stdout.split('\n').slice(-10).join('\n')
    };
  } catch (error) {
    results.tests = {
      status: 'failed',
      summary: error.stdout || 'Tests failed'
    };
  }
}

function determineOverallStatus() {
  const statuses = [
    results.rls.status,
    results.performance.status,
    results.security.status,
    results.tests.status
  ];
  
  if (statuses.includes('failed')) {
    results.overall = 'failed';
  } else if (statuses.includes('warning')) {
    results.overall = 'warning';
  } else {
    results.overall = 'passed';
  }
}

function generateHTMLReport() {
  const statusIcon = {
    passed: '✅',
    failed: '❌',
    warning: '⚠️',
    error: '❌',
    pending: '⏳'
  };
  
  const statusColor = {
    passed: '#22c55e',
    failed: '#ef4444',
    warning: '#f59e0b',
    error: '#ef4444',
    pending: '#6b7280'
  };
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Production Audit Report - ${new Date(results.timestamp).toLocaleString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      color: #1f2937;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .header .timestamp { opacity: 0.8; font-size: 0.9rem; }
    .overall-status {
      padding: 2rem;
      text-align: center;
      font-size: 3rem;
      background: ${statusColor[results.overall]};
      color: white;
    }
    .sections {
      padding: 2rem;
      display: grid;
      gap: 1.5rem;
    }
    .section {
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.5rem;
      background: #f9fafb;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .section-header h2 {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      background: ${statusColor[results.overall]};
      color: white;
    }
    .findings {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .findings li {
      padding: 0.5rem 0.75rem;
      background: white;
      border-radius: 0.375rem;
      border-left: 3px solid #3b82f6;
    }
    .scores {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .score-card {
      background: white;
      padding: 1rem;
      border-radius: 0.375rem;
      text-align: center;
      border: 2px solid #e5e7eb;
    }
    .score-card .label { font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem; }
    .score-card .value {
      font-size: 2rem;
      font-weight: 700;
      color: ${statusColor[results.performance.status]};
    }
    .vulnerabilities {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .vuln-card {
      background: white;
      padding: 1rem;
      border-radius: 0.375rem;
      text-align: center;
    }
    .vuln-card .count {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .vuln-card .label { font-size: 0.875rem; color: #6b7280; }
    .critical { color: #ef4444; }
    .high { color: #f97316; }
    .moderate { color: #f59e0b; }
    .low { color: #3b82f6; }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
    .footer {
      padding: 1.5rem 2rem;
      background: #f9fafb;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Production Audit Report</h1>
      <div class="timestamp">Generated: ${new Date(results.timestamp).toLocaleString()}</div>
    </div>
    
    <div class="overall-status">
      ${statusIcon[results.overall]} ${results.overall.toUpperCase()}
    </div>
    
    <div class="sections">
      <!-- RLS Security -->
      <div class="section">
        <div class="section-header">
          <h2>🔒 Row Level Security</h2>
          <span class="status-badge" style="background: ${statusColor[results.rls.status]}">
            ${results.rls.status.toUpperCase()}
          </span>
        </div>
        <ul class="findings">
          ${results.rls.findings.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      
      <!-- Performance -->
      <div class="section">
        <div class="section-header">
          <h2>⚡ Performance (Lighthouse)</h2>
          <span class="status-badge" style="background: ${statusColor[results.performance.status]}">
            ${results.performance.status.toUpperCase()}
          </span>
        </div>
        ${results.performance.scores.performance ? `
          <div class="scores">
            <div class="score-card">
              <div class="label">Performance</div>
              <div class="value">${results.performance.scores.performance}</div>
            </div>
            <div class="score-card">
              <div class="label">Accessibility</div>
              <div class="value">${results.performance.scores.accessibility}</div>
            </div>
            <div class="score-card">
              <div class="label">Best Practices</div>
              <div class="value">${results.performance.scores.bestPractices}</div>
            </div>
            <div class="score-card">
              <div class="label">SEO</div>
              <div class="value">${results.performance.scores.seo}</div>
            </div>
          </div>
        ` : ''}
        <ul class="findings">
          ${results.performance.findings?.map(f => `<li>${f}</li>`).join('') || ''}
        </ul>
      </div>
      
      <!-- Security -->
      <div class="section">
        <div class="section-header">
          <h2>🛡️ Security Audit</h2>
          <span class="status-badge" style="background: ${statusColor[results.security.status]}">
            ${results.security.status.toUpperCase()}
          </span>
        </div>
        ${results.security.vulnerabilities.critical !== undefined ? `
          <div class="vulnerabilities">
            <div class="vuln-card">
              <div class="count critical">${results.security.vulnerabilities.critical}</div>
              <div class="label">Critical</div>
            </div>
            <div class="vuln-card">
              <div class="count high">${results.security.vulnerabilities.high}</div>
              <div class="label">High</div>
            </div>
            <div class="vuln-card">
              <div class="count moderate">${results.security.vulnerabilities.moderate}</div>
              <div class="label">Moderate</div>
            </div>
            <div class="vuln-card">
              <div class="count low">${results.security.vulnerabilities.low}</div>
              <div class="label">Low</div>
            </div>
          </div>
        ` : ''}
        <ul class="findings">
          ${results.security.findings?.map(f => `<li>${f}</li>`).join('') || ''}
        </ul>
      </div>
      
      <!-- Tests -->
      <div class="section">
        <div class="section-header">
          <h2>🧪 Test Suite</h2>
          <span class="status-badge" style="background: ${statusColor[results.tests.status]}">
            ${results.tests.status.toUpperCase()}
          </span>
        </div>
        <pre>${results.tests.summary}</pre>
      </div>
    </div>
    
    <div class="footer">
      Generated by FootprintIQ Automated Audit System
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

async function commitToAuditBranch() {
  console.log('📝 Committing report to audit branch...');
  try {
    // Create audit branch if it doesn't exist
    try {
      await execAsync('git checkout audit');
    } catch {
      await execAsync('git checkout -b audit');
    }
    
    // Add the report
    await execAsync('git add public/admin/prod-report.html');
    await execAsync(`git commit -m "chore: automated production audit - ${results.overall} - ${new Date().toISOString()}"`);
    
    console.log('✅ Report committed to audit branch');
    
    // Switch back to original branch
    await execAsync('git checkout -');
  } catch (error) {
    console.warn('⚠️  Could not commit to audit branch:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Production Audit...\n');
  
  // Run all checks
  await checkRLS();
  await checkSecurity();
  await runTests();
  await checkPerformance();
  
  // Determine overall status
  determineOverallStatus();
  
  // Generate HTML report
  console.log('\n📊 Generating HTML report...');
  const html = generateHTMLReport();
  
  // Ensure admin directory exists
  const adminDir = join(process.cwd(), 'public', 'admin');
  if (!existsSync(adminDir)) {
    mkdirSync(adminDir, { recursive: true });
  }
  
  // Write report
  const reportPath = join(adminDir, 'prod-report.html');
  writeFileSync(reportPath, html);
  console.log(`✅ Report saved to: ${reportPath}`);
  
  // Commit to audit branch
  await commitToAuditBranch();
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`📋 AUDIT SUMMARY - ${results.overall.toUpperCase()}`);
  console.log('='.repeat(50));
  console.log(`🔒 RLS: ${results.rls.status}`);
  console.log(`⚡ Performance: ${results.performance.status}`);
  console.log(`🛡️  Security: ${results.security.status}`);
  console.log(`🧪 Tests: ${results.tests.status}`);
  console.log('='.repeat(50));
  console.log(`\n📄 Full report: /admin/prod-report.html\n`);
  
  // Exit with appropriate code
  process.exit(results.overall === 'passed' ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
