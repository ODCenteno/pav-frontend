# Puerto Agua Verde Community Directory - PWA Project

## 1. Project Overview
**Project Name:** Puerto Agua Verde Community Directory
**Type:** Progressive Web Application (PWA) - Offline-First
**Goal:** Provide a reliable, offline-accessible directory for services, shops, and points of interest in Puerto Agua Verde and Rancho San Cosme, areas with intermittent connectivity.

## 2. Technical Architecture

### 2.1 Core Stack
- **Frontend Framework:** [Astro.js](https://astro.build/) (v5+)
    - Selected for its "Islands Architecture" to minimize client-side JavaScript and maximize performance on low-end devices.
    - Handles static generation (SSG) for listings and App Shell.
- **Interactivity:** [React](https://react.dev/)
    - Used strictly within Astro Islands for dynamic components: Interactive Map, Search/Filter Widget, and PDF Generation.
- **CMS (Content Management System):** [Directus](https://directus.io/)
    - Self-hosted Headless CMS.
    - User-friendly interface for non-technical editors.
- **Maps:** [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
    - Lightweight mapping library.
    - Custom implementation for offline tile caching.

