# Redesign: agent workflow and file ownership

This folder coordinates the September 2026 community redesign across several
parallel agent sessions. Every agent MUST read this file and its own brief
before touching code.

- Data contract (canonical): `docs/contracts/redesign-data-contract.md`
- Backend repo (separate): `pav-backend`, branch `redesign`, brief `docs/redesign/briefs/A-be-schema.md`

## Agents

| Agent | Repo | Worktree | Branch | Brief |
|---|---|---|---|---|
| A · Backend schema + migration | pav-backend | `../pav-backend-worktrees/be-schema` | `feat/be-community-schema` | `pav-backend/docs/redesign/briefs/A-be-schema.md` |
| B · Frontend foundation | pav-frontend | `../pav-frontend-worktrees/fe-foundation` | `feat/fe-foundation` | `briefs/B-fe-foundation.md` |
| C · Frontend pages | pav-frontend | `../pav-frontend-worktrees/fe-pages` | `feat/fe-pages` | `briefs/C-fe-pages.md` |
| Coordinator | both | main checkouts | `redesign` | reviews and merges |

## Branch flow

```
main ── redesign (integration, coordinator only)
           ├── feat/fe-foundation   (agent B)
           └── feat/fe-pages        (agent C)
```

1. Agents commit only to their own branch. They never push, never merge, and never touch `main` or `redesign`.
2. The coordinator reviews each milestone and merges it into `redesign`.
3. When the coordinator announces a merge, the other agent runs `git rebase redesign` in its worktree before continuing.
4. `main` is updated only at release time.

## File ownership (frontend)

An agent may edit only the files it owns. Everything else is read-only. If
you need a change in a file you do not own, stop and write the request in
your milestone report; do not edit it.

| Area | Owner B (foundation) | Owner C (pages) |
|---|---|---|
| CMS client | `src/lib/cms.ts`, new `src/lib/cms/*`, `src/utils/strapiTransformer*`, `src/lib/__tests__/*` | — |
| Types and contract data | `src/types/*`, `src/data/*` | — |
| Routing and theme | `src/utils/navigation.ts`, new `src/utils/communityTheme.ts`, `astro.config.*` (redirects), `public/_redirects` | — |
| i18n | namespaces `nav`, `hero`, `categories`, `highlights`, `quickFacts`, `map`, `footer`, `featured`, `experiencesPage`, `communityBadge` | namespaces `communityDetail`, `goodPractices`, `favoritesPage`, `communityGallery`, `memberCard`, `sitesPage` |
| Layout | `src/components/header/*`, `src/components/menuOverlay/*`, `src/components/footer/*` | — |
| Home | `src/pages/index.astro`, `src/pages/en/index.astro`, `src/components/main/*` except `main/favorites/*`, `src/components/popup/*` | `src/components/main/favorites/*` |
| Cards and badge | `src/components/cards/*`, new `src/components/community-badge/*` | — |
| Pages removed now | `src/pages/experiencias.astro`, `src/pages/en/experiencias.astro` | — |
| Community page | — | new `src/pages/comunidades/*`, `src/pages/en/comunidades/*`, new `src/components/community-page/*` |
| Good practices | — | new `src/pages/buenas-practicas.astro` (+ `en/`), new `src/components/good-practices/*` |
| Favorites | — | new `src/pages/favoritos.astro` (+ `en/`), `src/pages/sitios.astro` (+ `en/`) |
| Gallery | — | new `src/components/gallery/*` |
| Members (artisans) | — | `src/components/site-detail/MemberCards.tsx`, `MemberStrip.astro`, `MemberModal.tsx` |
| e2e specs | `e2e/navigation.spec.ts` | `e2e/favorites.spec.ts`, `e2e/filtering.spec.ts` |

Read-only for everyone until the final cleanup: `src/pages/guide.astro`,
`src/pages/acerca.astro`, `src/pages/comunidad.astro`, `src/components/guide/*`,
`src/components/about/*`, `src/components/community/*` and their `en/` copies.
Reuse guide components by importing them; do not modify them.

i18n rule: the JSON files are shared, so edit only inside your namespaces.
The new namespaces already exist at the end of both files with a `_note`
key; add your keys right after that line and never reorder or reformat the
rest of the file. Existing namespaces (`nav`, `footer`, `sitesPage`, ...) are
edited in place. Keep `es.json` and `en.json` in sync.

## Rules for every agent

- All code, comments, docs, UI copy defaults and commit messages in English.
  Spanish UI strings go only in `es.json` or CMS fallbacks.
- Strict TDD: write the failing test first, then the code.
- Conventional commits (`feat(scope): ...`, `test(...)`, `fix(...)`). Do NOT
  add `Co-Authored-By` or any AI attribution.
- Use `rg`, `fd`, `eza`, `bat` instead of grep, find, ls, cat.
- Never read or print `.env*` files.
- Every existing page must keep working until the final cleanup. New CMS
  fields are optional; always provide a fallback.
- Before each milestone report run: `pnpm lint` (0 errors), `pnpm astro check`
  (0 errors), `pnpm test` (all green). Run the e2e specs you own with
  `pnpm test:e2e <spec>` when you change them.
- Accessibility: WCAG 2.2 AA. Small text uses `textColor`, never `color`
  (see the contract). Keyboard and focus states for every interactive element.

## Milestone report format

Write it as your final message and stop:

1. Branch and commits (hash + subject)
2. What was done, per task ID
3. Command results (lint, astro check, test, e2e)
4. Requests for files you do not own (file, change, reason)
5. Open questions or risks
