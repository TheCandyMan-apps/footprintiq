import { test, expect } from '@playwright/test';

test.describe('Scan Timeout Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-user-token',
        refresh_token: 'mock-refresh-token',
      }));
    });
  });

  test('should timeout scan after 5 minutes', async ({ page }) => {
    let scanStatus = 'pending';
    const scanStartTime = Date.now();

    await page.route('**/rest/v1/scans*', async (route) => {
      const method = route.request().method();
      
      if (method === 'GET') {
        // After 5 minutes, mark as timeout
        if (Date.now() - scanStartTime > 300000) {
          scanStatus = 'timeout';
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: 'test-scan-123',
            status: scanStatus,
            scan_type: 'username',
            target: 'testuser',
            created_at: new Date(scanStartTime).toISOString(),
            completed_at: scanStatus === 'timeout' ? new Date().toISOString() : null,
          }]),
        });
      } else if (method === 'PATCH') {
        scanStatus = 'timeout';
        await route.fulfill({ status: 200 });
      }
    });

    await page.goto('/scan/usernames');
    // Simulate scan timeout by fast-forwarding time
    await page.clock.install();
    await page.clock.fastForward(305000); // 5 minutes + 5 seconds
    
    await expect(page.locator('text=timeout')).toBeVisible();
  });

  test('should log timeout to system_errors', async ({ page }) => {
    let errorLogged = false;

    await page.route('**/rest/v1/system_errors*', async (route) => {
      if (route.request().method() === 'POST') {
        errorLogged = true;
        const body = route.request().postDataJSON();
        expect(body.function_name).toBe('scan-orchestrate');
        expect(body.error_message).toContain('timeout');
        await route.fulfill({ status: 201 });
      }
    });

    await page.route('**/functions/v1/scan-orchestrate', async (route) => {
      // Simulate a scan that will timeout
      await page.waitForTimeout(305000);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jobId: 'test-timeout-scan' }),
      });
    });

    expect(errorLogged).toBe(true);
  });

  test('should cleanup stuck scans older than 15 minutes', async ({ page }) => {
    await page.route('**/functions/v1/cleanup-stuck-scans', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          cleaned_count: 15,
          message: 'Cleaned up 15 stuck scans',
        }),
      });
    });

    await page.route('**/rest/v1/scans*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'old-scan-1',
            status: 'timeout',
            scan_type: 'username',
            target: 'olduser',
            created_at: new Date(Date.now() - 1000000).toISOString(),
            completed_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto('/admin/system-health');
    await expect(page.locator('text=15 stuck scans cleaned')).toBeVisible();
  });
});
