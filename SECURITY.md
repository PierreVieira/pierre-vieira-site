# Security policy

[pierrevieira.com](https://pierrevieira.com) is a static page, but it still runs scripts in its visitors' browsers and
reports to Google Analytics, so reports of security problems are welcome and taken seriously.

## Supported versions

Only what is live at pierrevieira.com gets security fixes. Every commit on `main` deploys there
([deploy](docs/deploy.md)), so `main` is always the supported version.

## Reporting a vulnerability

**Please don't open a public issue for a security problem.** Report it privately instead:

1. Open the repository's **Security** tab and click **Report a vulnerability**.
2. Describe the problem, the page or path (or the commit), how to reproduce it, and what an attacker could do with it.

Only the maintainer sees the report. I aim to answer within 7 days, keep you posted while I fix it, and credit you in
the advisory once the fix is out, unless you'd rather stay anonymous.

## What is in scope

- The page at pierrevieira.com and the files it serves from `public/`: the scripts (`boot.js`, `site.js`,
  `analytics.js`, `strings/`), the résumé, and the files for AI agents (`llms.txt`, `.well-known/`).
- The Cloudflare configuration in `wrangler.jsonc`.
- The data the page sends to Google Analytics ([analytics](docs/analytics.md)).

## Out of scope

- Reports from automated scanners with no proof that the problem can be exploited.
- Denial of service, spam, and social engineering.
- Missing best practices with no real impact (for example, a header that changes nothing for a static page).
- Problems in Cloudflare, GitHub, Google Analytics or the sites the page links to; report those to them.

Please give me a reasonable time to fix the problem before you disclose it.
