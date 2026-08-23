// src/clean/extractor.ts
import * as cheerio from "cheerio";
import TurndownService from "turndown";

// ../../node_modules/turndown-plugin-gfm/lib/turndown-plugin-gfm.es.js
var highlightRegExp = /highlight-(?:text|source)-([a-z0-9]+)/;
function highlightedCodeBlock(turndownService2) {
  turndownService2.addRule("highlightedCodeBlock", {
    filter: function(node) {
      var firstChild = node.firstChild;
      return node.nodeName === "DIV" && highlightRegExp.test(node.className) && firstChild && firstChild.nodeName === "PRE";
    },
    replacement: function(content, node, options) {
      var className = node.className || "";
      var language = (className.match(highlightRegExp) || [null, ""])[1];
      return "\n\n" + options.fence + language + "\n" + node.firstChild.textContent + "\n" + options.fence + "\n\n";
    }
  });
}
function strikethrough(turndownService2) {
  turndownService2.addRule("strikethrough", {
    filter: ["del", "s", "strike"],
    replacement: function(content) {
      return "~" + content + "~";
    }
  });
}
var indexOf = Array.prototype.indexOf;
var every = Array.prototype.every;
var rules = {};
rules.tableCell = {
  filter: ["th", "td"],
  replacement: function(content, node) {
    return cell(content, node);
  }
};
rules.tableRow = {
  filter: "tr",
  replacement: function(content, node) {
    var borderCells = "";
    var alignMap = { left: ":--", right: "--:", center: ":-:" };
    if (isHeadingRow(node)) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var border = "---";
        var align = (node.childNodes[i].getAttribute("align") || "").toLowerCase();
        if (align) border = alignMap[align] || border;
        borderCells += cell(border, node.childNodes[i]);
      }
    }
    return "\n" + content + (borderCells ? "\n" + borderCells : "");
  }
};
rules.table = {
  // Only convert tables with a heading row.
  // Tables with no heading row are kept using `keep` (see below).
  filter: function(node) {
    return node.nodeName === "TABLE" && isHeadingRow(node.rows[0]);
  },
  replacement: function(content) {
    content = content.replace("\n\n", "\n");
    return "\n\n" + content + "\n\n";
  }
};
rules.tableSection = {
  filter: ["thead", "tbody", "tfoot"],
  replacement: function(content) {
    return content;
  }
};
function isHeadingRow(tr) {
  var parentNode = tr.parentNode;
  return parentNode.nodeName === "THEAD" || parentNode.firstChild === tr && (parentNode.nodeName === "TABLE" || isFirstTbody(parentNode)) && every.call(tr.childNodes, function(n) {
    return n.nodeName === "TH";
  });
}
function isFirstTbody(element) {
  var previousSibling = element.previousSibling;
  return element.nodeName === "TBODY" && (!previousSibling || previousSibling.nodeName === "THEAD" && /^\s*$/i.test(previousSibling.textContent));
}
function cell(content, node) {
  var index = indexOf.call(node.parentNode.childNodes, node);
  var prefix = " ";
  if (index === 0) prefix = "| ";
  return prefix + content + " |";
}
function tables(turndownService2) {
  turndownService2.keep(function(node) {
    return node.nodeName === "TABLE" && !isHeadingRow(node.rows[0]);
  });
  for (var key in rules) turndownService2.addRule(key, rules[key]);
}
function taskListItems(turndownService2) {
  turndownService2.addRule("taskListItems", {
    filter: function(node) {
      return node.type === "checkbox" && node.parentNode.nodeName === "LI";
    },
    replacement: function(content, node) {
      return (node.checked ? "[x]" : "[ ]") + " ";
    }
  });
}
function gfm(turndownService2) {
  turndownService2.use([
    highlightedCodeBlock,
    strikethrough,
    tables,
    taskListItems
  ]);
}

