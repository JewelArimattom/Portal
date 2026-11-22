export function getPublicSiteOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredOrigin) {
    try {
      const url = new URL(configuredOrigin);
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.origin;
    } catch {
      // Fall through to the platform-provided origin in preview or local environments.
    }
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) return `https://${vercelHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}
