/* ─────────────────────────────────────────────────────────────────────────────
   @ontosdk/core/score — AI bot registry
   Mirrored from onto-sdk/packages/next/src/bots.ts. Single source for both SDK
   middleware (request-time detection) and API analytics (user-agent tagging).
   ─────────────────────────────────────────────────────────────────────────── */

export interface AiBot {
  name: string;
  company: string;
  addedAt?: string;
}

export const AI_BOTS: AiBot[] = [
  // OpenAI
  { name: 'GPTBot', company: 'OpenAI', addedAt: '2025-01-01' },
  { name: 'ChatGPT-User', company: 'OpenAI', addedAt: '2025-01-01' },
  { name: 'OAI-SearchBot', company: 'OpenAI', addedAt: '2025-01-01' },
  { name: 'ChatGPT', company: 'OpenAI', addedAt: '2025-03-25' },
  { name: 'OpenAI', company: 'OpenAI', addedAt: '2025-03-25' },
  { name: 'GPT', company: 'OpenAI', addedAt: '2025-03-25' },

  // Google (Googlebot proper is EXCLUDED — SEO safety)
  { name: 'Google-CloudVertexBot', company: 'Google', addedAt: '2025-01-01' },
  { name: 'Google-Extended', company: 'Google', addedAt: '2025-01-01' },
  { name: 'GoogleOther', company: 'Google', addedAt: '2025-01-01' },

  // Anthropic
  { name: 'ClaudeBot', company: 'Anthropic', addedAt: '2025-01-01' },
  { name: 'Claude-User', company: 'Anthropic', addedAt: '2025-01-01' },
  { name: 'claude-fetch', company: 'Anthropic', addedAt: '2025-03-25' },
  { name: 'AnthropicFetch', company: 'Anthropic', addedAt: '2025-03-25' },
  { name: 'Claude-Fetch', company: 'Anthropic', addedAt: '2025-03-25' },
  { name: 'anthropic-ai', company: 'Anthropic', addedAt: '2025-01-01' },
  { name: 'Claude', company: 'Anthropic', addedAt: '2025-03-25' },
  { name: 'Anthropic', company: 'Anthropic', addedAt: '2025-03-25' },

  // Perplexity
  { name: 'PerplexityBot', company: 'Perplexity', addedAt: '2025-01-01' },
  { name: 'Perplexity-User', company: 'Perplexity', addedAt: '2025-01-01' },
  { name: 'Perplexity', company: 'Perplexity', addedAt: '2025-03-25' },

  // Meta
  { name: 'Meta-ExternalAgent', company: 'Meta', addedAt: '2025-01-01' },
  { name: 'Meta-ExternalFetcher', company: 'Meta', addedAt: '2025-01-01' },
  { name: 'facebookexternalhit', company: 'Meta', addedAt: '2025-03-25' },
  { name: 'FacebookBot', company: 'Meta', addedAt: '2025-01-01' },

  // Mistral
  { name: 'MistralBot', company: 'Mistral', addedAt: '2025-03-25' },
  { name: 'Mistral', company: 'Mistral', addedAt: '2025-03-25' },

  // Amazon
  { name: 'Amazonbot', company: 'Amazon', addedAt: '2025-03-25' },

  // Others
  { name: 'AI2Bot', company: 'Allen Institute', addedAt: '2025-03-25' },
  { name: 'DuckAssistBot', company: 'DuckDuckGo', addedAt: '2025-03-25' },
  { name: 'Diffbot', company: 'Diffbot', addedAt: '2025-03-25' },
  { name: 'CCBot', company: 'Common Crawl', addedAt: '2025-01-01' },
  { name: 'Bytespider', company: 'ByteDance', addedAt: '2025-01-01' },
  { name: 'Applebot-Extended', company: 'Apple', addedAt: '2025-01-01' },
  { name: 'YouBot', company: 'You.com', addedAt: '2025-01-01' },

  // Generic AI / scraping libraries
  { name: 'python-requests', company: 'Generic Bot', addedAt: '2025-03-25' },
  { name: 'python-httpx', company: 'Generic Bot', addedAt: '2025-03-25' },
  { name: 'httpx', company: 'Generic Bot', addedAt: '2025-03-25' },
  { name: 'axios', company: 'Generic Bot', addedAt: '2025-03-25' },
  { name: 'node-fetch', company: 'Generic Bot', addedAt: '2025-03-25' },
  { name: 'Go-http-client', company: 'Generic Bot', addedAt: '2025-03-25' },
  { name: 'Wget', company: 'Generic Bot', addedAt: '2025-03-25' },
  { name: 'Curl', company: 'Generic Bot', addedAt: '2025-03-25' },
];

export const AI_BOT_USER_AGENTS: string[] = AI_BOTS.map((bot) => bot.name);

export function matchBot(userAgent: string | null): AiBot | undefined {
  if (!userAgent) return undefined;
  const lowerUA = userAgent.toLowerCase();

  const matches = AI_BOTS.filter((bot) =>
    lowerUA.includes(bot.name.toLowerCase()),
  );

  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];

  // Longest-match wins (e.g. 'ChatGPT-User' beats 'GPT')
  return matches.reduce((longest, current) =>
    current.name.length > longest.name.length ? current : longest,
  );
}
