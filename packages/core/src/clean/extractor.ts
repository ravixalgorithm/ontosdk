import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { ExtractionResult } from '../types';

/* ─────────────────────────────────────────────────────────────────────────────
   @ontosdk/core/clean
   Extracted from onto-sdk/packages/next/src/extractor.ts (v1.6.0).
   Single source of truth for HTML → semantic Markdown conversion. Consumed by
   @ontosdk/next (build-time) and onto-api (request-time).
   ─────────────────────────────────────────────────────────────────────────── */

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// GFM extensions. The `tables` rule is the important one: base Turndown has no
// rule for <table>, so cell text gets concatenated into an unreadable run-on
// line — a downstream agent can't bind a price to its tier. GFM emits real
// `| col | col |` Markdown tables, preserving the row/column relationship.
// `strikethrough` keeps crossed-out content (e.g. old prices) legible and
// `taskListItems` preserves checklist semantics. See [[project-monorepo-dedup]]:
// production consumers pull core from npm, so this ships only after core is
// published (see [[project-core-table-support]]).
turndownService.use(gfm);

/**
 * Demote heading levels in turndown's output by one. We always prepend our own
 * `# {title}` at the top of the document, so every body heading needs to shift
 * down to preserve the single-h1 invariant (CommonMark / AI-friendly).
 *
 * h1→h2, h2→h3, h3→h4, h4→h5, h5→h6, h6 stays. Skips lines inside fenced code
 * blocks so we don't accidentally rewrite a code comment like `# hello`.
 */
function demoteHeadings(markdown: string): string {
  const lines = markdown.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^(#{1,6})(\s)/);
    if (match) {
      const newLevel = Math.min(match[1].length + 1, 6);
      lines[i] = '#'.repeat(newLevel) + match[2] + line.slice(match[0].length);
    }
  }
  return lines.join('\n');
}

// Display values that make an element its own box. Matched against Tailwind
// class tokens (optionally variant-prefixed, e.g. `md:flex`) and inline styles.
const BOX = 'block|inline-block|flex|inline-flex|grid|inline-grid|table|table-cell|list-item|flow-root';
const BOX_CLASS = new RegExp(`(?:^|\\s)(?:[^\\s]*:)?(${BOX})(?=\\s|$)`);
const BOX_STYLE = new RegExp(`display\\s*:\\s*(${BOX})\\b`);
const CONTAINER = /^(?:inline-)?(?:flex|grid)$/;

function displayOf(el: cheerio.Cheerio<any>): string | undefined {
  return (el.attr('style') || '').match(BOX_STYLE)?.[1] ?? (el.attr('class') || '').match(BOX_CLASS)?.[1];
}

/**
 * Pages built from flex/grid layouts often put sibling boxes side by side with
 * no whitespace between them (`<li class="flex"><span>PT-12</span><span>Title
 * </span>`). The browser shows them apart; Turndown sees inline spans and glues
 * the text into "PT-12Title". Pad every element that renders as its own box —
 * a flex/grid child, a span styled block/inline-flex, a button — with spaces on
 * the outside. Turndown collapses repeated whitespace and drops it next to real
 * blocks, so this never splits a word or lands inside inline formatting.
 * Skips <pre>/<code>, where whitespace is content.
 *
 * Form inputs go first: they render to nothing, but Turndown keeps whitespace
 * after a void element, and that space can swallow the break between two
 * blocks ("Camera\n\nPause" → "CameraPause"). Task-list checkboxes stay for GFM.
 */
function separateBoxes($: cheerio.CheerioAPI): void {
  $('input').not('li > input[type="checkbox"]').remove();
  const pad = (el: cheerio.Cheerio<any>) => el.before(' ').after(' ');
  $('[class], [style], button').each((_, node) => {
    const el = $(node);
    if (el.closest('pre, code').length) return;
    const display = displayOf(el);
    if (display || node.tagName === 'button') pad(el);
    if (display && CONTAINER.test(display)) el.children().each((_, c) => void pad($(c)));
  });
}

export function extractContent(
  html: string,
  sourceUrl: string = 'Generated Output',
): ExtractionResult {
  const originalSize = html.length;

  const $ = cheerio.load(html);

  // Title resolution. `$('title')` matches *every* <title> tag, including
  // SVG <title> accessibility labels (one per icon). Scope to the document
  // <title> in <head>; fall back to first <h1>, stripping any nested SVG/
  // script noise from it the same way.
  const headTitle = $('head > title').first().text().trim();
  let fallback = '';
  if (!headTitle) {
    const $h1 = $('h1').first().clone();
    $h1.find('svg, script, style, noscript').remove();
    fallback = $h1.text().replace(/\s+/g, ' ').trim();
  }
  const title = headTitle || fallback || 'Untitled Page';

  const description =
    $('meta[name="description"]').attr('content') || 'No description found.';
  const language = $('html').attr('lang');
  const canonicalUrl = $('link[rel="canonical"]').attr('href');

  const jsonLdScripts: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html() || '';
      jsonLdScripts.push(JSON.parse(raw));
    } catch {
      /* ignore malformed JSON-LD */
    }
  });

  $('script, style, noscript, iframe, svg, nav, footer, meta, link, header').remove();
  separateBoxes($);

  let contentHtml = '';
  if ($('main').length > 0) {
    contentHtml = $('main').html() || '';
  } else if ($('article').length > 0) {
    contentHtml = $('article').html() || '';
  } else {
    contentHtml = $('body').html() || '';
  }

  const markdown = demoteHeadings(turndownService.turndown(contentHtml));

  const headerLines = [
    `# ${title}`,
    `> ${description}`,
    ``,
    `**Source:** ${sourceUrl}`,
    `**Extracted:** ${new Date().toISOString()}`,
    ``,
    `---`,
    ``,
  ];

  let finalMarkdown = headerLines.join('\n') + markdown;

  if (jsonLdScripts.length > 0) {
    finalMarkdown += '\n\n---\n## Structured Data (JSON-LD)\n```json\n';
    jsonLdScripts.forEach((j) => {
      finalMarkdown += JSON.stringify(j, null, 2) + '\n';
    });
    finalMarkdown += '```\n';
  }

  const markdownSize = finalMarkdown.length;
  const tokenReductionRatio =
    originalSize > 0 ? ((originalSize - markdownSize) / originalSize) * 100 : 0;

  return {
    markdown: finalMarkdown,
    metadata: {
      title,
      description,
      jsonLd: jsonLdScripts,
      language,
      canonicalUrl,
    },
    stats: {
      originalHtmlSize: originalSize,
      markdownSize,
      tokenReductionRatio,
    },
  };
}
