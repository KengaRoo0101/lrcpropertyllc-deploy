const fs = require("fs");
const vm = require("vm");

const RUNTIME_SOURCE = fs.readFileSync("assets/lrc-runtime.js", "utf8");
const STORAGE_KEY = "lrc_workspace_v1";
const STARTUP_WORKSPACE_KEYS = new Set([
  "version",
  "product",
  "userGoal",
  "activeRoute",
  "activeTool",
  "currentStep",
  "draft",
  "reviewStatus",
  "checkoutStatus",
  "deliverableStatus",
  "events",
  "lastUpdated",
]);

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function createStorage(seed = new Map()) {
  return {
    map: seed,
    getItem(key) {
      return this.map.has(key) ? this.map.get(key) : null;
    },
    setItem(key, value) {
      this.map.set(key, String(value));
    },
    removeItem(key) {
      this.map.delete(key);
    },
  };
}

function loadRuntime(storageMap) {
  const localStorage = createStorage(storageMap);
  const context = {
    localStorage,
    console,
    Date,
    CustomEvent: function CustomEvent(type, init) {
      return { type, detail: init?.detail || null };
    },
    window: {
      dispatchEvent() {},
    },
  };
  context.window.localStorage = localStorage;
  vm.runInNewContext(RUNTIME_SOURCE, context, { filename: "assets/lrc-runtime.js" });
  return context.window.LRCRuntime;
}

function stored(storageMap) {
  const raw = storageMap.get(STORAGE_KEY);
  assert(raw, "runtime state was not persisted to localStorage");
  return JSON.parse(raw);
}

function run() {
  assert(RUNTIME_SOURCE.includes("localStorage"), "runtime must use localStorage");
  assert(!RUNTIME_SOURCE.includes("sessionStorage"), "runtime must not use sessionStorage");
  assert(RUNTIME_SOURCE.includes("PERSISTED_KEYS"), "runtime must use a persistence allowlist");
  assert(RUNTIME_SOURCE.includes("clearWorkspace"), "runtime must expose clearWorkspace");

  const storageMap = new Map();
  const runtime = loadRuntime(storageMap);

  runtime.setState({
    userGoal: "I want to start a business but need structure",
    activeRoute: "formed-startup",
    product: "Formed",
    activeTool: "startup-intake",
    currentStep: "draft-created",
    draft: {
      recommendedRoute: "Formed Launch Plan",
      plainEnglishDiagnosis: "You need structure, launch guidance, and a clear setup path before execution.",
      nextThreeSteps: [
        "Choose business name direction",
        "Define your primary offer",
        "Prepare formation checklist",
      ],
      draftDeliverable: "Starter Business Brief\nWorking concept: I want to start a business but need structure\nNon-legal approval note: This is a local planning draft only. Formed does not provide legal, tax, accounting, or filing services.",
      approvalBoundary: "This stays on your device as a local planning draft. Nothing is filed, published, charged, or sent for review unless you choose the next step.",
      cta: "Continue Building",
    },
    reviewStatus: "needs-user-review",
    checkoutStatus: {
      available: false,
      mode: "hold",
      paymentStatus: "not_started",
    },
    deliverableStatus: "local-draft-only",
    events: [
      {
        type: "workspace-draft-created",
        timestamp: "2026-05-16T20:00:00.000Z",
        product: "Formed",
        route: "formed-startup",
        inputLength: 51,
        selectedCategory: "formed-startup",
        uiAction: "submit",
        rawContent: "SECRET_EVENT_CONTENT",
      },
    ],
    credentials: "SECRET_CREDENTIAL",
    privateToken: "SECRET_TOKEN",
    paymentData: "SECRET_PAYMENT",
    uploadedFiles: ["SECRET_UPLOAD"],
  }, { action: "Plan selected: Formed" });

  const snapshot = stored(storageMap);
  for (const key of Object.keys(snapshot)) {
    assert(STARTUP_WORKSPACE_KEYS.has(key), `unexpected persisted key: ${key}`);
  }
  const serialized = JSON.stringify(snapshot);
  for (const blocked of ["SECRET_CREDENTIAL", "SECRET_TOKEN", "SECRET_PAYMENT", "SECRET_UPLOAD", "SECRET_EVENT_CONTENT", "credentials", "privateToken", "paymentData", "uploadedFiles", "rawContent"]) {
    assert(!serialized.includes(blocked), `sensitive field persisted: ${blocked}`);
  }
  assert(snapshot.version === "1.0", "workspace version did not persist");
  assert(snapshot.product === "Formed", "product did not persist");
  assert(snapshot.userGoal === "I want to start a business but need structure", "user goal did not persist");
  assert(snapshot.activeRoute === "formed-startup", "active route did not persist");
  assert(snapshot.activeTool === "startup-intake", "active tool did not persist");
  assert(snapshot.currentStep === "draft-created", "current step did not persist");
  assert(snapshot.draft.recommendedRoute === "Formed Launch Plan", "draft plan did not persist");
  assert(snapshot.draft.nextThreeSteps.length === 3, "next three steps did not persist");
  assert(snapshot.draft.draftDeliverable.includes("Starter Business Brief"), "draft deliverable did not persist");
  assert(snapshot.reviewStatus === "needs-user-review", "review status did not persist");
  assert(snapshot.checkoutStatus.available === false, "checkout availability should remain false");
  assert(snapshot.checkoutStatus.mode === "hold", "checkout mode should remain hold");
  assert(snapshot.checkoutStatus.paymentStatus === "not_started", "payment status should not be started");
  assert(snapshot.deliverableStatus === "local-draft-only", "deliverable status did not persist");
  assert(snapshot.events.length === 1, "workspace event did not persist");
  assert(snapshot.events[0].type === "workspace-draft-created", "event type did not persist");
  assert(snapshot.events[0].route === "formed-startup", "event route did not persist");
  assert(snapshot.events[0].inputLength === 51, "event input length did not persist");
  assert(snapshot.lastUpdated, "last updated timestamp missing");

  const restoredRuntime = loadRuntime(storageMap);
  const restored = restoredRuntime.getState();
  assert(restored.product === "Formed", "product did not restore after reload");
  assert(restored.activeRoute === "formed-startup", "active route did not restore after reload");
  assert(restored.activeTool === "startup-intake", "active tool did not restore after reload");
  assert(restored.draft.draftDeliverable.includes("Starter Business Brief"), "draft did not restore after reload");
  assert(restored.checkoutStatus.available === false, "checkout availability changed after reload");
  assert(restored.checkoutStatus.mode === "hold", "checkout mode changed after reload");

  restoredRuntime.clearWorkspace();
  assert(!storageMap.has(STORAGE_KEY), "clearWorkspace did not remove localStorage snapshot");
  assert(restoredRuntime.hasSavedWorkspace() === false, "clearWorkspace did not reset saved-workspace flag");
  assert(restoredRuntime.getState().currentArtifact === "Starter Business Brief", "clearWorkspace did not reset artifact");

  console.log("Runtime persistence verification passed.");
}

run();
