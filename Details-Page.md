# Pasos para la implementación

1. **Internacionalización (i18n):** Agregar el objeto `siteDetailPage` (descrito en la sección 5) a `src/i18n/es.json` y `src/i18n/en.json` para dar soporte multilingüe a la plantilla.
2. **Actualización de Modelos (TypeScript):** Definir o extender las interfaces en `src/types/` (ej. `listing.type.ts`) para incluir los nuevos campos del "Contrato de Datos": galería, coordenadas, recomendaciones y descripción larga.
3. **Enriquecimiento de Datos:** Actualizar `src/data/categoryData.js` con información mock detallada para al menos 3 sitios, permitiendo probar la renderización de todos los nuevos bloques.
4. **Desarrollo de Componentes Atómicos:** 
   - Crear componentes Astro en `src/components/site-detail/` para las partes estáticas (`SiteHero`, `SiteSummary`, `SiteInfoPanel`).
   - Crear componentes React hidratados para la interactividad (`SiteGallery`, `SiteMap`, `FavoriteButton`, `StickyActionBar`).
5. **Implementación de Rutas Dinámicas:** Crear el archivo `src/pages/[lang]/sitios/[slug].astro` que utilice `getStaticPaths` para generar las páginas de detalle de forma estática (SSG).
6. **Lógica de Persistencia Local:** Implementar el sistema de Favoritos utilizando `localStorage` para garantizar el funcionamiento offline-first.
7. **Ajustes de UX y Estilos:** Implementar la barra de acciones "sticky" para dispositivos móviles y asegurar que el diseño sea fluido siguiendo los tokens de `globals.css`.

---

# Página dinámica de detalle de sitio
## 1) Objetivo de la página

Cada sitio debe responder rápido estas preguntas:

- ¿Qué es este lugar?
- ¿Por qué vale la pena visitarlo?
- ¿Dónde está?
- ¿Qué ofrece?
- ¿Cómo contacto o llego?
- ¿Qué otros lugares parecidos puedo explorar?
La sensación debe ser mezcla de:

- Airbnb listing
- Google Maps place detail
- guía de viaje editorial ligera

No debe sentirse como ficha técnica seca, pero tampoco como blog largo.

## 2) Estructura ideal de la UI
Orden de bloques

Hero visual

Resumen rápido

Descripción

Galería / highlights

Información útil

Mapa / ubicación

Acciones de contacto

Relacionados

CTA final

## 3) Wireframe propuesto
Desktop
```md
┌──────────────────────────────────────────────────────────────┐
│ Header / breadcrumb                                         │
├──────────────────────────────────────────────────────────────┤
│ HERO IMAGE / GALLERY                                        │
│ [imagen principal grande]         [♥ favorito] [share]      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬───────────────────────┐
│ Título del sitio                     │ Quick actions         │
│ Categoría · ubicación                │ [Cómo llegar]         │
│ Tags principales                     │ [WhatsApp]            │
│ Descripción corta                    │ [Guardar]             │
└──────────────────────────────────────┴───────────────────────┘

┌──────────────────────────────────────┬───────────────────────┐
│ Sobre este lugar                     │ Información útil      │
│ Texto largo / narrativa              │ Horario              │
│                                      │ Precio / rango       │
│                                      │ Servicios / amenidades│
│                                      │ Contacto             │
└──────────────────────────────────────┴───────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Gallery / highlights                                        │
│ [img] [img] [img] [img]                                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬───────────────────────┐
│ Mapa                                 │ Tips para visitar     │
│ [map]                                │ Mejor hora            │
│                                      │ Recomendaciones       │
└──────────────────────────────────────┴───────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Related places                                              │
│ [card] [card] [card]                                        │
└──────────────────────────────────────────────────────────────┘
```
Mobile
```md
[Hero image]
[♥] [share]

Título
Categoría · ubicación
Tags
Descripción corta

[Botones sticky]
[Cómo llegar] [Contactar] [Guardar]

Sobre este lugar
Texto

Información útil
- horario
- amenidades
- precio
- contacto

Galería horizontal

Mapa

Lugares relacionados
[cards scroll horizontal]
```
## 4) Principios UX clave
### A. CTA sticky en mobile

