import { test, expect } from '@playwright/test';

test.describe('Advanced Scan - Batch Upload & Geocoding', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to advanced scan page
    await page.goto('/scan/advanced');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should show batch mode toggle for email scans', async ({ page }) => {
    // Select email scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    
    // Check batch mode button exists
    const batchButton = page.getByRole('button', { name: /batch mode/i });
    await expect(batchButton).toBeVisible();
  });

  test('should upload CSV file and display batch items', async ({ page }) => {
    // Select email scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Create test CSV content
    const csvContent = `email
test1@example.com
test2@example.com
test3@example.com
test4@example.com
test5@example.com
test6@example.com
test7@example.com
test8@example.com
test9@example.com
test10@example.com`;
    
    // Upload CSV (simulated)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    // Create a mock CSV file
    await fileChooser.setFiles({
      name: 'test-emails.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for upload to process
    await page.waitForTimeout(1000);
    
    // Check items loaded message
    await expect(page.getByText(/10 email\(s\) loaded/i)).toBeVisible();
    
    // Verify some items are displayed
    await expect(page.getByText('test1@example.com')).toBeVisible();
    await expect(page.getByText('test2@example.com')).toBeVisible();
  });

  test('should show map preview for IP batch scans', async ({ page }) => {
    // Select IP scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'ip');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Create test CSV with IPs
    const csvContent = `ip
8.8.8.8
1.1.1.1
208.67.222.222`;
    
    // Upload CSV
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test-ips.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for geocoding and map to load
    await page.waitForTimeout(3000);
    
    // Check for IP locations heading
    await expect(page.getByText(/ip locations/i)).toBeVisible();
    
    // Check for map container
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Verify at least one location marker
    await expect(page.getByText('8.8.8.8')).toBeVisible();
  });

  test('should show dark web policy warning', async ({ page }) => {
    // Enable dark web scanning
    await page.getByLabel(/darkweb sources/i).check();
    
    // Check policy warning is visible
    await expect(page.getByText(/dark web scanning policy/i)).toBeVisible();
    
    // Check policy details
    await expect(page.getByText(/results may include illegal or disturbing content/i)).toBeVisible();
    await expect(page.getByText(/additional credits will be consumed/i)).toBeVisible();
    
    // Policy checkbox should be present
    const policyCheckbox = page.getByLabel(/i accept the dark web scanning policy/i);
    await expect(policyCheckbox).toBeVisible();
    
    // Depth selector should be hidden until policy is accepted
    await expect(page.getByText(/dark web crawl depth/i)).not.toBeVisible();
    
    // Accept policy
    await policyCheckbox.check();
    
    // Now depth selector should be visible
    await expect(page.getByText(/dark web crawl depth/i)).toBeVisible();
  });

  test('should validate CSV format and reject invalid entries', async ({ page }) => {
    // Select email scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Create CSV with invalid emails
    const csvContent = `email
valid@example.com
invalid-email
another@example.com
notanemail
test@example.com`;
    
    // Upload CSV
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'mixed-emails.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for processing
    await page.waitForTimeout(1000);
    
    // Should show warning about skipped items
    await expect(page.getByText(/skipped.*invalid/i)).toBeVisible();
    
    // Should only load valid emails (3 out of 5)
    await expect(page.getByText(/3 email\(s\) loaded/i)).toBeVisible();
  });

  test('should enforce premium check for batch scans', async ({ page }) => {
    // Assume standard user (mock this in test setup)
    
    // Select email scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Upload multiple items
    const csvContent = `email
test1@example.com
test2@example.com`;
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test-emails.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    await page.waitForTimeout(1000);
    
    // Try to scan
    await page.getByRole('button', { name: /scan.*target/i }).click();
    
    // Should show premium required message
    await expect(page.getByText(/batch scanning requires a premium subscription/i)).toBeVisible();
  });

  test('should handle geocoding errors gracefully', async ({ page }) => {
    // Select IP scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'ip');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Create CSV with invalid IP
    const csvContent = `ip
999.999.999.999
256.1.1.1`;
    
    // Upload CSV
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'invalid-ips.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for processing
    await page.waitForTimeout(1000);
    
    // Should show no valid items message
    await expect(page.getByText(/no valid items found/i)).toBeVisible();
  });

  test('should display scan button text based on mode and items', async ({ page }) => {
    // Initially should show "Start Comprehensive Scan"
    await expect(page.getByRole('button', { name: /start comprehensive scan/i })).toBeVisible();
    
    // Switch to batch mode
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Upload items
    const csvContent = `email
test1@example.com
test2@example.com
test3@example.com`;
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test-emails.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    await page.waitForTimeout(1000);
    
    // Button text should update to show number of targets
    await expect(page.getByRole('button', { name: /scan 3 targets/i })).toBeVisible();
  });
});

