import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import CommunityGallery, { COMMUNITY_GALLERY_SIZES, type CommunityGalleryLabels } from "../CommunityGallery";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(resolve(__dirname, "../CommunityGallery.tsx"), "utf8");
const MOTION = readFileSync(resolve(__dirname, "../motion.ts"), "utf8");
const CSS = readFileSync(resolve(__dirname, "../communityGallery.css"), "utf8");

const labels: CommunityGalleryLabels = {
  title: "Gallery",
  previous: "Previous photos",
  next: "Next photos",
  openPhoto: "Open photo {{index}} of {{total}}",
  photoAlt: "{{name}}, photo {{index}} of {{total}}",
  position: "Photo {{index}} of {{total}}",
  continue: "Continue",
};

const photos = ["/a.jpg", "/b.jpg", "/c.jpg"];

function render(list: string[] = photos) {
  return renderToStaticMarkup(
    <CommunityGallery photos={list} communityName="Puerto Agua Verde" labels={labels} />
  );
}

describe("CommunityGallery", () => {
  it("renders nothing when there are no photos", () => {
    expect(render([])).toBe("");
  });

  it("renders a titled section with one list item per photo", () => {
    const html = render();
    expect(html).toContain('<section class="community-gallery"');
    expect(html).toContain(">Gallery</h2>");
    expect(html.match(/<li class="community-gallery__item"/g)).toHaveLength(3);
  });

  it("lazy-loads every image and gives each a descriptive alt text", () => {
    const html = render();
    expect(html.match(/loading="lazy"/g)).toHaveLength(3);
    expect(html).toContain('alt="Puerto Agua Verde, photo 1 of 3"');
    expect(html).toContain('alt="Puerto Agua Verde, photo 3 of 3"');
  });

  it("wraps each photo in a button that opens the lightbox at that photo", () => {
    const html = render();
    expect(html).toContain('aria-label="Open photo 2 of 3"');
    expect(html.match(/<button type="button" class="community-gallery__photo"/g)).toHaveLength(3);
  });

  it("renders labelled prev/next buttons for the desktop row", () => {
    const html = render();
    expect(html).toContain('aria-label="Previous photos"');
    expect(html).toContain('aria-label="Next photos"');
  });

  it("shows the feed position, starting at the first photo", () => {
    const html = render();
    expect(html).toMatch(/class="community-gallery__position" aria-live="polite"/);
    expect(html).toContain('<span aria-hidden="true">1 / 3</span>');
    expect(html).toContain('<span class="sr-only">Photo 1 of 3</span>');
  });

  it("offers a way to continue past the gallery", () => {
    const html = render();
    expect(html).toMatch(/<a[^>]*class="community-gallery__continue"[^>]*href="#community-gallery-end"/);
    expect(html).toContain('id="community-gallery-end"');
    expect(html).toContain(">Continue<");
  });

  it("does not render the lightbox until a photo is opened", () => {
    expect(render()).not.toContain("lightbox");
  });

  it("reuses the shared GalleryLightbox instead of its own viewer", () => {
    expect(SOURCE).toMatch(/import\s+GalleryLightbox\s+from\s+["']\.\.\/site-detail\/GalleryLightbox["']/);
  });

  it("uses instant scrolling when the user prefers reduced motion", () => {
    expect(SOURCE).toMatch(/behavior:\s*scrollBehavior\(\)/);
    expect(MOTION).toContain("prefers-reduced-motion: reduce");
  });
});

describe("communityGallery.css", () => {
  it("snaps the desktop row horizontally", () => {
    expect(CSS).toMatch(/scroll-snap-type:\s*x mandatory/);
  });

  it("switches to a bounded vertical snap feed at <= 768px that never traps the page", () => {
    expect(CSS).toMatch(/@media \(max-width: 768px\)/);
    expect(CSS).toMatch(/scroll-snap-type:\s*y mandatory/);
    // Shorter than the viewport, so the page is always reachable around it.
    expect(CSS).toMatch(/--feed-height:\s*min\(\d+svh/);
    // Scroll chains to the page at both ends of the feed.
    expect(CSS).not.toMatch(/overscroll-behavior(-y)?:\s*contain/);
    expect(CSS).not.toMatch(/height:\s*100svh/);
  });

  it("disables smooth scrolling and transitions under prefers-reduced-motion", () => {
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it("styles a visible keyboard focus state for the photo buttons", () => {
    expect(CSS).toMatch(/\.community-gallery__photo:focus-visible/);
  });
});

describe("CommunityGallery responsive sources", () => {
  const imageSources = {
    "/a.jpg": { src: "/medium_a.jpg", srcset: "/small_a.jpg 500w, /medium_a.jpg 750w, /a.jpg 2000w", width: 2000, height: 1500 },
  };

  it("renders srcset and sizes from the Strapi formats, the plain URL otherwise", () => {
    const html = renderToStaticMarkup(
      <CommunityGallery photos={photos} imageSources={imageSources} communityName="Puerto Agua Verde" labels={labels} />
    );
    expect(html).toContain('src="/medium_a.jpg"');
    expect(html).toContain('srcSet="/small_a.jpg 500w, /medium_a.jpg 750w, /a.jpg 2000w"');
    expect(html).toContain(`sizes="${COMMUNITY_GALLERY_SIZES}"`);
    expect(html).toContain('width="2000" height="1500"');
    expect(html).toContain('src="/b.jpg"');
  });
});
