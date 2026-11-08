# Cole Kannam — personal site

A one-page "second resume" that tells the story of what I have built: my company (UShip OS), my AI second brain, the JHTV matching tool, my own job-search engine, and Daily Board. The thesis: I came to Duke pre-med, and as AI commoditized domain knowledge I learned to build with it in every part of my life.

Static site, no build step. Plain HTML, CSS, and a little vanilla JS.

## Files
- `index.html` — the page
- `styles.css` — styles (Direction "Connected": dark, node-graph hero)
- `script.js` — hero graph interactions + one load reveal
- `assets/` — resume PDF
- `render.yaml` — Render static-site blueprint

## Run locally
```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy (Render)
Connect this repo as a **Static Site** on Render (or use the included `render.yaml` blueprint). Publish directory is the repo root; no build command needed. Add a custom domain in the Render dashboard once purchased.
