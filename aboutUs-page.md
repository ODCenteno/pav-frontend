# Pasos para la implementación

1. **Internacionalización (i18n):** Integrar el objeto `aboutPage` (sección 6) en `src/i18n/es.json` y `src/i18n/en.json` para habilitar el soporte multiidioma.
2. **Definición de Modelos (TypeScript):** Crear las interfaces para `TeamMember`, `Organization` y el contenido modular de la página en `src/types/`.
3. **Preparación de Datos (Mock):** Crear archivos de datos en `src/data/` para simular la respuesta del CMS para el equipo y las organizaciones aliadas.
4. **Desarrollo de Componentes (Astro):**
   - `AboutHero`: Imagen de impacto con mensaje de propósito.
   - `AboutIntro`: Texto narrativo sobre el origen del proyecto.
   - `AboutValues`: Grid de tarjetas para Misión, Visión y Valores.
   - `TeamGrid` / `MemberCard`: Listado de personas clave.
   - `OrganizationsGrid` / `OrgCard`: Logos y descripción de aliados.
   - `CommunityMessage`: Bloque tipo quote/agradecimiento con diseño editorial.
   - `CollaborationBlock`: Sección de contacto y redes sociales.
5. **Ensamblaje de Páginas:** Actualizar `src/pages/acerca.astro` y `src/pages/en/acerca.astro` integrando los nuevos componentes.
6. **Refinamiento de Estilos:** Aplicar diseño fluido y tokens del sistema (colores bone, coral, charcoal) para asegurar coherencia visual.

---

3. SOBRE NOSOTROS
1) Objetivo de la página

Esta página debe responder estas preguntas:

¿Qué es este proyecto?

¿Quiénes están detrás?

¿Por qué se creó?

¿Qué papel tienen la comunidad y las organizaciones involucradas?

¿Qué tipo de turismo y experiencia quieren promover?

Debe ayudar a construir confianza tanto para:

turistas

comunidad local

aliados

posibles colaboradores

2) Concepto de la página

La página debe sentirse como una mezcla de:

manifiesto del proyecto

presentación del equipo

reconocimiento a la comunidad

puente hacia colaboración o contacto

No la haría excesivamente larga ni estilo “timeline corporativo”.
La haría narrativa, visual y modular.

3) Propuesta de UI
Estructura general

Hero con mensaje de propósito

Bloque “qué es este proyecto”

Bloque de misión / visión / valores

Bloque de personas y organizaciones

Bloque de comunidad y agradecimiento

Bloque de colaboración / contacto

CTA final

4) Wireframe propuesto
Desktop
┌──────────────────────────────────────────────────────────────┐
│ HERO                                                        │
│ “A guide built with and for the community”                  │
│ Texto corto + imagen del destino / comunidad                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ WHAT THIS PROJECT IS                                        │
│ Texto narrativo 2 columnas                                  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ MISSION / VISION / VALUES                                   │
│ [card] [card] [card]                                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ PEOPLE & ORGANIZATIONS                                      │
│ [member card] [member card] [member card]                   │
│ [org card]    [org card]                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ COMMUNITY MESSAGE / THANK YOU                               │
│ Texto + quote / image                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ COLLABORATE WITH US                                         │
│ Short text + buttons                                        │
│ [Contact] [Follow the project]                              │
└──────────────────────────────────────────────────────────────┘
Mobile
[Hero]
Título
Descripción

[Qué es este proyecto]

[Misión]
[Visión]
[Valores]

[Equipo]
[cards verticales]

[Organizaciones]
[cards verticales]

[Agradecimiento a la comunidad]

[Colaborar]
[Botones]
5) Enfoque visual recomendado
Debe comunicar

territorio

comunidad

legitimidad

sencillez moderna

Recursos UI sugeridos

hero con fotografía auténtica del lugar o de la comunidad

cards limpias para personas y organizaciones

bloques de texto cortos, muy escaneables

alguna cita destacada o manifesto statement

