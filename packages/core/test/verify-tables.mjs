/* Verification against the BUILT artifact (dist/clean.mjs), not src — proves
   the shipped output, including the inlined turndown-plugin-gfm tables rule.
   Run: node test/verify-tables.mjs   (from packages/core) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extractContent } from '../dist/clean.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'fixtures', 'pricing-table.html'), 'utf8');

const { markdown } = extractContent(html, 'https://buildonto.dev/pricing');
console.log('───── EXTRACTED MARKDOWN ─────\n');
console.log(markdown);
console.log('\n──────────────────────────────\n');

const checks = [
  ['header row present', /\|\s*Plan\s*\|\s*Price \/ mo\s*\|/.test(markdown)],
  ['separator row present', /\|\s*---+\s*\|/.test(markdown)],
  ['Growth bound to $49', /\|\s*Growth\s*\|\s*\$49\s*\|/.test(markdown)],
  ['Scale bound to $250', /\|\s*Scale\s*\|\s*\$250\s*\|/.test(markdown)],
  ['strikethrough old price kept', /~~?\$19~~?/.test(markdown)],
  ['no run-on cell concat (FreeStarter)', !/Free\s*Starter|0\s*1,000\s*1\s*Starter/.test(markdown)],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} check(s) FAILED`);
  process.exit(1);
}
console.log('\nAll checks passed.');
