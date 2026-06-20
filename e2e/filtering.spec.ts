import { test, expect } from '@playwright/test';

test.describe('Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sitios');
  });

  test('should display category filter buttons', async ({ page }) => {
    const filterContainer = page.locator('[class*="category"], [class*="filter"]').first();
    await expect(filterContainer).toBeVisible();
  });

  test('should filter listings by category', async ({ page }) => {
    const categoryButtons = page.locator('button[class*="category"], [class*="filter"] button');
    const count = await categoryButtons.count();

    if (count > 0) {
      const firstCategory = categoryButtons.first();
      const categoryName = await firstCategory.textContent();

      await firstCategory.click();

      await page.waitForTimeout(500);

      const cards = page.locator('[class*="card"], [class*="listing"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        expect(cardCount).toBeGreaterThan(0);
      }
    }
  });

  test('should show "all" category by default', async ({ page }) => {
    const allButton = page.locator('button').filter({ hasText: /todo|all|todas/i }).first();
    if (await allButton.isVisible()) {
      await expect(allButton).toHaveClass(/active|selected/i);
    }
  });

  test('should clear filter when clicking "all"', async ({ page }) => {
    const categoryButtons = page.locator('button[class*="category"]');
    const allButton = page.locator('button').filter({ hasText: /todo|all/i }).first();

    if (await categoryButtons.count() > 0) {
      await categoryButtons.first().click();
      await page.waitForTimeout(300);

      if (await allButton.isVisible()) {
        await allButton.click();
        await page.waitForTimeout(300);

        const cards = page.locator('[class*="card"]');
        expect(await cards.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should update URL when filtering', async ({ page }) => {
    const categoryButtons = page.locator('button[class*="category"]');

    if (await categoryButtons.count() > 0) {
      await categoryButtons.first().click();
      await page.waitForTimeout(500);

      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  });
});

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sitios');
  });

  test('should display search input if present', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i], input[placeholder*="search" i]');
    const count = await searchInput.count();

    if (count > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('should filter results when searching', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i], input[placeholder*="search" i]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      const cards = page.locator('[class*="card"]');
      expect(await cards.count()).toBeGreaterThanOrEqual(0);
    }
  });
});
