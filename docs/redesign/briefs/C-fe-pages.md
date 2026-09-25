# Brief C · Frontend pages

- Repo: `pav-frontend` (Astro 7 + React 19 islands, TypeScript, plain CSS, Strapi 5 client)
- Worktree: `pav-frontend-worktrees/fe-pages`
- Branch: `feat/fe-pages` (based on `redesign`)
- Read first: `docs/redesign/README.md` (ownership and rules), `docs/contracts/redesign-data-contract.md`

You build the new pages and their section components. Agent B builds the
foundation (CMS fetchers, routes, theme, badge, cards, carousel) in another
worktree. Until B's milestones are merged into `redesign`, build your
components against typed props and fixtures from `src/data/communities.ts`.
Never edit B's files; list what you need in your report.

## Milestone C1 · Section components (starts now, no dependency on B)

1. **F6 gallery** `src/components/gallery/CommunityGallery.tsx` (+ CSS), photos only:
   - Desktop: one horizontal row with scroll-snap and prev/next buttons.
   - Mobile (≤ 768px): vertical, full-viewport scroll-snap, like TikTok.
   - Clicking a photo opens the existing `site-detail/GalleryLightbox.tsx`; import it, do not
     modify it.
   - Lazy-load the images, give each an alt text, and respect `prefers-reduced-motion`.
2. **F5 directions** `src/components/community-page/CommunityDirections.astro`:
   - Heading, a short text, and the existing Leaflet `maps/MapView.tsx` with one pin
     (`community.location`).
   - A "Cómo llegar" button that opens `community.googleMapsUrl` in a new tab
     (`rel="noopener"`). If that field is empty, build the Google Maps URL from lat/lng.
3. **F5 tourist map** `src/components/community-page/CommunityTouristMap.astro`: image and
   caption, and a button that opens the existing fullscreen viewer (`guide/ExpandableImage.tsx`).
   Use a mock image while `touristMapImage` is empty.
4. **F9 artisan cards** (`site-detail/MemberCards.tsx`, `MemberStrip.astro`, `MemberModal.tsx`):
   - Each member card shows the name (project or artisan), `shortDescription`, an inline photo
     carousel of the member's gallery, and contact buttons reusing the existing social buttons
     bar (`site-detail/SocialLinks.astro` or its React equivalent). The contact includes phone
     and WhatsApp.
   - Keep the modal working.
   - If a member has no `shortDescription`, show a truncated bio.
   - This powers the "Artesanas de Puerto Agua Verde" listing page. It is a normal
     `/sitios/[slug]` page whose members are the artisans.

Tests first, next to existing `__tests__` conventions.

## Milestone C2 · Good practices page (after B1 is merged; rebase first)

- Build `src/pages/buenas-practicas.astro` and `src/pages/en/buenas-practicas.astro` using
  `getGoodPracticesPage` from B1.
- Sections, in order:
  1. hero
  2. intro
  3. protected natural areas: reuse `guide/GuideProtectedArea` and `GuideInfluenceArea`,
     add the ANP map image and a CONANP link button
  4. fishing refuge zone: reuse `guide/GuideFishingRefuge`, add the refuge map image
  5. visitor recommendations and code of conduct: reuse `guide/GuideRecommendations`
  6. visitor tips
  7. the "Abracemos el Golfo" campaign in a new `good-practices/CampaignBlock.astro`, with
     logo, short description and an external link button
  8. final CTA
- i18n keys go in the `goodPractices` namespace.

## Milestone C3 · Community and favorites pages (after B2 is merged; rebase first)

1. **F4 community page**: `src/pages/comunidades/[slug].astro` and
   `src/pages/en/comunidades/[slug].astro`, using `getStaticPaths` from `getCommunities`.
   The whole page takes the community theme (`communityStyle`). Sections, in order:
   1. Hero image
   2. Title with `CommunityBadge size="lg"` on the left, tagline and description
   3. The reusable one-row filterable carousel from B2, with only this community's listings
      and the 4 category chips
   4. History timeline: reuse `guide/GuideHistory` with the community's milestones
   5. `CommunityDirections`
   6. `CommunityTouristMap`
   7. "Experiencias destacadas": reuse `main/highlights/Highlights.astro` with the community's
      highlights
   8. "Lo esencial de un vistazo": reuse B's QuickFacts with the community theme and facts
   9. `CommunityGallery`
   10. CTA to the other community: reuse `main/CTA/CtaSection.astro`
2. **F8 favorites page**:
   - Move `main/favorites/FavoritesSection.astro` out of `sitios.astro` into new
     `src/pages/favoritos.astro` and `en/favoritos.astro`.
   - Chips are the 4 contract categories plus "all".
   - The list is a one-row horizontal carousel, like the home.
   - Cards (B's `CardMain`) show each community's badge and color.
   - Favorites stay in localStorage (`src/utils/favorites.ts`, read-only for you).
   - The empty state links to both community pages.
3. **`sitios.astro`** (+ `en/`): remove the favorites section and use the 4 contract categories
   for its chips. The page itself stays until the final cleanup.
4. **Tests**: update `e2e/favorites.spec.ts` (the favorites page) and `e2e/filtering.spec.ts`,
   and add e2e coverage for the community page (sections render, chips filter, the Google Maps
   link has `target="_blank"`).

## Out of scope for C

Header, footer, home, cards, carousel internals, CMS fetchers and transformer,
theme utilities, the backend, and the data migration.
