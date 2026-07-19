import { describe, it, expect, vi } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));
import {
  transformCategory,
  transformListing,
  transformTeamMember,
  transformOrganization,
  transformSiteContent,
  transformHomepage,
  transformGuidePage,
  transformAboutPage,
  transformExperiencesPage,
  type StrapiItem,
  type CategoryAttributes,
  type ListingAttributes,
  type TeamMemberAttributes,
  type OrganizationAttributes,
  type SiteContentAttributes,
  type HomepageAttributes,
  type GuidePageAttributes,
  type AboutPageAttributes,
  type ExperiencesPageAttributes,
} from "../strapiTransformer";

describe("strapiTransformer", () => {
  describe("transformCategory", () => {
    it("transforms a v5 attributes-wrapped item", () => {
      const item: StrapiItem<CategoryAttributes> = {
        id: 1,
        attributes: {
          name: "Experiencias",
          slug: "experiences",
          color: "#E87A5D",
        },
      };
      const out = transformCategory(item);
      expect(out.id).toBe("1");
      expect(out.slug).toBe("experiences");
      expect(out.name.es).toBe("Experiencias");
      expect(out.name.en).toBe("Experiencias");
      expect(out.color).toBe("#E87A5D");
    });

    it("transforms a flattened item (Strapi v4-style fallback)", () => {
      const item = {
        id: 2,
        slug: "restaurants",
        name: "Restaurantes",
      } as any;
      const out = transformCategory(item);
      expect(out.slug).toBe("restaurants");
      expect(out.name.es).toBe("Restaurantes");
    });

    it("returns empty slots when name is undefined", () => {
      const item: StrapiItem<CategoryAttributes> = {
        id: 3,
        attributes: { slug: "x" } as any,
      };
      const out = transformCategory(item);
      expect(out.name.es).toBe("");
      expect(out.name.en).toBe("");
    });
  });

  describe("transformListing", () => {
    it("transforms a listing with media and category relation", () => {
      const item: StrapiItem<ListingAttributes> = {
        id: 10,
        attributes: {
          title: "Tour Isla Catalana",
          slug: "tour-isla-catalana",
          shortDescription: "Half-day tour with snorkeling.",
          description: "Long description...",
          mainImage: {
            id: 1,
            url: "/uploads/isla.jpg",
          },
          gallery: [
            { id: 2, url: "/uploads/a.jpg" },
            { id: 3, url: "/uploads/b.jpg" },
          ],
          price: "$60 USD",
          isFeatured: true,
          category: {
            data: {
              id: 1,
              attributes: { name: "Experiencias", slug: "experiences" },
            },
          },
          tags: [{ label_es: "Aventura", label_en: "" }, { label_es: "Mar", label_en: "" }],
          location: {
            geoPoint: { lat: 25.5, lng: -111.0 },
          },
        },
      };
      const out = transformListing(item, "es");
      expect(out.id).toBe("10");
      expect(out.slug).toBe("tour-isla-catalana");
      expect(out.name.es).toBe("Tour Isla Catalana");
      expect(out.name.en).toBe("Tour Isla Catalana");
      expect(out.shortDescription?.es).toBe("Half-day tour with snorkeling.");
      expect(out.categoryId).toBe("experiences");
      expect(out.category?.slug).toBe("experiences");
      expect(out.tags).toHaveLength(2);
      expect(out.tags?.[0].es).toBe("Aventura");
      expect(out.location?.lat).toBe(25.5);
      expect(out.location?.lng).toBe(-111.0);
      expect(out.image).toContain("/uploads/isla.jpg");
      expect(out.media?.mainImageUrl).toContain("/uploads/isla.jpg");
      expect(out.media?.galleryUrls).toHaveLength(2);
      expect(out.pricing?.price).toBe("$60 USD");
      expect(out.isFeatured).toBe(true);
      expect(out.href).toEqual({ es: expect.stringContaining("/sitios/"), en: expect.stringContaining("/en/sitios/") });
    });

    it("returns a listing with empty arrays when tags/gallery are missing", () => {
      const item: StrapiItem<ListingAttributes> = {
        id: 20,
        attributes: {
          title: "Test",
          slug: "test",
        },
      };
      const out = transformListing(item, "es");
      expect(out.tags).toEqual([]);
      expect(out.amenities).toEqual([]);
      // No media at all when both mainImage and gallery are absent
      expect(out.media).toBeUndefined();
      expect(out.media?.galleryUrls).toBeUndefined();
    });

    it("converts a richtext blocks array to plain text", () => {
      const blocks = [
        { type: "paragraph", children: [{ type: "text", text: "Hello " }] },
        { type: "paragraph", children: [{ type: "text", text: "World" }] },
      ];
      const item: StrapiItem<ListingAttributes> = {
        id: 30,
        attributes: { title: "X", slug: "x", description: blocks as any },
      };
      const out = transformListing(item, "es");
      expect(out.description?.es).toContain("Hello");
      expect(out.description?.es).toContain("World");
    });
  });

  describe("transformTeamMember", () => {
    it("transforms a team member with photo URL", () => {
      const item: StrapiItem<TeamMemberAttributes> = {
        id: 1,
        attributes: {
          name: "Juan Pérez",
          role: { text_es: "Coordinador", text_en: "Coordinator" },
          shortBio: { text_es: "Bio ES", text_en: "Bio EN" },
          photo: { id: 1, url: "/uploads/juan.jpg" },
          links: { email: "juan@example.com" },
          order: 1,
          isFeatured: true,
        },
      };
      const out = transformTeamMember(item);
      expect(out.id).toBe("1");
      expect(out.name).toBe("Juan Pérez");
      expect(out.role?.es).toBe("Coordinador");
      expect(out.photo).toContain("/uploads/juan.jpg");
      expect(out.links?.email).toBe("juan@example.com");
    });

    it("returns empty photo when none provided", () => {
      const item: StrapiItem<TeamMemberAttributes> = {
        id: 2,
        attributes: { name: "Ana" },
      };
      const out = transformTeamMember(item);
      expect(out.photo).toBeUndefined();
    });
  });

  describe("transformOrganization", () => {
    it("transforms an organization with logo", () => {
      const item: StrapiItem<OrganizationAttributes> = {
        id: 1,
        attributes: {
          name: "Cooperativa Agua Verde",
          type: "community",
          shortDescription: { text_es: "Cooperativa local", text_en: "Local cooperative" },
          logo: { id: 1, url: "/uploads/coop.png" },
          order: 1,
          isFeatured: true,
        },
      };
      const out = transformOrganization(item);
      expect(out.name).toBe("Cooperativa Agua Verde");
      expect(out.type).toBe("community");
      expect(out.logo).toContain("/uploads/coop.png");
    });
  });

  describe("transformSiteContent", () => {
    it("transforms a site-content entry with extraData JSON", () => {
      const item: StrapiItem<SiteContentAttributes> = {
        id: 1,
        documentId: "abc",
        attributes: {
          key: "about-values",
          title: "Nuestros valores",
          text: "",
          order: 1,
          extraData: { mission: { es: "M-ES", en: "M-EN" } },
        },
      };
      const out = transformSiteContent(item, "es");
      expect(out.id).toBe("1");
      expect(out.documentId).toBe("abc");
      expect(out.key).toBe("about-values");
      expect(out.title.es).toBe("Nuestros valores");
      expect((out.extraData as any).mission.es).toBe("M-ES");
    });
  });

  describe("transformHomepage", () => {
    it("transforms a full homepage with all sections", () => {
      const item: StrapiItem<HomepageAttributes> = {
        id: 1,
        attributes: {
          hero: {
            title: "Puerto Agua Verde &",
            titleHighlight: "Rancho San Cosme",
            description: "Un destino natural donde la tranquilidad...",
            ctaLabel: "Explorar el destino",
            ctaLink: "/sitios",
            images: [
              { id: 1, url: "/uploads/hero1.jpg", alternativeText: "Coast" },
              { id: 2, url: "/uploads/hero2.jpg", alternativeText: "Nature" },
            ],
          },
          destinationsHeader: {
            title: "Conoce el destino",
            subtitle: "Descubre la historia y cultura",
          },
          destinations: [
            {
              title: "Puerto Agua Verde",
              text: "Un pequeño rincón de BCS...",
              image: { id: 3, url: "/uploads/pav.jpg", alternativeText: "Puerto" },
            },
            {
              title: "Rancho San Cosme",
              text: "Un espacio histórico...",
              image: { id: 4, url: "/uploads/rancho.jpg", alternativeText: "Rancho" },
            },
          ],
          highlightsHeader: {
            title: "Lo más destacado",
            subtitle: "Descubre las mejores opciones",
          },
          highlights: [
            {
              title: "Experiencias",
              description: "Actividades únicas...",
              image: { id: 5, url: "/uploads/exp.jpg", alternativeText: "Experiences" },
              link: "/experiencias",
            },
          ],
          quickFactsHeader: {
            title: "Lo esencial",
            subtitle: "Datos rápidos",
          },
          quickFacts: [
            { title: "A 2h de Loreto", value: "98 km", description: "Trayecto aproximado de 2 horas." },
            { title: "Mejor época", value: "Mayo–junio", description: "Ventana para actividades." },
          ],
          quickFactsImage1: { id: 6, url: "/uploads/qf1.jpg", alternativeText: "QF1" },
          quickFactsImage2: { id: 7, url: "/uploads/qf2.jpg", alternativeText: "QF2" },
          mapSection: {
            title: "Mapa del Destino",
            description: "Explora los puntos clave...",
            buttonLabel: "Ver Mapa",
            buttonUrl: "https://osm.org/map",
            image: { id: 8, url: "/uploads/map.jpg", alternativeText: "Mapa" },
          },
          finalCta: {
            title: "Tu viaje comienza aquí",
            description: "Planea tu estancia...",
            buttonLabel: "Comenzar",
            buttonLink: "/sitios",
          },
        },
      };

      const out = transformHomepage(item, "es");

      // Hero
      expect(out.hero.title).toBe("Puerto Agua Verde &");
      expect(out.hero.titleHighlight).toBe("Rancho San Cosme");
      expect(out.hero.description).toContain("tranquilidad");
      expect(out.hero.ctaLabel).toBe("Explorar el destino");
      expect(out.hero.images).toHaveLength(2);
      expect(out.hero.images[0].url).toContain("/uploads/hero1.jpg");
      expect(out.hero.images[0].alt).toBe("Coast");

      // Destinations header
      expect(out.destinations.header.title).toBe("Conoce el destino");
      expect(out.destinations.items).toHaveLength(2);
      expect(out.destinations.items[0].title).toBe("Puerto Agua Verde");
      expect(out.destinations.items[0].image).toContain("/uploads/pav.jpg");

      // Highlights
      expect(out.highlights.header.title).toBe("Lo más destacado");
      expect(out.highlights.items[0].link).toBe("/experiencias");

      // QuickFacts
      expect(out.quickFacts.header.title).toBe("Lo esencial");
      expect(out.quickFacts.items).toHaveLength(2);
      expect(out.quickFacts.images).toHaveLength(2);
      expect(out.quickFacts.images[0]).toContain("/uploads/qf1.jpg");

      // Map
      expect(out.mapSection.title).toBe("Mapa del Destino");
      expect(out.mapSection.buttonUrl).toBe("https://osm.org/map");
      expect(out.mapSection.image).toContain("/uploads/map.jpg");

      // CTA
      expect(out.finalCta.title).toBe("Tu viaje comienza aquí");
      expect(out.finalCta.buttonLink).toBe("/sitios");
    });

    it("handles missing optional fields gracefully", () => {
      const item: StrapiItem<HomepageAttributes> = {
        id: 1,
        attributes: {},
      };

      const out = transformHomepage(item, "es");

      expect(out.hero.title).toBe("");
      expect(out.hero.images).toHaveLength(0);
      expect(out.destinations.items).toHaveLength(0);
      expect(out.highlights.items).toHaveLength(0);
      expect(out.quickFacts.items).toHaveLength(0);
      expect(out.quickFacts.images).toHaveLength(2);
      expect(out.mapSection.title).toBe("");
      expect(out.finalCta.title).toBe("");
    });

    it("handles flat (non-wrapped) item format from Strapi v5", () => {
      const item = {
        id: 1,
        hero: {
          title: "Test",
          titleHighlight: "Highlight",
          description: "Desc",
          ctaLabel: "CTA",
          ctaLink: "/link",
        },
        destinationsHeader: { title: "Header", subtitle: "Sub" },
        destinations: [],
        highlightsHeader: { title: "H", subtitle: "S" },
        highlights: [],
        quickFactsHeader: { title: "Q", subtitle: "S" },
        quickFacts: [],
        mapSection: { title: "Map", description: "D", buttonLabel: "Btn", buttonUrl: "#" },
        finalCta: { title: "CTA", description: "D", buttonLabel: "B", buttonLink: "#" },
      } as any;

      const out = transformHomepage(item, "es");

      expect(out.hero.title).toBe("Test");
      expect(out.hero.titleHighlight).toBe("Highlight");
      expect(out.destinations.header.title).toBe("Header");
    });
  });

  describe("transformGuidePage", () => {
    it("transforms a full guide page with all sections (ES locale)", () => {
      const item: StrapiItem<GuidePageAttributes> = {
        id: 1,
        attributes: {
          hero: {
            title: "Guía del Visitante",
            titleHighlight: "Planifica tu Viaje",
            description: "Todo lo que necesitas saber...",
            ctaLabel: "Explorar",
            ctaLink: "/experiencias",
            images: [{ id: 1, url: "/uploads/guide-hero.jpg" }],
          },
          intro: {
            ranchTitle: "Rancho San Cosme",
            ranchText: "Un espacio histórico...",
            portTitle: "Puerto Agua Verde",
            portText: "Un rincón costero...",
          },
          historyHeader: { title: "Historia", subtitle: "Cronología" },
          historyText: "Historia de la región...",
          historyMilestones: [
            { year: "1950", text: "Fundación del rancho" },
            { year: "1980", text: { es: "Primer turismo", en: "First tourism" } },
          ],
          fishingHeader: { title: "Pesca Deportiva", subtitle: "Reglamento" },
          fishingText: "Normas de pesca...",
          fishingRules: [
            { text: "Solo captura" },
            { text: "Talla mínima" },
          ],
          protectedArea: {
            title: "Área Protegida",
            text: "Parque Nacional Bahía de Loreto...",
            linkLabel: "Más información",
            linkHref: "https://example.com",
          },
          influenceHeader: { title: "Área de Influencia" },
          influenceText: "Comunidad local...",
          recommendationsHeader: { title: "Recomendaciones" },
          recommendations: [
            { text: "Llevar bloqueador" },
            { text: "Agua potable" },
          ],
          directionsHeader: { title: "Cómo Llegar" },
          directions: [
            { label: "Desde Loreto", description: "98 km al sur", distance: "98 km", time: "2 horas", image: { id: 1, url: "/uploads/loreto.jpg" } },
            { label: "Desde La Paz", description: "360 km al norte", distance: "360 km", time: "5 horas", image: { id: 2, url: "/uploads/lapaz.jpg" } },
          ],
          drivingTipsHeader: "Consejos de manejo",
          drivingTips: [{ text: "Carretera sin iluminación" }, { text: "Combustible antes de salir" }],
          amenitiesHeader: { title: "Servicios" },
          amenities: [
            { icon: "wifi", title: "WiFi", text: "Disponible en el pueblo" },
          ],
          touristMapHeader: { title: "Mapa Turístico" },
          touristMapImage: { id: 1, url: "/uploads/tourist-map.jpg" },
          touristMapCaption: "Mapa de la región",
          finalCta: {
            title: "Tu viaje comienza aquí",
            description: "Planea tu estancia...",
            buttonLabel: "Comenzar",
            buttonLink: "/sitios",
          },
        },
      };

      const out = transformGuidePage(item, "es");

      expect(out.hero?.title).toBe("Guía del Visitante");
      expect(out.hero?.desc).toContain("Todo lo que necesitas saber");
      expect(out.intro?.ranchTitle).toBe("Rancho San Cosme");
      expect(out.intro?.ranchText).toBe("Un espacio histórico...");
      expect(out.history?.title).toBe("Historia");
      expect(out.history?.text).toBe("Historia de la región...");
      expect(out.history?.milestones).toHaveLength(2);
      expect(out.history?.milestones[0].year).toBe("1950");
      expect(out.fishing?.rules).toHaveLength(2);
      expect(out.fishing?.rules[0]).toBe("Solo captura");
      expect(out.protected?.title).toBe("Área Protegida");
      expect(out.protected?.linkLabel).toBe("Más información");
      expect(out.directions?.loreto.label).toBe("Desde Loreto");
      expect(out.directions?.laPaz.distance).toBe("360 km");
      expect(out.directions?.drivingTips).toHaveLength(2);
      expect(out.amenities?.items[0].title).toBe("WiFi");
      expect(out.cta?.title).toBe("Tu viaje comienza aquí");
    });

    it("transforms guide page with EN locale", () => {
      const item: StrapiItem<GuidePageAttributes> = {
        id: 2,
        attributes: {
          hero: {
            title: "Visitor Guide",
            titleHighlight: "Plan Your Trip",
            description: "Everything you need to know...",
            ctaLabel: "Explore",
            ctaLink: "/en/experiences",
            images: [{ id: 1, url: "/uploads/guide-hero-en.jpg" }],
          },
          intro: {
            ranchTitle: "Rancho San Cosme",
            ranchText: "A historic ranch...",
            portTitle: "Puerto Agua Verde",
            portText: "A coastal corner...",
          },
          historyHeader: { title: "History" },
          historyText: "History of the region...",
          fishingHeader: { title: "Sport Fishing" },
          fishingText: "Fishing rules...",
          recommendationsHeader: { title: "Recommendations" },
          recommendations: [{ text: "Bring sunscreen" }],
        },
      };

      const out = transformGuidePage(item, "en");

      expect(out.hero?.title).toBe("Visitor Guide");
      expect(out.hero?.desc).toContain("Everything you need to know");
      expect(out.intro?.ranchTitle).toBe("Rancho San Cosme");
      expect(out.history?.title).toBe("History");
      expect(out.history?.text).toBe("History of the region...");
      expect(out.fishing?.title).toBe("Sport Fishing");
      expect(out.recommendations?.items[0]).toBe("Bring sunscreen");
    });

    it("handles richtext blocks arrays in guide page text fields", () => {
      const blocks = [
        { type: "paragraph", children: [{ type: "text", text: "Historia de la region." }] },
        { type: "paragraph", children: [{ type: "text", text: "Mas detalles aqui." }] },
      ];
      const item: StrapiItem<GuidePageAttributes> = {
        id: 3,
        attributes: {
          hero: { title: "Guide", ctaLabel: "Go", ctaLink: "/", images: [] },
          historyHeader: { title: "History" },
          historyText: blocks as any,
          fishingHeader: { title: "Fishing" },
          fishingText: blocks as any,
        },
      };

      const out = transformGuidePage(item, "es");

      expect(out.history?.text).toContain("Historia de la region");
      expect(out.history?.text).toContain("Mas detalles aqui");
      expect(out.fishing?.text).toContain("Historia de la region");
    });

    it("handles missing optional fields gracefully", () => {
      const item: StrapiItem<GuidePageAttributes> = {
        id: 4,
        attributes: {},
      };

      const out = transformGuidePage(item, "es");

      expect(out.hero?.title).toBe("");
      expect(out.intro).toBe(null);
      expect(out.history?.title).toBe("");
      expect(out.fishing?.title).toBe("");
      expect(out.protected).toBe(null);
      expect(out.amenities?.items).toEqual([]);
    });

    it("handles flat (non-wrapped) guide page format", () => {
      const item = {
        id: 5,
        hero: { title: "Flat Guide", ctaLabel: "Go", ctaLink: "/", images: [] },
        intro: { ranchTitle: "Ranch", ranchText: "Text", portTitle: "Port", portText: "Text" },
        historyHeader: { title: "Hist" },
        historyText: "Hist text",
      } as any;

      const out = transformGuidePage(item, "es");

      expect(out.hero?.title).toBe("Flat Guide");
      expect(out.intro?.ranchTitle).toBe("Ranch");
      expect(out.history?.title).toBe("Hist");
    });
  });

  describe("transformAboutPage", () => {
    it("transforms a full about page with all sections (ES locale)", () => {
      const item: StrapiItem<AboutPageAttributes> = {
        id: 1,
        attributes: {
          hero: {
            title: "Acerca de Nosotros",
            titleHighlight: "Comunidad",
            description: "Conoce nuestra historia...",
            ctaLabel: "Únete",
            ctaLink: "/comunidad",
            images: [{ id: 1, url: "/uploads/about-hero.jpg" }],
          },
          introTitle: "Nuestra Historia",
          introText: "Somos una comunidad...",
          values: {
            missionTitle: "Misión",
            missionText: "Proteger el entorno...",
            visionTitle: "Visión",
            visionText: "Un futuro sostenible...",
            valuesTitle: "Valores",
            valuesItems: ["Respeto", "Comunidad", "Naturaleza"],
          },
          communityTitle: "Mensaje de la Comunidad",
          communityText: " Juntos hacemos la diferencia...",
          collaboration: {
            title: "Colaboración",
            description: "Trabaja con nosotros...",
            primaryButtonLabel: "Contáctanos",
            primaryButtonLink: "/contacto",
            secondaryButtonLabel: "Ver más",
            secondaryButtonLink: "/acerca",
          },
          finalCta: {
            title: "Únete a Nosotros",
            description: "Sé parte de la comunidad...",
            buttonLabel: "Comenzar",
            buttonLink: "/comunidad",
          },
        },
      };

      const out = transformAboutPage(item, "es");

      expect(out.hero?.title).toBe("Acerca de Nosotros");
      expect(out.hero?.titleHighlight).toBe("Comunidad");
      expect(out.intro?.title).toBe("Nuestra Historia");
      expect(out.intro?.text).toBe("Somos una comunidad...");
      expect(out.values?.mission?.title).toBe("Misión");
      expect(out.values?.vision?.text).toBe("Un futuro sostenible...");
      expect(out.values?.values?.items).toEqual(["Respeto", "Comunidad", "Naturaleza"]);
      expect(out.community?.title).toBe("Mensaje de la Comunidad");
      expect(out.collaboration?.title).toBe("Colaboración");
      expect(out.collaboration?.btnPrimary).toBe("Contáctanos");
      expect(out.finalCta?.title).toBe("Únete a Nosotros");
    });

    it("transforms about page with EN locale", () => {
      const item: StrapiItem<AboutPageAttributes> = {
        id: 2,
        attributes: {
          hero: {
            title: "About Us",
            titleHighlight: "Community",
            description: "Learn our story...",
            ctaLabel: "Join",
            ctaLink: "/en/community",
            images: [],
          },
          introTitle: "Our History",
          introText: "We are a community...",
          values: {
            missionTitle: "Mission",
            missionText: "To protect the environment...",
            visionTitle: "Vision",
            visionText: "A sustainable future...",
            valuesTitle: "Values",
            valuesItems: ["Respect", "Community", "Nature"],
          },
          communityTitle: "Community Message",
          communityText: "Together we make a difference...",
        },
      };

      const out = transformAboutPage(item, "en");

      expect(out.hero?.title).toBe("About Us");
      expect(out.intro?.title).toBe("Our History");
      expect(out.values?.mission?.title).toBe("Mission");
      expect(out.values?.values?.items).toEqual(["Respect", "Community", "Nature"]);
    });

    it("handles richtext blocks in about page text fields", () => {
      const blocks = [
        { type: "paragraph", children: [{ type: "text", text: "Historia de la comunidad." }] },
      ];
      const item: StrapiItem<AboutPageAttributes> = {
        id: 3,
        attributes: {
          hero: { title: "About", ctaLabel: "Go", ctaLink: "/", images: [] },
          introTitle: "Intro",
          introText: blocks as any,
          values: {
            missionTitle: "Mission",
            missionText: blocks as any,
            visionTitle: "Vision",
            visionText: "Vision text",
            valuesTitle: "Values",
            valuesItems: ["One"],
          },
        },
      };

      const out = transformAboutPage(item, "es");

      expect(out.intro?.text).toContain("Historia de la comunidad");
      expect(out.values?.mission?.text).toContain("Historia de la comunidad");
    });

    it("handles missing optional fields gracefully", () => {
      const item: StrapiItem<AboutPageAttributes> = {
        id: 4,
        attributes: {},
      };

      const out = transformAboutPage(item, "es");

      expect(out.hero?.title).toBe("");
      expect(out.intro?.title).toBe("");
      expect(out.values?.mission?.title).toBe("");
      expect(out.community?.title).toBe("");
      expect(out.collaboration).toBe(null);
    });
  });

  describe("transformExperiencesPage", () => {
    it("transforms a full experiences page (ES locale)", () => {
      const item: StrapiItem<ExperiencesPageAttributes> = {
        id: 1,
        attributes: {
          hero: {
            title: "Experiencias",
            titleHighlight: "Aventuras",
            description: "Descubre actividades únicas...",
            ctaLabel: "Ver más",
            ctaLink: "/sitios",
            images: [
              { id: 1, url: "/uploads/exp-hero1.jpg" },
              { id: 2, url: "/uploads/exp-hero2.jpg" },
            ],
          },
          introHeader: { title: "Bienvenido", subtitle: "Elige tu aventura" },
          featuredHeader: { title: "Destacados", subtitle: "Los más populares" },
          finalCta: {
            title: "Planifica tu Viaje",
            description: "Todo lo que necesitas...",
            buttonLabel: "Comenzar",
            buttonLink: "/sitios",
          },
        },
      };

      const out = transformExperiencesPage(item, "es");

      expect(out.hero?.title).toBe("Experiencias");
      expect(out.hero?.titleHighlight).toBe("Aventuras");
      expect(out.hero?.description).toContain("Descubre actividades");
      expect(out.hero?.images).toHaveLength(2);
      expect(out.hero?.images[0].url).toContain("/uploads/exp-hero1.jpg");
      expect(out.introHeader?.title).toBe("Bienvenido");
      expect(out.introHeader?.subtitle).toBe("Elige tu aventura");
      expect(out.featuredHeader?.title).toBe("Destacados");
      expect(out.finalCta?.title).toBe("Planifica tu Viaje");
      expect(out.finalCta?.buttonLink).toBe("/sitios");
    });

    it("transforms experiences page with EN locale", () => {
      const item: StrapiItem<ExperiencesPageAttributes> = {
        id: 2,
        attributes: {
          hero: {
            title: "Experiences",
            titleHighlight: "Adventures",
            description: "Discover unique activities...",
            ctaLabel: "See more",
            ctaLink: "/en/sitios",
            images: [{ id: 1, url: "/uploads/exp-en.jpg" }],
          },
          introHeader: { title: "Welcome", subtitle: "Choose your adventure" },
          featuredHeader: { title: "Featured", subtitle: "Most popular" },
        },
      };

      const out = transformExperiencesPage(item, "en");

      expect(out.hero?.title).toBe("Experiences");
      expect(out.hero?.titleHighlight).toBe("Adventures");
      expect(out.introHeader?.title).toBe("Welcome");
      expect(out.featuredHeader?.subtitle).toBe("Most popular");
    });

    it("handles richtext blocks in hero description", () => {
      const blocks = [
        { type: "paragraph", children: [{ type: "text", text: "Rich text description." }] },
      ];
      const item: StrapiItem<ExperiencesPageAttributes> = {
        id: 3,
        attributes: {
          hero: {
            title: "Exp",
            titleHighlight: "Highlight",
            description: blocks as any,
            ctaLabel: "Go",
            ctaLink: "/",
            images: [],
          },
        },
      };

      const out = transformExperiencesPage(item, "es");

      expect(out.hero?.description).toContain("Rich text description");
    });

    it("handles missing optional fields gracefully", () => {
      const item: StrapiItem<ExperiencesPageAttributes> = {
        id: 4,
        attributes: {},
      };

      const out = transformExperiencesPage(item, "es");

      expect(out.hero?.title).toBe("");
      expect(out.hero?.images).toHaveLength(0);
      expect(out.introHeader).toBe(null);
      expect(out.featuredHeader).toBe(null);
      expect(out.finalCta).toBe(null);
    });

    it("handles flat (non-wrapped) experiences page format", () => {
      const item = {
        id: 5,
        hero: {
          title: "Flat Exp",
          titleHighlight: "Highlight",
          description: "Desc",
          ctaLabel: "Go",
          ctaLink: "/",
          images: [],
        },
        introHeader: { title: "Intro", subtitle: "Sub" },
      } as any;

      const out = transformExperiencesPage(item, "es");

      expect(out.hero?.title).toBe("Flat Exp");
      expect(out.introHeader?.title).toBe("Intro");
    });
  });
});
