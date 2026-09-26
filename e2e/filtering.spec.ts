import { test, expect } from '@playwright/test';

// Sites page (/sitios) filters (brief C3): "all" plus the 4 contract
// categories (contract §1), grouped into one `#category-{slug}` section each.
// Card-based tests need listings in the build and skip otherwise.

const CHIPS = {
  es: ['Todo', 'Experiencias turísticas comunitarias', 'Gastronomía regional', 'Servicios', 'Artesanías y productos locales'],
  en: ['All', 'Community tourism experiences', 'Regional gastronomy', 'Services', 'Crafts and local products'],
};

/** Contract category slugs in chip order after "all". */
const CONTRACT_CATEGORIES = ['experiences', 'gastronomy', 'services', 'crafts'];

for (const locale of [
  { path: '/sitios/', labels: CHIPS.es },
  { path: '/en/sitios/', labels: CHIPS.en },
]) {
  test.describe(`Category filtering ${locale.path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test('shows "all" plus the 4 contract categories, with "all" active', async ({ page }) => {
      const chips = page.locator('.sites-explorer .filter-chips .chip');
      await expect(chips).toHaveText(locale.labels, { useInnerText: true, ignoreCase: true });
      await expect(chips.first()).toHaveClass(/active/);
    });

    test('groups listings only under contract categories', async ({ page }) => {
      const ids = await page
        .locator('.category-section')
        .evaluateAll((els) => els.map((el) => el.id.replace(/^category-/, '')));
      for (const id of ids) expect(CONTRACT_CATEGORIES).toContain(id);
    });

    test('a chip shows only its category section', async ({ page }) => {
      const sections = page.locator('.category-section');
      test.skip((await sections.count()) === 0, 'No listings in this build');

      const chips = page.locator('.sites-explorer .filter-chips .chip');
      for (const [i, slug] of CONTRACT_CATEGORIES.entries()) {
        await chips.nth(i + 1).click();
        await expect(chips.nth(i + 1)).toHaveClass(/active/);
        const visible = await sections.evaluateAll((els) =>
          els.filter((el) => (el as HTMLElement).style.display !== 'none').map((el) => el.id),
        );
        const exists = (await page.locator(`#category-${slug}`).count()) > 0;
        expect(visible).toEqual(exists ? [`category-${slug}`] : []);
      }

      await chips.first().click();
      await expect(sections.filter({ visible: true })).toHaveCount(await sections.count());
    });
  });
}

test.describe('Search Functionality', () => {
  test('filters results when searching', async ({ page }) => {
    await page.goto('/sitios/');
    const searchInput = page.locator('.sites-explorer input').first();
    test.skip((await searchInput.count()) === 0, 'No search input');

    await searchInput.fill('zzzz-no-match');
    await expect(page.locator('.sites-explorer .carousel-item').filter({ visible: true })).toHaveCount(0);
  });
});
