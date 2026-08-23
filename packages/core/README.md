# @ontosdk/core

Shared HTML → Markdown cleaning + AIO (Agent Input Optimization) scoring engine.

Powers the Onto Read API (`api.buildonto.dev`), the `@ontosdk/next` SDK, and the public AIO scanner at `buildonto.dev`. One cleaning engine, one scoring model, one bot registry — used everywhere Onto reads or scores web pages.

## Install

```bash
npm install @ontosdk/core
```

## Use

```ts
import { extractContent, calculateAioScore, getHallucinationRisk } from '@ontosdk/core';

const html = await fetch('https://example.com').then(r => r.text());

const extraction = extractContent(html, 'https://example.com');
//   → { markdown, title, headings, ... }

const scoring = calculateAioScore({
  html,
  markdownPayload: extraction.markdown,
  targetUrl: 'https://example.com',
  robotsAllowed: true,
  isUsingOntoSdk: false,
});
//   → { score, grade, insights, penalties, benefits, recommendations, bot_preview }

const risk = getHallucinationRisk(scoring.score, scoring.insights);
//   → 'low' | 'medium' | 'high'
```

## Entry points

| Import | Returns |
|---|---|
| `@ontosdk/core` | Everything from `clean` + `score` re-exported |
| `@ontosdk/core/clean` | `extractContent`, `ExtractionResult` |
| `@ontosdk/core/score` | `calculateAioScore`, `getHallucinationRisk`, `scoreToGrade`, `AI_BOTS`, `matchBot`, types |

## What it does

**Clean.** Strips React/Tailwind/framework noise from HTML. Normalizes heading hierarchy. Extracts page title. Produces compact, semantic Markdown an AI agent can actually use — typically 10–100× smaller than the source HTML.

**Score.** Returns a subtractive-penalty AIO score (0–100) with structured insights — what's helping the page's AI readability, what's hurting it, and ranked recommendations. The same score the Onto Read API and public scanner return.

**Match bots.** Ships a registry of known AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) and a `matchBot()` helper for user-agent detection at the edge.

## License

MIT — see [LICENSE](./LICENSE).
