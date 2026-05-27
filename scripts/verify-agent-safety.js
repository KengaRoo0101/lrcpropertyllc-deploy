const fs = require("fs");
const { spawn, spawnSync } = require("child_process");
const { once } = require("events");

const PORT = "3224";
const BASE_URL = `http://localhost:${PORT}`;
const SAFETY_COPY = "Nothing happens without your approval. You securely review and authorize payment before anything is charged.";

const lrcSystemPages = [
  "/",
  "/jobsai/",
  "/offshoot/",
  "/socialscan/",
  "/behappy/",
  "/careers/",
  "/product-lab/",
  "/agentcheck/",
  "/contact/",
];

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertContains(label, text, expected) {
  assert(text.includes(expected), `${label} missing expected text: ${expected}`);
}

function assertNotContains(label, text, blocked) {
  assert(!text.includes(blocked), `${label} contains blocked text: ${blocked}`);
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function startServer() {
  const server = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT,
      PUBLIC_URL: BASE_URL,
      STRIPE_SECRET_KEY: "",
      STRIPE_PRICE_ID: "",
      STRIPE_WEBHOOK_SECRET: "",
      CHECKOUT_ENABLED: "",
      ADMIN_ACCESS_CODE: "local-admin",
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
    fail(`server failed during agent safety verification: ${getStderr()}`);
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

function checkStaticSafety() {
  ["server.js", "_worker.js", "assets/lrc-runtime.js", "assets/lrc-agent.js", "formed/app.js", "ninja/app.js"].forEach((file) => {
    const result = spawnSync(process.execPath, ["--check", file], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    if (result.status !== 0) fail(`${file} syntax failed: ${result.stderr || result.stdout}`);
  });

  const lrcAgent = readText("assets/lrc-agent.js");
  const lrcRuntime = readText("assets/lrc-runtime.js");
  const lrcSystem = readText("assets/lrc-system.css");
  [
    "lrc_workspace_v1",
    "Start My Plan",
    "formed-startup",
    "Starter Business Brief",
    "Business Draft",
    "Recommended structure",
    "Business name ideas",
    "First filing checklist",
    "Save Draft",
    "Continue Building",
    "Upgrade",
    "Formed does not provide legal, tax, accounting, or filing services.",
    "/api/checkout-status",
    "/create-checkout-session",
    SAFETY_COPY,
  ].forEach((expected) => {
    assertContains("lrc agent", lrcAgent, expected);
  });

  ["userGoal", "activeRoute", "activeTool", "draft", "checkoutStatus", "events", "lastUpdated"].forEach((expected) => {
    assertContains("lrc runtime", lrcRuntime, expected);
  });

  [
    "executeAgentAction",
    "Prepare local draft",
    "Local Draft Pending",
    "Route selection draft",
    "AI Mode:",
    "Draft Mode:",
    "lrc-operational-dock",
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
    "LRCInlineAgentCompanion",
    "transitionWorkspace",
    "markDraftPrepared",
    "requireApproval",
  ].forEach((blocked) => {
    assertNotContains("lrc agent", lrcAgent, blocked);
  });

  ["transitionWorkspace", "markDraftPrepared", "requireApproval"].forEach((blocked) => {
    assertNotContains("lrc runtime", lrcRuntime, blocked);
  });

  [
    "lrc-operational-dock",
    "lrc-workspace-status-header",
    "lrc-current-artifact-panel",
    "lrc-next-action-panel",
    "lrc-agent-companion",
    "lrc-global-intent-bar",
    "ninja-continuity-strip",
    "workspace-data-panel",
  ].forEach((blocked) => {
    assertNotContains("lrc system css", lrcSystem, blocked);
  });

  const worker = readText("_worker.js");
  const server = readText("server.js");
  const adminApp = readText("admin/app.js");
  const formed = readText("formed/app.js");
  for (const text of [worker, server]) {
    assertContains("control plane source", text, "AGENT_POLICY_VERSION");
    assertContains("control plane source", text, "/api/agent/draft");
    assertContains("control plane source", text, "/api/agent/action-request");
    assertContains("control plane source", text, "/api/entities");
    assertContains("control plane source", text, "/api/events");
    assertContains("control plane source", text, "/api/recommendations");
    assertContains("control plane source", text, "/api/approvals");
    assertContains("control plane source", text, "externalActionTaken: false");
    assertNotContains("control plane source", text, "executeAgentAction");
    assertNotContains("control plane source", text, "admin417");
    assertContains("control plane source", text, "isBlockedAssetPath");
    assertContains("control plane source", text, "ip-protection");
    assertContains("control plane source", text, "_worker.js");
  }
  assertNotContains("admin app", adminApp, "admin417");
  assertNotContains("admin app", adminApp, "sessionStorage");
  assertNotContains("admin app", adminApp, "localFallbackCode");

  [
    "Formed Business Draft",
    "firstOffer",
    "targetCustomer",
    "positioning",
    "launchChecklist",
    "Save Draft",
    "Continue Building",
    "Upgrade",
    "bookkeeping-setup",
    "/api/entities",
    "/api/events",
    "/api/recommendations",
    "/api/approvals",
    "No payment, filing, publishing, message, upload, account access, tax work, legal work, or external submission was performed.",
  ].forEach((expected) => assertContains("formed v1 app", formed, expected));
}

async function checkRenderedPages() {
  for (const pathname of lrcSystemPages) {
    const { response, text } = await fetchText(pathname);
    assert(response.ok, `${pathname} did not return 200`);
    assertContains(pathname, text, "data-lrc-agent-input");
    assertContains(pathname, text, "data-lrc-agent-output");
    const systemVersion = pathname === "/" ? "22" : "21";
    const agentVersion = pathname === "/" ? "24" : "23";
    assertContains(pathname, text, `/assets/lrc-system.css?v=${systemVersion}`);
    assertContains(pathname, text, "/assets/lrc-runtime.js?v=6");
    assertContains(pathname, text, `/assets/lrc-agent.js?v=${agentVersion}`);
    assertNotContains(pathname, text, "Prepare local draft");
    assertNotContains(pathname, text, "AI Mode:");
    assertNotContains(pathname, text, "Draft Mode:");
  }

  const ninja = await fetchText("/ninja/");
  assert(ninja.response.ok, "/ninja/ did not return 200");
  assertContains("/ninja/", ninja.text, "Describe the work. Ninja returns one useful next step.");
  assertContains("/ninja/", ninja.text, "Nothing will be submitted, published, charged, or sent without your approval.");
  assertContains("/ninja/", ninja.text, 'id="ninja-prompt"');
  assertNotContains("/ninja/", ninja.text, "data-lrc-agent-input");

  const formed = await fetchText("/formed/");
  assert(formed.response.ok, "/formed/ did not return 200");
  assertContains("/formed/", formed.text, "Formed Business Draft");
  assertContains("/formed/", formed.text, "Formed");
  assertContains("/formed/", formed.text, "Your idea. Our tools. Your future business.");
  assertContains("/formed/", formed.text, "Let’s get started.");
  assertContains("/formed/", formed.text, "formed-guided-hero");
  assertContains("/formed/", formed.text, "guided-flow");
  assertContains("/formed/", formed.text, "data-guided-flow");
  assertContains("/formed/", formed.text, "data-founder-output");
  assertContains("/formed/", formed.text, "lrc-affiliate-layout.css?v=5");
  assertContains("/formed/", formed.text, './app.js?v=26');
  assertNotContains("/formed/", formed.text, "data-lrc-agent-input");
  assertNotContains("/formed/", formed.text, "Founder Tax Match");
}

async function checkControlPlaneApi() {
  const policy = await fetchJson("/api/agent/policy");
  assert(policy.response.ok, "/api/agent/policy did not return 200");
  assert(policy.json.executeEndpointEnabled === false, "agent execution endpoint should be disabled");
  assert(policy.json.approvalRequiredBefore.includes("payment"), "policy should require approval before payment");
  assert(policy.json.approvalRequiredBefore.includes("publishing"), "policy should require approval before publishing");

  const draft = await postJson("/api/agent/draft", { input: "I want to start a business but need structure" });
  assert(draft.response.ok, "/api/agent/draft did not return 200");
  assert(draft.json.externalActionTaken === false, "draft endpoint should not take external action");
  assert(JSON.stringify(draft.json).includes("approval"), "draft endpoint should preserve approval language");

  const guarded = await postJson("/api/agent/action-request", { input: "start checkout now" });
  assert(guarded.response.ok, "/api/agent/action-request did not return 200");
  assert(
    guarded.json.request?.externalActionTaken === false || guarded.json.request?.policy?.externalActionTaken === false,
    "guarded action should not execute"
  );
  assert(JSON.stringify(guarded.json).includes("payment"), "guarded action should identify payment risk");

  const checkout = await fetchJson("/api/checkout-status");
  assert(checkout.response.ok, "/api/checkout-status did not return 200");
  assert(checkout.json.available === false, "checkout should remain unavailable without config");
  assert(checkout.json.mode === "hold", "checkout should remain in hold mode without config");

  for (const pathname of ["/server.js", "/_worker.js", "/package.json", "/data/leads.jsonl", "/scripts/verify-agent-safety.js", "/src/main.jsx", "/ip-protection/test.md"]) {
    const { response } = await fetchText(pathname);
    assert(response.status === 404, `${pathname} should not be publicly served`);
  }
}

async function run() {
  checkStaticSafety();
  const running = startServer();
  try {
    await waitForServer(running.server);
    await checkRenderedPages();
    await checkControlPlaneApi();
  } finally {
    await stopServer(running.server, running.getStderr);
  }
  console.log("Agent safety verification passed.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
