/**
 * Smoke tests for the revalidate webhook endpoint.
 *
 * The endpoint validates the shared secret and fires a GitHub
 * repository_dispatch event that triggers the Deploy workflow. Behaviour is
 * verified at the request-handling boundary so we don't need a live GitHub
 * token or a configured Strapi instance.
 */
import { describe, expect, it, beforeEach, vi } from 'vitest';

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns 503 when env vars are missing', async () => {
    const { POST } = await import('../revalidate');
    const response = await POST({
      request: new Request('http://localhost/api/revalidate', { method: 'POST' }),
    } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(503);
  });

  it('returns 401 when secret does not match', async () => {
    vi.stubEnv('REVALIDATE_WEBHOOK_SECRET', 'real-secret');
    vi.stubEnv('REVALIDATE_GITHUB_TOKEN', 'gh-token');
    const { POST } = await import('../revalidate');
    const response = await POST({
      request: new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'X-Webhook-Secret': 'wrong-secret' },
      }),
    } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(401);
  });

  it('fires a repository_dispatch and returns 202 when secret matches', async () => {
    vi.stubEnv('REVALIDATE_WEBHOOK_SECRET', 'real-secret');
    vi.stubEnv('REVALIDATE_GITHUB_TOKEN', 'gh-token');
    // GitHub answers 204 No Content on a successful dispatch.
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchSpy);
    const { POST } = await import('../revalidate');
    const response = await POST({
      request: new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'X-Webhook-Secret': 'real-secret' },
      }),
    } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(202);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.github.com/repos/ODCenteno/pav-frontend/dispatches');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer gh-token');
    expect(JSON.parse(init.body as string)).toEqual({ event_type: 'cms-revalidate' });
  });

  it('returns 502 when the GitHub dispatch fails', async () => {
    vi.stubEnv('REVALIDATE_WEBHOOK_SECRET', 'real-secret');
    vi.stubEnv('REVALIDATE_GITHUB_TOKEN', 'gh-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));
    const { POST } = await import('../revalidate');
    const response = await POST({
      request: new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'X-Webhook-Secret': 'real-secret' },
      }),
    } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(502);
    const body = (await response.json()) as { ok: boolean; triggered: boolean; reason?: string };
    expect(body.ok).toBe(false);
    expect(body.reason).toBe('github repository_dispatch failed');
  });

  it('honours REVALIDATE_REPO override', async () => {
    vi.stubEnv('REVALIDATE_WEBHOOK_SECRET', 'real-secret');
    vi.stubEnv('REVALIDATE_GITHUB_TOKEN', 'gh-token');
    vi.stubEnv('REVALIDATE_REPO', 'someone/another-repo');
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchSpy);
    const { POST } = await import('../revalidate');
    await POST({
      request: new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'X-Webhook-Secret': 'real-secret' },
      }),
    } as Parameters<typeof POST>[0]);
    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.github.com/repos/someone/another-repo/dispatches');
  });
});
