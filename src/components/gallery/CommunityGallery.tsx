import { useCallback, useEffect, useRef, useState } from "react";
import GalleryLightbox from "../site-detail/GalleryLightbox";
import { fillTemplate } from "./fillTemplate";
import "./communityGallery.css";

export interface CommunityGalleryLabels {
  title: string;
  previous: string;
  next: string;
  /** Template with `{{index}}` and `{{total}}`. */
  openPhoto: string;
  /** Template with `{{name}}`, `{{index}}` and `{{total}}`. */
  photoAlt: string;
}

interface CommunityGalleryProps {
  /** Absolute photo URLs (`Community.gallery`). */
  photos: string[];
  communityName: string;
  labels: CommunityGalleryLabels;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Community photo gallery (F6).
 *
 * Desktop: one horizontal scroll-snap row with prev/next buttons.
 * Mobile (<= 768px): a vertical, full-viewport scroll-snap feed; the layout
 * switch is pure CSS, so the markup is the same at every width.
 *
 * Each photo is a button that opens the shared `GalleryLightbox` at that
 * index; focus returns to the photo when the lightbox closes.
 */
export default function CommunityGallery({ photos, communityName, labels }: CommunityGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(photos.length <= 1);
  const trackRef = useRef<HTMLUListElement>(null);
  const photoRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // 1px tolerance: subpixel scroll positions never reach the exact edge.
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const closeLightbox = useCallback(() => {
    setOpenIndex((closed) => {
      if (closed !== null) {
        requestAnimationFrame(() => photoRefs.current[closed]?.focus());
      }
      return null;
    });
  }, []);

  if (photos.length === 0) return null;

  const total = photos.length;

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <section className="community-gallery" aria-labelledby="community-gallery-title">
      <div className="community-gallery__inner container">
        <header className="community-gallery__header">
          <h2 id="community-gallery-title" className="community-gallery__title">
            {labels.title}
          </h2>
          <div className="community-gallery__controls">
            <button
              type="button"
              className="community-gallery__nav"
              aria-label={labels.previous}
              disabled={atStart}
              onClick={() => scrollByPage(-1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              type="button"
              className="community-gallery__nav"
              aria-label={labels.next}
              disabled={atEnd}
              onClick={() => scrollByPage(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </header>
      </div>

      <ul className="community-gallery__track" ref={trackRef} onScroll={updateEdges}>
        {photos.map((src, index) => {
          const values = { name: communityName, index: index + 1, total };
          return (
            <li className="community-gallery__item" key={`${src}-${index}`}>
              <button
                type="button"
                className="community-gallery__photo"
                aria-label={fillTemplate(labels.openPhoto, values)}
                ref={(el) => {
                  photoRefs.current[index] = el;
                }}
                onClick={() => setOpenIndex(index)}
              >
                <img
                  src={src}
                  alt={fillTemplate(labels.photoAlt, values)}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {openIndex !== null && (
        <GalleryLightbox images={photos} initialIndex={openIndex} isOpen onClose={closeLightbox} />
      )}
    </section>
  );
}
