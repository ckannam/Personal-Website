import { getCollection } from 'astro:content';

export type Lobe = 'neuro' | 'venture' | 'ai' | 'center';

export interface GraphNode {
  id: string;
  title: string;
  lobe: Lobe;
  status?: string;
  blurb: string;
  href?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  /** spine links (from the AI node) are emphasized — they carry the "AI in every seat" claim */
  spine?: boolean;
}

export const CENTER_ID = 'cole';

/**
 * Build the graph from the gated content collection.
 * Adds a synthetic center "Cole" node linked to every real node, and turns each
 * note's `connects` list into links (spine = links originating at the AI node).
 */
export async function buildGraph(): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const entries = await getCollection('nodes');

  const nodes: GraphNode[] = [
    { id: CENTER_ID, title: 'Cole Kannam', lobe: 'center', blurb: 'Neuro × AI' },
    ...entries.map((e) => ({
      id: e.data.id,
      title: e.data.title,
      lobe: e.data.lobe as Lobe,
      status: e.data.status,
      blurb: e.data.blurb,
      href: e.data.href,
    })),
  ];

  const ids = new Set(nodes.map((n) => n.id));
  const seen = new Set<string>();
  const links: GraphLink[] = [];

  // center reaches every real node
  for (const e of entries) {
    links.push({ source: CENTER_ID, target: e.data.id });
    seen.add(`${CENTER_ID}>${e.data.id}`);
  }

  // explicit connections from each note
  for (const e of entries) {
    const spine = e.data.lobe === 'ai';
    for (const target of e.data.connects) {
      if (!ids.has(target)) continue;
      const key = `${e.data.id}>${target}`;
      const rev = `${target}>${e.data.id}`;
      if (seen.has(key) || seen.has(rev)) continue;
      seen.add(key);
      links.push({ source: e.data.id, target, spine });
    }
  }

  return { nodes, links };
}