Evitar

exceso de texto corrido

lenguaje institucional rígido

fotos stock

organigramas complejos

6) Copy propuesto de la página

Voy a darte el copy estructural para i18n, para que luego puedas completarlo con nombres reales de personas y organizaciones.

EN – copy base
"aboutPage": {
  "hero": {
    "title": "A project rooted in place and community",
    "desc": "Puerto Agua Verde and Rancho San Cosme are destinations shaped by nature, history, and the people who give them life. This project was created to share that richness with visitors in a respectful, clear, and accessible way."
  },
  "intro": {
    "title": "What this project is",
    "text": "This platform is a community-oriented guide designed to help travelers discover places, experiences, services, and local stories across Puerto Agua Verde and Rancho San Cosme. More than a directory, it is an effort to connect visitors with the people, landscapes, and traditions that make this destination unique."
  },
  "mission": {
    "title": "Our mission",
    "text": "To make it easier for visitors to explore the destination while supporting local visibility, responsible tourism, and a stronger connection between community and traveler."
  },
  "vision": {
    "title": "Our vision",
    "text": "To become a trusted digital guide that highlights the identity, value, and opportunities of Puerto Agua Verde and Rancho San Cosme for both local residents and international visitors."
  },
  "values": {
    "title": "Our values",
    "items": [
      "Respect for the community",
      "Responsible tourism",
      "Local identity",
      "Accessibility of information",
      "Collaboration and shared growth"
    ]
  },
  "team": {
    "title": "People behind the project",
    "desc": "Meet some of the people helping shape, support, and grow this initiative."
  },
  "organizations": {
    "title": "Organizations and collaborators",
    "desc": "This project is strengthened by the participation of local groups, community leaders, and partner organizations committed to the destination."
  },
  "community": {
    "title": "A guide built with gratitude",
    "text": "We deeply appreciate the people of Puerto Agua Verde and Rancho San Cosme, as well as every visitor who arrives with curiosity, respect, and care. This project exists thanks to the stories, efforts, and generosity of the community."
  },
  "collab": {
    "title": "Would you like to collaborate?",
    "desc": "If you are part of the community, represent a local organization, or would like to contribute to the growth of this guide, we would love to hear from you.",
    "btnPrimary": "Get in touch",
    "btnSecondary": "Follow the project"
  },
  "cta": {
    "title": "Keep discovering the destination",
    "desc": "Explore places, experiences, and services that reflect the spirit of Puerto Agua Verde and Rancho San Cosme.",
    "btn": "Explore the guide"
  }
}
ES – copy base
"aboutPage": {
  "hero": {
    "title": "Un proyecto con raíces en el territorio y la comunidad",
    "desc": "Puerto Agua Verde y Rancho San Cosme son destinos marcados por la naturaleza, la historia y las personas que les dan vida. Este proyecto fue creado para compartir esa riqueza con los visitantes de una manera clara, respetuosa y accesible."
  },
  "intro": {
    "title": "Qué es este proyecto",
    "text": "Esta plataforma es una guía comunitaria diseñada para ayudar a los viajeros a descubrir lugares, experiencias, servicios e historias locales de Puerto Agua Verde y Rancho San Cosme. Más que un directorio, es un esfuerzo por conectar a los visitantes con las personas, paisajes y tradiciones que hacen único a este destino."
  },
  "mission": {
    "title": "Nuestra misión",
    "text": "Facilitar que los visitantes exploren el destino mientras se impulsa la visibilidad local, el turismo responsable y una conexión más cercana entre la comunidad y quien la visita."
  },
  "vision": {
    "title": "Nuestra visión",
    "text": "Convertirnos en una guía digital confiable que destaque la identidad, el valor y las oportunidades de Puerto Agua Verde y Rancho San Cosme tanto para habitantes locales como para visitantes nacionales e internacionales."
  },
  "values": {
    "title": "Nuestros valores",
    "items": [
      "Respeto por la comunidad",
      "Turismo responsable",
      "Identidad local",
      "Accesibilidad de la información",
      "Colaboración y crecimiento compartido"
    ]
  },
  "team": {
    "title": "Personas detrás del proyecto",
    "desc": "Conoce a algunas de las personas que ayudan a imaginar, construir y fortalecer esta iniciativa."
  },
  "organizations": {
    "title": "Organizaciones y colaboradores",
    "desc": "Este proyecto se fortalece con la participación de grupos locales, líderes comunitarios y organizaciones aliadas comprometidas con el destino."
  },
  "community": {
    "title": "Una guía construida con gratitud",
    "text": "Agradecemos profundamente a las personas de Puerto Agua Verde y Rancho San Cosme, así como a cada visitante que llega con curiosidad, respeto y cuidado. Este proyecto existe gracias a las historias, el esfuerzo y la generosidad de la comunidad."
  },
  "collab": {
    "title": "¿Te gustaría colaborar?",
    "desc": "Si formas parte de la comunidad, representas a una organización local o te gustaría aportar al crecimiento de esta guía, será un gusto escucharte.",
    "btnPrimary": "Ponerte en contacto",
    "btnSecondary": "Seguir el proyecto"
  },
  "cta": {
    "title": "Sigue descubriendo el destino",
    "desc": "Explora lugares, experiencias y servicios que reflejan el espíritu de Puerto Agua Verde y Rancho San Cosme.",
    "btn": "Explorar la guía"
  }
}
7) Copy alternativo más emocional para el hero

