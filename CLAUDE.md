# pierrevieira.com

Pierre Vieira's portfolio at pierrevieira.com: one page (`public/index.html`), plain HTML, CSS and JavaScript with no
build and no dependencies, but for the résumé PDF, which the deploy compiles from `cv/pierre-vieira-cv.tex`. Each file
opens with a comment on what it holds; `docs/` has the deploy ([`docs/deploy.md`](docs/deploy.md)), the analytics
([`docs/analytics.md`](docs/analytics.md)) and the pull request checks ([`docs/checks.md`](docs/checks.md)).

## Conventions

- Write code, comments, docs and commit messages in English.
- The markup is in English. Every string the page shows has a `data-i18n` key (`data-i18n-html` when it holds markup,
  `-label`, `-alt` and `-content` for attributes) with its Portuguese in `public/strings/pt.js` and its Spanish in
  `public/strings/es.js`. Add all of them in the same change and run `npm run check:translations`.
- An image that shows words has each other language's version in `data-src-pt` and `data-src-es`. A logo of the teams' row
  that does has them in `data-href-pt` and `data-href-es`, on its `<use>`.
- The teams' logos are symbols of `public/img/team-logos.svg`, and the `<svg>` that uses one repeats its viewBox: run
  `npm run check:team-logos` after a change to either.
- `public/site.css` holds the tokens (light and dark) and every component: use the tokens, never raw colors.
- `public/boot.js` runs in `<head>` and decides the theme, the language and `.motion` before the first paint. Every
  entrance animation hangs on `:root.motion`, so with reduced motion (or a pinned `?theme=`) the page is still and
  complete.
- The facts on the page (dates, roles, numbers) come from Pierre's résumé, `cv/pierre-vieira-cv.tex` (its only
  source: the PDF is built on deploy, see [`docs/deploy.md`](docs/deploy.md)), and, for the apps, from their
  repositories: never invent a figure. The hero keeps to "apps" and "software engineer", but for the current job under
  the portrait, which names Android; the Android and Kotlin Multiplatform detail belongs to the experience and skills
  sections.
- To change the résumé, use the `edit-cv` skill: it edits the .tex, builds and checks the PDF and opens a pull
  request.
- `public/llms.txt` repeats the page's facts for AI agents (companies, roles, dates, apps): keep it in step with the
  page.
- The years of experience are never written by hand: a `[data-years]` element (`data-years="word"` spelled out) is
  filled by `site.js` from the first job's date, in every language.
- Analytics goes through `window.track()` (`public/analytics.js`, Firebase project `pierrevieira-site`). A new event
  gets its row in `docs/analytics.md` in the same change.
- The README's image is the real page: run `npm run readme-hero` after a change to the hero.
- The card a link to the site unfolds into (`public/img/link-card.png`, the page's `og:image`) is drawn from the hero's
  own words, mark and portrait: run `npm run link-card` after a change to any of them, or to the teams' names. It also
  writes the image's version (`?v=`) in the `og:image`, so commit `public/index.html` with the image.
- Don't copy code between files: extract it. `./scripts/cpd.sh` runs the copied-code check CI runs
  ([`docs/checks.md`](docs/checks.md)).
- Check a visual change at 375, 768, 1024 and 1440 pixels wide, in light and dark, with `npm run dev` running.
