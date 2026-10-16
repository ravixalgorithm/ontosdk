/* Regression: sibling elements that render as separate boxes (flex/grid
   children, inline-flex badges, block spans, buttons) must not glue together.
   Fixture is shaped like playthrou.diip3sh.xyz. Runs against the BUILT dist.
   Run: node test/verify-boxes.mjs   (from packages/core) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extractContent } from '../dist/clean.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'fixtures', 'flex-boxes.html'), 'utf8');
const { markdown } = extractContent(html, 'https://example.test/');
console.log(markdown);

const checks = [
  ['chips separated', /click zoom zoomOut/.test(markdown)],
  ['list row separated', /PT-12 Billing shows a stale plan Bug/.test(markdown)],
  ['flex-col cell separated', /\|\s*Settle 180ms\s*\|/.test(markdown)],
  ['blocks around a hidden input stay apart', /Camera\n\nPause/.test(markdown)],
  ['display:block style separated', /Styled inline/.test(markdown)],
  ['inline formatting untouched', /\*\*bold\*\*word and _em_phasis/.test(markdown)],
  ['code untouched', /const a = 1;a/.test(markdown)],
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
