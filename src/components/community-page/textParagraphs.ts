/**
 * Plain CMS text (e.g. `community.description`) as paragraphs: split on
 * blank lines, trimmed, empty ones dropped. Single line breaks stay inside
 * a paragraph.
 */
export function textParagraphs(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
