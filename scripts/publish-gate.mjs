// publish-gate — the ONLY path from Cole's private Obsidian vault into this repo.
// It reads ONLY the given Portfolio directory and admits a note into the site
// ONLY when its frontmatter has `publish: true`. Everything else stays private.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';
import { homedir } from 'node:os';
import matter from 'gray-matter';

/** Recursively list .md files under a directory (and only under it). */
function markdownFilesUnder(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFilesUnder(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

/**
 * Collect only the publishable notes under `portfolioDir`.
 * @returns {Array<{slug: string, frontmatter: object, body: string}>}
 */
export function collectPublishable(portfolioDir) {
  if (!existsSync(portfolioDir)) return [];
  const notes = [];
  for (const file of markdownFilesUnder(portfolioDir)) {
    const { data, content } = matter(readFileSync(file, 'utf8'));
    if (data.publish !== true) continue; // the gate — strict true only
    const slug = relative(portfolioDir, file).replace(/\.md$/, '').split(sep).join('/');
    notes.push({ slug, frontmatter: data, body: content.trim() });
  }
  return notes;
}

/** Write the publishable notes into `outDir`, mirroring their relative paths. Replaces outDir. */
export function syncToRepo(portfolioDir, outDir) {
  rmSync(outDir, { recursive: true, force: true });
  const notes = collectPublishable(portfolioDir);
  for (const note of notes) {
    const dest = join(outDir, `${note.slug}.md`);
    mkdirSync(dirname(dest), { recursive: true });
    const fm = matter.stringify(note.body, note.frontmatter);
    writeFileSync(dest, fm);
  }
  return notes;
}

// CLI: sync the real vault Portfolio/ into the committed content dir.
if (import.meta.url === `file://${process.argv[1]}`) {
  const vaultPortfolio =
    process.env.VAULT_PORTFOLIO ?? join(homedir(), 'Desktop', 'Second Brain', 'Portfolio');
  const outDir = join(process.cwd(), 'src', 'content', '_generated');
  const notes = syncToRepo(vaultPortfolio, outDir);
  console.log(`publish-gate: synced ${notes.length} note(s) from ${vaultPortfolio} → ${outDir}`);
}
