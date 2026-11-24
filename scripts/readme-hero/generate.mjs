// Draws the README's opening image, docs/images/readme-hero-{dark,light}.webp: the page itself, captured at a desktop's
// width and at a phone's, in a browser window and a phone beside it. Each capture is the real page, never a mockup, so
// running this again after a change to the page brings the image up to date.
//
//   npm run readme-hero
//
// It serves public/ itself on a free port (capture.mjs) and opens the page with ?theme=<theme>&lang=en, which pins the
// theme and stills the entrance animations, in a headless Chrome of its own (chrome.mjs). hero.html then lays the two
// captures out and is photographed as WebP, transparent around the devices so it sits on GitHub's page in either
// theme.
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fill, PAINTED, serve } from './capture.mjs'
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

const site = await serve(join(ROOT, 'public'))
const captures = await mkdtemp(join(tmpdir(), 'readme-hero-'))
const template = await readFile(join(import.meta.dirname, 'hero.html'), 'utf8')
const chrome = await launchChrome()
try {
  for (const theme of ['dark', 'light']) {
    const isDark = theme === 'dark'
    for (const [name, size] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await chrome.setViewport(size.width, size.height, SCALE, isDark)
      await chrome.open(`${site.origin}/?theme=${theme}&lang=en`)
      await chrome.waitFor(PAINTED)
      await chrome.screenshot(join(captures, `${name}-${theme}.png`))
    }
    await chrome.setViewport(HERO.width, HERO.height, SCALE, isDark)
    // Why: the page gets its images written in, not read from its address, so it runs no script at all.
    const slots = { theme, captures: pathToFileURL(captures).href }
    const page = join(captures, `hero-${theme}.html`)
    await writeFile(page, fill(template, slots))
    await chrome.open(pathToFileURL(page).href)
    await chrome.waitFor(PAINTED)
    const file = join(OUTPUT, `readme-hero-${theme}.webp`)
    await chrome.screenshot(file, { format: 'webp', quality: QUALITY })
    console.log(`Wrote ${file}`)
  }
} finally {
  await chrome.close()
  site.stop()
  await rm(captures, { recursive: true, force: true })
}
