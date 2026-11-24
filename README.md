# pierrevieira.com

<a href="docs/images/readme-hero-light.webp#gh-light-mode-only"><img alt="pierrevieira.com in a desktop browser and on a phone: the portrait, &quot;I build apps people use every day.&quot;, the résumé and the numbers" src="docs/images/readme-hero-light.webp#gh-light-mode-only"></a>
<a href="docs/images/readme-hero-dark.webp#gh-dark-mode-only"><img alt="pierrevieira.com in a desktop browser and on a phone: the portrait, &quot;I build apps people use every day.&quot;, the résumé and the numbers" src="docs/images/readme-hero-dark.webp#gh-dark-mode-only"></a>

Pierre Vieira's portfolio: one responsive page with his apps (Blitz Split and Bible Planner), experience, skills,
talks and contact, in English, Portuguese (Brazil) and Spanish, light and dark.

Plain HTML, CSS and JavaScript with no build and no dependencies. The image above is the page itself, at a desktop's
width and at a phone's, captured by [`scripts/readme-hero/generate.mjs`](scripts/readme-hero/generate.mjs):
`npm run readme-hero` draws it again after a change to the page.

A link to the site unfolds into a card in WhatsApp, LinkedIn, Slack and the like: `public/img/link-card.png`, drawn
from the hero by [`scripts/link-card/generate.mjs`](scripts/link-card/generate.mjs). `npm run link-card` draws it again
after a change to the hero, and writes the image's version in the page's `og:image`.

## Run

```bash
npm run dev
```

Serves `public/` at http://localhost:4321 (Python's `http.server`; any static server works).

## Deploy

Every commit on `main` deploys to pierrevieira.com through Cloudflare's Workers Builds: see
[`docs/deploy.md`](docs/deploy.md).

## Analytics

Google Analytics, through the site's own Firebase project (`pierrevieira-site`): see
[`docs/analytics.md`](docs/analytics.md) for how it loads and every event.

## Credits

Geist and Geist Mono are under the SIL Open Font License (`public/fonts/OFL.txt`). Icons are from
[Lucide](https://lucide.dev) (ISC).
