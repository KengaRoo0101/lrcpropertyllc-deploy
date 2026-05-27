const fs = require("fs");
const { spawnSync } = require("child_process");

const FOUNDATIONAL_COPY = {
  headline: "Your idea. Our tools. Your future business.",
  subheadline: "Tell us what you want to build and get a real launch plan in minutes.",
  cta: "Start My Plan",
  storageKey: "lrc_workspace_v1",
  safety: "Nothing happens without your approval. You securely review and authorize payment before anything is charged.",
};

const publicPages = [
  "index.html",
  "formed/index.html",
  "jobsai/index.html",
  "offshoot/index.html",
  "socialscan/index.html",
  "behappy/index.html",
  "careers/index.html",
  "product-lab/index.html",
  "contact/index.html",
  "agentcheck/index.html",
];

const blockedPhrases = [
  "Prepare local draft",
  "Local Draft Pending",
  "Route selection draft",
  "Open workspace",
  "Approval Boundary Active",
  "Approval boundary active",
  "AI Mode:",
  "Draft Mode:",
  "lrc-operational-dock",
  "lrc-workspace-status-header",
  "lrc-current-artifact-panel",
  "lrc-next-action-panel",
  "PRODUCT_ROUTES",
  "buildLegacyArtifact",
  "renderLegacyArtifact",
  "Recommended Path",
  "Why This Fits",
  "Starter Deliverable",
  "Business Structure Starter",
  "Continue with Formed",
  "Get Expert Review",
  "Continue to Secure Checkout",
  "Stop looping. Start moving.",
  "Describe what you are trying to build.",
  "Open matching workspace",
  "Workspace data",
  "Ninja connected your next step",
  "Continue where I left off",
];

const staleCodePaths = [
  "LRCInlineAgentCompanion",
  "transitionWorkspace",
  "markDraftPrepared",
  "requireApproval",
  "lrc-operational-dock",
  "lrc-workspace-status-header",
  "lrc-current-artifact-panel",
  "lrc-next-action-panel",
  "lrc-agent-companion",
  "lrc-global-intent-bar",
  "ninja-continuity-strip",
  "workspace-data-panel",
];

const privateIpPhrases = [
  "INITIAL IP FILING MAP",
  "technical invention disclosure",
  "Core Claim Direction",
  "Claim-Supporting Features",
  "protected subject matter",
  "Formation File / project file",
];

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function assertContains(label, text, expected) {
  assert(text.includes(expected), `${label} missing expected text: ${expected}`);
}

function assertNotContains(label, text, blocked) {
  assert(!text.includes(blocked), `${label} contains blocked phrase: ${blocked}`);
}

