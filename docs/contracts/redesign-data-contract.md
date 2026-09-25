# Redesign data contract

Status: **agreed**, the source of truth for the backend (`pav-backend`) and frontend (`pav-frontend`) redesign work.
Both repos implement against this document. If you need to change it, update this file first.

Every change here is **additive**. New fields are optional, and nothing that exists today is removed or renamed until the contract (cleanup) phase.

FE code that encodes this contract:

| Concern | FE location |
|---|---|
| Category slugs and labels, legacy→new map, locality→community map | `src/data/categories.ts` |
| Community fixtures (slug, colors, bundled icon, order, location) | `src/data/communities.ts` |
| Types | `src/types/category.type.ts`, `src/types/community.type.ts`, `src/types/listing.type.ts`, `src/types/homepage.type.ts`, `src/types/good-practices.type.ts` |
| Bundled badge icons | `public/images/communities/fish.png`, `donkey.png` (223×226 PNG, to be replaced by SVG) |
| WCAG contrast helper | `src/utils/contrast.ts` |

## 1. Categories

Each listing has exactly one category (`listing.category`, manyToOne, unchanged).

| Order | Slug | es-MX label | en label | Absorbs legacy | Notes |
|---|---|---|---|---|---|
| 1 | `experiences` | Experiencias turísticas comunitarias | Community tourism experiences | `sites`, `accommodation` | Keeps its existing slug |
| 2 | `gastronomy` | Gastronomía regional | Regional gastronomy | `restaurants` | All food, including cheese and bread producers |
| 3 | `services` | Servicios | Services | none | Listings here get `hideContact = true` |
| 4 | `crafts` | Artesanías y productos locales | Crafts and local products | none | New. Listings are assigned manually |

The existing `api::category.category` schema (`name`, `slug`, `color`, `order`) is reused as is. The migration creates `gastronomy` and `crafts`, then relabels and reorders `experiences` and `services`.

**Legacy → current mapping** (used by the backend migration script):

| Legacy slug | Current slug |
|---|---|
| `sites` | `experiences` |
| `accommodation` | `experiences` |
| `restaurants` | `gastronomy` |

Legacy slugs stay valid (their category entries and routes keep working) until the contract phase.

## 2. Communities

| Order | Slug | Name | `color` | `textColor` | Bundled icon | Legacy `locality` |
|---|---|---|---|---|---|---|
| 1 | `puerto-agua-verde` | Puerto Agua Verde | `#0CA58C` | `#08806D` | fish, `/images/communities/fish.png` | `agua-verde` |
| 2 | `rancho-san-cosme` | Rancho San Cosme | `#EC6E0B` | `#B85206` | donkey, `/images/communities/donkey.png` | `rancho-san-cosme` |

- `color` is for large surfaces, icons and borders. It must reach ≥ 3:1 on `#FFFFFF`.
- `textColor` is for small text and tags. It must reach ≥ 4.5:1 on `#FFFFFF` (WCAG AA).
- Unit tests enforce both thresholds (`src/data/__tests__/communities.test.ts`).
- Coordinates (used for the home map pins):
  - PAV: `25.51204, -111.07577` (from `pav-backend/scripts/import-csv-listings.js`).
  - RSC: `25.5784138, -111.1694027` (OpenStreetMap hamlet "Rancho San Cosme", ~12 km NW of PAV). The value in `import-csv-listings.js` (`24.16315, -110.3384`) points to La Paz and must not be reused by the migration.
  - A unit test keeps both points under 30 km apart.

## 3. Routes (documentation only)

These routes follow the existing i18n convention: `es` is the default locale with no prefix, and `en` is prefixed with `/en/` (`prefixDefaultLocale: false`, built through `getRelativeLocaleUrl` in `src/utils/navigation.ts`).

| Page | es | en |
|---|---|---|
| Community | `/comunidades/{slug}` | `/en/comunidades/{slug}` |
| Good practices | `/buenas-practicas` | `/en/buenas-practicas` |
| Favorites | `/favoritos` | `/en/favoritos` |

Path segments stay in Spanish for both locales, as with today's `/en/sitios` and `/en/acerca`. This step creates no pages and does not change `navigation.ts`.

## 4. New collection type `community`

