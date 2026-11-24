# Analytics

The page uses Google Analytics' `gtag.js`, which reports to the Firebase project `pierrevieira-site` (web app
`pierrevieira.com`, measurement id `G-DFWXEW94N0`): a project of its own, as Blitz Split's site has `blitzsplit-site`,
so the portfolio's visits don't mix with the apps' numbers.

`public/analytics.js`, loaded with `defer` in `<head>`, sets up Google Analytics and gives `site.js`
`window.track(name, params)`. It adds `gtag.js` itself only once the page has settled, so the page's heaviest script
never competes with what the visitor is waiting to see: at the visitor's first tap, click or key, or else in the
browser's idle time four seconds after the page loaded (`SETTLE_MS`). The page view and any event sent before it
arrives wait in `dataLayer`, so a visit that leaves within those seconds without touching the page isn't counted.
Every link that leaves the page opens a new tab or downloads a file, so no click has to wait for `gtag.js`.

Only pierrevieira.com and its subdomains report: on `npm run dev` (localhost) and Cloudflare's previews the events
queue in `window.dataLayer`, where they can be checked, and `gtag.js` never loads.

Google Analytics' own events (`page_view`, `scroll`, outbound `click`, `file_download`, `first_visit`,
`session_start`) stay as they are. The page's own events:

| Event | When | Parameters |
| --- | --- | --- |
| `traffic_source` | The page opens with `utm_source`, once per visit for the same values | `source`, `medium`, `campaign`, `term`, `content` (each when present, up to 100 characters) |
| `cv_download` | A link to the résumé | `origin`: `header`, `header_menu`, `hero`, `contact` |
| `contact_click` | The email, the LinkedIn profile, or GitHub (the profile in contact, this site's repository in the hero) | `method`: `email`, `linkedin`, `github`; `origin`: `hero`, `contact` |
| `app_link_click` | A link of an app's card | `app`: `blitz_split`, `bible_planner`; `target`: `play`, `appstore`, `website`, `source` |
| `talk_click` | A talk, from its card or from the experience that mentions it | `talk`: `android_overview`, `compose_intro`; `origin`: `talks`, `experience` |
| `navigation_click` | A link to a section of the page | `target`: `apps`, `experience`, `skills`, `talks`, `contact`, `top`, `main`; `origin`: `header`, `header_menu`, `hero`, `footer`, `page` (the skip link) |
| `details_toggle` | An app's or a job's details are opened or folded with its Details toggle, or opened by the browser's find in page (`find`) | `item`: `blitz_split`, `bible_planner`, `super`, `toyota`, `arlo`, `mercado`, `ifood`, `studio`; `state`: `open`, `close`, `find` |
| `language_change` | A language is picked in the header's menu | `language`: `system`, `en`, `pt`, `es` |
| `theme_change` | A theme is picked in the header's menu | `theme`: `light`, `dark`, `system` |

The links are read from the markup: `data-app` on an app's card, `data-talk` on a talk's, `data-email` on the email
link, `download` on the résumé's, and the section a link sits in for its `origin`. A new link of those kinds is counted
with nothing to add to `analytics.js`.

A parameter shows in Google Analytics' reports only once it is registered as a custom dimension (Admin › Custom
definitions), event-scoped, with the same name. Add an event's row here in the same change that sends it.
