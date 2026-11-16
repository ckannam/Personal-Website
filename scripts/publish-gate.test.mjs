import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { collectPublishable, syncToRepo } from './publish-gate.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORTFOLIO = join(__dirname, '__fixtures__', 'Portfolio');

test('collectPublishable includes a note with publish: true', () => {
  const titles = collectPublishable(PORTFOLIO).map((n) => n.frontmatter.title);
  assert.ok(titles.includes('Published Node'));
});

test('collectPublishable excludes a note with publish: false', () => {
  const titles = collectPublishable(PORTFOLIO).map((n) => n.frontmatter.title);
  assert.ok(!titles.includes('Draft Node'));
});

test('collectPublishable excludes a note with no publish key', () => {
  const titles = collectPublishable(PORTFOLIO).map((n) => n.frontmatter.title);
  assert.ok(!titles.includes('No Flag Node'));
});

test('collectPublishable reads only files under the given Portfolio dir', () => {
  const titles = collectPublishable(PORTFOLIO).map((n) => n.frontmatter.title);
  assert.ok(!titles.includes('Private Sibling OUTSIDE Portfolio'));
  // Only the one publishable fixture survives the gate.
  assert.equal(collectPublishable(PORTFOLIO).length, 1);
});

test('syncToRepo writes exactly the publishable set and nothing else', () => {
  const out = mkdtempSync(join(tmpdir(), 'gate-out-'));
  try {
    syncToRepo(PORTFOLIO, out);
    const written = readdirSync(out, { recursive: true }).filter((f) =>
      String(f).endsWith('.md'),
    );
    assert.equal(written.length, 1, 'only one publishable note should be written');
    assert.ok(String(written[0]).includes('published-note'));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
