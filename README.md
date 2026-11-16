# Cole Kannam — Personal-Website

A hiring site: a calm "Neuro × AI" story told through an interactive graph hero and
editorial sections. Astro (static) + a React graph island, deployed on Render.

Public content flows one way from a `Portfolio/` folder in a private Obsidian vault through
a `publish: true` gate (`scripts/publish-gate.mjs`) into `src/content/_generated/` — the only
path by which vault content reaches this repo.

## Develop
```
npm install
npm run dev        # http://localhost:4321/
npm test           # node --test (gate, content, reveal, contact)
```

## Update public content
Edit notes in the vault's `Portfolio/` folder (set `publish: true`), then:
```
npm run sync       # copies only publish:true notes into src/content/_generated
git add -A && git commit && git push   # Render deploys the committed content
```

## Deploy
GitHub → Render Static Site (`render.yaml`): `npm ci && npm run build`, publish `dist`.
See `CLAUDE.md` for the full design brief and rules.
