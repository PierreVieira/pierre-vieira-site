# Pull request checks

Two checks run on every pull request, from releases of Quartel-Enterprise actions pinned in `.github/workflows`.
Dependabot bumps the pins weekly, in one pull request.

## The Claude review

[claude-review](https://github.com/Quartel-Enterprise/claude-review) reviews a pull request with Claude Code when it
opens (or a draft is marked ready), pushes what it could fix as one commit by `claude[bot]`, and posts the rest as one
review with an inline comment per finding. It follows `CLAUDE.md`. Later pushes aren't reviewed again: add the
`ai-review` label for another review, which only comments.

| Workflow | |
| --- | --- |
| `claude-review.yml` | The opening review, with fixes |
| `claude-review-on-request.yml` | Another review when the `ai-review` label is added; the label goes when it ends |
| `claude-review-refs.yml` | Fails when the workflows pin different releases of claude-review |

It needs the [Claude GitHub App](https://github.com/apps/claude) installed on the repository and a
`CLAUDE_CODE_OAUTH_TOKEN` secret (from `claude setup-token`); when the token expires, the review fails on
authentication and the secret needs a new one. A pull request that changes `claude-review.yml` isn't reviewed:
`claude-code-action` refuses to run a workflow the pull request edits.

## Copied code

[copied-code-check](https://github.com/Quartel-Enterprise/copied-code-check) (`duplication.yml`) runs jscpd on what
`.jscpd.json` lists (`public/` and `scripts/`: JavaScript, CSS and HTML) and fails when a file has more lines in a copy
than `.jscpd-baseline.json` lists, or fewer, until the baseline records them. The same check runs locally (Node.js 18
or later):

```bash
./scripts/cpd.sh                                # what CI runs
./scripts/cpd.sh --update-baseline              # record copied code that was removed, or a moved file
./scripts/cpd.sh --update-baseline --allow-new  # take new copied code in, only when the copy is on purpose
```

`scripts/cpd.sh` is the project's wrapper and is never edited: it runs the release `duplication.yml` pins.
