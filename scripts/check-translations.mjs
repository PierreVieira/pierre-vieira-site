// Fails when a data-i18n key of public/index.html has no Portuguese in public/strings/pt.js, or when pt.js holds a key
// the page no longer uses. Run with `npm run check:translations`.
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const sandbox = { window: {} };
runInNewContext(readFileSync(new URL("../public/strings/pt.js", import.meta.url), "utf8"), sandbox);
const pt = sandbox.window.SITE_STRINGS.pt;

const used = new Set([...html.matchAll(/data-i18n(?:-html|-label|-alt|-content)?="([^"]+)"/g)].map((match) => match[1]));
const missing = [...used].filter((key) => !(key in pt));
const unused = Object.keys(pt).filter((key) => !used.has(key));
// A key read by data-i18n is written as text: markup in it would show as written.
const plain = new Set([...html.matchAll(/data-i18n(?:-label|-alt|-content)?="([^"]+)"/g)].map((match) => match[1]));
const markup = [...plain].filter((key) => /<[a-z]/i.test(pt[key] || ""));

for (const key of missing) console.error(`Missing in pt.js: ${key}`);
for (const key of unused) console.error(`Unused in pt.js: ${key}`);
for (const key of markup) console.error(`Markup in a plain-text key: ${key}`);
if (missing.length || unused.length || markup.length) process.exit(1);
console.log(`${used.size} keys, all translated.`);
