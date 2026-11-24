// The page's behaviors: language, theme, the header's menus, the email link, the Details folds and the sections'
// entrance.
// boot.js, in <head>, already picked the theme and the language; the markup is in English and strings/<language>.js
// holds the page's words in each other language (window.SITE_STRINGS.pt, .es), keyed as the data-i18n attributes name
// them. boot.js's window.loadStrings fetches a language's file the first time it's needed.
(function () {
  const root = document.documentElement;
  // analytics.js's window.track (docs/analytics.md); a blocked or missing analytics.js leaves every event out.
  const track = (name, params) => { if (window.track) window.track(name, params); };
  function store(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: the choice lasts for this visit */ }
  }

  // Language. Each translated place says where its words go: data-i18n (text), data-i18n-html (markup of our own, from
  // strings/), data-i18n-label (aria-label), data-i18n-alt (alt), data-i18n-content (a <meta>'s content) and
  // data-src-<language> (an image that shows words). The English originals are kept the first time, to switch back to.
  const TARGETS = [
    ["data-i18n", (el) => el.textContent, (el, value) => { el.textContent = value; }],
    ["data-i18n-html", (el) => el.innerHTML, (el, value) => { el.innerHTML = value; }],
    ["data-i18n-label", (el) => el.getAttribute("aria-label"), (el, value) => el.setAttribute("aria-label", value)],
    ["data-i18n-alt", (el) => el.getAttribute("alt"), (el, value) => el.setAttribute("alt", value)],
    ["data-i18n-content", (el) => el.getAttribute("content"), (el, value) => el.setAttribute("content", value)],
  ];
  const english = new Map();

  // Years of experience: the whole years since the first job, in September 2020, so no figure on the page goes stale.
  // A [data-years] element holds the number; data-years="word" spells it out, capitalized, as it opens its sentence
  // (digits past the table). The markup's own figure is only what a visitor without scripts reads.
  const CAREER_START = { year: 2020, month: 8 };
  const NUMBER_WORDS = {
    en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"],
    pt: ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove", "vinte"],
    es: ["cero", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"],
  };
  function yearsOfExperience(now) {
    const years = now.getFullYear() - CAREER_START.year - (now.getMonth() < CAREER_START.month ? 1 : 0);
    return Math.max(years, 0);
  }
  function fillYears(lang) {
    const years = yearsOfExperience(new Date());
    document.querySelectorAll("[data-years]").forEach((el) => {
      const word = el.dataset.years === "word" && (NUMBER_WORDS[lang] || [])[years];
      el.textContent = word ? word[0].toUpperCase() + word.slice(1) : String(years);
    });
  }
  const LANGUAGE_TAGS = { pt: "pt-BR" };
  const LANGUAGE_CHIPS = { pt: "BR" };

  function translate(lang) {
    const words = (window.SITE_STRINGS || {})[lang];
    TARGETS.forEach(([attribute, read, write]) => {
      document.querySelectorAll(`[${attribute}]`).forEach((el) => {
        const key = el.getAttribute(attribute);
        const id = `${attribute}:${key}`;
        if (!english.has(el)) english.set(el, {});
        const kept = english.get(el);
        if (!(id in kept)) kept[id] = read(el);
        const value = words && key in words ? words[key] : kept[id];
        if (read(el) !== value) write(el, value);
      });
    });
    document.querySelectorAll("img[data-src-pt]").forEach((img) => {
      if (!img.dataset.srcEn) img.dataset.srcEn = img.getAttribute("src");
      const src = img.getAttribute(`data-src-${lang}`) || img.dataset.srcEn;
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
    // Last: a translated sentence brings its own [data-years] element.
    fillYears(lang);
  }

  // pref is a language or "system", which follows the browser's languages and forgets what was kept.
  function applyLanguage(pref) {
    const lang = pref === "system" ? window.systemLang() : pref;
    root.dataset.langPref = pref;
    root.dataset.lang = lang;
    root.lang = LANGUAGE_TAGS[lang] || lang;
    document.querySelectorAll(".lang-code").forEach((el) => { el.textContent = LANGUAGE_CHIPS[lang] || lang.toUpperCase(); });
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setLang === pref));
    });
    // The words wait for their file; a language picked again meanwhile wins.
    window.loadStrings(lang).then(() => {
      if (root.dataset.lang !== lang) return;
      translate(lang);
      root.classList.remove("i18n-wait");
    });
  }
  applyLanguage(root.dataset.langPref || "system");
  document.querySelectorAll("[data-set-lang]").forEach((button) => button.addEventListener("click", () => {
    const pref = button.dataset.setLang;
    store("lang", pref === "system" ? null : pref);
    // A pinned ?lang= would win over the choice on the next load.
    const url = new URL(location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.delete("lang");
      history.replaceState(null, "", url);
    }
    applyLanguage(pref);
    track("language_change", { language: pref });
    closeMenus();
  }));

  // Theme: Light, Dark or System, kept for the next visit. boot.js owns the rule (window.applyTheme).
  function markTheme() {
    const pref = root.dataset.themePref || "system";
    document.querySelectorAll("[data-set-theme]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setTheme === pref));
    });
  }
  markTheme();
  document.querySelectorAll("[data-set-theme]").forEach((button) => button.addEventListener("click", () => {
    const pref = button.dataset.setTheme;
    store("theme", pref === "system" ? null : pref);
    if (window.applyTheme) window.applyTheme(pref);
    markTheme();
    track("theme_change", { theme: pref });
    closeMenus();
  }));

  // The header's menus are <details>: one open at a time, closed by a pick, a click outside and Escape (which gives
  // the focus back to the menu's button).
  const menus = [...document.querySelectorAll("details.menu")];
  function closeMenus(except) {
    menus.forEach((menu) => { if (menu !== except) menu.open = false; });
  }
  menus.forEach((menu) => {
    menu.addEventListener("toggle", () => { if (menu.open) closeMenus(menu); });
    menu.querySelectorAll(".menu-pop a").forEach((link) => link.addEventListener("click", () => closeMenus()));
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("details.menu")) closeMenus();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = menus.find((menu) => menu.open);
    if (!open) return;
    open.open = false;
    open.querySelector("summary").focus();
  });

  // The header draws its line once the page has scrolled under it.
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // The floating button to the top appears once the hero has scrolled out of view, and steps aside when the footer,
  // with its own link to the top, comes in (where the button would sit on that link).
  const topButton = document.querySelector(".fab-top");
  const hero = document.getElementById("top");
  const footer = document.querySelector(".site-footer");
  if (topButton && hero && footer) {
    const inView = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => inView.set(entry.target, entry.isIntersecting));
      topButton.hidden = inView.get(hero) !== false || inView.get(footer) === true;
    });
    observer.observe(hero);
    observer.observe(footer);
  }

  // The email address is written here, from its parts, so it isn't in the markup for a scraper to read.
  document.querySelectorAll("[data-email]").forEach((link) => {
    const address = `${link.dataset.user}@${link.dataset.host}`;
    link.href = `mailto:${address}`;
    const text = link.querySelector("[data-email-text]");
    if (text) text.textContent = address;
  });

  // Folds: an app's or a job's details sit under a Details toggle, built here from the markup's template (so a page
  // without scripts has no toggle and every fold open). The current job, the one with the .now badge, starts open; the
  // others start folded. Each toggle is described by its card's heading, so a screen reader tells them apart.
  // Built before the language's words arrive, so translate() reaches the toggles too.
  // A closed fold's content is hidden="until-found": out of view, of the tab order and of screen readers, but the
  // browser's find in page still matches it and fires beforematch, which opens the fold (where the browser supports
  // it; elsewhere it's plain hidden).
  const FOLD_MS = 350; // site.css's .fold.toggled transition
  function setFoldOpen(toggle, fold, open) {
    const content = fold.firstElementChild;
    toggle.setAttribute("aria-expanded", String(open));
    fold.classList.toggle("closed", !open);
    clearTimeout(fold.hideLater);
    if (open) content.removeAttribute("hidden");
    else if (fold.classList.contains("toggled") && root.classList.contains("motion")) {
      // Hidden once it has slid shut, so the content doesn't vanish before the fold closes.
      fold.hideLater = setTimeout(() => content.setAttribute("hidden", "until-found"), FOLD_MS);
    } else content.setAttribute("hidden", "until-found");
  }
  const foldToggle = document.getElementById("fold-toggle");
  if (foldToggle) document.querySelectorAll(".fold[data-item]").forEach((fold) => {
    const item = fold.dataset.item;
    const card = fold.closest(".job, .app");
    const heading = card && card.querySelector("h3");
    const toggle = foldToggle.content.firstElementChild.cloneNode(true);
    fold.id = `fold-${item}`;
    toggle.setAttribute("aria-controls", fold.id);
    if (heading) {
      heading.id = heading.id || `${fold.id}-name`;
      toggle.setAttribute("aria-describedby", heading.id);
    }
    fold.before(toggle);
    setFoldOpen(toggle, fold, Boolean(card && card.querySelector(".now")));
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      // Only a fold the visitor toggled moves (.toggled): the first state, set as the page loads, snaps.
      fold.classList.add("toggled");
      setFoldOpen(toggle, fold, open);
      track("details_toggle", { item, state: open ? "open" : "close" });
    });
    // Find in page matched inside: open at once (no slide), so the browser scrolls to where the match will stay.
    fold.firstElementChild.addEventListener("beforematch", () => {
      fold.classList.remove("toggled");
      setFoldOpen(toggle, fold, true);
      track("details_toggle", { item, state: "find" });
    });
  });

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  // Entrance: with :root.motion (boot.js), a .reveal block rises once as it scrolls into view.
  if (root.classList.contains("motion")) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }
})();