En móvil conviene una barra fija inferior con 2 o 3 acciones máximas:

Cómo llegar

Contactar

Guardar

Eso sube muchísimo la utilidad real.

### B. Hero limpio

No satures arriba con demasiados datos.
Primero emoción visual, luego utilidad.

### C. Información escaneable

La descripción puede ser cálida, pero lo práctico debe verse rápido:

ubicación

horarios

contacto

servicios

categorías

accesibilidad

conectividad

### D. Relacionados inteligentes

No solo “más de la misma categoría”; combina:

misma categoría

misma zona

experiencias complementarias

Ejemplo:
si es una playa, relacionados podrían incluir restaurante cercano y hospedaje cercano.

## 5) Secciones y copy base

Te propongo copy estructural para la plantilla, no para un sitio específico todavía.

EN – copy estructural
```json
"siteDetailPage": {
  "breadcrumb": {
    "home": "Home",
    "sites": "Points of Interest"
  },
  "actions": {
    "directions": "Get directions",
    "contact": "Contact",
    "favorite": "Save",
    "favoriteActive": "Saved",
    "share": "Share"
  },
  "labels": {
    "about": "About this place",
    "gallery": "Gallery",
    "info": "Useful information",
    "location": "Location",
    "hours": "Hours",
    "price": "Price range",
    "amenities": "Amenities",
    "contact": "Contact",
    "tips": "Good to know",
    "related": "You may also like"
  },
  "map": {
    "open": "Open in map"
  },
  "empty": {
    "description": "More information about this place will be available soon.",
    "gallery": "Images coming soon.",
    "related": "No related places available at the moment."
  },
  "cta": {
    "title": "Keep exploring the destination",
    "desc": "Discover more places, experiences, and services in Puerto Agua Verde and Rancho San Cosme.",
    "btn": "Explore more places"
  }
}
```
ES – copy estructural
```json
"siteDetailPage": {
  "breadcrumb": {
    "home": "Inicio",
    "sites": "Sitios de interés"
  },
  "actions": {
    "directions": "Cómo llegar",
    "contact": "Contactar",
    "favorite": "Guardar",
    "favoriteActive": "Guardado",
    "share": "Compartir"
  },
  "labels": {
    "about": "Sobre este lugar",
    "gallery": "Galería",
    "info": "Información útil",
    "location": "Ubicación",
    "hours": "Horario",
    "price": "Rango de precio",
    "amenities": "Amenidades",
    "contact": "Contacto",
    "tips": "Información importante",
    "related": "También te puede interesar"
  },
  "map": {
    "open": "Abrir en el mapa"
  },
  "empty": {
    "description": "Pronto estará disponible más información sobre este lugar.",
    "gallery": "Imágenes disponibles próximamente.",
    "related": "Por ahora no hay lugares relacionados."
  },
  "cta": {
    "title": "Sigue explorando el destino",
    "desc": "Descubre más lugares, experiencias y servicios en Puerto Agua Verde y Rancho San Cosme.",
    "btn": "Explorar más lugares"
  }
}
```
## 6) Propuesta de tono del copy

La voz para cada sitio debe seguir esta fórmula:

Fórmula de redacción

60% informativo

30% evocador

10% promocional

Queremos evitar frases vacías como:

“el mejor lugar”

“maravilloso destino”

“experiencia inigualable”

Mejor usar:

qué se ve

qué se siente

qué se puede hacer

por qué es útil saberlo

Ejemplo de estilo bueno

Ubicado entre mar, sierra y desierto, este sitio ofrece una experiencia tranquila para quienes buscan paisaje, descanso y conexión con el entorno local.

Ejemplo menos recomendable

Un lugar mágico e inolvidable que te encantará desde el primer momento.

## 7) Estrategia de programación en Astro

Aquí es donde se alinea con lo que ya habíamos definido: Astro híbrido + React hidratado solo donde aporta valor.

Routing recomendado
`src/pages/sites/[slug].astro`
Cada sitio vive en su ruta dinámica:
`/sites/laguna-azul`
`/sites/cascada-del-sol`
`/sites/playa-arbolito`
`/sites/restaurante-la-costa`
`/sites/campamento-san-cosme`

