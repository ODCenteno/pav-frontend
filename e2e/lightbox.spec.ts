import { test, expect, type Page } from '@playwright/test';

/**
 * Site-detail gallery lightbox. Galleries live on /sitios/<slug>, not on the
 * /sitios listing. The first detail page with a gallery is discovered from the
 * listing; builds without CMS data have none, so the suite skips explicitly
 * instead of passing without asserting anything.
 */
async function openFirstGallery(page: Page) {
  await page.goto('/sitios/');
  // Cards open their detail page from script data, not from <a href>, so the
  // detail slugs are collected from the rendered HTML.
  const html = await page.content();
  const slugs = [...new Set([...html.matchAll(/\/sitios\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  for (const slug of slugs) {
    await page.goto(`/sitios/${slug}/`);
    if ((await page.locator('.site-gallery__item').count()) > 0) {
      // The gallery is a client:load island: clicks before hydration do nothing.
      await page.waitForFunction(
        () => !document.querySelector('astro-island[component-url*="GalleryManager"][ssr]'),
      );
      return true;
    }
  }
  return false;
}

const lightbox = (page: Page) => page.locator('.lightbox[role="dialog"]');

test.describe('Gallery Lightbox', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!(await openFirstGallery(page)), 'no listing with a gallery in this build (no CMS data)');
  });

  test('opens from a gallery thumbnail and shows the image counter', async ({ page }) => {
    await page.locator('.site-gallery__item').first().click();
    await expect(lightbox(page)).toBeVisible();
    await expect(page.locator('.lightbox__image')).toBeVisible();
    await expect(page.locator('.lightbox__counter')).toContainText('1');
  });

  test('opens with the keyboard', async ({ page }) => {
    await page.locator('.site-gallery__item').first().focus();
    await page.keyboard.press('Enter');
    await expect(lightbox(page)).toBeVisible();
  });

  test('moves to the next image with the arrow button', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'nav buttons are hidden on mobile by design (swipe gestures)');
    await page.locator('.site-gallery__item').first().click();
    const counter = page.locator('.lightbox__counter');
    const before = await counter.textContent();
    await page.locator('.lightbox__nav.next').click();
    await expect(counter).not.toHaveText(before ?? '');
  });

  test('moves to the next image with the ArrowRight key', async ({ page }) => {
    await page.locator('.site-gallery__item').first().click();
    const counter = page.locator('.lightbox__counter');
    const before = await counter.textContent();
    await page.keyboard.press('ArrowRight');
    await expect(counter).not.toHaveText(before ?? '');
  });

  test('closes with the close button', async ({ page }) => {
    await page.locator('.site-gallery__item').first().click();
    await page.locator('.lightbox__close').click();
    await expect(lightbox(page)).toHaveCount(0);
  });

  test('closes with Escape', async ({ page }) => {
    await page.locator('.site-gallery__item').first().click();
    await expect(lightbox(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(lightbox(page)).toHaveCount(0);
  });
});
