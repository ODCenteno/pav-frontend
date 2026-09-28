import { test, expect, type Page } from '@playwright/test';

// F1 header (see Header.astro, communityMenu.ts, src/i18n/*.json):
//   Desktop: Buenas Prácticas y Turismo Sustentable · Nuestras Comunidades
//            (submenu: Puerto Agua Verde, Rancho San Cosme) · Favoritos · EN
//   Mobile:  Inicio · Buenas Prácticas · both communities · Favoritos · EN
// The desktop nav is shown from 968px; the mobile projects use the overlay.
// Routes use trailing slashes (/buenas-practicas/, /en/).

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 968;

test.describe('Header (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(isMobile(page), 'desktop navigation only');
    await page.goto('/');
  });

  test('shows good practices, the communities menu and favorites', async ({ page }) => {
    const nav = page.locator('#main-navigation');
    await expect(nav.getByRole('link', { name: 'Buenas Prácticas y Turismo Sustentable' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Nuestras Comunidades' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Favoritos' })).toHaveAttribute('href', /\/favoritos\/?$/);
    await expect(page.locator('#i18n-toggle')).toBeVisible();
  });

  test('navigates to the good practices page', async ({ page }) => {
    await page.locator('#main-navigation').getByRole('link', { name: 'Buenas Prácticas y Turismo Sustentable' }).click();
    await expect(page).toHaveURL(/\/buenas-practicas\/?$/);
  });

  test('opens the communities submenu on hover and closes it when the pointer leaves', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Nuestras Comunidades' });
    const submenu = page.locator('#community-submenu');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(submenu).toBeHidden();

    await toggle.hover();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(submenu.getByRole('link', { name: 'Puerto Agua Verde' })).toHaveAttribute(
      'href',
      /\/comunidades\/puerto-agua-verde\/?$/,
    );
    await expect(submenu.getByRole('link', { name: 'Rancho San Cosme' })).toHaveAttribute(
      'href',
      /\/comunidades\/rancho-san-cosme\/?$/,
    );
    await expect(submenu.locator('.community-badge')).toHaveCount(2);

    await page.mouse.move(0, 600);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(submenu).toBeHidden();
  });

  test('opens on keyboard focus and closes on Escape', async ({ page, browserName }) => {
    const toggle = page.getByRole('button', { name: 'Nuestras Comunidades' });
    await toggle.focus();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // WebKit only tabs through links with Option+Tab (Safari default).
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    await expect(
      page.locator('#community-submenu').getByRole('link', { name: 'Puerto Agua Verde', exact: true }),
    ).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#community-submenu')).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('toggles with the keyboard after Escape', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Nuestras Comunidades' });
    await toggle.focus();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('navigates to the homepage from the logo', async ({ page }) => {
    await page.goto('/sitios');
    await page.locator('header a').first().click();
    await expect(page).not.toHaveURL(/sitios/);
  });
});

test.describe('Header (mobile menu)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isMobile(page), 'mobile overlay only');
    await page.goto('/');
  });

  test('shows both community links directly, with no toggle', async ({ page }) => {
    await page.locator('.mobile-menu-btn').click();
    const overlay = page.locator('#mobile-menu-overlay');
    await expect(overlay.getByRole('link', { name: 'Puerto Agua Verde' })).toBeVisible();
    await expect(overlay.getByRole('link', { name: 'Rancho San Cosme' })).toBeVisible();
    await expect(overlay.getByRole('link', { name: 'Buenas Prácticas y Turismo Sustentable' })).toBeVisible();
    await expect(overlay.getByRole('link', { name: 'Favoritos' })).toBeVisible();
    await expect(overlay.locator('[aria-controls="community-submenu"]')).toHaveCount(0);
    await expect(page.locator('#i18n-toggle-mobile')).toBeVisible();
  });
});

test.describe('Footer', () => {
  test('lists the quick links and no contact column', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const links = footer.getByRole('navigation').getByRole('link');
    await expect(links).toHaveText([
      'Buenas prácticas',
      'Puerto Agua Verde',
      'Rancho San Cosme',
      'Favoritos',
      'Sitios de Interés',
    ]);
    await expect(footer.getByText('Contáctanos')).toHaveCount(0);
    await expect(footer.locator('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]')).toHaveCount(0);
  });
});

test.describe('Redirects (F10)', () => {
  test('sends /experiencias home', async ({ page }) => {
    await page.goto('/experiencias');
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
  });

  test('sends /en/experiencias to the English home', async ({ page }) => {
    await page.goto('/en/experiencias');
    await expect(page).toHaveURL(/\/en\/$/);
  });
});

test.describe('Redirects (contract phase)', () => {
  test('sends /guide to the good practices page', async ({ page }) => {
    await page.goto('/guide');
    await expect(page).toHaveURL(/\/buenas-practicas\/$/);
  });

  test('sends /en/guide to the English good practices page', async ({ page }) => {
    await page.goto('/en/guide');
    await expect(page).toHaveURL(/\/en\/buenas-practicas\/$/);
  });

  test('sends /acerca home', async ({ page }) => {
    await page.goto('/acerca');
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
  });

  test('sends /en/acerca to the English home', async ({ page }) => {
    await page.goto('/en/acerca');
    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('sends /comunidad home', async ({ page }) => {
    await page.goto('/comunidad');
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
  });

  test('sends /en/comunidad to the English home', async ({ page }) => {
    await page.goto('/en/comunidad');
    await expect(page).toHaveURL(/\/en\/$/);
  });
});

test.describe('Language Switching', () => {
  test('should switch from Spanish to English', async ({ page }) => {
    await page.goto('/');
    const langSwitch = page.locator('#i18n-toggle');

    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await expect(page).toHaveURL(/\/en\/?$/);
    }
  });

  test('should switch from English to Spanish', async ({ page }) => {
    await page.goto('/en');
    const langSwitch = page.locator('#i18n-toggle');

    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await expect(page).not.toHaveURL(/\/en/);
    }
  });

  test('should persist language preference on navigation', async ({ page }) => {
    test.skip(isMobile(page), 'desktop navigation only');
    await page.goto('/en');
    await page.locator('#main-navigation').getByRole('link', { name: 'Good Practices and Sustainable Tourism' }).click();
    await expect(page).toHaveURL(/\/en\/buenas-practicas\/?$/);
  });
});
