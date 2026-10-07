import { describe, it, expect } from "vitest";

import { imageAttrs, reactImageAttrs, responsiveImageFromMedia, type ResponsiveImageMap } from "../responsiveImage";

const R2 = "https://pub-example.r2.dev";

/** A Strapi v5 flat media with the four default breakpoints. */
const ballena = {
  id: 7,
  url: `${R2}/museo_ballena_abc.jpg`,
  width: 4000,
  height: 3000,
  formats: {
    thumbnail: { url: `${R2}/thumbnail_museo_ballena_abc.jpg`, width: 208, height: 156 },
    small: { url: `${R2}/small_museo_ballena_abc.jpg`, width: 500, height: 375 },
    medium: { url: `${R2}/medium_museo_ballena_abc.jpg`, width: 750, height: 563 },
    large: { url: `${R2}/large_museo_ballena_abc.jpg`, width: 1000, height: 750 },
  },
};

describe("responsiveImageFromMedia", () => {
  it("builds a width-ascending srcset from the formats plus the original", () => {
    const out = responsiveImageFromMedia(ballena)!;
    expect(out.srcset).toBe(
      [
        `${R2}/thumbnail_museo_ballena_abc.jpg 208w`,
        `${R2}/small_museo_ballena_abc.jpg 500w`,
        `${R2}/medium_museo_ballena_abc.jpg 750w`,
        `${R2}/large_museo_ballena_abc.jpg 1000w`,
        `${R2}/museo_ballena_abc.jpg 4000w`,
      ].join(", "),
    );
  });

  it("points src to the medium format and keeps the original aspect ratio", () => {
    expect(responsiveImageFromMedia(ballena)).toMatchObject({
      src: `${R2}/medium_museo_ballena_abc.jpg`,
      width: 4000,
      height: 3000,
    });
  });

  it("falls back to the next mid-size format when medium is missing", () => {
    const { medium: _medium, ...rest } = ballena.formats;
    expect(responsiveImageFromMedia({ ...ballena, formats: rest })!.src).toBe(`${R2}/small_museo_ballena_abc.jpg`);
  });

  it("returns undefined without formats (nothing to gain over the plain URL)", () => {
    expect(responsiveImageFromMedia({ url: "/uploads/a.jpg", width: 10, height: 10 })).toBeUndefined();
    expect(responsiveImageFromMedia({ url: "/uploads/a.jpg", formats: null })).toBeUndefined();
    expect(responsiveImageFromMedia({ url: "/uploads/a.jpg", formats: {} })).toBeUndefined();
    expect(responsiveImageFromMedia(undefined)).toBeUndefined();
    expect(responsiveImageFromMedia(null)).toBeUndefined();
  });

  it("returns undefined for a media without url", () => {
    expect(responsiveImageFromMedia({ formats: ballena.formats })).toBeUndefined();
  });

  it("resolves relative URLs through the given resolver", () => {
    const out = responsiveImageFromMedia(
      {
        url: "/uploads/hero.jpg",
        width: 1200,
        height: 800,
        formats: { small: { url: "/uploads/small_hero.jpg", width: 500, height: 333 } },
      },
      (url) => `https://cms.example.com${url}`,
    )!;
    expect(out.src).toBe("https://cms.example.com/uploads/small_hero.jpg");
    expect(out.srcset).toBe(
      "https://cms.example.com/uploads/small_hero.jpg 500w, https://cms.example.com/uploads/hero.jpg 1200w",
    );
  });

  it("skips formats without a usable url or width and duplicate widths", () => {
    const out = responsiveImageFromMedia({
      url: `${R2}/a.jpg`,
      width: 500,
      height: 400,
      formats: {
        small: { url: `${R2}/small_a.jpg`, width: 500, height: 400 },
        broken: { url: "", width: 300 },
        noWidth: { url: `${R2}/x_a.jpg` },
        thumbnail: { url: `${R2}/thumbnail_a.jpg`, width: 195, height: 156 },
      },
    })!;
    expect(out.srcset).toBe(`${R2}/thumbnail_a.jpg 195w, ${R2}/small_a.jpg 500w`);
  });

  it("omits the original from the srcset when its width is unknown", () => {
    const out = responsiveImageFromMedia({
      url: `${R2}/a.jpg`,
      formats: { small: { url: `${R2}/small_a.jpg`, width: 500, height: 250 } },
    })!;
    expect(out.srcset).toBe(`${R2}/small_a.jpg 500w`);
    // Aspect ratio comes from the chosen format when the original lacks it.
    expect(out).toMatchObject({ width: 500, height: 250 });
  });

  it("reads the Strapi v4 wrapped shape", () => {
    const out = responsiveImageFromMedia({ data: { id: 1, attributes: ballena } });
    expect(out?.src).toBe(`${R2}/medium_museo_ballena_abc.jpg`);
  });
});

describe("imageAttrs", () => {
  const url = `${R2}/museo_ballena_abc.jpg`;
  const sources: ResponsiveImageMap = { [url]: responsiveImageFromMedia(ballena)! };

  it("returns src, srcset, sizes and dimensions for a known URL", () => {
    expect(imageAttrs(url, sources, "(min-width: 768px) 33vw, 100vw")).toEqual({
      src: `${R2}/medium_museo_ballena_abc.jpg`,
      srcset: sources[url].srcset,
      sizes: "(min-width: 768px) 33vw, 100vw",
      width: 4000,
      height: 3000,
    });
  });

  it("falls back to the plain URL when the image has no responsive sources", () => {
    expect(imageAttrs("/images/pav-01.jpg", sources, "100vw")).toEqual({ src: "/images/pav-01.jpg" });
    expect(imageAttrs(url, undefined, "100vw")).toEqual({ src: url });
  });
});

describe("reactImageAttrs", () => {
  const url = `${R2}/museo_ballena_abc.jpg`;
  const sources: ResponsiveImageMap = { [url]: responsiveImageFromMedia(ballena)! };

  it("uses React's srcSet prop name", () => {
    expect(reactImageAttrs(url, sources, "50vw")).toEqual({
      src: `${R2}/medium_museo_ballena_abc.jpg`,
      srcSet: sources[url].srcset,
      sizes: "50vw",
      width: 4000,
      height: 3000,
    });
  });

  it("can leave out the intrinsic dimensions (letterboxed viewers)", () => {
    expect(reactImageAttrs(url, sources, "100vw", { dimensions: false })).toEqual({
      src: `${R2}/medium_museo_ballena_abc.jpg`,
      srcSet: sources[url].srcset,
      sizes: "100vw",
    });
  });

  it("falls back to the plain URL", () => {
    expect(reactImageAttrs("/images/a.jpg", undefined, "50vw")).toEqual({ src: "/images/a.jpg" });
  });
});
