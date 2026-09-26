import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cardSocialLinks } from "../socialLinks";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("cardSocialLinks", () => {
  it("builds E.164 tel: and wa.me links through the phone helper", () => {
    const links = cardSocialLinks({ whatsapp: "+526131234567", phone: "5216131234567" });
    expect(links.map((l) => [l.key, l.href])).toEqual([
      ["whatsapp", "https://wa.me/526131234567"],
      ["phone", "tel:+526131234567"],
    ]);
  });

  it("drops phone numbers that cannot be normalized", () => {
    expect(cardSocialLinks({ whatsapp: "12345", phone: "n/a" })).toEqual([]);
  });

  it("keeps the prefix rules for the other platforms", () => {
    const links = cardSocialLinks({
      email: "a@b.mx",
      instagram: "https://instagram.com/pav",
      facebook: "",
      unknown: "x",
    });
    expect(links.map((l) => [l.key, l.href])).toEqual([
      ["email", "mailto:a@b.mx"],
      ["instagram", "https://instagram.com/pav"],
    ]);
  });

  it("carries the icon and label from the social config", () => {
    const [link] = cardSocialLinks({ phone: "6131234567" });
    expect(link.label).toBe("Llamar");
    expect(link.icon).toContain("<path");
  });
});

describe("Socials.astro", () => {
  it("resolves its links through cardSocialLinks", () => {
    const source = readFileSync(resolve(__dirname, "../Socials.astro"), "utf8");
    expect(source).toMatch(/cardSocialLinks\(socialInfo\)/);
    expect(source).not.toMatch(/urlPrefix/);
  });
});
