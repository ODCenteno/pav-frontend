export const introData = {
  title: "Mostrando nuestro territorio con respeto y cuidado",
  text: "Esta plataforma es una guía comunitaria diseñada para ayudar a los viajeros a descubrir lugares, experiencias, servicios e historias locales de Puerto Agua Verde y Rancho San Cosme. Más que un directorio, es un esfuerzo por conectar a los visitantes con las personas, paisajes y tradiciones que hacen único a este destino."
};

export const valuesData = {
  mission: {
    title: "Nuestra misión",
    text: "Facilitar que los visitantes exploren el destino mientras se impulsa la visibilidad local, el turismo responsable y una conexión más cercana entre la comunidad y quien la visita."
  },
  vision: {
    title: "Nuestra visión",
    text: "Convertirnos en una guía digital confiable que destaque la identidad, el valor y las oportunidades de Puerto Agua Verde y Rancho San Cosme tanto para habitantes locales como para visitantes nacionales e internacionales."
  },
  values: {
    title: "Nuestros valores",
    items: [
      "Respeto por la comunidad",
      "Turismo responsable",
      "Identidad local",
      "Accesibilidad de la información",
      "Colaboración y crecimiento compartido"
    ]
  }
};

export const teamData = [
  {
    id: "tm-01",
    name: "Juan Pérez",
    role: { es: "Coordinador de Proyecto", en: "Project Coordinator" },
    shortBio: { 
      es: "Apasionado por el desarrollo comunitario y el turismo sostenible en Baja California Sur.",
      en: "Passionate about community development and sustainable tourism in Baja California Sur."
    },
    photo: "/images/pav-01.jpg",
    links: { email: "juan@example.com", instagram: "juan_pav" },
    order: 1
  },
  {
    id: "tm-02",
    name: "María García",
    role: { es: "Enlace Comunitario", en: "Community Liaison" },
    shortBio: { 
      es: "Nacida y crecida en Puerto Agua Verde, dedicada a preservar las historias locales.",
      en: "Born and raised in Puerto Agua Verde, dedicated to preserving local stories."
    },
    photo: "/images/pav-02.jpg",
    links: { instagram: "maria_av" },
    order: 2
  }
];

export const organizationsData = [
  {
    id: "org-01",
    name: "Cooperativa Pesquera Agua Verde",
    type: "community",
    shortDescription: { 
      es: "Organización local que agrupa a los pescadores de la bahía.",
      en: "Local organization that groups the fishermen of the bay."
    },
    logo: "/images/pav-06.png",
    links: { website: "https://example.com" },
    order: 1
  },
  {
    id: "org-02",
    name: "Amigos de San Cosme",
    type: "partner",
    shortDescription: { 
      es: "Asociación dedicada a la conservación del Rancho San Cosme.",
      en: "Association dedicated to the conservation of Rancho San Cosme."
    },
    logo: "/images/pav-05.jpg",
    order: 2
  }
];

export const communityMessageData = {
  title: "Una guía construida con gratitud",
  text: "Agradecemos profundamente a las personas de Puerto Agua Verde y Rancho San Cosme, así como a cada visitante que llega con curiosidad, respeto y cuidado. Este proyecto existe gracias a las historias, el esfuerzo y la generosidad de la comunidad."
};

export const collaborationData = {
  title: "¿Te gustaría colaborar?",
  desc: "Si formas parte de la comunidad, representas a una organización local o te gustaría aportar al crecimiento de esta guía, será un gusto escucharte.",
  btnPrimary: "Ponerte en contacto",
  btnSecondary: "Seguir el proyecto",
  links: {
    primary: "mailto:info@puertoaguaverde.mx",
    secondary: "https://instagram.com/puertoaguaverde"
  }
};
