import React, { useState } from "react";
import GalleryLightbox from "../site-detail/GalleryLightbox";
import "./expandableImage.css";

interface ExpandableImageProps {
  /** Class for the interactive wrapper — reuse the section's existing class
   *  (e.g. `guide-directions__map`, `guide-tourist-map__image-wrap`) so the
   *  original layout CSS keeps applying to it. */
  className?: string;
  /** Class for the <img> itself (e.g. `guide-tourist-map__image`). */
  imgClassName?: string;
  src: string;
  alt: string;
  /** Localized aria-label for the expand trigger, resolved at build time. */
  expandLabel: string;
}

/**
 * Fullscreen-expandable image for the guide maps.
 *
 * Follows the GalleryManager island pattern: React renders the image itself
 * (no Astro slot children) and owns the lightbox state. Click / tap / Enter /
 * Space opens the existing `GalleryLightbox` in fullscreen — which already
 * implements the full close contract (ESC, X button, overlay click, browser
 * back via pushState/popstate, focus trap, swipe on touch, and image counter)
 * plus `object-fit: contain`, so a map is always shown whole.
 *
 * With a single image the lightbox's prev/next arrows simply re-select index
 * 0; the counter reads "1 / 1". This keeps one consistent viewer across the
 * whole site (site gallery, member modal, guide maps).
 */
export default function ExpandableImage({
  className,
  imgClassName,
  src,
  alt,
  expandLabel,
}: ExpandableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <>
      <div
        className={`expandable-image${className ? ` ${className}` : ""}`}
        role="button"
        tabIndex={0}
        aria-label={expandLabel}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
      >
        <img src={src} alt={alt} loading="lazy" className={imgClassName} />
        <span className="expandable-image__hint" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </span>
      </div>

      <GalleryLightbox images={[src]} initialIndex={0} isOpen={isOpen} onClose={close} />
    </>
  );
}
