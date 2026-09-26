# Brief B · Frontend foundation

- Repo: `pav-frontend` (Astro 7 + React 19 islands, TypeScript, plain CSS, Strapi 5 client)
- Worktree: `pav-frontend-worktrees/fe-foundation`
- Branch: `feat/fe-foundation` (based on `redesign`)
- Read first: `docs/redesign/README.md` (ownership and rules), `docs/contracts/redesign-data-contract.md`

You build the shared base that agent C consumes, plus the header, footer,
home page and cards. Agent C works in parallel on community pages in
another worktree; stay inside the files you own.

## Milestone B1 · F0 foundation (highest priority, unblocks agent C)

Report and stop after this milestone.

1. **CMS fetchers** in new files (do not grow `cms.ts` beyond imports and re-exports):
   - `src/lib/cms/community.ts`: `getCommunities(locale)` and `getCommunityBySlug(slug, locale)`.
     Map the contract fields. When the CMS returns nothing or a field is empty, fall back to
     `src/data/communities.ts` and to mock images already in `public/` (pick coastal and desert
     photos used by the current home and guide).
   - `src/lib/cms/goodPractices.ts`: `getGoodPracticesPage(locale)`. When the CMS is empty,
     fall back to the current guide-page content (`src/data/guideData.js` and the guide-page
     fetch) for the protected areas, fishing refuge, recommendations and tips sections, plus a
     placeholder campaign block for "Abracemos el Golfo".
   - Listing mapping: populate `community` (name, slug, color, textColor, badgeIcon) and map
     `hideContact`. Listings without a community get none; the UI must not break.
   - Member mapping: pass through `community`, `shortDescription`, `phone` and `whatsapp` and
     the gallery, so agent C can render artisan cards without touching the transformer.
2. **Routes** in `src/utils/navigation.ts`: `communityPath(slug, locale)`, `goodPracticesPath(locale)`,
   `favoritesPath(locale)`, following the existing `/en/` convention.
3. **Theme** `src/utils/communityTheme.ts`: `communityStyle(ref)` returns the inline CSS custom
   properties `--community-color` and `--community-color-text`, plus the bundled icon fallback.
   With no community, return the site's current primary color.
4. **Badge** `src/components/community-badge/CommunityBadge.astro`: square icon plus optional
   name, sizes `sm` (cards) and `lg` (page titles), with an accessible label naming the
   community. Use the badge icon from the CMS or the bundled PNG.
5. **i18n**: create the keys B needs inside your namespaces (`nav`, `footer`, `communityBadge`, ...).

Tests first for every fetcher fallback, route helper, `communityStyle` and the badge props.

## Milestone B2 · Cards and carousel (unblocks agent C's community and favorites pages)

1. **F3 `src/components/cards/CardMain.astro`**:
   - Remove the ★ featured badge from the UI. `isFeatured` stays in the data.
   - Put `CommunityBadge size="sm"` where the star was.
   - Tags, icons and hover use `--community-color` and `--community-color-text` through
     `communityStyle`.
   - Remove the hardcoded `rgba(90,138,128,.85)`.
   - Keep the favorite button working.
2. **Carousel refactor** (`src/components/main/categories/*`, `CategoryFilter.tsx`, `popup/*`):
   - Make the one-row filterable carousel reusable. It takes `listings`, `title` and `locale`
     props and renders chips for the 4 contract categories (`src/data/categories.ts`) in order,
     plus "all".
   - Map legacy category slugs to the new ones with the contract mapping, so the carousel
     works before and after the data migration.
   - The home keeps showing featured listings from both communities.

3. **Phone numbers** (contract §5b), in the transformer:
   - Build `phone` and `whatsapp` for listings and members as E.164 (`+52XXXXXXXXXX`) from
     `*CountryCode` + `*Number`.
   - Fall back to the legacy `phone` / `whatsapp` normalized with the §5b rules, and drop
     values that cannot be normalized. Put this in one shared helper,
     `src/utils/phone.ts`: `normalizePhone`, `telHref`, `whatsappHref`, `formatPhone`.
   - Use the helper everywhere tel/wa.me links are built today, including existing
     site-detail links.
   - Tests first, with the same parser table as the backend: `5216131234567`,
     `526131234567`, `+52 613 123 4567` and `613-123-4567` → `+526131234567`; `12345` → none.
   - Request agent C, through your report, to switch `community-page/memberCard.ts` to the
     helper.

