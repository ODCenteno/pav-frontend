import { test, expect } from '@playwright/test';

// Current desktop nav (see Header.astro + src/i18n/*.json):
//   Experiencias · Sitios de Interés · Guía del destino · Sobre nosotros · EN
// Note: there is NO "Inicio" link in the desktop nav (only the mobile nav has
// it), and the about label is "Sobre nosotros" (not "Acerca"). Routes use
// trailing slashes (/sitios/, /guide/, /acerca/, /en/).

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display header with navigation links', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    await expect(page.getByRole('link', { name: /experiencias|experiences/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /sitios|sites/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /guía|guide/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /sobre nosotros|about/i }).first()).toBeVisible();
  });

  test('should navigate to experiences page', async ({ page }) => {
    await page.getByRole('link', { name: /experiencias|experiences/i }).first().click();
    await expect(page).toHaveURL(/experiencias/);
  });

  test('should navigate to sites page', async ({ page }) => {
    await page.getByRole('link', { name: /sitios|sites/i }).first().click();
    await expect(page).toHaveURL(/sitios/);
  });

  test('should navigate to guide page', async ({ page }) => {
    await page.getByRole('link', { name: /guía del destino|guide/i }).first().click();
    await expect(page).toHaveURL(/guide/);
  });

  test('should navigate to about page', async ({ page }) => {
    await page.getByRole('link', { name: /sobre nosotros|about/i }).first().click();
    await expect(page).toHaveURL(/acerca/);
  });

  test('should navigate to homepage from logo', async ({ page }) => {
    await page.goto('/sitios');
    const logo = page.locator('header a').first();
    await logo.click();
    await expect(page).not.toHaveURL(/sitios/);
  });

  test('should display footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Language Switching', () => {
  test('should switch from Spanish to English', async ({ page }) => {
    await page.goto('/');
    const langSwitch = page.locator('#i18n-toggle');

    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await expect(page).toHaveURL(/\/en\/?$/);
    }
  });

  test('should switch from English to Spanish', async ({ page }) => {
    await page.goto('/en');
    const langSwitch = page.locator('#i18n-toggle');

    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await expect(page).not.toHaveURL(/\/en/);
    }
  });

  test('should persist language preference on navigation', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /experiences/i }).first().click();
    await expect(page).toHaveURL(/\/en\//);
  });
});
