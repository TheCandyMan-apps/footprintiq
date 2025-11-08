import { test, expect } from '@playwright/test';

test.describe('Subscription Upgrade E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full upgrade flow from sign-in to premium features', async ({ page }) => {
    // Step 1: Sign in
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@footprintiq.app');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Step 2: Navigate to billing
    await page.click('[href*="/settings/billing"]');
    await expect(page).toHaveURL(/\/settings\/billing/);

    // Step 3: Check current plan is Free
    await expect(page.locator('text=free').first()).toBeVisible();

    // Step 4: Click upgrade to Pro
    const upgradeButton = page.locator('button:has-text("Pro ($15/mo)")').first();
    await upgradeButton.click();

    // Step 5: Wait for Stripe checkout dialog
    await expect(page.locator('text=Pro Plan')).toBeVisible({ timeout: 5000 });

    // Step 6: Fill in test card details (Stripe test mode)
    const cardNumberFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
    await cardNumberFrame.locator('input[name="exp-date"]').fill('12/34');
    await cardNumberFrame.locator('input[name="cvc"]').fill('123');
    await cardNumberFrame.locator('input[name="postal"]').fill('12345');

    // Step 7: Submit payment
    await page.click('button:has-text("Subscribe")');

    // Step 8: Wait for verification loader
    await expect(page.locator('text=Verifying upgrade')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Processing your upgrade')).toBeVisible();

    // Step 9: Wait for success message (max 30s polling)
    await expect(page.locator('text=Upgrade Successful')).toBeVisible({ timeout: 35000 });

    // Step 10: Verify premium badge is now visible
    await expect(page.locator('text=Active').first()).toBeVisible();

    // Step 11: Verify premium tier is shown
    await expect(page.locator('text=pro').first()).toBeVisible();

    // Step 12: Navigate to dashboard and verify premium features
    await page.click('[href*="/dashboard"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify premium features are unlocked (e.g., unlimited scans)
    await expect(page.locator('text=Unlimited Scans')).toBeVisible({ timeout: 5000 });

    // Step 13: Try to start a scan (premium feature)
    const newScanButton = page.locator('button:has-text("New Scan")').first();
    if (await newScanButton.isVisible()) {
      await newScanButton.click();
      // Should not show upgrade prompt
      await expect(page.locator('text=Upgrade to continue')).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('should show error boundary on payment failure', async ({ page }) => {
    // Sign in
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@footprintiq.app');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to billing
    await page.click('[href*="/settings/billing"]');

    // Click upgrade
    await page.click('button:has-text("Pro ($15/mo)")');

    // Fill in declined test card (Stripe test mode)
    const cardNumberFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('input[name="cardnumber"]').fill('4000000000000002'); // Declined card
    await cardNumberFrame.locator('input[name="exp-date"]').fill('12/34');
    await cardNumberFrame.locator('input[name="cvc"]').fill('123');
    await cardNumberFrame.locator('input[name="postal"]').fill('12345');

    // Submit payment
    await page.click('button:has-text("Subscribe")');

    // Should show error message or retry option
    await expect(page.locator('text=declined').or(page.locator('text=failed'))).toBeVisible({ 
      timeout: 10000 
    });
  });

  test('should handle verification timeout gracefully', async ({ page }) => {
    // Mock slow webhook response by intercepting API calls
    await page.route('**/billing/check-subscription', async (route) => {
      // Delay response to simulate slow webhook
      await new Promise(resolve => setTimeout(resolve, 35000));
      await route.continue();
    });

    // Sign in
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@footprintiq.app');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to billing
    await page.click('[href*="/settings/billing"]');

    // Click upgrade
    await page.click('button:has-text("Pro ($15/mo)")');

    // Fill in card
    const cardNumberFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
    await cardNumberFrame.locator('input[name="exp-date"]').fill('12/34');
    await cardNumberFrame.locator('input[name="cvc"]').fill('123');
    await cardNumberFrame.locator('input[name="postal"]').fill('12345');

    // Submit
    await page.click('button:has-text("Subscribe")');

    // Should show timeout message after 30s
    await expect(page.locator('text=Verification Timeout')).toBeVisible({ timeout: 35000 });
    await expect(page.locator('text=support@footprintiq.app')).toBeVisible();
  });

  test('should allow retry after failure', async ({ page }) => {
    // Sign in
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@footprintiq.app');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to billing
    await page.click('[href*="/settings/billing"]');

    // First attempt with declined card
    await page.click('button:has-text("Pro ($15/mo)")');
    
    let cardNumberFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('input[name="cardnumber"]').fill('4000000000000002'); // Declined
    await cardNumberFrame.locator('input[name="exp-date"]').fill('12/34');
    await cardNumberFrame.locator('input[name="cvc"]').fill('123');
    await cardNumberFrame.locator('input[name="postal"]').fill('12345');
    
    await page.click('button:has-text("Subscribe")');
    
    // Wait for error
    await expect(page.locator('text=declined').or(page.locator('text=failed'))).toBeVisible({ 
      timeout: 10000 
    });

    // Close dialog and retry
    await page.click('button:has-text("Cancel")');
    await page.click('button:has-text("Pro ($15/mo)")');

    // Second attempt with valid card
    cardNumberFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('input[name="cardnumber"]').fill('4242424242424242'); // Valid
    await cardNumberFrame.locator('input[name="exp-date"]').fill('12/34');
    await cardNumberFrame.locator('input[name="cvc"]').fill('123');
    await cardNumberFrame.locator('input[name="postal"]').fill('12345');
    
    await page.click('button:has-text("Subscribe")');

    // Should succeed
    await expect(page.locator('text=Upgrade Successful')).toBeVisible({ timeout: 35000 });
  });
});
