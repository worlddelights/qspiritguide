# Development Tools

- Use the ImageMagick `magick` CLI for image resizing, format conversion, and quality optimization when image manipulation is needed.

# Technology and Architecture

- Use Node.js 22.12.0 or newer and pnpm for dependency management and scripts.
- Build the frontend with Astro and TypeScript; deploy it to Cloudflare Pages.
- Implement serverless APIs in `functions/` as Cloudflare Workers. Store persistent data in Cloudflare D1 and sessions or temporary data in Cloudflare KV.
- Protect sensitive flows with Cloudflare Turnstile and validate tokens server-side.
- Keep Astro routes in `src/pages/`, reusable components in `src/components/`, layouts in `src/layouts/`, and shared environment bindings in `src/env.d.ts`.
- Configure Astro in `astro.config.mjs`, Cloudflare resources in `wrangler.toml`, and D1 schema changes in `migrations/`.
- Use `pnpm run dev`, `pnpm run build`, `pnpm run workers:dev`, and `pnpm run workers:deploy` for local development, builds, and Worker deployment.
