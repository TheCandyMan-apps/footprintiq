import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Comprehensive E2E tests for scan flow
 * Tests: Sign-in → Scan → Results with various edge cases
 */

test.describe('Scan Flow E2E', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
  });

  test.describe('Authentication Flow', () => {
    test('should redirect unauthenticated users to auth page', async () => {
      await page.goto('/scan/usernames');
      await expect(page).toHaveURL(/\/auth/);
    });

    test('should complete sign-in and access scan page', async () => {
      // Navigate to auth page
      await page.goto('/auth');
      
      // Fill in sign-in form
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      
      // Click sign-in button
      await page.click('button:has-text("Sign In")');
      
      // Should redirect to home or dashboard
      await expect(page).not.toHaveURL(/\/auth/);
      
      // Should be able to access scan page
      await page.goto('/scan/usernames');
      await expect(page).toHaveURL(/\/scan\/usernames/);
    });
  });

  test.describe('Username Scan Flow', () => {
    test.beforeEach(async () => {
      // Mock authentication
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            access_token: 'mock-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          }
        }));
      });
    });

    test('should complete full scan flow with results', async () => {
      // Navigate to username scan page
      await page.goto('/scan/usernames');
      
      // Fill in username
      await page.fill('input[placeholder*="username" i]', 'johndoe');
      
      // Start scan
      await page.click('button:has-text("Start Scan")');
      
      // Should show loading state
      await expect(page.locator('text=/scanning|processing/i')).toBeVisible({ timeout: 5000 });
      
      // Wait for results page
      await expect(page).toHaveURL(/\/scan\/usernames\/results\//, { timeout: 30000 });
      
      // Should display results
      await expect(page.locator('text=/results|findings/i')).toBeVisible();
    });

    test('should handle empty scan results gracefully', async () => {
      // Mock empty results
      await page.route('**/functions/v1/**', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ findings: [] }),
        });
      });

      await page.goto('/scan/usernames');
      await page.fill('input[placeholder*="username" i]', 'nonexistent_user_12345');
      await page.click('button:has-text("Start Scan")');
      
      // Should complete without error
      await expect(page).toHaveURL(/\/scan\/usernames\/results\//, { timeout: 30000 });
      
      // Should show "no results" message
      await expect(page.locator('text=/no findings|no results/i')).toBeVisible();
    });

    test('should handle scan timeout errors', async () => {
      // Mock timeout
      await page.route('**/functions/v1/**', (route) => {
        setTimeout(() => {
          route.fulfill({
            status: 408,
            body: JSON.stringify({ error: 'Request timeout' }),
          });
        }, 1000);
      });

      await page.goto('/scan/usernames');
      await page.fill('input[placeholder*="username" i]', 'timeout_test');
      await page.click('button:has-text("Start Scan")');
      
      // Should show error message
      await expect(page.locator('text=/timeout|error|failed/i')).toBeVisible({ timeout: 10000 });
    });

    test('should handle API rate limiting', async () => {
      // Mock rate limit response
      await page.route('**/functions/v1/**', (route) => {
        route.fulfill({
          status: 429,
          body: JSON.stringify({ error: 'Rate limit exceeded' }),
        });
      });

      await page.goto('/scan/usernames');
      await page.fill('input[placeholder*="username" i]', 'rate_limit_test');
      await page.click('button:has-text("Start Scan")');
      
      // Should show rate limit error
      await expect(page.locator('text=/rate limit|too many requests/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Advanced Scan Options', () => {
    test.beforeEach(async () => {
      // Mock authentication
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            access_token: 'mock-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          }
        }));
      });
    });

    test('should open and configure advanced scan dialog', async () => {
      await page.goto('/scan/usernames');
      
      // Open advanced scan dialog
      await page.click('button:has-text("Advanced Scan")');
      
      // Should show advanced options
      await expect(page.locator('text=/deep web|social media|face recognition/i')).toBeVisible();
      
      // Configure options
      await page.check('input[type="checkbox"][name*="deepweb" i]');
      await page.check('input[type="checkbox"][name*="social" i]');
      
      // Verify checkboxes are checked
      await expect(page.locator('input[type="checkbox"][name*="deepweb" i]')).toBeChecked();
      await expect(page.locator('input[type="checkbox"][name*="social" i]')).toBeChecked();
    });

    test('should require premium for advanced features', async () => {
      // Mock non-premium user
      await page.route('**/rest/v1/profiles*', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify([{ 
            is_premium: false,
            credits_balance: 100 
          }]),
        });
      });

      await page.goto('/scan/usernames');
      await page.click('button:has-text("Advanced Scan")');
      
      // Try to enable premium feature
      await page.check('input[type="checkbox"][name*="face" i]');
      
      // Should show upgrade prompt
      await expect(page.locator('text=/upgrade|premium required/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Results Page Functionality', () => {
    test.beforeEach(async () => {
      // Mock authentication and scan results
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            access_token: 'mock-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          }
        }));
      });

      // Mock scan results
      await page.route('**/rest/v1/scan_results*', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify([{
            id: 'scan-123',
            findings: [
              {
                id: 'finding-1',
                type: 'social_media',
                title: 'Profile Found',
                severity: 'info',
                provider: 'Twitter',
                evidence: [{ key: 'username', value: 'johndoe' }]
              },
              {
                id: 'finding-2',
                type: 'breach',
                title: 'Data Breach',
                severity: 'high',
                provider: 'HIBP',
                evidence: [{ key: 'breach', value: 'Example Breach 2020' }]
              }
            ],
            status: 'completed'
          }]),
        });
      });
    });

    test('should display scan results with findings', async () => {
      await page.goto('/scan/usernames/results/scan-123');
      
      // Should display findings
      await expect(page.locator('text=/profile found/i')).toBeVisible();
      await expect(page.locator('text=/data breach/i')).toBeVisible();
      
      // Should show severity indicators
      await expect(page.locator('text=/high|critical/i')).toBeVisible();
    });

    test('should export results as PDF', async () => {
      await page.goto('/scan/usernames/results/scan-123');
      
      // Wait for results to load
      await expect(page.locator('text=/findings|results/i')).toBeVisible();
      
      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export")');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });

    test('should navigate back to scan page', async () => {
      await page.goto('/scan/usernames/results/scan-123');
      
      // Click back button
      await page.click('button:has-text("Back")');
      
      // Should return to scan page
      await expect(page).toHaveURL(/\/scan\/usernames$/);
    });
  });

  test.describe('Credit System Integration', () => {
    test.beforeEach(async () => {
      // Mock authentication
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            access_token: 'mock-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          }
        }));
      });
    });

    test('should display credit balance in header', async () => {
      // Mock credit balance
      await page.route('**/rest/v1/profiles*', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify([{ 
            credits_balance: 150,
            is_premium: false 
          }]),
        });
      });

      await page.goto('/scan/usernames');
      
      // Should show credit balance
      await expect(page.locator('text=/150.*credit/i')).toBeVisible();
    });

    test('should warn on low credit balance', async () => {
      // Mock low credit balance
      await page.route('**/rest/v1/profiles*', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify([{ 
            credits_balance: 25,
            is_premium: false 
          }]),
        });
      });

      await page.goto('/scan/usernames');
      
      // Should show low balance warning
      await expect(page.locator('text=/low.*credit|running low/i')).toBeVisible({ timeout: 5000 });
    });

    test('should prevent scan with insufficient credits', async () => {
      // Mock zero credits
      await page.route('**/rest/v1/profiles*', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify([{ 
            credits_balance: 0,
            is_premium: false 
          }]),
        });
      });

      await page.goto('/scan/usernames');
      await page.fill('input[placeholder*="username" i]', 'test');
      await page.click('button:has-text("Start Scan")');
      
      // Should show insufficient credits error
      await expect(page.locator('text=/insufficient.*credit|no.*credit/i')).toBeVisible();
    });
  });

  test.describe('Error Boundary Coverage', () => {
    test('should handle network failures gracefully', async () => {
      // Mock network failure
      await page.route('**/functions/v1/**', (route) => {
        route.abort('failed');
      });

      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            access_token: 'mock-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          }
        }));
      });

      await page.goto('/scan/usernames');
      await page.fill('input[placeholder*="username" i]', 'network_fail');
      await page.click('button:has-text("Start Scan")');
      
      // Should show network error
      await expect(page.locator('text=/network.*error|connection.*failed/i')).toBeVisible({ timeout: 10000 });
      
      // Should offer retry option
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
    });

    test('should recover from component errors', async () => {
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            access_token: 'mock-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          }
        }));
      });

      await page.goto('/scan/usernames/results/invalid-scan-id');
      
      // Should show error boundary
      await expect(page.locator('text=/error|something went wrong/i')).toBeVisible();
      
      // Should offer navigation back
      await expect(page.locator('button:has-text("Back")')).toBeVisible();
    });
  });
});
