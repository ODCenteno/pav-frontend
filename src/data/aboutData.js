export const teamMembers = [
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

export const organizations = [
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