// src/clean/extractor.ts
var turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced"
});
turndownService.use(gfm);
function demoteHeadings(markdown) {
  const lines = markdown.split("\n");
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
      lines[i] = "#".repeat(newLevel) + match[2] + line.slice(match[0].length);
    }
  }
  return lines.join("\n");
}
function extractContent(html, sourceUrl = "Generated Output") {
  const originalSize = html.length;
  const $ = cheerio.load(html);
  const headTitle = $("head > title").first().text().trim();
  let fallback = "";
  if (!headTitle) {
    const $h1 = $("h1").first().clone();
    $h1.find("svg, script, style, noscript").remove();
    fallback = $h1.text().replace(/\s+/g, " ").trim();
  }
  const title = headTitle || fallback || "Untitled Page";
  const description = $('meta[name="description"]').attr("content") || "No description found.";
  const language = $("html").attr("lang");
  const canonicalUrl = $('link[rel="canonical"]').attr("href");
  const jsonLdScripts = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html() || "";
      jsonLdScripts.push(JSON.parse(raw));
    } catch {
    }
  });
  $("script, style, noscript, iframe, svg, nav, footer, meta, link, header").remove();
  let contentHtml = "";
  if ($("main").length > 0) {
    contentHtml = $("main").html() || "";
  } else if ($("article").length > 0) {
    contentHtml = $("article").html() || "";
  } else {
    contentHtml = $("body").html() || "";
  }
  const markdown = demoteHeadings(turndownService.turndown(contentHtml));
  const headerLines = [
    `# ${title}`,
    `> ${description}`,
    ``,
    `**Source:** ${sourceUrl}`,
    `**Extracted:** ${(/* @__PURE__ */ new Date()).toISOString()}`,
    ``,
    `---`,
    ``
  ];
  let finalMarkdown = headerLines.join("\n") + markdown;
  if (jsonLdScripts.length > 0) {
    finalMarkdown += "\n\n---\n## Structured Data (JSON-LD)\n```json\n";
    jsonLdScripts.forEach((j) => {
      finalMarkdown += JSON.stringify(j, null, 2) + "\n";
    });
    finalMarkdown += "```\n";
  }
  const markdownSize = finalMarkdown.length;
  const tokenReductionRatio = originalSize > 0 ? (originalSize - markdownSize) / originalSize * 100 : 0;
  return {
    markdown: finalMarkdown,
    metadata: {
      title,
      description,
      jsonLd: jsonLdScripts,
      language,
      canonicalUrl
    },
    stats: {
      originalHtmlSize: originalSize,
      markdownSize,
      tokenReductionRatio
    }
  };
}

