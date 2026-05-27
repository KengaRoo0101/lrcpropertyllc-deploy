(function () {
  const STORAGE_KEY = "lrcLeadHandoff";
  const LEAD_HASH = "#lead";

  function clean(value, max = 900) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  }

  function pageSource() {
    const segment = window.location.pathname.split("/").filter(Boolean)[0] || "parent";
    return `lrc-${segment}-handoff`;
  }

  function isSamePageLead(url) {
    return (
      url.hash === LEAD_HASH &&
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname
    );
  }

  function getPayload(link) {
    const interest = clean(link.dataset.leadInterest || link.dataset.toolInterest, 120);
    if (!interest) return null;

    return {
      interest,
      message: clean(link.dataset.leadMessage, 900),
      source: clean(link.dataset.leadSource || pageSource(), 80),
    };
  }

  function savePayload(payload) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_error) {
      // Handoff still works through URL params when storage is blocked.
    }
  }

  function withPayload(href, payload) {
    const url = new URL(href, window.location.href);

    if (isSamePageLead(url)) {
      return href;
    }

    url.searchParams.set("interest", payload.interest);
    if (payload.message) url.searchParams.set("message", payload.message);
    url.searchParams.set("source", payload.source);
    if (!url.hash) url.hash = LEAD_HASH;

    return url.toString();
  }

  function shouldHandlePlainClick(event) {
    return (
      !event.defaultPrevented &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    );
  }

  function getSamePageHashTarget(link) {
    const rawHref = link.getAttribute("href") || "";
    if (!rawHref.startsWith("#") || rawHref === "#") return null;

    const target = document.querySelector(rawHref);
    if (!target) return null;

    return { rawHref, target };
  }

  function moveToHash(rawHref, target) {
    target.scrollIntoView({ behavior: "auto", block: "start" });

    if (window.location.hash !== rawHref) {
      window.history.pushState(null, "", rawHref);
    }
  }

  window.LRCLeadHandoff = {
    storageKey: STORAGE_KEY,
    buildHref(href, payload) {
      return withPayload(href, payload);
    },
    save(payload) {
      savePayload(payload);
    },
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    if (link.matches("[data-lead-interest]")) {
      const payload = getPayload(link);
      if (payload) {
        savePayload(payload);
        link.href = withPayload(link.getAttribute("href") || "/#lead", payload);
      }
    }

    if (!shouldHandlePlainClick(event)) return;

    const hashTarget = getSamePageHashTarget(link);
    if (!hashTarget) return;

    event.preventDefault();
    moveToHash(hashTarget.rawHref, hashTarget.target);
  });
})();