function checkSyntax() {
  [
    "assets/lrc-agent.js",
    "assets/lrc-runtime.js",
    "formed/app.js",
    "ninja/app.js",
    "goal/app.js",
    "server.js",
    "_worker.js",
  ].forEach((file) => {
    const result = spawnSync(process.execPath, ["--check", file], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    if (result.status !== 0) fail(`${file} syntax failed: ${result.stderr || result.stdout}`);
  });
}

function checkHome() {
  const home = readText("index.html");
  assertContains("home", home, FOUNDATIONAL_COPY.headline);
  assertContains("home", home, FOUNDATIONAL_COPY.subheadline);
  assertContains("home", home, "placeholder=\"A clothing brand\"");
  assertContains("home", home, "/assets/lrc-system.css?v=22");
  assertContains("home", home, "/assets/lrc-runtime.js?v=6");
  assertContains("home", home, "/assets/lrc-agent.js?v=24");
  assertContains("home", home, "data-lrc-agent-input");
  assertContains("home", home, "data-lrc-agent-output hidden");
  assertContains("home", home, "founder-flow-page");
  assertContains("home", home, "Stripe Checkout only. You approve before anything is charged.");

  [
    "user-pathway",
    "pricing-panel",
    "product-lab-preview",
    "lead-panel",
    "feature-request-form",
    "Agent and tool routes",
    "ecosystem",
    "Founder Tax Match",
    "Payments stay inactive until owner approval",
    "id=\"paywall\"",
    "home-funnel.js",
    "agent-guide.js",
    "checkout.js",
  ].forEach((blocked) => assertNotContains("home", home, blocked));
}

function checkSharedAgent() {
  const agent = readText("assets/lrc-agent.js");
  [
    FOUNDATIONAL_COPY.storageKey,
    FOUNDATIONAL_COPY.safety,
    FOUNDATIONAL_COPY.cta,
    "Business Draft",
    "formed-startup",
    "You need structure, launch guidance, and a clear setup path before execution.",
    "Recommended structure",
    "Business name ideas",
    "First filing checklist",
    "Launch roadmap",
    "Estimated startup needs",
    "Immediate next action",
    "Save Draft",
    "Continue Building",
    "Upgrade",
    "Formed does not provide legal, tax, accounting, or filing services.",
    "startSecureCheckout",
    "/create-checkout-session",
    "/api/checkout-status",
    "restoreWorkspace",
  ].forEach((expected) => assertContains("shared agent", agent, expected));

  blockedPhrases.forEach((blocked) => assertNotContains("shared agent", agent, blocked));
  staleCodePaths.slice(0, 4).forEach((blocked) => assertNotContains("shared agent", agent, blocked));
}

function checkRuntime() {
  const runtime = readText("assets/lrc-runtime.js");
  [
    FOUNDATIONAL_COPY.storageKey,
    "userGoal",
    "activeRoute",
    "activeTool",
    "draft",
    "reviewStatus",
    "checkoutStatus",
    "deliverableStatus",
    "events",
    "lastUpdated",
    "Start My Plan",
    "Starter Business Brief",
    "Your starting plan is ready.",
    "Continue Building",
    "Stripe Checkout",
  ].forEach((expected) => assertContains("runtime", runtime, expected));
  assertNotContains("runtime", runtime, "lrcRuntimeStateV1");
  assertNotContains("runtime", runtime, "sessionStorage");
  ["transitionWorkspace", "markDraftPrepared", "requireApproval"].forEach((blocked) => {
    assertNotContains("runtime", runtime, blocked);
  });
}

function checkStyles() {
  const styles = readText("assets/lrc-system.css");
  [
    ".founder-flow-page",
    ".founder-flow",
    ".founder-input-wrap",
    ".founder-artifact-card",
    ".founder-card-section",
    ".founder-next-actions",
    ".founder-draft-deliverable",
    ".founder-secondary-actions",
    ".founder-cta-bar",
    "@keyframes founderReveal",
    "@keyframes founderSubmitProgress",
    "@media (max-width: 760px)",
  ].forEach((expected) => assertContains("lrc system css", styles, expected));
  staleCodePaths.slice(4).forEach((blocked) => assertNotContains("lrc system css", styles, blocked));
}

function checkPublicPages() {
  publicPages.forEach((file) => {
    const text = readText(file);
    if (file === "formed/index.html") {
      [
        "Formed Business Draft",
        "Formed",
        "Your idea. Our tools. Your future business.",
        "Let’s get started.",
        "formed-guided-hero",
        "guided-flow",
        "data-guided-flow",
        "data-founder-output",
        "Nothing happens without your approval",
        "lrc-affiliate-layout.css?v=5",
        "app.js?v=26",
        "styles.css?v=8",
      ].forEach((expected) => assertContains(file, text, expected));
      assertNotContains(file, text, "data-lrc-agent-input");
      assertNotContains(file, text, "Founder Tax Match");
      blockedPhrases.slice(0, 8).forEach((blocked) => assertNotContains(file, text, blocked));
      return;
    }
    assertContains(file, text, "data-lrc-agent-input");
    assertContains(file, text, "data-lrc-agent-output");
    blockedPhrases.slice(0, 8).forEach((blocked) => assertNotContains(file, text, blocked));
    if (file !== "index.html") {
      assertContains(file, text, "/assets/lrc-system.css?v=21");
      assertContains(file, text, "/assets/lrc-runtime.js?v=6");
      assertContains(file, text, "/assets/lrc-agent.js?v=23");
    }
  });
}

function checkFormedV1() {
  const app = readText("formed/app.js");
  [
    "firstOffer",
    "targetCustomer",
    "positioning",
    "launchChecklist",
    "nextBestStep",
    "Business Idea",
    "Business Name",
    "Business Type",
    "View My Plan",
    "Save Draft",
    "Continue Building",
    "Upgrade",
    "/api/entities",
    "/api/events",
    "/api/recommendations",
    "/api/approvals",
    "/api/checkout-status",
    "/create-checkout-session",
    "external submission was performed",
    "lrc_workspace_v1",
  ].forEach((expected) => assertContains("formed app", app, expected));
}

function checkGoalRoute() {
  const page = readText("goal/index.html");
  const app = readText("goal/app.js");
  const styles = readText("goal/styles.css");

  [
    "Goal Builder | LRC Property LLC",
    "One goal. One clear next step.",
    "Safety and starting small are key.",
    "Start small",
    "Build Goal Packet",
    "Formed.",
    "Between The Lines",
    "No checkout, filing, publishing, sending, account access, or report unlock happens",
    "Keep passwords, payment cards, bank details, SSNs, private credentials",
    "./app.js?v=1",
  ].forEach((expected) => assertContains("goal page", page, expected));

  [
    "lrc_goal_packet_v1",
    "Cover metadata",
    "key findings",
    "timeline highlights",
    "pattern analysis",
    "behavioral signals",
    "chronology",
    "methodology",
    "disclaimer",
    "without guessing intent",
  ].forEach((expected) => assertContains("goal app", app, expected));

  assertNotContains("goal app", app, "Sensitivity");
  assertContains("goal styles", styles, ".goal-workspace");
  assertContains("goal styles", styles, "@media (max-width: 560px)");
}

function checkPrivateIpDisclosure() {
  [
    "assets/lrc-agent.js",
    "assets/lrc-runtime.js",
    "formed/app.js",
    "index.html",
    "formed/index.html",
    "goal/index.html",
    "goal/app.js",
  ].forEach((file) => {
    const text = readText(file);
    privateIpPhrases.forEach((blocked) => assertNotContains(file, text, blocked));
  });
}

function run() {
  checkSyntax();
  checkHome();
  checkSharedAgent();
  checkRuntime();
  checkStyles();
  checkPublicPages();
  checkFormedV1();
  checkGoalRoute();
  checkPrivateIpDisclosure();
  console.log("Site polish verification passed.");
}

run();
