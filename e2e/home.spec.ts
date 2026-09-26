import { test, expect, type Page } from '@playwright/test';

// Home: hero split (desktop) / community buttons (mobile), featured carousel
// "Ver todo", map legend + Google Maps buttons, favorites CTA.

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 968;

const LOCALES = [
  {
    path: '/',
    lang: 'es',
    prefix: '/',
    port: 'Explorar el Puerto',
    ranch: 'Explorar el Rancho',
    viewAll: 'Ver todo',
    favorites: 'Ver mis favoritos',
    newTab: '(se abre en una pestaña nueva)',
  },
  {
    path: '/en/',
    lang: 'en',
    prefix: '/en/',
    port: 'Explore the Port',
    ranch: 'Explore the Ranch',
    viewAll: 'View all',
    favorites: 'See my favorites',
    newTab: '(opens in a new tab)',
  },
];

const COMMUNITIES = [
  { slug: 'puerto-agua-verde', name: 'Puerto Agua Verde', color: '#08806D' },
  { slug: 'rancho-san-cosme', name: 'Rancho San Cosme', color: '#B85206' },
];

async function communityTextColor(el: import('@playwright/test').Locator) {
  const value = await el.evaluate((node) => getComputedStyle(node).getPropertyValue('--community-color-text').trim());
  return value.toUpperCase();
}

for (const locale of LOCALES) {
  test.describe(`Home ${locale.path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test('keeps a single h1 in the hero', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('.hero h1')).toBeVisible();
    });

    test('links one explore button per community to its page', async ({ page }) => {
      const hero = page.locator('.hero');
      const labels = [locale.port, locale.ranch];
      for (const [i, community] of COMMUNITIES.entries()) {
        const link = hero.getByRole('link', { name: new RegExp(`^${labels[i]}`) }).filter({ visible: true });
        await expect(link).toHaveCount(1);
        await expect(link).toHaveAttribute('href', `${locale.prefix}comunidades/${community.slug}/`);
        await expect(link).toContainText(isMobile(page) ? community.name : labels[i]);
        expect(await communityTextColor(link)).toBe(community.color);
      }
    });

    test('shows the featured carousel with a "view all" link to /sitios', async ({ page }) => {
      const viewAll = page.locator('#category-carousel .view-all-link');
      await expect(viewAll).toHaveText(locale.viewAll);
      await expect(viewAll).toHaveAttribute('href', `${locale.prefix}sitios/`);
    });

    test('shows a community legend and one Google Maps button per community', async ({ page }) => {
      const legend = page.locator('.map-section__legend li');
      await expect(legend).toHaveCount(2);
      const buttons = page.locator('.map-section__community-btn');
      await expect(buttons).toHaveCount(2);
      for (const [i, community] of COMMUNITIES.entries()) {
        await expect(legend.nth(i)).toContainText(community.name);
        await expect(legend.nth(i).locator('.community-badge__icon')).toBeVisible();

        const button = buttons.nth(i);
        await expect(button).toContainText(community.name);
        await expect(button).toHaveAttribute('href', /^https:\/\/(www\.google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.)/);
        await expect(button).toHaveAttribute('target', '_blank');
        const rel = (await button.getAttribute('rel')) ?? '';
        expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
        await expect(button.locator('.sr-only')).toHaveText(locale.newTab);
        expect(await communityTextColor(button)).toBe(community.color);
      }
      await expect(page.locator('[data-key="map_btn"]')).toHaveCount(0);
      await expect(page.locator('.map-section__region img')).toBeVisible();
      await expect(page.locator('.map-section__map .leaflet-container')).toBeVisible();
    });

    test('ends with a favorites CTA', async ({ page }) => {
      const cta = page.locator('section:has([data-key="final_cta_title"])');
      const action = cta.getByRole('link');
      await expect(action).toHaveCount(1);
      await expect(action).toHaveText(locale.favorites);
      await expect(action).toHaveAttribute('href', `${locale.prefix}favoritos/`);
    });
  });
}
