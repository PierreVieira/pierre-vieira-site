# The résumé in OneDrive

`.github/workflows/onedrive-cv.yml` keeps `Documentos/Curriculo/cv/cv_pierre_vieira.pdf` in Pierre's OneDrive the same
as the site's résumé, with no machine of his involved. It builds the PDF with `scripts/build-cv.sh`, as the deploy does
([`deploy.md`](deploy.md)), and uploads it with [rclone](https://rclone.org) through `scripts/onedrive/sync.mjs`.

## When it runs

| Event | What it does |
| --- | --- |
| A push to `main` that touches `cv/**` or `scripts/build-cv.sh` | Builds and uploads the PDF |
| A manual run (Actions › onedrive-cv › Run workflow) | Builds and uploads the PDF |
| Every day at 09:17 UTC | Renews the token if it was last renewed 45 days ago or more; else ends in seconds |

Pull requests never upload: their change reaches OneDrive when they merge. The folder (`REMOTE_FOLDER`) is in
`scripts/onedrive/shared.mjs`.

## The token

A personal Microsoft account can no longer register an app of its own (Entra asks for a directory), so the sign-in
goes through rclone's Microsoft app. rclone runs in the workflow and talks to Microsoft directly; nothing passes through
rclone's project. It asks only for `Files.ReadWrite offline_access`: Microsoft has no scope for a single folder, so the
token can read and write all of Pierre's own files (not files shared with him, nor SharePoint). Revoke it any time at
account.microsoft.com › Privacy › Apps and services, by removing rclone.

Microsoft drops a refresh token after 90 days unused, so every run saves the token rclone renewed into the
`ONEDRIVE_RCLONE_TOKEN` secret and the time into the `ONEDRIVE_TOKEN_REFRESHED_AT` variable; the daily check renews it
at 45 days. GitHub turns off a public repository's scheduled workflows after 60 days without commits, so the check
re-enables its own workflow every day.

| In the repository's settings (Secrets and variables › Actions) | |
| --- | --- |
| `ONEDRIVE_RCLONE_TOKEN` (secret) | rclone's token (JSON with the refresh token), rotated by every run |
| `ONEDRIVE_DRIVE_ID` (variable) | The OneDrive's ID |
| `ONEDRIVE_TOKEN_REFRESHED_AT` (variable) | When the token was last rotated |
| `ONEDRIVE_GITHUB_TOKEN` (secret) | A GitHub token that may write this repository's secrets and variables |

The workflow installs a pinned rclone release, checked against its SHA-256: bump `VERSION` and `SHA256` together (from
`https://downloads.rclone.org/<version>/SHA256SUMS`).

## Setting it up

1. **Sign in once**, with rclone installed (`brew install rclone`) and the GitHub CLI signed in to an account that can
   administer the repository:

   ```bash
   node scripts/onedrive/setup.mjs
   ```

   It opens Microsoft's sign-in in the browser, checks the folder is there, and saves the drive's ID, the token and its
   time into the repository.
2. **Make the GitHub token** at github.com › Settings › Developer settings › Fine-grained tokens: only this repository,
   permissions **Secrets: Read and write** and **Variables: Read and write**, the longest expiration offered. Save it:

   ```bash
   gh secret set ONEDRIVE_GITHUB_TOKEN --repo PierreVieira/pierre-vieira-site
   ```

3. **Try it**: run the workflow by hand and check the PDF in OneDrive.

## When it fails

- *rclone failed* with an `invalid_grant` above it: the token expired or was revoked. Run step 1 again.
- *gh secret set failed*: `ONEDRIVE_GITHUB_TOKEN` expired. Make a new one (step 2).
- The daily check stopped (the workflow shows as disabled): enable it in the Actions tab and run it by hand. The
  token lasts 90 days from its last renewal; past that, run step 1 again.
