const fs = require("fs");
const { spawn } = require("child_process");
const { once } = require("events");

const PORT = "3211";
const BASE_URL = `http://localhost:${PORT}`;
const SAFETY_COPY = "Nothing happens without your approval. You securely review and authorize payment before anything is charged.";

const publicRoutes = [
  "/",
  "/goal/",
  "/goal",
  "/suite/",
  "/suite",
  "/formed/",
  "/product-lab/",
  "/agentcheck/",
  "/contact/",
  "/jobsai/",
  "/offshoot/",
  "/socialscan/",
  "/behappy/",
  "/careers/",
  "/ninja/",
  "/run-agent",
  "/admin/",
  "/promo/",
  "/promo/posts",
  "/promo/posts.html",
  "/promo/launch",
  "/promo/launch.html",
  "/success.html",
  "/cancel.html",
  "/404.html",
  "/terms.html",
  "/privacy.html",
  "/safety.html",
  "/disclaimer.html",
  "/formed/terms.html",
  "/formed/privacy.html",
  "/formed/refunds.html",
];

const lrcSystemPages = [
  "/",
  "/jobsai/",
  "/socialscan/",
  "/offshoot/",
  "/careers/",
  "/behappy/",
  "/product-lab/",
  "/contact/",
  "/agentcheck/",
];

