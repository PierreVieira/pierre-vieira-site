# Contributing

This is Pierre Vieira's personal portfolio, so its content (the text, the facts and the photos) is his to write. Still,
reports and fixes are welcome: a broken link, a typo, a translation that reads wrong, a layout that breaks on your
device, or an accessibility barrier.

By contributing, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md) and that your contribution is used
under the terms of the [license](LICENSE): the source is public to read and to contribute to, but it is not open
source.

## Reporting a problem or suggesting something

- **A bug or a translation that reads wrong**: open an issue with the **Bug report** template. Say which browser and
  device, which language and theme, what you did, what you expected and what happened instead. Screenshots help a lot.
- **An idea**: open an issue with the **Feature request** template, starting from the problem it solves.
- **A security problem**: never in a public issue. Follow the [security policy](SECURITY.md).

Search the existing issues first: someone may have reported it already.

## Before writing code

For anything bigger than a small fix, open an issue first and agree on the change before writing it. Then read
[CLAUDE.md](CLAUDE.md), which holds the conventions, and the [README](README.md).

## How the site is made

One page (`public/index.html`), plain HTML, CSS and JavaScript with no build and no dependencies.
[Deploy](docs/deploy.md) explains how it goes out, and `npm run dev` serves it at http://localhost:4321.

- `public/site.css` holds the tokens (light and dark) and every component. Use the tokens, never raw colors.
- Every string the page shows has a `data-i18n` key, with its Portuguese in `public/strings/pt.js` and its Spanish in
  `public/strings/es.js`, added in the same change.
- Every entrance animation hangs on `:root.motion`, so with reduced motion the page is still and complete.
- The facts on the page come from the résumé: never invent a figure.
- A new analytics event gets its row in [analytics](docs/analytics.md) in the same change.

## Making a change

1. Fork the repository and branch from `main`. Name the branch `<type>/<short-description>`, where the type is one of
   `fix`, `feature`, `enhancement`, `refactor` or `chore`.
2. Write code, comments, docs and commit messages in **English**. Only the text a person sees on the page is
   translated.
3. Check a visual change at 375, 768, 1024 and 1440 pixels wide, in light and dark, with `npm run dev` running.
4. Run `npm run check:translations`.

## Opening the pull request

- Title it `<type>: <summary>` in the [Conventional Commits](https://www.conventionalcommits.org) form, in English:
  `fix: keep the language menu open on scroll`.
- Fill in the pull request template: the problem, the change, and how you checked it.
- Add screenshots for any visual change, in light and dark, on a phone and a wide screen.

Every pull request is reviewed before it merges, and every commit on `main` deploys to pierrevieira.com.
