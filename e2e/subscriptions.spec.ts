// @ts-nocheck
import { test, expect } from '@playwright/test'

test('open landing and ensure title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/SubTrack/)
}) 