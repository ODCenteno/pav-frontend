import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import StickyActionBar from "../StickyActionBar";

const labels = {
  directions: "Directions",
  contact: "Contact",
  favorite: "Save",
  favoriteActive: "Saved",
};

describe("StickyActionBar WhatsApp link (contract §5b)", () => {
  it("builds wa.me from the E.164 view-model value without the +", () => {
    const html = renderToStaticMarkup(<StickyActionBar id="1" whatsapp="+526131234567" labels={labels} />);
    expect(html).toContain('href="https://wa.me/526131234567"');
  });

  it("hides the contact button when the number cannot be normalized", () => {
    const html = renderToStaticMarkup(<StickyActionBar id="1" whatsapp="12345" labels={labels} />);
    expect(html).not.toContain("wa.me");
    expect(html).not.toContain(">Contact<");
  });
});
