/**
 * Revalidate webhook.
 *
 * Strapi's lifecycle hooks POST here whenever content is published /
 * unpublished. This endpoint:
 *   1. Validates the shared `X-Webhook-Secret` header.
 *   2. Fires a GitHub `repository_dispatch` event, which triggers the
 *      Deploy workflow (.github/workflows/deploy.yml) to rebuild and
 *      redeploy the site.
 *
 * The rebuild is what makes new CMS content visible on the production site,
 * because the production bundle is statically pre-rendered for every locale.
 * Without a rebuild, newly-published Strapi entries only show up after the
 * next deploy.
 *
 * Why repository_dispatch and not a Cloudflare Pages deploy hook: production
 * deploys go to Cloudflare WORKERS via `wrangler deploy` in GitHub Actions.
 * A Pages deploy hook cannot trigger a wrangler Workers deploy — they are
 * different products. Dispatching back into the GitHub workflow that owns
 * the deploy keeps a single deployment path.
 *
 * Configure (GitHub repo → Settings → Secrets and variables → Actions):
 *   - REVALIDATE_WEBHOOK_SECRET  — shared with the Strapi webhook
 *   - REVALIDATE_GITHUB_TOKEN    — fine-grained PAT, Contents: write, scoped
 *                                  to this repository only (minimum
 *                                  credential able to send repository_dispatch)
 *   - REVALIDATE_REPO (optional) — "owner/repo"; defaults to ODCenteno/pav-frontend
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

const DEFAULT_REPO = 'ODCenteno/pav-frontend';
const DISPATCH_EVENT_TYPE = 'cms-revalidate';

interface RevalidateResponse {
  ok: boolean;
  triggered: boolean;
  reason?: string;
  status?: number;
}

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.REVALIDATE_WEBHOOK_SECRET;
  const githubToken = import.meta.env.REVALIDATE_GITHUB_TOKEN;

  if (!secret || !githubToken) {
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

  const repo = import.meta.env.REVALIDATE_REPO || DEFAULT_REPO;

  // GitHub answers 204 No Content on success. The PAT is inlined into the
  // Worker bundle at build time, so scope it to this single repository and
  // rotate it if the bundle is ever exposed.
  const githubResponse = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'pav-frontend-revalidate',
    },
    body: JSON.stringify({ event_type: DISPATCH_EVENT_TYPE }),
  }).catch((error) => {
    return { ok: false, status: 0, error } as unknown as Response;
  });

  const ok = (githubResponse as Response).ok ?? false;
  const status =
    'status' in (githubResponse as Response) ? (githubResponse as Response).status : 0;

  return Response.json(
    {
      ok,
      triggered: ok,
      status,
      ...(ok ? {} : { reason: 'github repository_dispatch failed' }),
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
