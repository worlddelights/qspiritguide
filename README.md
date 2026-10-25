# qSpirit Guide

## Branding Concept

Combining **Entanglement** (connection) with **Multiverse Navigation** (choice) and **Consciousness Expansion** (growth), you create a brand that feels both comforting and intellectually vast.

### The Hook

**Navigate the Multiverse. Expand your Essence.**

### The Mission Statement

Facilitate the expansion of consciousness through the lens of quantum entanglement. Our mission is to provide the navigational tools and high-frequency teachings necessary to traverse the infinite paths of the multiverse—assuring every soul that they are eternally connected to Source and perfectly positioned for their next leap in evolution.

### Why this works

* **The "Navigator" Role:** By using the word "traverse," you position yourself as a **Guide** rather than just a teacher. It implies you have the "map" to the multiverse.
* **The "Quantum" Justification:** "High-frequency" and "leaps" (as in Quantum Leaps) give a nod to the science behind the spirituality without being overly technical.
* **The Assurance Factor:** The phrase "perfectly positioned" is the ultimate reassurance for a seeking soul—it turns their current "confusion" into a "starting point" for their next expansion.

### A few "Quantum" Navigation Menu Ideas

If you build the site, these could replace standard labels to keep the theme consistent:

* **"The Gateway"** (Instead of Home)
* **"Path Mapping"** (Instead of Services/Coaching)
* **"Expansion Lab"** (Instead of Blog or Resources)
* **"Source Connection"** (Instead of Contact)

Next investigate "Quantum Principles" or "Core Pillars" for your teaching that reflect this multiverse navigation pillars?

## 🏗️ Architecture

A browser-based guide built with **Astro** and published as a static site on **Cloudflare Pages**. The production deployment does not require Workers, D1, KV, or server-side authentication.

### Frontend

**Astro**: Static site generation
**TypeScript**: Type-safe JavaScript throughout
**Cloudflare Pages**: Static hosting with GitHub Actions deployments from `main`

## 📋 Prerequisites

* Node.js 24 or newer and pnpm

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Local Development

```bash
pnpm run dev
```

Visit the local URL printed by Astro.

### 3. Build for Production

```bash
pnpm run build
```

### 4. Publish

Push a change to `main`; GitHub Actions builds the static site and deploys `dist/` to Cloudflare Pages.

## 📁 Project Structure

```bash
qspiritguide/
├── public/                   # Static assets
├── src/
│   ├── pages/                 # Astro pages (routes)
│   ├── components/            # Reusable Astro components
│   ├── layouts/               # Page layouts
│   └── styles/                # Global styles
├── astro.config.mjs           # Astro configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## ⚙️ Configuration

### Cloudflare Pages setup

1. Create a Pages project named `qspiritguide` with `main` as its production branch. Use direct uploads; the GitHub Actions workflow in this repository handles builds and deployments.
2. In that Pages project's **Custom domains** settings, attach `qspirit.guide`.
3. Create a Cloudflare API token scoped to the target account with **Account → Cloudflare Pages → Edit** permission only. Set the token to expire after one year.
4. Before the token expires, create a replacement with the same **Cloudflare Pages → Edit** scope and update the `CLOUDFLARE_API_TOKEN` GitHub Actions secret. Expired tokens must be recreated; they cannot be renewed.
5. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions repository secrets.

The workflow deploys the `qspiritguide` Pages project on each push to `main`; Cloudflare serves it at the attached `https://qspirit.guide` custom domain. It builds with `pnpm build` and uploads only generated `dist/` static assets.

## 🧠 BMAD Method Integration

This project is organized to support the BMAD (Break down, Map, Adjust, Detail) method:

* **Break down**: Separate routes, components, and styles
* **Map**: Routes and client-side components are connected through Astro
* **Adjust**: Build and deployment behavior is configured in Astro and GitHub Actions
* **Detail**: Implement pages and reusable components in their respective directories

## 📝 Development Guidelines

### Code Organization

* Use TypeScript for type safety
* Follow naming conventions: camelCase for functions, PascalCase for components

### Adding Features

1. Create new `.astro` files in `src/pages/` for routes
2. Create reusable components in `src/components/`
3. Push changes to `main` to publish them

## 🚢 Deployment

Cloudflare Pages publishes automatically from GitHub Actions on every push to `main`. See [Cloudflare Pages setup](#cloudflare-pages-setup) above for the one-time project and secret configuration.

## 📖 Resources

* [Astro Documentation](https://docs.astro.build/)
* [Cloudflare Pages](https://developers.cloudflare.com/pages/)

## 📄 License

MIT

## Browser AI Models

The app downloads its Transformers.js-compatible ONNX models directly from public
[Hugging Face Hub](https://huggingface.co/onnx-community) repositories. Downloads are
pinned to specific Hub revisions and may be cached by the browser. During downloads, the app
displays overall progress; repeat visits can use the browser cache and may skip most or all of
the download. Inference runs locally; prompts are not sent to Hugging Face or a remote
inference service.

The available models are [Llama 3.2 1B](https://huggingface.co/onnx-community/Llama-3.2-1B-Instruct-ONNX),
[SmolLM2 360M](https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX), and
[SmolLM2 135M](https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX).
Llama 3.2's Community License and Acceptable Use Policy apply; both are available in its
Hub repository. The SmolLM2 models are licensed under Apache-2.0.