`api::community.community`: collection type, i18n localized, draft & publish enabled.

| Field | Type | Localized | Reuses (BE UID / FE type) | Notes |
|---|---|---|---|---|
| `name` | string (required) | yes | FE `CommunityRef.name` | |
| `slug` | uid (targetField `name`, required) | no | same pattern as `listing.slug` | Shared across locales. Values from §2 |
| `tagline` | string | yes | FE `Community.tagline` | |
| `description` | text | yes | FE `Community.description` | |
| `order` | integer (default 0) | no | FE `Community.order` | |
| `color` | string (hex) | no | FE `CommunityRef.color` | Values from §2 |
| `textColor` | string (hex) | no | FE `CommunityRef.textColor` | Values from §2 |
| `badgeIcon` | media, single, images | no | FE `CommunityRef.badgeIcon` | Optional. The FE falls back to the bundled icon |
| `heroImage` | media, single, images | no | FE `Community.heroImage` | |
| `location` | component, single | yes (like listing) | `location.geo-point` / FE `Location` | `geoPoint` custom field `plugin::sbp-google-map-field.googleMap` |
| `googleMapsUrl` | string | no | FE `Community.googleMapsUrl` | |
| `historyHeader` | component, single | yes | `section.section-header` / FE `SectionHeader` | Same as `guide-page.historyHeader` |
| `historyMilestones` | component, repeatable | yes | `guide.milestone` (`year`, `text`) / FE `CommunityHistoryMilestone` | Same as `guide-page.historyMilestones` |
| `historyText` | text | yes | same as `guide-page.historyText` | |
| `touristMapImage` | media, single, images | no | same as `guide-page.touristMapImage` | |
| `touristMapCaption` | string | yes | same as `guide-page.touristMapCaption` | |
| `highlightsHeader` | component, single | yes | `section.section-header` / FE `SectionHeader` | Rendered as "Experiencias destacadas" |
| `highlights` | component, repeatable | yes | `highlight.highlight-card` / FE `HighlightCard` | Same as `homepage.highlights` |
| `quickFactsHeader` | component, single | yes | `section.section-header` / FE `SectionHeader` | |
| `quickFacts` | component, repeatable | yes | `quickfact.quick-fact` / FE `QuickFact` | |
| `gallery` | media, multiple, images only | no | FE `Community.gallery: string[]` | |
| `finalCta` | component, single | yes | `cta.cta-section` / FE `CtaData` | Links to the other community |
| `listings` | relation oneToMany → `api::listing.listing` | n/a | none | `mappedBy: "community"` |
| `members` | relation oneToMany → `api::community-member.community-member` | n/a | none | `mappedBy: "community"` |

FE types: `Community` (a view model resolved for one locale) and `CommunityRef` in `src/types/community.type.ts`. `Community` leaves out the inverse relations. The FE reads them through listings and members filtered by community.

## 5. `listing` additions

| Field | Type | Localized | FE type | Notes |
|---|---|---|---|---|
| `community` | relation manyToOne → `api::community.community` | n/a | `Listing.community?: CommunityRef` | `inversedBy: "listings"` |
| `hideContact` | boolean (default `false`) | no | `Listing.hideContact?: boolean` | Migration sets `true` for every `services` listing |

`isFeatured` stays: it drives the home carousel. The UI drops the star badge later.

## 5b. Phone numbers (`contact.contact-info` component)

Used by `listing.contact` and `community-member.contact`. Most numbers are Mexican, so the
country code is a separate field that defaults to `+52`, and the national number is exactly
10 digits. Strapi enforces both regexes in the admin and the API.

| Field | Type | Validation (`regex`) | Default | Notes |
|---|---|---|---|---|
| `phoneCountryCode` | string | `^\+[1-9]\d{0,2}$` | `+52` | |
| `phoneNumber` | string | `^\d{10}$` | none | National number, digits only |
| `whatsappCountryCode` | string | `^\+[1-9]\d{0,2}$` | `+52` | |
| `whatsappNumber` | string | `^\d{10}$` | none | National number, digits only |

- Legacy `phone` and `whatsapp` (free text) are **kept** until cleanup and described as
  deprecated in the admin.
