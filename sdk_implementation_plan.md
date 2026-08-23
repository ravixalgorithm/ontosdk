# @onto/next SDK — Implementation Plan (Phase 2 & 3 Combined)

## 1. Context & Goal
We are building `@onto/next` — a single open-source SDK that Next.js developers install to instantly optimize their sites for AI agents (GPTBot, Claude, Perplexity).

The user's goal is to combine **Epic 2 (The Extractor)** and **Epic 3 (The Middleware)** into a single, cohesive SDK package. 

When a developer installs `@onto/next`:
1. **At Build Time**: It automatically scans their `app/` directory and converts rendered HTML files into clean Markdown/JSON `.onto` payloads.
2. **At Runtime**: It provides a Next.js Edge Middleware that intercepts traffic, checks the `User-Agent` and `Accept` headers, and instantly routes AI agents to the `.onto` payload instead of doing a heavy React server render.

The SDK will be built inside a new monorepo: `onto-sdk/packages/next`.

---

## 2. What Has Been Done (Validation & Context)
- ✅ **The API Extraction Logic**: We already built a powerful `cheerio` extraction logic in the `onto` website (AIO Score Calculator). We know exactly how to strip `<script>`, `<style>`, `<nav>`, `<footer>`, and extract Headings, Paragraphs, Links, and JSON-LD structured data.
- ✅ **Repository Skeleton**: Created the `onto-sdk` GitHub repository to serve as the monorepo for SDK development.
- ✅ **Monorepo Setup**: Intialized `package.json` for the `@onto/next` package with `tsup`, `cheerio`, `turndown`, and TypeScript configuration.

---

## 3. What Needs To Be Built (Action Plan)

### Step 1: The Build-Time Extractor Engine (`src/extractor.ts`)
We need a robust HTML-to-Markdown engine.
- **Input**: Raw Next.js HTML strings.
- **Logic**: Use `cheerio` to load the HTML. Strip out non-semantic noise (`nav`, `footer`, `script`, `style`, `svg`, `noscript`). 
- **Conversion**: Use `turndown` to convert the remaining semantic `<body>` or `<main>` content into clean Markdown.
- **Metadata**: Extract `<title>`, `<meta name="description">`, and any `<script type="application/ld+json">` schemas to bundle into the final payload.

### Step 2: The CLI Pre-compiler (`src/cli.ts`)
Next.js outputs static HTML into `.next/server/app/`. The CLI will run immediately after `next build`.
- **Target**: Recursively crawl `.next/server/app/**/*.html`.
- **Action**: Pass each file through the `extractor.ts`.
- **Output**: Save the resulting Markdown payloads into the developer's `<project-root>/public/.onto/` directory, mirroring the exact route structure (e.g., `.next/server/app/pricing.html` -> `public/.onto/pricing.md`).
- **Dev Experience**: Print a polished CLI output using `picocolors` showing the token shrinkage (e.g., `Optimized /pricing [596KB -> 12KB]`).

### Step 3: The Edge Middleware (`src/middleware.ts`)
This is the runtime engine combining Phase 2 & 3. It runs on the Edge (e.g., Vercel Edge).
- **Detection**: Check incoming requests. Does the `User-Agent` match known AI crawlers (GPTBot, ClaudeBot, Perplexity)? OR does the `Accept` header include `text/markdown`?
- **Routing**: If it's a human, do nothing (pass through to standard React rendering). 
- **Interception**: If it is an AI agent, **rewrite** the request URL to secretly serve the pre-compiled static payload from `/.onto/[route].md`. 
- **Performance**: Must execute in under 10ms. No external fetch calls or heavy DB lookups in the base open-source middleware.

### Step 4: Next.js Plugin Configuration (`src/index.ts`)
To make installation effortless for developers, wrap the setup in a `next.config.js` plugin.
- **`withOnto(config)`**: A higher-order function that injects a Webpack post-build hook, automatically triggering the CLI pre-compiler when the Next.js build succeeds, alleviating the need for developers to manually change their `package.json` build scripts.

---

## 4. Execution Prompt for your AI Agent
*Copy and paste this into Cursor or your AI agent in the `onto-sdk` repository:*

> "I am building the `@onto/next` SDK. This is an open-source Next.js library that combines build-time HTML-to-Markdown extraction with runtime Edge Middleware routing for AI agents.
> 
> Please scaffold the complete `packages/next/` package adhering to this structure:
> 1. **`src/extractor.ts`**: Use `cheerio` and `turndown` to convert raw HTML into clean Markdown. Strip `nav`, `footer`, `script`, `svg`. Extract JSON-LD schemas.
> 2. **`src/cli.ts`**: The CLI executable. It crawls a project's `.next/server/app/**/*.html`, passes them to the extractor, and writes the output to `<project-root>/public/.onto/**/*.md`. Ensure pretty CLI logs.
> 3. **`src/middleware.ts`**: A Next.js Edge Middleware function. It must intercept requests, detect AI agents via `User-Agent` or `Accept: text/markdown`, and gracefully rewrite the request to the static `/.onto/[path].md` files.
> 4. **`src/index.ts`**: Export a `withOnto` Next.js plugin function that automatically triggers the CLI hook on Webpack compile completion.
> 
> The codebase should be fully typed with TypeScript, export ESM & CJS using `tsup`, and have blazing fast edge performance."
