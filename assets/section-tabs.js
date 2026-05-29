(() => {
  const STYLE_ID = "lrc-section-tabs-style";
  const PANEL_SELECTOR = ":scope > section";
  const contexts = [];

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .section-tabs-shell {
        box-sizing: border-box;
        justify-self: stretch;
        min-width: 0;
        width: min(100%, 1180px);
        max-width: 100%;
        margin: clamp(16px, 4vw, 28px) auto;
        border: 1px solid rgba(16, 32, 51, 0.12);
        border-radius: 18px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 18px 44px rgba(16, 32, 51, 0.1);
      }

      .section-tabs-kicker {
        margin: 0 0 8px;
        color: #7c693d;
        font-size: 0.72rem;
        font-weight: 850;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .section-tabs {
        display: flex;
        gap: 8px;
        min-width: 0;
        max-width: 100%;
        overflow-x: auto;
        padding-bottom: 2px;
        scrollbar-width: thin;
      }

      .section-tab {
        flex: 0 0 auto;
        max-width: min(240px, 72vw);
        border: 1px solid rgba(16, 32, 51, 0.12);
        border-radius: 999px;
        padding: 10px 14px;
        background: #fff;
        color: #102033;
        cursor: pointer;
        font: 800 0.9rem/1.1 -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        letter-spacing: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .section-tab:hover,
      .section-tab:focus-visible {
        border-color: rgba(198, 169, 107, 0.72);
        outline: none;
      }

      .section-tab[aria-selected="true"] {
        background: #102033;
        border-color: #102033;
        color: #fff;
      }

      [data-section-tab-panel][hidden] {
        display: none !important;
      }

      [data-section-tab-panel]:focus {
        outline: none;
      }

      @media (max-width: 720px) {
        .section-tabs-shell {
          border-radius: 14px;
          padding: 10px;
        }

        .section-tab {
          max-width: 78vw;
          padding: 9px 12px;
          font-size: 0.84rem;
        }
      }
    `;
    document.head.append(style);
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/[.!:;]+$/g, "")
      .trim();
  }

  function truncateLabel(value) {
    const label = normalizeText(value);
    if (label.length <= 34) return label;
    return `${label.slice(0, 31).trim()}...`;
  }

  function labelFromReference(section) {
    const labelledBy = section.getAttribute("aria-labelledby");
    if (!labelledBy) return "";
    return labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || "")
      .find((text) => normalizeText(text));
  }

  function isStartSection(section) {
    const marker = `${section.id || ""} ${section.className || ""}`.toLowerCase();
    return /\b(hero|start|workspace|pathway|stage|lead-panel|not-found-panel)\b/.test(marker);
  }

  function getSectionLabel(section, index) {
    const explicit = section.getAttribute("data-tab-label");
    if (explicit) return truncateLabel(explicit);

    if (section.classList.contains("lrc-app")) return "Assistant";
    if (isStartSection(section)) return index === 0 ? "Start" : "Overview";

    const candidates = [
      section.getAttribute("aria-label"),
      labelFromReference(section),
      section.querySelector(".eyebrow")?.textContent,
      section.querySelector(".lrc-route")?.textContent,
      section.querySelector(".panel-label")?.textContent,
      section.querySelector("h1")?.textContent,
      section.querySelector("h2")?.textContent,
      section.querySelector("h3")?.textContent,
      section.id ? section.id.replace(/[-_]+/g, " ") : "",
    ];

    const label = candidates.find((candidate) => normalizeText(candidate));
    return truncateLabel(label || `Section ${index + 1}`);
  }

  function safeId(value, fallback) {
    const base = normalizeText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || fallback;
  }

  function ensurePanelId(section, label, index) {
    if (section.id) return section.id;
    let id = `section-${safeId(label, index + 1)}`;
    let suffix = 2;
    while (document.getElementById(id)) {
      id = `section-${safeId(label, index + 1)}-${suffix}`;
      suffix += 1;
    }
    section.id = id;
    return id;
  }

  function visibleDirectSections(main) {
    return Array.from(main.querySelectorAll(PANEL_SELECTOR)).filter((section) => {
      if (section.hidden || section.matches("[data-section-tabs-exclude]")) return false;
      if (section.closest("[data-section-tabs-exclude]")) return false;
      return true;
    });
  }

  function defaultPanelIndex(sections) {
    const startIndex = sections.findIndex((section) => isStartSection(section));
    return startIndex >= 0 ? startIndex : 0;
  }

  function activate(context, panelId, options = {}) {
    const index = context.panels.findIndex((panel) => panel.id === panelId);
    if (index < 0) return false;

    context.panels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;
      panel.hidden = !active;
      context.tabs[panelIndex].setAttribute("aria-selected", String(active));
      context.tabs[panelIndex].tabIndex = active ? 0 : -1;
    });

    if (options.updateHash) {
      history.pushState(null, "", `#${context.panels[index].id}`);
    }

    if (options.focus) {
      context.panels[index].setAttribute("tabindex", "-1");
      context.panels[index].focus({ preventScroll: true });
      context.shell.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return true;
  }

  function panelForHash(hash) {
    if (!hash) return null;
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    const target = document.getElementById(id);
    if (!target) return null;

    for (const context of contexts) {
      const panel = context.panels.find((candidate) => candidate === target || candidate.contains(target));
      if (panel) return { context, panel };
    }

    return null;
  }

  function setupMain(main, mainIndex) {
    if (main.matches("[data-section-tabs='off'], .admin-shell, .employee-portal-content")) return;
    if (main.querySelector(":scope > .admin-tabs")) return;

    const sections = visibleDirectSections(main);
    if (sections.length < 2) return;

    const shell = document.createElement("div");
    shell.className = "section-tabs-shell";
    shell.setAttribute("data-section-tabs", "");

    const kicker = document.createElement("p");
    kicker.className = "section-tabs-kicker";
    kicker.textContent = "Sections";

    const tabList = document.createElement("div");
    tabList.className = "section-tabs";
    tabList.setAttribute("role", "tablist");
    tabList.setAttribute("aria-label", "Page sections");

    const tabs = sections.map((section, index) => {
      const label = getSectionLabel(section, index);
      const panelId = ensurePanelId(section, label, index);
      const tabId = `section-tab-${mainIndex}-${index + 1}`;
      section.dataset.sectionTabPanel = "";
      section.setAttribute("role", "tabpanel");
      section.setAttribute("aria-labelledby", tabId);

      const button = document.createElement("button");
      button.className = "section-tab";
      button.type = "button";
      button.id = tabId;
      button.textContent = label;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panelId);
      button.addEventListener("click", () => activate(context, panelId, { updateHash: true, focus: true }));
      tabList.append(button);
      return button;
    });

    shell.append(kicker, tabList);
    main.insertBefore(shell, sections[0]);

    const context = { main, shell, panels: sections, tabs };
    contexts.push(context);

    const hashPanel = panelForHash(window.location.hash);
    const activeId = hashPanel?.context === context ? hashPanel.panel.id : sections[defaultPanelIndex(sections)].id;
    activate(context, activeId);
  }

  function setupLinks() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;
      const matched = panelForHash(link.getAttribute("href"));
      if (!matched) return;
      event.preventDefault();
      activate(matched.context, matched.panel.id, { updateHash: true, focus: true });
    });

    window.addEventListener("hashchange", () => {
      const matched = panelForHash(window.location.hash);
      if (matched) activate(matched.context, matched.panel.id, { focus: true });
    });
  }

  function init() {
    injectStyles();
    Array.from(document.querySelectorAll("main")).forEach(setupMain);
    if (contexts.length) setupLinks();
  }

  onReady(() => {
    window.requestAnimationFrame(() => window.setTimeout(init, 0));
  });
})();
