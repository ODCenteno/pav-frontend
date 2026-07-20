/**
 * Map popup HTML builder.
 *
 * Pure string assembly — no Leaflet, no DOM, no globals. Safe to import
 * from server code, fixtures, and unit tests.
 */

export interface MarkerItem {
  lat: number;
  lng: number;
  title: string;
  href?: string;
  categoryColor: string;
  /** Optional thumbnail shown in the popup. URL-ready (already resolved). */
  image?: string;
  /** Optional one-line summary shown under the title in the popup. */
  description?: string;
}

export interface PopupContentInput {
  title: string;
  href?: string;
  image?: string;
  description?: string;
}

const DEFAULT_LINK_LABEL = "Ver sitio";

export function createPopupContent(
  item: PopupContentInput,
  linkLabel: string = DEFAULT_LINK_LABEL
): string {
  const { title, href, image, description } = item;

  // Map title + description go through `escapeText` to neutralize any HTML;
  // href/image go through `escapeAttr` so attribute syntax stays valid.
  const safeTitle = escapeText(title);
  const safeDescription = description ? escapeText(description) : "";
  const safeHref = href ? escapeAttr(href) : "";
  const safeImage = image ? escapeAttr(image) : "";

  const imageMarkup = safeImage
    ? `<img class="map-popup__image" src="${safeImage}" alt="" loading="lazy" decoding="async" />`
    : "";

  const descriptionMarkup = safeDescription
    ? `<p class="map-popup__description">${safeDescription}</p>`
    : "";

  const linkMarkup = safeHref
    ? `<a href="${safeHref}" class="map-popup__link">${escapeText(linkLabel)} &rarr;</a>`
    : "";

  return `
    <article class="map-popup">
      ${imageMarkup}
      <div class="map-popup__body">
        <h3 class="map-popup__title">${safeTitle}</h3>
        ${descriptionMarkup}
        ${linkMarkup}
      </div>
    </article>
  `;
}

/* ────────────────────────────────────────────────────────────────────
   HTML escaping helpers — keep user-supplied CMS text safe for inline
   insertion into both text content and attribute values.
   ──────────────────────────────────────────────────────────────────── */
function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
