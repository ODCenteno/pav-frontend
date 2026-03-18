import React, { useState, useEffect } from "react";
import { isFavorite, toggleFavorite } from "../../utils/favorites";

interface FavoriteButtonProps {
  id: string;
  labelSave: string;
  labelSaved: string;
}

export default function FavoriteButton({ id, labelSave, labelSaved }: FavoriteButtonProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isFavorite(id));
  }, [id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isAdded = toggleFavorite(id);
    setIsSaved(isAdded);
  };

  return (
    <button
      className={`site-hero__action-btn ${isSaved ? "is-favorite" : ""}`}
      onClick={handleToggle}
      aria-label={isSaved ? labelSaved : labelSave}
      title={isSaved ? labelSaved : labelSave}
    >
      {isSaved ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M14 2a5 5 0 0 1 5 5v14a1 1 0 0 1 -1.555 .832l-5.445 -3.63l-5.444 3.63a1 1 0 0 1 -1.55 -.72l-.006 -.112v-14a5 5 0 0 1 5 -5h4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z" />
        </svg>
      )}
    </button>
  );
}
