# Quick Start: Automatic JSON-LD Schemas

Get AI-friendly structured data in 60 seconds. Zero manual JSON writing required.

## Step 1: Pass Config to Provider

```tsx
// app/layout.tsx
import { OntoProvider } from '@ontosdk/next/provider';
import config from '../onto.config'; // ← Import your config

export default function RootLayout({ children }) {
  return (
    <OntoProvider
      baseUrl="https://example.com"
      config={config} // ← Pass it here
    >
      <html>
        <head />
        <body>{children}</body>
      </html>
    </OntoProvider>
  );
}
```

## Step 2: Configure Page Types

```typescript
// onto.config.ts
const config: OntoConfig = {
  name: 'My Site',
  summary: 'Description',
  baseUrl: 'https://example.com',

  routes: [
    {
      path: '/score',
      description: 'AIO Score Calculator',
      pageType: 'scoring' // ← Injects Methodology schema
    },
    {
      path: '/about',
      description: 'About us',
      pageType: 'about' // ← Injects Organization schema
    }
  ],

  organization: {
    name: 'My Company',
    url: 'https://example.com'
  }
};
```

## Step 3: Verify

Visit `/score` or `/about` and view page source. You'll see:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "AIO Score Calculation Methodology",
  "step": [...]
}
</script>
```

## What Gets Injected?

| Page Type | Schema Type | Use For |
|-----------|-------------|---------|
| `scoring` | HowTo | Score calculators, methodology pages |
| `about` | AboutPage + Organization | Company info, team pages |
| `default` | None | Everything else (no automatic injection) |

## AIO Scoring Weights (Included in Schema)

The `scoring` page type automatically documents:
- **40%** - Content Negotiation
- **35%** - Token Efficiency
- **25%** - Structured Data ← You get these points!
- **Bonus** - Semantic HTML

By using this feature, you automatically gain **+25 points** on AIO scoring! 🎉

## Next Steps

- [Complete JSON-LD Guide](./JSON_LD_GUIDE.md) - Full documentation
- [onto.config.example.ts](./onto.config.example.ts) - Example config
- [Validation Tips](./JSON_LD_GUIDE.md#validation) - Test your schemas

---

**Pro Tip**: AI agents can now confidently extract your scoring methodology without hallucinating the weights!
