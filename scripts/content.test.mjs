import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GEN = join(__dirname, '..', 'src', 'content', '_generated');

const LOBES = new Set(['neuro', 'venture', 'ai']);
const EXPECTED_NODE_IDS = [
  'duke-neuro-chem',
  'fmri',
  'marsh-thesis',
  'wilcox-jaacap',
  'cipher-poster',
  'ushipping',
  'jhtv-pitchbook',
  'atp',
  'second-brain',
];
const EXPECTED_CHAPTER_SLUGS = [
  'who-i-am',
  'the-neuroscience',
  'how-i-think',
  'where-they-meet',
  'contact',
];

function loadDir(sub) {
  const dir = join(GEN, sub);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ file: f, ...matter(readFileSync(join(dir, f), 'utf8')) }));
}

test('generated nodes: the 9 expected ids are present with required fields', () => {
  const nodes = loadDir('nodes');
  const ids = nodes.map((n) => n.data.id).sort();
  assert.deepEqual(ids, [...EXPECTED_NODE_IDS].sort());
  for (const n of nodes) {
    assert.ok(n.data.title, `${n.file} missing title`);
    assert.ok(LOBES.has(n.data.lobe), `${n.file} bad lobe: ${n.data.lobe}`);
    assert.ok(n.data.blurb, `${n.file} missing blurb`);
  }
});

test('generated chapters: the 5 expected slugs are present with order + title', () => {
  const chapters = loadDir('chapters');
  const slugs = chapters.map((c) => c.data.slug).sort();
  assert.deepEqual(slugs, [...EXPECTED_CHAPTER_SLUGS].sort());
  for (const c of chapters) {
    assert.equal(typeof c.data.order, 'number', `${c.file} missing numeric order`);
    assert.ok(c.data.title, `${c.file} missing title`);
  }
});

test('node connections reference only real node ids', () => {
  const nodes = loadDir('nodes');
  const ids = new Set(nodes.map((n) => n.data.id));
  for (const n of nodes) {
    for (const target of n.data.connects ?? []) {
      assert.ok(ids.has(target), `${n.file} connects to unknown id: ${target}`);
    }
  }
});
