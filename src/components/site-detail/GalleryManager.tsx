import React, { useState } from "react";
import GalleryLightbox from "./GalleryLightbox";

interface GalleryManagerProps {
  images: string[];
  children: React.ReactNode;
}

export default function GalleryManager({ images, children }: GalleryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div 
        className="gallery-trigger-wrapper" 
        onClick={(e) => {
          const item = (e.target as HTMLElement).closest('[data-index]');
          if (item) {
            const index = parseInt(item.getAttribute('data-index') || '0');
            openLightbox(index);
          }
        }}
      >
        {children}
      </div>

      <GalleryLightbox 
        images={images} 
        initialIndex={activeIndex} 
        isOpen={isOpen} 
        onClose={closeLightbox} 
      />
    </>
  );
}
