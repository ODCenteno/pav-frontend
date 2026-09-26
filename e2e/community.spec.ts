import { test, expect, type Page } from '@playwright/test';

// Community pages (brief C3 · F4): /comunidades/{slug} and /en/comunidades/{slug}.
// Sections without data (listings before the migration links them, history,
// highlights, quick facts, gallery) are skipped by the page, so they are
// optional here; when present they must sit in their slot.

const PAGES = [
  {
    path: '/comunidades/puerto-agua-verde/',
    lang: 'es',
    name: 'Puerto Agua Verde',
    textColor: '#08806D',
    otherPath: '/comunidades/rancho-san-cosme/',
  },
  {
    path: '/en/comunidades/puerto-agua-verde/',
    lang: 'en',
    name: 'Puerto Agua Verde',
    textColor: '#08806D',
    otherPath: '/en/comunidades/rancho-san-cosme/',
  },
  {
    path: '/comunidades/rancho-san-cosme/',
    lang: 'es',
    name: 'Rancho San Cosme',
    textColor: '#B85206',
    otherPath: '/comunidades/puerto-agua-verde/',
  },
];

/** Contract category slugs in chip order (contract §1). */
const CONTRACT_CATEGORIES = ['experiences', 'gastronomy', 'services', 'crafts'];

/** Sections in the order of the brief. */
const SECTIONS = [
  { name: 'hero image', selector: '.community-hero', required: true },
  { name: 'title', selector: '.community-intro', required: true },
  { name: 'listings carousel', selector: '#community-listings', required: false },
  { name: 'history', selector: '.guide-history', required: false },
  { name: 'directions', selector: '.community-directions', required: true },
  { name: 'tourist map', selector: '.community-tourist-map', required: true },
  { name: 'highlights', selector: '.highlights', required: false },
  { name: 'quick facts', selector: '.quick-facts', required: false },
  { name: 'gallery', selector: '.community-gallery', required: false },
  { name: 'final CTA', selector: 'section:has([data-key="final_cta_title"])', required: true },
];

async function sectionPositions(page: Page, selectors: string[]): Promise<number[]> {
  return page.evaluate((list) => {
    const all = Array.from(document.querySelectorAll('*'));
    return list.map((selector) => {
      const el = document.querySelector(selector);
      return el ? all.indexOf(el) : -1;
    });
  }, selectors);
}

for (const community of PAGES) {
  test.describe(`Community page ${community.path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(community.path);
    });

    test('renders all sections in order', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', community.lang);
      const positions = await sectionPositions(page, SECTIONS.map((s) => s.selector));

      SECTIONS.forEach((section, i) => {
        if (section.required) expect(positions[i], `${section.name} is missing`).toBeGreaterThan(-1);
      });

      const present = SECTIONS.map((s, i) => ({ name: s.name, at: positions[i] })).filter((s) => s.at > -1);
      const inOrder = [...present].sort((a, b) => a.at - b.at).map((s) => s.name);
      expect(inOrder).toEqual(present.map((s) => s.name));
    });

    test('titles the page with the community name and its badge', async ({ page }) => {
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(community.name);
      const badge = page.locator('.community-intro .community-badge--lg');
      await expect(badge).toHaveAttribute('role', 'img');
      await expect(badge).toHaveAttribute('aria-label', new RegExp(community.name));
    });

    test('applies the community theme to the page', async ({ page }) => {
      const textColor = await page
        .locator('.community-page')
        .evaluate((el) => getComputedStyle(el).getPropertyValue('--community-color-text').trim());
      expect(textColor.toUpperCase()).toBe(community.textColor);
    });

    test('opens Google Maps directions in a new tab', async ({ page }) => {
      const link = page.locator('.community-directions__cta');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = (await link.getAttribute('rel')) ?? '';
      expect(rel.split(/\s+/)).toContain('noopener');
    });

    test('links the final CTA to the other community', async ({ page }) => {
      const cta = page.locator('section:has([data-key="final_cta_title"]) a');
      await expect(cta).toHaveAttribute('href', community.otherPath);
    });

    test('category chips filter the community listings', async ({ page }) => {
      const carousel = page.locator('#community-listings');
      test.skip((await carousel.count()) === 0, 'No listings are linked to this community in this build');

      const chips = carousel.locator('.filter-chips .chip');
      await expect(chips).toHaveCount(5); // "all" + the 4 contract categories
      await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');

      const slides = carousel.locator('[data-carousel-category]');
      const total = await slides.count();
      const categories = await slides.evaluateAll((els) =>
        els.map((el) => el.getAttribute('data-carousel-category') ?? ''),
      );

      // Chips follow the contract order after "all" (src/data/categories.ts).
      for (const [i, slug] of CONTRACT_CATEGORIES.entries()) {
        const chip = chips.nth(i + 1);
        await chip.click();
        await expect(chip).toHaveAttribute('aria-pressed', 'true');
        await expect(chips.first()).toHaveAttribute('aria-pressed', 'false');

        const visible = await slides.evaluateAll((els) =>
          els
            .filter((el) => (el as HTMLElement).style.display !== 'none')
            .map((el) => el.getAttribute('data-carousel-category')),
        );
        expect(visible.every((c) => c === slug), `only ${slug} cards are visible`).toBe(true);
        expect(visible.length).toBe(categories.filter((c) => c === slug).length);
      }

      await chips.first().click();
      await expect(slides.filter({ visible: true })).toHaveCount(total);
    });
  });
}
