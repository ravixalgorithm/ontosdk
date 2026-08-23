# Automatic JSON-LD Schema Injection Guide

The OntoProvider now automatically injects JSON-LD structured data schemas based on your page configuration. **Zero manual JSON-LD writing required** - just configure your routes and the SDK does the rest.

## Why JSON-LD Matters for AI

JSON-LD (JavaScript Object Notation for Linked Data) is a lightweight format that helps AI agents:
- **Understand your content** with high confidence
- **Extract structured data** (pricing, products, methodology)
- **Reduce hallucinations** by providing authoritative schema markup
- **Score higher** on AIO metrics (worth 25 points in our scoring algorithm)

## Quick Start

### 1. Import Your Config

```tsx
// app/layout.tsx
import { OntoProvider } from '@ontosdk/next/provider';
import config from '../onto.config';

export default function RootLayout({ children }) {
  return (
    <OntoProvider baseUrl="https://example.com" config={config}>
      <html>
        <head />
        <body>{children}</body>
      </html>
    </OntoProvider>
  );
}
```

### 2. Configure Page Types

```typescript
// onto.config.ts
import type { OntoConfig } from '@ontosdk/next';

const config: OntoConfig = {
  name: 'My Site',
  summary: 'Description',
  baseUrl: 'https://example.com',

  routes: [
    {
      path: '/score',
      description: 'AIO Score Calculator',
      pageType: 'scoring' // ← Automatically injects Methodology schema
    },
    {
      path: '/about',
      description: 'About us',
      pageType: 'about' // ← Automatically injects Organization schema
    }
  ],

  organization: {
    name: 'My Company',
    description: 'What we do',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png'
  }
};

export default config;
```

### 3. That's It!

The OntoProvider automatically:
1. Detects the current page path
2. Matches it against your route configuration
3. Generates the appropriate JSON-LD schema
4. Injects it into the page `<head>`

No manual `<script type="application/ld+json">` tags needed!

## Supported Page Types

### `pageType: 'scoring'`

**Use for**: AIO score calculators, methodology pages, scoring tools

**Generates**: [HowTo Schema](https://schema.org/HowTo) explaining the AIO scoring methodology

**Includes**:
- 4-step methodology (Content Negotiation, Token Efficiency, Structured Data, Semantic HTML)
- Standard AIO weights (40%, 35%, 25%, bonus)
- Detailed explanations for each metric

**Example output**:
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "AIO Score Calculation Methodology",
  "description": "AI Optimization (AIO) Score measures how well a website is optimized for AI agents...",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Content Negotiation",
      "text": "Check if the site responds to Accept: text/markdown header. Weight: 40%...",
      "position": 1
    },
    // ... 3 more steps
  ]
}
```

**When to use**:
- `/score` - Score calculator pages
- `/methodology` - Explanation of scoring system
- `/calculator` - Any page with a scoring/grading tool

### `pageType: 'about'`

**Use for**: About pages, company info, team pages

**Generates**: [AboutPage Schema](https://schema.org/AboutPage) + [Organization Schema](https://schema.org/Organization)

**Includes**:
- Organization name, description, URL
- Logo, founding date (if provided)
- Nested organization entity

**Example output**:
```json
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About My Company",
  "url": "https://example.com/about",
  "description": "Company description from config",
  "mainEntity": {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "My Company",
    "url": "https://example.com",
    "description": "What we do",
    "logo": "https://example.com/logo.png",
    "foundingDate": "2024-01-01"
  }
}
```

**When to use**:
- `/about` - Company about page
- `/about-us` - Team/company info
- `/company` - Organization details

### `pageType: 'default'` (or omitted)

**Use for**: All other pages

**Generates**: Nothing - no automatic JSON-LD injection

Use this for pages where you want to manually control JSON-LD or don't need structured data.

## Configuration Reference

### Route Configuration

```typescript
interface OntoRoute {
  path: string;           // URL path (e.g., '/score')
  description: string;    // What this page contains
  pageType?: PageType;    // 'scoring' | 'about' | 'default'
}
```

### Organization Configuration

Required for `pageType: 'about'` to work properly:

```typescript
organization?: {
  name: string;          // Required: Organization name
  description?: string;  // Optional: What you do
  url?: string;         // Optional: Company website
  logo?: string;        // Optional: Logo URL (use absolute URL)
  foundingDate?: string; // Optional: ISO date format (YYYY-MM-DD)
}
```

## Complete Example

```typescript
// onto.config.ts
import type { OntoConfig } from '@ontosdk/next';

