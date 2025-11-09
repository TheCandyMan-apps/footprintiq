import { test, expect } from '@playwright/test';
import { setupTestEnvironment, mockEdgeFunction } from '../setup/playwright-mocks';

test.describe('Advanced Scan E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page, {
      credits: 500,
      isPremium: true,
    });
    await page.goto('/advanced-scan');
  });

  test('should complete full premium scan flow: sign-in → multi-tool → results', async ({ page }) => {
    // 1. Verify authenticated state
    await expect(page.getByText(/advanced scan/i)).toBeVisible();
    await expect(page.getByText(/500.*credits/i)).toBeVisible();

    // 2. Configure multi-tool scan
    await page.getByPlaceholder(/email|username/i).fill('testuser@example.com');
    
    // Enable multiple scan options
    await page.getByLabel(/social media/i).check();
    await page.getByLabel(/dark web/i).check();
    await page.getByLabel(/face recognition/i).check();

    // Mock multi-tool scan orchestration
    await mockEdgeFunction(page, 'scan-orchestrate', {
      status: 200,
      body: JSON.stringify({
        scanId: 'multi-scan-123',
        status: 'processing',
        providers: ['hibp', 'maigret', 'spiderfoot', 'face-recognition']
      })
    });

    // Mock scan results
    await mockEdgeFunction(page, 'scan-results', {
      status: 200,
      body: JSON.stringify({
        scanId: 'multi-scan-123',
        status: 'completed',
        findings: [
          {
            provider: 'hibp',
            kind: 'breach',
            severity: 'high',
            confidence: 0.95,
            observedAt: new Date().toISOString(),
            evidence: [{ key: 'breaches', value: '3' }]
          },
          {
            provider: 'maigret',
            kind: 'social_media',
            severity: 'medium',
            confidence: 0.88,
            observedAt: new Date().toISOString(),
            evidence: [{ key: 'profiles', value: '12' }]
          },
          {
            provider: 'spiderfoot',
            kind: 'osint',
            severity: 'low',
            confidence: 0.75,
            observedAt: new Date().toISOString(),
            evidence: [{ key: 'mentions', value: '5' }]
          }
        ],
        creditsUsed: 45,
        duration: 38000
      })
    });

    // 3. Start scan
    await page.getByRole('button', { name: /start.*scan/i }).click();

    // 4. Wait for and verify progress
    await expect(page.getByText(/scanning/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // 5. Verify results page
    await expect(page.getByText(/scan.*complete/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/3.*findings/i)).toBeVisible();
    await expect(page.getByText(/high.*severity/i)).toBeVisible();
    await expect(page.getByText(/45.*credits/i)).toBeVisible();

    // 6. Verify provider breakdown
    await expect(page.getByText(/hibp/i)).toBeVisible();
    await expect(page.getByText(/maigret/i)).toBeVisible();
    await expect(page.getByText(/spiderfoot/i)).toBeVisible();
  });

  test('should handle batch scan with CSV upload', async ({ page }) => {
    // Enable batch mode
    await page.getByLabel(/batch mode/i).check();
    await expect(page.getByText(/csv upload/i)).toBeVisible();

    // Mock CSV upload
    const csvContent = 'email\nuser1@test.com\nuser2@test.com\nuser3@test.com';
    const buffer = Buffer.from(csvContent);
    await page.setInputFiles('input[type="file"]', {
      name: 'test-batch.csv',
      mimeType: 'text/csv',
      buffer,
    });

    // Verify items displayed
    await expect(page.getByText(/3.*items/i)).toBeVisible();
    await expect(page.getByText(/user1@test.com/i)).toBeVisible();

    // Mock batch orchestration
    await mockEdgeFunction(page, 'scan-orchestrate', {
      status: 200,
      body: JSON.stringify({
        batchId: 'batch-456',
        status: 'processing',
        itemCount: 3
      })
    });

    await page.getByRole('button', { name: /start.*batch/i }).click();
    await expect(page.getByText(/batch.*processing/i)).toBeVisible();
  });

  test('should enforce premium subscription for advanced features', async ({ page }) => {
    // Setup as free user
    await page.goto('/');
    await setupTestEnvironment(page, {
      credits: 100,
      isPremium: false,
    });
    await page.goto('/advanced-scan');

    // Verify premium features are disabled/show upgrade prompts
    await expect(page.getByLabel(/dark web/i)).toBeDisabled();
    await expect(page.getByText(/upgrade.*premium/i)).toBeVisible();
    await expect(page.getByLabel(/face recognition/i)).toBeDisabled();

    // Click upgrade CTA
    await page.getByRole('button', { name: /upgrade/i }).first().click();
    await expect(page).toHaveURL(/.*pricing|upgrade/);
  });

  test('Edge Cases: Offline Worker - should show retry suggestions when Maigret worker is offline', async ({ page }) => {
    await page.getByPlaceholder(/username/i).fill('testuser');
    await page.getByLabel(/social media/i).check();

    // Mock offline Maigret worker
    await mockEdgeFunction(page, 'scan-orchestrate', {
      status: 503,
      body: JSON.stringify({
        error: 'Worker unavailable',
        message: 'Maigret scan worker is currently offline',
        retryAfter: 30
      })
    });

    await page.getByRole('button', { name: /start.*scan/i }).click();

    // Verify error handling
    await expect(page.getByText(/worker.*offline/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/retry.*30.*seconds/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('Edge Cases: Offline Worker - should fallback gracefully when SpiderFoot times out', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByLabel(/osint/i).check();

    // Mock SpiderFoot timeout but other providers succeed
    await mockEdgeFunction(page, 'scan-orchestrate', {
      status: 200,
      body: JSON.stringify({
        scanId: 'partial-scan-789',
        status: 'completed',
        warnings: [{
          provider: 'spiderfoot',
          error: 'timeout',
          message: 'SpiderFoot worker timeout after 30s'
        }],
        findings: [
          {
            provider: 'hibp',
            kind: 'breach',
            severity: 'high',
            confidence: 0.95,
            observedAt: new Date().toISOString()
          }
        ]
      })
    });

    await page.getByRole('button', { name: /start.*scan/i }).click();

    // Verify partial results with warning
    await expect(page.getByText(/scan.*complete/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/1.*finding/i)).toBeVisible();
    await expect(page.getByText(/spiderfoot.*unavailable/i)).toBeVisible();
    await expect(page.getByText(/hibp/i)).toBeVisible();
  });

  test('Edge Cases: Zero Results - should show AI-powered suggestions when no results found', async ({ page }) => {
    await page.getByPlaceholder(/username/i).fill('nonexistentuser12345');

    // Mock zero results
    await mockEdgeFunction(page, 'scan-orchestrate', {
      status: 200,
      body: JSON.stringify({
        scanId: 'zero-scan-999',
        status: 'completed',
        findings: [],
        suggestions: [
          'Try searching for variations of the username',
          'Check for common typos or alternate spellings',
          'Try the email address if available'
        ]
      })
    });

    await page.getByRole('button', { name: /start.*scan/i }).click();

    // Verify empty state with suggestions
    await expect(page.getByText(/no results found/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/suggestions/i)).toBeVisible();
    await expect(page.getByText(/variations of the username/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /try.*suggestion/i })).toBeVisible();
  });

  test('Progress & Results Display - should show real-time progress with multiple stages', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('progress@test.com');

    // Mock progressive status updates
    let progressCount = 0;
    await page.route('**/scan-orchestrate', async (route) => {
      progressCount++;
      const progress = Math.min(progressCount * 20, 100);
      const messages = [
        'Initializing scan...',
        'Querying data providers...',
        'Processing results...',
        'Analyzing findings...',
        'Scan complete!'
      ];
      
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          scanId: 'progress-scan-111',
          status: progress === 100 ? 'completed' : 'processing',
          progress,
          message: messages[Math.floor(progressCount / 2)]
        })
      });
    });

    await page.getByRole('button', { name: /start.*scan/i }).click();

    // Verify progress stages
    await expect(page.getByText(/initializing/i)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Wait for completion
    await expect(page.getByText(/complete/i)).toBeVisible({ timeout: 30000 });
  });

  test('CSV Format Validation - should reject invalid CSV entries', async ({ page }) => {
    await page.getByLabel(/batch mode/i).check();

    // Upload CSV with invalid entries
    const invalidCsv = 'email\ninvalid-email\nvalid@test.com\n@invalid.com';
    const buffer = Buffer.from(invalidCsv);
    await page.setInputFiles('input[type="file"]', {
      name: 'invalid-batch.csv',
      mimeType: 'text/csv',
      buffer,
    });

    // Verify validation errors
    await expect(page.getByText(/2.*invalid.*entries/i)).toBeVisible();
    await expect(page.getByText(/invalid-email/i)).toBeVisible();
    await expect(page.getByText(/@invalid\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /start.*batch/i })).toBeDisabled();
  });

  test('should display scan duration and credit usage metrics', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('metrics@test.com');

    await mockEdgeFunction(page, 'scan-orchestrate', {
      status: 200,
      body: JSON.stringify({
        scanId: 'metrics-scan-222',
        status: 'completed',
        findings: [
          {
            provider: 'hibp',
            kind: 'breach',
            severity: 'medium',
            confidence: 0.85,
            observedAt: new Date().toISOString()
          }
        ],
        duration: 12500,
        creditsUsed: 15,
        breakdown: {
          hibp: 5,
          maigret: 10
        }
      })
    });

    await page.getByRole('button', { name: /start.*scan/i }).click();

    // Verify metrics display
    await expect(page.getByText(/scan.*complete/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/12.*seconds/i)).toBeVisible();
    await expect(page.getByText(/15.*credits/i)).toBeVisible();
    await expect(page.getByText(/breakdown/i)).toBeVisible();
  });
});
