import { test, expect, type Page } from '@playwright/test';

// Favorites page (brief C3 · F8): /favoritos and /en/favoritos.
// Favorites live in localStorage under `pav_favorites` (src/utils/favorites.ts).
// Every listing card is rendered on the server and hidden until the client
// script shows the saved ones, so card-based tests need listings in the build
// (CMS data, or STRAPI_USE_DEV_FALLBACK=true); they skip otherwise.

const STORAGE_KEY = 'pav_favorites';

/** Contract category slugs in chip order after "all" (contract §1). */
const CONTRACT_CATEGORIES = ['experiences', 'gastronomy', 'services', 'crafts'];

async function seedFavorites(page: Page, ids: string[]) {
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key, value),
    [STORAGE_KEY, JSON.stringify(ids)] as const,
  );
  await page.reload();
}

const COMMUNITIES = [
  { slug: 'puerto-agua-verde', name: 'Puerto Agua Verde', textColor: '#08806D' },
  { slug: 'rancho-san-cosme', name: 'Rancho San Cosme', textColor: '#B85206' },
];

async function expectCommunityActions(page: Page, prefix: string) {
  const actions = page.locator('.favorites-communities a');
  await expect(actions).toHaveCount(2);
  for (const [i, community] of COMMUNITIES.entries()) {
    const action = actions.nth(i);
    await expect(action).toBeVisible();
    await expect(action).toHaveText(community.name);
    await expect(action).toHaveAttribute('href', `${prefix}${community.slug}/`);
    await expect(action.locator('.community-badge__icon')).toBeVisible();
    const color = await action.evaluate((el) => getComputedStyle(el).getPropertyValue('--community-color-text').trim());
    expect(color.toUpperCase()).toBe(community.textColor);
  }
}

const slides = (page: Page) => page.locator('#favorites-section .carousel-slide');
const emptyState = (page: Page) => page.locator('#favorites-empty-state');

for (const locale of [
  { path: '/favoritos/', lang: 'es', communityPrefix: '/comunidades/' },
  { path: '/en/favoritos/', lang: 'en', communityPrefix: '/en/comunidades/' },
]) {
  test.describe(`Favorites page ${locale.path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test('renders a single h1 and the 4 contract category chips plus "all"', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page.locator('h1')).toHaveCount(1);
      const chips = page.locator('#favorites-section [data-category-filter]');
      await expect(chips).toHaveCount(5);
      await expect(chips.first()).toHaveAttribute('data-category-filter', 'all');
      await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');
      for (const [i, slug] of CONTRACT_CATEGORIES.entries()) {
        await expect(chips.nth(i + 1)).toHaveAttribute('data-category-filter', slug);
      }
    });

    test('shows the empty state and always the two community buttons', async ({ page }) => {
      await expect(emptyState(page)).toBeVisible();
      await expect(slides(page).filter({ visible: true })).toHaveCount(0);
      await expectCommunityActions(page, locale.communityPrefix);
    });

    test('keeps the community buttons below the cards when favorites are saved', async ({ page }) => {
      const ids = await page
        .locator('#favorites-carousel .fav-btn')
        .evaluateAll((btns) => btns.slice(0, 2).map((b) => b.getAttribute('data-fav-id') ?? ''));
      test.skip(ids.length === 0, 'No listings in this build');
      await seedFavorites(page, ids);
      await expect(emptyState(page)).toBeHidden();
      await expectCommunityActions(page, locale.communityPrefix);
      const cardsBottom = await page.locator('#favorites-carousel').evaluate((el) => el.getBoundingClientRect().bottom);
      const actionsTop = await page.locator('.favorites-communities').evaluate((el) => el.getBoundingClientRect().top);
      expect(actionsTop).toBeGreaterThanOrEqual(cardsBottom);
    });

    test('ignores saved ids that are no longer on the page', async ({ page }) => {
      await seedFavorites(page, ['does-not-exist']);
      await expect(emptyState(page)).toBeVisible();
      await expect(slides(page).filter({ visible: true })).toHaveCount(0);
    });

    test('shows saved cards and filters them by category', async ({ page }) => {
      const count = await slides(page).count();
      test.skip(count === 0, 'No listings in this build');

      const first = slides(page).first();
      const id = (await first.getAttribute('data-fav-id')) ?? '';
      const category = (await first.getAttribute('data-category')) ?? '';
      await seedFavorites(page, [id]);

      const saved = page.locator(`#favorites-section .carousel-slide[data-fav-id="${id}"]`);
      await expect(saved).toBeVisible();
      await expect(emptyState(page)).toBeHidden();

      // A chip for another category hides the card and explains why.
      const other = CONTRACT_CATEGORIES.find((c) => c !== category)!;
      const otherChip = page.locator(`#favorites-section [data-category-filter="${other}"]`);
      await otherChip.click();
      await expect(otherChip).toHaveAttribute('aria-pressed', 'true');
      await expect(saved).toBeHidden();
      await expect(emptyState(page)).toBeVisible();

      await page.locator('#favorites-section [data-category-filter="all"]').click();
      await expect(saved).toBeVisible();
    });

    test('removing a favorite from its card updates the list', async ({ page }) => {
      const count = await slides(page).count();
      test.skip(count === 0, 'No listings in this build');

      const id = (await slides(page).first().getAttribute('data-fav-id')) ?? '';
      await seedFavorites(page, [id]);
      const saved = page.locator(`#favorites-section .carousel-slide[data-fav-id="${id}"]`);
      await expect(saved).toBeVisible();

      await saved.locator('.fav-btn').click();
      await expect(saved).toBeHidden();
      await expect(emptyState(page)).toBeVisible();
      const stored = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
      expect(JSON.parse(stored ?? '[]')).not.toContain(id);
    });
  });
}

test.describe('Sites page', () => {
  test('no longer renders the favorites section', async ({ page }) => {
    await page.goto('/sitios/');
    await expect(page.locator('#favorites-section')).toHaveCount(0);
  });

  test('saving a card stores it under pav_favorites', async ({ page }) => {
    await page.goto('/sitios/');
    const button = page.locator('.fav-btn').first();
    test.skip((await button.count()) === 0, 'No listings in this build');

    await button.click();
    const stored = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
    expect(JSON.parse(stored ?? '[]')).toHaveLength(1);
  });
});
