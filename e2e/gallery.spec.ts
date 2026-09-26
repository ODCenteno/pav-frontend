import { test, expect } from '@playwright/test';

// Community gallery on a phone: a vertical snap feed that must never trap the
// page. Scrolling through the last photo continues to the final CTA.

const PATH = '/comunidades/puerto-agua-verde/';
const isMobile = (w: number) => w <= 768;

test.describe('Community gallery feed (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isMobile(page.viewportSize()?.width ?? 1280), 'the vertical feed is mobile only');
    await page.goto(PATH);
  });

  test('scrolls to the last photo, then the page continues to the final CTA', async ({ page }) => {
    const gallery = page.locator('.community-gallery');
    test.skip((await gallery.count()) === 0, 'This community has no gallery in this build');
    // Start with the gallery at the top, so the CTA is below the fold.
    await gallery.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60));

    const track = gallery.locator('.community-gallery__track');
    const viewport = page.viewportSize()!;
    const trackHeight = await track.evaluate((el) => el.clientHeight);
    // Bounded: shorter than the viewport, so the page is reachable around it.
    expect(trackHeight).toBeLessThan(viewport.height);

    const total = await gallery.locator('.community-gallery__item').count();
    const position = gallery.locator('.community-gallery__position [aria-hidden="true"]');
    await expect(position).toHaveText(`1 / ${total}`);

    // Swipe through the feed with the wheel over the photos.
    const box = (await track.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    // Stop at the last photo: one more wheel would already chain to the page.
    for (let i = 0; i < total + 2 && (await position.textContent()) !== `${total} / ${total}`; i++) {
      await page.mouse.wheel(0, trackHeight);
      await page.waitForTimeout(300);
    }
    await expect(position).toHaveText(`${total} / ${total}`);
    const atEnd = await track.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 2);
    expect(atEnd).toBe(true);

    // Keep scrolling with the pointer over the gallery: the page must move
    // on (scroll chaining) until the final CTA comes into view.
    const cta = page.locator('section:has([data-key="final_cta_title"])');
    const scrollY = () => page.evaluate(() => window.scrollY);
    const before = await scrollY();
    for (let i = 0; i < 8; i++) {
      const top = await cta.evaluate((el) => el.getBoundingClientRect().top);
      if (top < viewport.height * 0.7) break;
      const now = (await track.boundingBox())!;
      await page.mouse.move(now.x + now.width / 2, Math.max(10, Math.min(viewport.height - 10, now.y + now.height / 2)));
      await page.mouse.wheel(0, viewport.height / 3);
      await page.waitForTimeout(250);
    }
    expect(await scrollY()).toBeGreaterThan(before);
    await expect(cta).toBeInViewport();
  });

  test('offers a link that jumps past the gallery', async ({ page }) => {
    const link = page.locator('.community-gallery__continue');
    test.skip((await link.count()) === 0, 'This community has no gallery in this build');
    await link.click();
    await expect(page.locator('#community-gallery-end')).toBeInViewport();
  });
});
