interface ImportMetaEnv {
  readonly STRAPI_URL: string;
  readonly STRAPI_TOKEN?: string;
  readonly STRAPI_USE_DEV_FALLBACK?: string;
  readonly REVALIDATE_WEBHOOK_SECRET?: string;
  readonly REVALIDATE_GITHUB_TOKEN?: string;
  readonly REVALIDATE_REPO?: string;
}
