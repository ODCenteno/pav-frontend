import React, { useState } from "react";
import GalleryLightbox from "./GalleryLightbox";

export interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryManagerProps {
  images: GalleryImage[];
}

/**
 * Owns the gallery grid + lightbox state.
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

  return (
    <>
      <div className="gallery-trigger-wrapper site-gallery__grid">
        {images.map((img, index) => (
          <div
            key={img.src}
            className="site-gallery__item"
            data-index={index}
            role="button"
            tabIndex={0}
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
          </div>
        ))}
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
