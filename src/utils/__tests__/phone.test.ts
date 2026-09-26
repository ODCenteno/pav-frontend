import { describe, it, expect } from "vitest";
import { normalizePhone, composePhone, telHref, whatsappHref, formatPhone } from "../phone";

describe("normalizePhone (contract §5b parser table, shared with the backend)", () => {
  it.each([
    ["5216131234567", "+526131234567"],
    ["526131234567", "+526131234567"],
    ["+52 613 123 4567", "+526131234567"],
    ["613-123-4567", "+526131234567"],
    ["+52 1 613 123 4567", "+526131234567"],
    ["(613) 123 4567", "+526131234567"],
  ])("%s → %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each([["12345"], [""], ["   "], ["abc"], ["12613123456"], ["53123456789012"]])(
    "%j cannot be normalized → undefined",
    (input) => {
      expect(normalizePhone(input)).toBeUndefined();
    },
  );

  it("handles missing input", () => {
    expect(normalizePhone(undefined)).toBeUndefined();
    expect(normalizePhone(null)).toBeUndefined();
  });
});

describe("composePhone (new contact fields)", () => {
  it("joins the country code and the 10-digit national number", () => {
    expect(composePhone("+52", "6131234567")).toBe("+526131234567");
    expect(composePhone("+1", "5551234567")).toBe("+15551234567");
  });

  it("defaults the country code to +52 when it is empty or invalid", () => {
    expect(composePhone(undefined, "6131234567")).toBe("+526131234567");
    expect(composePhone("", "6131234567")).toBe("+526131234567");
    expect(composePhone("52", "6131234567")).toBe("+526131234567");
  });

  it("rejects a national number that is not exactly 10 digits", () => {
    expect(composePhone("+52", "613123456")).toBeUndefined();
    expect(composePhone("+52", "613 123 4567")).toBeUndefined();
    expect(composePhone("+52", undefined)).toBeUndefined();
    expect(composePhone("+52", "")).toBeUndefined();
  });
});

describe("telHref", () => {
  it("builds a tel: link from an E.164 number", () => {
    expect(telHref("+526131234567")).toBe("tel:+526131234567");
  });

  it("normalizes legacy input first", () => {
    expect(telHref("613-123-4567")).toBe("tel:+526131234567");
  });

  it("keeps an already composed non-Mexican E.164 number", () => {
    expect(telHref("+15551234567")).toBe("tel:+15551234567");
  });

  it("returns undefined when the value cannot be normalized", () => {
    expect(telHref("12345")).toBeUndefined();
    expect(telHref(undefined)).toBeUndefined();
  });
});

describe("whatsappHref", () => {
  it("builds a wa.me link without the leading +", () => {
    expect(whatsappHref("+526131234567")).toBe("https://wa.me/526131234567");
  });

  it("drops the legacy mobile 1 prefix", () => {
    expect(whatsappHref("5216131234567")).toBe("https://wa.me/526131234567");
  });

  it("returns undefined when the value cannot be normalized", () => {
    expect(whatsappHref("12345")).toBeUndefined();
    expect(whatsappHref("")).toBeUndefined();
  });
});

describe("formatPhone", () => {
  it("displays a Mexican number as +52 XXX XXX XXXX", () => {
    expect(formatPhone("+526131234567")).toBe("+52 613 123 4567");
    expect(formatPhone("5216131234567")).toBe("+52 613 123 4567");
  });

  it("groups other country codes the same way", () => {
    expect(formatPhone("+15551234567")).toBe("+1 555 123 4567");
  });

  it("returns undefined when the value cannot be normalized", () => {
    expect(formatPhone("12345")).toBeUndefined();
  });
});
