import React, { useEffect, useRef, useState } from "react";
import GalleryLightbox from "./GalleryLightbox";
import { SOCIAL_CONFIG } from "@/utils/socialConfig";
import { socialUrl } from "@/utils/social";
import type { SocialLink } from "@/types/common.type";
import { contactLinkLabel, contactLinkTarget } from "../community-page/memberCard";
import "./memberModal.css";

/** View-model member: bio pre-rendered to HTML at build time by the shell. */
export interface MemberVm {
  id: string;
  name: string;
  role?: string;
  locality?: string;
  pullQuote?: string;
  /** Card text: `shortDescription` or a truncated plain-text bio. */
  summary?: string;
  bioHtml?: string;
  legacyNote?: string;
  photo?: string;
  galleryUrls: string[];
  social: SocialLink[];
}

export interface MemberModalLabels {
  close: string;
  gallery: string;
  call: string;
  email: string;
  locality: Record<string, string>;
}

/** Max cells shown in the modal gallery grid; extras surface as a "+N" cell. */
const GALLERY_MAX = 6;

interface MemberModalProps {
  member: MemberVm;
  labels: MemberModalLabels;
  onClose: () => void;
}

/**
 * Community member profile modal.
 *
 * Close contract (mirrors GalleryLightbox so both layers behave alike):
 *  - ESC key, X button, click on the overlay, or the browser back button.
 *  - History: pushes one entry on open; `popstate` closes the modal.
 *  - LIFO guard: the gallery lightbox opens ON TOP of this dialog (higher
 *    z-index, its own history entry). While it is open, ESC and `popstate`
 *    belong to the lightbox — this modal ignores both via `lightboxRef`,
 *    so one back press closes exactly one layer.
 *  - Focus trap inside the dialog; focus moves to the X on open and back to
 *    the clicked gallery cell when the lightbox closes (the card trigger
 *    restore is owned by MemberCards).
 *  - Body scroll is locked while the modal is open.
 */
export default function MemberModal({ member, labels, onClose }: MemberModalProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Popstate/ESC handlers must always see the CURRENT lightbox state without
  // re-registering, so keep a ref in sync with the state.
  const lightboxIndexRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const galleryTriggerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const openLightbox = (index: number) => {
    lightboxIndexRef.current = index;
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    const closed = lightboxIndexRef.current;
    lightboxIndexRef.current = null;
    setLightboxIndex(null);
    // The lightbox DOM unmounts, dropping focus to <body> — return it to the
    // gallery cell that opened it so keyboard users stay inside the modal.
    if (closed !== null) {
      requestAnimationFrame(() => galleryTriggerRefs.current[closed]?.focus());
    }
  };

  // History entry + back-button close (LIFO with the stacked lightbox).
  useEffect(() => {
    window.history.pushState({ memberModal: true }, "");
    closeButtonRef.current?.focus();
    const handlePopState = () => {
      if (lightboxIndexRef.current !== null) return; // back belongs to the lightbox
      onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onClose]);

  // Lock body scroll while the modal layer is open (the stacked lightbox
  // keeps this lock — it renders above, not instead).
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // ESC + focus trap. Skipped entirely while the lightbox layer is open:
  // its own handlers own the keyboard then (closing both at once would break
  // the one-layer-per-back-press contract).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndexRef.current !== null) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const gallery = member.galleryUrls.slice(0, GALLERY_MAX);
  const hiddenCount = Math.max(0, member.galleryUrls.length - gallery.length);
  const overflowIndex = gallery.length - 1;
  const isOverflow = hiddenCount > 0;
  const localityLabel = member.locality ? labels.locality[member.locality] : undefined;
  const titleId = `member-modal-title-${member.id}`;

  return (
    <>
      <div className="member-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="member-modal__overlay" onClick={onClose} aria-hidden="true" />

        <div className="member-modal__dialog" ref={modalRef}>
          <button
            type="button"
            className="member-modal__close"
            onClick={onClose}
            aria-label={labels.close}
            ref={closeButtonRef}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <header className="member-modal__header">
            {member.photo ? (
              <img
                className="member-strip__photo"
                src={member.photo}
                alt={member.name}
              />
            ) : (
              <div className="member-strip__photo member-strip__photo--placeholder">
                {member.name.charAt(0)}
              </div>
            )}
            <div className="member-modal__identity">
              <h3 id={titleId} className="member-strip__name">
                {member.name}
              </h3>
              {member.role && <p className="member-strip__role">{member.role}</p>}
              {localityLabel && (
                <span className="member-modal__locality">{localityLabel}</span>
              )}
            </div>
          </header>

          {member.pullQuote && (
            <blockquote className="member-strip__quote member-modal__section">
              {member.pullQuote}
            </blockquote>
          )}

          {member.bioHtml && (
            <div
              className="member-modal__bio prose member-modal__section"
              dangerouslySetInnerHTML={{ __html: member.bioHtml }}
            />
          )}

          {member.legacyNote && (
            <span className="member-strip__legacy member-modal__section">
              {member.legacyNote}
            </span>
          )}

          {member.social.length > 0 && (
            <div className="member-modal__social member-modal__section">
              {member.social.map((link) => {
                const icon = SOCIAL_CONFIG[link.platform]?.icon;
                const href = socialUrl(link);
                return (
                  <a
                    key={`${link.platform}-${href}`}
                    className="member-modal__social-link"
                    href={href}
                    target={contactLinkTarget(link)}
                    rel="noopener noreferrer"
                    aria-label={contactLinkLabel(link, labels)}
                  >
                    {icon ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
                    ) : (
                      <span className="member-modal__social-fallback">
                        {link.handle || link.platform}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          )}

          {member.galleryUrls.length > 0 && (
            <section className="member-modal__section" aria-label={labels.gallery}>
              <h4 className="member-modal__gallery-title">{labels.gallery}</h4>
              <div className="member-modal__gallery-grid">
                {gallery.map((src, index) => {
                  const showOverlay = isOverflow && index === overflowIndex;
                  return (
                    <div
                      key={src}
                      className="member-modal__gallery-item"
                      ref={(el) => {
                        galleryTriggerRefs.current[index] = el;
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={
                        showOverlay ? `+${hiddenCount}` : `${labels.gallery} ${index + 1}`
                      }
                      onClick={() => openLightbox(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openLightbox(index);
                        }
                      }}
                    >
                      <img
                        src={src}
                        alt={`${member.name} — ${labels.gallery} ${index + 1}`}
                        loading="lazy"
                      />
                      {showOverlay && (
                        <div className="member-modal__gallery-overlay" aria-hidden="true">
                          +{hiddenCount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Rendered as a SIBLING of the dialog (not inside modalRef) so the
          modal focus trap never traps the lightbox's own controls. Stacks
          above via its own z-index (2000 > 1500). */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={member.galleryUrls}
          initialIndex={lightboxIndex}
          isOpen
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
