/**
 * Dev-fallback data for the Guide page.
 *
 * Mirrors the shape returned by `getGuidePage()` (when Strapi is connected).
 * The page prefers CMS data when available and falls back to these values
 * so the route can be developed end-to-end without the backend running.
 */
export const heroData = {
  title: {
    es: "Guía del Destino",
    en: "Visitor Guide",
  },
  desc: {
    es: "Conoce la bahía, la comunidad, el área natural protegida, cómo llegar y los servicios que encontrarás en Puerto Agua Verde y Rancho San Cosme.",
    en: "Learn about the bay, the community, the protected natural area, how to get there, and the services you'll find in Puerto Agua Verde and Rancho San Cosme.",
  },
  image: "/images/pav-landscape-12.webp",
};

export const introData = {
  ranchTitle: { es: "Rancho San Cosme", en: "Rancho San Cosme" },
  ranchText: {
    es: "Rancho San Cosme es un asentamiento histórico del ejido que conserva la vida rural del sur de Baja California Sur. Entre caminos de tierra, milpas y casas de adobe, sus habitantes mantienen viva una relación cotidiana con el desierto, la montaña y el mar.",
    en: "Rancho San Cosme is a historic ejido settlement that preserves the rural life of southern Baja California Sur. Among dirt roads, milpas, and adobe houses, its inhabitants keep an everyday relationship with the desert, the mountains, and the sea alive.",
  },
  portTitle: { es: "Puerto Agua Verde", en: "Puerto Agua Verde" },
  portText: {
    es: "Puerto Agua Verde es una comunidad costera que combina pesca artesanal, turismo de bajo impacto y una bahía de aguas tranquilas rodeada de cerros. Es un punto de partida para explorar la Reserva de la Biosfera del Vizcaíno y el Parque Nacional Bahía de Loreto.",
    en: "Puerto Agua Verde is a coastal community that combines artisanal fishing, low-impact tourism, and a calm bay surrounded by hills. It is a starting point for exploring the Vizcaíno Biosphere Reserve and Loreto Bay National Park.",
  },
};

export const historyData = {
  title: { es: "Historia de la comunidad", en: "Community history" },
  text: {
    es: "La comunidad de Agua Verde y Rancho San Cosme se ha formado a lo largo de generaciones a partir de la pesca, la agricultura de temporal y el trabajo cooperativo. Conoce algunos hitos que han marcado su desarrollo.",
    en: "The community of Agua Verde and Rancho San Cosme has been shaped over generations by fishing, rain-fed agriculture, and cooperative work. Here are some milestones that have marked its development.",
  },
  milestones: [
    {
      year: "S. XIX",
      es: "Primeros registros de campamentos pesqueros temporales en la bahía, usados por familias de la región del Vizcaíno.",
      en: "First records of temporary fishing camps in the bay, used by families from the Vizcaíno region.",
    },
    {
      year: "1937",
      es: "Se constituye formalmente el ejido de Agua Verde, base de la tenencia comunal de la tierra.",
      en: "The Agua Verde ejido is formally established, becoming the basis of communal land tenure.",
    },
    {
      year: "1970s",
      es: "Se consolidan las cooperativas pesqueras que articulan la economía local y la vida social del puerto.",
      en: "Fishing cooperatives consolidate, structuring the local economy and social life of the port.",
    },
    {
      year: "1996",
      es: "La bahía es incorporada al Parque Nacional Bahía de Loreto, área natural protegida federal.",
      en: "The bay is incorporated into Loreto Bay National Park, a federal protected natural area.",
    },
    {
      year: "Hoy",
      es: "La comunidad impulsa un modelo de turismo comunitario que protege su identidad y su entorno natural.",
      en: "The community drives a community-based tourism model that protects its identity and natural environment.",
    },
  ],
};

export const fishingData = {
  title: {
    es: "Zona de refugio pesquero — Pesca sustentable",
    en: "Fishing refuge zone — Sustainable fishing",
  },
  text: {
    es: "Parte de las aguas de la bahía funciona como zona de refugio pesquero, donde se aplican vedas, tallas mínimas y artes de pesca selectivas para asegurar la renovación de las poblaciones marinas.",
    en: "Part of the bay's waters function as a fishing refuge zone, where seasonal closures, minimum sizes, and selective fishing gear are applied to ensure the renewal of fish populations.",
  },
  rules: {
    es: [
      "Respeta las vedas temporales y zonas de no pesca señalizadas.",
      "Utiliza artes de pesca permitidas y selectivas.",
      "Devuelve al mar los ejemplares por debajo de la talla mínima.",
      "Infórmate con la cooperativa pesquera local antes de practicar pesca recreativa.",
    ],
    en: [
      "Respect seasonal closures and signed no-fishing zones.",
      "Use only permitted and selective fishing gear.",
      "Return to the sea any specimen below the minimum size.",
      "Check with the local fishing cooperative before recreational fishing.",
    ],
  },
};

export const protectedAreaData = {
  title: { es: "¿Qué es un área natural protegida?", en: "What is a protected natural area?" },
  text: {
    es: "Un Área Natural Protegida (ANP) es una zona del territorio nacional — terrestre o marina — cuya conservación ha sido declarada de interés público por la federación. En ella se regulan actividades para preservar ecosistemas, especies y servicios ambientales.",
    en: "A Protected Natural Area (ANP) is a zone of the national territory — land or marine — whose conservation has been declared of public interest by the federal government. Activities are regulated there to preserve ecosystems, species, and environmental services.",
  },
  link: {
    label: { es: "Más información en CONANP", en: "More information at CONANP" },
    href: "https://descubreanp.conanp.gob.mx/",
  },
};

