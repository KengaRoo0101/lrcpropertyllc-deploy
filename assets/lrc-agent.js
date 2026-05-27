(() => {
  const FOUNDER_STORAGE_KEY = "lrc_workspace_v1";
  const WORKSPACE_VERSION = "1.0";
  const PRODUCT = "Formed";
  const ACTIVE_TOOL = "startup-intake";
  const PAYMENT_NOTE = "You securely review and authorize payment before anything is charged.";
  const APPROVAL_BOUNDARY = "Your plan stays local until you choose to continue. Nothing is filed, published, charged, or sent unless you approve it.";
  const NON_LEGAL_NOTE = "This is a local planning draft only. Formed does not provide legal, tax, accounting, or filing services.";
  const APPROVAL_NOTICE = "Nothing happens without your approval. You securely review and authorize payment before anything is charged.";
  const STARTING_PLAN_READY = "Your starting plan is ready.";
  const DEFAULT_GOAL = "I want to start a business";
  const STARTER_PLACEHOLDERS = [
    "A clothing brand",
    "A cleaning business",
    "A consulting agency",
    "A hiring platform",
    "A local service company",
  ];
  const CHECKOUT_HOLD = {
    available: false,
    mode: "hold",
    paymentStatus: "not_started",
  };
  const IP_REVIEW_PREP_TEXT = `IP REVIEW PREP PACKET

Purpose:
Organize brand, product, and technical notes for a qualified attorney's review.

What to gather:
- Current product and brand names in use.
- Screenshots showing how names, routes, and product labels appear publicly.
- Original source-file paths, asset names, and revision notes.
- A plain-language summary of what the product does.
- Questions for attorney review before any public filing decision.

Boundaries:
Formed can organize a review packet, checklist, and next questions. It does not provide legal advice, trademark clearance, patent advice, or filing services. No filing is prepared or submitted from this page.`;
  const FORMATION_ACTIONS = [
    "Choose business name direction",
    "Define your primary offer",
    "Prepare formation checklist",
  ];

  const FOUNDER_ROUTES = {
    "formed-startup": {
      label: "Formed Launch Plan",
      workspace: "Formed Startup Workspace",
      diagnosis: "You need structure, launch guidance, and a clear setup path before execution.",
      nextThreeSteps: FORMATION_ACTIONS,
      deliverableTitle: "Starter Business Brief",
      cta: "Continue Building",
      href: "/formed/",
      terms: ["start a business", "start business", "new business", "business", "company", "llc", "formation", "entity", "incorporate", "startup", "launch", "form a company", "business formation", "entity planning"],
    },
    "formed-brand": {
      label: "Brand Launch Plan",
      workspace: "Formed Brand Workspace",
      diagnosis: "You need a sharper name direction, positioning angle, and readiness check before the brand becomes public.",
      nextThreeSteps: [
        "List 3 name directions",
        "Define the core promise",
        "Check domain and trademark readiness",
      ],
      deliverableTitle: "Brand Readiness Brief",
      cta: "Continue Building",
      href: "/formed/",
      terms: ["name", "brand", "branding", "domain", "trademark", "positioning", "product positioning", "logo", "identity", "naming"],
    },
    "formed-ops": {
      label: "Operations Launch Plan",
      workspace: "Formed Operations Workspace",
      diagnosis: "You need a clean operating path, internal checklist, and documentation flow before the work spreads across tools.",
      nextThreeSteps: [
        "Name the core workflow",
        "List the setup tasks",
        "Create the first operating checklist",
      ],
      deliverableTitle: "Operations Setup Brief",
      cta: "Continue Building",
      href: "/formed/",
      terms: ["workflow", "workflows", "systems", "internal system", "admin", "documentation", "docs", "setup tasks", "operations", "ops", "process", "sop"],
    },
    "formed-review": {
      label: "Build Review Plan",
      workspace: "Formed Review Workspace",
      diagnosis: "You need a focused review path so the existing idea, plan, document, or setup can become easier to act on.",
      nextThreeSteps: [
        "Identify what already exists",
        "Mark the unclear assumptions",
        "Prepare a review checklist",
      ],
      deliverableTitle: "Business Setup Review Brief",
      cta: "Continue Building",
      href: "/formed/",
      terms: ["review", "existing idea", "existing plan", "document", "business setup", "look over", "feedback", "audit", "check my", "plan review"],
    },
    "ip-review-prep": {
      label: "IP Review Prep",
      workspace: "Formed Review Workspace",
      diagnosis: "You need a clean review packet, asset list, public-use notes, and attorney questions before any IP filing decision.",
      nextThreeSteps: [
        "List the public names and assets",
        "Gather source paths and screenshots",
        "Prepare questions for attorney review",
      ],
      deliverableTitle: "IP Review Prep Packet",
      cta: "Continue Building",
      href: "/formed/",
      documentType: "Review Prep Packet",
      outputLabel: "IP review prep",
      outputHeading: "Your review packet outline is ready.",
      terms: ["trademark", "copyright", "brand protection", "ip review", "attorney review", "asset map", "source use", "public use"],
    },
    "general-lrc": {
      label: "Starter Launch Plan",
      workspace: "LRC Starting Workspace",
      diagnosis: "Your goal needs one clear plan before review, checkout, or handoff makes sense.",
      nextThreeSteps: [
        "Clarify the outcome",
        "Choose the closest Formed plan",
        "Prepare a local starting brief",
      ],
      deliverableTitle: "Starting Direction Brief",
      cta: "Continue Building",
      href: "/formed/",
      terms: [],
    },
  };

  function currentPath() {
    return window.location.pathname.replace(/\/index\.html$/, "/") || "/";
  }

  function isFounderHome() {
    return currentPath() === "/";
  }

  function clean(value, limit = 240) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit);
  }

  function cleanLong(value, limit = 4200) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\r\n/g, "\n")
      .trim()
      .slice(0, limit);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function scoreTerms(text, terms = []) {
    return terms.reduce((total, term) => {
      return text.includes(term) ? total + (term.includes(" ") ? 3 : 1) : total;
    }, 0);
  }

  function titleCase(value) {
    return clean(value, 48)
      .toLowerCase()
      .replace(/\b[a-z]/g, (char) => char.toUpperCase());
  }

  function conceptStem(userGoal) {
    const words = clean(userGoal, 120)
      .replace(/[^a-z0-9\s]/gi, " ")
      .split(/\s+/)
      .filter((word) => word && !["a", "an", "the", "i", "want", "to", "start", "build", "business", "company"].includes(word.toLowerCase()));
    return titleCase(words[0] || "Launch");
  }

  function isIpReviewPrepRequest(userGoal) {
    const text = ` ${String(userGoal || "").toLowerCase()} `;
    return [
      " trademark",
      " copyright",
      " brand protection",
      " ip review",
      " attorney review",
      " asset map",
      " source use",
      " public use",
    ].some((term) => text.includes(term));
  }

  function nameIdeasFor(userGoal) {
    const stem = conceptStem(userGoal);
    return [`${stem} Studio`, `${stem} Works`, `${stem} Co.`];
  }

  function classifyFounderRoute(userGoal) {
    const text = String(userGoal || "").toLowerCase();
    if (!text || text.length < 4) return "general-lrc";

    let bestKey = "general-lrc";
    let bestScore = 0;
    Object.entries(FOUNDER_ROUTES).forEach(([key, profile]) => {
      if (key === "general-lrc") return;
      const score = scoreTerms(text, profile.terms);
      if (score > bestScore) {
        bestKey = key;
        bestScore = score;
      }
    });
    return bestScore > 0 ? bestKey : "general-lrc";
  }

  function draftLinesFor(userGoal, routeKey, profile) {
    const concept = clean(userGoal, 160) || "New business idea";
    const nameIdeas = nameIdeasFor(concept).join(", ");
    if (routeKey === "ip-review-prep") {
      return [IP_REVIEW_PREP_TEXT];
    }

    if (routeKey === "formed-brand") {
      return [
        "Business Draft",
        `Working concept: ${concept}`,
        "Recommended structure: Brand-first launch plan with name direction, audience, offer, and review notes.",
        `Business name ideas: ${nameIdeas}`,
        "First filing checklist: Confirm name direction, choose state focus, gather owner details, and review before filing.",
        "Launch roadmap: Define the first offer, prepare a simple page, collect early customer interest, then review.",
        "Estimated startup needs: Name and domain budget, basic brand proof, simple records, and review time.",
        "Immediate next action: Continue building in Formed.",
        `Trust note: ${NON_LEGAL_NOTE}`,
      ];
    }

    if (routeKey === "formed-ops") {
      return [
        "Business Draft",
        `Working concept: ${concept}`,
        "Recommended structure: Operations-first launch plan with workflow, owner tasks, documents, and review notes.",
        `Business name ideas: ${nameIdeas}`,
        "First filing checklist: Confirm working name, owner details, state focus, and records before filing.",
        "Launch roadmap: Map the workflow, define the first customer promise, prepare intake, then review.",
        "Estimated startup needs: Basic documents, record categories, simple intake path, and review time.",
        "Immediate next action: Continue building in Formed.",
        `Trust note: ${NON_LEGAL_NOTE}`,
      ];
    }

    if (routeKey === "formed-review") {
      return [
        "Business Draft",
        `Working concept: ${concept}`,
        "Recommended structure: Review-first launch plan with assumptions, gaps, and a clear next decision.",
        `Business name ideas: ${nameIdeas}`,
        "First filing checklist: Mark what is decided, what needs review, and what should wait before filing.",
        "Launch roadmap: Organize current notes, define the first offer, review blockers, then continue.",
        "Estimated startup needs: Current documents, review questions, basic records, and decision time.",
        "Immediate next action: Continue building in Formed.",
        `Trust note: ${NON_LEGAL_NOTE}`,
      ];
    }

    if (routeKey === "general-lrc") {
      return [
        "Business Draft",
        `Working concept: ${concept}`,
        "Recommended structure: Starter launch plan with offer, customer, setup checklist, and review notes.",
        `Business name ideas: ${nameIdeas}`,
        "First filing checklist: Confirm working name, state focus, owner details, and what needs review.",
        "Launch roadmap: Clarify the first offer, prepare a contact path, collect first feedback, then continue.",
        "Estimated startup needs: Name/domain budget, simple launch page, basic records, and review time.",
        "Immediate next action: Continue building in Formed.",
        `Trust note: ${NON_LEGAL_NOTE}`,
      ];
    }

    return [
      "Business Draft",
      `Working concept: ${concept}`,
      "Recommended structure: Simple launch plan with offer, customer, setup checklist, and review notes.",
      `Business name ideas: ${nameIdeas}`,
      "First filing checklist: Confirm working name, state focus, owner details, and what needs review before filing.",
      "Launch roadmap: Define the first offer, create a contact path, prepare basic records, then review.",
      "Estimated startup needs: Name/domain budget, basic formation review, simple records, and a launch page.",
      "Immediate next action: Continue building in Formed.",
      `Trust note: ${NON_LEGAL_NOTE}`,
    ];
  }

  function buildFounderArtifact(input) {
    const userGoal = clean(input || DEFAULT_GOAL);
    const routeKey = isIpReviewPrepRequest(userGoal) ? "ip-review-prep" : classifyFounderRoute(userGoal);
    const profile = FOUNDER_ROUTES[routeKey] || FOUNDER_ROUTES["general-lrc"];
    const draftDeliverable = draftLinesFor(userGoal, routeKey, profile).join("\n");
    return {
      userGoal,
      product: PRODUCT,
      route: routeKey,
      activeRoute: routeKey,
      selectedCategory: routeKey,
      recommendedRoute: profile.label,
      recommendedPath: profile.label,
      workspace: profile.workspace,
      plainEnglishDiagnosis: profile.diagnosis,
      whyThisFits: profile.diagnosis,
      nextThreeSteps: profile.nextThreeSteps,
      nextActions: profile.nextThreeSteps,
      draftDeliverable,
      starterArtifact: profile.deliverableTitle,
      documentType: profile.documentType || "Business Draft",
      outputLabel: profile.outputLabel || "Business Draft",
      outputHeading: profile.outputHeading || "Your launch plan is ready.",
      approvalBoundary: APPROVAL_BOUNDARY,
      cta: profile.cta,
      nextMove: profile.cta,
      href: profile.href,
      reviewStatus: "needs-user-review",
      checkoutStatus: { ...CHECKOUT_HOLD },
      deliverableStatus: "local-draft-only",
      statuses: {
        draft: "Ready",
        review: "Needs User Review",
        checkout: "Hold",
      },
      paymentNote: PAYMENT_NOTE,
    };
  }

  function buildArtifact(input) {
    return buildFounderArtifact(input);
  }

  function normalizeEvent(event) {
    if (!event || typeof event !== "object") return null;
    return {
      type: clean(event.type, 80) || "workspace-event",
      timestamp: clean(event.timestamp, 80) || new Date().toISOString(),
      product: PRODUCT,
      route: clean(event.route, 80) || "general-lrc",
      inputLength: Number.isFinite(Number(event.inputLength)) ? Number(event.inputLength) : 0,
      selectedCategory: clean(event.selectedCategory, 80) || "general-lrc",
      uiAction: clean(event.uiAction, 80) || "unknown",
    };
  }

  function normalizeEvents(events = []) {
    return (Array.isArray(events) ? events : [])
      .map(normalizeEvent)
      .filter(Boolean)
      .slice(-24);
  }

  function eventFor(type, artifact, uiAction) {
    return {
      type,
      timestamp: new Date().toISOString(),
      product: PRODUCT,
      route: artifact?.activeRoute || artifact?.route || "general-lrc",
      inputLength: clean(artifact?.userGoal || "", 1000).length,
      selectedCategory: artifact?.selectedCategory || artifact?.activeRoute || "general-lrc",
      uiAction,
    };
  }

  function workspaceFromArtifact(artifact, previousEvents = [], eventType = "workspace-draft-created", uiAction = "submit") {
    const events = normalizeEvents(previousEvents);
    const nextEvent = normalizeEvent(eventFor(eventType, artifact, uiAction));
    if (nextEvent) events.push(nextEvent);
    return {
      version: WORKSPACE_VERSION,
      product: PRODUCT,
      userGoal: artifact.userGoal || "",
      activeRoute: artifact.activeRoute || "general-lrc",
      activeTool: ACTIVE_TOOL,
      currentStep: "draft-created",
      draft: {
        recommendedRoute: artifact.recommendedRoute || "",
        plainEnglishDiagnosis: artifact.plainEnglishDiagnosis || "",
        nextThreeSteps: Array.isArray(artifact.nextThreeSteps) ? artifact.nextThreeSteps.slice(0, 3) : [],
        draftDeliverable: artifact.draftDeliverable || "",
        approvalBoundary: artifact.approvalBoundary || APPROVAL_BOUNDARY,
        cta: artifact.cta || "Continue Building",
      },
      reviewStatus: artifact.reviewStatus || "needs-user-review",
      checkoutStatus: { ...CHECKOUT_HOLD },
      deliverableStatus: "local-draft-only",
      events: events.slice(-24),
      lastUpdated: new Date().toISOString(),
    };
  }

  function artifactFromWorkspace(workspace) {
    if (!workspace?.draft || typeof workspace.draft !== "object") return null;
    const routeKey = clean(workspace.activeRoute, 80) || "general-lrc";
    const profile = FOUNDER_ROUTES[routeKey] || FOUNDER_ROUTES["general-lrc"];
    return {
      userGoal: clean(workspace.userGoal || DEFAULT_GOAL),
      product: PRODUCT,
      route: routeKey,
      activeRoute: routeKey,
      selectedCategory: routeKey,
      recommendedRoute: clean(workspace.draft.recommendedRoute || profile.label),
      recommendedPath: clean(workspace.draft.recommendedRoute || profile.label),
      workspace: profile.workspace,
      plainEnglishDiagnosis: clean(workspace.draft.plainEnglishDiagnosis || profile.diagnosis, 600),
      whyThisFits: clean(workspace.draft.plainEnglishDiagnosis || profile.diagnosis, 600),
      nextThreeSteps: Array.isArray(workspace.draft.nextThreeSteps) ? workspace.draft.nextThreeSteps.slice(0, 3).map((step) => clean(step, 140)) : profile.nextThreeSteps,
      nextActions: Array.isArray(workspace.draft.nextThreeSteps) ? workspace.draft.nextThreeSteps.slice(0, 3).map((step) => clean(step, 140)) : profile.nextThreeSteps,
      draftDeliverable: cleanLong(workspace.draft.draftDeliverable || ""),
      starterArtifact: profile.deliverableTitle,
      documentType: profile.documentType || "Business Draft",
      outputLabel: profile.outputLabel || "Business Draft",
      outputHeading: profile.outputHeading || "Your launch plan is ready.",
      approvalBoundary: clean(workspace.draft.approvalBoundary || APPROVAL_BOUNDARY, 700),
      cta: clean(workspace.draft.cta || profile.cta, 120),
      nextMove: clean(workspace.draft.cta || profile.cta, 120),
      href: profile.href,
      reviewStatus: clean(workspace.reviewStatus || "needs-user-review", 80),
      checkoutStatus: { ...CHECKOUT_HOLD },
      deliverableStatus: clean(workspace.deliverableStatus || "local-draft-only", 80),
      statuses: {
        draft: workspace.deliverableStatus === "local-draft-only" ? "Ready" : "Ready",
        review: workspace.reviewStatus === "review-requested" ? "Review Requested" : "Needs User Review",
        checkout: "Hold",
      },
      paymentNote: PAYMENT_NOTE,
    };
  }

  function workspaceFromLegacy(saved) {
    const input = clean(saved?.userGoal || saved?.artifact?.userGoal || DEFAULT_GOAL);
    const artifact = buildFounderArtifact(input);
    return workspaceFromArtifact(artifact, [], "workspace-migrated", "restore");
  }

  function isStartupWorkspace(parsed) {
    return Boolean(
      parsed &&
      typeof parsed === "object" &&
      parsed.version === WORKSPACE_VERSION &&
      parsed.product === PRODUCT &&
      parsed.activeTool === ACTIVE_TOOL &&
      parsed.draft &&
      typeof parsed.draft === "object"
    );
  }

  function readWorkspace() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FOUNDER_STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return null;
      if (isStartupWorkspace(parsed)) {
        return {
          ...parsed,
          events: normalizeEvents(parsed.events),
          checkoutStatus: { ...CHECKOUT_HOLD },
        };
      }
      if (parsed.artifact) {
        const migrated = workspaceFromLegacy(parsed);
        saveWorkspace(migrated, { syncRuntime: false });
        return migrated;
      }
      localStorage.removeItem(FOUNDER_STORAGE_KEY);
      return null;
    } catch (_error) {
      try {
        localStorage.removeItem(FOUNDER_STORAGE_KEY);
      } catch (_removeError) {
        // Local continuity is optional.
      }
      return null;
    }
  }

  function saveWorkspace(workspace, options = {}) {
    try {
      localStorage.setItem(FOUNDER_STORAGE_KEY, JSON.stringify(workspace));
    } catch (_error) {
      // Local continuity is an enhancement. The page still works without storage.
    }

    if (options.syncRuntime === false || !window.LRCRuntime?.setState) return;
    window.LRCRuntime.setState({
      ...workspace,
      currentWorkspace: FOUNDER_ROUTES[workspace.activeRoute]?.workspace || "Formed Startup Workspace",
      currentArtifact: FOUNDER_ROUTES[workspace.activeRoute]?.deliverableTitle || "Starter Business Brief",
      currentRoute: workspace.activeRoute,
      currentAgent: PRODUCT,
      currentStep: workspace.currentStep,
      approvalState: "Not Required Yet",
      draftState: "Ready",
      status: STARTING_PLAN_READY,
      nextMove: workspace.draft.cta,
      runtimePhase: "local_draft",
      recentActions: [STARTING_PLAN_READY],
      availableActions: ["Save Draft", "Continue Building", "Upgrade"],
      supportModules: ["Business Draft", "Build", "Stripe Checkout hold"],
      workspaceUpdatedAt: workspace.lastUpdated,
      recentArtifactHistory: [FOUNDER_ROUTES[workspace.activeRoute]?.deliverableTitle || "Starter Business Brief"],
      statuses: {
        draft: "Ready",
        review: workspace.reviewStatus === "review-requested" ? "Review Requested" : "Needs User Review",
        checkout: "Hold",
      },
      nextAction: workspace.draft.cta,
    }, { action: STARTING_PLAN_READY, preserveTimestamp: true });
  }

  function appendWorkspaceEvent(type, artifact, uiAction, patch = {}) {
    const workspace = readWorkspace();
    const baseArtifact = artifact || artifactFromWorkspace(workspace) || buildFounderArtifact(DEFAULT_GOAL);
    const updated = {
      ...(workspace || workspaceFromArtifact(baseArtifact, [], "workspace-restored", "restore")),
      ...patch,
      events: [
        ...normalizeEvents(workspace?.events),
        normalizeEvent(eventFor(type, baseArtifact, uiAction)),
      ].filter(Boolean).slice(-24),
      lastUpdated: new Date().toISOString(),
    };
    saveWorkspace(updated);
    return updated;
  }

  function updateCheckoutStatus(status, artifact) {
    const workspace = readWorkspace();
    if (!workspace) return;
    appendWorkspaceEvent("checkout-status-checked", artifact || artifactFromWorkspace(workspace), "checkout-status", {
      checkoutStatus: {
        ...CHECKOUT_HOLD,
        mode: status === "Started" ? "hold" : "hold",
        paymentStatus: status === "Started" ? "not_started" : "not_started",
      },
    });
  }

  function founderDraftText(artifact) {
    const steps = artifact.nextThreeSteps?.length ? artifact.nextThreeSteps : FORMATION_ACTIONS;
    const label = artifact.outputLabel || artifact.documentType || "Business Draft";
    const heading = artifact.outputHeading || "Your launch plan is ready.";
    return [
      label,
      artifact.recommendedRoute || "Formed Launch Plan",
      "",
      heading,
      artifact.plainEnglishDiagnosis || "You need structure, launch guidance, and a clear setup path before execution.",
      "",
      artifact.route === "ip-review-prep" ? "Review prep" : "Next steps",
      ...steps.slice(0, 3).map((item, index) => `${index + 1}. ${item}`),
      "",
      artifact.route === "ip-review-prep" ? "Review packet" : "Launch plan",
      artifact.draftDeliverable || "Starter Business Brief",
      "",
      "Trust note",
      artifact.approvalBoundary || APPROVAL_BOUNDARY,
      "",
      PAYMENT_NOTE,
    ].join("\n");
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (_error) {
        // Fall through to the textarea copy path for browsers without clipboard access.
      }
    }
    return new Promise((resolve, reject) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        copied ? resolve() : reject(new Error("copy unavailable"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function showCopyFallback(anchor, text, label) {
    const host = anchor.closest(".founder-artifact-card") || anchor.parentElement;
    host?.querySelector("[data-lrc-copy-fallback]")?.remove();
    const fallback = document.createElement("div");
    fallback.className = "copy-fallback-panel";
    fallback.dataset.lrcCopyFallback = "true";

    const message = document.createElement("p");
    message.textContent = label;

    const textarea = document.createElement("textarea");
    textarea.readOnly = true;
    textarea.value = text;
    textarea.setAttribute("aria-label", "Copy fallback text");

    fallback.append(message, textarea);
    anchor.insertAdjacentElement("afterend", fallback);
    window.setTimeout(() => {
      textarea.focus();
      textarea.select();
    }, 0);
  }

  async function startSecureCheckout(button, note, artifact) {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Checking Stripe Checkout";
    if (note) note.textContent = PAYMENT_NOTE;

    try {
      const statusResponse = await fetch("/api/checkout-status", {
        headers: { accept: "application/json" },
      });
      const status = await statusResponse.json().catch(() => ({}));
      if (!status.available) {
        updateCheckoutStatus("Hold", artifact);
        if (note) {
          note.textContent = status.message || "Stripe Checkout opens only after owner approval and payment configuration are active.";
        }
        return;
      }

      button.textContent = "Opening Stripe Checkout";
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ source: "founder-flow", route: artifact?.route || "Formed" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        updateCheckoutStatus("Hold", artifact);
        if (note) {
          note.textContent = data.error || "Stripe Checkout is not available yet. Nothing was charged.";
        }
        return;
      }
      updateCheckoutStatus("Started", artifact);
      window.location.assign(data.url);
    } catch (_error) {
      updateCheckoutStatus("Hold", artifact);
      if (note) note.textContent = "Stripe Checkout is unavailable right now. Nothing was charged.";
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  function deliverableHtml(text) {
    const lines = cleanLong(text).split("\n").filter(Boolean);
    if (!lines.length) return "<p>Starter Business Brief</p>";
    const [title, ...body] = lines;
    return `
      <div class="founder-draft-deliverable">
        <h3>${escapeHtml(title)}</h3>
        <dl>
          ${body.map((line) => {
            const [label, ...rest] = line.split(":");
            const value = rest.join(":").trim();
            if (!value) return `<div><dt>Note</dt><dd>${escapeHtml(line)}</dd></div>`;
            return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
          }).join("")}
        </dl>
      </div>
    `;
  }

  function renderArtifact(output, artifact, workspace, context = {}) {
    output.innerHTML = "";
    output.hidden = false;

    const href = artifact.href || "/formed/";
    const activeWorkspace = workspace || workspaceFromArtifact(artifact, [], "workspace-rendered", "render");
    if (activeWorkspace) saveWorkspace(activeWorkspace);

    const card = document.createElement("div");
    card.className = "lrc-card founder-artifact-card";
    card.tabIndex = -1;
    const outputLabel = artifact.outputLabel || artifact.documentType || "Business Draft";
    const outputHeading = artifact.outputHeading || "Your launch plan is ready.";
    const deliverableLabel = artifact.route === "ip-review-prep" ? "Review packet" : "Launch plan";
    card.innerHTML = `
      <div class="founder-card-section">
        <p class="lrc-label">${escapeHtml(outputLabel)}</p>
        <h2>${escapeHtml(outputHeading)}</h2>
        <p>${escapeHtml(artifact.plainEnglishDiagnosis || "You need structure, launch guidance, and a clear setup path before execution.")}</p>
      </div>
      <div class="founder-card-section">
        <p class="lrc-label">${escapeHtml(deliverableLabel)}</p>
        ${deliverableHtml(artifact.draftDeliverable)}
      </div>
      <div class="founder-card-section">
        <p class="lrc-label">Trust note</p>
        <p>${escapeHtml(artifact.approvalBoundary || APPROVAL_BOUNDARY)}</p>
      </div>
      <div class="founder-secondary-actions" aria-label="Plan actions">
        <button class="lrc-btn" type="button" data-lrc-save-draft>Save Draft</button>
        <a class="lrc-btn lrc-primary-link" href="${escapeHtml(href)}" data-lrc-continue-building>Continue Building</a>
        <button class="lrc-btn" type="button" data-lrc-upgrade>Upgrade</button>
      </div>
      <p class="founder-payment-note" data-lrc-checkout-note>${escapeHtml(PAYMENT_NOTE)}</p>
    `;

    const saveButton = card.querySelector("[data-lrc-save-draft]");
    const checkoutNote = card.querySelector("[data-lrc-checkout-note]");
    saveButton?.addEventListener("click", async () => {
      const updated = appendWorkspaceEvent("draft-copied", artifact, "copy-draft");
      try {
        await copyText(founderDraftText(artifact));
        saveButton.textContent = "Draft Saved";
      } catch (_error) {
        showCopyFallback(saveButton, founderDraftText(artifact), "Clipboard access is blocked here. Draft text is selected below.");
        saveButton.textContent = "Draft Ready";
      }
      if (updated) saveWorkspace(updated);
      window.setTimeout(() => {
        saveButton.textContent = "Save Draft";
      }, 1400);
    });

    card.querySelector("[data-lrc-continue-building]")?.addEventListener("click", () => {
      appendWorkspaceEvent("continue-building", artifact, "continue-building");
    });

    card.querySelector("[data-lrc-upgrade]")?.addEventListener("click", (event) => {
      appendWorkspaceEvent("upgrade-selected", artifact, "upgrade");
      startSecureCheckout(event.currentTarget, checkoutNote, artifact);
    });

    output.append(card);

    window.requestAnimationFrame?.(() => {
      card.focus({ preventScroll: true });
    });
  }

  function setOutputPlaceholder(output) {
    if (!output || isFounderHome()) return;
    const label = output.querySelector(".lrc-label");
    const value = output.querySelector(".lrc-value");
    if (label) label.textContent = "Plan";
    if (value) value.textContent = "Describe the goal, then build the starting plan.";
  }

  function ensureSafetyBanner(app, input) {
    if (isFounderHome() || app.querySelector("[data-lrc-safety-banner]")) return;
    const banner = document.createElement("p");
    banner.className = "safety-pause-banner lrc-safety-banner";
    banner.dataset.lrcSafetyBanner = "true";
    banner.textContent = APPROVAL_NOTICE;
    input.insertAdjacentElement("beforebegin", banner);
  }

  function ensureInputControls(input) {
    const app = input.closest(".lrc-app") || document;
    ensureSafetyBanner(app, input);

    const existingButton = app.querySelector("[data-lrc-agent-action]");
    if (existingButton) return existingButton;

    const controls = document.createElement("div");
    controls.className = isFounderHome() ? "lrc-agent-controls founder-cta-bar" : "lrc-agent-controls";

    const button = document.createElement("button");
    button.className = "lrc-btn";
    button.type = "button";
    button.dataset.lrcAgentAction = "build";
    button.textContent = isFounderHome() ? "Start My Plan" : "Build Plan";

    controls.append(button);
    const inputWrap = input.closest(".founder-input-wrap");
    if (inputWrap) {
      inputWrap.append(controls);
    } else {
      input.insertAdjacentElement("afterend", controls);
    }
    return button;
  }

  function rotateFounderPlaceholders(input) {
    if (!isFounderHome() || input.dataset.lrcPlaceholderRotation === "true") return;
    input.dataset.lrcPlaceholderRotation = "true";
    let index = STARTER_PLACEHOLDERS.indexOf(input.getAttribute("placeholder"));
    if (index < 0) index = 0;
    input.setAttribute("placeholder", STARTER_PLACEHOLDERS[index]);
    window.setInterval(() => {
      if (document.activeElement === input || input.value) return;
      index = (index + 1) % STARTER_PLACEHOLDERS.length;
      input.setAttribute("placeholder", STARTER_PLACEHOLDERS[index]);
    }, 2200);
  }

  function restoreWorkspace(app, input, output) {
    if (!isFounderHome()) return false;
    const saved = readWorkspace();
    const artifact = artifactFromWorkspace(saved);
    if (!saved || !artifact) return false;
    input.value = saved.userGoal || DEFAULT_GOAL;
    renderArtifact(output, artifact, saved, { app, input });
    app.classList.add("has-plan");
    app.classList.remove("is-building");
    return true;
  }

  function bindAgent(input) {
    const app = input.closest(".lrc-app") || document;
    const output = app.querySelector("[data-lrc-agent-output]");
    if (!output) return;

    const button = ensureInputControls(input);
    rotateFounderPlaceholders(input);
    setOutputPlaceholder(output);
    restoreWorkspace(app, input, output);

    const generate = () => {
      const value = clean(input.value || DEFAULT_GOAL);
      if (value.length < 4) {
        input.focus();
        return;
      }
      input.value = value;
      const artifact = buildArtifact(value);
      const previous = readWorkspace();
      const workspace = workspaceFromArtifact(artifact, previous?.events || [], previous ? "workspace-draft-updated" : "workspace-draft-created", "submit");
      const runId = String(Date.now());
      app.dataset.lrcAgentRunId = runId;
      app.classList.add("is-building");
      app.classList.remove("has-plan");

      window.setTimeout(() => {
        if (app.dataset.lrcAgentRunId !== runId) return;
        renderArtifact(output, artifact, workspace, { app, input });
        if (workspace) saveWorkspace(workspace);
        app.classList.remove("is-building");
        app.classList.add("has-plan");
      }, 180);
    };

    if (button.dataset.lrcAgentBound !== "true") {
      button.dataset.lrcAgentBound = "true";
      button.addEventListener("click", generate);
    }

    if (input.dataset.lrcEnterBound !== "true") {
      input.dataset.lrcEnterBound = "true";
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        generate();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lrc-agent-input]").forEach(bindAgent);
  });
})();
