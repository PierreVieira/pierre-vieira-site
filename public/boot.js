// Runs in <head>, before the first paint, so neither the theme nor the language flashes.
// The theme: Light, Dark or System (the default), as picked in the header's theme menu and kept for the next visit.
// ?theme=light|dark pins one without keeping it. data-theme is always light or dark, so site.css writes the dark
// tokens once: System takes the system's theme here, and follows it when it changes.
// The language: ?lang=, then the last one picked in the language menu, then the browser's languages in order of
// preference, English when none of them is one of ours. site.js translates the page and applies a later choice.
// The words: only the chosen language's strings/<language>.js is fetched, without blocking the first paint, and none
// for English, the markup's own. Until it arrives :root.i18n-wait keeps the page hidden (site.css), so a Portuguese
// or Spanish visitor never sees the English first; after 3 s the page shows anyway.
(function () {
  const SUPPORTED = ["en", "pt", "es"];
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; } // storage blocked
  }

  // A tag as the site reads it, from the browser or from ?lang= alike: its first subtag (pt-BR is pt, EN is en).
  const normalize = (tag) => String(tag).toLowerCase().split(/[-_]/)[0];
  const known = (code) => SUPPORTED.includes(code);
  // The language "System" stands for: the first of the browser's languages the site has, English when none.
  window.systemLang = () =>
    (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""])
      .map(normalize)
      .find(known) || "en";
  const chosen = [params.get("lang"), stored("lang")].map((code) => code && normalize(code)).find(known);
  root.dataset.langPref = chosen || "system";
  root.dataset.lang = chosen || window.systemLang();
  // Every language's tag is its code, but Brazil's Portuguese, pt-BR. site.js keeps the same table.
  root.lang = { pt: "pt-BR" }[root.dataset.lang] || root.dataset.lang;

  // window.loadStrings(lang): a promise that settles once strings/<lang>.js has run, or failed (the page then stays in
  // English). Each file loads once; site.js uses this for a language picked later too.
  window.SITE_STRINGS = window.SITE_STRINGS || {};
  const loading = {};
  window.loadStrings = function (lang) {
    if (lang === "en" || window.SITE_STRINGS[lang]) return Promise.resolve();
    if (!loading[lang]) {
      loading[lang] = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = `/strings/${lang}.js`;
        script.onload = script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }
    return loading[lang];
  };
  if (root.dataset.lang !== "en") {
    root.classList.add("i18n-wait");
    window.loadStrings(root.dataset.lang);
    setTimeout(() => root.classList.remove("i18n-wait"), 3000);
  }

  const theme = [params.get("theme"), stored("theme")].find((t) => ["light", "dark", "system"].includes(t)) || "system";
  const systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function applyTheme(pref) {
    root.dataset.themePref = pref;
    root.dataset.theme = pref === "system" ? (systemDark && systemDark.matches ? "dark" : "light") : pref;
  }
  window.applyTheme = applyTheme;
  applyTheme(theme);
  if (systemDark) {
    const follow = () => { if (root.dataset.themePref === "system") applyTheme("system"); };
    // Safari before 14 only has addListener.
    if (systemDark.addEventListener) systemDark.addEventListener("change", follow);
    else if (systemDark.addListener) systemDark.addListener(follow);
  }

  // Motion: sections rise as they scroll into view (site.css, site.js). Not with reduced motion, and not when
  // ?theme= pins a theme, so a capture shows every section. Every animation hangs on :root.motion.
  const still = params.has("theme") || !("IntersectionObserver" in window)
    || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (!still) root.classList.add("motion");
})();
