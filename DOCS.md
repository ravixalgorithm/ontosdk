# Onto SDK (@ontosdk/next) - Documentation

Onto is an infrastructure layer for Next.js that solves **React Tax** for AI Agents. It intercepts traffic from AI bots (GPTBot, ClaudeBot, etc.) and serves clean, hyper-optimized Markdown instead of heavy React HTML.

With the **1.3.0 "Agent-Awareness" Update**, Onto now supports advanced auto-discovery and dynamic manifest generation.

---

## 🚀 Quick Start (2-Minute Setup)

### 1. Install the SDK
```bash
npm install @ontosdk/next
```

### 2. Configure Build
Update your `package.json` to generate semantic payloads after every build:
```json
"scripts": {
  "build": "next build && onto-next"
}
```

### 3. Add Edge Middleware
Create or update `middleware.ts` in your project root:
```typescript
import { ontoMiddleware as middleware } from '@ontosdk/next/middleware';
export { middleware };

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

---

## 🛠 Features

### 🚦 Agent-Awareness
Onto recognizes over **20+ AI crawlers** across all major AI companies. The `matchBot` logic is case-insensitive and handles interactive agents (browsing) and background indexers specifically.

| Company | Bots |
| :--- | :--- |
| **OpenAI** | GPTBot, ChatGPT-User (Browsing), OAI-SearchBot |
| **Google** | Googlebot, Google-CloudVertexBot, Google-Extended (Gemini), GoogleOther |
| **Anthropic** | ClaudeBot, Claude-User, anthropic-ai |
| **Perplexity** | PerplexityBot, Perplexity-User |
| **Meta** | Meta-ExternalAgent, Meta-ExternalFetcher, FacebookBot |
| **Others** | CCBot (Common Crawl), Bytespider, Applebot-Extended, cohere-ai, YouBot |

### 🔍 Auto-Discovery (New)
Don't wait for bots to "guess" where your markdown is. Onto provides two components to advertise optimized endpoints:

#### **OntoHead** (Static Paths)
Best for sites using the `onto-next` CLI. Injects `<link>` tags pointing to the `.onto/` directory.
```tsx
import { OntoHead } from '@ontosdk/next/components';

// In layout.tsx
<head>
  <OntoHead />
</head>
```

#### **OntoProvider** (Dynamic/Context-Aware)
Best for dynamic apps. Injects discovery tags and **JSON-LD Structured Data** for specific page types (e.g., scoring methodologies or organization info).
```tsx
import { OntoProvider } from '@ontosdk/next/provider';

<OntoProvider baseUrl="https://example.com" config={config}>
  {children}
</OntoProvider>
```

### 📄 Dynamic `llms.txt`
Onto automatically generates and serves a standardized `llms.txt` manifest at your root. 
1. Create `onto.config.ts` in your project root.
2. Define your `name`, `summary`, and key `routes`.
3. Middleware serves `/llms.txt` dynamically—no static file maintenance required.

---

## ⚙️ Configuration (`onto.config.ts`)

```typescript
import type { OntoConfig } from '@ontosdk/next';

const config: OntoConfig = {
  name: 'My Project',
  summary: 'A brief description for AI agents',
  baseUrl: 'https://example.com',
  routes: [
    { path: '/', description: 'Home', pageType: 'about' },
    { path: '/pricing', description: 'Pricing details', pageType: 'scoring' }
  ]
};
```

---

## 🌑 Control Plane (Premium)
Unlock analytics and bot management by adding your API key:

- **Agent Analytics**: Real-time tracking of which bots are crawling your site.
- **Manifest Sync**: Automatically syncs your route tree with the Onto Dashboard.
- **Context Injection**: Append "Hidden Prompts" to specific routes for AI agents only.

---

## 🧠 Why Onto?
Modern web pages are often 800KB+ of HTML/JS, but contain only 5KB of actual semantic data. 

1. **Save Tokens**: AI agents ingest 95% fewer tokens.
2. **Zero Hallucination**: AI sees your data in its native "ontology" (Markdown/JSON) rather than messy DOM.
3. **Edge Speed**: Middleware runs in `< 10ms` on the Edge.
4. **Agent SEO**: Serving curated Markdown is the new standard for "Agent SEO" (AIO).

---

*© 2026 Onto Protocol | buildonto.dev*