Estrategia de render 
Parte estática con Astro

Renderizar desde servidor o build:

hero

título

descripción

info general

galería

metadata SEO

relacionados iniciales

Eso ayuda a:

SEO

rendimiento

HTML listo

mejor indexación

Parte interactiva con React hidratado

Hidratar solo componentes como:

botón de favoritos

share

galería con lightbox

mapa interactivo

carrusel de relacionados

CTA sticky mobile

Ejemplo:
```astro
<FavoriteButton client:load siteId={site.id} />
<RelatedCarousel client:visible items={relatedSites} />
<MapCard client:visible coordinates={site.location} />
```

Recomendación de hidratación

client:load para favoritos

client:visible para mapa y relacionados

client:idle para cosas no críticas

Data fetching
Opción ideal

En build o SSR:
```ts
const site = await getSiteBySlug(Astro.params.slug)
```
Y para relacionados:
```ts
const relatedSites = await getRelatedSites(site.id)
```
## 8) Estructura de componentes

Una forma limpia:
```md
/components/site-detail/
  SiteHero.astro
  SiteSummary.astro
  SiteInfoPanel.astro
  SiteGallery.tsx
  SiteMap.tsx
  SiteTips.astro
  RelatedSitesCarousel.tsx
  StickyActionBar.tsx
  FavoriteButton.tsx
```
Ejemplo de composición:
```astro
<BaseLayout title={seoTitle} description={seoDescription}>
  <SiteHero site={site} />
  <SiteSummary site={site} />
  <SiteInfoPanel site={site} />
  <SiteGallery client:visible images={site.gallery} />
  <SiteMap client:visible location={site.location} />
  <RelatedSitesCarousel client:visible items={relatedSites} />
  <StickyActionBar client:load site={site} />
</BaseLayout>
```
## 9) Contrato de datos desde Strapi

Aquí sí conviene diseñarlo bien desde ahorita para que no se quede corto.

Collection sites
```ts
type SiteDetail = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;

  category: "beach" | "restaurant" | "accommodation" | "service" | "landmark";
  subcategory?: string;

  shortDescription: string;
  description: string;

  coverImage: Media;
  gallery: Media[];

  tags: string[];

  destination: "puerto-agua-verde" | "rancho-san-cosme" | "both";

  location: {
    name: string;
    address?: string;
    lat: number;
    lng: number;
    googleMapsUrl?: string;
    openStreetMapUrl?: string;
  };

  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };

  schedule?: {
    isAlwaysOpen?: boolean;
    text?: string;
  };

  amenities?: string[];

  priceRange?: 1 | 2 | 3 | 4;

  recommendations?: {
    bestTimeToVisit?: string;
    whatToBring?: string[];
    accessibilityNotes?: string;
    connectivityNotes?: string;
  };

  featured: boolean;
  popular: boolean;

  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: Media;
  };

  relatedSites?: Array<{
    id: number;
    name: string;
    slug: string;
    category: string;
    coverImage?: Media;
    shortDescription?: string;
  }>;

  updatedAt: string;
  publishedAt: string;
};
```

Endpoint sugerido

```
GET /api/sites?filters[slug][$eq]=playa-el-ejemplo&populate=deep
```

O mejor aún, controlando el backend, una capa propia:

```md
GET /api/site-detail/:slug
```
Que devuelva exactamente el shape que necesitamos, incluyendo relacionados ya filtrados y ordenados.

## 10) Tipos derivados en frontend

Para no depender crudo del shape de Strapi, conviene mapear.

```ts
type SiteDetailViewModel = {
  id: number;
  name: string;
  slug: string;
  categoryLabel: string;
  shortDescription: string;
  description: string;
  heroImage: ImageAsset | null;
  gallery: ImageAsset[];
  tags: string[];
  destinationLabel: string;
  locationName: string;
  coordinates: { lat: number; lng: number } | null;
  mapUrl: string | null;
  contactActions: {
    whatsapp?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  scheduleText?: string;
  amenities: string[];
  priceRange?: number;
  tips: {
    bestTimeToVisit?: string;
    whatToBring: string[];
    accessibilityNotes?: string;
    connectivityNotes?: string;
  };
  related: RelatedSiteCard[];
  seo: {
    title: string;
    description: string;
    image?: string;
  };
};

```
11) SEO de la página dinámica

