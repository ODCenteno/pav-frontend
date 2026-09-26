import { test, expect, type Page } from '@playwright/test';

// Good practices page (brief C2): /buenas-practicas and /en/buenas-practicas.
// Content comes from the CMS or, when it is unreachable, from the guide
// fallback in src/lib/cms/goodPractices.ts. The intro and both maps render
// only when the CMS has them, so they are optional here; when present they
// must still sit in their slot.

const LOCALES = [
  { name: 'es', path: '/buenas-practicas/', lang: 'es', title: /Buenas prácticas/ },
  { name: 'en', path: '/en/buenas-practicas/', lang: 'en', title: /Good practices/ },
];

/** Sections in the order of the brief. */
const SECTIONS = [
  { name: 'hero', selector: '.hero-page', required: true },
  { name: 'intro', selector: '.section-intro', required: false },
  { name: 'protected area', selector: '.guide-protected', required: true },
  { name: 'influence area', selector: '.guide-influence', required: true },
  { name: 'ANP map', selector: '#anp-map', required: false },
  { name: 'fishing refuge', selector: '.guide-fishing', required: true },
  { name: 'refuge map', selector: '#refuge-map', required: false },
  { name: 'recommendations', selector: '.guide-recommendations', required: true },
  { name: 'visitor tips', selector: '.visitor-tips', required: true },
  { name: 'campaign', selector: '.campaign-block', required: true },
  { name: 'final CTA', selector: 'section:has([data-key="final_cta_title"])', required: true },
];

/** External links owned by this page (CONANP and campaign). */
const EXTERNAL_LINKS = '.guide-protected__link, .map-figure__cta, .campaign-block__cta';

/** Document-order position of the first match of each selector, or -1. */
async function sectionPositions(page: Page, selectors: string[]): Promise<number[]> {
  return page.evaluate((list) => {
    const all = Array.from(document.querySelectorAll('*'));
    return list.map((selector) => {
      const el = document.querySelector(selector);
      return el ? all.indexOf(el) : -1;
    });
  }, selectors);
}

for (const locale of LOCALES) {
  test.describe(`Good practices page (${locale.name})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(locale.path);
    });

    test('serves the localized document', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page).toHaveTitle(locale.title);
    });

    test('renders all sections in order', async ({ page }) => {
      const positions = await sectionPositions(
        page,
        SECTIONS.map((s) => s.selector),
      );

      SECTIONS.forEach((section, i) => {
        if (section.required) {
          expect(positions[i], `${section.name} is missing`).toBeGreaterThan(-1);
        }
      });

      const present = SECTIONS.map((s, i) => ({ name: s.name, at: positions[i] })).filter((s) => s.at > -1);
      const inOrder = [...present].sort((a, b) => a.at - b.at).map((s) => s.name);
      expect(inOrder).toEqual(present.map((s) => s.name));
    });

    test('external CONANP and campaign links open safely in a new tab', async ({ page }) => {
      const links = page.locator(EXTERNAL_LINKS);
      // The protected-area section always links to CONANP.
      await expect(page.locator('.guide-protected__link')).toHaveCount(1);
      await expect(page.locator('.guide-protected__link')).toHaveAttribute('href', /^https:\/\//);

      const count = await links.count();
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        await expect(link).toHaveAttribute('target', '_blank');
        const rel = (await link.getAttribute('rel')) ?? '';
        expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
      }
    });

    test('closes with one CTA action per community, in its color', async ({ page }) => {
      const actions = page.locator('section:has([data-key="final_cta_title"]) a');
      await expect(actions).toHaveCount(2);
      const prefix = locale.name === 'en' ? '/en/' : '/';
      const expected = [
        { slug: 'puerto-agua-verde', name: 'Puerto Agua Verde', textColor: '#08806D' },
        { slug: 'rancho-san-cosme', name: 'Rancho San Cosme', textColor: '#B85206' },
      ];
      for (const [i, community] of expected.entries()) {
        const action = actions.nth(i);
        await expect(action).toHaveText(community.name);
        await expect(action).toHaveAttribute('href', `${prefix}comunidades/${community.slug}/`);
        const color = await action.evaluate((el) => getComputedStyle(el).getPropertyValue('--community-color-text').trim());
        expect(color.toUpperCase()).toBe(community.textColor);
        await expect(action.locator('.community-badge__icon')).toBeVisible();
      }
    });

    test('has a single h1 and no skipped heading levels in the main content', async ({ page }) => {
      await expect(page.locator('h1')).toHaveCount(1);

      const levels = await page
        .locator('main')
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((headings) => headings.map((h) => Number(h.tagName.slice(1))));

      expect(levels[0]).toBe(1);
      for (let i = 1; i < levels.length; i++) {
        // Going deeper may only step one level at a time; going back up is free.
        expect(levels[i] - levels[i - 1], `h${levels[i - 1]} → h${levels[i]}`).toBeLessThanOrEqual(1);
      }
    });

    test('every image has alt text', async ({ page }) => {
      // Scroll through so client:visible islands hydrate their images too.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').evaluateAll((imgs) =>
        imgs.map((img) => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') })),
      );
      for (const image of images) {
        expect(image.alt, `missing alt on ${image.src}`).not.toBeNull();
      }

      // Decorative images (community badge icons next to their name) are
      // hidden from assistive tech and keep an empty alt on purpose.
      const mainImages = await page.locator('main img').evaluateAll((imgs) =>
        imgs
          .filter((img) => !img.closest('[aria-hidden="true"]'))
          .map((img) => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') ?? '' })),
      );
      for (const image of mainImages) {
        expect(image.alt.trim(), `empty alt on content image ${image.src}`).not.toBe('');
      }
    });
  });
}