- Migration normalizes each legacy value (digits only, then):
  - 13 digits starting with `521` → `+52` + last 10 digits (old Mexican mobile format)
  - 12 digits starting with `52` → `+52` + last 10 digits
  - 10 digits → `+52` + the 10 digits
  - anything else → "needs manual review", new fields left empty
  - Existing new-field values are never overwritten.
- The FE composes the links from the new fields, falling back to the legacy field normalized
  with the same rules:
  - `tel:+52XXXXXXXXXX`
  - `https://wa.me/52XXXXXXXXXX` (no `+`)
  - display as `+52 XXX XXX XXXX`
- The FE view model keeps `phone` / `whatsapp` as the normalized E.164 string
  (`+52XXXXXXXXXX`), so components do not change.
- Numbers of other lengths (outside Mexico, US and Canada) are out of scope. Relax `^\d{10}$`
  to `^\d{8,12}$` if needed.

## 6. `community-member` additions

| Field | Type | Localized | FE type | Notes |
|---|---|---|---|---|
| `community` | relation manyToOne → `api::community.community` | n/a | `CommunityMember.community?: CommunityRef` | `inversedBy: "members"` |
| `shortDescription` | text, `maxLength: 200` | yes | `CommunityMember.shortDescription?: string` | |

`locality` (enum `agua-verde` / `rancho-san-cosme`) is **kept** until cleanup. Migration mapping:

| `locality` | `community.slug` |
|---|---|
| `agua-verde` | `puerto-agua-verde` |
| `rancho-san-cosme` | `rancho-san-cosme` |

## 7. New single type `good-practices-page`

`api::good-practices-page.good-practices-page`: single type, i18n localized, draft & publish enabled. FE type: `GoodPracticesPage` in `src/types/good-practices.type.ts`.

| Field | Type | Localized | Reuses (BE UID / FE type) | Notes |
|---|---|---|---|---|
| `internalLabel` | string (default `"Good Practices Page"`) | no | none | Editor-only label, same as the other page single types. Not rendered |
| `hero` | component, single | yes | `hero.hero-section` / FE `HeroData` | |
| `intro` | component, single | yes | `section.section-header` / FE `SectionHeader` | **Decision**: see note (a) |
| `protectedArea` | component, single | yes | `guide.protected-link` / FE `ProtectedAreaBlock` | |
| `anpMapImage` | media, single, images | no | none | ANP map |
| `conanpUrl` | string | no | none | CONANP link |
| `influenceHeader` | component, single | yes | `section.section-header` | |
| `influenceText` | text | yes | same as `guide-page.influenceText` | |
| `fishingHeader` | component, single | yes | `section.section-header` | |
| `fishingText` | text | yes | same as `guide-page.fishingText` | |
| `fishingRules` | component, repeatable | yes | `guide.text-list-item` / FE `string[]` | |
| `fishingRefugeMapImage` | media, single, images | no | none | |
| `recommendationsHeader` | component, single | yes | `section.section-header` | |
| `recommendations` | component, repeatable | yes | `guide.text-list-item` / FE `string[]` | Same as `guide-page.recommendations` |
| `tipsHeader` | component, single | yes | `section.section-header` | **Decision**: see note (b) |
| `tips` | component, repeatable | yes | `guide.text-list-item` / FE `string[]` | Same shape as `guide-page.drivingTips` |
| `campaign` | component, single | yes | **new** `campaign.campaign-block` / FE `CampaignBlock` | See below |
| `finalCta` | component, single | yes | `cta.cta-section` / FE `CtaData` | |

**New component `campaign.campaign-block`** (`src/components/campaign/campaign-block.json`):

| Field | Type | Notes |
|---|---|---|
| `title` | string (required) | |
| `description` | text | |
| `logo` | media, single, images | |
| `url` | string | |
| `linkLabel` | string | |

Notes on decisions that no existing component fixed:

- (a) `intro` has no dedicated component. The guide's `guide.intro-block` is specific to ranch and port, so `intro` reuses `section.section-header` (`title` + `subtitle`).
- (b) `guide-page.drivingTipsHeader` is a plain string. For consistency with the other headers on this page, `tipsHeader` uses `section.section-header`.

## 8. `homepage` additions

