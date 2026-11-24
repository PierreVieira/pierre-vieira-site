// Draws the README's opening image, docs/images/readme-hero-{dark,light}.webp: the page itself, captured at a desktop's
// width and at a phone's, in a browser window and a phone beside it. Each capture is the real page, never a mockup, so
// running this again after a change to the page brings the image up to date.
//
//   npm run readme-hero
//
// It serves public/ itself on a free port (Python's http.server, as `npm run dev`) and opens the page with
// ?theme=<theme>&lang=en, which pins the theme and stills the entrance animations, in a headless Chrome of its own
// (chrome.mjs). hero.html then lays the two captures out and is photographed as WebP, transparent around the devices
// so it sits on GitHub's page in either theme.
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { launchChrome } from './chrome.mjs'

const ROOT = resolve(import.meta.dirname, '../..')
const OUTPUT = join(ROOT, 'docs/images')
// The captures, in CSS pixels: a common laptop's window and an iPhone's screen.
const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }
// hero.html's size in CSS pixels, photographed at twice that: sharp on a Retina display at the README's width.
const HERO = { width: 1280, height: 720 }
const SCALE = 2
const QUALITY = 90

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

const port = await freePort()
const origin = `http://127.0.0.1:${port}`
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', join(ROOT, 'public')], {
  stdio: 'ignore',
})
const captures = await mkdtemp(join(tmpdir(), 'readme-hero-'))
const template = await readFile(join(import.meta.dirname, 'hero.html'), 'utf8')
const chrome = await launchChrome()
try {
  await waitForServer(origin)
  // Why: the page must be painted in full, with its fonts and its images, before it is photographed. Only the images
  // in view count: the page's lazy ones, further down, never load in a capture.
  const ready = `document.readyState === 'complete' && document.fonts.status === 'loaded' && [...document.images]
    .filter((image) => image.loading !== 'lazy')
    .every((image) => image.complete && image.naturalWidth > 0)`
  for (const theme of ['dark', 'light']) {
    const isDark = theme === 'dark'
    for (const [name, size] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await chrome.setViewport(size.width, size.height, SCALE, isDark)
      await chrome.open(`${origin}/?theme=${theme}&lang=en`)
      await chrome.waitFor(ready)
      await chrome.screenshot(join(captures, `${name}-${theme}.png`))
    }
    await chrome.setViewport(HERO.width, HERO.height, SCALE, isDark)
    // Why: the page gets its images written in, not read from its address, so it runs no script at all.
    const slots = { theme, captures: pathToFileURL(captures).href }
    const page = join(captures, `hero-${theme}.html`)
    await writeFile(page, template.replace(/\{\{(\w+)\}\}/g, (_, name) => slots[name]))
    await chrome.open(pathToFileURL(page).href)
    await chrome.waitFor(ready)
    const file = join(OUTPUT, `readme-hero-${theme}.webp`)
    await chrome.screenshot(file, { format: 'webp', quality: QUALITY })
    console.log(`Wrote ${file}`)
  }
} finally {
  await chrome.close()
  server.kill()
  await rm(captures, { recursive: true, force: true })
}
