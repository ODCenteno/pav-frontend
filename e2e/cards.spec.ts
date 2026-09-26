import { test, expect, type Locator, type Page } from '@playwright/test';

// Every listing carousel lays its cards out at one height: the content stacks
// at the top and the contact/action footer is pinned to the bottom
// (src/components/cards/cardsMain.css, main/categories/categories.css).

async function visibleCardBoxes(row: Locator) {
  return row.locator('.listing-card').evaluateAll((cards) =>
    cards
      .filter((card) => (card as HTMLElement).offsetParent !== null)
      .map((card) => {
        const box = card.getBoundingClientRect();
        const footer = card.querySelector('.listing-footer')?.getBoundingClientRect();
        return { height: box.height, bottom: box.bottom, footerBottom: footer?.bottom ?? box.bottom };
      }),
  );
}

async function expectEqualHeights(row: Locator, name: string) {
  const boxes = await visibleCardBoxes(row);
  expect(boxes.length, `${name} has visible cards`).toBeGreaterThan(1);
  const heights = boxes.map((b) => b.height);
  expect(Math.max(...heights) - Math.min(...heights), `${name} card heights ${heights.join(', ')}`).toBeLessThanOrEqual(1);
  // The footer sits at the same distance from each card's bottom edge.
  const gaps = boxes.map((b) => b.bottom - b.footerBottom);
  expect(Math.max(...gaps) - Math.min(...gaps), `${name} footer offsets`).toBeLessThanOrEqual(1);
}

async function listingIds(page: Page, selector: string): Promise<string[]> {
  return page.locator(`${selector} .fav-btn`).evaluateAll((btns) => btns.map((b) => b.getAttribute('data-fav-id') ?? ''));
}

test.describe('Equal card heights', () => {
  test('home carousel', async ({ page }) => {
    await page.goto('/');
    await expectEqualHeights(page.locator('#category-carousel-container'), 'home carousel');
  });

  test('community page carousel', async ({ page }) => {
    await page.goto('/comunidades/puerto-agua-verde/');
    const row = page.locator('#community-listings-container');
    test.skip((await row.count()) === 0, 'No listings are linked to this community in this build');
    await expectEqualHeights(row, 'community carousel');
  });

  test('/sitios rows', async ({ page }) => {
    await page.goto('/sitios/');
    const rows = page.locator('.horizontal-carousel');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      if ((await row.locator('.listing-card').count()) > 1) await expectEqualHeights(row, `sitios row ${i + 1}`);
    }
  });

  test('favorites carousel', async ({ page }) => {
    await page.goto('/favoritos/');
    const ids = (await listingIds(page, '#favorites-carousel')).slice(0, 4);
    await page.evaluate((value) => window.localStorage.setItem('pav_favorites', value), JSON.stringify(ids));
    await page.reload();
    await expect(page.locator('#favorites-carousel .carousel-slide.is-favorite-visible')).toHaveCount(ids.length);
    await expectEqualHeights(page.locator('#favorites-carousel'), 'favorites carousel');
  });
});
