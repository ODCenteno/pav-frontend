import React, { useEffect, useMemo, useState } from "react";

interface CategoryFilterProps {
  /** Locale completo: "es-MX" | "en-US" (u otros en el futuro) */
  locale: string;

  /** Categorías dinámicas desde SSR (id = categoryId, label ya traducido si aplica) */
  categories: Array<{ id: string; label: string }>;

  /** Textos UI ya traducidos desde Astro (SSR) */
  translations: {
    noResults: string;
    all: string;
  };

  /**
   * Selector CSS del contenedor donde Astro renderiza las cards.
   * Debe contener elementos con atributo: data-category="<categoryId>"
   */
  containerSelector?: string;

  /** Selector CSS de cada card/listing dentro del contenedor. Default: '[data-category]' */
  itemSelector?: string;

  /** Categoría inicial (default: "all") */
  initialCategory?: string;
}

/**
 * SSR-first real:
 * - React NO renderiza cards
 * - Solo filtra mostrando/ocultando elementos SSR por data-category
 */
export default function CategoryFilter({ locale, categories, translations, containerSelector = "#category-carousel-container", itemSelector = "[data-category]", initialCategory = "all" }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  const isEnglish = useMemo(() => String(locale).toLowerCase().startsWith("en"), [locale]);

  // Asegura que si la categoría inicial no existe, caiga a "all"
  useEffect(() => {
    if (activeCategory === "all") return;
    const exists = categories.some((c) => c.id === activeCategory);
    if (!exists) setActiveCategory("all");
    // solo cuando cambia categories (SSR puede actualizar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;

    // Scroll to start when category changes
    container.scrollTo({ left: 0, behavior: "smooth" });

    const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
    if (items.length === 0) return;

    let visibleCount = 0;

    for (const el of items) {
      const cat = el.getAttribute("data-category") || "";
      const shouldShow = activeCategory === "all" || cat === activeCategory;

      el.style.display = shouldShow ? "" : "none";
      if (shouldShow) visibleCount++;
    }

    // Empty state dentro del contenedor SSR (sin duplicar DOM)
    const emptyId = "category-empty-state";
    let emptyEl = container.querySelector<HTMLElement>(`#${emptyId}`);

    if (visibleCount === 0) {
      if (!emptyEl) {
        emptyEl = document.createElement("p");
        emptyEl.id = emptyId;
        // Styles handled in CSS
        container.appendChild(emptyEl);
      }
      emptyEl.textContent = translations.noResults;
      emptyEl.style.display = "";
    } else if (emptyEl) {
      emptyEl.style.display = "none";
    }
  }, [activeCategory, containerSelector, itemSelector, translations.noResults]);

  return (
    <>
      <div className="filter-chips" role="tablist" aria-label={isEnglish ? "Filter by category" : "Filtrar por categoría"}>
        {/* All */}
        <button type="button" className={`chip ${activeCategory === "all" ? "active" : ""}`} onClick={() => setActiveCategory("all")} aria-pressed={activeCategory === "all"}>
          {translations.all}
        </button>

        {/* Dinámicas */}
        {categories.map((c) => (
          <button key={c.id} type="button" className={`chip ${activeCategory === c.id ? "active" : ""}`} onClick={() => setActiveCategory(c.id)} aria-pressed={activeCategory === c.id}>
            {c.label}
          </button>
        ))}
      </div>
    </>
  );
}
