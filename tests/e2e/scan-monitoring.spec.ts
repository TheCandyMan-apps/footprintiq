import { test, expect } from '@playwright/test';

test.describe('Scan Monitoring Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        refresh_token: 'mock-refresh-token',
      }));
    });
  });

  test('should display real-time scan metrics', async ({ page }) => {
    await page.route('**/rest/v1/scans*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            status: 'pending',
            scan_type: 'username',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            status: 'processing',
            scan_type: 'email',
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            status: 'completed',
            scan_type: 'phone',
            created_at: new Date(Date.now() - 60000).toISOString(),
            completed_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto('/admin/dashboard');
    await expect(page.locator('text=Queue: 1')).toBeVisible();
    await expect(page.locator('text=Active: 1')).toBeVisible();
    await expect(page.locator('text=Completed (1h): 1')).toBeVisible();
  });

  test('should show performance metrics', async ({ page }) => {
    await page.route('**/rest/v1/scans*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            status: 'completed',
            scan_type: 'username',
            created_at: new Date(Date.now() - 120000).toISOString(),
            completed_at: new Date(Date.now() - 60000).toISOString(),
          },
          {
            id: '2',
            status: 'completed',
            scan_type: 'email',
            created_at: new Date(Date.now() - 100000).toISOString(),
            completed_at: new Date(Date.now() - 50000).toISOString(),
          },
        ]),
      });
    });

    await page.goto('/admin/dashboard');
    await expect(page.locator('text=Avg Time:')).toBeVisible();
    await expect(page.locator('text=55s')).toBeVisible(); // Average of 60s and 50s
  });

  test('should auto-refresh metrics', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/rest/v1/scans*', async (route) => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: `scan-${requestCount}`,
            status: 'pending',
            scan_type: 'username',
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto('/admin/dashboard');
    await page.waitForTimeout(35000); // Wait for auto-refresh
    expect(requestCount).toBeGreaterThan(1);
  });

  test('should display timeout warnings', async ({ page }) => {
    await page.route('**/rest/v1/scans*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            status: 'timeout',
            scan_type: 'username',
            created_at: new Date(Date.now() - 600000).toISOString(),
            completed_at: new Date().toISOString(),
          },
          {
            id: '2',
            status: 'timeout',
            scan_type: 'email',
            created_at: new Date(Date.now() - 500000).toISOString(),
            completed_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto('/admin/dashboard');
    await expect(page.locator('text=Timeouts (24h): 2')).toBeVisible();
  });
});
