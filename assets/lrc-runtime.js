(() => {
  const STORAGE_KEY = "lrc_workspace_v1";
  const STORAGE_VERSION = 1;
  const STARTUP_WORKSPACE_VERSION = "1.0";
  const PRODUCT = "Formed";
  const ACTIVE_TOOL = "startup-intake";
  const APPROVAL_BOUNDARY = "Nothing happens without your approval. You securely review and authorize payment before anything is charged.";
  const PERSISTED_KEYS = [
    "currentWorkspace",
    "currentArtifact",
    "currentRoute",
    "currentStep",
    "approvalState",
    "recentActions",
    "nextMove",
    "runtimePhase",
    "workspaceUpdatedAt",
    "recentArtifactHistory",
    "userGoal",
    "activeRoute",
    "artifact",
    "statuses",
    "nextAction",
    "product",
    "activeTool",
    "draft",
    "reviewStatus",
    "checkoutStatus",
    "deliverableStatus",
    "events",
    "lastUpdated",
  ];
  const DEFAULT_STATE = {
    currentWorkspace: "LRC Home",
    currentArtifact: "Starter Business Brief",
    currentRoute: "LRC Home",
    currentAgent: "Levi",
    currentStep: "Waiting for your request",
    approvalState: "Not Required Yet",
    draftState: "Not Started",
    recentActions: ["Plan ready"],
    availableActions: ["Start My Plan"],
    supportModules: ["Starting plan", "Stripe Checkout"],
    lastAction: "Waiting for request",
    currentAgentState: "Ready",
    nextMove: "Start My Plan",
    approvalLevel: APPROVAL_BOUNDARY,
    status: "Not Started",
    runtimePhase: "waiting",
    workspaceUpdatedAt: null,
    recentArtifactHistory: [],
    userGoal: "",
    activeRoute: "LRC Home",
    artifact: null,
    statuses: {
      draft: "Not Started",
      review: "Not Requested",
      checkout: "Not Started",
    },
    nextAction: "Start My Plan",
    product: "",
    activeTool: "",
    draft: null,
    reviewStatus: "needs-user-review",
    checkoutStatus: {
      available: false,
      mode: "hold",
      paymentStatus: "not_started",
    },
    deliverableStatus: "local-draft-only",
    events: [],
    lastUpdated: "",
  };

  const subscribers = new Set();
  let loadedFromStorage = false;

  function safeText(value, fallback = "") {
    return String(value || fallback)
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
  }

  function safeLongText(value, fallback = "") {
    return String(value || fallback)
      .replace(/[<>]/g, "")
      .replace(/\r\n/g, "\n")
      .trim()
      .slice(0, 4200);
  }

  function cleanArray(items, fallback = []) {
    const source = Array.isArray(items) ? items : fallback;
    return source.map((item) => safeText(item)).filter(Boolean).slice(0, 8);
  }

  function normalizeDraft(draft) {
    if (!draft || typeof draft !== "object") return null;
    return {
      recommendedRoute: safeText(draft.recommendedRoute),
      plainEnglishDiagnosis: safeText(draft.plainEnglishDiagnosis, "").slice(0, 600),
      nextThreeSteps: cleanArray(draft.nextThreeSteps).slice(0, 3),
      draftDeliverable: safeLongText(draft.draftDeliverable),
      approvalBoundary: safeText(draft.approvalBoundary, APPROVAL_BOUNDARY).slice(0, 700),
      cta: safeText(draft.cta, "Continue Building"),
    };
  }

  function normalizeCheckoutStatus(status = {}) {
    return {
      available: status.available === true,
      mode: safeText(status.mode, "hold") || "hold",
      paymentStatus: safeText(status.paymentStatus, "not_started") || "not_started",
    };
  }

  function normalizeEvent(event) {
    if (!event || typeof event !== "object") return null;
    return {
      type: safeText(event.type, "workspace-event"),
      timestamp: safeText(event.timestamp, currentTimestamp()),
      product: PRODUCT,
      route: safeText(event.route, "general-lrc"),
      inputLength: Number.isFinite(Number(event.inputLength)) ? Number(event.inputLength) : 0,
      selectedCategory: safeText(event.selectedCategory, "general-lrc"),
      uiAction: safeText(event.uiAction, "unknown"),
    };
  }

  function normalizeEvents(events = []) {
    return (Array.isArray(events) ? events : [])
      .map(normalizeEvent)
      .filter(Boolean)
      .slice(-24);
  }

  function isStartupWorkspace(stateLike = {}) {
    return Boolean(
      stateLike.product === PRODUCT &&
      stateLike.activeTool === ACTIVE_TOOL &&
      stateLike.draft &&
      typeof stateLike.draft === "object"
    );
  }

  function phaseForState(next = {}) {
    if (next.runtimePhase) return safeText(next.runtimePhase, "waiting");
    if (next.approvalState === "Required Before External Action") return "approval_required";
    if (next.draftState === "Ready" || next.status === "Your starting plan is ready.") return "local_draft";
    if (next.draftState === "Plan Selected" || next.status === "Plan Selected") return "route_selected";
    if (next.draftState === "Input Selected" || next.status === "Input Selected") return "input_selected";
    return "waiting";
  }

  function statusForPhase(phase, next = {}) {
    if (next.status) return safeText(next.status, DEFAULT_STATE.status);
    if (phase === "approval_required") return "Review Hold";
    if (phase === "local_draft") return "Your starting plan is ready.";
    if (phase === "preparing") return "Preparing Starting Plan";
    if (phase === "route_selected") return "Plan Selected";
    if (phase === "input_selected") return "Input Selected";
    return DEFAULT_STATE.status;
  }

  function draftStateForPhase(phase, next = {}) {
    if (next.draftState) return safeText(next.draftState, DEFAULT_STATE.draftState);
    if (phase === "approval_required") return "Review Hold";
    if (phase === "local_draft") return "Ready";
    if (phase === "preparing") return "Preparing Starting Plan";
    if (phase === "route_selected") return "Plan Selected";
    if (phase === "input_selected") return "Input Selected";
    return DEFAULT_STATE.draftState;
  }

  function currentTimestamp() {
    return new Date().toISOString();
  }

  function updateArtifactHistory(currentArtifact, history = []) {
    const artifact = safeText(currentArtifact, DEFAULT_STATE.currentArtifact);
    return [artifact, ...cleanArray(history).filter((item) => item !== artifact)].slice(0, 6);
  }

  function normalizeState(next = {}) {
    const runtimePhase = phaseForState(next);
    const currentArtifact = safeText(next.currentArtifact, DEFAULT_STATE.currentArtifact);
    const recentArtifactHistory = updateArtifactHistory(currentArtifact, next.recentArtifactHistory || DEFAULT_STATE.recentArtifactHistory);
    return {
      ...DEFAULT_STATE,
      ...next,
      currentWorkspace: safeText(next.currentWorkspace, DEFAULT_STATE.currentWorkspace),
      currentArtifact,
      currentStep: safeText(next.currentStep, DEFAULT_STATE.currentStep),
      currentRoute: safeText(next.currentRoute, DEFAULT_STATE.currentRoute),
      approvalState: safeText(next.approvalState, DEFAULT_STATE.approvalState),
      nextMove: safeText(next.nextMove, DEFAULT_STATE.nextMove),
      runtimePhase,
      draftState: draftStateForPhase(runtimePhase, next),
      status: statusForPhase(runtimePhase, next),
      workspaceUpdatedAt: next.workspaceUpdatedAt || null,
      recentArtifactHistory,
      recentActions: cleanArray(next.recentActions, DEFAULT_STATE.recentActions),
      availableActions: cleanArray(next.availableActions, DEFAULT_STATE.availableActions),
      supportModules: cleanArray(next.supportModules, DEFAULT_STATE.supportModules),
      userGoal: safeText(next.userGoal, DEFAULT_STATE.userGoal),
      activeRoute: safeText(next.activeRoute, next.currentRoute || DEFAULT_STATE.activeRoute),
      artifact: next.artifact && typeof next.artifact === "object" ? next.artifact : DEFAULT_STATE.artifact,
      statuses: next.statuses && typeof next.statuses === "object" ? next.statuses : DEFAULT_STATE.statuses,
      nextAction: safeText(next.nextAction, next.nextMove || DEFAULT_STATE.nextAction),
      product: safeText(next.product, DEFAULT_STATE.product),
      activeTool: safeText(next.activeTool, DEFAULT_STATE.activeTool),
      draft: normalizeDraft(next.draft),
      reviewStatus: safeText(next.reviewStatus, DEFAULT_STATE.reviewStatus),
      checkoutStatus: normalizeCheckoutStatus(next.checkoutStatus || DEFAULT_STATE.checkoutStatus),
      deliverableStatus: safeText(next.deliverableStatus, DEFAULT_STATE.deliverableStatus),
      events: normalizeEvents(next.events || DEFAULT_STATE.events),
      lastUpdated: safeText(next.lastUpdated, next.workspaceUpdatedAt || DEFAULT_STATE.lastUpdated),
    };
  }

  function serializeState(source = state) {
    const clean = normalizeState(source);
    if (isStartupWorkspace(clean)) {
      return {
        version: STARTUP_WORKSPACE_VERSION,
        product: PRODUCT,
        userGoal: clean.userGoal,
        activeRoute: clean.activeRoute,
        activeTool: ACTIVE_TOOL,
        currentStep: safeText(clean.currentStep, "draft-created"),
        draft: clean.draft,
        reviewStatus: clean.reviewStatus,
        checkoutStatus: normalizeCheckoutStatus(clean.checkoutStatus),
        deliverableStatus: clean.deliverableStatus,
        events: normalizeEvents(clean.events),
        lastUpdated: clean.lastUpdated || clean.workspaceUpdatedAt || currentTimestamp(),
      };
    }
    const snapshot = { version: STORAGE_VERSION };
    PERSISTED_KEYS.forEach((key) => {
      snapshot[key] = clean[key];
    });
    return snapshot;
  }

  function readStoredState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      loadedFromStorage = Boolean(parsed && typeof parsed === "object");
      return loadedFromStorage ? normalizeState(parsed) : { ...DEFAULT_STATE };
    } catch (_error) {
      localStorage.removeItem(STORAGE_KEY);
      loadedFromStorage = false;
      return { ...DEFAULT_STATE };
    }
  }

  let state = readStoredState();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(state)));
      loadedFromStorage = true;
    } catch (_error) {
      // Runtime state is an enhancement. If local storage is unavailable, keep memory state only.
    }
  }

  function notify(options = {}) {
    if (!options.skipPersist) persist();
    subscribers.forEach((subscriber) => subscriber({ ...state }));
    window.dispatchEvent(new CustomEvent("lrc-runtime:update", { detail: { state: { ...state } } }));
  }

  function getState() {
    return { ...state };
  }

  function setState(patch = {}, options = {}) {
    const recentActions = patch.recentActions ? cleanArray(patch.recentActions) : state.recentActions;
    const availableActions = patch.availableActions ? cleanArray(patch.availableActions) : state.availableActions;
    const supportModules = patch.supportModules ? cleanArray(patch.supportModules) : state.supportModules;
    const timestamp = options.preserveTimestamp ? state.workspaceUpdatedAt : currentTimestamp();
    state = normalizeState({
      ...state,
      ...patch,
      recentActions,
      availableActions,
      supportModules,
      workspaceUpdatedAt: timestamp,
      lastUpdated: patch.lastUpdated || timestamp,
    });
    if (options.action) pushAction(options.action, { silent: true });
    notify();
    return getState();
  }

  function pushAction(action, options = {}) {
    const label = String(action || "").trim();
    if (!label) return getState();
    state = normalizeState({
      ...state,
      lastAction: label,
      recentActions: [label, ...state.recentActions.filter((item) => item !== label)].slice(0, 6),
      workspaceUpdatedAt: options.preserveTimestamp ? state.workspaceUpdatedAt : currentTimestamp(),
    });
    if (!options.silent) notify();
    return getState();
  }

  function subscribe(callback) {
    if (typeof callback !== "function") return () => {};
    subscribers.add(callback);
    callback(getState());
    return () => subscribers.delete(callback);
  }

  function hasSavedWorkspace() {
    return loadedFromStorage;
  }

  function clearWorkspace(patch = {}) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_error) {
      // Local persistence is optional.
    }
    loadedFromStorage = false;
    state = normalizeState({ ...DEFAULT_STATE, ...patch, workspaceUpdatedAt: null });
    notify({ skipPersist: true });
    return getState();
  }

  function reset(patch = {}) {
    state = normalizeState({ ...DEFAULT_STATE, ...patch, workspaceUpdatedAt: currentTimestamp() });
    notify();
    return getState();
  }

  window.LRCRuntime = {
    getState,
    setState,
    pushAction,
    hasSavedWorkspace,
    clearWorkspace,
    subscribe,
    reset,
    DEFAULT_STATE: { ...DEFAULT_STATE },
  };
})();
