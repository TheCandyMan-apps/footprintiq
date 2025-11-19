import { test, expect } from '@playwright/test';

test.describe('Intelligence Dashboard', () => {
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

  test('should load dashboard metrics', async ({ page }) => {
    // Mock metrics API
    await page.route('**/functions/v1/get-dashboard-metrics*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalScans: 1250,
          activeUsers: 89,
          scansByType: [
            { type: 'username', count: 450 },
            { type: 'email', count: 380 },
            { type: 'phone', count: 420 }
          ],
          providerPerformance: [
            { provider: 'maigret', successRate: 0.95, avgResponseTime: 2500 },
            { provider: 'spiderfoot', successRate: 0.88, avgResponseTime: 3200 }
          ],
          recentErrors: [
            { function: 'run-scan', count: 5, lastOccurred: new Date().toISOString() }
          ],
          systemHealth: {
            status: 'healthy',
            uptime: 99.8
          }
        })
      });
    });

    await page.goto('/intelligence-dashboard');
    
    // Verify metrics are displayed
    await expect(page.locator('text=1250')).toBeVisible(); // Total scans
    await expect(page.locator('text=89')).toBeVisible(); // Active users
    await expect(page.locator('text=95%')).toBeVisible(); // Success rate
  });

  test('should handle date range selection', async ({ page }) => {
    let requestedDateRange = null;
    
    await page.route('**/functions/v1/get-dashboard-metrics*', async (route) => {
      const url = new URL(route.request().url());
      requestedDateRange = {
        startDate: url.searchParams.get('startDate'),
        endDate: url.searchParams.get('endDate')
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalScans: 500,
          activeUsers: 45,
          scansByType: [],
          providerPerformance: [],
          recentErrors: [],
          systemHealth: { status: 'healthy', uptime: 99.9 }
        })
      });
    });

    await page.goto('/intelligence-dashboard');
    
    // Select date range
    await page.click('button:has-text("Last 7 Days")');
    await page.click('text=Last 30 Days');
    
    // Verify metrics updated
    await expect(page.locator('text=500')).toBeVisible();
  });

  test('should display error state on API failure', async ({ page }) => {
    await page.route('**/functions/v1/get-dashboard-metrics*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch metrics' })
      });
    });

    await page.goto('/intelligence-dashboard');
    
    await expect(page.locator('text=Failed to load dashboard metrics')).toBeVisible();
  });

  test('should auto-refresh metrics', async ({ page }) => {
    let callCount = 0;
    
    await page.route('**/functions/v1/get-dashboard-metrics*', async (route) => {
      callCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalScans: 1000 + callCount * 10,
          activeUsers: 50,
          scansByType: [],
          providerPerformance: [],
          recentErrors: [],
          systemHealth: { status: 'healthy', uptime: 99.9 }
        })
      });
    });

    await page.goto('/intelligence-dashboard');
    
    // Initial load
    await expect(page.locator('text=1010')).toBeVisible();
    
    // Wait for auto-refresh (assuming 30s interval, use shorter for test)
    await page.waitForTimeout(2000);
    
    // Verify call count increased
    expect(callCount).toBeGreaterThan(1);
  });
});
