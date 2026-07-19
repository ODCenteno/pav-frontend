/**
 * Smoke tests for the revalidate webhook endpoint.
 *
 * The endpoint validates the shared secret and calls the Cloudflare Pages
 * deploy hook. Behaviour is verified at the request-handling boundary so we
 * don't need a live deploy hook or a configured Strapi instance.
 */
import { describe, expect, it, beforeEach, vi } from 'vitest';

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
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
    vi.stubEnv('CF_PAGES_DEPLOY_HOOK_URL', 'https://api.cloudflare.com/deploy-hook');
    const { POST } = await import('../revalidate');
    const response = await POST({
      request: new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'X-Webhook-Secret': 'wrong-secret' },
      }),
    } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(401);
  });

  it('calls the deploy hook and returns 202 when secret matches', async () => {
    vi.stubEnv('REVALIDATE_WEBHOOK_SECRET', 'real-secret');
    vi.stubEnv('CF_PAGES_DEPLOY_HOOK_URL', 'https://api.cloudflare.com/deploy-hook');
    const fetchSpy = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
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
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.cloudflare.com/deploy-hook',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns 502 when the deploy hook itself fails', async () => {
    vi.stubEnv('REVALIDATE_WEBHOOK_SECRET', 'real-secret');
    vi.stubEnv('CF_PAGES_DEPLOY_HOOK_URL', 'https://api.cloudflare.com/deploy-hook');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));
    const { POST } = await import('../revalidate');
    const response = await POST({
      request: new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'X-Webhook-Secret': 'real-secret' },
      }),
    } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(502);
  });
});
