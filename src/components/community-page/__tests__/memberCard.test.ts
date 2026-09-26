import { describe, expect, it } from "vitest";
import {
  contactLinkLabel,
  contactLinkTarget,
  memberContactLinks,
  memberSummary,
  SUMMARY_MAX_LENGTH,
} from "../memberCard";

describe("memberSummary", () => {
  it("prefers shortDescription", () => {
    expect(memberSummary({ shortDescription: "  Weaves palm baskets.  ", bio: "Long bio" })).toBe(
      "Weaves palm baskets."
    );
  });

  it("falls back to the bio as plain text when there is no shortDescription", () => {
    expect(memberSummary({ bio: "**Doña Lupe** makes [cheese](https://x.test).\n\n# Heading" })).toBe(
      "Doña Lupe makes cheese. Heading"
    );
  });

  it("truncates a long bio on a word boundary with an ellipsis", () => {
    const bio = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    const summary = memberSummary({ bio })!;
    expect(summary.length).toBeLessThanOrEqual(SUMMARY_MAX_LENGTH + 1);
    expect(summary.endsWith("…")).toBe(true);
    const kept = summary.slice(0, -1);
    expect(bio.startsWith(kept)).toBe(true);
    // Cut on a word boundary: the next char in the source is a space.
    expect(bio.charAt(kept.length)).toBe(" ");
  });

  it("returns undefined when there is nothing to show", () => {
    expect(memberSummary({})).toBeUndefined();
    expect(memberSummary({ shortDescription: " ", bio: "" })).toBeUndefined();
  });
});

describe("memberContactLinks", () => {
  it("puts WhatsApp and phone first and keeps the other social links", () => {
    const links = memberContactLinks({
      social: [
        { platform: "instagram", handle: "lupe", url: "https://instagram.com/lupe" },
        { platform: "phone", handle: "612 000 0000", url: "tel:6120000000" },
        { platform: "whatsapp", handle: "5216120000000", url: "https://wa.me/5216120000000" },
      ],
    });
    expect(links.map((l) => l.platform)).toEqual(["whatsapp", "phone", "instagram"]);
  });

  it("adds phone and WhatsApp from the member fields as E.164 links (contract §5b)", () => {
    const links = memberContactLinks({ social: [], phone: "+526121112233", whatsapp: "+52 1 612 111 2233" });
    expect(links).toEqual([
      { platform: "whatsapp", handle: "+52 612 111 2233", url: "https://wa.me/526121112233" },
      { platform: "phone", handle: "+52 612 111 2233", url: "tel:+526121112233" },
    ]);
  });

  it("drops member numbers that cannot be normalized", () => {
    expect(memberContactLinks({ social: [], phone: "12345", whatsapp: "abc" })).toEqual([]);
  });

  it("does not duplicate a platform already present in social", () => {
    const links = memberContactLinks({
      social: [{ platform: "whatsapp", handle: "1", url: "https://wa.me/1" }],
      whatsapp: "2",
    });
    expect(links).toEqual([{ platform: "whatsapp", handle: "1", url: "https://wa.me/1" }]);
  });
});

describe("contactLinkLabel", () => {
  const labels = { call: "Llamar", email: "Enviar correo" };

  it("uses the localized labels for phone and email", () => {
    expect(contactLinkLabel({ platform: "phone" }, labels)).toBe("Llamar");
    expect(contactLinkLabel({ platform: "email" }, labels)).toBe("Enviar correo");
  });

  it("uses the platform brand name for social networks", () => {
    expect(contactLinkLabel({ platform: "whatsapp" }, labels)).toBe("WhatsApp");
    expect(contactLinkLabel({ platform: "instagram" }, labels)).toBe("Instagram");
  });

  it("falls back to the raw platform", () => {
    expect(contactLinkLabel({ platform: "other" }, labels)).toBe("other");
  });
});

describe("contactLinkTarget", () => {
  it("keeps phone and email in the same tab and opens the rest in a new one", () => {
    expect(contactLinkTarget({ platform: "phone" })).toBe("_self");
    expect(contactLinkTarget({ platform: "email" })).toBe("_self");
    expect(contactLinkTarget({ platform: "whatsapp" })).toBe("_blank");
  });
});
