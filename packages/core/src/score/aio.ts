import * as cheerio from 'cheerio';
import type {
  AioGrade,
  HallucinationRisk,
  Recommendation,
  ScoringInput,
  ScoringInsights,
  ScoringResult,
} from '../types';

/* ─────────────────────────────────────────────────────────────────────────────
   @ontosdk/core/score
   Extracted from onto/lib/scoring.ts. Subtractive penalty model. Returns rich
   diagnostics consumed by both the marketing-site scanner and the Read API.
   ─────────────────────────────────────────────────────────────────────────── */

export function scoreToGrade(score: number): AioGrade {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs work';
  if (score >= 25) return 'AI-hostile';
  return 'Invisible';
}

export function getHallucinationRisk(
  score: number,
  insights: ScoringInsights,
): HallucinationRisk {
  if (
    !insights.robots_allowed ||
    score < 50 ||
    (!insights.json_ld_present && !insights.semantic_hierarchy)
  ) {
    return 'high';
  }

  if (
    score < 80 ||
    !insights.markdown_supported ||
    !insights.json_ld_present ||
    !insights.semantic_hierarchy
  ) {
    return 'medium';
  }

  return 'low';
}

export function calculateAioScore(input: ScoringInput): ScoringResult {
  const { html, markdownPayload, targetUrl, robotsAllowed } = input;
  let score = 100;
  const penalties: string[] = [];
  const benefits: string[] = [];
  const recommendations: Recommendation[] = [];
  const insights: ScoringInsights = {
    robots_allowed: robotsAllowed,
    waf_blocked: false,
    markdown_supported: !!markdownPayload,
    json_ld_present: false,
    semantic_hierarchy: false,
  };

  const rawLength = html.length;
  const $ = cheerio.load(html);

  // Robots.txt block is fatal
  if (!robotsAllowed) {
    score = 0;
    penalties.push('CRITICAL: Blocked by robots.txt. Content is invisible to AI.');
    recommendations.push({
      title: 'Allow AI Agents in robots.txt',
      description:
        "Ensure your robots.txt (or Cloudflare AI Audit) doesn't disallow GPTBot and other AI crawlers.",
      priority: 'High',
    });
    return {
      score: 0,
      grade: 'Invisible',
      url: targetUrl,
      metadata: { title: '', description: '' },
      penalties,
      insights,
      benefits,
      recommendations,
      stats: { raw_size: '0KB', htmlSize: '0KB', textLength: 0, efficiency: '0%' },
      botPreview: '',
      isUsingOntoSdk: !!input.isUsingOntoSdk,
    };
  }

  // Markdown support
  if (!insights.markdown_supported) {
    score -= 25;
    penalties.push('Critical: No Machine-Readable (Markdown) layer detected.');
  } else if (input.isUsingOntoSdk) {
    benefits.push(
      'Agent Routing (Middleware): Automatically detect GPTBot/Claude and serve pure Markdown payloads directly from the Edge.',
    );
  } else {
    score -= 10;
    penalties.push(
      'Warning: Unmanaged AI Payload. Native Markdown is present but lacks Onto-specific brand controls, versioning, and agent analytics.',
    );
    benefits.push(
      'Native Markdown Support: This site natively serves Markdown to agents, which improves extraction but lacks the Onto-optimized management layer.',
    );
  }

  // React Tax
  const $clean = cheerio.load(html);
  $clean('script, style, noscript, iframe, svg, nav, footer, meta, link').remove();
  const cleanText = $clean('body').text().replace(/\s+/g, ' ').trim();
  const cleanHtmlLength = $clean.html()?.length || cleanText.length;

  let ratio = rawLength > 0 ? (cleanHtmlLength / rawLength) * 100 : 0;

  if (markdownPayload) {
    const mdLength = markdownPayload.length;
    const efficiency = rawLength > 0 ? (1 - mdLength / rawLength) * 100 : 0;

    if (input.isUsingOntoSdk) {
      ratio = 100;
      benefits.push(
        `Zero React Tax: Onto intercepted the agent request and served a ${mdLength} byte payload, completely bypassing the ${(rawLength / 1024).toFixed(1)}KB React visual wrapper.`,
      );
    } else {
      ratio = Math.max(ratio, efficiency);
      benefits.push(
        `Payload Optimization: Native Markdown reduced the agent payload to ${(mdLength / 1024).toFixed(1)}KB, eliminating ~${efficiency.toFixed(0)}% of visual noise.`,
      );
    }
  } else {
    if (ratio < 15) {
      score -= 25;
      penalties.push(
        `Critical: High Code-to-Content noise (${ratio.toFixed(1)}%). AI bots burn 85% of their context on your boilerplate.`,
      );
    } else if (ratio < 30) {
      score -= 10;
      penalties.push('Warning: Moderate noise detected in payload.');
    }

    if (rawLength / 1024 > 200) {
      score -= 10;
      penalties.push(
        `Warning: Page size is very high (${(rawLength / 1024).toFixed(0)}KB).`,
      );
    }
  }

  if (ratio < 30 && !markdownPayload) {
    benefits.push(
      `Massive Token Savings: Stripping the ${(100 - ratio).toFixed(1)}% code boilerplate drastically reduces your LLM context costs.`,
    );
  }

  // JSON-LD
  const jsonLd = $('script[type="application/ld+json"]').length;
  if (jsonLd === 0) {
    score -= 20;
    penalties.push('Missing: No JSON-LD Schema. AI cannot verify your business facts.');
    benefits.push(
      'Metadata Extraction: Onto distills explicit JSON-LD schema so agents ingest precise entities.',
    );
  } else {
    insights.json_ld_present = true;
  }

  // Accessibility
  const missingAlt = $('img:not([alt])').length;
  if (missingAlt > 0) {
    score -= 5;
    penalties.push(
      `Minor: ${missingAlt} images missing alt text. AI models cannot 'see' these products.`,
    );
  }

  // Semantic hierarchy
  const headings = $('h1, h2, h3').length;
  if (headings < 2) {
    score -= 10;
    penalties.push('Warning: Poor Semantic Hierarchy. < 2 headings found.');
    benefits.push(
      'Semantic Reorganization: Onto enforces strict # Header hierarchies inside Markdown.',
    );
  } else {
    insights.semantic_hierarchy = true;
  }

  // Bot preview. Scope <title> to head — SVG icons embed their own <title>
  // accessibility labels and Cheerio's .text() concatenates all matches.
  const headTitle = $('head > title').first().text().trim();
  let titleFallback = '';
  if (!headTitle) {
    const $h1 = $('h1').first().clone();
    $h1.find('svg, script, style, noscript').remove();
    titleFallback = $h1.text().replace(/\s+/g, ' ').trim();
  }
  const title = headTitle || titleFallback || 'Untitled Page';

  const metaDesc =
    $('meta[name="description"]').attr('content') || 'No description found.';

  const mdLines: string[] = [];
  mdLines.push(`# ${title}`);
  mdLines.push(`> ${metaDesc}`);
  mdLines.push('');
  mdLines.push(`**Source:** ${targetUrl}`);
  mdLines.push('');

  // Heading enumeration. Strip chrome (nav/header/footer/aside) so we only see
  // real content headings. The prepended `# {title}` above counts as our sole
  // h1, so demote every body h1 to h2 and cascade further levels accordingly
  // (h2→h3, h3→h4, h4→h4-clamped). Keeps Markdown valid even when the source
  // page over-uses h1 (very common in marketing pages).
  const $preview = cheerio.load(html);
  $preview('nav, header, footer, aside, script, style, noscript, svg, [role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  $preview('h1, h2, h3, h4').each((_i, el) => {
    const tag = (el as { tagName: string }).tagName.toLowerCase();
    const text = $preview(el).text().replace(/\s+/g, ' ').trim();
    if (!text || text.length <= 1 || text.length >= 200) return;
    // Demote: h1→##, h2→###, h3→####, h4→####
    const prefix =
      tag === 'h1' ? '## ' : tag === 'h2' ? '### ' : '#### ';
    mdLines.push(`${prefix}${text}`);
  });

  // Final recommendations
  if (!insights.markdown_supported) {
    recommendations.push({
      title: 'Install @ontosdk/next',
      description:
        'Zero change required to application code. Automates Markdown extraction at build-time.',
      priority: 'High',
    });
  } else if (!input.isUsingOntoSdk) {
    recommendations.push({
      title: 'Migrate to Onto SDK',
      description:
        'Native Markdown detected but lacks agent analytics and policy controls. Upgrade to the Onto layer.',
      priority: 'Medium',
    });
  }

  if (ratio < 40 && !markdownPayload) {
    recommendations.push({
      title: 'Reduce React Tax',
      description:
        'High code-to-content noise detected. Use server-side extraction to reduce LLM token waste.',
      priority: 'Medium',
    });
  }

  if (!insights.json_ld_present) {
    recommendations.push({
      title: 'Add JSON-LD Schema',
      description:
        'Critical for AI to verify facts about products, reviews, and entities. Add standard schema.org scripts.',
      priority: 'Medium',
    });
  }

  if (!insights.semantic_hierarchy) {
    recommendations.push({
      title: 'Fix Semantic Hierarchy',
      description:
        'Ensure you use logical # Header nesting. Use at least two levels of headings (H1, H2).',
      priority: 'Low',
    });
  }

  score = Math.max(0, score);

  return {
    score,
    grade: scoreToGrade(score),
    url: targetUrl,
    metadata: { title, description: metaDesc },
    penalties,
    insights,
    benefits,
    recommendations,
    stats: {
      raw_size: `${(rawLength / 1024).toFixed(0)}KB`,
      htmlSize: `${(rawLength / 1024).toFixed(0)}KB`,
      textLength: cleanText.length,
      efficiency: `${ratio.toFixed(1)}%`,
    },
    botPreview: mdLines.join('\n'),
    isUsingOntoSdk: input.isUsingOntoSdk || false,
  };
}
