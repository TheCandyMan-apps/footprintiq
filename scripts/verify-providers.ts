/**
 * Provider Verification Script
 * 
 * Validates that all provider endpoints are working correctly
 * and generates an HTML report.
 */

interface TestResult {
  endpoint: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  latencyMs?: number;
}

const BASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';

async function testEndpoint(path: string, requiresKey: string | null = null): Promise<TestResult> {
  const startTime = Date.now();
  
  // Skip if required key is missing
  if (requiresKey && !process.env[requiresKey]) {
    return {
      endpoint: path,
      status: 'skip',
      message: `Skipped: ${requiresKey} not configured`,
    };
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const latencyMs = Date.now() - startTime;
    
    if (response.ok) {
      return {
        endpoint: path,
        status: 'pass',
        message: `Success (${response.status})`,
        latencyMs,
      };
    } else {
      return {
        endpoint: path,
        status: 'fail',
        message: `Failed with status ${response.status}`,
        latencyMs,
      };
    }
  } catch (error) {
    return {
      endpoint: path,
      status: 'fail',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

async function runTests(): Promise<TestResult[]> {
  console.log('🧪 Starting provider verification...\n');

  const tests = [
    { path: '/functions/v1/health', key: null },
    { path: '/functions/v1/metrics-providers', key: null },
    { path: '/functions/v1/osint-scan?target=test@example.com&scanType=email', key: null },
  ];

  const results: TestResult[] = [];
  
  for (const test of tests) {
    console.log(`Testing ${test.path}...`);
    const result = await testEndpoint(test.path, test.key);
    results.push(result);
    
    const icon = result.status === 'pass' ? '✅' : result.status === 'skip' ? '⏭️' : '❌';
    console.log(`${icon} ${result.endpoint}: ${result.message}`);
    if (result.latencyMs) {
      console.log(`   Latency: ${result.latencyMs}ms`);
    }
    console.log('');
  }

  return results;
}

function generateHtmlReport(results: TestResult[]): string {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  
  const rows = results.map(r => {
    const statusColor = r.status === 'pass' ? '#22c55e' : r.status === 'skip' ? '#a3a3a3' : '#ef4444';
    const statusIcon = r.status === 'pass' ? '✅' : r.status === 'skip' ? '⏭️' : '❌';
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${r.endpoint}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: ${statusColor}; font-weight: 600;">
          ${statusIcon} ${r.status.toUpperCase()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${r.message}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${r.latencyMs ? `${r.latencyMs}ms` : '-'}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Provider Verification Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    h1 {
      color: #111827;
      margin-bottom: 8px;
    }
    .timestamp {
      color: #6b7280;
      margin-bottom: 32px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .summary-label {
      color: #6b7280;
      font-size: 14px;
    }
    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
    }
    td {
      padding: 12px;
    }
  </style>
</head>
<body>
  <h1>🔍 Provider Verification Report</h1>
  <p class="timestamp">Generated: ${new Date().toISOString()}</p>
  
  <div class="summary">
    <div class="summary-card">
      <div class="summary-value" style="color: #22c55e;">${passed}</div>
      <div class="summary-label">Passed</div>
    </div>
    <div class="summary-card">
      <div class="summary-value" style="color: #ef4444;">${failed}</div>
      <div class="summary-label">Failed</div>
    </div>
    <div class="summary-card">
      <div class="summary-value" style="color: #a3a3a3;">${skipped}</div>
      <div class="summary-label">Skipped</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${results.length}</div>
      <div class="summary-label">Total Tests</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Endpoint</th>
        <th>Status</th>
        <th>Message</th>
        <th>Latency</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>
  `;
}

// Run tests and generate report
runTests().then(results => {
  const html = generateHtmlReport(results);
  
  // Write to file
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(process.cwd(), 'verification', 'providers-report.html');
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, html);
  
  console.log(`\n📊 Report generated: ${outputPath}`);
  
  const passed = results.filter(r => r.status === 'pass').length;
  const total = results.length;
  
  if (passed === total) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log(`⚠️  ${passed}/${total} tests passed`);
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
