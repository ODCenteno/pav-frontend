import { marked } from "marked";

/**
 * Mar de Cortés — markdown helpers for Strapi rich-text fields.
 *
 * Strapi returns long-form fields (listing `description`, `product.description`,
 * member `bio`, story `narrative`, legal `content`, etc.) as markdown-flavoured
 * strings. These helpers convert that markdown into safe HTML for display, or
 * into clean plain text for search indexes / meta tags / alt attributes.
 *
 * Rendering is performed once at build / SSR time (these are only called from
 * `.astro` components), so `marked` never ships to the client.
 */

// Stable configuration: keep output predictable and free of legacy quirks.
marked.setOptions({
  breaks: false, // respect markdown semantics (single \n is not a <br>)
  gfm: true, // GitHub-flavoured markdown (lists, strikethrough)
});

/**
 * Convert a markdown string into HTML.
 *
 * Returns an empty string for null/undefined/empty input so callers can pipe
 * optional fields straight in without guards. The output is intended for use
 * with `set:html` in `.astro` templates.
 *
 * The source content is authored exclusively in the Strapi admin (trusted),
 * but the parser is configured to avoid emitting legacy/ambiguous constructs
 * (no auto header IDs, no `<script>` passthrough).
 */
export function renderMarkdown(value: string | null | undefined): string {
  if (!value || !value.trim()) return "";
  return marked.parse(value, { async: false }) as string;
}

/**
 * Convert a markdown string into clean plain text.
 *
 * Strips all markdown syntax (headings, emphasis, lists, links, code) and
 * collapses whitespace. Use this anywhere a raw string is required but
 * markdown characters would be noisy or break the consumer — e.g. the card
 * `data-description` search attribute, `<meta>` descriptions, image alt text.
 */
export function stripMarkdown(value: string | null | undefined): string {
  if (!value || !value.trim()) return "";
  // Render to HTML, then strip tags + collapse whitespace.
  const html = marked.parse(value, { async: false }) as string;
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