const config: OntoConfig = {
  name: 'BuildOnto',
  summary: 'Next.js infrastructure for AI-optimized websites',
  baseUrl: 'https://buildonto.dev',

  routes: [
    {
      path: '/',
      description: 'Homepage',
      pageType: 'default'
    },
    {
      path: '/score',
      description: 'AIO Score Calculator - grade your AI optimization',
      pageType: 'scoring'
    },
    {
      path: '/about',
      description: 'About BuildOnto and our mission',
      pageType: 'about'
    },
    {
      path: '/docs',
      description: 'Documentation and guides'
      // No pageType = 'default', no automatic JSON-LD
    }
  ],

  organization: {
    name: 'BuildOnto',
    description: 'Making websites AI-ready with zero-config infrastructure',
    url: 'https://buildonto.dev',
    logo: 'https://buildonto.dev/logo.png',
    foundingDate: '2024-01-01'
  }
};

export default config;
```

```tsx
// app/layout.tsx
import { OntoProvider } from '@ontosdk/next/provider';
import config from '../onto.config';

export default function RootLayout({ children }) {
  return (
    <OntoProvider baseUrl="https://buildonto.dev" config={config}>
      <html lang="en">
        <head />
        <body>{children}</body>
      </html>
    </OntoProvider>
  );
}
```

Now visit `/score` or `/about` and view source - you'll see the JSON-LD automatically injected!

## AIO Scoring Weights

The `pageType: 'scoring'` schema includes the official AIO scoring methodology:

| Metric | Weight | Max Penalty | Description |
|--------|--------|-------------|-------------|
| **Content Negotiation** | 40% | -30 points | Accept: text/markdown support |
| **Token Efficiency** | 35% | -30 points | HTML size vs visible text ratio |
| **Structured Data** | 25% | -25 points | JSON-LD presence (this feature!) |
| **Semantic HTML** | Bonus | -15 points | `<main>`, `<article>` tags |

By using this SDK with automatic JSON-LD injection, you instantly gain **+25 points** on the AIO score!

## Validation

### Test Your Schema

1. Visit your page in development: `http://localhost:3000/score`
2. View page source (Ctrl+U / Cmd+U)
3. Look for `<script type="application/ld+json">`
4. Copy the JSON content
5. Validate at [Google's Rich Results Test](https://search.google.com/test/rich-results)

### Check with cURL

```bash
# Fetch as an AI bot
curl -H "User-Agent: GPTBot" http://localhost:3000/score | grep "application/ld+json"
```

## Advanced Usage

### Manual Schema Generation

If you need custom schemas beyond the built-in types:

```typescript
import { generateAIOMethodologySchema } from '@ontosdk/next';

const schema = generateAIOMethodologySchema(config, 'https://example.com/score');
console.log(JSON.stringify(schema, null, 2));
```

### Custom Page Types

Want to add your own page types? Extend the config:

```typescript
// Create a custom schema generator
function generateProductSchema(config, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: config.name,
    url: url
  };
}

// Use it manually in your component
import { serializeSchema } from '@ontosdk/next';

const jsonLd = serializeSchema(generateProductSchema(config, pageUrl));

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: jsonLd }}
  />
);
```

## Migration from Manual JSON-LD

If you currently have manual JSON-LD:

**Before** (manual):
```tsx
export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About Us',
            // ... lots of manual JSON
          })
        }}
      />
      <main>{/* content */}</main>
    </>
  );
}
```

**After** (automatic):
```tsx
// onto.config.ts
routes: [
  { path: '/about', description: 'About us', pageType: 'about' }
]

// app/layout.tsx - just wrap once
<OntoProvider config={config} baseUrl="https://example.com">
  {children}
</OntoProvider>
```

## Benefits

✅ **Zero Manual Work**: Configure once, works everywhere
✅ **Type-Safe**: Full TypeScript support with intellisense
✅ **Consistent**: Same schema structure across all pages
✅ **Maintainable**: Update in one place (config) instead of per-page
✅ **AIO Optimized**: Schemas designed specifically for AI agents
✅ **Schema.org Compliant**: Follows official standards
✅ **Validation Ready**: Works with Google Rich Results Test

## Troubleshooting

### Schema not appearing?

1. **Check config path**: Make sure you're importing the config correctly
2. **Verify route match**: Path must exactly match (including trailing slashes)
3. **Check pageType**: Must be explicitly set to 'scoring' or 'about'
4. **Organization missing**: For 'about' pages, ensure `organization` is configured

### Wrong schema type?

- Double-check the `pageType` value in your route config
- Ensure you're passing the config prop to OntoProvider

### TypeScript errors?

```bash
npm install @ontosdk/next@latest
```

Make sure you're on the latest version with schema support.

## Resources

- [Schema.org: HowTo](https://schema.org/HowTo)
- [Schema.org: AboutPage](https://schema.org/AboutPage)
- [Schema.org: Organization](https://schema.org/Organization)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [AIO Score Documentation](https://buildonto.dev/docs/aio-score)

---

**Next Steps**: Check out [LLMS_TXT_GUIDE.md](./LLMS_TXT_GUIDE.md) for automatic llms.txt generation!
