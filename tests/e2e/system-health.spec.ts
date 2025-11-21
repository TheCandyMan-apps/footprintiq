import { test, expect } from '@playwright/test';

test.describe('System Health Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        refresh_token: 'mock-refresh-token',
      }));
    });
  });

  test('should display system health status', async ({ page }) => {
    await page.route('**/functions/v1/health-check', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'healthy', response_time_ms: 15 },
            edge_functions: { status: 'healthy', cold_start_ms: 120 },
            osint_workers: {
              status: 'healthy',
              maigret: { status: 'healthy', response_time_ms: 250 },
              sherlock: { status: 'healthy', response_time_ms: 180 },
              gosearch: { status: 'healthy', response_time_ms: 300 },
            },
          },
          metrics: {
            scan_queue_depth: 5,
            active_scans: 3,
            failed_scans_24h: 2,
            avg_scan_time_ms: 45000,
          },
        }),
      });
    });

    await page.goto('/admin/system-health');
    await expect(page.locator('text=System Status: Healthy')).toBeVisible();
    await expect(page.locator('text=Database')).toBeVisible();
    await expect(page.locator('text=15ms')).toBeVisible();
  });

  test('should show degraded status for slow workers', async ({ page }) => {
    await page.route('**/functions/v1/health-check', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'degraded',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'healthy', response_time_ms: 15 },
            edge_functions: { status: 'healthy', cold_start_ms: 120 },
            osint_workers: {
              status: 'degraded',
              maigret: { status: 'degraded', response_time_ms: 5500 },
              sherlock: { status: 'healthy', response_time_ms: 180 },
              gosearch: { status: 'timeout', error: 'Connection timeout' },
            },
          },
          metrics: {
            scan_queue_depth: 50,
            active_scans: 10,
            failed_scans_24h: 25,
            avg_scan_time_ms: 120000,
          },
        }),
      });
    });

    await page.goto('/admin/system-health');
    await expect(page.locator('text=System Status: Degraded')).toBeVisible();
    await expect(page.locator('text=Connection timeout')).toBeVisible();
  });

  test('should auto-refresh health data', async ({ page }) => {
    let callCount = 0;

    await page.route('**/functions/v1/health-check', async (route) => {
      callCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'healthy', response_time_ms: 15 },
            edge_functions: { status: 'healthy', cold_start_ms: 120 },
            osint_workers: { status: 'healthy' },
          },
          metrics: {
            scan_queue_depth: callCount,
            active_scans: 0,
            failed_scans_24h: 0,
            avg_scan_time_ms: 45000,
          },
        }),
      });
    });

    await page.goto('/admin/system-health');
    await page.waitForTimeout(35000); // Wait for auto-refresh (30s interval)
    expect(callCount).toBeGreaterThan(1);
  });

  test('should display scan queue metrics', async ({ page }) => {
    await page.route('**/functions/v1/health-check', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'healthy', response_time_ms: 15 },
            edge_functions: { status: 'healthy', cold_start_ms: 120 },
            osint_workers: { status: 'healthy' },
          },
          metrics: {
            scan_queue_depth: 42,
            active_scans: 8,
            failed_scans_24h: 5,
            avg_scan_time_ms: 67000,
          },
        }),
      });
    });

    await page.goto('/admin/system-health');
    await expect(page.locator('text=Queue: 42')).toBeVisible();
    await expect(page.locator('text=Active: 8')).toBeVisible();
    await expect(page.locator('text=Failed (24h): 5')).toBeVisible();
  });
});
