# Supabase email links

## Vercel

In Vercel Project Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL` for Production to the site's canonical origin, including `https://` and without a trailing path. For this deployment, use:

```text
https://portal-pi-wine.vercel.app
```

Redeploy after changing the variable. Preview deployments can use Vercel's `VERCEL_URL` fallback; add the preview host pattern to Supabase's redirect allow list if preview email links are needed.

## Supabase

In Authentication → URL Configuration:

1. Set **Site URL** to `https://portal-pi-wine.vercel.app`.
2. Add `https://portal-pi-wine.vercel.app/auth/callback*` to **Redirect URLs**.
3. If local testing is needed, add `http://localhost:3000/auth/callback*` as a separate redirect URL.
4. In the confirmation email template, keep the link pointed at `{{ .ConfirmationURL }}` so Supabase applies the requested redirect after verification.

Signup and password-reset links return through `/auth/callback`. Invalid or expired links are sent to the app's confirmation page with a clear recovery path.
