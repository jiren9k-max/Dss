# DSS Detailing Sarajevo — website

Static one-page site (HTML/CSS/JS, no build step).

- `index.html`, `styles.css`, `script.js` — the site
- `public/real/` — DSS's own before/after collages (from the OLX ad)
- `public/before-after/` — the same photos split into prije/poslije for the slider
- `public/stock/` — free Unsplash photos (see `public/stock/CREDITS.md`)

Local preview:

```bash
node server.js   # http://127.0.0.1:4318
```

Deployed on Vercel as a static site.
