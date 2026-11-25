// Run by .github/workflows/onedrive-cv.yml: reaches Pierre's OneDrive with rclone and the token in the repository's
// secrets and, with `--upload <pdf>`, puts the résumé in place of the one there; without it, only lists the folder,
// which is enough to renew the token. Either way it saves the token rclone refreshed, so it never goes 90 days unused.
// Needs ONEDRIVE_RCLONE_TOKEN, ONEDRIVE_DRIVE_ID and a GH_TOKEN that may write the repository's secrets and variables
// (docs/onedrive.md).
import { REMOTE_FILE, REMOTE_FOLDER, fail, rcloneWith, required, saveToken } from './shared.mjs'

const args = process.argv.slice(2)
const upload = args[0] === '--upload' ? args[1] : undefined
if (args.length && !upload) fail('usage: node scripts/onedrive/sync.mjs [--upload <pdf>]')

const stored = required('ONEDRIVE_RCLONE_TOKEN')
const { rclone, remote, currentToken } = rcloneWith(stored, required('ONEDRIVE_DRIVE_ID'))
// Why: an access token lasts an hour, so either command makes rclone refresh it unless the last run or the setup was
// under an hour ago; then nothing is renewed, nor saved below, which is fine.
const result = upload
  ? rclone('copyto', upload, remote(`${REMOTE_FOLDER}/${REMOTE_FILE}`))
  : rclone('lsf', remote(REMOTE_FOLDER))

// Why: saved whatever the command did, so a failed upload never loses a token rclone already rotated; a token
// Microsoft refused stays as it was, and so does the time of the last renewal.
const token = currentToken()
const accessToken = (json) => JSON.parse(json).access_token
if (accessToken(token) !== accessToken(stored)) {
  if (process.env.GITHUB_ACTIONS) console.log(`::add-mask::${JSON.parse(token).refresh_token}`)
  saveToken(token)
  console.log('onedrive: saved the renewed token')
}

if (result.status !== 0) {
  fail(`rclone failed; if Microsoft refused the token, sign in again with \`node scripts/onedrive/setup.mjs\``)
}
console.log(upload
  ? `onedrive: uploaded ${upload} to ${REMOTE_FOLDER}/${REMOTE_FILE}`
  : `onedrive: ${REMOTE_FOLDER} is reachable`)
