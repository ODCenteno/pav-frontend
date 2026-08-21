import React, { useRef, useState } from "react";
import MemberModal, { type MemberVm, type MemberModalLabels } from "./MemberModal";

export interface MemberCardsLabels extends MemberModalLabels {
  openProfile: string;
}

interface MemberCardsProps {
  members: MemberVm[];
  labels: MemberCardsLabels;
}

/**
 * Owns the member card grid and the profile-modal state.
 *
 * Follows the GalleryManager island pattern: React renders the cards itself
 * (no Astro slot children — those break island hydration), keeping the
 * exact markup/styles the static MemberStrip used (`.member-strip__*`
 * classes, loaded globally by the MemberStrip shell).
 *
 * Cards are triggers: click / tap / Enter / Space open the modal. On close,
 * focus returns to the trigger card so keyboard users never lose their
 * place in the grid.
 */
export default function MemberCards({ members, labels }: MemberCardsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  if (members.length === 0) return null;

  const open = (index: number) => setOpenIndex(index);

  const close = () => {
    const closed = openIndex;
    setOpenIndex(null);
    // The modal unmounts and focus would fall to <body>; return it to the
    // card that opened the modal.
    if (closed !== null) {
      requestAnimationFrame(() => cardRefs.current[closed]?.focus());
    }
  };

  return (
    <>
      <div className="member-strip__grid">
        {members.map((member, index) => (
          <article
            key={member.id}
            className="member-strip__card member-strip__card--clickable"
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            role="button"
            tabIndex={0}
            aria-label={`${labels.openProfile}: ${member.name}`}
            onClick={() => open(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(index);
              }
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
                <div className="member-strip__photo member-strip__photo--placeholder">
                  {member.name.charAt(0)}
                </div>
              )}
              <div className="member-strip__identity">
                <h3 className="member-strip__name">{member.name}</h3>
                {member.role && <p className="member-strip__role">{member.role}</p>}
              </div>
            </div>
            {member.pullQuote && (
              <blockquote className="member-strip__quote">{member.pullQuote}</blockquote>
            )}
            {member.bioHtml && (
              <div
                className="member-strip__bio prose"
                dangerouslySetInnerHTML={{ __html: member.bioHtml }}
              />
            )}
            {member.legacyNote && (
              <span className="member-strip__legacy">{member.legacyNote}</span>
            )}
          </article>
        ))}
      </div>

      {openIndex !== null && (
        <MemberModal member={members[openIndex]} labels={labels} onClose={close} />
      )}
    </>
  );
}
