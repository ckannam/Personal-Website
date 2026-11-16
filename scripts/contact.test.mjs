import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

// Asserts over the BUILT output — run `npm run build` first.
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist', 'index.html');

function html() {
  assert.ok(existsSync(DIST), 'dist/index.html missing — run `npm run build` before this test');
  return readFileSync(DIST, 'utf8');
}

test('contact: email is a mailto link to the Duke address', () => {
  assert.match(html(), /mailto:cole\.kannam@duke\.edu/);
});

test('contact: résumé is linked for viewing/download', () => {
  assert.match(html(), /assets\/Cole_Kannam_Resume\.pdf/);
});

test('contact: phone number is NOT present as scrapeable plain text', () => {
  const h = html();
  assert.ok(!h.includes('443-682-2254'), 'formatted phone leaked into HTML');
  assert.ok(!h.includes('4436822254'), 'raw phone digits leaked into HTML');
  assert.ok(!h.includes('tel:+14436822254'), 'tel: link with digits leaked into HTML');
});
