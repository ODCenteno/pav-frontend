import { describe, expect, it } from "vitest";
import { socialUrl } from "../social";

describe("socialUrl", () => {
  describe("instagram", () => {
    it("builds a URL from a bare handle (no @, no http)", () => {
      expect(socialUrl({ platform: "instagram", handle: "pav" })).toBe(
        "https://instagram.com/pav"
      );
    });

    it("strips a leading @ from the handle", () => {
      expect(socialUrl({ platform: "instagram", handle: "@pav_ejemplo" })).toBe(
        "https://instagram.com/pav_ejemplo"
      );
    });

    it("preserves a full https URL", () => {
      expect(
        socialUrl({
          platform: "instagram",
          handle: "https://instagram.com/pav",
        })
      ).toBe("https://instagram.com/pav");
    });

    it("prefers an explicit url over a derived one", () => {
      expect(
        socialUrl({
          platform: "instagram",
          handle: "ignored",
          url: "https://instagram.com/explicit",
        })
      ).toBe("https://instagram.com/explicit");
    });
  });

  describe("facebook", () => {
    it("builds a URL from a bare page slug", () => {
      expect(socialUrl({ platform: "facebook", handle: "pav.ejemplo" })).toBe(
        "https://facebook.com/pav.ejemplo"
      );
    });

    it("preserves a full https URL", () => {
      expect(
        socialUrl({
          platform: "facebook",
          handle: "https://facebook.com/pav",
        })
      ).toBe("https://facebook.com/pav");
    });
  });

  describe("whatsapp", () => {
    it("strips non-digits and builds a wa.me URL", () => {
      expect(
        socialUrl({ platform: "whatsapp", handle: "+52 614 123 4567" })
      ).toBe("https://wa.me/526141234567");
    });

    it("handles bare digits", () => {
      expect(socialUrl({ platform: "whatsapp", handle: "521234567890" })).toBe(
        "https://wa.me/521234567890"
      );
    });
  });

  describe("tiktok", () => {
    it("builds a URL from a handle", () => {
      expect(socialUrl({ platform: "tiktok", handle: "pav" })).toBe(
        "https://tiktok.com/@pav"
      );
    });
  });

  describe("edge cases", () => {
    it("returns '#' when both url and handle are missing", () => {
      expect(socialUrl({ platform: "instagram" })).toBe("#");
    });

    it("returns '#handle' for unknown platforms with a handle", () => {
      expect(socialUrl({ platform: "mastodon", handle: "pav" })).toBe(
        "#pav"
      );
    });
  });
});
