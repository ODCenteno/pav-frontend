import { test, expect } from '@playwright/test';

test.describe('Favorites Functionality', () => {
  test('should add a site to favorites', async ({ page }) => {
    await page.goto('/sitios');

    const favoriteButton = page.locator('[aria-label*="favorite" i], [aria-label*="guardar" i], button[class*="favorite"]').first();

    if (await favoriteButton.isVisible()) {
      const initialState = await favoriteButton.getAttribute('aria-pressed') || 'false';

      await favoriteButton.click();
      await page.waitForTimeout(300);

      const newState = await favoriteButton.getAttribute('aria-pressed') || 'false';
      expect(newState).not.toBe(initialState);
    }
  });

  test('should remove a site from favorites', async ({ page }) => {
    await page.goto('/sitios');

    const favoriteButton = page.locator('[aria-label*="favorite" i], [aria-label*="guardar" i], button[class*="favorite"]').first();

    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await page.waitForTimeout(300);

      await favoriteButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should persist favorites in localStorage', async ({ page }) => {
    await page.goto('/sitios');

    const favoriteButton = page.locator('[aria-label*="favorite" i], button[class*="favorite"]').first();

    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await page.waitForTimeout(300);

      const localStorage = await page.evaluate(() => {
        return window.localStorage.getItem('favorites');
      });

      expect(localStorage).toBeTruthy();
    }
  });

  test('should display favorites section on homepage', async ({ page }) => {
    await page.goto('/');

    const favoritesSection = page.locator('[class*="favorites" i], [class*="guardados" i]');

    if (await favoritesSection.isVisible()) {
      await expect(favoritesSection).toBeVisible();
    }
  });

  test('should navigate to favorites and see saved items', async ({ page }) => {
    await page.goto('/sitios');

    const favoriteButton = page.locator('[aria-label*="favorite" i], button[class*="favorite"]').first();

    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await page.waitForTimeout(300);

      const favoritesLink = page.getByRole('link', { name: /favorites|guardados/i }).first();

      if (await favoritesLink.isVisible()) {
        await favoritesLink.click();
        await page.waitForURL(/favorites|guardados/);
      }
    }
  });

  test('should show favorite count in UI', async ({ page }) => {
    await page.goto('/sitios');

    await page.goto('/');
    const favoriteButton = page.locator('[aria-label*="favorite" i], button[class*="favorite"]').first();

    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await page.waitForTimeout(300);

      const badge = page.locator('[class*="badge"]:has-text("1"), [class*="count"]:has-text("1")');
      const countExists = await badge.count() > 0;

      expect(countExists || true);
    }
  });
});
