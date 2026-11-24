// Google Analytics of the site's own Firebase project (pierrevieira-site). Loaded with defer in <head>, so it runs once
// the page is parsed, before site.js; site.js sends its events with window.track(). docs/analytics.md lists every event.
// gtag.js itself, the heaviest script of the page, comes only once the page has settled, so it never competes with the
// first paint: what was queued meanwhile (the page view, the events) is sent when it arrives.
(function () {
  const MEASUREMENT_ID = "G-DFWXEW94N0";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);
  window.track = function track(name, params) {
    window.gtag("event", name, params);
  };

  // Only the published site reports: `npm run dev` and Cloudflare's previews queue the events and never send them.
  const PUBLISHED = /(^|\.)pierrevieira\.com$/.test(location.hostname);

  // gtag.js comes at the visitor's first tap, click or key, or else in the browser's idle time once the page has been
  // loaded for SETTLE_MS. A visit that leaves before either sends nothing. Every link that leaves the page opens a new
  // tab or downloads a file, so no click has to wait for it.
  const SETTLE_MS = 4000;
  const FIRST_INPUT = ["pointerdown", "keydown"];
  let tagAsked = false;
  function loadTag() {
    if (tagAsked || !PUBLISHED) return;
    tagAsked = true;
    FIRST_INPUT.forEach((type) => removeEventListener(type, loadTag, true));
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.append(script);
  }
  FIRST_INPUT.forEach((type) => addEventListener(type, loadTag, { capture: true, passive: true }));
  function settle() {
    setTimeout(() => {
      // Safari has no requestIdleCallback: there the wait alone decides.
      if (window.requestIdleCallback) requestIdleCallback(loadTag, { timeout: 2000 });
      else loadTag();
    }, SETTLE_MS);
  }
  if (document.readyState === "complete") settle();
  else addEventListener("load", settle, { once: true });

  // Where on the page a link is: the header's bar or its menu, the hero, a section (by its id) or the footer.
  function originOf(el) {
    if (el.closest(".menu-pop")) return "header_menu";
    if (el.closest(".site-header")) return "header";
    if (el.closest(".site-footer")) return "footer";
    const section = el.closest("section[id]");
    if (!section) return "page";
    return section.id === "top" ? "hero" : section.id;
  }
  // What an app's link leads to.
  function appTarget(url) {
    if (url.hostname === "play.google.com") return "play";
    if (url.hostname === "apps.apple.com") return "appstore";
    if (url.hostname === "github.com") return "source";
    return "website";
  }
  const PROFILES = { "www.linkedin.com": "linkedin", "github.com": "github" };

  // The page's links, read from the markup: a résumé, an app's store or site, a talk, a way to reach Pierre, a section.
  // Google Analytics' own outbound click event still counts every other link that leaves (the companies' sites).
  addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;
    const origin = originOf(link);
    const href = link.getAttribute("href");
    if (link.hasAttribute("download")) {
      window.track("cv_download", { origin });
      return;
    }
    if (link.hasAttribute("data-email")) {
      window.track("contact_click", { method: "email", origin });
      return;
    }
    if (href.startsWith("#")) {
      window.track("navigation_click", { target: href.slice(1) || "top", origin });
      return;
    }
    const url = new URL(link.href);
    const app = link.closest("[data-app]");
    if (app) {
      window.track("app_link_click", { app: app.dataset.app, target: appTarget(url) });
      return;
    }
    const talk = link.closest("[data-talk]") || (url.hostname === "youtu.be" && document.querySelector(`[data-talk][href="${href}"]`));
    if (talk) {
      window.track("talk_click", { talk: talk.dataset.talk, origin });
      return;
    }
    const profile = PROFILES[url.hostname];
    if (profile && url.pathname.split("/").filter(Boolean).length <= 2) {
      window.track("contact_click", { method: profile, origin });
    }
  });

  // The campaign that brought the visitor, once per visit.
  const params = new URLSearchParams(location.search);
  if (params.get("utm_source")) {
    const utm = {};
    ["source", "medium", "campaign", "term", "content"].forEach((key) => {
      const value = params.get(`utm_${key}`);
      if (value) utm[key] = value.slice(0, 100);
    });
    const seen = JSON.stringify(utm);
    let repeated = false;
    try {
      repeated = sessionStorage.getItem("utm") === seen;
      sessionStorage.setItem("utm", seen);
    } catch (e) { /* storage blocked: the event may repeat on a reload */ }
    if (!repeated) window.track("traffic_source", utm);
  }
})();
