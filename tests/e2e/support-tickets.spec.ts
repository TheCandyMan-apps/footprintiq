import { test, expect } from '@playwright/test';

test.describe('Support Ticket System', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should create support ticket successfully', async ({ page }) => {
    await page.goto('/support');
    
    // Fill out support form
    await page.fill('input[name="subject"]', 'Test Support Issue');
    await page.fill('textarea[name="description"]', 'This is a detailed description of my issue.');
    await page.selectOption('select[name="category"]', 'technical');
    
    // Mock the edge function response
    await page.route('**/functions/v1/create-support-ticket', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'ticket-123',
          subject: 'Test Support Issue',
          status: 'open',
          priority: 'medium'
        })
      });
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('text=Ticket created successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/support');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Verify validation errors
    await expect(page.locator('text=Subject is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });

  test('should show error on API failure', async ({ page }) => {
    await page.goto('/support');
    
    await page.fill('input[name="subject"]', 'Test Issue');
    await page.fill('textarea[name="description"]', 'Description');
    
    // Mock API error
    await page.route('**/functions/v1/create-support-ticket', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Failed to create ticket')).toBeVisible();
  });
});

test.describe('Admin Support Ticket Management', () => {
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

  test('should display support tickets list', async ({ page }) => {
    // Mock admin tickets list
    await page.route('**/functions/v1/admin-list-tickets*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tickets: [
            {
              id: 'ticket-1',
              subject: 'Login Issue',
              status: 'open',
              priority: 'high',
              created_at: new Date().toISOString()
            },
            {
              id: 'ticket-2',
              subject: 'Feature Request',
              status: 'in_progress',
              priority: 'low',
              created_at: new Date().toISOString()
            }
          ],
          total: 2
        })
      });
    });

    await page.goto('/admin/support-tickets');
    
    await expect(page.locator('text=Login Issue')).toBeVisible();
    await expect(page.locator('text=Feature Request')).toBeVisible();
  });

  test('should filter tickets by status', async ({ page }) => {
    await page.route('**/functions/v1/admin-list-tickets*', async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');
      
      const allTickets = [
        { id: '1', subject: 'Open Ticket', status: 'open', priority: 'high', created_at: new Date().toISOString() },
        { id: '2', subject: 'Closed Ticket', status: 'closed', priority: 'low', created_at: new Date().toISOString() }
      ];
      
      const filtered = status ? allTickets.filter(t => t.status === status) : allTickets;
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tickets: filtered, total: filtered.length })
      });
    });

    await page.goto('/admin/support-tickets');
    
    // Filter by open
    await page.selectOption('select[name="status"]', 'open');
    await expect(page.locator('text=Open Ticket')).toBeVisible();
    await expect(page.locator('text=Closed Ticket')).not.toBeVisible();
  });
});