test.describe('Advanced Scan - Error Handling', () => {
  test('should show error toast for failed scans', async ({ page }) => {
    await page.goto('/scan/advanced');
    await page.waitForLoadState('networkidle');
    
    // Enter invalid target
    await page.fill('input[placeholder*="Enter"]', 'invalid');
    
    // Try to scan
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Should show error toast
    await expect(page.getByText(/scan failed/i)).toBeVisible({ timeout: 5000 });
  });

  test('should prevent scan without authentication', async ({ page }) => {
    // Clear any auth state
    await page.context().clearCookies();
    
    await page.goto('/scan/advanced');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to auth or show error
    await expect(page.url()).toContain('/auth');
  });
});

test.describe('Advanced Scan - Edge Cases: Offline Worker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scan/advanced');
    await page.waitForLoadState('networkidle');
  });

  test('should handle offline Maigret worker gracefully', async ({ page }) => {
    // Mock Maigret worker as offline
    await page.route('**/functions/v1/enqueue-maigret-scan', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Worker unavailable',
          message: 'Maigret scan worker is currently offline'
        })
      });
    });

    // Select username scan
    await page.selectOption('[data-testid="scan-type-select"]', 'username');
    await page.fill('input[placeholder*="Enter"]', 'testuser');
    
    // Enable Maigret tool
    await page.getByLabel(/social media/i).check();
    
    // Start scan
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Should show worker offline error
    await expect(page.getByText(/worker.*offline|unavailable/i)).toBeVisible({ timeout: 5000 });
    
    // Should suggest retry or alternative
    await expect(page.getByText(/try again|retry/i)).toBeVisible();
  });

  test('should handle offline SpiderFoot worker with fallback', async ({ page }) => {
    // Mock SpiderFoot worker as offline
    await page.route('**/functions/v1/harvester-scan', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Service unavailable',
          message: 'SpiderFoot worker timeout'
        })
      });
    });

    // Enter email target
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    await page.fill('input[placeholder*="Enter"]', 'test@example.com');
    
    // Enable OSINT scanning
    await page.getByLabel(/osint sources/i).check();
    
    // Start scan
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Should show worker timeout error
    await expect(page.getByText(/timeout|unavailable/i)).toBeVisible({ timeout: 10000 });
    
    // Should still show partial results from other workers
    await expect(page.getByText(/partial results|some tools failed/i)).toBeVisible();
  });

  test('should display progress popup during multi-tool scan', async ({ page }) => {
    // Mock successful scan with progress updates
    await page.route('**/functions/v1/multi-tool-orchestrate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          scanId: 'test-scan-123',
          status: 'processing',
          progress: 45,
          message: 'Scanning social media profiles...'
        })
      });
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'username');
    await page.fill('input[placeholder*="Enter"]', 'johndoe');
    
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Progress popup should appear
    await expect(page.getByText(/scanning/i)).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[role="progressbar"], .progress-bar')).toBeVisible();
    
    // Should show percentage or status message
    await expect(page.getByText(/45%|processing|scanning social media/i)).toBeVisible();
  });

  test('should retry failed worker with exponential backoff', async ({ page }) => {
    let attemptCount = 0;
    
    // Mock worker that fails first 2 times, succeeds on 3rd
    await page.route('**/functions/v1/enqueue-maigret-scan', route => {
      attemptCount++;
      
      if (attemptCount < 3) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Temporary failure' })
        });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ 
            scanId: 'test-scan-retry',
            status: 'queued'
          })
        });
      }
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'username');
    await page.fill('input[placeholder*="Enter"]', 'retryuser');
    
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Should show retry attempts
    await expect(page.getByText(/retrying|attempt/i)).toBeVisible({ timeout: 8000 });
    
    // Eventually should succeed
    await expect(page.getByText(/scan started|processing/i)).toBeVisible({ timeout: 15000 });
    
    // Verify it retried (should have made 3 attempts)
    expect(attemptCount).toBe(3);
  });
});

