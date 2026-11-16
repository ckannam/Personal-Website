import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Content comes ONLY from the publish-gate output in src/content/_generated.
// Nothing here reads the private vault directly.
const nodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/_generated/nodes' }),
  schema: z.object({
    publish: z.literal(true),
    id: z.string(),
    title: z.string(),
    lobe: z.enum(['neuro', 'venture', 'ai']),
    status: z.string().optional(),
    blurb: z.string(),
    href: z.string().optional(), // absolute URL or site-relative path (e.g. /assets/…pdf)
    connects: z.array(z.string()).default([]),
  }),
});

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/_generated/chapters' }),
  schema: z.object({
    publish: z.literal(true),
    slug: z.string(),
    order: z.number(),
    title: z.string(),
  }),
});

export const collections = { nodes, chapters };
