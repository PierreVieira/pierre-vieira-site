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
which runs `npx wrangler deploy`; other branches don't build. There is no build step: what is in `public/` is what goes
out.

## From your machine

```bash
npm run deploy
```

Runs `npx wrangler deploy`, and needs `npx wrangler login` first, on the Cloudflare account that has the
pierrevieira.com zone.