## Milestone B3 · Layout and home

1. **F1 header** (`header/*`, `menuOverlay/*`, `navigation.ts`, i18n `nav`):
   - Desktop items: "Buenas Prácticas y Turismo Sustentable", "Nuestras Comunidades" (hover and
     keyboard-focus submenu with Puerto Agua Verde and Rancho San Cosme, each with its badge),
     and "Favoritos".
   - The submenu must open on hover and on focus, close on Escape, and use `aria-expanded`.
   - Mobile menu: show the two community links directly, with no toggle.
   - Keep the EN switch.
2. **F1 footer** (`footer/*`):
   - Remove the "Contáctanos" column.
   - Quick links: Buenas prácticas, Puerto Agua Verde, Rancho San Cosme, Favoritos, and
     temporarily Guía del destino, Sobre nosotros and Sitios de interés (`/sitios`). These
     three are removed in the final cleanup, not now.
3. **F2 home** (`pages/index.astro`, `pages/en/index.astro`, `components/main/*`):
   - Hero on desktop: split in two halves, one per community, each with name, tagline, its
     color and a "Explorar el destino" button to `communityPath`.
   - Hero on mobile: keep the current title and description, and add two buttons with each
     community's color and icon.
   - Remove "Conoce la bahía de Loreto" (Destinations) and "Lo más destacado" (Highlights)
     from the home. Keep the components; agent C reuses Highlights.
   - Keep the featured carousel (B2).
   - QuickFacts "Lo esencial de un vistazo": remove the image and the "Qué hacer" box. Accept
     an optional community theme so agent C can reuse it with community colors. Do not
     hardcode image alt texts.
   - Map section: split in two. Left: `homepage.regionMapImage`, with a mock placeholder until
     the designer delivers it. Right: the existing Leaflet map with only two pins, from
     `community.location`. Each pin links to its community page.
   - Localize the hardcoded `aria-label="Mapa interactivo de ubicaciones"` in
     `src/components/maps/MapView.tsx` through a prop or i18n key (requested by agent C: English
     pages announce a Spanish label).
4. **F10** Remove `pages/experiencias.astro` and `pages/en/experiencias.astro`, and redirect
   `/experiencias` and `/en/experiencias` to `/` using the project's redirect mechanism. Do not
   remove guide, acerca, comunidad or sitios.
5. **hideContact on the site detail page** (found in the B2 review):
   - `pages/sitios/[slug].astro` (+ `en/`) and `site-detail/SiteInfoPanel.astro`,
     `StickyActionBar.tsx`, `SocialLinks.astro` still show phone and WhatsApp when
     `listing.hideContact` is true.
   - With `hideContact`, hide every contact channel on the card and on the detail page:
     phone, WhatsApp, email, website **and social profiles**. RED's rule for Servicios is
     "foto y descripción breve, sin contacto". The map / "Cómo llegar" stays.
   - Update B2's card behavior accordingly (it currently keeps social profiles).
   - Tests first: a hideContact listing renders no `tel:`, `wa.me`, `mailto:` or social links
     on either page.
6. **Heading order** (from agent C's e2e): `menuOverlay/InstallApp.astro` renders an `h3` before
   the page `h1` on every page. Make it a non-heading element (keep its visual style) so each
   page starts its heading outline with the `h1`.
7. **Tests**:
   - Update `e2e/navigation.spec.ts` for the new header and footer.
   - Update the unit tests your changes break.
   - Add a test for the redirect.

## Out of scope for B

Community page, good-practices page, favorites page, the gallery, member cards,
`sitios.astro`, backend changes, and data migration.
