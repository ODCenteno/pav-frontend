import { useCallback, useEffect, useRef, useState } from "react";
import GalleryLightbox from "../site-detail/GalleryLightbox";
import { fillTemplate } from "./fillTemplate";
import { scrollBehavior } from "./motion";
import { feedIndex } from "./feedPosition";
import "./communityGallery.css";

export interface CommunityGalleryLabels {
  title: string;
  previous: string;
  next: string;
  /** Template with `{{index}}` and `{{total}}`. */
  openPhoto: string;
  /** Template with `{{name}}`, `{{index}}` and `{{total}}`. */
  photoAlt: string;
  /** Template with `{{index}}` and `{{total}}`, read by screen readers. */
  position: string;
  /** Link that jumps past the gallery to the rest of the page. */
  continue: string;
}

interface CommunityGalleryProps {
  /** Absolute photo URLs (`Community.gallery`). */
  photos: string[];
  communityName: string;
  labels: CommunityGalleryLabels;
}

/**
 * Community photo gallery (F6).
 *
 * Desktop: one horizontal scroll-snap row with prev/next buttons.
 * Mobile (<= 768px): a vertical scroll-snap feed, shorter than the viewport
 * and with scroll chaining, so the page always continues past it. A
 * position indicator (3 / 8) and a "continue" link go with it. The layout
 * switch is pure CSS, so the markup is the same at every width.
 *
 * Each photo is a button that opens the shared `GalleryLightbox` at that
 * index; focus returns to the photo when the lightbox closes.
 */
export default function CommunityGallery({ photos, communityName, labels }: CommunityGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(photos.length <= 1);
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);
  const photoRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // 1px tolerance: subpixel scroll positions never reach the exact edge.
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);

    // Vertical feed on mobile, horizontal row on desktop.
    const first = track.firstElementChild as HTMLElement | null;
    const vertical = track.scrollHeight > track.clientHeight + 1;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const page = vertical ? (first?.offsetHeight ?? 0) : (first?.offsetWidth ?? 0) + gap;
    setCurrent(feedIndex(vertical ? track.scrollTop : track.scrollLeft, page, track.childElementCount));
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
      behavior: scrollBehavior(),
    });
  };

  return (
    <section className="community-gallery" aria-labelledby="community-gallery-title">
      <div className="community-gallery__inner container">
        <header className="community-gallery__header">
          <h2 id="community-gallery-title" className="community-gallery__title">
            {labels.title}
          </h2>
          <a className="community-gallery__continue" href="#community-gallery-end">
            {labels.continue}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </a>
          <div className="community-gallery__controls">
            <button type="button" className="community-gallery__nav" aria-label={labels.previous} disabled={atStart} onClick={() => scrollByPage(-1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button type="button" className="community-gallery__nav" aria-label={labels.next} disabled={atEnd} onClick={() => scrollByPage(1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </header>
      </div>

      <div className="community-gallery__viewport">
        <p className="community-gallery__position" aria-live="polite">
          <span aria-hidden="true">{`${current + 1} / ${total}`}</span>
          <span className="sr-only">{fillTemplate(labels.position, { index: current + 1, total })}</span>
        </p>
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
                  <img src={src} alt={fillTemplate(labels.photoAlt, values)} loading="lazy" decoding="async" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div id="community-gallery-end" className="community-gallery__end" tabIndex={-1} />

      {openIndex !== null && <GalleryLightbox images={photos} initialIndex={openIndex} isOpen onClose={closeLightbox} />}
    </section>
  );
}
