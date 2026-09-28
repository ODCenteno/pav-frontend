/**
 * Static fallback data for the good-practices page (contract §7 / §9).
 *
 * Formerly the dev-fallback data for the removed `/guide` page; the
 * `good-practices-page` fetcher (`src/lib/cms/goodPractices.ts`) now uses
 * these values directly as its per-section fallback, since the `guide-page`
 * content type is gone (contract §10).
 */
export const heroData = {
  image: "/images/pav-landscape-12.webp",
};

export const fishingData = {
  title: {
    'es-MX': "Zona de refugio pesquero — Pesca sustentable",
    en: "Fishing refuge zone — Sustainable fishing",
  },
  text: {
    'es-MX': "Parte de las aguas de la bahía funciona como zona de refugio pesquero, donde se aplican vedas, tallas mínimas y artes de pesca selectivas para asegurar la renovación de las poblaciones marinas.",
    en: "Part of the bay's waters function as a fishing refuge zone, where seasonal closures, minimum sizes, and selective fishing gear are applied to ensure the renewal of fish populations.",
  },
  rules: {
    'es-MX': [
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
  title: { 'es-MX': "¿Qué es un área natural protegida?", en: "What is a protected natural area?" },
  text: {
    'es-MX': "Un Área Natural Protegida (ANP) es una zona del territorio nacional — terrestre o marina — cuya conservación ha sido declarada de interés público por la federación. En ella se regulan actividades para preservar ecosistemas, especies y servicios ambientales.",
    en: "A Protected Natural Area (ANP) is a zone of the national territory — land or marine — whose conservation has been declared of public interest by the federal government. Activities are regulated there to preserve ecosystems, species, and environmental services.",
  },
  link: {
    label: { 'es-MX': "Más información en CONANP", en: "More information at CONANP" },
    href: "https://descubreanp.conanp.gob.mx/",
  },
};

export const influenceData = {
  title: { 'es-MX': "Área de influencia", en: "Area of influence" },
  text: {
    'es-MX': "El área de influencia de Puerto Agua Verde y Rancho San Cosme abarca la bahía, los arroyos que bajan de la Sierra de la Giganta y los ecosistemas costeros que conectan con la Reserva de la Biosfera El Vizcaíno y el Parque Nacional Bahía de Loreto. Las decisiones de manejo que afectan a la comunidad tienen impacto sobre una red de ecosistemas compartida.",
    en: "The area of influence of Puerto Agua Verde and Rancho San Cosme covers the bay, the streams descending from the Sierra de la Giganta, and the coastal ecosystems that connect to the El Vizcaíno Biosphere Reserve and Loreto Bay National Park. Management decisions affecting the community have an impact on a shared network of ecosystems.",
  },
};

export const recommendationsData = {
  title: {
    'es-MX': "Recomendaciones y buenas prácticas para visitantes",
    en: "Recommendations and best practices for visitors",
  },
  items: {
    'es-MX': [
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
  title: { 'es-MX': "¿Cómo llegar?", en: "How to get there?" },
  loreto: {
    label: { 'es-MX': "Desde Loreto", en: "From Loreto" },
    desc: {
      'es-MX': "Toma la carretera federal hacia Cd. Constitución y desvía en el entronque hacia Puerto Agua Verde. El camino combina tramo pavimentado y camino rural en buen estado.",
      en: "Take the federal highway toward Cd. Constitución and turn off at the junction toward Puerto Agua Verde. The road combines paved sections and well-maintained rural road.",
    },
    distance: "98 km",
    time: "~2 h",
    image: "/images/guide/route-loreto.svg",
  },
  laPaz: {
    label: { 'es-MX': "Desde La Paz", en: "From La Paz" },
    desc: {
      'es-MX': "Sal por la carretera Transpeninsular hacia el norte. Es un recorrido largo, por lo que se recomienda salir temprano y cargar combustible en ciudades intermedias.",
      en: "Head north on the Transpeninsular Highway. It's a long drive, so plan an early departure and refuel in intermediate cities.",
    },
    distance: "360 km",
    time: "~5 h",
    image: "/images/guide/route-la-paz.svg",
  },
  drivingTipsTitle: {
    'es-MX': "Recomendaciones para el camino",
    en: "Driving tips",
  },
  drivingTips: {
    'es-MX': [
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

export const ctaData = {
  title: { 'es-MX': "Sigue explorando el destino", en: "Keep exploring the destination" },
  desc: {
    'es-MX': "Visita las secciones de experiencias y sitios de interés para planear tu viaje a Puerto Agua Verde y Rancho San Cosme.",
    en: "Visit the experiences and points of interest sections to plan your trip to Puerto Agua Verde and Rancho San Cosme.",
  },
  btn: { 'es-MX': "Ver experiencias", en: "See experiences" },
};
