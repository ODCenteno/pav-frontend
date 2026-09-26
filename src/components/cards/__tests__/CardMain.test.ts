import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cardContactInfo } from "../socialLinks";
import type { Listing } from "@/types/listing.type";

const __dirname = dirname(fileURLToPath(import.meta.url));

let source: string;
let css: string;
let socials: string;

beforeAll(() => {
  source = readFileSync(resolve(__dirname, "../CardMain.astro"), "utf8");
  css = readFileSync(resolve(__dirname, "../cardsMain.css"), "utf8");
  socials = readFileSync(resolve(__dirname, "../Socials.astro"), "utf8");
});

describe("CardMain (F3)", () => {
  it("no longer renders the ★ featured badge", () => {
    expect(source).not.toContain("★");
    expect(source).not.toContain("listing-featured-badge");
    expect(css).not.toContain(".listing-featured-badge");
  });

  it("keeps isFeatured in the data", () => {
    expect(source).toMatch(/data-is-featured=\{isFeatured\}/);
  });

  it("renders a small CommunityBadge where the star was", () => {
    expect(source).toMatch(/import CommunityBadge from "@\/components\/community-badge\/CommunityBadge\.astro"/);
    expect(source).toMatch(
      /<CommunityBadge\s+community=\{item\.community\}\s+size="sm"\s+locale=\{langKey\}\s+class="listing-community-badge"\s*\/>/,
    );
    expect(css).toContain(".listing-community-badge");
  });

  it("themes the card through communityStyle", () => {
    expect(source).toMatch(/communityStyle\(item\.community\)/);
    expect(source).toMatch(/style=\{themeStyle\}/);
  });

  it("uses the community custom properties for tags, icons and hover", () => {
    expect(css).toMatch(/\.listing-tag\s*\{[^}]*var\(--community-color-text\)/);
    expect(css).toMatch(/\.fav-btn\s*\{[^}]*var\(--community-color\)/);
    expect(css).toMatch(/\.listing-card:hover\s*\{[^}]*var\(--community-color\)/);
    expect(socials).toMatch(/\.social-link\s*\{[^}]*var\(--community-color-text/);
    expect(socials).toMatch(/\.social-link:hover[^{]*\{[^}]*var\(--community-color/);
  });

  it("drops the hardcoded sea-green rgba", () => {
    for (const text of [css, socials]) {
      expect(text).not.toMatch(/rgba\(\s*90\s*,\s*138\s*,\s*128/);
    }
  });

  it("keeps the favorite button working", () => {
    expect(source).toMatch(/class="fav-btn"[^>]*data-fav-id=\{item\.id\}/);
    expect(source).toContain("window.toggleFav(this)");
    expect(source).toContain("toggleFavorite(id)");
  });

  it("gives the social icons a visible keyboard focus state", () => {
    expect(socials).toMatch(/\.social-link:focus-visible/);
  });
});

describe("cardContactInfo", () => {
  const base: Listing = {
    id: "1",
    slug: "x",
    name: { "es-MX": "X", en: "X" },
    categoryId: "experiences",
    contact: {
      whatsapp: "+526131234567",
      phone: "+526131234567",
      email: "a@b.mx",
      instagram: "pav",
      facebook: "pav",
    },
  };

  it("passes every contact channel through by default", () => {
    expect(cardContactInfo(base)).toEqual({
      whatsapp: "+526131234567",
      instagram: "pav",
      facebook: "pav",
      phone: "+526131234567",
      email: "a@b.mx",
    });
  });

  it("hides every contact channel, social profiles included, when hideContact is set", () => {
    expect(cardContactInfo({ ...base, hideContact: true })).toEqual({
      whatsapp: "",
      instagram: "",
      facebook: "",
      phone: "",
      email: "",
    });
  });

  it("reads legacy top-level fields when contact is absent", () => {
    const legacy = { ...base, contact: undefined, whatsapp: "6131234567" } as Listing;
    expect(cardContactInfo(legacy).whatsapp).toBe("6131234567");
  });
});

describe("CardMain B4 polish", () => {
  it("files the card under its current category slug (legacy slugs mapped)", () => {
    expect(source).toMatch(/import \{ carouselCategoryOf \} from "@\/components\/main\/categories\/carousel"/);
    expect(source).toMatch(/class="listing-card-container"[^>]*data-category=\{carouselCategoryOf\(item\)\}/);
  });

  it("exposes the favorite state with aria-pressed", () => {
    expect(source).toMatch(/class="fav-btn"[^>]*aria-pressed="false"/);
    const updates = source.match(/setAttribute\("aria-pressed", String\([^)]*\)\)/g) ?? [];
    expect(updates.length).toBeGreaterThanOrEqual(2); // page-load sync + toggle
  });

  it("takes the favorite label from i18n", () => {
    expect(source).toMatch(/const favLabel = t\("featured\.favorite"\)/);
    expect(source).not.toContain("Agregar a favoritos");
    expect(source).not.toContain("Add to favorites");
  });

  it("defines featured.favorite in both locales", () => {
    const es = JSON.parse(readFileSync(resolve(__dirname, "../../../i18n/es.json"), "utf8"));
    const en = JSON.parse(readFileSync(resolve(__dirname, "../../../i18n/en.json"), "utf8"));
    expect(es.featured.favorite).toBe("Guardar en favoritos");
    expect(en.featured.favorite).toBe("Save to favorites");
  });
});
