// Run once on Pierre's machine, with rclone installed (`brew install rclone`): signs in to his OneDrive through
// rclone's Microsoft app in the browser, checks that the résumé's folder is there, and saves what
// .github/workflows/onedrive-cv.yml needs into the repository with the GitHub CLI: the drive's ID as a variable and
// rclone's token as a secret, never printed. Run it again whenever the token stops working (docs/onedrive.md).
//
//   node scripts/onedrive/setup.mjs
import { REMOTE_FOLDER, SCOPES, VARIABLE_DRIVE_ID, fail, gh, rcloneWith, run, saveToken } from './shared.mjs'

console.log('onedrive: sign in to Microsoft in the browser that opens')
process.env.RCLONE_ONEDRIVE_ACCESS_SCOPES = SCOPES
const authorize = run('rclone', ['authorize', 'onedrive'])
// Why: rclone prints the token between these two marks, for pasting into a headless rclone.
const token = authorize.stdout.match(/--->\s*(\{.*\})\s*<---End paste/s)?.[1]
if (authorize.status !== 0 || !token) fail('the sign-in did not finish')

const drive = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
  headers: { Authorization: `Bearer ${JSON.parse(token).access_token}` },
}).then((response) => response.json())
if (!drive.id) fail(`Microsoft did not answer with the drive (${drive.error?.message})`)

const { rclone, remote, currentToken } = rcloneWith(token, drive.id)
const folder = rclone('lsf', remote(REMOTE_FOLDER))
if (folder.status !== 0) fail(`no ${REMOTE_FOLDER} in this OneDrive; fix REMOTE_FOLDER in scripts/onedrive/shared.mjs`)
console.log(`onedrive: found ${REMOTE_FOLDER}, which holds: ${folder.stdout.trim().split('\n').join(', ')}`)

gh(['variable', 'set', VARIABLE_DRIVE_ID, '--body', drive.id])
saveToken(currentToken())
console.log('onedrive: saved the drive ID and the token in the repository')
