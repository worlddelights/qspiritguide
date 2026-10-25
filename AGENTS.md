# Development Tools

- Use the ImageMagick `magick` CLI for image resizing, format conversion, and quality optimization when image manipulation is needed.

# Technology and Architecture

- Use Node.js 24 or newer and pnpm for dependency management and scripts.
- Build the browser-only frontend with Astro, TypeScript, and React. Deploy generated static assets to Cloudflare Pages.
- Keep Astro routes in `src/pages/`, reusable React components in `src/components/`, layouts in `src/layouts/`, styles in `src/styles/`, and static assets plus archetype prompts in `public/`.
- The app's AI inference and persisted conversation data stay in the browser. Do not add server-side authentication, APIs, analytics, or data storage without an explicit product decision.
- Configure the static build in `astro.config.mjs`. The GitHub Actions deployment workflow builds `dist/` and uploads it to Cloudflare Pages.
- Use `pnpm run dev`, `pnpm run build`, `pnpm run lint`, and `pnpm run format` for local development and validation.
