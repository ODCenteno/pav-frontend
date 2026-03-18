// Metadatos de las categorías para evitar repetición
const categoryMeta = {
  experiences: { es: "Experiencias", en: "Experiences", icon: "adventure", color: "#E87A5D", order: 1 },
  accommodation: { es: "Hospedaje", en: "Accommodation", icon: "home", color: "#4A90E2", order: 2 },
  restaurants: { es: "Restaurantes", en: "Restaurants", icon: "restaurant", color: "#F5A623", order: 3 },
  sites: { es: "Sitios", en: "Sites", icon: "location", color: "#7ED321", order: 4 },
  services: { es: "Servicios", en: "Services", icon: "service", color: "#9013FE", order: 5 }
};

export const categoryData = [
  // --- EXPERIENCIAS ---
  {
    id: "exp-01",
    categoryId: "experiences",
    slug: "tour-isla-catalana",
    name_es: "Tour Isla Catalana",
    name_en: "Catalana Island Tour",
    description_es: "Ubicado entre mar, sierra y desierto, este tour ofrece una experiencia tranquila para quienes buscan paisaje, descanso y conexión con el entorno local. Avistamiento de delfines y snorkel en aguas cristalinas.",
    description_en: "Located between the sea, mountains and desert, this tour offers a peaceful experience for those seeking landscape, rest and connection with the local environment. Dolphin watching and snorkeling in crystal clear waters.",
    image: "/src/images/pav-06.png",
    gallery: [
      "/src/images/pav-01.jpg",
      "/src/images/pav-02.jpg",
      "/src/images/pav-03.jpg"
    ],
    price: "$60 USD",
    isFeatured: true,
    tags_es: ["Aventura", "Mar"],
    tags_en: ["Adventure", "Sea"],
    contact: {
      whatsapp: "+521234567890",
      instagram: "isla_catalana_tours",
      facebook: "IslaCatalanaTours",
      phone: "+521234567890",
      email: "info@islacatalana.com"
    },
    location: {
      lat: 25.5123,
      lng: -111.0456,
      name_es: "Muelle de Puerto Agua Verde",
      name_en: "Puerto Agua Verde Pier"
    },
    schedule: {
      text_es: "Salidas diarias a las 8:00 AM",
      text_en: "Daily departures at 8:00 AM"
    },
    amenities_es: ["Chalecos salvavidas", "Equipo de snorkel", "Agua y snacks"],
    amenities_en: ["Life jackets", "Snorkeling gear", "Water and snacks"],
    recommendations: {
      bestTime_es: "Mañana (8 AM - 12 PM)",
      bestTime_en: "Morning (8 AM - 12 PM)",
      bring_es: ["Protector solar biodegradable", "Toalla", "Gorra"],
      bring_en: ["Biodegradable sunscreen", "Towel", "Cap"]
    },
    relatedSites: ["exp-02", "res-01"]
  },
  {
    id: "exp-02",
    categoryId: "experiences",
    slug: "senderismo-cerro-blanco",
    name_es: "Senderismo Cerro Blanco",
    name_en: "White Hill Hiking",
    description_es: "Ruta guiada con vistas panorámicas al Mar de Cortés. Una caminata de intensidad moderada perfecta para fotógrafos y amantes de la naturaleza.",
    description_en: "Guided route with panoramic views of the Sea of Cortez. A moderate intensity hike perfect for photographers and nature lovers.",
    image: "/src/images/pav-03.jpg",
    gallery: ["/src/images/pav-01.jpg", "/src/images/pav-12.jpg"],
    price: "$25 USD",
    isFeatured: true,
    tags_es: ["Naturaleza", "Senderismo"],
    tags_en: ["Nature", "Hiking"],
    contact: {
      whatsapp: "+521112223333",
      instagram: "cerro_blanco_hiking",
      phone: "+521112223333"
    },
    location: {
      lat: 25.5200,
      lng: -111.0500,
      name_es: "Inicio de sendero Cerro Blanco",
      name_en: "White Hill Trailhead"
    },
    schedule: {
      text_es: "Salidas 7:00 AM (Recomendado)",
      text_en: "Departures at 7:00 AM (Recommended)"
    },
    amenities_es: ["Guía certificado", "Bastones de senderismo"],
    amenities_en: ["Certified guide", "Hiking poles"],
    recommendations: {
      bestTime_es: "Invierno y Primavera",
      bestTime_en: "Winter and Spring",
      bring_es: ["Botas de montaña", "2L de agua", "Cámara"],
      bring_en: ["Hiking boots", "2L of water", "Camera"]
    }
  },
  {
    id: "exp-03",
    categoryId: "experiences",
    slug: "pesca-tradicional",
    name_es: "Pesca Tradicional",
    name_en: "Traditional Fishing",
    description_es: "Aprende técnicas locales con pescadores de la comunidad.",
    description_en: "Learn local techniques with community fishermen.",
    image: "/src/images/pav-09.jpg",
    price: "$45 USD",
    isFeatured: false,
    tags_es: ["Cultura"],
    tags_en: ["Culture"],
    contact: {
      whatsapp: "+521112224444",
      facebook: "PescaTradicionalAV"
    }
  },
  {
    id: "exp-04",
    categoryId: "experiences",
    slug: "kayak-al-amanecer",
    name_es: "Kayak al Amanecer",
    name_en: "Sunrise Kayaking",
    description_es: "Recorrido tranquilo por la bahía mientras sale el sol.",
    description_en: "Peaceful bay tour as the sun rises.",
    image: "/src/images/pav-02.jpg",
    price: "$30 USD",
    isFeatured: true,
    tags_es: ["Deporte"],
    tags_en: ["Sport"],
    contact: {
      whatsapp: "+521112225555",
      instagram: "agua_verde_kayaks"
    }
  },

  // --- HOSPEDAJE ---
  {
    id: "acc-01",
    categoryId: "accommodation",
    slug: "cabanas-del-sol",
    name_es: "Cabañas del Sol",
    name_en: "Sun Cabins",
    description_es: "Eco-cabañas con energía solar frente a la playa. El lugar ideal para desconectarse y disfrutar del sonido del mar.",
    description_en: "Solar-powered eco-cabins right on the beach. The ideal place to disconnect and enjoy the sound of the sea.",
    image: "/src/images/pav-07.jpg",
    gallery: ["/src/images/pav-04.jpg", "/src/images/pav-05.jpg"],
    price: "$120 USD",
    isFeatured: true,
    tags_es: ["Eco", "Playa"],
    tags_en: ["Eco", "Beach"],
    contact: {
      whatsapp: "+521112226666",
      instagram: "cabanas_del_sol_av",
      facebook: "CabanasDelSolAguaVerde",
      email: "reservas@cabanasdelsol.com"
    },
    location: {
      lat: 25.5000,
      lng: -111.0400,
      name_es: "Playa Agua Verde",
      name_en: "Agua Verde Beach"
    },
    amenities_es: ["Energía solar", "Cocina equipada", "Terraza privada"],
    amenities_en: ["Solar power", "Equipped kitchen", "Private terrace"]
  },
  {
    id: "acc-02",
    categoryId: "accommodation",
    slug: "camping-punta-arena",
    name_es: "Camping Punta Arena",
    name_en: "Punta Arena Camping",
    description_es: "Zona segura para acampar bajo las estrellas.",
    description_en: "Safe camping area under the stars.",
    image: "/src/images/pav-10.jpg",
    price: "$15 USD",
    isFeatured: true,
    tags_es: ["Aventura"],
    tags_en: ["Adventure"],
    contact: {
      whatsapp: "+521112227777",
      phone: "+521112227777"
    }
  },
  {
    id: "acc-03",
    categoryId: "accommodation",
    slug: "posada-agua-verde",
    name_es: "Posada Agua Verde",
    name_en: "Agua Verde Inn",
    description_es: "Habitaciones tradicionales con hospitalidad local.",
    description_en: "Traditional rooms with local hospitality.",
    image: "/src/images/pav-11.jpg",
    price: "$85 USD",
    isFeatured: false,
    tags_es: ["Familiar"],
    tags_en: ["Family"],
    contact: {
      whatsapp: "+521112228888",
      email: "posada@aguaverde.com"
    }
  },
  {
    id: "acc-04",
    categoryId: "accommodation",
    slug: "glamping-mar-de-cortes",
    name_es: "Glamping Mar de Cortés",
    name_en: "Sea of Cortez Glamping",
    description_es: "Lujo y naturaleza en una tienda equipada.",
    description_en: "Luxury and nature in an equipped tent.",
    image: "/src/images/pav-05.webp",
    price: "$150 USD",
    isFeatured: true,
    tags_es: ["Premium"],
    tags_en: ["Premium"],
    contact: {
      whatsapp: "+521112229999",
      instagram: "glamping_cortes_av",
      facebook: "GlampingMarDeCortes"
    }
  },

  // --- RESTAURANTES ---
  {
    id: "res-01",
    categoryId: "restaurants",
    slug: "mariscos-el-pirata",
    name_es: "Mariscos El Pirata",
    name_en: "The Pirate Seafood",
    description_es: "Tostadas de ceviche y pescado del día.",
    description_en: "Ceviche toasts and catch of the day.",
    image: "/src/images/pav-08.jpg",
    price: "$$",
    isFeatured: true,
    tags_es: ["Mariscos"],
    tags_en: ["Seafood"],
    contact: {
      whatsapp: "+521112220000",
      facebook: "ElPirataMariscos"
    }
  },
  {
    id: "res-02",
    categoryId: "restaurants",
    slug: "la-cocina-de-dona-mary",
    name_es: "La Cocina de Doña Mary",
    name_en: "Mary's Kitchen",
    description_es: "Comida casera tradicional y tortillas a mano.",
    description_en: "Traditional home cooking and handmade tortillas.",
    image: "/src/images/pav-04.jpg",
    price: "$",
    isFeatured: true,
    tags_es: ["Regional"],
    tags_en: ["Regional"],
    contact: {
      whatsapp: "+521112221111",
      phone: "+521112221111"
    }
  },
  {
    id: "res-03",
    categoryId: "restaurants",
    slug: "cafe-del-puerto",
    name_es: "Café del Puerto",
    name_en: "Port Coffee",
    description_es: "Desayunos ligeros y café de grano.",
    description_en: "Light breakfasts and grain coffee.",
    image: "/src/images/pav-05.jpg",
    price: "$",
    isFeatured: false,
    tags_es: ["Desayunos"],
    tags_en: ["Breakfast"],
    contact: {
      instagram: "cafe_del_puerto_av"
    }
  },
  {
    id: "res-04",
    categoryId: "restaurants",
    slug: "tacos-el-malecon",
    name_es: "Tacos El Malecón",
    name_en: "Malecon Tacos",
    description_es: "Los mejores tacos de pescado capeado.",
    description_en: "The best battered fish tacos.",
    image: "/src/images/pav-06.png",
    price: "$",
    isFeatured: true,
    tags_es: ["Tacos"],
    tags_en: ["Tacos"],
    contact: {
      whatsapp: "+521112222222"
    }
  },

  // --- SITIOS ---
  {
    id: "sit-01",
    categoryId: "sites",
    slug: "playa-san-cosme",
    name_es: "Playa San Cosme",
    name_en: "San Cosme Beach",
    description_es: "Playa virgen ideal para el descanso total.",
    description_en: "Pristine beach ideal for total relaxation.",
    image: "/src/images/pav-01.jpg",
    price: "Gratis",
    isFeatured: true,
    tags_es: ["Playa"],
    tags_en: ["Beach"],
    contact: {
      facebook: "VisitaSanCosme"
    }
  },
  {
    id: "sit-02",
    categoryId: "sites",
    slug: "aguas-termales",
    name_es: "Aguas Termales",
    name_en: "Hot Springs",
    description_es: "Pozas naturales de agua templada junto al mar.",
    description_en: "Natural warm water pools by the sea.",
    image: "/src/images/pav-12.jpg",
    price: "Gratis",
    isFeatured: true,
    tags_es: ["Bienestar"],
    tags_en: ["Wellness"],
    contact: {}
  },
  {
    id: "sit-03",
    categoryId: "sites",
    slug: "pinturas-rupestres",
    name_es: "Pinturas Rupestres",
    name_en: "Rock Paintings",
    description_es: "Vestigios arqueológicos en las cuevas cercanas.",
    description_en: "Archaeological vestiges in nearby caves.",
    image: "/src/images/pav-13.jpg",
    price: "Gratis",
    isFeatured: false,
    tags_es: ["Historia"],
    tags_en: ["History"],
    contact: {}
  },
  {
    id: "sit-04",
    categoryId: "sites",
    slug: "mirador-la-ventana",
    name_es: "Mirador La Ventana",
    name_en: "La Ventana Viewpoint",
    description_es: "El mejor punto para fotografías de la bahía.",
    description_en: "The best spot for bay photography.",
    image: "/src/images/pav-10.jpg",
    price: "Gratis",
    isFeatured: true,
    tags_es: ["Vistas"],
    tags_en: ["Views"],
    contact: {}
  },

  // --- SERVICIOS ---
  {
    id: "ser-01",
    categoryId: "services",
    slug: "renta-de-kayaks",
    name_es: "Renta de Kayaks",
    name_en: "Kayak Rentals",
    description_es: "Equipo completo por hora o por día.",
    description_en: "Full gear by the hour or day.",
    image: "/src/images/pav-02.jpg",
    price: "$20 USD",
    isFeatured: true,
    tags_es: ["Equipo"],
    tags_en: ["Gear"],
    contact: {
      whatsapp: "+521112223333",
      instagram: "kayaks_agua_verde"
    }
  },
  {
    id: "ser-02",
    categoryId: "services",
    slug: "transporte-maritimo",
    name_es: "Transporte Marítimo",
    name_en: "Sea Transport",
    description_es: "Traslados a playas e islas cercanas.",
    description_en: "Transfers to nearby beaches and islands.",
    image: "/src/images/pav-06.png",
    price: "$15 USD",
    isFeatured: true,
    tags_es: ["Transporte"],
    tags_en: ["Transport"],
    contact: {
      whatsapp: "+521112224444",
      phone: "+521112224444"
    }
  },
  {
    id: "ser-03",
    categoryId: "services",
    slug: "guia-local-privado",
    name_es: "Guía Local Privado",
    name_en: "Private Local Guide",
    description_es: "Atención personalizada para tus recorridos.",
    description_en: "Personalized attention for your tours.",
    image: "/src/images/pav-03.jpg",
    price: "$50 USD",
    isFeatured: false,
    tags_es: ["Personal"],
    tags_en: ["Personal"],
    contact: {
      whatsapp: "+521112225555"
    }
  },
  {
    id: "ser-04",
    categoryId: "services",
    slug: "tienda-de-viveres",
    name_es: "Tienda de Víveres",
    name_en: "Grocery Store",
    description_es: "Todo lo básico para tu estancia en el puerto.",
    description_en: "All basics for your stay at the port.",
    image: "/src/images/pav-05.jpg",
    price: "$",
    isFeatured: true,
    tags_es: ["Basicos"],
    tags_en: ["Basics"],
    contact: {
      phone: "+521112226666"
    }
  }
].map(item => ({
  ...item,
  type: item.categoryId,
  name_es: item.name_es, // Mantener para el mapper de categories.astro
  name_en: item.name_en,
  // Inyectamos metadatos de categoría en cada item para que el mapper actual los procese
  category_name_es: categoryMeta[item.categoryId].es,
  category_name_en: categoryMeta[item.categoryId].en,
  icon: categoryMeta[item.categoryId].icon,
  color: categoryMeta[item.categoryId].color,
  order: categoryMeta[item.categoryId].order
}));
