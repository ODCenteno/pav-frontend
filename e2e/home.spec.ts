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
    visit: ['Visitar el Puerto', 'Visitar el Rancho'],
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
    visit: ['Visit the Port', 'Visit the Ranch'],
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
      const h1 = page.locator('.hero h1');
      await expect(h1).toHaveCount(1);
      // Desktop: the split carries the visuals and the h1 is visually hidden.
      const box = await h1.boundingBox();
      if (isMobile(page)) expect(box?.height ?? 0).toBeGreaterThan(20);
      else expect(box?.height ?? 0).toBeLessThanOrEqual(1);
    });

    test('links one explore button per community to its page', async ({ page }) => {
      const hero = page.locator('.hero');
      const labels = [locale.port, locale.ranch];
      for (const [i, community] of COMMUNITIES.entries()) {
        const link = hero.getByRole('link', { name: new RegExp(`^${labels[i]}`) }).filter({ visible: true });
        await expect(link).toHaveCount(1);
        await expect(link).toHaveAttribute('href', `${locale.prefix}comunidades/${community.slug}/`);
        await expect(link).toContainText(labels[i]);
        // One visible label; the community name is for assistive tech only.
        await expect(link).toHaveAccessibleName(new RegExp(community.name));
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

    test('lays the map legend out in one centered row with the buttons in one row below', async ({ page }) => {
      test.skip((page.viewportSize()?.width ?? 0) < 1024, 'desktop layout');
      const center = (b: { x: number; width: number }) => b.x + b.width / 2;
      const legend = page.locator('.map-section__legend li');
      const buttons = page.locator('.map-section__community-btn');
      const l = [(await legend.nth(0).boundingBox())!, (await legend.nth(1).boundingBox())!];
      const b = [(await buttons.nth(0).boundingBox())!, (await buttons.nth(1).boundingBox())!];
      // Same row each.
      expect(Math.abs(l[0].y - l[1].y)).toBeLessThanOrEqual(2);
      expect(Math.abs(b[0].y - b[1].y)).toBeLessThanOrEqual(2);
      // Buttons below the legend.
      expect(b[0].y).toBeGreaterThan(l[0].y + l[0].height - 1);
      // Both rows centered on the section.
      const section = (await page.locator('.map-section__footer').boundingBox())!;
      const mid = center(section);
      expect(Math.abs((l[0].x + l[1].x + l[1].width) / 2 - mid)).toBeLessThanOrEqual(4);
      expect(Math.abs((b[0].x + b[1].x + b[1].width) / 2 - mid)).toBeLessThanOrEqual(4);
    });

    test('ends with a CTA to both communities and the favorites', async ({ page }) => {
      const cta = page.locator('section:has([data-key="final_cta_title"])');
      const actions = cta.getByRole('link');
      await expect(actions).toHaveCount(3);
      for (const [i, community] of COMMUNITIES.entries()) {
        const action = actions.nth(i);
        await expect(action).toHaveText(locale.visit[i]);
        await expect(action).toHaveAttribute('href', `${locale.prefix}comunidades/${community.slug}/`);
        expect(await communityTextColor(action)).toBe(community.color);
        await expect(action.locator('.community-badge__icon')).toBeVisible();
      }
      const favorites = actions.nth(2);
      await expect(favorites).toHaveText(locale.favorites);
      await expect(favorites).toHaveAttribute('href', `${locale.prefix}favoritos/`);
      await expect(favorites).toHaveClass(/cta-panel__action--neutral/);
    });
  });
}
