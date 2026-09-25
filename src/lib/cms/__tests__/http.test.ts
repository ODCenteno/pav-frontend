import { describe, it, expect, vi, beforeEach } from "vitest";

// Same mock style as src/lib/__tests__/cms.test.ts: stub astro:i18n (pulled
// in transitively via the transformer), stub astro:env, and mock global fetch.
vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

vi.mock("astro:env", () => ({}));

import {
  buildUrl,
  cachedFetch,
  clearCmsCache,
  CmsError,
  safe,
  strapiGet,
  strapiGetOne,
  toStrapiLocale,
} from "../http";
import * as cms from "../../cms";

function strapiOk<T>(data: T) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify({ data })),
    json: () => Promise.resolve({ data }),
  } as any;
}

function strapiNotFound() {
  return {
    ok: false,
    status: 404,
    statusText: "Not Found",
    text: () => Promise.resolve("not found"),
    json: () => Promise.resolve({}),
  } as any;
}

function strapiError(status: number = 500) {
  return {
    ok: false,
    status,
    statusText: "Server Error",
    text: () => Promise.resolve("oops"),
    json: () => Promise.resolve({}),
  } as any;
}

beforeEach(() => {
  fetchMock.mockReset();
  clearCmsCache();
});

describe("http helpers module surface", () => {
  it("exports the extracted HTTP client pieces", () => {
    expect(typeof buildUrl).toBe("function");
    expect(typeof cachedFetch).toBe("function");
    expect(typeof clearCmsCache).toBe("function");
    expect(typeof safe).toBe("function");
    expect(typeof strapiGet).toBe("function");
    expect(typeof strapiGetOne).toBe("function");
    expect(typeof toStrapiLocale).toBe("function");
    expect(typeof CmsError).toBe("function");
  });

  it("keeps the cms.ts public API re-exported from http.ts (same bindings)", () => {
    expect(cms.toStrapiLocale).toBe(toStrapiLocale);
    expect(cms.clearCmsCache).toBe(clearCmsCache);
    expect(cms.CmsError).toBe(CmsError);
  });
});

describe("toStrapiLocale", () => {
  it("maps Astro short codes to Strapi codes", () => {
    expect(toStrapiLocale("es")).toBe("es-MX");
    expect(toStrapiLocale("en")).toBe("en");
  });

  it("passes through full codes unchanged", () => {
    expect(toStrapiLocale("es-MX")).toBe("es-MX");
    expect(toStrapiLocale("en-US")).toBe("en-US");
  });
});

describe("buildUrl", () => {
  it("builds a URL under /api with the given params", () => {
    const url = buildUrl("/listings", { locale: "es-MX", sort: "order:asc" });
    expect(url).toContain("/api/listings");
    expect(url).toContain("locale=es-MX");
    expect(url).toContain("sort=order%3Aasc");
  });

  it("skips undefined and null params", () => {
    const url = buildUrl("/categories", { locale: undefined, sort: undefined as unknown as string });
    expect(url).not.toContain("locale=");
    expect(url).not.toContain("sort=");
  });
});

describe("strapiGet", () => {
  it("returns the parsed list payload on success", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk([{ id: 1, attributes: { slug: "a" } }]));
    const res = await strapiGet<{ slug: string }>("/listings");
    expect(res.data).toHaveLength(1);
    expect(res.data[0].attributes?.slug).toBe("a");
  });

  it("throws CmsError with the status on non-ok responses", async () => {
    fetchMock.mockResolvedValueOnce(strapiError(503));
    await expect(strapiGet("/listings")).rejects.toMatchObject({
      name: "CmsError",
      status: 503,
    });
  });

  it("always sends an Authorization header (empty when no token was captured at import)", async () => {
    // STRAPI_TOKEN is captured at module-import time (pre-existing behavior),
    // so runtime env mutation must not change the header.
    (import.meta.env as any).STRAPI_TOKEN = "tok";
    fetchMock.mockResolvedValueOnce(strapiOk([]));
    await strapiGet("/listings");
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("");
    delete (import.meta.env as any).STRAPI_TOKEN;
  });
});

describe("strapiGetOne", () => {
  it("returns null on 404", async () => {
    fetchMock.mockResolvedValueOnce(strapiNotFound());
    const item = await strapiGetOne("/guide-page", {});
    expect(item).toBeNull();
  });

  it("returns null when data is null or an empty array", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      text: () => Promise.resolve(""),
      json: () => Promise.resolve({ data: null }),
    } as any);
    expect(await strapiGetOne("/homepage", {})).toBeNull();

    fetchMock.mockResolvedValueOnce(strapiOk([]));
    expect(await strapiGetOne("/homepage", {})).toBeNull();
  });

  it("returns the first item for list-shaped responses", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk([{ id: 7, attributes: { slug: "x" } }]));
    const item = await strapiGetOne<{ slug: string }>("/site-contents", {});
    expect(item?.attributes?.slug).toBe("x");
  });
});

describe("cachedFetch", () => {
  it("caches a successful result within the TTL", async () => {
    fetchMock.mockResolvedValue(strapiOk([{ id: 1 }]));
    await strapiGet("/listings", { locale: "es-MX" });
    await strapiGet("/listings", { locale: "es-MX" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats different params as different cache keys", async () => {
    fetchMock.mockResolvedValue(strapiOk([]));
    await strapiGet("/listings", { locale: "es-MX" });
    await strapiGet("/listings", { locale: "en" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("clearCmsCache forces a fresh fetch", async () => {
    fetchMock.mockResolvedValue(strapiOk([]));
    await strapiGet("/listings", { locale: "es-MX" });
    clearCmsCache();
    await strapiGet("/listings", { locale: "es-MX" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache rejected requests", async () => {
    fetchMock.mockResolvedValueOnce(strapiError());
    await expect(strapiGet("/listings")).rejects.toBeInstanceOf(CmsError);
    fetchMock.mockResolvedValueOnce(strapiOk([]));
    await expect(strapiGet("/listings")).resolves.toBeTruthy();
  });
});

describe("safe", () => {
  it("returns the value when the fn resolves", async () => {
    await expect(safe(async () => 42)).resolves.toBe(42);
  });

  it("returns null and warns when the fn rejects", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(safe(async () => { throw new CmsError("boom", 500); })).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("CmsError", () => {
  it("carries name, message and status", () => {
    const err = new CmsError("boom", 404);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("CmsError");
    expect(err.message).toBe("boom");
    expect(err.status).toBe(404);
  });
});
