2. SITIOS DE INTERÉS
🧠 Concepto de la página

Esta es la página donde el usuario explora, compara y decide.

👉 Diferencia clave con “Experiencias”:

Experiencias = inspiración (emocional)

Sitios = exploración (funcional + placentera)

🧩 Idea de UI

Inspiración clara:

Airbnb (home feed)

Netflix (carouseles)

Google Maps (contexto espacial)

👉 Modelo híbrido:

🧱 Estructura
[Header + search]
        ↓
[Quick filters (chips)]
        ↓
[Categorías en carrusel horizontal]
        ↓
[Mapa opcional (toggle)]
🧱 Wireframe
--------------------------------------------------
| 🔍 Search: "Find places, food, stays..."        |
--------------------------------------------------

[ Chips ]
[ All ] [ Beaches ] [ Food ] [ Stay ] [ Services ]

--------------------------------------------------
| Category: Beaches                              |
|  [card] [card] [card] →                        |
--------------------------------------------------

--------------------------------------------------
| Category: Restaurants                          |
|  [card] [card] [card] →                        |
--------------------------------------------------

--------------------------------------------------
| Category: Accommodation                        |
|  [card] [card] [card] →                        |
--------------------------------------------------

[ Toggle: 🗺 Map view ]
🎯 UX CLAVE (muy importante)

Scroll vertical = categorías

Scroll horizontal = exploración dentro de categoría

Tap → abre detalle (subpage dinámica)

👉 Esto es EXACTAMENTE el patrón de:

Uber Eats

Airbnb homepage

🧱 Card (diseño clave)

Cada card debe ser altamente informativa pero limpia:

[ Imagen ]
[ ♥ favorito ]
[ Categoría badge ]

Nombre
Ubicación corta

⭐ opcional
💲 opcional

[ Tags: "Beach", "Family", "Local food" ]
✍️ Copy (EN + ES)
🇺🇸 English
"sitesPage": {
  "heroTitle": "Explore places around you",
  "heroDesc": "Discover beaches, restaurants, accommodations, and services in Puerto Agua Verde and Rancho San Cosme.",

  "searchPlaceholder": "Search places, food, stays or services...",

  "filters": {
    "all": "All",
    "beaches": "Beaches",
    "food": "Food",
    "stay": "Stay",
    "services": "Services"
  },

  "sections": {
    "nearby": "Nearby",
    "popular": "Popular",
    "recommended": "Recommended for you"
  },

  "empty": "No places found in this category."
}
🇪🇸 Español
"sitesPage": {
  "heroTitle": "Explora lugares a tu alrededor",
  "heroDesc": "Descubre playas, restaurantes, hospedajes y servicios en Puerto Agua Verde y Rancho San Cosme.",

  "searchPlaceholder": "Buscar lugares, comida, hospedaje o servicios...",

  "filters": {
    "all": "Todos",
    "beaches": "Playas",
    "food": "Comida",
    "stay": "Hospedaje",
    "services": "Servicios"
  },

  "sections": {
    "nearby": "Cerca de ti",
    "popular": "Populares",
    "recommended": "Recomendados para ti"
  },

  "empty": "No hay resultados en esta categoría."
}
🔌 Contrato con Strapi

Aquí es donde necesitamos estructura sólida porque esto escala.

🧱 Collection: sites
type Site = {
  id: number;
  name: string;
  slug: string;

  description: string;
  shortDescription: string;

  coverImage: Media;
  gallery: Media[];

  category: "beach" | "restaurant" | "accommodation" | "service";

  tags: string[];

  location: {
    name: string;
    lat: number;
    lng: number;
  };

  contact?: {
    phone?: string;
    whatsapp?: string;
    instagram?: string;
  };

  amenities?: string[];

  priceRange?: number; // 1-4

  rating?: number;

  isFeatured?: boolean;
  isPopular?: boolean;

  createdAt: string;
  updatedAt: string;
};
🧱 Collection: categories (opcional pero recomendable)
type Category = {
  id: number;
  name: string;
  slug: string;
  icon?: Media;
  order: number;
};
📡 Endpoints
🔹 Todos los sitios
GET /api/sites?populate=*&sort=category:asc
🔹 Por categoría
GET /api/sites?filters[category][$eq]=beach&populate=*
🔹 Destacados
GET /api/sites?filters[isFeatured][$eq]=true
⚡ Estructura recomendada en frontend

Transforma data → UI así:

const grouped = groupBy(sites, "category");

👉 Resultado:

{
  beach: [...],
  restaurant: [...],
  accommodation: [...],
  service: [...]
}

👉 Eso alimenta los carruseles automáticamente.

🧠 Arquitectura UX (clave para tu proyecto)
🟢 Decisión importante:

NO hagas páginas separadas por categoría.

👉 Todo vive aquí + subpage dinámica.

🗺 Integración con mapa

Toggle tipo:

[ List view ] [ Map view ]

👉 En mobile:

mapa full screen

cards abajo tipo Airbnb

❤️ Favoritos (preview)

Cada card:

onClick → toggleFavorite(site.id)

Guardado:

localStorage.setItem("favorites", JSON.stringify([1, 4, 7]))
🔥 Oportunidades PRO

Recomendaciones inteligentes

“based on what you viewed”

Offline-first

cache completo de sitios

Modo “explorar cerca de mí”

usando geolocalización

⚠️ Errores a evitar

❌ Listas largas sin estructura
❌ Demasiados filtros complejos
❌ UI tipo tabla (mata el turismo)

🟢 Lo más importante

Esta página debe sentirse:

👉 Rápida
👉 Visual
👉 Intuitiva
👉 Agradable de scrollear

Si lo haces bien, la gente pasa minutos aquí sin darse cuenta.

👉 Siguiente paso

En el siguiente bloque armamos:

🔥 “Sobre nosotros”

Ahí vamos a construir:

identidad

storytelling humano

credibilidad del proyecto

Y después cerramos con:
👉 Favoritos (que conecta todo el sistema)
