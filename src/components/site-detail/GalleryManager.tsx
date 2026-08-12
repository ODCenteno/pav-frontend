import React, { useState } from "react";
import GalleryLightbox from "./GalleryLightbox";

export interface GalleryImage {
  src: string;
  alt: string;
}

const GRID_MAX = 8;

interface GalleryManagerProps {
  images: GalleryImage[];
}

/**
 * Owns the gallery grid + lightbox state.
 *
 * The grid renders at most `GRID_MAX` (8) cells. When the backend supplies
 * more than that, the last grid cell gets a dark "+N" overlay (N = hidden
 * count) so visitors know there are extra photos. The lightbox always
 * receives the FULL image list, so opening any cell lets the user page
 * through every backend photo.
 *
 * This component renders the grid itself (rather than wrapping Astro slot
 * children) so the React tree is fully owned by React. The previous version
 * used `<GalleryManager client:load>{astro children}</GalleryManager>`, which
 * is an unsupported pattern: Astro serialises the children as HTML strings,
 * the React renderer can't reconcile them, and `useState` blows up during
 * hydration ("Invalid hook call").
 *
 * The Astro wrapper (`SiteGallery.astro`) is now reduced to building the
 * `images` prop and rendering the `<section>` shell.
 */
export default function GalleryManager({ images }: GalleryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const open = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  if (images.length === 0) return null;

  const gridImages = images.slice(0, GRID_MAX);
  const hiddenCount = Math.max(0, images.length - gridImages.length);
  const overflowIndex = gridImages.length - 1;
  const isOverflow = hiddenCount > 0;

  return (
    <>
      <div className="gallery-trigger-wrapper site-gallery__grid">
        {gridImages.map((img, index) => {
          const showOverlay = isOverflow && index === overflowIndex;
          return (
            <div
              key={img.src}
              className={`site-gallery__item${showOverlay ? " site-gallery__item--overflow" : ""}`}
              data-index={index}
              role="button"
              tabIndex={0}
              aria-label={showOverlay ? `+${hiddenCount}` : undefined}
              onClick={() => open(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(index);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
              {showOverlay && (
                <div className="site-gallery__overlay" aria-hidden="true">
                  +{hiddenCount}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <GalleryLightbox
        images={images.map((i) => i.src)}
        initialIndex={activeIndex}
        isOpen={isOpen}
        onClose={close}
      />
    </>
  );
}
