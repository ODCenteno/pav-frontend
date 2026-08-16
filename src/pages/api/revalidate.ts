/**
 * Revalidate webhook.
 *
 * Strapi's lifecycle hooks POST here whenever content is published /
 * unpublished. This endpoint:
 *   1. Validates the shared `X-Webhook-Secret` header.
 *   2. Calls the Cloudflare Pages deploy hook URL to trigger a rebuild.
 *
 * The rebuild is what makes new CMS content visible on the production site,
 * because the production bundle is statically pre-rendered for every locale.
 * Without a rebuild, newly-published Strapi entries only show up after the
 * next deploy.
 *
 * Configure (GitHub repo → Settings → Secrets and variables → Actions):
 *   - REVALIDATE_WEBHOOK_SECRET  — shared with the Strapi webhook
 *   - CF_PAGES_DEPLOY_HOOK_URL   — deploy hook URL called to trigger a rebuild
 *
 * IMPORTANT: these values are read via `import.meta.env`, which Vite inlines
 * at BUILD time. They must be present as env vars on the `pnpm build` step
 * (see .github/workflows/deploy.yml); rotating a secret requires a redeploy
 * for the new value to reach the Worker bundle. When they are missing at
 * build, the whole webhook body is dead-code-eliminated and the endpoint
 * always answers 503.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

interface RevalidateResponse {
  ok: boolean;
  triggered: boolean;
  reason?: string;
  status?: number;
}

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.REVALIDATE_WEBHOOK_SECRET;
  const deployHookUrl = import.meta.env.CF_PAGES_DEPLOY_HOOK_URL;

  if (!secret || !deployHookUrl) {
    return Response.json(
      {
        ok: false,
        triggered: false,
        reason: 'revalidate env vars are not configured on the frontend',
      } satisfies RevalidateResponse,
      { status: 503 },
    );
  }

  const provided = request.headers.get('X-Webhook-Secret');
  if (provided !== secret) {
    return Response.json(
      {
        ok: false,
        triggered: false,
        reason: 'invalid webhook secret',
      } satisfies RevalidateResponse,
      { status: 401 },
    );
  }

  // Cloudflare's deploy hook endpoint is intentionally simple — it accepts any
  // POST and queues a new build. We forward nothing sensitive; the URL alone is
  // a long-lived secret configured in env, so it's safe to use directly.
  const cloudflareResponse = await fetch(deployHookUrl, { method: 'POST' }).catch((error) => {
    return { ok: false, status: 0, error } as unknown as Response;
  });

  const ok = (cloudflareResponse as Response).ok ?? false;
  const status =
    'status' in (cloudflareResponse as Response) ? (cloudflareResponse as Response).status : 0;

  return Response.json(
    {
      ok,
      triggered: ok,
      status,
    } satisfies RevalidateResponse,
    { status: ok ? 202 : 502 },
  );
};

// Other methods → 405
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
