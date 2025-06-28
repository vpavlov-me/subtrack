// @ts-nocheck
import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsMember, logout } from './utils/login';

test.describe('SubTrack E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('landing page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/SubTrack/);
    await expect(page.locator('h1')).toContainText(/subscriptions/i);
  });

  test('complete subscription CRUD flow as admin', async ({ page }) => {
    // Login as admin test user
    await loginAsAdmin(page);

    // Check initial state
    await expect(page.locator('h1')).toContainText('Your Subscriptions');

    // Add new subscription
    await page.click('button:has-text("Add Subscription")');
    await page.fill('input[name="name"]', 'Test Service');
    await page.fill('input[name="price"]', '29.99');
    await page.selectOption('select[name="billingCycle"]', 'monthly');
    await page.fill('input[name="nextBillingDate"]', '2024-02-01');
    await page.click('button[type="submit"]');

    // Verify subscription was added
    await expect(page.locator('text=Test Service')).toBeVisible();
    await expect(page.locator('text=$29.99')).toBeVisible();

    // Edit subscription
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="name"]', 'Updated Test Service');
    await page.fill('input[name="price"]', '39.99');
    await page.click('button:has-text("Save Changes")');

    // Verify changes
    await expect(page.locator('text=Updated Test Service')).toBeVisible();
    await expect(page.locator('text=$39.99')).toBeVisible();

    // Delete subscription
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    // Verify deletion
    await expect(page.locator('text=Updated Test Service')).not.toBeVisible();

    // Logout
    await logout(page);
  });

  test('complete subscription CRUD flow as member', async ({ page }) => {
    // Login as member test user
    await loginAsMember(page);

    // Check initial state
    await expect(page.locator('h1')).toContainText('Your Subscriptions');

    // Add new subscription
    await page.click('button:has-text("Add Subscription")');
    await page.fill('input[name="name"]', 'Member Test Service');
    await page.fill('input[name="price"]', '19.99');
    await page.selectOption('select[name="billingCycle"]', 'monthly');
    await page.fill('input[name="nextBillingDate"]', '2024-02-01');
    await page.click('button[type="submit"]');

    // Verify subscription was added
    await expect(page.locator('text=Member Test Service')).toBeVisible();
    await expect(page.locator('text=$19.99')).toBeVisible();

    // Logout
    await logout(page);
  });

  test('free plan limit enforcement', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Try to add more than 5 subscriptions
    for (let i = 1; i <= 6; i++) {
      await page.click('button:has-text("Add Subscription")');
      await page.fill('input[name="name"]', `Service ${i}`);
      await page.fill('input[name="price"]', '9.99');
      await page.selectOption('select[name="billingCycle"]', 'monthly');
      await page.fill('input[name="nextBillingDate"]', '2024-02-01');
      await page.click('button[type="submit"]');

      if (i === 6) {
        // Should show upgrade modal on 6th attempt
        await expect(page.locator('text=Upgrade to Pro')).toBeVisible();
        await expect(
          page.locator('text=Free plan limit exceeded')
        ).toBeVisible();
      }
    }

    // Logout
    await logout(page);
  });

  test('dashboard KPIs update correctly', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Check KPI cards exist
    await expect(page.locator('text=Monthly Recurring Revenue')).toBeVisible();
    await expect(page.locator('text=Annual Revenue')).toBeVisible();
    await expect(page.locator('text=Next 7 Days')).toBeVisible();

    // Add subscription and verify KPI updates
    const initialMRR = await page
      .locator('[data-testid="mrr-value"]')
      .textContent();

    await page.click('button:has-text("Add Subscription")');
    await page.fill('input[name="name"]', 'KPI Test Service');
    await page.fill('input[name="price"]', '50.00');
    await page.selectOption('select[name="billingCycle"]', 'monthly');
    await page.fill('input[name="nextBillingDate"]', '2024-02-01');
    await page.click('button[type="submit"]');

    // Wait for KPI update
    await page.waitForTimeout(1000);

    const updatedMRR = await page
      .locator('[data-testid="mrr-value"]')
      .textContent();
    expect(updatedMRR).not.toBe(initialMRR);

    // Logout
    await logout(page);
  });

  test('onboarding flow completion', async ({ page }) => {
    // Start onboarding
    await page.goto('/onboarding');

    // Step 0: Company name
    await page.fill('input[placeholder*="Company"]', 'Test Company');
    await page.click('button:has-text("Next")');

    // Step 1: CSV import (skip)
    await page.click('button:has-text("Next")');

    // Step 2: Reminder settings
    await page.fill('input[type="number"]', '3');
    await page.click('button:has-text("Next")');

    // Step 3: Team invite (skip)
    await page.click('button:has-text("Finish")');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Your Subscriptions');
  });

  test('test user isolation', async ({ page }) => {
    // Login as admin and create data
    await loginAsAdmin(page);
    await page.click('button:has-text("Add Subscription")');
    await page.fill('input[name="name"]', 'Admin Only Service');
    await page.fill('input[name="price"]', '99.99');
    await page.selectOption('select[name="billingCycle"]', 'monthly');
    await page.fill('input[name="nextBillingDate"]', '2024-02-01');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Admin Only Service')).toBeVisible();
    await logout(page);

    // Login as member and verify data isolation
    await loginAsMember(page);
    await expect(page.locator('text=Admin Only Service')).not.toBeVisible();
    await logout(page);
  });
});
