import { describe, expect, it } from "vitest";
import { createPopupContent } from "../mapIcons";

describe("mapIcons.createPopupContent", () => {
  it("renders image + title + description + link when all are provided", () => {
    const html = createPopupContent({
      title: "Camping Punta Arena",
      href: "/sitios/camping-punta-arena",
      image: "https://example.com/img.jpg",
      description: "Acampada junto a la bahía con fogatas nocturnas.",
    });
    expect(html).toContain("map-popup__image");
    expect(html).toContain('src="https://example.com/img.jpg"');
    expect(html).toContain("Camping Punta Arena");
    expect(html).toContain("Acampada junto a la bahía");
    expect(html).toContain('href="/sitios/camping-punta-arena"');
    expect(html).toContain("map-popup__link");
  });

  it("omits the image when not provided", () => {
    const html = createPopupContent({ title: "Solo title", href: "/x" });
    expect(html).not.toContain("map-popup__image");
  });

  it("omits the description when not provided", () => {
    const html = createPopupContent({ title: "Solo title", href: "/x" });
    expect(html).not.toContain("map-popup__description");
  });

  it("omits the link when href is missing", () => {
    const html = createPopupContent({ title: "Pin without link" });
    expect(html).not.toContain("map-popup__link");
  });

  it("escapes HTML in user-supplied title to prevent XSS", () => {
    const html = createPopupContent({
      title: '<img src=x onerror="alert(1)">',
      href: "/x",
    });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });

  it("escapes HTML in user-supplied description", () => {
    const html = createPopupContent({
      title: "ok",
      description: '"><script>alert(1)</script>',
      href: "/x",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("uses a custom link label when provided", () => {
    const html = createPopupContent({ title: "x", href: "/x" }, "Ver detalle");
    expect(html).toContain("Ver detalle");
  });
});
