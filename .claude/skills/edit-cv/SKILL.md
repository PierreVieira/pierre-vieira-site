---
name: edit-cv
description: Change Pierre's résumé (cv/pierre-vieira-cv.tex) from a plain-language request, build and check the PDF, and open a pull request with the change. Use whenever someone asks to add, remove, update or reword anything on the résumé/CV — a new job, a new skill, a date, a project, a talk, a link — even if they only say "coloca X no currículo" or "atualiza meu CV".
argument-hint: <what to change on the résumé>
---

# Edit the résumé

The résumé's only source is `cv/pierre-vieira-cv.tex`. The PDF (`public/cv/pierre-vieira-cv.pdf`) is not in git: every
deploy compiles it (see `docs/deploy.md`). So a change to the résumé is a change to the .tex, shipped as a pull request.

The request is in `$ARGUMENTS` (or the user's message). Follow these steps in order.

## 1. Understand the change

- Read `cv/pierre-vieira-cv.tex` in full and find where the change goes.
- Never invent a fact: a date, a role, a company, a number, a link. If the request lacks one the résumé needs (a job
  with no start month, a project with no link), ask the user before writing anything.
- If the request is ambiguous about where or how something appears, pick what matches the résumé's existing pattern
  and say so in the PR; ask only when two readings would produce a materially different résumé.

## 2. Branch

- `git status --porcelain` must be empty apart from untracked files that have nothing to do with the résumé. If there
  are changes, stop and ask the user what to do with them; never stash or discard them yourself.
- `git fetch origin`, then create the branch from the base: `git switch -c cv/<short-kebab-slug> origin/<base>`. The
  base is `main` unless the user names another branch.

## 3. Edit the .tex

- Change only `cv/pierre-vieira-cv.tex`.
- Reuse the résumé's own macros and spacing, so the new part looks like its neighbours: `\resumeSubheading{company}
  {location - type}{role}{dates}` for a job, `\resumeItem{title}{text}` for a bullet, `\resumeSubItem{name}{text}` for
  a skill line or a project, and the `\href{...}{\textcolor{blue}{\textit{\underline{...}}}}` look for links.
- Keep the résumé's style: English, dates as `Mon YYYY - Mon YYYY` (or `present`), newest job first.
- Escape LaTeX's special characters in text: `& % $ # _ { } ~ ^ \`. Accented letters can be typed as they are
  (the build runs XeTeX).
- Don't add a package that forces a pdfTeX driver (such as `[pdftex]`): the build uses Tectonic, which runs XeTeX.

## 4. Build and look at the PDF

- `npm run build:cv`. If it fails, read the error, fix the .tex and build again.
- Read `public/cv/pierre-vieira-cv.pdf` and check the change rendered where and how it should: nothing overflows the
  right margin, columns still line up, links are blue and underlined like the others, and the page count did not grow
  unless the change calls for it. Say in the PR if it now spills onto another page.
- The PDF is ignored by git; never commit it.

## 5. Check what else repeats the fact

The site repeats the résumé's facts. Search for the old value or the topic (`grep -rn` in `public/index.html`,
`public/strings/`, `public/llms.txt`, `public/.well-known/`). Don't change those in this pull request: list each place
that is now out of step in the PR description, under "Site follow-up", or write "None" there.

## 6. Commit, push, open the pull request

- Commit only the .tex, with an English message in the imperative that says what changed on the résumé, e.g.
  `Add the website to the résumé's header`. End it with the attribution lines the session gives for commits.
- `git push -u origin HEAD`.
- `gh pr create --base <base> --title "<the commit's subject>" --body-file <file>` with a body that has:
  - **What changed**: the change on the résumé, in a sentence or two.
  - **Request**: the user's request, quoted.
  - **Checked**: that the PDF built, and what you saw in it (where the change landed, page count).
  - **Site follow-up**: the places from step 5, or "None".
  - The attribution lines the session gives for pull requests.
- Never merge the pull request. Give the user its link and switch back to the branch they were on.
