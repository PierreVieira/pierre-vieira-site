# pierrevieira.com

Pierre Vieira's portfolio at pierrevieira.com: one page (`public/index.html`), plain HTML, CSS and JavaScript with no
build and no dependencies. See [`README.md`](README.md) for what each file holds.

## Conventions

- Write code, comments, docs and commit messages in English.
- The markup is in English. Every string the page shows has a `data-i18n` key (`data-i18n-html` when it holds markup,
  `-label`, `-alt` and `-content` for attributes) with its Portuguese in `public/strings/pt.js`. Add both in the same
  change and run `npm run check:translations`.
- An image that shows words has its Portuguese version in `data-src-pt`.
- `public/site.css` holds the tokens (light and dark) and every component: use the tokens, never raw colors.
- `public/boot.js` runs in `<head>` and decides the theme, the language and `.motion` before the first paint. Every
  entrance animation hangs on `:root.motion`, so with reduced motion (or a pinned `?theme=`) the page is still and
  complete.
- The facts on the page (dates, roles, numbers) come from Pierre's résumé (`public/cv/pierre-vieira-cv.pdf`): change
  both together, and never invent a figure.
- Check a visual change at 375, 768, 1024 and 1440 pixels wide, in light and dark, with `npm run dev` running.
