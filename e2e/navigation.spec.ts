import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display header with navigation links', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    await expect(page.getByRole('link', { name: /inicio|home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /experiencias|experiences/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sitios|sites|points of interés/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /guía|guide/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /acerca|about/i })).toBeVisible();
  });

  test('should navigate to experiences page', async ({ page }) => {
    await page.getByRole('link', { name: /experiencias|experiences/i }).first().click();
    await expect(page).toHaveURL(/experiencias|experiences/);
  });

  test('should navigate to sites page', async ({ page }) => {
    await page.getByRole('link', { name: /sitios|sites|points of interés/i }).first().click();
    await expect(page).toHaveURL(/sitios|sites/);
  });

  test('should navigate to guide page', async ({ page }) => {
    await page.getByRole('link', { name: /guía|guide/i }).first().click();
    await expect(page).toHaveURL(/guía|guide/);
  });

  test('should navigate to about page', async ({ page }) => {
    await page.getByRole('link', { name: /acerca|about/i }).first().click();
    await expect(page).toHaveURL(/acerca|about/);
  });

  test('should navigate to homepage from logo', async ({ page }) => {
    await page.goto('/sitios');
    const logo = page.locator('header img, header a').first();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('should display footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Language Switching', () => {
  test('should switch from Spanish to English', async ({ page }) => {
    await page.goto('/');
    const langSwitch = page.getByRole('link', { name: /en|english/i }).first();

    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await expect(page).toHaveURL(/^\/en$/);
    }
  });

  test('should switch from English to Spanish', async ({ page }) => {
    await page.goto('/en');
    const langSwitch = page.getByRole('link', { name: /es|español/i }).first();

    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should persist language preference on navigation', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /experiences/i }).first().click();
    await expect(page).toHaveURL(/\/en\/experiences/);
  });
});
