# Pasos para la implementación

1. **Internacionalización (i18n):** Agregar el objeto `experiencesPage` a `src/i18n/es.json` y `src/i18n/en.json` con los textos propuestos.
2. **Desarrollo de Componentes (Astro):**
   - `ExpHero`: Hero inmersivo con imagen/video y overlay de título.
   - `ExpIntro`: Sección de texto breve para introducir el concepto editorial.
   - `ExpFeatured`: Componente para experiencias destacadas con imagen grande y diseño alternado (zig-zag).
   - `ExpGrid`: Grid secundario para el resto de las experiencias.
   - `ExpCTA`: Bloque final de navegación hacia el resto del catálogo.
3. **Modelado de Datos:** Asegurar que los items en `categoryData.js` con categoría `experiences` tengan los campos necesarios (isFeatured, descripciones largas).
4. **Ensamblaje de la Página:** Reestructurar `src/pages/experiencias.astro` y `src/pages/en/experiencias.astro` siguiendo el flujo de storytelling definido.
5. **Estilos Editoriales:** Aplicar refinamientos de CSS para lograr las "National Geographic vibes" (tipografía elegante, espacios amplios, imágenes de alta calidad).

---

🟠 1. EXPERIENCIAS
🧠 Concepto de la página

Esta no es un directorio.
Es una historia navegable del destino.

Debe sentirse más editorial, más “inspiracional”, tipo:

Airbnb Experiences

Apple Travel Guides

National Geographic vibes

👉 Objetivo:
Que el usuario diga “quiero hacer esto” antes de ver precios o detalles.

🧩 Idea de UI

Flujo vertical tipo storytelling

[Hero inmersivo (imagen/video)]
        ↓
[Intro breve]
        ↓
[Sección destacada #1 - experiencia]
        ↓
[Sección destacada #2]
        ↓
[Grid secundario de experiencias]
        ↓
[CTA a explorar todo]
🧱 Wireframe (low fidelity)
--------------------------------------------------
| HERO (imagen/video + título + overlay)         |
| "Experience Baja beyond the map"               |
--------------------------------------------------

[Intro text - 2 líneas]

--------------------------------------------------
| Experiencia destacada                          |
| [Imagen grande]                                |
| Título                                         |
| Descripción                                    |
| CTA → Ver más                                  |
--------------------------------------------------

--------------------------------------------------
| Experiencia destacada                          |
| [Imagen]                                       |
| ...                                            |
--------------------------------------------------

---------------- GRID ----------------------------
| card | card | card |
| card | card | card |
--------------------------------------------------

[CTA FINAL]
✍️ Copy (EN + ES)
🇺🇸 English
"experiencesPage": {
  "heroTitle": "Experiences beyond the ordinary",
  "heroDesc": "From the sea to the desert, discover activities that connect you with the true essence of Baja California Sur.",
  
  "intro": "Puerto Agua Verde and Rancho San Cosme offer more than places to visit — they offer moments to live. Explore outdoor adventures, local traditions, and unforgettable landscapes.",

  "featuredTitle": "Featured experiences",
  
  "cta": {
    "title": "Find your next experience",
    "desc": "Explore all available activities and start planning your adventure.",
    "btn": "View all experiences"
  }
}
🇪🇸 Español
"experiencesPage": {
  "heroTitle": "Experiencias más allá de lo común",
  "heroDesc": "Del mar al desierto, descubre actividades que te conectan con la verdadera esencia de Baja California Sur.",
  
  "intro": "Puerto Agua Verde y Rancho San Cosme ofrecen más que lugares para visitar — ofrecen momentos para vivir. Explora aventuras al aire libre, tradiciones locales y paisajes inolvidables.",

  "featuredTitle": "Experiencias destacadas",
  
  "cta": {
    "title": "Encuentra tu próxima experiencia",
    "desc": "Explora todas las actividades disponibles y comienza a planear tu aventura.",
    "btn": "Ver todas las experiencias"
  }
}
🔌 Contrato con Strapi (API)

Aquí es donde nos ponemos finos para tu arquitectura Astro + React + offline.

🧱 Collection: experiences
type Experience = {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;

  coverImage: Media;
  gallery: Media[];

  location: {
    name: string;
    lat: number;
    lng: number;
  };

  category: "water" | "hiking" | "culture" | "adventure";

  duration?: string;
  difficulty?: "easy" | "medium" | "hard";

  isFeatured: boolean;
  order?: number;

  relatedSites: Site[];

  createdAt: string;
  updatedAt: string;
};
📡 Endpoint recomendado
GET /api/experiences?populate=*&sort=order:asc

👉 Para destacados:

GET /api/experiences?filters[isFeatured][$eq]=true&populate=*
⚡ Estrategia frontend (importante)

SSG (Astro) para listado base

React hydration solo para:

filtros

favoritos

Cache local:

localStorage.setItem("experiences_cache", JSON.stringify(data))
🧠 Decisiones clave (UX + producto)

❌ No usar filtros complejos aquí
👉 Eso es para “Sitios de interés”

✅ Priorizar storytelling sobre eficiencia

✅ Usar:

imágenes grandes

scroll fluido

bloques alternados (izq/der)