test.describe('Advanced Scan - Edge Cases: Zero Results', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scan/advanced');
    await page.waitForLoadState('networkidle');
  });

  test('should handle zero results from Maigret gracefully', async ({ page }) => {
    // Mock Maigret returning no results
    await page.route('**/functions/v1/enqueue-maigret-scan', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          scanId: 'test-scan-empty',
          status: 'completed',
          results: []
        })
      });
    });

    await page.route('**/rest/v1/findings*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'username');
    await page.fill('input[placeholder*="Enter"]', 'nonexistentuser123456');
    
    await page.getByLabel(/social media/i).check();
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Wait for scan to complete
    await page.waitForTimeout(2000);
    
    // Should show zero results message
    await expect(page.getByText(/no results found|0 findings|no data found/i)).toBeVisible({ timeout: 10000 });
    
    // Should offer suggestions
    await expect(page.getByText(/try different|suggestions|alternative search/i)).toBeVisible();
  });

  test('should show AI-powered rescan suggestions for zero results', async ({ page }) => {
    // Mock zero results response
    await page.route('**/functions/v1/multi-tool-orchestrate', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          scanId: 'empty-scan',
          findings: [],
          totalFindings: 0
        })
      });
    });

    // Mock AI suggestion endpoint
    await page.route('**/functions/v1/ai-rescan-suggest', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          suggestions: [
            'Try searching for "john.doe" instead',
            'Check for variations like "johndoe123"',
            'Expand to include email addresses'
          ]
        })
      });
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'username');
    await page.fill('input[placeholder*="Enter"]', 'jdoe');
    
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Wait for zero results
    await expect(page.getByText(/no results found/i)).toBeVisible({ timeout: 8000 });
    
    // AI suggestions should appear
    await expect(page.getByText(/suggestions|try these alternatives/i)).toBeVisible();
    await expect(page.getByText(/john\.doe/i)).toBeVisible();
    await expect(page.getByText(/johndoe123/i)).toBeVisible();
  });

  test('should handle partial zero results (some tools succeed, others return nothing)', async ({ page }) => {
    // Mock mixed results
    await page.route('**/functions/v1/enqueue-maigret-scan', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          results: [
            { platform: 'Twitter', found: true, url: 'https://twitter.com/user' }
          ]
        })
      });
    });

    await page.route('**/functions/v1/harvester-scan', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ results: [] }) // Empty results
      });
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'username');
    await page.fill('input[placeholder*="Enter"]', 'partialuser');
    
    await page.getByLabel(/social media/i).check();
    await page.getByLabel(/osint sources/i).check();
    
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Should show partial results indicator
    await expect(page.getByText(/partial results|limited data|1.*finding/i)).toBeVisible({ timeout: 10000 });
    
    // Should indicate which tools succeeded
    await expect(page.getByText(/social media.*found|twitter/i)).toBeVisible();
    
    // Should note which tools returned nothing
    await expect(page.getByText(/osint.*no results|no osint data/i)).toBeVisible();
  });

  test('should display empty state with helpful actions', async ({ page }) => {
    await page.route('**/rest/v1/findings*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    await page.fill('input[placeholder*="Enter"]', 'noresults@example.com');
    
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    await page.waitForTimeout(2000);
    
    // Empty state should show helpful UI
    await expect(page.getByText(/no findings|nothing found/i)).toBeVisible({ timeout: 8000 });
    
    // Should show action buttons
    const scanAgainBtn = page.getByRole('button', { name: /scan again|try another/i });
    await expect(scanAgainBtn).toBeVisible();
    
    const viewHistoryBtn = page.getByRole('button', { name: /view history|past scans/i });
    await expect(viewHistoryBtn).toBeVisible();
  });
});

