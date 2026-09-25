import { useRef, useState } from "react";
import MemberModal, { type MemberVm, type MemberModalLabels } from "./MemberModal";
import GalleryLightbox from "./GalleryLightbox";
import { SOCIAL_CONFIG } from "@/utils/socialConfig";
import { socialUrl } from "@/utils/social";
import { contactLinkLabel, contactLinkTarget } from "../community-page/memberCard";
import { fillTemplate } from "../gallery/fillTemplate";
import { scrollBehavior } from "../gallery/motion";
import "./memberCards.css";

export interface MemberCardsLabels extends MemberModalLabels {
  openProfile: string;
  contact: string;
  /** Template with `{{name}}`. */
  photos: string;
  previousPhoto: string;
  nextPhoto: string;
  /** Template with `{{index}}` and `{{total}}`. */
  openPhoto: string;
}

interface MemberCardsProps {
  members: MemberVm[];
  labels: MemberCardsLabels;
}

interface OpenPhoto {
  member: number;
  photo: number;
}

/** Clicks on these never open the profile: they have their own action. */
const OWN_ACTION_SELECTOR = "a, button";

/**
 * Owns the member card grid, the profile modal and the photo lightbox.
 *
 * Each card shows the name, a short summary, an inline photo carousel and
 * the contact buttons (WhatsApp and phone first). Cards hold their own
 * links and buttons, so the card itself is not a button: the "View profile"
 * button is the keyboard / screen-reader trigger, and a click on any empty
 * part of the card opens the same modal for pointer users.
 *
 * On close, focus returns to the element that opened the layer.
 */
export default function MemberCards({ members, labels }: MemberCardsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openPhoto, setOpenPhoto] = useState<OpenPhoto | null>(null);
  const profileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const photoRefs = useRef(new Map<string, HTMLButtonElement>());

  if (members.length === 0) return null;

  const close = () => {
    const closed = openIndex;
    setOpenIndex(null);
    // The modal unmounts and focus would fall to <body>; return it to the
    // trigger so keyboard users never lose their place in the grid.
    if (closed !== null) {
      requestAnimationFrame(() => profileRefs.current[closed]?.focus());
    }
  };

  const closePhoto = () => {
    const closed = openPhoto;
    setOpenPhoto(null);
    if (closed) {
      requestAnimationFrame(() => photoRefs.current.get(`${closed.member}-${closed.photo}`)?.focus());
    }
  };

  return (
    <>
      <div className="member-strip__grid">
        {members.map((member, index) => (
          <article
            key={member.id}
            className="member-strip__card member-strip__card--clickable"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest(OWN_ACTION_SELECTOR)) return;
              setOpenIndex(index);
            }}
          >
            <div className="member-strip__header">
              {member.photo ? (
                <img
                  className="member-strip__photo"
                  src={member.photo}
                  alt={member.name}
                  loading="lazy"
                />
              ) : (
                <div className="member-strip__photo member-strip__photo--placeholder" aria-hidden="true">
                  {member.name.charAt(0)}
                </div>
              )}
              <div className="member-strip__identity">
                <h3 className="member-strip__name">{member.name}</h3>
                {member.role && <p className="member-strip__role">{member.role}</p>}
              </div>
            </div>

            {member.summary && <p className="member-strip__summary">{member.summary}</p>}

            {member.galleryUrls.length > 0 && (
              <PhotoCarousel
                member={member}
                labels={labels}
                registerPhoto={(photo, el) => {
                  const key = `${index}-${photo}`;
                  if (el) photoRefs.current.set(key, el);
                  else photoRefs.current.delete(key);
                }}
                onOpen={(photo) => setOpenPhoto({ member: index, photo })}
              />
            )}

            {member.social.length > 0 && (
              <div className="social-links member-strip__contact">
                <span className="social-links__title">{labels.contact}</span>
                <div className="social-links__icons">
                  {member.social.map((link) => {
                    const icon = SOCIAL_CONFIG[link.platform]?.icon;
                    const href = socialUrl(link);
                    return (
                      <a
                        key={`${link.platform}-${href}`}
                        className={`social-links__link social-link-${link.platform}`}
                        href={href}
                        target={contactLinkTarget(link)}
                        rel="noopener noreferrer"
                        aria-label={`${contactLinkLabel(link, labels)}: ${member.name}`}
                      >
                        {icon ? (
                          <svg viewBox="0 0 24 24" width="20" height="20" className="social-links__icon-svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
                        ) : (
                          <span className="social-links__text">{link.handle || link.platform}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {member.legacyNote && (
              <span className="member-strip__legacy">{member.legacyNote}</span>
            )}

            <button
              type="button"
              className="member-strip__open"
              aria-label={`${labels.openProfile}: ${member.name}`}
              ref={(el) => {
                profileRefs.current[index] = el;
              }}
              onClick={() => setOpenIndex(index)}
            >
              {labels.openProfile}
            </button>
          </article>
        ))}
      </div>

      {openIndex !== null && (
        <MemberModal member={members[openIndex]} labels={labels} onClose={close} />
      )}

      {openPhoto && (
        <GalleryLightbox
          images={members[openPhoto.member].galleryUrls}
          initialIndex={openPhoto.photo}
          isOpen
          onClose={closePhoto}
        />
      )}
    </>
  );
}

interface PhotoCarouselProps {
  member: MemberVm;
  labels: MemberCardsLabels;
  registerPhoto: (photo: number, el: HTMLButtonElement | null) => void;
  onOpen: (photo: number) => void;
}

/** Compact one-row scroll-snap carousel of a member's gallery. */
function PhotoCarousel({ member, labels, registerPhoto, onOpen }: PhotoCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const total = member.galleryUrls.length;

  const scrollByItem = (direction: 1 | -1) => {
    const track = trackRef.current;
    const item = track?.firstElementChild as HTMLElement | null;
    if (!track || !item) return;
    track.scrollBy({ left: direction * item.offsetWidth, behavior: scrollBehavior() });
  };

  return (
    <div
      className="member-strip__photos"
      role="group"
      aria-label={fillTemplate(labels.photos, { name: member.name })}
    >
      <ul className="member-strip__photos-track" ref={trackRef}>
        {member.galleryUrls.map((src, photo) => (
          <li className="member-strip__photos-item" key={`${src}-${photo}`}>
            <button
              type="button"
              className="member-strip__photos-open"
              aria-label={fillTemplate(labels.openPhoto, { index: photo + 1, total })}
              ref={(el) => registerPhoto(photo, el)}
              onClick={() => onOpen(photo)}
            >
              <img
                src={src}
                alt={`${member.name} — ${labels.gallery} ${photo + 1}`}
                loading="lazy"
                decoding="async"
              />
            </button>
          </li>
        ))}
      </ul>
      {total > 1 && (
        <>
          <button
            type="button"
            className="member-strip__photos-nav member-strip__photos-nav--prev"
            aria-label={labels.previousPhoto}
            onClick={() => scrollByItem(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            className="member-strip__photos-nav member-strip__photos-nav--next"
            aria-label={labels.nextPhoto}
            onClick={() => scrollByItem(1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}
    </div>
  );
}
