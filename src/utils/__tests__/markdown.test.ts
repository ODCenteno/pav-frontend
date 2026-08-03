import { describe, it, expect } from "vitest";
import { renderMarkdown, stripMarkdown } from "../markdown";

describe("renderMarkdown", () => {
  it("returns empty string for null/undefined/empty", () => {
    expect(renderMarkdown(undefined)).toBe("");
    expect(renderMarkdown(null)).toBe("");
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown("   ")).toBe("");
  });

  it("renders a heading", () => {
    const html = renderMarkdown("## Title");
    expect(html).toContain("<h2>");
    expect(html).toContain("Title");
    expect(html).toContain("</h2>");
  });

  it("renders a sub-heading", () => {
    const html = renderMarkdown("### Sub");
    expect(html).toContain("<h3>");
    expect(html).toContain("Sub");
  });

  it("renders an unordered bullet list", () => {
    const html = renderMarkdown("- Tacos de pescado\n- Birria de chivo");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>Tacos de pescado</li>");
    expect(html).toContain("<li>Birria de chivo</li>");
    expect(html).toContain("</ul>");
  });

  it("renders the real-world site-summary fixture", () => {
    // This is the exact content the user reported showing as raw text in prod.
    const md = `## Restaurante Rancho San Cosme ofrece platillos regionales y hospedaje en el corazón del rancho.
Disfruta de la comida del día o solicita un menú especial con previa reservación:
- Tacos de pescado
- Birria de chivo
- Tacos de carne asada
### Desayunos
- Machaca
- Huevos al gusto`;
    const html = renderMarkdown(md);
    // Heading rendered, not literal ##
    expect(html).not.toContain("##");
    expect(html).toContain("<h2>");
    expect(html).toContain("Restaurante Rancho San Cosme");
    expect(html).toContain("<h3>");
    expect(html).toContain("Desayunos");
    // Bullets rendered as list items, not literal -
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>Tacos de pescado</li>");
    expect(html).toContain("<li>Huevos al gusto</li>");
  });

  it("renders emphasis", () => {
    const html = renderMarkdown("**bold** and *italic*");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("renders links", () => {
    const html = renderMarkdown("[PAV](https://example.com)");
    expect(html).toContain('href="https://example.com');
    expect(html).toContain(">PAV</a>");
  });

  it("passes plain text through as a paragraph", () => {
    const html = renderMarkdown("Just plain text.");
    expect(html).toContain("<p>");
    expect(html).toContain("Just plain text.");
  });
});

describe("stripMarkdown", () => {
  it("returns empty string for null/undefined/empty", () => {
    expect(stripMarkdown(undefined)).toBe("");
    expect(stripMarkdown(null)).toBe("");
    expect(stripMarkdown("")).toBe("");
  });

  it("removes heading syntax but keeps the text", () => {
    expect(stripMarkdown("## Title")).toBe("Title");
    expect(stripMarkdown("### Sub")).toBe("Sub");
  });

  it("removes list bullets but keeps the text", () => {
    const plain = stripMarkdown("- Tacos\n- Birria");
    expect(plain).not.toContain("<");
    expect(plain).toContain("Tacos");
    expect(plain).toContain("Birria");
  });

  it("removes all HTML tags from rendered markdown", () => {
    const plain = stripMarkdown("## Title\n\n- item one\n- item two");
    expect(plain).not.toContain("<");
    expect(plain).not.toContain(">");
    expect(plain).not.toContain("##");
    expect(plain).not.toContain("-");
    expect(plain).toContain("Title");
    expect(plain).toContain("item one");
    expect(plain).toContain("item two");
  });

  it("removes emphasis markers but keeps text", () => {
    expect(stripMarkdown("**bold**")).toBe("bold");
    expect(stripMarkdown("*italic*")).toBe("italic");
  });

  it("removes link syntax but keeps label text", () => {
    const plain = stripMarkdown("[PAV](https://example.com)");
    expect(plain).not.toContain("https");
    expect(plain).toContain("PAV");
  });

  it("collapses whitespace", () => {
    const plain = stripMarkdown("Line one\n\n\n   Line two");
    expect(plain).not.toContain("\n");
    expect(plain).toBe("Line one Line two");
  });
});
