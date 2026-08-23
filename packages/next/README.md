# @ontosdk/next

> Optimize your Next.js site for AI agents in 2 minutes

The Onto SDK automatically converts your Next.js pages into AI-friendly Markdown and intelligently routes bot traffic to optimized endpoints. Reduce token usage by 95% and improve AI agent comprehension.

## Features

- 🤖 **AI Bot Detection**: Recognizes 21+ AI crawlers (GPTBot, ClaudeBot, Perplexity, etc.)
- 📄 **Automatic Extraction**: Converts React/HTML to clean, semantic Markdown
- 🚀 **Edge Middleware**: Sub-10ms routing on Vercel/Cloudflare Edge
- 🔍 **AI Discovery**: Auto-generates `llms.txt` from config
- 📊 **Analytics**: Optional Control Plane for bot tracking (premium)
- ⚡ **Zero Config**: Works out-of-the-box with sensible defaults

## Quick Start

### 1. Install

```bash
npm install @ontosdk/next
```

### 2. Initialize

Run the initialization command to automatically generate your `onto.config.ts` and `middleware.ts`:

```bash
npx onto-next init
```

### 3. Configure Build

Update your `package.json`:

```json
{
  "scripts": {
    "build": "next build && onto-next"
  }
}
```

That's it! Your site is now optimized for AI agents.

## How It Works

### Build Time
The `onto-next` CLI scans your `.next/server/app/` directory and converts rendered HTML pages to clean Markdown files in `public/.onto/`.

### Runtime
The Edge middleware:
1. Detects AI bots via User-Agent or Accept headers
2. Rewrites requests to serve pre-generated `.onto/*.md` files
3. Returns optimized content in <10ms

### AI Discovery
When AI agents request `/llms.txt`, the middleware dynamically generates it from your `onto.config.ts` file—no static file needed.

## Components

### OntoHead

Auto-discovery component for AI agents. Injects link tags into your page head.

```tsx
import { OntoHead } from '@ontosdk/next/components';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <OntoHead />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### OntoProvider

Wraps your app and automatically injects AI discovery tags with dynamic paths.

```tsx
import { OntoProvider } from '@ontosdk/next/provider';

export default function RootLayout({ children }) {
  return (
    <OntoProvider baseUrl="https://example.com">
      <html>
        <head />
        <body>{children}</body>
      </html>
    </OntoProvider>
  );
}
```

## Configuration

### Environment Variables

```bash
# Optional: Enable Control Plane analytics
ONTO_API_KEY=onto_live_xxxx
ONTO_DASHBOARD_URL=https://app.buildonto.dev
```

### onto.config.ts Schema

```typescript
interface OntoConfig {
  name: string;                    // Site name (required)
  summary: string;                 // Brief description (required)
  baseUrl: string;                 // Base URL (required)
  routes?: {                       // Key routes
    path: string;
    description: string;
  }[];
  externalLinks?: {                // External resources
    title: string;
    url: string;
    description?: string;
  }[];
  sections?: {                     // Custom markdown sections
    heading: string;
    content: string;
  }[];
}
```

See [LLMS_TXT_GUIDE.md](./LLMS_TXT_GUIDE.md) for complete configuration documentation.

## Detected Bots

| Company | Bots |
| :--- | :--- |
| OpenAI | GPTBot, ChatGPT-User, OAI-SearchBot |
| Anthropic | ClaudeBot, Claude-User, anthropic-ai |
| Google | Googlebot, Google-CloudVertexBot, Google-Extended |
| Perplexity | PerplexityBot, Perplexity-User |
| Meta | Meta-ExternalAgent, Meta-ExternalFetcher |
| Others | CCBot, Bytespider, Applebot-Extended, cohere-ai, YouBot |

## Benefits

### For Your Site
- **Reduced Load**: AI bots get static Markdown instead of triggering server renders
- **Better Indexing**: AI agents comprehend your content with 95% fewer tokens
- **Edge Performance**: Middleware runs in <10ms on the edge
- **SEO+**: Following emerging "Agent SEO" best practices

### For AI Agents
- **Clean Data**: No React boilerplate, Tailwind classes, or layout noise
- **Structured**: Markdown with proper headings, lists, and links
- **Fast**: Instant responses from edge cache
- **Discoverable**: Standard `llms.txt` manifest for site navigation

## Control Plane (Premium)

Unlock analytics and dynamic features:

- **Bot Analytics**: Track which AI agents visit your site
- **Context Injection**: Append dynamic "hidden prompts" to specific routes
- **Route Monitoring**: See which pages AI agents access most

[Sign up at buildonto.dev](https://buildonto.dev)

## Examples

- [Demo App](../../apps/demo) - Full working example with config
- [onto.config.example.ts](./onto.config.example.ts) - Configuration template
- [LLMS_TXT_GUIDE.md](./LLMS_TXT_GUIDE.md) - Complete llms.txt guide

## API Reference

### Middleware

```typescript
import { ontoMiddleware } from '@ontosdk/next/middleware';

// Export as default middleware
export { ontoMiddleware as middleware };
```

### Config Types

```typescript
import type { OntoConfig, OntoRoute } from '@ontosdk/next';
```

### Utility Functions

```typescript
import { generateLlmsTxt } from '@ontosdk/next';

// Generate llms.txt content
const llmsTxt = generateLlmsTxt(config);
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions for all exports.

## Requirements

- Next.js ≥14.0.0
- React ^18.0.0 || ^19.0.0

## License

MIT

## Support

- [Documentation](https://buildonto.dev/docs)
- [GitHub Issues](https://github.com/anthropics/onto-sdk/issues)
- [Twitter](https://twitter.com/buildonto)

---

Made with ❤️ by the Onto team
