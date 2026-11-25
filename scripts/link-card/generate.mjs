// Draws the image a link to the site unfolds into (WhatsApp, LinkedIn, Slack, iMessage, X): public/img/link-card.png,
// the og:image of public/index.html, 1200 × 630. Its words, its mark and its portrait are read from the page itself,
// so running this again after a change to the hero brings the card up to date.
//
//   npm run link-card
//
// It opens the page with ?theme=dark&lang=en in a headless Chrome of its own (../lib/chrome.mjs), reads the hero,
// fills card.html's slots with it and photographs the card. In English only: what unfolds a link runs no script, so
// it never sees the page's other languages. It then writes the image's version after its address in the page's
// og:image (?v=, from the image's hash), so the address changes when the card does.
import { createHash } from 'node:crypto'
import { mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fill, openPainted, serve } from '../lib/capture.mjs'
import { launchChrome } from '../lib/chrome.mjs'

const PUBLIC = resolve(import.meta.dirname, '../../public')
const PAGE = join(PUBLIC, 'index.html')
const OUTPUT = join(PUBLIC, 'img/link-card.png')
// The card's address in the page's og:image, with the version written after it, if any.
const ADDRESS = /(\/img\/link-card\.png)(\?v=[0-9a-f]+)?/
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
    // A team's link holds its logo and, for a screen reader, its name: the card writes the name, as markup like the
    // other slots, so a name with an & or a < stays text in the card.
    teams: [...one('.teams ul').querySelectorAll('a .sr-only')].map((name) => name.innerHTML).join(' · '),
    portrait: one('.portrait img').getAttribute('src'),
  }
})()`

// Why: a font is only read from the page's own origin, so the card can't be a file that borrows site.css from the
// server. It is served from a folder that is public/, entry by entry, plus the card.
const template = await readFile(join(import.meta.dirname, 'card.html'), 'utf8')
const stage = await mkdtemp(join(tmpdir(), 'link-card-'))
// Why: set up inside the try, so a server or a Chrome that fails to start leaves nothing running behind.
let site
let chrome
try {
  for (const entry of await readdir(PUBLIC)) await symlink(join(PUBLIC, entry), join(stage, entry))
  site = await serve(stage)
  chrome = await launchChrome()
  await chrome.setViewport(CARD.width, CARD.height, 1, true)
  await openPainted(chrome, `${site.origin}/?theme=dark&lang=en`)
  await writeFile(join(stage, CARD_PAGE), fill(template, await chrome.evaluate(HERO)))
  await openPainted(chrome, `${site.origin}/${CARD_PAGE}`)
  await chrome.screenshot(OUTPUT)
  console.log(`Wrote ${OUTPUT}`)
  // Why: some of what unfolds links keeps an image by its address, so a card drawn again would stay the old one
  // there. The version is the image's hash: it changes only when the image does.
  const version = createHash('sha256').update(await readFile(OUTPUT)).digest('hex').slice(0, 8)
  const page = await readFile(PAGE, 'utf8')
  if (!ADDRESS.test(page)) throw new Error(`${PAGE} names no /img/link-card.png for its og:image`)
  await writeFile(PAGE, page.replace(ADDRESS, `$1?v=${version}`))
} finally {
  await chrome?.close()
  site?.stop()
  await rm(stage, { recursive: true, force: true })
}
