/**
 * Responsive sources for CMS images.
 *
 * Strapi already stores resized copies of every upload in `formats`
 * (thumbnail ~245w, small 500w, medium 750w, large 1000w). The view models
 * keep plain URL strings; transformers attach a `ResponsiveImageMap` keyed by
 * that URL so components can render `srcset`/`sizes` without changing every
 * string field. Images without formats (bundled fallbacks) keep their URL.
 */

export interface ResponsiveImage {
  /** Mid-size format, for clients that ignore `srcset`. */
  src: string;
  /** `url widthw` candidates, ascending, the original last. */
  srcset: string;
  /** Intrinsic size of the original (aspect ratio for CLS). */
  width?: number;
  height?: number;
}

/** Resolved original URL → its responsive sources. */
export type ResponsiveImageMap = Record<string, ResponsiveImage>;

interface MediaFormat {
  url?: string;
  width?: number;
  height?: number;
}

interface MediaLike extends MediaFormat {
  formats?: Record<string, MediaFormat> | null;
}

const identity = (url: string): string => url;

/** `src` preference: a mid-size copy first, the original last. */
const SRC_FORMAT_ORDER = ['medium', 'small', 'large'] as const;

function flatMedia(media: unknown): MediaLike | undefined {
  if (!media || typeof media !== 'object') return undefined;
  const m = media as Record<string, unknown>;
  if (typeof m.url === 'string') return m as MediaLike;
  const attributes = m.attributes as MediaLike | undefined;
  if (attributes && typeof attributes.url === 'string') return attributes;
  const data = m.data as Record<string, unknown> | null | undefined;
  if (data && typeof data === 'object') {
    const inner = (data.attributes ?? data) as MediaLike;
    return typeof inner.url === 'string' ? inner : undefined;
  }
  return undefined;
}

function hasSize(f: MediaFormat | undefined): f is Required<Pick<MediaFormat, 'url' | 'width'>> & MediaFormat {
  return Boolean(f?.url) && typeof f?.width === 'number' && f.width > 0;
}

/**
 * Build the responsive sources of a Strapi media (v5 flat or v4 wrapped).
 * Returns undefined when there are no usable formats.
 */
export function responsiveImageFromMedia(
  media: unknown,
  resolveUrl: typeof identity = identity,
): ResponsiveImage | undefined {
  const m = flatMedia(media);
  if (!m?.url || !m.formats) return undefined;

  const formats = m.formats;
  const sized = Object.values(formats).filter(hasSize);
  if (sized.length === 0) return undefined;

  const candidates = [...sized];
  if (hasSize(m)) candidates.push(m);
  candidates.sort((a, b) => a.width - b.width);

  const seen = new Set<number>();
  const srcset = candidates
    .filter((c) => (seen.has(c.width) ? false : (seen.add(c.width), true)))
    .map((c) => `${resolveUrl(c.url)} ${c.width}w`)
    .join(', ');

  const preferred = SRC_FORMAT_ORDER.map((key) => formats[key]).find(hasSize) ?? sized[0];
  const dimensions = typeof m.width === 'number' && typeof m.height === 'number' ? m : preferred;

  return {
    src: resolveUrl(preferred.url),
    srcset,
    width: dimensions.width,
    height: dimensions.height,
  };
}

export interface ImageAttrs {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

export interface ImageAttrsOptions {
  /**
   * Emit the intrinsic width/height (default). Leave them out where CSS
   * does not size the image box, e.g. a letterboxed lightbox.
   */
  dimensions?: boolean;
}

/**
 * `<img>` attributes for a view-model URL: its responsive sources when the
 * map knows it, the plain URL otherwise.
 */
export function imageAttrs(
  url: string,
  sources: ResponsiveImageMap | undefined,
  sizes: string,
  { dimensions = true }: ImageAttrsOptions = {},
): ImageAttrs {
  const r = sources?.[url];
  if (!r) return { src: url };
  const attrs: ImageAttrs = { src: r.src, srcset: r.srcset, sizes };
  if (dimensions) {
    attrs.width = r.width;
    attrs.height = r.height;
  }
  return attrs;
}

export interface ReactImageAttrs {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

/** `imageAttrs` with React's `srcSet` prop name, for the islands. */
export function reactImageAttrs(
  url: string,
  sources: ResponsiveImageMap | undefined,
  sizes: string,
  options?: ImageAttrsOptions,
): ReactImageAttrs {
  const { srcset, ...rest } = imageAttrs(url, sources, sizes, options);
  return srcset ? { ...rest, srcSet: srcset } : rest;
}
