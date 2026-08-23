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
export {
  extractContent
};
//# sourceMappingURL=clean.mjs.map