# Personal-Website — design brief

Cole Kannam's hiring site. A 2D neural/Obsidian-style graph hero plus scroll-driven
chapters. Built with Astro (static) + a React island for the graph; deployed on Render
from GitHub.

**Spec:** `~/Desktop/Second Brain/docs/superpowers/specs/2026-11-16-portfolio-site-design.md`
**Plan:** `~/Desktop/Second Brain/docs/superpowers/plans/2026-11-16-portfolio-site.md`

## Audience
Recruiters and hiring managers at the **science / AI intersection** — biotech, AI labs
doing science, science-focused VC/accelerators (Activate-style). They skim fast and often
on a phone.

## One-line thesis
**Neuro × AI** — a neuroscientist who drives AI impact in every seat he sits in. The graph
*is* the argument: a neuroscience lobe and a venture lobe, bridged by an AI spine whose
edges reach into every role.

## Visual direction
Dark, precise, "second-brain / neural graph" aesthetic. Deliberately **avoid the generic-AI
look** (no default Inter + purple-gradient + uniform rounded cards). Use the frontend-design
skill for type and color decisions. Typography and dark palette inherited in spirit from the
prior vanilla build (Clash Display / General Sans / IBM Plex Mono are fair game).

## Hard rules
- **Privacy invariant:** the only path from Cole's private Obsidian vault to this repo is the
  `publish-gate` script (`scripts/publish-gate.mjs`), which admits a note only if its
  frontmatter has `publish: true` and reads ONLY the vault's `Portfolio/` folder. No Astro or
  React code imports from the vault directly. The gate's committed output in
  `src/content/_generated/` is what Render deploys (Render can't read the local vault).
- **Accuracy of research labels (verbatim):** Wilcox = "Peer-reviewed publication, JAACAP
  (2026)"; CIPHER = "First-author poster, Duke Anesthesiology"; Marsh = "Senior thesis — in
  progress (Grad with Distinction, Spring 2027)". Never call in-progress work "published."
- **Identity line** visible immediately, before any animation.
- **Reduced motion:** honor `prefers-reduced-motion: reduce` — no scroll-scrub or graph
  auto-animation; a static layout and a "skip the animation / 60-second version" path always.
- **Contact:** email `cole.kannam@duke.edu` (`mailto:`), phone `443-682-2254` rendered
  scraper-resistant (not plain text in HTML), résumé viewable + downloadable
  (`public/assets/Cole_Kannam_Resume.pdf`).

## Deploy
GitHub repo `ckannam/Personal-Website` → Render Static Site. Build: `npm run sync && npm run
build`; publish dir `dist`. See `render.yaml`.
