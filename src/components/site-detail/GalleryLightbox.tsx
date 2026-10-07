import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { reactImageAttrs, type ResponsiveImageMap } from "@/utils/responsiveImage";
import "./galleryLightbox.css";

interface GalleryLightboxProps {
  images: string[];
  /** Strapi formats of the images, keyed by URL. */
  imageSources?: ResponsiveImageMap;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryLightbox({ images, imageSources, initialIndex, isOpen, onClose }: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ lightbox: true }, "");
      closeButtonRef.current?.focus();
      const handlePopState = () => onClose();
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isOpen, onClose]);

  // Lock body scroll while open so the lightbox is truly fullscreen (no
  // scrollbar strip with the page behind). Nesting-safe: when stacked on the
  // member modal, this saves the modal's "hidden" and restores it on close.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !lightboxRef.current) return;

      const focusableElements = lightboxRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleFocusTrap);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleFocusTrap);
    };
  }, [isOpen, currentIndex]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  if (!isOpen) return null;

  // Portal to <body>: position:fixed resolves against the nearest ancestor
  // with a transform/filter/backdrop-filter/will-change (containing block).
  // Host pages often wrap this island inside such cards (e.g. glassmorphism
  // with backdrop-filter), which would shrink the "fullscreen" lightbox to
  // the card's box. Rendering at <body> level guarantees true fullscreen.
  // Safe for SSR: every caller starts with isOpen=false, so this only
  // renders client-side after user interaction.
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image gallery" ref={lightboxRef}>
      <div className="lightbox__overlay" onClick={onClose} aria-hidden="true"></div>

      <button className="lightbox__close" onClick={onClose} aria-label="Close gallery" ref={closeButtonRef}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div
        className="lightbox__content"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => {
          // Click-outside-to-close: .lightbox__content spans the whole
          // viewport ABOVE the overlay (z-index), so the overlay's own
          // onClick is unreachable. Close only when the click lands on the
          // content layer itself (empty space) — clicks on the image,
          // arrows, or counter target their own elements and never match.
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <button className="lightbox__nav prev" onClick={prevImage} aria-label="Previous image">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div className="lightbox__image-wrapper" role="document" aria-label="Gallery image viewer">
          <img {...reactImageAttrs(images[currentIndex], imageSources, "100vw", { dimensions: false })} alt={`Gallery image ${currentIndex + 1} of ${images.length}`} className="lightbox__image" />
          <div className="lightbox__counter" aria-live="polite" aria-atomic="true">
            {currentIndex + 1} of {images.length}
          </div>
        </div>

        <button className="lightbox__nav next" onClick={nextImage} aria-label="Next image">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
