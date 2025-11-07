import { test, expect } from '@playwright/test';

test.describe('Advanced Scan - Batch Upload & Geocoding', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to advanced scan page
    await page.goto('/scan/advanced');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should show batch mode toggle for email scans', async ({ page }) => {
    // Select email scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    
    // Check batch mode button exists
    const batchButton = page.getByRole('button', { name: /batch mode/i });
    await expect(batchButton).toBeVisible();
  });

  test('should upload CSV file and display batch items', async ({ page }) => {
    // Select email scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Create test CSV content
    const csvContent = `email
test1@example.com
test2@example.com
test3@example.com
test4@example.com
test5@example.com
test6@example.com
test7@example.com
test8@example.com
test9@example.com
test10@example.com`;
    
    // Upload CSV (simulated)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    // Create a mock CSV file
    await fileChooser.setFiles({
      name: 'test-emails.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for upload to process
    await page.waitForTimeout(1000);
    
    // Check items loaded message
    await expect(page.getByText(/10 email\(s\) loaded/i)).toBeVisible();
    
    // Verify some items are displayed
    await expect(page.getByText('test1@example.com')).toBeVisible();
    await expect(page.getByText('test2@example.com')).toBeVisible();
  });

  test('should show map preview for IP batch scans', async ({ page }) => {
    // Select IP scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'ip');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Create test CSV with IPs
    const csvContent = `ip
8.8.8.8
1.1.1.1
208.67.222.222`;
    
    // Upload CSV
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test-ips.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for geocoding and map to load
    await page.waitForTimeout(3000);
    
    // Check for IP locations heading
    await expect(page.getByText(/ip locations/i)).toBeVisible();
    
    // Check for map container
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Verify at least one location marker
    await expect(page.getByText('8.8.8.8')).toBeVisible();
  });

  test('should show dark web policy warning', async ({ page }) => {
    // Enable dark web scanning
    await page.getByLabel(/darkweb sources/i).check();
    
    // Check policy warning is visible
    await expect(page.getByText(/dark web scanning policy/i)).toBeVisible();
    
    // Check policy details
    await expect(page.getByText(/results may include illegal or disturbing content/i)).toBeVisible();
    await expect(page.getByText(/additional credits will be consumed/i)).toBeVisible();
    
    // Policy checkbox should be present
    const policyCheckbox = page.getByLabel(/i accept the dark web scanning policy/i);
    await expect(policyCheckbox).toBeVisible();
    
    // Depth selector should be hidden until policy is accepted
    await expect(page.getByText(/dark web crawl depth/i)).not.toBeVisible();
    
    // Accept policy
    await policyCheckbox.check();
    
    // Now depth selector should be visible
    await expect(page.getByText(/dark web crawl depth/i)).toBeVisible();
  });

  test('should validate CSV format and reject invalid entries', async ({ page }) => {
    // Select email scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Create CSV with invalid emails
    const csvContent = `email
valid@example.com
invalid-email
another@example.com
notanemail
test@example.com`;
    
    // Upload CSV
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'mixed-emails.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for processing
    await page.waitForTimeout(1000);
    
    // Should show warning about skipped items
    await expect(page.getByText(/skipped.*invalid/i)).toBeVisible();
    
    // Should only load valid emails (3 out of 5)
    await expect(page.getByText(/3 email\(s\) loaded/i)).toBeVisible();
  });

  test('should enforce premium check for batch scans', async ({ page }) => {
    // Assume standard user (mock this in test setup)
    
    // Select email scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Upload multiple items
    const csvContent = `email
test1@example.com
test2@example.com`;
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test-emails.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    await page.waitForTimeout(1000);
    
    // Try to scan
    await page.getByRole('button', { name: /scan.*target/i }).click();
    
    // Should show premium required message
    await expect(page.getByText(/batch scanning requires a premium subscription/i)).toBeVisible();
  });

  test('should handle geocoding errors gracefully', async ({ page }) => {
    // Select IP scan type
    await page.selectOption('[data-testid="scan-type-select"]', 'ip');
    
    // Click batch mode
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Create CSV with invalid IP
    const csvContent = `ip
999.999.999.999
256.1.1.1`;
    
    // Upload CSV
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'invalid-ips.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for processing
    await page.waitForTimeout(1000);
    
    // Should show no valid items message
    await expect(page.getByText(/no valid items found/i)).toBeVisible();
  });

  test('should display scan button text based on mode and items', async ({ page }) => {
    // Initially should show "Start Comprehensive Scan"
    await expect(page.getByRole('button', { name: /start comprehensive scan/i })).toBeVisible();
    
    // Switch to batch mode
    await page.selectOption('[data-testid="scan-type-select"]', 'email');
    await page.getByRole('button', { name: /batch mode/i }).click();
    
    // Upload items
    const csvContent = `email
test1@example.com
test2@example.com
test3@example.com`;
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/upload csv file/i).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test-emails.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    await page.waitForTimeout(1000);
    
    // Button text should update to show number of targets
    await expect(page.getByRole('button', { name: /scan 3 targets/i })).toBeVisible();
  });
});

test.describe('Advanced Scan - Error Handling', () => {
  test('should show error toast for failed scans', async ({ page }) => {
    await page.goto('/scan/advanced');
    await page.waitForLoadState('networkidle');
    
    // Enter invalid target
    await page.fill('input[placeholder*="Enter"]', 'invalid');
    
    // Try to scan
    await page.getByRole('button', { name: /start comprehensive scan/i }).click();
    
    // Should show error toast
    await expect(page.getByText(/scan failed/i)).toBeVisible({ timeout: 5000 });
  });

  test('should prevent scan without authentication', async ({ page }) => {
    // Clear any auth state
    await page.context().clearCookies();
    
    await page.goto('/scan/advanced');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to auth or show error
    await expect(page.url()).toContain('/auth');
  });
});