export const influenceData = {
  title: { es: "Área de influencia", en: "Area of influence" },
  text: {
    es: "El área de influencia de Puerto Agua Verde y Rancho San Cosme abarca la bahía, los arroyos que bajan de la Sierra de la Giganta y los ecosistemas costeros que conectan con la Reserva de la Biosfera El Vizcaíno y el Parque Nacional Bahía de Loreto. Las decisiones de manejo que afectan a la comunidad tienen impacto sobre una red de ecosistemas compartida.",
    en: "The area of influence of Puerto Agua Verde and Rancho San Cosme covers the bay, the streams descending from the Sierra de la Giganta, and the coastal ecosystems that connect to the El Vizcaíno Biosphere Reserve and Loreto Bay National Park. Management decisions affecting the community have an impact on a shared network of ecosystems.",
  },
};

export const recommendationsData = {
  title: {
    es: "Recomendaciones y buenas prácticas para visitantes",
    en: "Recommendations and best practices for visitors",
  },
  items: {
    es: [
      "Lleva agua potable suficiente y protégete del sol, incluso en invierno.",
      "No dejes residuos: vuelve con todo lo que trajiste y separa lo reciclable.",
      "Respeta la vida silvestre: observa desde la distancia y no alimentes a los animales.",
      "Apoya la economía local contratando guías, hospedaje y servicios comunitarios.",
      "Consulta el clima y las condiciones del camino antes de desplazarte por la región.",
      "Respeta la señalización y los usos de las áreas naturales protegidas.",
    ],
    en: [
      "Carry enough drinking water and protect yourself from the sun, even in winter.",
      "Leave no trace: take everything back with you and separate recyclables.",
      "Respect wildlife: observe from a distance and do not feed animals.",
      "Support the local economy by hiring community guides, accommodation, and services.",
      "Check the weather and road conditions before moving around the region.",
      "Respect signage and the rules of protected natural areas.",
    ],
  },
};

export const directionsData = {
  title: { es: "¿Cómo llegar?", en: "How to get there?" },
  loreto: {
    label: { es: "Desde Loreto", en: "From Loreto" },
    desc: {
      es: "Toma la carretera federal hacia Cd. Constitución y desvía en el entronque hacia Puerto Agua Verde. El camino combina tramo pavimentado y camino rural en buen estado.",
      en: "Take the federal highway toward Cd. Constitución and turn off at the junction toward Puerto Agua Verde. The road combines paved sections and well-maintained rural road.",
    },
    distance: "98 km",
    time: "~2 h",
    image: "/images/guide/route-loreto.svg",
  },
  laPaz: {
    label: { es: "Desde La Paz", en: "From La Paz" },
    desc: {
      es: "Sal por la carretera Transpeninsular hacia el norte. Es un recorrido largo, por lo que se recomienda salir temprano y cargar combustible en ciudades intermedias.",
      en: "Head north on the Transpeninsular Highway. It's a long drive, so plan an early departure and refuel in intermediate cities.",
    },
    distance: "360 km",
    time: "~5 h",
    image: "/images/guide/route-la-paz.svg",
  },
  drivingTipsTitle: {
    es: "Recomendaciones para el camino",
    en: "Driving tips",
  },
  drivingTips: {
    es: [
      "Revisa presión y estado de las llantas antes de salir.",
      "Carga combustible en Loreto o Cd. Constitución antes del último tramo.",
      "Conduce con precaución en los kilómetros finales: camino sinuoso y fauna silvestre.",
    ],
    en: [
      "Check tire pressure and condition before leaving.",
      "Refuel in Loreto or Cd. Constitución before the last stretch.",
      "Drive carefully on the final kilometers: winding road and wildlife.",
    ],
  },
};

export const amenitiesData = {
  title: { es: "Servicios para visitantes", en: "Visitor services" },
  items: [
    {
      icon: "wifi",
      title: { es: "Wi-Fi", en: "Wi-Fi" },
      text: {
        es: "Zonas con conexión Wi-Fi comunitaria (Starlink) en el área del muelle y en algunos hospedajes del puerto.",
        en: "Community Wi-Fi zones (Starlink) in the dock area and at some of the port's accommodations.",
      },
    },
    {
      icon: "signal",
      title: { es: "Internet y señal", en: "Internet & signal" },
      text: {
        es: "Cobertura de datos limitada; se recomienda descargar mapas y contenido antes del viaje.",
        en: "Limited data coverage; download maps and content before your trip.",
      },
    },
    {
      icon: "toilet",
      title: { es: "Sanitarios", en: "Restrooms" },
      text: {
        es: "Baños públicos disponibles en zonas comunes del puerto y del rancho.",
        en: "Public restrooms available in common areas of the port and the ranch.",
      },
    },
  ],
};

export const touristMapData = {
  title: {
    es: "Mapa turístico del destino",
    en: "Tourist map of the destination",
  },
  image: "/images/tourist-map.png",
  caption: {
    es: "Mapa de referencia: ubicación de Puerto Agua Verde y Rancho San Cosme, rutas desde Loreto y La Paz, zona de refugio pesquero y servicios para visitantes.",
    en: "Reference map: location of Puerto Agua Verde and Rancho San Cosme, routes from Loreto and La Paz, fishing refuge zone, and visitor services.",
  },
};

export const ctaData = {
  title: { es: "Sigue explorando el destino", en: "Keep exploring the destination" },
  desc: {
    es: "Visita las secciones de experiencias y sitios de interés para planear tu viaje a Puerto Agua Verde y Rancho San Cosme.",
    en: "Visit the experiences and points of interest sections to plan your trip to Puerto Agua Verde and Rancho San Cosme.",
  },
  btn: { es: "Ver experiencias", en: "See experiences" },
};
