# pierrevieira.com

Pierre Vieira's portfolio: one responsive page with his apps (Blitz Split and Bible Planner), experience, skills,
talks and contact, in English and Portuguese (Brazil), light and dark.

Plain HTML, CSS and JavaScript with no build and no dependencies, in the same model as
[blitz-split-site](https://github.com/Quartel-Enterprise/blitz-split-site).

## Run

```bash
npm run dev
```

Serves `public/` at http://localhost:4321 (Python's `http.server`; any static server works).

## How it is made

| File | What it holds |
| --- | --- |
| `public/index.html` | The page, in English. Every translated place has a `data-i18n` key. |
| `public/strings/pt.js` | The page's words in Portuguese (Brazil), by key. |
| `public/boot.js` | Runs in `<head>`: picks the theme, the language and `.motion` before the first paint. |
| `public/site.js` | Translates the page and runs the language, theme and section menus. |
| `public/site.css` | The design tokens (light and dark) and every component. |
| `public/img`, `public/cv` | The portrait, the apps' store art in both languages, the talks' covers and the résumé. |

- **Language**: `?lang=en|pt`, then the last one picked in the header's menu, then the browser's languages, English
  when none is ours. "System" forgets the choice. Adding a string means adding its key to `index.html` and to
  `strings/pt.js`: `npm run check:translations` fails on a missing or unused one.
- **Theme**: Light, Dark or System (the default), kept for the next visit; `?theme=light|dark` pins one and turns the
  entrance animations off, for captures.
- **Design**: minimal and editorial, a zinc base with one blue accent, Geist and Geist Mono. Components use the tokens
  in `site.css`, never raw colors. The direction started from the
  [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill's recommendations (monochrome plus a
  blue accent, the portfolio section order, its accessibility checklist).

## Credits

Geist and Geist Mono are under the SIL Open Font License (`public/fonts/OFL.txt`). Icons are from
[Lucide](https://lucide.dev) (ISC).
