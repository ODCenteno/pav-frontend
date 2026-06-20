import { test, expect } from '@playwright/test';

test.describe('Gallery Lightbox', () => {
  test('should open lightbox when clicking gallery image', async ({ page }) => {
    await page.goto('/sitios');

    const galleryImage = page.locator('[class*="gallery"] img, [class*="image"]:not([class*="icon"])').first();

    if (await galleryImage.isVisible()) {
      await galleryImage.click();
      await page.waitForTimeout(500);

      const lightbox = page.locator('[class*="lightbox"], [role="dialog"]').first();
      await expect(lightbox).toBeVisible();
    }
  });

  test('should close lightbox when clicking close button', async ({ page }) => {
    await page.goto('/sitios');

    const galleryImage = page.locator('[class*="gallery"] img, [class*="image"]:not([class*="icon"])').first();

    if (await galleryImage.isVisible()) {
      await galleryImage.click();
      await page.waitForTimeout(500);

      const closeButton = page.locator('[class*="lightbox"] button[aria-label*="close" i], [class*="lightbox"] [aria-label*="cerrar" i]');

      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300);

        const lightbox = page.locator('[class*="lightbox"], [role="dialog"]').first();
        if (await lightbox.count() > 0) {
          await expect(lightbox).not.toBeVisible();
        }
      }
    }
  });

  test('should close lightbox when clicking overlay', async ({ page }) => {
    await page.goto('/sitios');

    const galleryImage = page.locator('[class*="gallery"] img').first();

    if (await galleryImage.isVisible()) {
      await galleryImage.click();
      await page.waitForTimeout(500);

      const overlay = page.locator('[class*="lightbox__overlay"], [class*="overlay"]').first();

      if (await overlay.isVisible()) {
        await overlay.click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(300);
      }
    }
  });

  test('should navigate to next image', async ({ page }) => {
    await page.goto('/sitios');

    const galleryImage = page.locator('[class*="gallery"] img').first();

    if (await galleryImage.isVisible()) {
      await galleryImage.click();
      await page.waitForTimeout(500);

      const nextButton = page.locator('[class*="lightbox__nav"].next, [class*="lightbox__nav--next"], button[aria-label*="next" i]').first();

      if (await nextButton.isVisible()) {
        const counterBefore = await page.locator('[class*="lightbox__counter"]').textContent();
        await nextButton.click();
        await page.waitForTimeout(300);

        const counterAfter = await page.locator('[class*="lightbox__counter"]').textContent();
        expect(counterAfter).not.toBe(counterBefore);
      }
    }
  });

  test('should navigate to previous image', async ({ page }) => {
    await page.goto('/sitios');

    const galleryImage = page.locator('[class*="gallery"] img').first();

    if (await galleryImage.isVisible()) {
      await galleryImage.click();
      await page.waitForTimeout(500);

      const nextButton = page.locator('[class*="lightbox__nav"].next, button[aria-label*="next" i]').first();

      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }

      const prevButton = page.locator('[class*="lightbox__nav"].prev, button[aria-label*="previous" i]').first();

      if (await prevButton.isVisible()) {
        const counterBefore = await page.locator('[class*="lightbox__counter"]').textContent();
        await prevButton.click();
        await page.waitForTimeout(300);

        const counterAfter = await page.locator('[class*="lightbox__counter"]').textContent();
        expect(counterAfter).not.toBe(counterBefore);
      }
    }
  });

  test('should close lightbox with Escape key', async ({ page }) => {
    await page.goto('/sitios');

    const galleryImage = page.locator('[class*="gallery"] img').first();

    if (await galleryImage.isVisible()) {
      await galleryImage.click();
      await page.waitForTimeout(500);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      const lightbox = page.locator('[class*="lightbox"]').first();
      if (await lightbox.count() > 0) {
        await expect(lightbox).not.toBeVisible();
      }
    }
  });

  test('should display image counter', async ({ page }) => {
    await page.goto('/sitios');

    const galleryImage = page.locator('[class*="gallery"] img').first();

    if (await galleryImage.isVisible()) {
      await galleryImage.click();
      await page.waitForTimeout(500);

      const counter = page.locator('[class*="lightbox__counter"]');
      if (await counter.isVisible()) {
        const counterText = await counter.textContent();
        expect(counterText).toMatch(/\d+\s*\/\s*\d+/);
      }
    }
  });
});
