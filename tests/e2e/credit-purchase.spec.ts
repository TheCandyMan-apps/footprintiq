import { test, expect } from '@playwright/test';

test.describe('Credit Purchase Flow', () => {
  test('should complete credit purchase successfully', async ({ page }) => {
    // Sign in
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL('/dashboard');
    
    // Navigate to credits page
    await page.goto('/settings/credits');
    
    // Select credit package
    await page.click('button:has-text("Buy 50 Credits")');
    
    // Should redirect to Stripe Checkout
    await page.waitForURL(/.*checkout.stripe.com.*/);
    
    // Fill in test card details
    await page.fill('[data-testid="cardNumber"]', '4242424242424242');
    await page.fill('[data-testid="cardExpiry"]', '12/34');
    await page.fill('[data-testid="cardCvc"]', '123');
    await page.fill('[data-testid="billingName"]', 'Test User');
    
    // Submit payment
    await page.click('button[type="submit"]');
    
    // Should redirect back with success
    await page.waitForURL(/.*success=true.*/);
    
    // Verify credits were added
    await expect(page.locator('text=/Credits: \\d+/')).toBeVisible();
    await expect(page.locator('text=/Credits added/')).toBeVisible();
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL('/dashboard');
    await page.goto('/settings/credits');
    
    await page.click('button:has-text("Buy 50 Credits")');
    await page.waitForURL(/.*checkout.stripe.com.*/);
    
    // Use declined test card
    await page.fill('[data-testid="cardNumber"]', '4000000000000002');
    await page.fill('[data-testid="cardExpiry"]', '12/34');
    await page.fill('[data-testid="cardCvc"]', '123');
    await page.fill('[data-testid="billingName"]', 'Test User');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/declined|error|failed/i')).toBeVisible({ timeout: 10000 });
  });

  test('should validate session before purchase', async ({ page }) => {
    // Attempt to access credits page without auth
    await page.goto('/settings/credits');
    
    // Should redirect to auth
    await page.waitForURL('/auth');
  });

  test('should update credits in real-time', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL('/dashboard');
    await page.goto('/settings/credits');
    
    // Get initial credit count
    const initialCredits = await page.locator('[data-testid="credit-balance"]').textContent();
    
    // Make a purchase
    await page.click('button:has-text("Buy 50 Credits")');
    await page.waitForURL(/.*checkout.stripe.com.*/);
    
    await page.fill('[data-testid="cardNumber"]', '4242424242424242');
    await page.fill('[data-testid="cardExpiry"]', '12/34');
    await page.fill('[data-testid="cardCvc"]', '123');
    await page.fill('[data-testid="billingName"]', 'Test User');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/.*success=true.*/);
    
    // Credits should update
    await expect(page.locator('[data-testid="credit-balance"]')).not.toHaveText(initialCredits || '');
    
    // Should show confetti animation
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });
  });

  test('should retry failed purchases with new card', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL('/dashboard');
    await page.goto('/settings/credits');
    
    // First attempt with declined card
    await page.click('button:has-text("Buy 50 Credits")');
    await page.waitForURL(/.*checkout.stripe.com.*/);
    await page.fill('[data-testid="cardNumber"]', '4000000000000002');
    await page.fill('[data-testid="cardExpiry"]', '12/34');
    await page.fill('[data-testid="cardCvc"]', '123');
    await page.fill('[data-testid="billingName"]', 'Test User');
    await page.click('button[type="submit"]');
    
    // Wait for error
    await expect(page.locator('text=/declined|error/i')).toBeVisible({ timeout: 10000 });
    
    // Retry with valid card
    await page.click('button:has-text("Try Again")');
    await page.fill('[data-testid="cardNumber"]', '4242424242424242');
    await page.fill('[data-testid="cardExpiry"]', '12/34');
    await page.fill('[data-testid="cardCvc"]', '123');
    await page.click('button[type="submit"]');
    
    // Should succeed
    await page.waitForURL(/.*success=true.*/);
    await expect(page.locator('text=/Credits added/')).toBeVisible();
  });
});
