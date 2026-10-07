/**
 * Bundled copies of the community hero fallbacks (`COMMUNITY_HERO_FALLBACK`
 * in strapiTransformer), keyed by their public URL. Importing them through
 * astro:assets lets the build emit resized AVIF/WebP versions instead of
 * shipping the 2048px originals from /public.
 */
import type { ImageMetadata } from "astro";
import pavSign from "@/images/PAV-Letrero-.webp";
import sierraLandscape from "@/images/pav-landscape-12.webp";

export const LOCAL_HERO_IMAGES: Readonly<Record<string, ImageMetadata>> = {
  "/images/PAV-Letrero-.webp": pavSign,
  "/images/pav-landscape-12.webp": sierraLandscape,
};
