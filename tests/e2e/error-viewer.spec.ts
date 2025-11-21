import { test, expect } from '@playwright/test';

test.describe('Admin Error Viewer', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        refresh_token: 'mock-refresh-token',
      }));
    });
  });

  test('should display error logs', async ({ page }) => {
    await page.route('**/functions/v1/admin-get-errors', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            {
              id: '1',
              function_name: 'scan-orchestrate',
              error_message: 'Timeout after 5 minutes',
              severity: 'error',
              created_at: new Date().toISOString(),
              metadata: { scan_id: 'test-123' },
            },
            {
              id: '2',
              function_name: 'provider-proxy',
              error_message: 'Provider unavailable',
              severity: 'warning',
              created_at: new Date().toISOString(),
              metadata: { provider: 'maigret' },
            },
          ],
          total: 2,
          stats: {
            total: 2,
            by_severity: { error: 1, warning: 1, info: 0 },
            by_function: { 'scan-orchestrate': 1, 'provider-proxy': 1 },
          },
        }),
      });
    });

    await page.goto('/admin/errors');
    await expect(page.locator('text=Timeout after 5 minutes')).toBeVisible();
    await expect(page.locator('text=Provider unavailable')).toBeVisible();
  });

  test('should filter by severity', async ({ page }) => {
    await page.route('**/functions/v1/admin-get-errors*', async (route) => {
      const url = new URL(route.request().url());
      const severity = url.searchParams.get('severity');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: severity === 'error' ? [
            {
              id: '1',
              function_name: 'scan-orchestrate',
              error_message: 'Timeout after 5 minutes',
              severity: 'error',
              created_at: new Date().toISOString(),
            },
          ] : [],
          total: severity === 'error' ? 1 : 0,
          stats: {
            total: 1,
            by_severity: { error: 1, warning: 0, info: 0 },
            by_function: { 'scan-orchestrate': 1 },
          },
        }),
      });
    });

    await page.goto('/admin/errors');
    await page.selectOption('select[name="severity"]', 'error');
    await expect(page.locator('text=Timeout after 5 minutes')).toBeVisible();
  });

  test('should delete error', async ({ page }) => {
    let errorDeleted = false;

    await page.route('**/functions/v1/admin-get-errors', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: errorDeleted ? [] : [
            {
              id: '1',
              function_name: 'scan-orchestrate',
              error_message: 'Test error',
              severity: 'error',
              created_at: new Date().toISOString(),
            },
          ],
          total: errorDeleted ? 0 : 1,
          stats: {
            total: errorDeleted ? 0 : 1,
            by_severity: { error: errorDeleted ? 0 : 1 },
            by_function: {},
          },
        }),
      });
    });

    await page.route('**/rest/v1/system_errors*', async (route) => {
      if (route.request().method() === 'DELETE') {
        errorDeleted = true;
        await route.fulfill({ status: 204 });
      }
    });

    await page.goto('/admin/errors');
    await expect(page.locator('text=Test error')).toBeVisible();
    await page.click('button:has-text("Delete")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Test error')).not.toBeVisible();
  });

  test('should display error statistics', async ({ page }) => {
    await page.route('**/functions/v1/admin-get-errors', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [],
          total: 150,
          stats: {
            total: 150,
            by_severity: { error: 80, warning: 50, info: 20 },
            by_function: {
              'scan-orchestrate': 60,
              'provider-proxy': 40,
              'cleanup-stuck-scans': 30,
            },
          },
        }),
      });
    });

    await page.goto('/admin/errors');
    await expect(page.locator('text=Total: 150')).toBeVisible();
    await expect(page.locator('text=Errors: 80')).toBeVisible();
    await expect(page.locator('text=Warnings: 50')).toBeVisible();
  });
});
