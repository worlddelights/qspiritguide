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

A modern full-stack web application combining **Astro** for the front-end with **Cloudflare Workers** for serverless APIs, featuring Turnstile authentication, CAPTCHA protection, and a D1 database.

### Frontend

- **Astro**: Static site generation with server-side rendering (SSR)
* **TypeScript**: Type-safe JavaScript throughout
* **Cloudflare Pages**: Deployment platform

### Backend (Serverless)

- **Cloudflare Workers**: Serverless API endpoints
* **Cloudflare D1**: SQLite database at the edge
* **Cloudflare KV**: Session and cache storage

### Security

- **Cloudflare Turnstile**: CAPTCHA protection (privacy-first alternative to reCAPTCHA)
* **Cloudflare Workers Auth**: Protected API endpoints
* **Session Management**: KV-backed secure sessions

## 📋 Prerequisites

* Node.js 18+ and pnpm
* Cloudflare account (free tier supported)
* Wrangler CLI: `pnpm add -g wrangler`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Local Development

```bash
# Run Astro dev server
pnpm run dev

# In another terminal, run Cloudflare Workers locally
pnpm run workers:dev
```

Visit `http://localhost:3000` for the Astro front-end and Wrangler will serve workers on a local port.

### 3. Build for Production

```bash
pnpm run build
```

### 4. Deploy

```bash
# Deploy to Cloudflare
pnpm run workers:deploy
```

## 📁 Project Structure

```
qspiritguide/
├── src/
│   ├── pages/                 # Astro pages (routes)
│   ├── components/            # Reusable Astro components
│   ├── layouts/               # Page layouts
│   ├── middleware.ts          # Auth and logging middleware
│   └── env.d.ts              # Type definitions for Cloudflare bindings
├── functions/
│   ├── auth.ts               # Authentication endpoints
│   ├── turnstile.ts          # CAPTCHA verification
│   └── [other-apis].ts       # Additional API endpoints
├── wrangler.toml             # Cloudflare Workers config
├── astro.config.mjs          # Astro configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## ⚙️ Configuration

### Cloudflare Setup

1. **D1 Database**: Update `wrangler.toml` with your database ID

   ```toml
   database_id = "your-database-id"
   ```

2. **Turnstile**: Add your Turnstile site key to environment variables

   ```bash
   # .env or wrangler.toml
   TURNSTILE_SITE_KEY=xxx
   TURNSTILE_SECRET_KEY=xxx
   ```

3. **KV Namespace**: Configure session storage

   ```toml
   [[kv_namespaces]]
   binding = "SESSION_STORE"
   id = "your-kv-id"
   ```

## 🔐 Authentication Flow

1. User submits credentials with Turnstile token
2. Turnstile is verified server-side
3. Credentials are validated against D1 database
4. Session token is generated and stored in KV
5. Token is returned to client for future requests

## 📚 API Endpoints

### POST `/api/auth`

Handles login, registration, logout, and email verification.

**Request:**

```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password",
  "turnstile_token": "..."
}
```

### POST `/api/verify-turnstile`

Verifies Cloudflare Turnstile tokens.

**Request:**

```json
{
  "token": "3D86db...",
  "remoteip": "192.0.2.1"
}
```

## 🧠 BMAD Method Integration

This project is organized to support the BMAD (Break down, Map, Adjust, Detail) method:

* **Break down**: Architecture separated into clear layers (frontend, API, database)
* **Map**: Middleware and routing handled by Astro and Workers
* **Adjust**: Configuration through wrangler.toml and astro.config.mjs
* **Detail**: Implementation in specific function files with clear responsibilities

## 📝 Development Guidelines

### Code Organization

- Keep API endpoints focused and single-purpose
* Use TypeScript for type safety
* Follow naming conventions: camelCase for functions, PascalCase for components

### Adding Features

1. Create new `.astro` files in `src/pages/` for routes
2. Add API handlers in `functions/` directory
3. Create reusable components in `src/components/`
4. Update `wrangler.toml` if adding new bindings

### Database Migrations

Store D1 migrations in a `migrations/` directory and execute via Wrangler CLI.

## 🚢 Deployment

### To Cloudflare Pages (Frontend)

```bash
pnpm run build
# Push dist/ to your git repo connected to Cloudflare Pages
```

### To Cloudflare Workers (API)

```bash
pnpm run workers:deploy
```

## 📖 Resources

* [Astro Documentation](https://docs.astro.build/)
* [Cloudflare Workers](https://developers.cloudflare.com/workers/)
* [Cloudflare D1](https://developers.cloudflare.com/d1/)
* [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
* [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 📄 License

MIT

## Local AI Models

The app runs bundled models locally in the browser. **Built with Llama.** The Llama 3.2
Community License and Acceptable Use Policy are included with the model under
`public/models/Llama-3.2-1B-Instruct/`. SmolLM2 models are licensed under Apache-2.0;
each model directory includes a copy of that license.

## Themes under consideration

<https://astro.build/themes/details/purfectly-zen/>

<https://astro.build/themes/details/airy-personal-page/>

<https://www.astrothemes.dev/theme/twbs-bootstrap/>

## Great Transformers.js example

<https://huggingface.co/spaces/webml-community/Nemotron-3-Nano-WebGPU/tree/main/src>