| Field | Type | Localized | FE type | Notes |
|---|---|---|---|---|
| `regionMapImage` | media, single, images | no | `HomepageData.regionMapImage?: string` | Static BCS/Loreto map on the left of the map section |

The two OSM pins come from `community.location`. The hero's community buttons are derived from the `community` entries (ordered by `order`). Neither needs a new homepage field.

## 9. Endpoints and populate

| Endpoint | Params | Notes |
|---|---|---|
| `GET /api/communities` | `filters[slug][$eq]={slug}`, `locale`, `sort=order:asc`, populate: `badgeIcon`, `heroImage`, `location`, `historyHeader`, `historyMilestones`, `touristMapImage`, `highlightsHeader`, `highlights.image`, `quickFactsHeader`, `quickFacts`, `gallery`, `finalCta` | Public role needs `find` and `findOne` |
| `GET /api/good-practices-page` | `locale`, populate: `hero.images`, `intro`, `protectedArea`, `anpMapImage`, `influenceHeader`, `fishingHeader`, `fishingRules`, `fishingRefugeMapImage`, `recommendationsHeader`, `recommendations`, `tipsHeader`, `tips`, `campaign.logo`, `finalCta` | Public role needs `find` |
| `GET /api/listings` (existing) | add `populate[community][fields]=name,slug,color,textColor` and `populate[community][populate]=badgeIcon` | Applies to both `LISTING_FULL_POPULATE` and `LISTING_SLIM_POPULATE` in `src/lib/cms.ts` (FE release phase) |
| `GET /api/community-members` (existing) | add `community` with the same field subset | |
| `GET /api/homepage` (existing) | add `regionMapImage` to populate | |

Strapi returns `badgeIcon` as a media relation, so it is populated, not listed in `fields`.

**Populate format rule (verified against Strapi 5.39).** Never mix the indexed form
(`populate[0]=category`) with the named form (`populate[community][fields]=...`) in the same
query. When both appear, the query parser turns `populate` into an object and Strapi **silently
drops every indexed entry**: the response keeps `community` but loses `category`, `mainImage`,
`gallery` and the rest, with status 200 and no error. Any query that needs a named entry must
express **every** populate entry in the named form, for example:

```
populate[category]=true
populate[mainImage]=true
populate[members][populate][0]=photo
populate[members][populate][1]=gallery
populate[community][fields][0]=name
populate[community][fields][1]=slug
populate[community][populate][0]=badgeIcon
```

Queries with only indexed entries (e.g. `populate[0]=badgeIcon&populate[1]=highlights.image`)
are fine. Always send `locale` explicitly: on a fresh database the default locale can be `en`.

## 10. Deprecated (kept until the contract phase)

| Item | Replacement |
|---|---|
| `guide-page` single type | `community` + `good-practices-page` |
| `experiences-page` single type | category `experiences` + community pages |
| `community-member.locality` | `community-member.community` |
| Category slugs `sites`, `accommodation`, `restaurants` | See §1 |
| `homepage.destinations` / `destinationsHeader` | Community pages |

The final phase removes the routes `/guide`, `/acerca`, `/sitios` (listing index), `/comunidad` and `/experiencias`, plus their `/en/` variants. The detail pages `/sitios/[slug]` **stay**. Until then, the footer links Guía, Sobre nosotros and `/sitios`.

## 11. Phases

| # | Phase | Repo | What | Exit criteria |
|---|---|---|---|---|
| 1 | **Expand** | BE | Additive schema changes (§4 to §8), new component, public permissions. No data changes | Existing FE builds and behaves the same against the new schema |
| 2 | **Migrate** | BE | Script: create/relabel categories (§1), reassign listings from legacy slugs, set `hideContact` on `services`, create the 2 communities, link listings and members (`locality` → `community`). **Dry-run first on a Neon branch copy** of production, then run for real | Dry-run report reviewed. Counts match. Nothing points at a legacy category |
| 3 | **FE release** | FE | Populate and map the new fields in `cms.ts`, then build the community, good-practices and favorites pages and the redesigned home | Site works on the migrated data. Fallbacks are covered |
| 4 | **Contract (cleanup)** | BE + FE | Remove the items in §10, the legacy category entries and the deprecated routes | No references to deprecated fields remain in either repo |