test.describe('Advanced Scan - Progress & Results Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scan/advanced');
    await page.waitForLoadState('networkidle');
  });

  test('should show real-time progress updates during scan', async ({ page }) => {
    const progressStages = [
      { progress: 10, message: 'Initializing scan...' },
      { progress: 30, message: 'Querying Maigret...' },
      { progress: 60, message: 'Processing social media...' },
      { progress: 85, message: 'Analyzing results...' },
      { progress: 100, message: 'Scan complete!' }
    ];

    let stageIndex = 0;

    // Mock progress endpoint
    await page.route('**/rest/v1/scan_jobs*', route => {
      const stage = progressStages[stageIndex] || progressStages[progressStages.length - 1];
      stageIndex = Math.min(stageIndex + 1, progressStages.length - 1);
      
      route.fulfill({
        status: 200,
        body: JSON.stringify([{
          id: 'progress-test',
          status: stageIndex < progressStages.length - 1 ? 'processing' : 'completed',
          progress: stage.progress,
          message: stage.message
        }])
      });
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'username');
    await page.fill('input[placeholder*="Enter"]', 'progresstest');
    
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Verify progress stages appear
    await expect(page.getByText(/initializing/i)).toBeVisible({ timeout: 3000 });
    
    // Progress bar should exist and update
    const progressBar = page.locator('[role="progressbar"], .progress-bar, [class*="progress"]').first();
    await expect(progressBar).toBeVisible();
    
    // Eventually should show completion
    await expect(page.getByText(/complete/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display findings count and summary in results popup', async ({ page }) => {
    // Mock successful scan with findings
    await page.route('**/rest/v1/findings*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '1',
            type: 'social_media',
            platform: 'Twitter',
            data: { username: 'testuser', followers: 1000 }
          },
          {
            id: '2',
            type: 'social_media',
            platform: 'Instagram',
            data: { username: 'testuser', followers: 5000 }
          },
          {
            id: '3',
            type: 'email',
            platform: 'Hunter.io',
            data: { email: 'test@example.com', verified: true }
          }
        ])
      });
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'username');
    await page.fill('input[placeholder*="Enter"]', 'testuser');
    
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Should show findings count
    await expect(page.getByText(/3.*findings|found 3|3 results/i)).toBeVisible({ timeout: 8000 });
    
    // Should show category breakdown
    await expect(page.getByText(/social media.*2|2.*social/i)).toBeVisible();
    await expect(page.getByText(/email.*1|1.*email/i)).toBeVisible();
    
    // Results should be clickable/expandable
    await expect(page.getByText(/twitter/i)).toBeVisible();
    await expect(page.getByText(/instagram/i)).toBeVisible();
  });

  test('should show scan duration and credits consumed', async ({ page }) => {
    await page.route('**/rest/v1/scan_jobs*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([{
          id: 'duration-test',
          status: 'completed',
          created_at: new Date(Date.now() - 45000).toISOString(), // 45 seconds ago
          completed_at: new Date().toISOString(),
          credits_consumed: 15
        }])
      });
    });

    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    await page.fill('input[placeholder*="Enter"]', 'test@example.com');
    
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    await page.waitForTimeout(2000);
    
    // Should show scan duration
    await expect(page.getByText(/45.*seconds|duration.*45|took 45/i)).toBeVisible({ timeout: 8000 });
    
    // Should show credits consumed
    await expect(page.getByText(/15.*credits|credits.*15/i)).toBeVisible();
  });
});
