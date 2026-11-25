// Fails when a team's logo in public/index.html and its drawing in public/img/team-logos.svg disagree. A symbol can't
// size the <svg> that uses it from another file, so each <svg class="team-logo"> repeats its symbol's viewBox, and
// gives it again as width and height for a browser that takes no size from a viewBox: a symbol drawn again without
// the page following would come out squashed. Every language's symbol of one logo (data-href-<language>) is on that
// same viewBox, and the sprite holds no symbol the page doesn't use. Run with `npm run check:team-logos`.
import { readFileSync } from "node:fs";

const SPRITE = "img/team-logos.svg";
const read = (path) => readFileSync(new URL(`../public/${path}`, import.meta.url), "utf8");
const symbols = new Map([...read(SPRITE).matchAll(/<symbol id="([^"]+)" viewBox="([^"]+)"/g)].map((match) => [match[1], match[2]]));
const logos = [...read("index.html").matchAll(/<svg class="team-logo"[^>]*>\s*<use[^>]*>/g)].map((match) => match[0]);

let failed = false;
const fail = (message) => { console.error(message); failed = true; };
if (!logos.length) fail("public/index.html has no <svg class=\"team-logo\">");
const used = new Set();
for (const logo of logos) {
  const attribute = (name) => logo.match(new RegExp(` ${name}="([^"]*)"`))?.[1];
  const viewBox = attribute("viewBox");
  const ids = [...logo.matchAll(new RegExp(`href(?:-[a-z]+)?="${SPRITE}#([^"]+)"`, "g"))].map((match) => match[1]);
  if (!ids.length) fail(`no symbol of ${SPRITE} in ${logo}`);
  for (const id of ids) {
    used.add(id);
    if (!symbols.has(id)) fail(`${id}: ${SPRITE} has no such symbol`);
    else if (symbols.get(id) !== viewBox) fail(`${id}: the page's viewBox is "${viewBox}", the symbol's is "${symbols.get(id)}"`);
  }
  const [, , width, height] = (viewBox || "").split(" ").map(Number);
  const size = `width="${Math.round(width)}" height="${height}"`;
  if (!logo.includes(` ${size}`)) fail(`${ids[0]}: its <svg> should have ${size}, the viewBox's size in whole pixels`);
}
for (const id of symbols.keys()) if (!used.has(id)) fail(`${id}: a symbol the page doesn't use`);
if (failed) process.exit(1);
console.log(`${logos.length} team logos, ${symbols.size} symbols: the page and the sprite agree.`);
