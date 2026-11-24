// Draws the image a link to the site unfolds into (WhatsApp, LinkedIn, Slack, iMessage, X): public/img/link-card.png,
// the og:image of public/index.html, 1200 × 630. Its words, its mark and its portrait are read from the page itself,
// so running this again after a change to the hero brings the card up to date.
//
//   npm run link-card
//
// It opens the page with ?theme=dark&lang=en in a headless Chrome of its own (../readme-hero/chrome.mjs), reads the
// hero, fills card.html's slots with it and photographs the card. In English only: what unfolds a link runs no
// script, so it never sees the page's other languages.
import { mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fill, PAINTED, serve } from '../readme-hero/capture.mjs'
import { launchChrome } from '../readme-hero/chrome.mjs'

const PUBLIC = resolve(import.meta.dirname, '../../public')
const OUTPUT = join(PUBLIC, 'img/link-card.png')
// What Open Graph and X ask of a large card, in real pixels: a larger one only weighs more, and WhatsApp drops a
// heavy image for no image at all.
const CARD = { width: 1200, height: 630 }
const CARD_PAGE = 'link-card.html'

// What the card shows, as the page's own markup. A selector that finds nothing throws here, naming itself.
const HERO = `(() => {
  const one = (selector) => {
    const element = document.querySelector(selector)
    if (!element) throw new Error('The page has no ' + selector)
    return element
  }
  return {
    brand: one('.site-header .brand').innerHTML,
    title: one('.hero h1').innerHTML,
    role: one('.hero-copy .eyebrow').innerHTML,
    teams: [...one('.teams ul').querySelectorAll('a')].map((team) => team.innerHTML).join(' · '),
    portrait: one('.portrait img').getAttribute('src'),
  }
})()`

// Why: a font is only read from the page's own origin, so the card can't be a file that borrows site.css from the
// server. It is served from a folder that is public/, entry by entry, plus the card.
const stage = await mkdtemp(join(tmpdir(), 'link-card-'))
for (const entry of await readdir(PUBLIC)) await symlink(join(PUBLIC, entry), join(stage, entry))
const template = await readFile(join(import.meta.dirname, 'card.html'), 'utf8')
const site = await serve(stage)
const chrome = await launchChrome()
try {
  await chrome.setViewport(CARD.width, CARD.height, 1, true)
  await chrome.open(`${site.origin}/?theme=dark&lang=en`)
  await chrome.waitFor(PAINTED)
  await writeFile(join(stage, CARD_PAGE), fill(template, await chrome.evaluate(HERO)))
  await chrome.open(`${site.origin}/${CARD_PAGE}`)
  // Why: the page before is painted too, so the card is waited for by its address.
  await chrome.waitFor(`location.pathname === '/${CARD_PAGE}' && ${PAINTED}`)
  await chrome.screenshot(OUTPUT)
  console.log(`Wrote ${OUTPUT}`)
} finally {
  await chrome.close()
  site.stop()
  await rm(stage, { recursive: true, force: true })
}
