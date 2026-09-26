import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) =>
    locale === "en" ? `/en/${path.replace(/^\/+/, "")}` : `/${path.replace(/^\/+/, "")}`,
}));
vi.mock("astro:env", () => ({}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { getHomepageWithFallback, clearCmsCache } from "../cms";
import { transformHomepage } from "../../utils/strapiTransformer";

/** Contract §8: `homepage.regionMapImage`, with a mock placeholder until the designer delivers it. */

const PLACEHOLDER = "/images/guide/route-loreto.svg";

function strapiOk(data: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify({ data })),
    json: () => Promise.resolve({ data }),
  } as any;
}

beforeEach(() => {
  fetchMock.mockReset();
  clearCmsCache();
  (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
});

describe("homepage regionMapImage", () => {
  it("is requested in the homepage populate", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk({ id: 1 }));
    await getHomepageWithFallback("es");
    const query = decodeURIComponent(String(fetchMock.mock.calls[0][0]).split("?")[1] || "");
    expect(query).toContain("=regionMapImage");
  });

  it("maps the media URL and its alternative text", () => {
    const out = transformHomepage({
      id: 1,
      attributes: {
        regionMapImage: { id: 3, url: "/uploads/region.png", alternativeText: "Mapa de BCS" },
      } as any,
    });
    expect(out.regionMapImage).toContain("/uploads/region.png");
    expect(out.regionMapImageAlt).toBe("Mapa de BCS");
  });

  it("uses the CMS image when present", async () => {
    fetchMock.mockResolvedValueOnce(
      strapiOk({ id: 1, regionMapImage: { id: 3, url: "https://cdn.example.com/region.png" } }),
    );
    const data = await getHomepageWithFallback("es");
    expect(data.regionMapImage).toBe("https://cdn.example.com/region.png");
  });

  it("falls back to the mock placeholder in both locales", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk({ id: 1 }));
    expect((await getHomepageWithFallback("es")).regionMapImage).toBe(PLACEHOLDER);
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    expect((await getHomepageWithFallback("en")).regionMapImage).toBe(PLACEHOLDER);
  });
});
