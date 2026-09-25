import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import CommunityGallery, { type CommunityGalleryLabels } from "../CommunityGallery";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(resolve(__dirname, "../CommunityGallery.tsx"), "utf8");
const CSS = readFileSync(resolve(__dirname, "../communityGallery.css"), "utf8");

const labels: CommunityGalleryLabels = {
  title: "Gallery",
  previous: "Previous photos",
  next: "Next photos",
  openPhoto: "Open photo {{index}} of {{total}}",
  photoAlt: "{{name}}, photo {{index}} of {{total}}",
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

  it("does not render the lightbox until a photo is opened", () => {
    expect(render()).not.toContain("lightbox");
  });

  it("reuses the shared GalleryLightbox instead of its own viewer", () => {
    expect(SOURCE).toMatch(/import\s+GalleryLightbox\s+from\s+["']\.\.\/site-detail\/GalleryLightbox["']/);
  });

  it("uses instant scrolling when the user prefers reduced motion", () => {
    expect(SOURCE).toContain("prefers-reduced-motion: reduce");
  });
});

describe("communityGallery.css", () => {
  it("snaps the desktop row horizontally", () => {
    expect(CSS).toMatch(/scroll-snap-type:\s*x mandatory/);
  });

  it("switches to a full-viewport vertical snap feed at <= 768px", () => {
    expect(CSS).toMatch(/@media \(max-width: 768px\)/);
    expect(CSS).toMatch(/scroll-snap-type:\s*y mandatory/);
    expect(CSS).toMatch(/100svh/);
  });

  it("disables smooth scrolling and transitions under prefers-reduced-motion", () => {
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it("styles a visible keyboard focus state for the photo buttons", () => {
    expect(CSS).toMatch(/\.community-gallery__photo:focus-visible/);
  });
});
