/*
 * Analytics tracker. Drop it on any page with <script src="/tracker.js"> and it
 * records page_view (on load and on client-side navigation) plus every click,
 * then sends them to the backend in small batches. No dependencies.
 * Skips tracking if the browser has Do Not Track turned on.
 */
(function () {
  "use strict";
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  var ENDPOINT = "/api/analytics/collect";
  var STORAGE_KEY = "convene_session";
  var FLUSH_INTERVAL = 2000;
  var SESSION_TTL = 30 * 60 * 1000;

  function uuid() {
    if (window.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function getSessionId() {
    var now = Date.now();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.id && now - p.lastActivity < SESSION_TTL) {
          p.lastActivity = now;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          return p.id;
        }
      }
    } catch {}
    var id = uuid();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: id, lastActivity: now }));
    } catch {}
    return id;
  }

  function touch() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        p.lastActivity = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
      }
    } catch {}
  }

  var SESSION_ID = getSessionId();
  var queue = [];

  // Send whatever's buffered to the backend. Prefer sendBeacon so events still
  // go out while the page is unloading; fall back to fetch when it's missing.
  function flush() {
    if (!queue.length) return;
    var payload = JSON.stringify({ events: queue.splice(0, queue.length) });
    var sent = false;
    if (navigator.sendBeacon) {
      try {
        sent = navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "text/plain" }));
      } catch {
        sent = false;
      }
    }
    if (!sent) {
      fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain" }, body: payload, keepalive: true }).catch(function () {});
    }
  }

  function enqueue(evt) {
    queue.push(evt);
    touch();
    if (evt.type === "page_view") flush();
  }

  function currentUrl() {
    return location.pathname + location.search;
  }

  function trackPageView() {
    enqueue({ sessionId: SESSION_ID, type: "page_view", url: currentUrl(), referrer: document.referrer || null, ts: Date.now(), vw: window.innerWidth, vh: window.innerHeight });
  }

  function describe(el) {
    if (!el || !el.tagName) return undefined;
    var sel = el.tagName.toLowerCase();
    if (el.id) sel += "#" + el.id;
    else if (el.className && typeof el.className === "string") {
      var first = el.className.trim().split(/\s+/)[0];
      if (first) sel += "." + first;
    }
    return sel.slice(0, 256);
  }

  trackPageView();

  document.addEventListener(
    "click",
    function (e) {
      enqueue({ sessionId: SESSION_ID, type: "click", url: currentUrl(), referrer: document.referrer || null, ts: Date.now(), x: Math.round(e.pageX), y: Math.round(e.pageY), vw: window.innerWidth, vh: window.innerHeight, target: describe(e.target) });
    },
    true,
  );

  setInterval(flush, FLUSH_INTERVAL);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);

  // Next.js navigates without a full page load, so we wrap history.pushState/
  // replaceState (and listen for popstate) to catch URL changes and log a new
  // page_view each time.
  var lastUrl = currentUrl();
  function onRouteChange() {
    var u = currentUrl();
    if (u !== lastUrl) {
      lastUrl = u;
      trackPageView();
    }
  }
  function patch(method) {
    var original = history[method];
    if (typeof original !== "function") return;
    history[method] = function () {
      var result = original.apply(this, arguments);
      window.setTimeout(onRouteChange, 0);
      return result;
    };
  }
  patch("pushState");
  patch("replaceState");
  window.addEventListener("popstate", onRouteChange);
})();