Si quieres un tono más evocador y menos institucional, estas opciones funcionan muy bien.

EN

Built to share the spirit of this place

A guide shaped by landscape, people, and local identity

More than a destination, a living community

ES

Un proyecto para compartir el espíritu de este lugar

Una guía construida entre paisaje, comunidad e identidad local

Más que un destino, una comunidad viva

Mi favorita para esta página sería:

ES

Una guía construida entre territorio, comunidad e identidad local

EN

A guide shaped by place, community, and local identity

Tiene mucho carácter y se siente contemporánea.

8) Secciones de personas y organizaciones

Aquí conviene separar dos entidades:

A. Personas

Para presentar:

integrantes del proyecto

coordinadores

aliados locales

promotores o responsables de áreas

B. Organizaciones

Para mostrar:

asociaciones

comités

emprendimientos aliados

instituciones participantes

No mezclar todo en una sola lista, porque visualmente pierde claridad.

9) Contrato de datos para Strapi

Yo haría esta página con contenido modular, no con puro hardcode.

Opción recomendada: single type about-page
type AboutPage = {
  id: number;

  heroTitle: string;
  heroDescription: string;
  heroImage?: Media;

  introTitle: string;
  introText: string;

  missionTitle: string;
  missionText: string;

  visionTitle: string;
  visionText: string;

  valuesTitle: string;
  values: string[];

  communityTitle: string;
  communityText: string;

  collaborationTitle: string;
  collaborationText: string;
  collaborationPrimaryLabel: string;
  collaborationPrimaryUrl?: string;
  collaborationSecondaryLabel: string;
  collaborationSecondaryUrl?: string;

  ctaTitle: string;
  ctaDescription: string;
  ctaButtonLabel: string;
  ctaButtonUrl?: string;

  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: Media;
  };

  updatedAt: string;
  publishedAt: string;
};
Collection team-members
type TeamMember = {
  id: number;
  name: string;
  slug?: string;
  role: string;
  shortBio?: string;
  photo?: Media;

  links?: {
    email?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };

  order?: number;
  isFeatured?: boolean;
};
Collection organizations
type Organization = {
  id: number;
  name: string;
  slug?: string;
  type?: "community" | "institution" | "partner" | "collective" | "business";
  shortDescription?: string;
  logo?: Media;
  website?: string;
  instagram?: string;
  facebook?: string;
  order?: number;
  isFeatured?: boolean;
};
10) Endpoints sugeridos
Página principal
GET /api/about-page?populate=deep
Personas
GET /api/team-members?sort=order:asc&populate=*
Organizaciones
GET /api/organizations?sort=order:asc&populate=*
11) View model recomendado en frontend

