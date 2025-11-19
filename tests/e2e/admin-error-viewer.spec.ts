import { test, expect } from '@playwright/test';

test.describe('Admin Error Viewer', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        user: { id: 'admin-user-id', email: 'admin@example.com' }
      }));
    });
  });

  test('should display error logs', async ({ page }) => {
    await page.route('**/functions/v1/admin-get-errors*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            {
              id: 'error-1',
              function: 'run-scan',
              severity: 'error',
              message: 'Timeout connecting to provider',
              timestamp: new Date().toISOString(),
              metadata: { provider: 'maigret', scanId: 'scan-123' }
            },
            {
              id: 'error-2',
              function: 'create-support-ticket',
              severity: 'warning',
              message: 'Rate limit approached',
              timestamp: new Date().toISOString(),
              metadata: { userId: 'user-456' }
            }
          ],
          total: 2
        })
      });
    });

    await page.goto('/admin/error-logs');
    
    await expect(page.locator('text=Timeout connecting to provider')).toBeVisible();
    await expect(page.locator('text=Rate limit approached')).toBeVisible();
  });

  test('should filter errors by severity', async ({ page }) => {
    await page.route('**/functions/v1/admin-get-errors*', async (route) => {
      const url = new URL(route.request().url());
      const severity = url.searchParams.get('severity');
      
      const allErrors = [
        { id: '1', function: 'test', severity: 'error', message: 'Critical error', timestamp: new Date().toISOString() },
        { id: '2', function: 'test', severity: 'warning', message: 'Warning message', timestamp: new Date().toISOString() }
      ];
      
      const filtered = severity ? allErrors.filter(e => e.severity === severity) : allErrors;
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ errors: filtered, total: filtered.length })
      });
    });

    await page.goto('/admin/error-logs');
    
    // Filter by error severity
    await page.selectOption('select[name="severity"]', 'error');
    await expect(page.locator('text=Critical error')).toBeVisible();
    await expect(page.locator('text=Warning message')).not.toBeVisible();
  });

  test('should filter errors by function', async ({ page }) => {
    await page.route('**/functions/v1/admin-get-errors*', async (route) => {
      const url = new URL(route.request().url());
      const functionName = url.searchParams.get('function');
      
      const allErrors = [
        { id: '1', function: 'run-scan', severity: 'error', message: 'Scan error', timestamp: new Date().toISOString() },
        { id: '2', function: 'create-ticket', severity: 'error', message: 'Ticket error', timestamp: new Date().toISOString() }
      ];
      
      const filtered = functionName ? allErrors.filter(e => e.function === functionName) : allErrors;
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ errors: filtered, total: filtered.length })
      });
    });

    await page.goto('/admin/error-logs');
    
    await page.selectOption('select[name="function"]', 'run-scan');
    await expect(page.locator('text=Scan error')).toBeVisible();
    await expect(page.locator('text=Ticket error')).not.toBeVisible();
  });

  test('should show error details in modal', async ({ page }) => {
    await page.route('**/functions/v1/admin-get-errors*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [{
            id: 'error-1',
            function: 'run-scan',
            severity: 'error',
            message: 'Provider timeout',
            timestamp: new Date().toISOString(),
            stackTrace: 'Error: Timeout\n  at Provider.call\n  at async run',
            metadata: { provider: 'maigret', scanId: 'scan-123' }
          }],
          total: 1
        })
      });
    });

    await page.goto('/admin/error-logs');
    
    // Click on error to view details
    await page.click('text=Provider timeout');
    
    // Verify modal shows stack trace and metadata
    await expect(page.locator('text=Error: Timeout')).toBeVisible();
    await expect(page.locator('text=scan-123')).toBeVisible();
  });
});
