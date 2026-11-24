# Deploy

The site is a Cloudflare Worker with static assets only: `wrangler.jsonc` serves `public/` as it is, with no Worker
script, at pierrevieira.com and www.pierrevieira.com (Custom Domains, whose DNS records the deploy creates in the
pierrevieira.com zone). Any unknown path answers with the page, as it has only one.

For AI agents, `public/llms.txt` describes the site in Markdown and `public/.well-known/ard.json` is its Agentic
Resource Discovery manifest (with the same content at `ai-catalog.json`, the older name). They must exist as files:
a missing one would answer with the page, and Lighthouse's Agentic Browsing audits fail on HTML where they expect
Markdown or JSON.

## From `main`

Every commit on `main` deploys through [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/),
which runs `npx wrangler deploy`; other branches don't build. What is in `public/` is what goes out, plus the one
built file below.

## The résumé

`cv/pierre-vieira-cv.tex` is the résumé's only source; the PDF is not in git. Before every upload, `wrangler deploy`
runs the `build.command` in `wrangler.jsonc`, `scripts/build-cv.sh`, which compiles the .tex with
[Tectonic](https://tectonic-typesetting.github.io/) into `public/cv/cv_pierre_vieira.pdf`, the path the page links to.
The script uses a `tectonic` on PATH (`brew install tectonic`) or downloads a pinned release into `.cache/` and checks
its SHA-256; Tectonic itself fetches the LaTeX packages the first time. Tectonic runs XeTeX, so the .tex must not
force a pdfTeX driver (as `\usepackage[pdftex]{hyperref}` would).

To change the résumé, edit the .tex and push. `npm run build:cv` builds the PDF locally to look at it, and
`npm run dev` builds it when the .tex is newer than the PDF.

## From your machine

```bash
npm run deploy
```

Runs `npx wrangler deploy`, and needs `npx wrangler login` first, on the Cloudflare account that has the
pierrevieira.com zone.
