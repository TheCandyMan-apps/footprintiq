import { test, expect } from '@playwright/test';

test.describe('Maigret Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    // Assume user is logged in for these tests
  });

  test('should show Maigret toggle for username scans', async ({ page }) => {
    await page.goto('/advanced-scan');
    
    // Select username scan type
    await page.click('select[name="scanType"]');
    await page.click('text=Username');
    
    // Maigret toggle should be visible
    await expect(page.locator('text=Use Maigret (OSINT username scan)')).toBeVisible();
  });

  test('should enable Maigret by default for username scans', async ({ page }) => {
    await page.goto('/advanced-scan');
    
    // Select username scan type
    await page.selectOption('select', 'username');
    
    // Maigret toggle should be checked by default
    const toggle = page.locator('#maigret-toggle');
    await expect(toggle).toBeChecked();
  });

  test('should show tooltip on help icon hover', async ({ page }) => {
    await page.goto('/advanced-scan');
    await page.selectOption('select', 'username');
    
    // Hover over help icon
    const helpIcon = page.locator('[data-testid="maigret-help"]').first();
    await helpIcon.hover();
    
    // Tooltip should appear
    await expect(page.locator('text=Checks 300+ social platforms')).toBeVisible({ timeout: 3000 });
  });

  test('should complete username scan with Maigret enabled', async ({ page }) => {
    await page.goto('/advanced-scan');
    
    // Configure scan
    await page.selectOption('select', 'username');
    await page.fill('input[placeholder*="username"]', 'testuser');
    
    // Mock the edge function response
    await page.route('**/functions/v1/providers-maigret', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          findings: [
            {
              type: 'profile_presence',
              title: 'Profile found on GitHub',
              severity: 'info',
              provider: 'maigret',
              confidence: 0.9,
              evidence: {
                site: 'GitHub',
                url: 'https://github.com/testuser',
                username: 'testuser',
                status: 'found'
              }
            }
          ]
        })
      });
    });
    
    // Start scan
    await page.click('button:has-text("Start Scan")');
    
    // Wait for results
    await expect(page.locator('text=Profile found on GitHub')).toBeVisible({ timeout: 10000 });
  });

  test('should show friendly message for no Maigret results', async ({ page }) => {
    await page.goto('/advanced-scan');
    
    // Configure scan
    await page.selectOption('select', 'username');
    await page.fill('input[placeholder*="username"]', 'nonexistent_user_12345');
    
    // Mock empty response
    await page.route('**/functions/v1/providers-maigret', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          findings: []
        })
      });
    });
    
    // Start scan
    await page.click('button:has-text("Start Scan")');
    
    // Should show friendly message
    await expect(page.locator('text=No Maigret matches found')).toBeVisible({ timeout: 10000 });
  });

  test('should disable Maigret when toggle is off', async ({ page }) => {
    await page.goto('/advanced-scan');
    
    // Select username scan type
    await page.selectOption('select', 'username');
    
    // Toggle Maigret off
    await page.click('#maigret-toggle');
    
    // Verify it's unchecked
    const toggle = page.locator('#maigret-toggle');
    await expect(toggle).not.toBeChecked();
    
    // Start scan - should not call providers-maigret
    await page.fill('input[placeholder*="username"]', 'testuser');
    
    let maigretCalled = false;
    await page.route('**/functions/v1/providers-maigret', route => {
      maigretCalled = true;
      route.fulfill({ status: 200, body: JSON.stringify({ findings: [] }) });
    });
    
    await page.click('button:has-text("Start Scan")');
    await page.waitForTimeout(2000);
    
    expect(maigretCalled).toBe(false);
  });

  test('should display confidence scores in results', async ({ page }) => {
    await page.goto('/advanced-scan');
    
    await page.selectOption('select', 'username');
    await page.fill('input[placeholder*="username"]', 'testuser');
    
    await page.route('**/functions/v1/providers-maigret', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          findings: [
            {
              type: 'profile_presence',
              title: 'Profile found on Twitter',
              severity: 'info',
              provider: 'maigret',
              confidence: 0.95,
              evidence: {
                site: 'Twitter',
                url: 'https://twitter.com/testuser',
                username: 'testuser'
              }
            }
          ]
        })
      });
    });
    
    await page.click('button:has-text("Start Scan")');
    
    // Should show confidence score
    await expect(page.locator('text=/confidence.*95/i')).toBeVisible({ timeout: 10000 });
  });

  test('should persist Maigret findings to database', async ({ page }) => {
    // This would require database access in the test
    // For now, we verify that the results are displayed
    await page.goto('/advanced-scan');
    
    await page.selectOption('select', 'username');
    await page.fill('input[placeholder*="username"]', 'testuser');
    
    await page.route('**/functions/v1/scan-orchestrate', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          scanId: 'test-scan-id',
          findings: [
            {
              id: 'finding-1',
              provider: 'maigret',
              type: 'profile_presence',
              evidence: {
                site: 'GitHub',
                url: 'https://github.com/testuser'
              }
            }
          ]
        })
      });
    });
    
    await page.click('button:has-text("Start Scan")');
    
    // Navigate to recent scans
    await page.click('text=Recent Scans');
    
    // Should show the scan with Maigret results
    await expect(page.locator('text=testuser')).toBeVisible({ timeout: 5000 });
  });
});