Esta página puede posicionar muy bien.
Cada detalle debe generar metadata individual.

Title sugerido
{Nombre del sitio} | Puerto Agua Verde y Rancho San Cosme
Meta description
Descubre {nombre del sitio} en {destino}. Información útil, ubicación, contacto y recomendaciones para planear tu visita.
Schema opcional

Dependiendo del tipo:

TouristAttraction

Restaurant

LodgingBusiness

LocalBusiness

Eso ayuda mucho a rich results.

12) Favoritos en esta página

El botón de favoritos vive aquí y debe ser inmediato.

UI recomendada

icono corazón

estado persistente

feedback visual claro

sin login obligatorio, al menos al inicio

Estado

no guardado

guardado

Mensaje

“Guardado en favoritos”

“Eliminado de favoritos”

13) Modelo recomendado para favoritos

Por la arquitectura actual del sitio, yo recomiendo dos capas.

Etapa 1: sin sesión

Guardar localmente en el navegador.

type FavoriteItem = {
  id: number;
  slug: string;
  name: string;
  category: string;
  coverImage?: string;
  savedAt: string;
};

Persistencia:

localStorage

opcionalmente IndexedDB si quieres enriquecer offline

Ventajas

fácil

rápido

offline-friendly

sin fricción

Etapa 2: con usuario autenticado

Sincronizar favoritos a backend cuando haya login.

Estrategia híbrida

leer favoritos locales

si el usuario inicia sesión, sincronizar

mantener copia local para offline

Para este proyecto, empezaría con localStorage y diseño preparado para migrar.

14) Lógica sugerida para favoritos
const STORAGE_KEY = "pwa_favorites";

type FavoriteId = number[];

function getFavorites(): number[] { ... }
function toggleFavorite(id: number): number[] { ... }
function isFavorite(id: number): boolean { ... }

Si luego quieres más detalle:

const STORAGE_KEY = "pwa_favorite_sites";

y guardas objetos resumidos, no solo ids.

Yo prefiero guardar objeto mínimo, porque la vista de Favoritos puede renderizar aun sin refetch inmediato.

15) Recomendación de arquitectura offline-first

Como este proyecto quiere funcionar bien en contexto turístico y conectividad variable, la página dinámica debería tener:

Cache de:

último detalle visitado

imágenes optimizadas

favoritos

relacionados mínimos

Estrategia

HTML estático base

assets cacheados con service worker

favoritos locales

mapa con fallback si no carga interactivo

Fallback de mapa

Si no hay conectividad:

mostrar imagen estática / coordenadas / link cuando vuelva la conexión

16) Qué campos sí o sí debe tener cada sitio en CMS

Para que la página se sienta completa, mínimo:

nombre

slug

categoría

descripción corta

descripción larga

portada

ubicación

al menos una forma de contacto o cómo llegar

tags

destino

relacionados

Muy recomendables:

horario

amenidades

recomendaciones

galería

SEO fields

17) Versión mínima viable de la plantilla

Si quieres arrancar rápido, MVP:

hero

título + short description

descripción

info útil

mapa

contacto

relacionados

favorito

Y luego agregas:

galería avanzada

share

reviews

recomendaciones personalizadas

18) Resumen ejecutivo de la propuesta
La página dinámica debe ser:

visual arriba

práctica en medio

exploratoria al final

En Astro:

contenido principal renderizado estáticamente

interacción mínima hidratada con React

En Strapi:

un modelo de sites suficientemente rico

relacionados y SEO incluidos

En favoritos:

empezar local-first

preparado para sync futuro

19) Siguiente entregable recomendado

Ya con esto, el siguiente paso ideal sería bajar esta propuesta a algo más operativo:

estructura de carpetas real en Astro

interfaces TypeScript finales

ejemplo de src/pages/sites/[slug].astro

ejemplo de schema en Strapi

JSON i18n completo para esta plantilla

Ese siguiente paso ya sería casi blueprint de implementación.
