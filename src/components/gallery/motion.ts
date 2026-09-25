export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Scroll behavior that honors the user's reduced-motion preference. */
export function scrollBehavior(): ScrollBehavior {
  const reduce = typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
  return reduce ? "auto" : "smooth";
}