// src/score/aio.ts
import * as cheerio2 from "cheerio";
function scoreToGrade(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs work";
  if (score >= 25) return "AI-hostile";
  return "Invisible";
}
function getHallucinationRisk(score, insights) {
  if (!insights.robots_allowed || score < 50 || !insights.json_ld_present && !insights.semantic_hierarchy) {
    return "high";
  }
  if (score < 80 || !insights.markdown_supported || !insights.json_ld_present || !insights.semantic_hierarchy) {
    return "medium";
  }
  return "low";
}
function calculateAioScore(input) {
  const { html, markdownPayload, targetUrl, robotsAllowed } = input;
  let score = 100;
  const penalties = [];
  const benefits = [];
  const recommendations = [];
  const insights = {
    robots_allowed: robotsAllowed,
    waf_blocked: false,
    markdown_supported: !!markdownPayload,
    json_ld_present: false,
    semantic_hierarchy: false
  };
  const rawLength = html.length;
  const $ = cheerio2.load(html);
  if (!robotsAllowed) {
    score = 0;
    penalties.push("CRITICAL: Blocked by robots.txt. Content is invisible to AI.");
    recommendations.push({
      title: "Allow AI Agents in robots.txt",
      description: "Ensure your robots.txt (or Cloudflare AI Audit) doesn't disallow GPTBot and other AI crawlers.",
      priority: "High"
    });
    return {
      score: 0,
      grade: "Invisible",
      url: targetUrl,
      metadata: { title: "", description: "" },
      penalties,
      insights,
      benefits,
      recommendations,
      stats: { raw_size: "0KB", htmlSize: "0KB", textLength: 0, efficiency: "0%" },
      botPreview: "",
      isUsingOntoSdk: !!input.isUsingOntoSdk
    };
  }
  if (!insights.markdown_supported) {
    score -= 25;
    penalties.push("Critical: No Machine-Readable (Markdown) layer detected.");
  } else if (input.isUsingOntoSdk) {
    benefits.push(
      "Agent Routing (Middleware): Automatically detect GPTBot/Claude and serve pure Markdown payloads directly from the Edge."
    );
  } else {
    score -= 10;
    penalties.push(
      "Warning: Unmanaged AI Payload. Native Markdown is present but lacks Onto-specific brand controls, versioning, and agent analytics."
    );
    benefits.push(
      "Native Markdown Support: This site natively serves Markdown to agents, which improves extraction but lacks the Onto-optimized management layer."
    );
  }
  const $clean = cheerio2.load(html);
  $clean("script, style, noscript, iframe, svg, nav, footer, meta, link").remove();
  const cleanText = $clean("body").text().replace(/\s+/g, " ").trim();
  const cleanHtmlLength = $clean.html()?.length || cleanText.length;
  let ratio = rawLength > 0 ? cleanHtmlLength / rawLength * 100 : 0;
  if (markdownPayload) {
    const mdLength = markdownPayload.length;
    const efficiency = rawLength > 0 ? (1 - mdLength / rawLength) * 100 : 0;
    if (input.isUsingOntoSdk) {
      ratio = 100;
      benefits.push(
        `Zero React Tax: Onto intercepted the agent request and served a ${mdLength} byte payload, completely bypassing the ${(rawLength / 1024).toFixed(1)}KB React visual wrapper.`
      );
    } else {
      ratio = Math.max(ratio, efficiency);
      benefits.push(
        `Payload Optimization: Native Markdown reduced the agent payload to ${(mdLength / 1024).toFixed(1)}KB, eliminating ~${efficiency.toFixed(0)}% of visual noise.`
      );
    }
  } else {
    if (ratio < 15) {
      score -= 25;
      penalties.push(
        `Critical: High Code-to-Content noise (${ratio.toFixed(1)}%). AI bots burn 85% of their context on your boilerplate.`
      );
    } else if (ratio < 30) {
      score -= 10;
      penalties.push("Warning: Moderate noise detected in payload.");
    }
    if (rawLength / 1024 > 200) {
      score -= 10;
      penalties.push(
        `Warning: Page size is very high (${(rawLength / 1024).toFixed(0)}KB).`
      );
    }
  }
  if (ratio < 30 && !markdownPayload) {
    benefits.push(
      `Massive Token Savings: Stripping the ${(100 - ratio).toFixed(1)}% code boilerplate drastically reduces your LLM context costs.`
    );
  }
  const jsonLd = $('script[type="application/ld+json"]').length;
  if (jsonLd === 0) {
    score -= 20;
    penalties.push("Missing: No JSON-LD Schema. AI cannot verify your business facts.");
    benefits.push(
      "Metadata Extraction: Onto distills explicit JSON-LD schema so agents ingest precise entities."
    );
  } else {
    insights.json_ld_present = true;
  }
  const missingAlt = $("img:not([alt])").length;
  if (missingAlt > 0) {
    score -= 5;
    penalties.push(
      `Minor: ${missingAlt} images missing alt text. AI models cannot 'see' these products.`
    );
  }
  const headings = $("h1, h2, h3").length;
  if (headings < 2) {
    score -= 10;
    penalties.push("Warning: Poor Semantic Hierarchy. < 2 headings found.");
    benefits.push(
      "Semantic Reorganization: Onto enforces strict # Header hierarchies inside Markdown."
    );
  } else {
    insights.semantic_hierarchy = true;
  }
  const headTitle = $("head > title").first().text().trim();
  let titleFallback = "";
  if (!headTitle) {
    const $h1 = $("h1").first().clone();
    $h1.find("svg, script, style, noscript").remove();
    titleFallback = $h1.text().replace(/\s+/g, " ").trim();
  }
  const title = headTitle || titleFallback || "Untitled Page";
  const metaDesc = $('meta[name="description"]').attr("content") || "No description found.";
  const mdLines = [];
  mdLines.push(`# ${title}`);
  mdLines.push(`> ${metaDesc}`);
  mdLines.push("");
  mdLines.push(`**Source:** ${targetUrl}`);
  mdLines.push("");
  const $preview = cheerio2.load(html);
  $preview('nav, header, footer, aside, script, style, noscript, svg, [role="navigation"], [role="banner"], [role="contentinfo"]').remove();
  $preview("h1, h2, h3, h4").each((_i, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $preview(el).text().replace(/\s+/g, " ").trim();
    if (!text || text.length <= 1 || text.length >= 200) return;
    const prefix = tag === "h1" ? "## " : tag === "h2" ? "### " : "#### ";
    mdLines.push(`${prefix}${text}`);
  });
  if (!insights.markdown_supported) {
    recommendations.push({
      title: "Install @ontosdk/next",
      description: "Zero change required to application code. Automates Markdown extraction at build-time.",
      priority: "High"
    });
  } else if (!input.isUsingOntoSdk) {
    recommendations.push({
      title: "Migrate to Onto SDK",
      description: "Native Markdown detected but lacks agent analytics and policy controls. Upgrade to the Onto layer.",
      priority: "Medium"
    });
  }
  if (ratio < 40 && !markdownPayload) {
    recommendations.push({
      title: "Reduce React Tax",
      description: "High code-to-content noise detected. Use server-side extraction to reduce LLM token waste.",
      priority: "Medium"
    });
  }
  if (!insights.json_ld_present) {
    recommendations.push({
      title: "Add JSON-LD Schema",
      description: "Critical for AI to verify facts about products, reviews, and entities. Add standard schema.org scripts.",
      priority: "Medium"
    });
  }
  if (!insights.semantic_hierarchy) {
    recommendations.push({
      title: "Fix Semantic Hierarchy",
      description: "Ensure you use logical # Header nesting. Use at least two levels of headings (H1, H2).",
      priority: "Low"
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
      efficiency: `${ratio.toFixed(1)}%`
    },
    botPreview: mdLines.join("\n"),
    isUsingOntoSdk: input.isUsingOntoSdk || false
  };
}

// src/score/bots.ts
var AI_BOTS = [
  // OpenAI
  { name: "GPTBot", company: "OpenAI", addedAt: "2025-01-01" },
  { name: "ChatGPT-User", company: "OpenAI", addedAt: "2025-01-01" },
  { name: "OAI-SearchBot", company: "OpenAI", addedAt: "2025-01-01" },
  { name: "ChatGPT", company: "OpenAI", addedAt: "2025-03-25" },
  { name: "OpenAI", company: "OpenAI", addedAt: "2025-03-25" },
  { name: "GPT", company: "OpenAI", addedAt: "2025-03-25" },
  // Google (Googlebot proper is EXCLUDED — SEO safety)
  { name: "Google-CloudVertexBot", company: "Google", addedAt: "2025-01-01" },
  { name: "Google-Extended", company: "Google", addedAt: "2025-01-01" },
  { name: "GoogleOther", company: "Google", addedAt: "2025-01-01" },
  // Anthropic
  { name: "ClaudeBot", company: "Anthropic", addedAt: "2025-01-01" },
  { name: "Claude-User", company: "Anthropic", addedAt: "2025-01-01" },
  { name: "claude-fetch", company: "Anthropic", addedAt: "2025-03-25" },
  { name: "AnthropicFetch", company: "Anthropic", addedAt: "2025-03-25" },
  { name: "Claude-Fetch", company: "Anthropic", addedAt: "2025-03-25" },
  { name: "anthropic-ai", company: "Anthropic", addedAt: "2025-01-01" },
  { name: "Claude", company: "Anthropic", addedAt: "2025-03-25" },
  { name: "Anthropic", company: "Anthropic", addedAt: "2025-03-25" },
  // Perplexity
  { name: "PerplexityBot", company: "Perplexity", addedAt: "2025-01-01" },
  { name: "Perplexity-User", company: "Perplexity", addedAt: "2025-01-01" },
  { name: "Perplexity", company: "Perplexity", addedAt: "2025-03-25" },
  // Meta
  { name: "Meta-ExternalAgent", company: "Meta", addedAt: "2025-01-01" },
  { name: "Meta-ExternalFetcher", company: "Meta", addedAt: "2025-01-01" },
  { name: "facebookexternalhit", company: "Meta", addedAt: "2025-03-25" },
  { name: "FacebookBot", company: "Meta", addedAt: "2025-01-01" },
  // Mistral
  { name: "MistralBot", company: "Mistral", addedAt: "2025-03-25" },
  { name: "Mistral", company: "Mistral", addedAt: "2025-03-25" },
  // Amazon
  { name: "Amazonbot", company: "Amazon", addedAt: "2025-03-25" },
  // Others
  { name: "AI2Bot", company: "Allen Institute", addedAt: "2025-03-25" },
  { name: "DuckAssistBot", company: "DuckDuckGo", addedAt: "2025-03-25" },
  { name: "Diffbot", company: "Diffbot", addedAt: "2025-03-25" },
  { name: "CCBot", company: "Common Crawl", addedAt: "2025-01-01" },
  { name: "Bytespider", company: "ByteDance", addedAt: "2025-01-01" },
  { name: "Applebot-Extended", company: "Apple", addedAt: "2025-01-01" },
  { name: "YouBot", company: "You.com", addedAt: "2025-01-01" },
  // Generic AI / scraping libraries
  { name: "python-requests", company: "Generic Bot", addedAt: "2025-03-25" },
  { name: "python-httpx", company: "Generic Bot", addedAt: "2025-03-25" },
  { name: "httpx", company: "Generic Bot", addedAt: "2025-03-25" },
  { name: "axios", company: "Generic Bot", addedAt: "2025-03-25" },
  { name: "node-fetch", company: "Generic Bot", addedAt: "2025-03-25" },
  { name: "Go-http-client", company: "Generic Bot", addedAt: "2025-03-25" },
  { name: "Wget", company: "Generic Bot", addedAt: "2025-03-25" },
  { name: "Curl", company: "Generic Bot", addedAt: "2025-03-25" }
];
var AI_BOT_USER_AGENTS = AI_BOTS.map((bot) => bot.name);
function matchBot(userAgent) {
  if (!userAgent) return void 0;
  const lowerUA = userAgent.toLowerCase();
  const matches = AI_BOTS.filter(
    (bot) => lowerUA.includes(bot.name.toLowerCase())
  );
  if (matches.length === 0) return void 0;
  if (matches.length === 1) return matches[0];
  return matches.reduce(
    (longest, current) => current.name.length > longest.name.length ? current : longest
  );
}
export {
  AI_BOTS,
  AI_BOT_USER_AGENTS,
  calculateAioScore,
  extractContent,
  getHallucinationRisk,
  matchBot,
  scoreToGrade
};
//# sourceMappingURL=index.mjs.map