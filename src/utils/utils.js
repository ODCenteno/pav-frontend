import { translations } from "../i18n/translations.js";

export const initConfig = () => {
  const langToggleBtn = document.getElementById("lang-toggle");
  let currentLang = "es";

  // Initial load
  updateLanguage(currentLang);
  renderCards("all");
  langToggleBtn.textContent = currentLang === "en" ? "ES" : "EN";

  // Language Toggle
  langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "es" : "en";
    updateLanguage(currentLang);
    langToggleBtn.textContent = currentLang === "en" ? "ES" : "EN";

    // Re-render cards to update language
    const activeChip = document.querySelector(".chip.active");
    const activeCategory = activeChip ? activeChip.getAttribute("data-category") : "all";
    renderCards(activeCategory);
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mainNav = document.querySelector(".main-nav");

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenuBtn.classList.toggle("active");
      mainNav.classList.toggle("active");
    });

    // Close menu when clicking a link
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuBtn.classList.remove("active");
        mainNav.classList.remove("active");
      });
    });
  }

  function updateLanguage(lang) {
    document.querySelectorAll("[data-key]").forEach((element) => {
      const key = element.getAttribute("data-key");
      if (translations[lang][key]) {
        if (element.tagName === "INPUT" && element.getAttribute("placeholder")) {
          element.placeholder = translations[lang][key];
        } else {
          element.innerHTML = translations[lang][key];
        }
      }
    });
  }
};
