import { test, expect, type Locator } from '@playwright/test';

// Site detail (/sitios/[slug]) and listing index (/sitios): hero logo box and
// the closing CTA panel with community actions.

const cta = (page: import('@playwright/test').Page) => page.locator('section:has([data-key="final_cta_title"])');

async function textColor(el: Locator) {
  return (await el.evaluate((node) => getComputedStyle(node).getPropertyValue('--community-color-text').trim())).toUpperCase();
}

const COMMUNITY_TEXT_COLOR: Record<string, string> = {
  'puerto-agua-verde': '#08806D',
  'rancho-san-cosme': '#B85206',
};

for (const locale of [
  { index: '/sitios/', prefix: '/' },
  { index: '/en/sitios/', prefix: '/en/' },
]) {
  test.describe(`Site detail (${locale.prefix})`, () => {
    test.beforeEach(async ({ page }) => {
      // Any listing: the first card on the listing index opens its detail page.
      await page.goto(locale.index);
      const onclick = (await page.locator('.listing-card').first().getAttribute('onclick')) ?? '';
      const href = onclick.match(/assign\('([^']+)'\)/)?.[1];
      expect(href).toMatch(new RegExp(`^${locale.prefix}sitios/[^/]+`));
      await page.goto(href!);
    });

    test("closes with the listing's community action, then the favorites", async ({ page }) => {
      const actions = cta(page).locator('a');
      const count = await actions.count();
      // One community (or both when the listing has none) plus favorites.
      expect([2, 3]).toContain(count);
      for (let i = 0; i < count - 1; i++) {
        const action = actions.nth(i);
        const slug = (await action.getAttribute('href'))!.match(/comunidades\/([^/]+)\//)![1];
        expect(await textColor(action)).toBe(COMMUNITY_TEXT_COLOR[slug]);
        await expect(action.locator('.community-badge__icon')).toBeVisible();
      }
      const favorites = actions.nth(count - 1);
      await expect(favorites).toHaveAttribute('href', `${locale.prefix}favoritos/`);
      await expect(favorites).toHaveClass(/cta-panel__action--neutral/);
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
