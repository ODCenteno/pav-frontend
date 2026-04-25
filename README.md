# Puerto Agua Verde Community Directory / Directorio Comunitario Puerto Agua Verde

[English](#english) | [Español](#español)

---

<a name="english"></a>
## 🇺🇸 English Version

### 1. Project Overview
**Project Name:** Puerto Agua Verde Community Directory
**Type:** Progressive Web Application (PWA) - Offline-First
**Goal:** Provide a reliable, offline-accessible directory for services, shops, and points of interest in Puerto Agua Verde and Rancho San Cosme, Baja California Sur.

**Community Purpose:** This project is designed as a social initiative to boost the local economy and connectivity of the community of Puerto Agua Verde and Rancho San Cosme. By providing a digital presence for local businesses and services, we aim to empower the community in areas where connectivity is often intermittent.

### 2. Technical Architecture

#### 2.1 Core Stack
- **Frontend Framework:** [Astro.js](https://astro.build/) (v5+)
    - Utilizing "Islands Architecture" to ensure high performance and minimal JavaScript delivery, ideal for limited data connections.
- **Interactivity:** [React](https://react.dev/)
    - Used within Astro Islands for highly interactive features such as the Map, dynamic filters, and favorite management.
- **CMS (Content Management System):** [Strapi](https://strapi.io/) (Integration in progress)
    - Headless CMS to manage localized content, listings, and global site settings dynamically.
- **Styling:** Vanilla CSS
    - Focused on lightweight, maintainable styles without the overhead of heavy frameworks.
- **PWA & Offline-First:**
    - Service workers for caching assets and data, ensuring the directory remains functional without internet access.

#### 2.2 Key Features
- **Multi-language Support:** Complete i18n implementation (EN/ES).
- **Offline Mode:** Fully functional directory even in remote areas.
- **Local Favorites:** Browser-based storage for user bookmarks.
- **Dynamic Routing:** Locale-aware navigation system ready for CMS integration.

---

<a name="español"></a>
## 🇲🇽 Versión en Español

### 1. Descripción del Proyecto
**Nombre del Proyecto:** Directorio Comunitario Puerto Agua Verde
**Tipo:** Aplicación Web Progresiva (PWA) - Offline-First
**Objetivo:** Proporcionar un directorio confiable y accesible sin conexión para servicios, comercios y puntos de interés en Puerto Agua Verde y Rancho San Cosme, Baja California Sur.

**Propósito Comunitario:** Este proyecto es una iniciativa social que tiene como finalidad primordial **impulsar a la comunidad de Puerto Agua Verde y Rancho San Cosme**. Busca fortalecer la economía local y la conectividad, brindando una plataforma digital a negocios y servicios locales en una zona donde la conexión a internet suele ser intermitente.

### 2. Arquitectura Técnica

#### 2.1 Stack Principal
- **Framework Frontend:** [Astro.js](https://astro.build/) (v5+)
    - Implementación de "Arquitectura de Islas" para maximizar el rendimiento y minimizar el envío de JavaScript al cliente.
- **Interactividad:** [React](https://react.dev/)
    - Utilizado específicamente en islas de interactividad como el Mapa, filtros dinámicos y la gestión de favoritos.
- **CMS (Content Management System):** [Strapi](https://strapi.io/) (Integración en curso)
    - CMS Headless para gestionar de forma dinámica el contenido localizado, los sitios y la configuración global.
- **Estilos:** Vanilla CSS
    - Uso de CSS puro para mantener el sitio ligero y fácil de mantener.
- **PWA y Offline-First:**
    - Uso de Service Workers para el almacenamiento en caché de activos y datos, garantizando que el directorio sea útil incluso sin señal.

#### 2.2 Características Principales
- **Soporte Multi-idioma:** Implementación completa de i18n (ES/EN).
- **Modo Offline:** Directorio totalmente funcional en áreas remotas.
- **Favoritos Locales:** Sistema de guardado en el navegador para fácil acceso.
- **Navegación Dinámica:** Sistema de rutas centralizado y consciente del idioma, preparado para la integración con el CMS.
