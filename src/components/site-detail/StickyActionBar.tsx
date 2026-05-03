import React, { useState, useEffect } from "react";
import { isFavorite, toggleFavorite } from "../../utils/favorites";
import "./stickyActionBar.css";

interface StickyActionBarProps {
  id: string;
  whatsapp?: string;
  labels: {
    directions: string;
    contact: string;
    favorite: string;
    favoriteActive: string;
  };
}

export default function StickyActionBar({ id, whatsapp, labels, lat, lng }: StickyActionBarProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isFavorite(id));
  }, [id]);

  const handleToggleFavorite = () => {
    const isAdded = toggleFavorite(id);
    setIsSaved(isAdded);
  };

  return (
    <div className="sticky-action-bar">
      <div className="sticky-action-bar__container">
        <a className="sticky-action-bar__btn secondary" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>{labels.directions}</span>
        </a>
        
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp}`} className="sticky-action-bar__btn primary" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            <span>{labels.contact}</span>
          </a>
        )}

        <button className={`sticky-action-bar__btn ${isSaved ? "active" : ""}`} onClick={handleToggleFavorite}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          <span>{isSaved ? labels.favoriteActive : labels.favorite}</span>
        </button>
      </div>
    </div>
  );
}