const blockedPublicCopy = [
  "Prepare local draft",
  "Local Draft Pending",
  "Route selection draft",
  "Open workspace",
  "Approval boundary active",
  "AI Mode:",
  "Draft Mode:",
  "app-front-door",
  "id=\"lrc-react-funnel\"",
  "home-funnel.js",
  "agent-guide.js",
  "checkout.js",
  "id=\"paywall\"",
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

function fail(message) {
  throw new Error(message);
}

function assertContains(label, text, expected) {
  if (!text.includes(expected)) fail(`${label} missing expected text: ${expected}`);
}

function assertNotContains(label, text, blocked) {
  if (text.includes(blocked)) fail(`${label} contains blocked text: ${blocked}`);
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function assertNoBrokenHashLinks(label, text) {
  const ids = new Set([...text.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
  const hashes = [...text.matchAll(/href="#([^"]+)"/g)]
    .map((match) => match[1])
    .filter(Boolean);
  const missing = hashes.filter((hash) => !ids.has(hash));
  if (missing.length) fail(`${label} has broken hash links: ${missing.join(", ")}`);
}

function startServer() {
  const server = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT,
      PUBLIC_URL: BASE_URL,
      ADMIN_ACCESS_CODE: "local-admin",
      STRIPE_SECRET_KEY: "",
      STRIPE_PRICE_ID: "",
      STRIPE_WEBHOOK_SECRET: "",
      CHECKOUT_ENABLED: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  return { server, getStderr: () => stderr };
}

async function stopServer(server, getStderr) {
  server.kill("SIGTERM");
  await Promise.race([once(server, "exit"), new Promise((resolve) => setTimeout(resolve, 1200))]);
  if (server.exitCode && server.exitCode !== 0 && !server.killed) {
    fail(`server failed during ecosystem verification: ${getStderr()}`);
  }
}

async function fetchText(pathname, options = {}) {
  const response = await fetch(`${BASE_URL}${pathname}`, options);
  const text = await response.text();
  return { response, text };
}

async function fetchJson(pathname, options = {}) {
  const { response, text } = await fetchText(pathname, {
    ...options,
    headers: {
      accept: "application/json",
      ...(options.headers || {}),
    },
  });
  let json;
  try {
    json = JSON.parse(text);
  } catch (_error) {
    fail(`${pathname} did not return JSON: ${text.slice(0, 160)}`);
  }
  return { response, json };
}

async function postJson(pathname, body) {
  return fetchJson(pathname, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function waitForServer(server) {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    if (server.exitCode !== null) fail(`server exited early with code ${server.exitCode}`);
    try {
      const { response } = await fetchText("/");
      if (response.ok) return;
    } catch (_error) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  fail("server did not start within 8 seconds");
}

async function assertRouteOk(pathname, options = {}) {
  const { response, text } = await fetchText(pathname, options);
  if (response.status < 200 || response.status >= 400) {
    fail(`${pathname} returned ${response.status}: ${text.slice(0, 160)}`);
  }
  return text;
}

async function checkRoutes() {
  for (const pathname of publicRoutes) {
    const text = await assertRouteOk(pathname);
    if (pathname.endsWith(".html") || pathname === "/" || pathname.endsWith("/")) {
      assertNoBrokenHashLinks(pathname, text);
    }
  }

  for (const pathname of lrcSystemPages) {
    const page = await assertRouteOk(pathname);
    assertContains(`${pathname} lrc app`, page, 'class="lrc-app');
    assertContains(`${pathname} lrc input`, page, "data-lrc-agent-input");
    assertContains(`${pathname} lrc output`, page, "data-lrc-agent-output");
    const systemVersion = pathname === "/" ? "22" : "21";
    const agentVersion = pathname === "/" ? "24" : "23";
    assertContains(`${pathname} lrc system css`, page, `<link rel="stylesheet" href="/assets/lrc-system.css?v=${systemVersion}"`);
    assertContains(`${pathname} lrc runtime`, page, '<script src="/assets/lrc-runtime.js?v=6" defer></script>');
    assertContains(`${pathname} lrc agent`, page, `<script src="/assets/lrc-agent.js?v=${agentVersion}" defer></script>`);
    blockedPublicCopy.slice(0, 8).forEach((blocked) => assertNotContains(pathname, page, blocked));
  }

  const home = await assertRouteOk("/");
  assertContains("home", home, "Your idea. Our tools. Your future business.");
  assertContains("home", home, "Tell us what you want to build and get a real launch plan in minutes.");
  assertContains("home", home, "Stripe Checkout only. You approve before anything is charged.");
  assertContains("home", home, 'href="./goal/"');
  assertContains("home", home, '<body class="lrc-affiliate focused-home formed-home">');
  blockedPublicCopy.forEach((blocked) => assertNotContains("home", home, blocked));

  const goal = await assertRouteOk("/goal/");
  assertContains("goal", goal, "Goal Builder | LRC Property LLC");
  assertContains("goal", goal, "One goal. One clear next step.");
  assertContains("goal", goal, "Build Goal Packet");
  assertContains("goal", goal, "Formed.");
  assertContains("goal", goal, "Between The Lines");
  assertContains("goal", goal, "No checkout, filing, publishing, sending, account access, or report unlock happens");
  assertContains("goal", goal, '<script src="./app.js?v=1" defer></script>');

  const formed = await assertRouteOk("/formed/");
  assertContains("formed", formed, "Formed Business Draft");
  assertContains("formed", formed, "Formed");
  assertContains("formed", formed, "Your idea. Our tools. Your future business.");
  assertContains("formed", formed, "Let’s get started.");
  assertContains("formed", formed, "formed-guided-hero");
  assertContains("formed", formed, "guided-flow");
  assertContains("formed", formed, "data-guided-flow");
  assertContains("formed", formed, "data-founder-output");
  assertContains("formed", formed, "lrc-affiliate-layout.css?v=5");
  assertContains("formed", formed, "Nothing happens without your approval");
  assertContains("formed", formed, '<script src="./app.js?v=26" defer></script>');
  assertNotContains("formed", formed, "data-lrc-agent-input");
  assertNotContains("formed", formed, "Founder Tax Match");

  const ninja = await assertRouteOk("/ninja/");
  assertContains("ninja", ninja, "Describe the work. Ninja returns one useful next step.");
  assertContains("ninja", ninja, "Nothing will be submitted, published, charged, or sent without your approval.");
  assertContains("ninja", ninja, ">Start</button>");
  assertNotContains("ninja", ninja, "data-lrc-agent-input");
}

async function checkAssets() {
  const styles = await assertRouteOk("/assets/lrc-system.css?v=22");
  [
    ".founder-flow-page",
    ".founder-flow",
    ".founder-artifact-card",
    ".founder-cta-bar",
    "@keyframes founderReveal",
  ].forEach((expected) => assertContains("lrc system css", styles, expected));
  [
    "lrc-operational-dock",
    "lrc-workspace-status-header",
    "lrc-current-artifact-panel",
    "lrc-next-action-panel",
    "lrc-agent-companion",
    "lrc-global-intent-bar",
    "ninja-continuity-strip",
    "workspace-data-panel",
  ].forEach((blocked) => assertNotContains("lrc system css", styles, blocked));

  const runtime = await assertRouteOk("/assets/lrc-runtime.js?v=6");
  [
    "window.LRCRuntime",
    "lrc_workspace_v1",
    "userGoal",
    "activeRoute",
    "activeTool",
    "draft",
    "reviewStatus",
    "checkoutStatus",
    "events",
    "lastUpdated",
    "Start My Plan",
  ].forEach((expected) => assertContains("lrc runtime", runtime, expected));
  assertNotContains("lrc runtime", runtime, "sessionStorage");
  assertNotContains("lrc runtime", runtime, "lrcRuntimeStateV1");
  ["transitionWorkspace", "markDraftPrepared", "requireApproval"].forEach((blocked) => {
    assertNotContains("lrc runtime", runtime, blocked);
  });

  const agent = await assertRouteOk("/assets/lrc-agent.js?v=24");
  [
    "Start My Plan",
    "Business Draft",
    "formed-startup",
    "Recommended structure",
    "Business name ideas",
    "First filing checklist",
    "Starter Business Brief",
    "Save Draft",
    "Continue Building",
    "Upgrade",
    "/api/checkout-status",
    "/create-checkout-session",
    SAFETY_COPY,
  ].forEach((expected) => assertContains("lrc agent", agent, expected));
  blockedPublicCopy.forEach((blocked) => assertNotContains("lrc agent", agent, blocked));
  ["LRCInlineAgentCompanion", "transitionWorkspace", "markDraftPrepared", "requireApproval"].forEach((blocked) => {
    assertNotContains("lrc agent", agent, blocked);
  });
}

async function checkApiRoutes() {
  const checkout = await fetchJson("/api/checkout-status");
  if (!checkout.response.ok) fail("/api/checkout-status did not return 200");
  if (checkout.json.available !== false) fail("checkout should be unavailable without config");
  if (checkout.json.mode !== "hold") fail("checkout should remain in hold mode without config");

  const ninjaTasks = await fetchJson("/api/ninja/tasks");
  if (!ninjaTasks.response.ok) fail("/api/ninja/tasks did not return 200");

  const admin = await fetchJson("/api/admin/summary", { headers: { "x-admin-code": "local-admin" } });
  if (!admin.response.ok) fail("/api/admin/summary did not return 200");

  const entity = await postJson("/api/entities", {
    source: "formed-v1-test",
    category: "local-service",
    artifact: {
      workingConcept: "mobile detail service",
      firstOffer: "A starter detail package for one local customer.",
      targetCustomer: "Busy local drivers who need a reliable mobile detail.",
      positioning: "For busy local drivers, this is a clear booking path for a first clean result.",
      launchChecklist: ["Name the first package.", "Set the review price.", "Confirm approval before checkout."],
      nextBestStep: "Request build review",
    },
  });
  if (entity.response.status !== 201) fail("/api/entities did not create a safe entity");
  if (entity.json.entity.externalActionTaken !== false) fail("entity should not take external action");
  if (entity.json.entity.rawSensitiveContentStored !== false) fail("entity should not store raw sensitive content");

  const event = await postJson("/api/events", {
    eventType: "formed-plan-created",
    entityId: entity.json.entity.id,
    product: "Formed",
    route: "formed-startup",
    inputLength: 21,
    selectedCategory: "local-service",
    uiAction: "build-starting-plan",
  });
  if (event.response.status !== 201) fail("/api/events did not create a metadata event");
  if ("businessIdea" in event.json.event || "artifact" in event.json.event) fail("event should not store raw idea or artifact");
  if (event.json.event.externalActionTaken !== false) fail("event should not take external action");

  const recommendation = await postJson("/api/recommendations", {
    entityId: entity.json.entity.id,
    product: "Formed",
    category: "local-service",
    artifact: entity.json.entity.operationalData,
  });
  if (recommendation.response.status !== 201) fail("/api/recommendations did not create a recommendation");
  if (!recommendation.json.recommendation.recommendation.nextBestStep) fail("recommendation missing next best step");
  if (recommendation.json.recommendation.externalActionTaken !== false) fail("recommendation should not take external action");

  const bookkeepingRecommendation = await postJson("/api/recommendations", {
    entityId: entity.json.entity.id,
    product: "Formed",
    category: "bookkeeping-setup",
    artifact: {
      workingConcept: "bookkeeping setup for a new LLC",
      firstOffer: "A clean records setup packet.",
      targetCustomer: "Founders who need organized records.",
      positioning: "A bookkeeping setup path before professional handoff.",
      launchChecklist: ["Map income.", "Map expenses.", "Prepare review questions."],
      nextBestStep: "Request bookkeeping setup",
    },
  });
  if (bookkeepingRecommendation.response.status !== 201) fail("/api/recommendations did not create a bookkeeping recommendation");
  if (!JSON.stringify(bookkeepingRecommendation.json).includes("Request bookkeeping setup")) {
    fail("bookkeeping recommendation missing support action");
  }

  const approval = await postJson("/api/approvals", {
    entityId: entity.json.entity.id,
    product: "Formed",
    actionType: "build-review",
    requestedAction: "Request build review",
    reason: "review artifact",
  });
  if (approval.response.status !== 201) fail("/api/approvals did not create an approval request");
  if (approval.json.approval.externalActionTaken !== false) fail("approval should not take external action");
  if (approval.json.approval.checkoutStatus.available !== false) fail("approval should keep checkout unavailable");
  if (approval.json.approval.checkoutStatus.mode !== "hold") fail("approval should keep checkout in hold mode");
}

async function run() {
  assertContains("package.json", readText("package.json"), '"start:ninja": "PORT=3000 node server.js"');
  assertContains("ninja file redirect", readText("ninja/index.html"), "http://localhost:3000/ninja/");

  const running = startServer();
  try {
    await waitForServer(running.server);
    await checkRoutes();
    await checkAssets();
    await checkApiRoutes();
  } finally {
    await stopServer(running.server, running.getStderr);
  }

  console.log("Ecosystem route verification passed.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
