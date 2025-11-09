import { test, expect } from '@playwright/test';
import { mockAuth, mockUserProfile, setupTestEnvironment } from '../setup/playwright-mocks';

test.describe('Multi-Tool Scan E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupTestEnvironment(page, { credits: 100, isPremium: true });
  });

  test('should complete multi-tool scan with all tools selected', async ({ page }) => {
    // Navigate to Advanced Scan
    await page.goto('/advanced-scan');
    
    // Click Multi-Tool tab
    await page.getByRole('tab', { name: /multi-tool/i }).click();
    
    // Enter target
    await page.getByPlaceholder(/enter username/i).fill('testuser');
    
    // Select all tools
    await page.getByLabel(/maigret/i).check();
    await page.getByLabel(/spiderfoot/i).check();
    await page.getByLabel(/recon-ng/i).check();
    
    // Mock multi-tool orchestrate response
    await page.route('**/functions/v1/multi-tool-orchestrate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          scanId: 'test-scan-123',
          results: [
            { tool: 'maigret', status: 'completed', resultCount: 25 },
            { tool: 'spiderfoot', status: 'completed', resultCount: 150 },
            { tool: 'reconng', status: 'completed', resultCount: 42 }
          ],
          totalCost: 25
        })
      });
    });
    
    // Mock real-time progress updates
    await page.evaluate(() => {
      window.postMessage({
        type: 'supabase-broadcast',
        event: 'tool_progress',
        payload: { toolName: 'maigret', status: 'running', message: 'Scanning 400+ platforms...' }
      }, '*');
    });
    
    // Start scan
    await page.getByRole('button', { name: /start multi-tool scan/i }).click();
    
    // Verify loading state
    await expect(page.getByText(/scanning in progress/i)).toBeVisible();
    
    // Verify progress updates
    await expect(page.getByText(/maigret.*running/i)).toBeVisible({ timeout: 10000 });
    
    // Wait for completion
    await expect(page.getByText(/scan complete/i)).toBeVisible({ timeout: 30000 });
    
    // Verify results displayed
    await expect(page.getByText(/217 total results/i)).toBeVisible();
  });

  test('should handle tool unavailability gracefully', async ({ page }) => {
    await page.goto('/advanced-scan');
    await page.getByRole('tab', { name: /multi-tool/i }).click();
    
    await page.getByPlaceholder(/enter username/i).fill('testuser');
    await page.getByLabel(/maigret/i).check();
    await page.getByLabel(/spiderfoot/i).check();
    
    // Mock SpiderFoot unavailable
    await page.route('**/functions/v1/multi-tool-orchestrate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          scanId: 'test-scan-456',
          results: [
            { tool: 'maigret', status: 'completed', resultCount: 25 },
            { tool: 'spiderfoot', status: 'skipped', error: 'Service not configured' }
          ],
          totalCost: 5
        })
      });
    });
    
    await page.getByRole('button', { name: /start multi-tool scan/i }).click();
    
    // Verify toast notification
    await expect(page.getByText(/spiderfoot unavailable/i)).toBeVisible();
    
    // Verify partial results shown
    await expect(page.getByText(/maigret.*completed/i)).toBeVisible();
  });

  test('should prevent scan with insufficient credits', async ({ page }) => {
    await mockUserProfile(page, 10, true); // Only 10 credits
    
    await page.goto('/advanced-scan');
    await page.getByRole('tab', { name: /multi-tool/i }).click();
    
    await page.getByPlaceholder(/enter username/i).fill('testuser');
    await page.getByLabel(/maigret/i).check();
    await page.getByLabel(/spiderfoot/i).check();
    await page.getByLabel(/recon-ng/i).check();
    
    // Mock insufficient credits response
    await page.route('**/functions/v1/multi-tool-orchestrate', async (route) => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Insufficient credits' })
      });
    });
    
    await page.getByRole('button', { name: /start multi-tool scan/i }).click();
    
    await expect(page.getByText(/insufficient credits/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /purchase credits/i })).toBeVisible();
  });

  test('should display real-time progress for each tool', async ({ page }) => {
    await page.goto('/advanced-scan');
    await page.getByRole('tab', { name: /multi-tool/i }).click();
    
    await page.getByPlaceholder(/enter username/i).fill('testuser');
    await page.getByLabel(/maigret/i).check();
    
    await page.route('**/functions/v1/multi-tool-orchestrate', async (route) => {
      // Simulate slow response
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, scanId: 'test-789' })
        });
      }, 2000);
    });
    
    await page.getByRole('button', { name: /start multi-tool scan/i }).click();
    
    // Simulate progress events
    await page.evaluate(() => {
      const events = [
        { toolName: 'maigret', status: 'running', message: 'Scanning 400+ platforms...', progress: 25 },
        { toolName: 'maigret', status: 'running', message: 'Processing results...', progress: 75 },
        { toolName: 'maigret', status: 'completed', message: 'Found 25 results', resultCount: 25 }
      ];
      
      events.forEach((event, index) => {
        setTimeout(() => {
          window.postMessage({ type: 'supabase-broadcast', event: 'tool_progress', payload: event }, '*');
        }, index * 500);
      });
    });
    
    // Verify progress indicators
    await expect(page.getByText(/scanning 400\+ platforms/i)).toBeVisible();
    await expect(page.getByText(/processing results/i)).toBeVisible();
    await expect(page.getByText(/found 25 results/i)).toBeVisible();
  });

  test('should allow export of unified results', async ({ page }) => {
    await page.goto('/advanced-scan');
    await page.getByRole('tab', { name: /multi-tool/i }).click();
    
    // Complete a scan first
    await page.getByPlaceholder(/enter username/i).fill('testuser');
    await page.getByLabel(/maigret/i).check();
    
    await page.route('**/functions/v1/multi-tool-orchestrate', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          scanId: 'export-test-123',
          results: [{ tool: 'maigret', status: 'completed', resultCount: 25 }]
        })
      });
    });
    
    await page.getByRole('button', { name: /start multi-tool scan/i }).click();
    await expect(page.getByText(/scan complete/i)).toBeVisible({ timeout: 10000 });
    
    // Mock download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export results/i }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/multi-tool-scan.*\.json/);
  });
});
