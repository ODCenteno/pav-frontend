/**
 * Fill `{{key}}` placeholders in a label resolved at build time.
 *
 * Islands can't call `t()` at runtime, so shells pass templates such as
 * "Photo {{index}} of {{total}}" and the island fills them per item.
 * Unknown placeholders are left as-is so a missing value is visible.
 */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
