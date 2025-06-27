import { test, expect } from '@playwright/test';

test.describe('Upgrade Flow - Free Limit Exceeded', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Login with demo account
    await page.fill('[data-testid="email-input"]', 'demo@subtrack.dev');
    await page.fill('[data-testid="password-input"]', 'demo123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('should show upgrade modal when free limit is exceeded', async ({ page }) => {
    // Add subscriptions until we hit the free limit (5 subscriptions)
    for (let i = 1; i <= 5; i++) {
      await page.click('[data-testid="add-subscription-button"]');
      
      await page.fill('[data-testid="subscription-name"]', `Test Subscription ${i}`);
      await page.fill('[data-testid="subscription-price"]', '9.99');
      await page.selectOption('[data-testid="subscription-currency"]', 'USD');
      await page.selectOption('[data-testid="subscription-billing-cycle"]', 'monthly');
      await page.fill('[data-testid="subscription-category"]', 'Test');
      await page.fill('[data-testid="subscription-next-billing"]', '2024-12-01');
      
      await page.click('[data-testid="save-subscription-button"]');
      
      // Wait for success toast
      await page.waitForSelector('[data-testid="toast-success"]');
    }

    // Try to add one more subscription - should trigger upgrade modal
    await page.click('[data-testid="add-subscription-button"]');
    
    // Verify upgrade modal appears
    await page.waitForSelector('[data-testid="upgrade-modal"]');
    
    const modalTitle = await page.textContent('[data-testid="upgrade-modal-title"]');
    expect(modalTitle).toContain('Upgrade to Pro');
    
    const modalDescription = await page.textContent('[data-testid="upgrade-modal-description"]');
    expect(modalDescription).toContain('free plan limit');
  });

  test('should allow CRUD operations after successful upgrade', async ({ page }) => {
    // Mock successful upgrade by setting user to pro plan
    await page.evaluate(() => {
      localStorage.setItem('user-plan', 'pro');
      localStorage.setItem('subscription-limit', 'unlimited');
    });
    
    // Refresh page to apply changes
    await page.reload();
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Verify we can add new subscriptions
    await page.click('[data-testid="add-subscription-button"]');
    
    await page.fill('[data-testid="subscription-name"]', 'Pro Plan Subscription');
    await page.fill('[data-testid="subscription-price"]', '19.99');
    await page.selectOption('[data-testid="subscription-currency"]', 'USD');
    await page.selectOption('[data-testid="subscription-billing-cycle"]', 'monthly');
    await page.fill('[data-testid="subscription-category"]', 'Pro');
    await page.fill('[data-testid="subscription-next-billing"]', '2024-12-01');
    
    await page.click('[data-testid="save-subscription-button"]');
    
    // Verify success
    await page.waitForSelector('[data-testid="toast-success"]');
    
    // Verify subscription appears in list
    await page.waitForSelector('text=Pro Plan Subscription');
    
    // Test edit functionality
    await page.click('[data-testid="edit-subscription-button"]');
    await page.fill('[data-testid="subscription-name"]', 'Updated Pro Plan Subscription');
    await page.click('[data-testid="save-subscription-button"]');
    
    await page.waitForSelector('[data-testid="toast-success"]');
    await page.waitForSelector('text=Updated Pro Plan Subscription');
    
    // Test delete functionality
    await page.click('[data-testid="delete-subscription-button"]');
    await page.click('[data-testid="confirm-delete-button"]');
    
    await page.waitForSelector('[data-testid="toast-success"]');
    
    // Verify subscription is removed
    await expect(page.locator('text=Updated Pro Plan Subscription')).not.toBeVisible();
  });

  test('should handle upgrade process through Stripe checkout', async ({ page }) => {
    // Trigger upgrade modal
    await page.click('[data-testid="add-subscription-button"]');
    await page.waitForSelector('[data-testid="upgrade-modal"]');
    
    // Click upgrade button
    await page.click('[data-testid="upgrade-button"]');
    
    // Verify redirect to Stripe checkout (mock)
    await page.waitForURL('**/checkout**');
    
    // Mock successful checkout completion
    await page.goto('http://localhost:5173/dashboard?upgrade=success');
    
    // Verify success message
    await page.waitForSelector('[data-testid="upgrade-success-message"]');
    
    // Verify we can now add subscriptions
    await page.click('[data-testid="add-subscription-button"]');
    
    // Should not show upgrade modal anymore
    await expect(page.locator('[data-testid="upgrade-modal"]')).not.toBeVisible();
  });

  test('should show seat limit warning for team features', async ({ page }) => {
    // Navigate to team settings
    await page.click('[data-testid="team-settings-link"]');
    await page.waitForSelector('[data-testid="team-settings"]');
    
    // Try to invite team member
    await page.click('[data-testid="invite-member-button"]');
    await page.fill('[data-testid="invite-email"]', 'test@example.com');
    await page.click('[data-testid="send-invite-button"]');
    
    // Should show seat limit warning
    await page.waitForSelector('[data-testid="seat-limit-warning"]');
    
    const warningText = await page.textContent('[data-testid="seat-limit-warning"]');
    expect(warningText).toContain('seat limit');
    expect(warningText).toContain('upgrade');
  });

  test('should display current usage vs limits', async ({ page }) => {
    // Check usage display
    const usageText = await page.textContent('[data-testid="subscription-usage"]');
    expect(usageText).toContain('subscriptions');
    
    // Check limit display
    const limitText = await page.textContent('[data-testid="subscription-limit"]');
    expect(limitText).toContain('5'); // Free plan limit
    
    // Verify upgrade prompt when near limit
    if (usageText && usageText.includes('4') || usageText && usageText.includes('5')) {
      await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();
    }
  });
}); 