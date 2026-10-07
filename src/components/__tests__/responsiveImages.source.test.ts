/**
 * Source checks: every component that renders CMS listing, community, member
 * or gallery photos builds srcset/sizes from the Strapi formats
 * (`imageAttrs` / `reactImageAttrs`), and the pages hand it the sources.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (rel: string) => readFileSync(resolve(SRC, rel), "utf8");

describe.each([
  ["components/cards/CardMain.astro", /imageAttrs\(mainImageUrl, item\.imageSources, sizes\)/],
  ["components/site-detail/SiteHero.astro", /imageAttrs\(image, imageSources, "100vw"\)/],
  ["components/site-detail/StoryTimeline.astro", /imageAttrs\(story\.imageUrl, imageSources, STORY_IMAGE_SIZES\)/],
  ["components/community-page/CommunityHero.astro", /imageAttrs\(image, imageSources, "100vw"\)/],
  ["components/main/highlights/Highlights.astro", /imageAttrs\(card\.image, imageSources, HIGHLIGHT_IMAGE_SIZES\)/],
  ["components/site-detail/GalleryManager.tsx", /reactImageAttrs\(img\.src, imageSources, SITE_GALLERY_SIZES\)/],
  ["components/site-detail/GalleryLightbox.tsx", /reactImageAttrs\(images\[currentIndex\], imageSources, "100vw", \{ dimensions: false \}\)/],
  ["components/site-detail/MemberCards.tsx", /reactImageAttrs\(member\.photo, member\.imageSources, "64px"\)/],
  ["components/site-detail/MemberCards.tsx", /reactImageAttrs\(src, member\.imageSources, MEMBER_PHOTO_SIZES\)/],
  ["components/site-detail/MemberModal.tsx", /reactImageAttrs\(member\.photo, member\.imageSources, "88px"\)/],
  ["components/site-detail/MemberModal.tsx", /reactImageAttrs\(src, member\.imageSources, MODAL_GALLERY_SIZES\)/],
])("%s", (file, call) => {
  it("builds the image attributes from the responsive sources", () => {
    expect(read(file)).toMatch(call);
  });
});

describe("responsive sources reach the components", () => {
  it("card images default to the carousel slot width", () => {
    expect(read("components/cards/CardMain.astro")).toMatch(/sizes = "\(min-width: 768px\) 340px, 300px"/);
  });

  it("related sites pass the sizes of their grid", () => {
    expect(read("components/site-detail/RelatedSites.astro")).toMatch(/<CardMain[^>]*sizes=\{RELATED_CARD_SIZES\}/);
  });

  it("the site hero is the LCP image of the detail page", () => {
    expect(read("components/site-detail/SiteHero.astro")).toMatch(/class="site-hero__image"[^>]*fetchpriority="high"/);
  });

  it.each(["pages/sitios/[slug].astro", "pages/en/sitios/[slug].astro"])("%s passes the listing sources", (page) => {
    const source = read(page);
    expect(source).toMatch(/<SiteHero[\s\S]*?imageSources=\{item\.imageSources\}/);
    expect(source).toMatch(/<SiteGallery[\s\S]*?imageSources=\{item\.imageSources\}/);
    expect(source).toMatch(/<StoryTimeline[\s\S]*?imageSources=\{item\.imageSources\}/);
  });

  it("the site gallery hands the sources to its island and the lightbox", () => {
    expect(read("components/site-detail/SiteGallery.astro")).toMatch(/imageSources=\{imageSources\}/);
    expect(read("components/site-detail/GalleryManager.tsx")).toMatch(/<GalleryLightbox[\s\S]*?imageSources=\{imageSources\}/);
  });

  it("member view models carry their sources to the cards, modal and lightbox", () => {
    expect(read("components/site-detail/MemberStrip.astro")).toMatch(/imageSources: m\.imageSources/);
    expect(read("components/site-detail/MemberCards.tsx")).toMatch(/<GalleryLightbox[\s\S]*?imageSources=\{members\[openPhoto\.member\]\.imageSources\}/);
    expect(read("components/site-detail/MemberModal.tsx")).toMatch(/<GalleryLightbox[\s\S]*?imageSources=\{member\.imageSources\}/);
  });

  it("the community page passes the community sources", () => {
    const page = read("components/community-page/CommunityPage.astro");
    expect(page).toMatch(/<CommunityHero[^>]*imageSources=\{community\.imageSources\}/);
    expect(page).toMatch(/<Highlights[^>]*imageSources=\{community\.imageSources\}/);
    expect(page).toMatch(/<CommunityGallery[^>]*imageSources=\{community\.imageSources\}/);
  });
});
