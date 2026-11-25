// What the OneDrive scripts share (setup.mjs, run once on Pierre's machine, and sync.mjs, run by
// .github/workflows/onedrive-cv.yml). They reach OneDrive through rclone (https://rclone.org), whose own Microsoft app
// signs in: a personal Microsoft account can no longer register an app of its own. rclone's token, a JSON with the
// refresh token, lives in the repository's secrets and is saved back after every use. See docs/onedrive.md.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Where the résumé goes, from the root of Pierre's OneDrive (it syncs to
// ~/Library/CloudStorage/OneDrive-Personal/Documentos/Curriculo/cv on his Mac).
export const REMOTE_FOLDER = 'Documentos/Curriculo/cv'
export const REMOTE_FILE = 'cv_pierre_vieira.pdf'

export const SECRET_TOKEN = 'ONEDRIVE_RCLONE_TOKEN'
export const VARIABLE_DRIVE_ID = 'ONEDRIVE_DRIVE_ID'
export const VARIABLE_REFRESHED_AT = 'ONEDRIVE_TOKEN_REFRESHED_AT'

// Why: rclone asks for every file, shared files and SharePoint by default. Microsoft has no scope for a single
// folder (but for an app's own folder, where the résumé can't be), so this is the least: Pierre's own files, and
// staying signed in.
export const SCOPES = 'Files.ReadWrite offline_access'

const REMOTE = 'onedrive'

export function fail(message) {
  console.error(`onedrive: ${message}`)
  process.exit(1)
}

/** Reads an environment variable, or stops with a message that says what is missing. */
export function required(name) {
  const value = process.env[name]
  if (!value) fail(`${name} is not set (see docs/onedrive.md)`)
  return value
}

/** Runs a command and returns its result; `input` goes on stdin, stdout is captured, stderr shows. */
export function run(command, args, input) {
  const result = spawnSync(command, args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] })
  if (result.error) fail(`${command} could not run: ${result.error.message}`)
  return result
}

/** Runs the GitHub CLI on the repository in GH_REPO (gh reads it) or the checkout's, or stops when it fails. */
export function gh(args, input) {
  if (run('gh', args, input).status !== 0) fail(`gh ${args.slice(0, 3).join(' ')} failed`)
}

/** Stores rclone's token in the repository's secret and the time of it in its variable. */
export function saveToken(token) {
  // Why: on stdin, so the token is never in a command line or a log.
  gh(['secret', 'set', SECRET_TOKEN], token)
  gh(['variable', 'set', VARIABLE_REFRESHED_AT, '--body', new Date().toISOString()])
}

/**
 * Writes an rclone config with the OneDrive remote into a temporary folder and returns a function that runs rclone
 * on it and one that reads back the token rclone wrote there after refreshing it.
 */
export function rcloneWith(token, driveId) {
  const folder = mkdtempSync(join(tmpdir(), 'onedrive-'))
  // Why: the config holds the token, so it goes when the script ends.
  process.on('exit', () => rmSync(folder, { recursive: true, force: true }))
  const config = join(folder, 'rclone.conf')
  const lines = ['type = onedrive', 'drive_type = personal', `drive_id = ${driveId}`, `access_scopes = ${SCOPES}`,
    `token = ${token}`]
  writeFileSync(config, `[${REMOTE}]\n${lines.join('\n')}\n`, { mode: 0o600 })
  const rclone = (...args) => run('rclone', ['--config', config, ...args])
  return {
    rclone,
    remote: (path) => `${REMOTE}:${path}`,
    currentToken: () => {
      const dump = rclone('config', 'dump')
      if (dump.status !== 0) fail('rclone could not read its config back')
      return JSON.parse(dump.stdout)[REMOTE].token
    },
  }
}
