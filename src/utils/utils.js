export const initConfig = () => {
  const langToggleBtn = document.getElementById("lang-toggle");
  let currentLang = "es";

  // Mock Data for Cards
  const categoryData = [
    {
      id: 1,
      category: "experiences",
      title: { es: "Tour en Lancha", en: "Boat Tour" },
      desc: {
        es: "Explora las islas cercanas y disfruta de la vida marina.",
        en: "Explore nearby islands and enjoy marine life.",
      },
      image: "imagenes-mocks/pav-06.png",
      price: "$$",
      tag: { es: "Aventura", en: "Adventure" },
    },
    {
      id: 2,
      category: "accommodation",
      title: { es: "Cabañas frente al mar", en: "Beachfront Cabins" },
      desc: {
        es: "Despierta con el sonido de las olas en nuestras cómodas cabañas.",
        en: "Wake up to the sound of waves in our comfortable cabins.",
      },
      image: "imagenes-mocks/pav-07.jpg",
      price: "$$$",
      tag: { es: "Hospedaje", en: "Lodging" },
    },
    {
      id: 3,
      category: "restaurants",
      title: { es: "Mariscos El Puerto", en: "El Puerto Seafood" },
      desc: {
        es: "Los mariscos más frescos de la región, del mar a tu mesa.",
        en: "The freshest seafood in the region, from sea to table.",
      },
      image: "imagenes-mocks/pav-08.jpg",
      price: "$$",
      tag: { es: "Gastronomía", en: "Gastronomy" },
    },
    {
      id: 4,
      category: "sites",
      title: { es: "Playa Escondida", en: "Hidden Beach" },
      desc: {
        es: "Un paraíso secreto accesible solo por sendero o lancha.",
        en: "A secret paradise accessible only by trail or boat.",
      },
      image: "imagenes-mocks/pav-01.jpg",
      price: "Gratis",
      tag: { es: "Playa", en: "Beach" },
    },
    {
      id: 5,
      category: "services",
      title: { es: "Renta de Kayaks", en: "Kayak Rentals" },
      desc: {
        es: "Renta tu equipo y explora la costa a tu propio ritmo.",
        en: "Rent your gear and explore the coast at your own pace.",
      },
      image: "imagenes-mocks/pav-02.jpg",
      price: "$",
      tag: { es: "Servicio", en: "Service" },
    },
    {
      id: 6,
      category: "experiences",
      title: { es: "Senderismo Guiado", en: "Guided Hiking" },
      desc: {
        es: "Rutas escénicas por los cerros con guías locales.",
        en: "Scenic routes through the hills with local guides.",
      },
      image: "imagenes-mocks/pav-03.jpg",
      price: "$",
      tag: { es: "Naturaleza", en: "Nature" },
    },
  ];

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

  // Category Chips
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      // Remove active class from all
      chips.forEach((c) => c.classList.remove("active"));
      // Add active class to clicked
      chip.classList.add("active");
      // Render cards
      const category = chip.getAttribute("data-category");
      renderCards(category);
    });
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

  function renderCards(category) {
    const container = document.getElementById("category-carousel-container");
    container.innerHTML = ""; // Clear existing

    const filteredData = category === "all" ? categoryData : categoryData.filter((item) => item.category === category);

    if (filteredData.length === 0) {
      container.innerHTML = `<p style="width: 100%; text-align: center; color: var(--secondary-text);">No hay resultados para esta categoría.</p>`;
      return;
    }

    filteredData.forEach((item) => {
      const card = document.createElement("div");
      card.className = "listing-card";
      card.innerHTML = `
            <div class="listing-image-container">
                <img src="${item.image}" alt="${item.title[currentLang]}">
                <button class="fav-btn" aria-label="Add to favorites">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>
            <div class="listing-content">
                <span class="listing-tag">${item.tag[currentLang]}</span>
                <h3 class="listing-title">${item.title[currentLang]}</h3>
                <p class="listing-desc">${item.desc[currentLang]}</p>
                <div class="listing-footer">
                    <span class="listing-price">${item.price}</span>
                </div>
            </div>
        `;
      container.appendChild(card);
    });

    // Update View All link visibility/text based on category if needed
    // For now, it just stays as "Ver todo" / "View all"
  }
};
