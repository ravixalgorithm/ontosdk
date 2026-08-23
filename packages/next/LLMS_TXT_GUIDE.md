# Dynamic llms.txt Generation Guide

The Onto middleware now supports **dynamic llms.txt generation** from your `onto.config.ts` file. This means you never have to manually create or update an `llms.txt` file—it's generated on-the-fly from your configuration.

## What is llms.txt?

`llms.txt` is a standardized file format that provides AI agents (like ChatGPT, Claude, and Perplexity) with a concise, structured overview of your website. It follows a simple Markdown format and helps AI systems understand:

- What your site is about
- Where the most important content is located
- What resources are available

**Key Benefits:**
- AI agents get accurate, up-to-date information about your site
- No manual file maintenance—generated from config
- Follows the official llms.txt specification
- Automatically served to AI crawlers by the middleware

## Setup

### 1. Create `onto.config.ts`

Create a file named `onto.config.ts` in your project root:

```typescript
import { OntoConfig } from '@ontosdk/next';

const config: OntoConfig = {
  name: 'My Project',
  summary: 'A brief description of what your project does and who it serves.',
  baseUrl: 'https://example.com',

  routes: [
    { path: '/', description: 'Homepage' },
    { path: '/docs', description: 'Documentation' },
    { path: '/api', description: 'API reference' }
  ]
};

export default config;
```

### 2. Middleware Configuration

If you've already installed the Onto middleware, you're done! The middleware automatically:
1. Detects requests to `/llms.txt`
2. Loads your `onto.config.ts`
3. Generates the llms.txt content dynamically
4. Returns it with proper headers (`Content-Type: text/plain`)

No additional configuration needed.

## Configuration Schema

### Required Fields

#### `name` (string)
The name of your project or website. Used as the H1 heading in llms.txt.

```typescript
name: 'Acme Corp Documentation'
```

#### `summary` (string)
A concise summary of your project. Should contain key information that helps AI agents understand the purpose and scope of your site. Displayed as a blockquote in llms.txt.

```typescript
summary: 'Comprehensive documentation for the Acme API. Includes REST endpoints, SDKs, and integration guides for Python, JavaScript, and Go.'
```

#### `baseUrl` (string)
The base URL of your website. Used to construct full URLs for routes.

```typescript
baseUrl: 'https://docs.acme.com'
```

### Optional Fields

#### `routes` (array)
Key routes that AI agents should know about. Each route includes:
- `path`: The URL path (e.g., `/docs/api`)
- `description`: What this route contains

```typescript
routes: [
  {
    path: '/docs/getting-started',
    description: 'Quick start guide for new developers'
  },
  {
    path: '/docs/api/reference',
    description: 'Complete API endpoint reference'
  },
  {
    path: '/blog',
    description: 'Technical blog and release notes'
  }
]
```

#### `externalLinks` (array)
Links to external resources like GitHub, status pages, or community forums.

```typescript
externalLinks: [
  {
    title: 'GitHub Repository',
    url: 'https://github.com/acme/sdk',
    description: 'Source code and issue tracker'
  },
  {
    title: 'API Status',
    url: 'https://status.acme.com'
  }
]
```

#### `sections` (array)
Custom markdown sections to add additional context. Each section has:
- `heading`: The section title
- `content`: Markdown content

```typescript
sections: [
  {
    heading: 'About',
    content: 'Acme provides cloud infrastructure for modern applications...'
  },
  {
    heading: 'Key Features',
    content: `- **Fast**: Sub-millisecond response times
- **Secure**: SOC 2 Type II certified
- **Scalable**: Handles millions of requests per second`
  }
]
```

## Example Output

With the following config:

```typescript
const config: OntoConfig = {
  name: 'Acme Documentation',
  summary: 'API docs and guides for Acme Cloud Platform',
  baseUrl: 'https://docs.acme.com',
  routes: [
    { path: '/api', description: 'API reference' },
    { path: '/guides', description: 'Integration guides' }
  ]
};
```

The generated `/llms.txt` will be:

```markdown
# Acme Documentation

> API docs and guides for Acme Cloud Platform

## Key Routes

- [/api](https://docs.acme.com/api): API reference
- [/guides](https://docs.acme.com/guides): Integration guides
```

## Advanced Usage

### TypeScript Support

Full TypeScript support with type checking:

```typescript
import type { OntoConfig } from '@ontosdk/next';

const config: OntoConfig = {
  name: 'My Site',
  summary: 'Description',
  baseUrl: 'https://example.com',
  // TypeScript will validate all fields
};

export default config;
```

### Environment-Specific Configuration

Use environment variables for different deployment environments:

```typescript
const config: OntoConfig = {
  name: 'My App',
  summary: 'A great application',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com',

  routes: [
    { path: '/', description: 'Home' },
    ...(process.env.NODE_ENV === 'production'
      ? [{ path: '/enterprise', description: 'Enterprise features' }]
      : []
    )
  ]
};

export default config;
```

### Dynamic Routes

Generate routes programmatically:

```typescript
const docPages = ['getting-started', 'authentication', 'webhooks'];

const config: OntoConfig = {
  name: 'API Docs',
  summary: 'Developer documentation',
  baseUrl: 'https://api.example.com',

  routes: [
    { path: '/', description: 'API overview' },
    ...docPages.map(page => ({
      path: `/docs/${page}`,
      description: `Guide: ${page.replace('-', ' ')}`
    }))
  ]
};

export default config;
```

## Fallback Behavior

The middleware implements intelligent fallback:

1. **With config**: Generates llms.txt dynamically from `onto.config.ts`
2. **Without config**: Falls back to static `public/llms.txt` if it exists
3. **On error**: Logs error and attempts to serve static file

This ensures your site always has an llms.txt, even if configuration fails.

## Caching

Generated llms.txt responses include optimal cache headers:

```
Content-Type: text/plain; charset=utf-8
Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400
```

This means:
- Cached for 1 hour in browsers/CDNs
- Stale content can be served for up to 24 hours while revalidating
- Reduces server load and improves response times

## Debugging

To verify your llms.txt is being generated correctly:

1. **Start your dev server**: `npm run dev`
2. **Visit**: `http://localhost:3000/llms.txt`
3. **Check console**: Look for `[Onto] Failed to generate llms.txt:` errors

If you see your generated content, you're all set!

## Migration from Static llms.txt

If you currently have a static `public/llms.txt` file:

1. Create `onto.config.ts` with your site information
2. Test that `/llms.txt` is being generated correctly
3. Delete `public/llms.txt` (optional—it's used as fallback)

The middleware will automatically prefer the dynamic version.

## Specification Compliance

This implementation follows the official llms.txt specification:

- ✅ H1 with project name (required)
- ✅ Blockquote with summary (required)
- ✅ Additional markdown sections (optional)
- ✅ Proper content type (`text/plain`)
- ✅ UTF-8 encoding

## Resources

- [llms.txt Official Site](https://llmstxt.org/)
- [llms.txt Specification](https://llmstxt.org/spec)
- [Example Sites](https://llmstxt.org/examples)

## Support

For questions or issues:
- GitHub: [onto-sdk/issues](https://github.com/anthropics/onto-sdk/issues)
- Docs: [buildonto.dev/docs](https://buildonto.dev/docs)