Para desacoplar Strapi del render:

type AboutPageViewModel = {
  hero: {
    title: string;
    description: string;
    image?: ImageAsset | null;
  };
  intro: {
    title: string;
    text: string;
  };
  mission: {
    title: string;
    text: string;
  };
  vision: {
    title: string;
    text: string;
  };
  values: {
    title: string;
    items: string[];
  };
  community: {
    title: string;
    text: string;
  };
  collaboration: {
    title: string;
    text: string;
    primaryAction?: {
      label: string;
      href: string;
    };
    secondaryAction?: {
      label: string;
      href: string;
    };
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
    href: string;
  };
  seo: {
    title: string;
    description: string;
    image?: string;
  };
};
12) Estrategia de programación en Astro

Esta página casi no necesita lógica compleja.
Conviene hacerla principalmente estática con Astro.

Ruta
/src/pages/about.astro
Render estático recomendado

hero

intro

misión / visión / valores

comunidad

CTA final

Componentes hidratados solo si aportan valor

Solo usar React si quieres:

carrusel de organizaciones en mobile

modal de perfil del equipo

tabs entre “personas” y “organizaciones”

Pero honestamente, para MVP:
no hace falta hidratar casi nada.

13) Estructura de componentes
/components/about/
  AboutHero.astro
  AboutIntro.astro
  AboutValues.astro
  TeamGrid.astro
  OrganizationsGrid.astro
  CommunityMessage.astro
  CollaborationBlock.astro
14) Propuesta de composición de la página
<BaseLayout title={seo.title} description={seo.description}>
  <AboutHero hero={about.hero} />
  <AboutIntro intro={about.intro} />
  <AboutValues
    mission={about.mission}
    vision={about.vision}
    values={about.values}
  />
  <TeamGrid members={teamMembers} />
  <OrganizationsGrid organizations={organizations} />
  <CommunityMessage community={about.community} />
  <CollaborationBlock collaboration={about.collaboration} />
  <FinalCta cta={about.cta} />
</BaseLayout>
15) Wireframe de cards
Card de persona
[Foto]
Nombre
Rol
Bio corta

[Instagram] [Email] [Sitio]
Card de organización
[Logo]
Nombre
Tipo / categoría
Descripción corta

[Ver sitio] [Instagram]
16) Recomendaciones de tono para bios

Las bios deben ser breves y útiles.

Buena longitud

1 a 3 líneas máximo

Ejemplo ES

Coordinación de contenido y organización del proyecto, con enfoque en identidad local y experiencia del visitante.

Ejemplo EN

Supports content, coordination, and local storytelling across the project.

No hace falta CV largo.

17) Recomendación de diseño editorial

Para que esta página no se sienta plana, yo metería un bloque tipo quote o manifiesto:

ES

“Creemos que un destino también se descubre a través de sus personas, su memoria y la forma en que recibe a quienes lo visitan.”

EN

“We believe a destination is discovered not only through places, but through the people, memory, and care that shape it.”

Eso le da mucha alma.

18) CTA final recomendado

Para esta página, el CTA final no debe ser demasiado comercial.
Debe invitar a seguir explorando o a contactar.

EN

Keep exploring the guide
Discover places, experiences, and local services across the destination.

ES

Sigue explorando la guía
Descubre lugares, experiencias y servicios locales en todo el destino.

19) Resumen ejecutivo
La página “Sobre nosotros” debe:

humanizar el proyecto

dar legitimidad

agradecer a la comunidad

abrir puerta a colaboración

En UI:

narrativa corta

cards limpias

tono cálido y auténtico

En Astro:

página casi completamente estática

fácil de mantener

SEO-friendly

En Strapi:

single type para el contenido general

collections separadas para personas y organizaciones
