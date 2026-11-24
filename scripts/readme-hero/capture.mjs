// What the scripts that photograph the page share (generate.mjs here and ../link-card/generate.mjs): a local server
// for a folder, the test that a page is painted in full, and the {{…}} slots of their templates.
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'

// Why: a page must be painted in full, with its fonts and its images, before it is photographed. Only the images in
// view count: the page's lazy ones, further down, never load in a capture.
export const PAINTED = `document.readyState === 'complete' && document.fonts.status === 'loaded' && [...document.images]
  .filter((image) => image.loading !== 'lazy')
  .every((image) => image.complete && image.naturalWidth > 0)`

/** Serves `directory` on a free local port (Python's http.server, as `npm run dev`), once it answers. */
export async function serve(directory) {
  const port = await freePort()
  const origin = `http://127.0.0.1:${port}`
  const args = ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', directory]
  const server = spawn('python3', args, { stdio: 'ignore' })
  try {
    await waitForServer(origin)
  } catch (error) {
    server.kill()
    throw error
  }
  return { origin, stop: () => server.kill() }
}

/** Writes each `slots` value where `template` names it as {{name}}. */
export function fill(template, slots) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => slots[name])
}

async function freePort() {
  return new Promise((done, fail) => {
    const server = createServer()
    server.once('error', fail)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => done(port))
    })
  })
}

async function waitForServer(origin) {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      if ((await fetch(origin)).ok) return
    } catch {
      // Not listening yet
    }
    await new Promise((done) => setTimeout(done, 100))
  }
  throw new Error(`The page's server didn't start at ${origin}`)
}
