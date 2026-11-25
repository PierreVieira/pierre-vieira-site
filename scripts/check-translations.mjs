// Fails when a data-i18n key of public/index.html is missing from a language of public/strings/, or when a language
// holds a key the page no longer uses, or markup in a key the page writes as text. Run with
// `npm run check:translations`.
import { readFileSync, readdirSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const folder = new URL("../public/strings/", import.meta.url);
const sandbox = { window: {} };
for (const file of readdirSync(folder).filter((name) => name.endsWith(".js"))) {
  runInNewContext(readFileSync(new URL(file, folder), "utf8"), sandbox);
}
const languages = sandbox.window.SITE_STRINGS;

const keysOf = (pattern) => new Set([...html.matchAll(pattern)].map((match) => match[1]));
const used = keysOf(/data-i18n(?:-html|-label|-alt|-title|-content)?="([^"]+)"/g);
// A key read by anything but data-i18n-html is written as text: markup in it would show as written.
const plain = keysOf(/data-i18n(?:-label|-alt|-title|-content)?="([^"]+)"/g);
// An image that shows words has one file per language, and so has a logo that does (the <use> of its symbol).
// Each tag with the attribute site.js swaps on it: an <img>'s src, a <use>'s href.
const images = [...html.matchAll(/<(?:img[^>]*data-(src)|use[^>]*data-(href))-[a-z]+=[^>]*>/g)]
  .map((match) => ({ tag: match[0], attribute: match[1] || match[2] }));

let failed = false;
const fail = (message) => { console.error(message); failed = true; };
for (const [language, words] of Object.entries(languages)) {
  for (const key of used) if (!(key in words)) fail(`${language}: missing ${key}`);
  for (const key of Object.keys(words)) if (!used.has(key)) fail(`${language}: unused ${key}`);
  for (const key of plain) if (/<[a-z]/i.test(words[key] || "")) fail(`${language}: markup in the plain-text key ${key}`);
  for (const { tag, attribute } of images) if (!tag.includes(`data-${attribute}-${language}=`)) fail(`${language}: no data-${attribute}-${language} on ${tag.slice(0, 60)}…`);
}
if (failed) process.exit(1);
console.log(`${used.size} keys in ${Object.keys(languages).join(", ")}: all translated.`);
