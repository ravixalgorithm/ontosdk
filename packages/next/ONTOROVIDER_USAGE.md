# OntoProvider Usage Guide

The `OntoProvider` component is the high-level, "Zero-Config" entry point for AI optimization. It handles both **Auto-Discovery** (link tags) and **Semantic SEO** (JSON-LD schemas) in one wrapper.

## Features

- **Automatic Link Tag Injection**: Adds `<link rel="alternate" type="text/markdown">` to every page.
- **JSON-LD Schema Injection**: Automatically generates structured data (Schema.org) for pages based on your `onto.config.ts`.
- **Dynamic Path Detection**: Uses `usePathname()` to construct full URLs for AI agents.
- **AIO Scoring Methodology**: Automatically injects methodology schemas for routes marked as `pageType: 'scoring'`.

## Installation

```bash
npm install @ontosdk/next
```

## Usage

### 1. Basic Setup in Root Layout

Wrap your application and provide your `baseUrl`. For best results, also pass your `onto.config.ts` object.

```tsx
import { OntoProvider } from '@ontosdk/next/provider';
import config from '../onto.config';

export default function RootLayout({ children }) {
  return (
    <OntoProvider baseUrl="https://example.com" config={config}>
      <html lang="en">
        <head />
        <body>{children}</body>
      </html>
    </OntoProvider>
  );
}
```

### 2. Page Type Configuration

In your `onto.config.ts`, you can specify `pageType` for automatic schema generation:

```typescript
const config: OntoConfig = {
  // ... basic info
  routes: [
    { 
      path: '/pricing', 
      description: 'Pricing & Methodology', 
      pageType: 'scoring' // Triggers AIOMethodologySchema (AIO Scoring)
    },
    { 
      path: '/about', 
      description: 'About Us', 
      pageType: 'about'   // Triggers Organization/AboutPage Schema
    }
  ]
};
```

## How It Works

### Auto-Discovery
For a page at `/docs`, the provider injects:
```html
<link rel="alternate" type="text/markdown" href="https://example.com/docs?format=md" />
```

### Semantic SEO (JSON-LD)
If the route matches a `pageType`, it injects a `<script type="application/ld+json">` with highly specific AI-friendly metadata. For example, a `scoring` page receives the **Onto AIO Methodology** schema, explaining your content negotiation and token efficiency weights to LLM crawlers.

## Comparison with OntoHead

| Feature | OntoHead | OntoProvider |
| :--- | :--- | :--- |
| **Path Pattern** | Static `/.onto/*.md` | Dynamic `?format=md` |
| **JSON-LD** | No | **Yes** |
| **Manifests** | Injects `llms.txt` link | No (handled by Middleware) |
| **Best For** | Static exports (CLI) | Dynamic & Meta-heavy sites |

## Requirements

- Next.js ≥14.0.0
- React ^18.0.0 || ^19.0.0

## License

MIT
