import { test, expect, type Locator } from '@playwright/test';

// Site detail (/sitios/[slug]) and listing index (/sitios): hero logo box and
// the closing CTA panel with community actions.

const cta = (page: import('@playwright/test').Page) => page.locator('section:has([data-key="final_cta_title"])');

async function textColor(el: Locator) {
  return (await el.evaluate((node) => getComputedStyle(node).getPropertyValue('--community-color-text').trim())).toUpperCase();
}

for (const locale of [
  { path: '/sitios/restaurante-puerto-bello/', prefix: '/' },
  { path: '/en/sitios/restaurante-puerto-bello/', prefix: '/en/' },
]) {
  test.describe(`Site detail ${locale.path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test("closes with one CTA action to the listing's community, in its color", async ({ page }) => {
      const actions = cta(page).locator('a');
      await expect(actions).toHaveCount(1);
      await expect(actions).toHaveAttribute('href', `${locale.prefix}comunidades/puerto-agua-verde/`);
      await expect(actions).toContainText('Puerto Agua Verde');
      expect(await textColor(actions)).toBe('#08806D');
      await expect(actions.locator('.community-badge__icon')).toBeVisible();
    });

    test('shows each logo in a 120x120 box', async ({ page }) => {
      const logo = page.locator('.site-hero__logo-img').first();
      test.skip((await logo.count()) === 0, 'This listing has no logo in this build');
      const box = await logo.boundingBox();
      expect(Math.round(box!.width)).toBe(120);
      expect(Math.round(box!.height)).toBe(120);
      await expect(logo).toHaveCSS('object-fit', 'contain');
    });
  });
}

test('/sitios closes with one CTA action per community', async ({ page }) => {
  await page.goto('/sitios/');
  const actions = cta(page).locator('a');
  await expect(actions).toHaveCount(2);
  await expect(actions.nth(0)).toHaveAttribute('href', '/comunidades/puerto-agua-verde/');
  await expect(actions.nth(1)).toHaveAttribute('href', '/comunidades/rancho-san-cosme/');
  expect(await textColor(actions.nth(0))).toBe('#08806D');
  expect(await textColor(actions.nth(1))).toBe('#B85206');
});
