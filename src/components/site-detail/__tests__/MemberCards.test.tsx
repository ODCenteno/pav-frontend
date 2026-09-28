import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MemberCards, { type MemberCardsLabels } from "../MemberCards";
import type { MemberVm } from "../MemberModal";

const labels: MemberCardsLabels = {
  close: "Close",
  gallery: "Gallery",
  call: "Call",
  email: "Email",
  openProfile: "View profile",
  contact: "Contact",
  photos: "Photos of {{name}}",
  previousPhoto: "Previous photo",
  nextPhoto: "Next photo",
  openPhoto: "Open photo {{index}} of {{total}}",
};

const lupe: MemberVm = {
  id: "1",
  name: "Doña Lupe",
  role: "Palm weaver",
  summary: "Weaves palm baskets by hand.",
  bioHtml: "<p>Full bio</p>",
  galleryUrls: ["/a.jpg", "/b.jpg"],
  social: [
    { platform: "whatsapp", handle: "5216120000000", url: "https://wa.me/5216120000000" },
    { platform: "phone", handle: "612 000 0000", url: "tel:6120000000" },
  ],
};

function render(members: MemberVm[] = [lupe]) {
  return renderToStaticMarkup(<MemberCards members={members} labels={labels} />);
}

describe("MemberCards", () => {
  it("renders nothing without members", () => {
    expect(render([])).toBe("");
  });

  it("shows the name and the short description instead of the full bio", () => {
    const html = render();
    expect(html).toContain("Doña Lupe</h3>");
    expect(html).toContain('<p class="member-strip__summary">Weaves palm baskets by hand.</p>');
    expect(html).not.toContain("Full bio");
  });

  it("renders an inline photo carousel of the member gallery with lazy images", () => {
    const html = render();
    expect(html).toContain('aria-label="Photos of Doña Lupe"');
    expect(html.match(/class="member-strip__photos-item"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Open photo 2 of 2"');
    expect(html.match(/loading="lazy"/g)!.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('aria-label="Previous photo"');
    expect(html).toContain('aria-label="Next photo"');
  });

  it("omits the carousel when the member has no gallery", () => {
    const html = render([{ ...lupe, galleryUrls: [] }]);
    expect(html).not.toContain("member-strip__photos");
  });

  it("renders WhatsApp and phone contact buttons with the social links bar", () => {
    const html = render();
    expect(html).toContain('class="social-links member-strip__contact"');
    expect(html).toContain('href="https://wa.me/5216120000000"');
    expect(html).toContain('href="tel:6120000000"');
    expect(html).toContain('aria-label="WhatsApp: Doña Lupe"');
    expect(html).toContain('aria-label="Call: Doña Lupe"');
  });

  it("opens WhatsApp in a new tab and the phone in the same tab", () => {
    const html = render();
    expect(html).toMatch(/href="https:\/\/wa\.me\/5216120000000" target="_blank" rel="noopener noreferrer"/);
    expect(html).toMatch(/href="tel:6120000000" target="_self"/);
  });

  it("opens the profile modal from a real button, not from a clickable card", () => {
    const html = render();
    expect(html).toContain('<button type="button" class="member-strip__open" aria-label="View profile: Doña Lupe">');
    expect(html).not.toContain('role="button"');
  });

  it("does not render the modal or the lightbox until opened", () => {
    const html = render();
    expect(html).not.toContain("member-modal");
    expect(html).not.toContain("lightbox");
  });
});
