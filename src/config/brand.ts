/** Site brand shown in the header logo. A brand name: never translated. */
export const SITE_BRAND_NAME = "Comunidades Loretanas";

/** Logo lockup: first word on the first line, the rest on the second. */
export function brandLines(name: string): string[] {
  const [first, ...rest] = name.trim().split(/\s+/);
  return rest.length ? [first, rest.join(" ")] : [first];
}
