import React, { useEffect, useMemo, useState } from "react";
import "./sitesExplorer.css";

interface Category {
  id: string;
  label: string;
}

interface SitesExplorerProps {
  locale: string;
  categories: Category[];
  translations: {
    noResults: string;
    all: string;
    searchPlaceholder: string;
  };
}

export default function SitesExplorer({ locale, categories, translations }: SitesExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isEnglish = useMemo(() => String(locale).toLowerCase().startsWith("en"), [locale]);

  useEffect(() => {
    // 1. Filter items
    const items = Array.from(document.querySelectorAll<HTMLElement>(".carousel-item"));
    
    items.forEach(item => {
      const cardContainer = item.querySelector<HTMLElement>(".listing-card-container");
      if (!cardContainer) return;

      const category = cardContainer.getAttribute("data-category") || "";
      const name = cardContainer.getAttribute("data-name") || "";
      const description = cardContainer.getAttribute("data-description") || "";
      
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesSearch = searchQuery === "" || 
                            name.includes(searchQuery.toLowerCase()) || 
                            description.includes(searchQuery.toLowerCase());

      const shouldShow = matchesCategory && matchesSearch;
      item.style.display = shouldShow ? "" : "none";
    });

    // 2. Hide/Show category sections based on visible items
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".category-section"));
    sections.forEach(section => {
      const visibleItems = section.querySelectorAll<HTMLElement>(".carousel-item:not([style*='display: none'])");
      section.style.display = visibleItems.length > 0 ? "" : "none";
    });

    // 3. Global empty state (if all sections are hidden)
    const explorerContainer = document.querySelector(".sites-explorer .container");
    const emptyId = "global-empty-state";
    let emptyEl = document.getElementById(emptyId);

    const anySectionVisible = sections.some(s => s.style.display !== "none");

    if (!anySectionVisible) {
      if (!emptyEl && explorerContainer) {
        emptyEl = document.createElement("p");
        emptyEl.id = emptyId;
        emptyEl.className = "empty-state-message";
        emptyEl.style.textAlign = "center";
        emptyEl.style.padding = "3rem 0";
        emptyEl.style.color = "var(--secondary-text)";
        explorerContainer.appendChild(emptyEl);
      }
      if (emptyEl) {
        emptyEl.textContent = translations.noResults;
        emptyEl.style.display = "";
      }
    } else if (emptyEl) {
      emptyEl.style.display = "none";
    }

  }, [activeCategory, searchQuery, translations.noResults]);

  return (
    <div className="explorer-controls">
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder={translations.searchPlaceholder} 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="filter-container">
        <div className="filter-chips" role="tablist">
          <button 
            type="button" 
            className={`chip ${activeCategory === "all" ? "active" : ""}`} 
            onClick={() => setActiveCategory("all")}
          >
            {translations.all}
          </button>
          {categories.map((c) => (
            <button 
              key={c.id} 
              type="button" 
              className={`chip ${activeCategory === c.id ? "active" : ""}`} 
              onClick={() => setActiveCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
