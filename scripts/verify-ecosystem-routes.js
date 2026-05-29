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
  "/stewardship-packet/",
  "/stewardship-packet",
  "/founding-circle/",
  "/founding-circle",
  "/friends-family/",
  "/friends-family",
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
  assertContains("home", home, "Build the next version with guided LRC support.");
  assertContains("home", home, "Bring the idea, problem, or work goal.");
  assertContains("home", home, "Public home. Member tools and team workspaces require approved access.");
  assertContains("home", home, "Membership starts with review, not an automatic checkout.");
  assertContains("home", home, 'href="./goal/"');
  assertContains("home", home, 'href="./suite/"');
  assertContains("home", home, 'href="./founding-circle/"');
  assertContains("home", home, 'href="./friends-family/"');
  assertContains("home", home, "Member tools");
  assertContains("home", home, "One front door, multiple focused work paths.");
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

  const founding = await assertRouteOk("/founding-circle/");
  assertContains("founding-circle", founding, "A serious invitation to build around purpose.");
  assertContains("founding-circle", founding, "AI, people, our future.");
  assertContains("founding-circle", founding, "Money can make the work durable, but money is not the center.");
  assertContains("founding-circle", founding, "The work is the sale.");
  assertContains("founding-circle", founding, "No pyramid, no paid recruiting, no automatic access.");
  assertContains("founding-circle", founding, "Trusted few first, heavy hitters later.");
  assertContains("founding-circle", founding, "Referral starts review.");
  assertContains("founding-circle", founding, "Inviters carry responsibility.");
  assertContains("founding-circle", founding, "Work belongs to its creator.");
  assertContains("founding-circle", founding, "This site demands quality.");
  assertContains("founding-circle", founding, "Hand picked, not open-door.");
  assertContains("founding-circle", founding, "Trust earns deeper access.");
  assertContains("founding-circle", founding, "What they build can be theirs. What joins LRC must be clear.");
  assertContains("founding-circle", founding, "Tasks and systems are credited.");
  assertContains("founding-circle", founding, "No payment, commission, rank, ownership, or");
  assertContains("founding-circle", founding, "not legal advice and is not a contract");
  assertContains("founding-circle", founding, "../friends-family/");
  assertContains("founding-circle", founding, "../stewardship-packet/");

  const packet = await assertRouteOk("/stewardship-packet/");
  assertContains("stewardship-packet", packet, "An institution-grade standard for responsible AI builders.");
  assertContains("stewardship-packet", packet, "Attorney and core reviewer brief");
  assertContains("stewardship-packet", packet, "Read this first. Record the video later.");
  assertContains("stewardship-packet", packet, "Canva-ready founder brief");
  assertContains("stewardship-packet", packet, "The video should feel like a private founder note, not a commercial.");
  assertContains("stewardship-packet", packet, "Use this script in Canva, HeyGen, Descript, or ElevenLabs only when the voice and");
  assertContains("stewardship-packet", packet, "If the video does not improve trust, leave it off.");
  assertContains("stewardship-packet", packet, "no synthetic-sounding narration");
  assertContains("stewardship-packet", packet, "Smart people do not need an ad.");
  assertContains("stewardship-packet", packet, "I am building LRC as a controlled place");
  assertContains("stewardship-packet", packet, "The facts are simple enough to verify");
  assertContains("stewardship-packet", packet, "Eli can carry this to the attorneys");
  assertContains("stewardship-packet", packet, "Berechia is here because brilliant people");
  assertContains("stewardship-packet", packet, "Brodie knows the industry, technical work, and operations");
  assertContains("stewardship-packet", packet, "Andrew and Professor Bacon are help on the ground");
  assertContains("stewardship-packet", packet, "16 private invite profiles");
  assertContains("stewardship-packet", packet, "16 audited pages");
  assertContains("stewardship-packet", packet, "Checkout refuses sessions while safe hold is active");
  assertContains("stewardship-packet", packet, "AI capability is outpacing governance");
  assertContains("stewardship-packet", packet, "Good ideas fail in the handoff");
  assertContains("stewardship-packet", packet, "Access, action, and payment are separated");
  assertContains("stewardship-packet", packet, "Each reviewer covers a failure mode");
  assertContains("stewardship-packet", packet, "The standard is the advantage");
  assertNotContains("stewardship-packet", packet, "data-video-audio");
  assertNotContains("stewardship-packet", packet, "Play founder brief");
  assertNotContains("stewardship-packet", packet, "Play explanation");
  assertNotContains("stewardship-packet", packet, "stewardship-founder-brief.m4a");
  assertNotContains("stewardship-packet", packet, '<script src="./app.js?v=1" defer></script>');
  assertContains("stewardship-packet", packet, "Show smart reviewers that this is already working.");
  assertContains("stewardship-packet", packet, "AI turns scattered thinking into usable systems, while people keep control.");
  assertContains("stewardship-packet", packet, "AI is the force multiplier.");
  assertContains("stewardship-packet", packet, "The site demonstrates the method");
  assertContains("stewardship-packet", packet, "Brodie: technical operations proof");
  assertContains("stewardship-packet", packet, "usable, buildable, and grounded");
  assertContains("stewardship-packet", packet, "Andrew: future-of-learning proof");
  assertContains("stewardship-packet", packet, "What each person does next");
  assertContains("stewardship-packet", packet, "Pressure-test the work system");
  assertContains("stewardship-packet", packet, "Pressure-test the learning model");
  assertContains("stewardship-packet", packet, "safe payment hold");
  assertContains("stewardship-packet", packet, "Why it can win");
  assertContains("stewardship-packet", packet, "Bear: operator proof");
  assertContains("stewardship-packet", packet, "Attorney 1: structure proof");
  assertContains("stewardship-packet", packet, "Attorney 2: risk proof");
  assertContains("stewardship-packet", packet, "Invitation is earned. Access is governed. Usage is");
  assertContains("stewardship-packet", packet, "No recruiting compensation");
  assertContains("stewardship-packet", packet, "Claims review");
  assertContains("stewardship-packet", packet, "This is a team, not a");
  assertContains("stewardship-packet", packet, "This is the trusted launch circle to get the foundation off the ground.");
  assertContains("stewardship-packet", packet, "Call the heavy hitters after the foundation is safe.");
  assertContains("stewardship-packet", packet, "Berechia");
  assertContains("stewardship-packet", packet, "Elijah");
  assertContains("stewardship-packet", packet, "Brodie");
  assertContains("stewardship-packet", packet, "Christina");
  assertContains("stewardship-packet", packet, "Andrew");
  assertContains("stewardship-packet", packet, "Andrew R");
  assertContains("stewardship-packet", packet, "Professor Bacon");
  assertContains("stewardship-packet", packet, "future-of-learning");
  assertContains("stewardship-packet", packet, "risk-management and work-from-home operations");
  assertContains("stewardship-packet", packet, "Do not borrow another institution");
  assertContains("stewardship-packet", packet, "not legal advice and is not a contract");

  const support = await assertRouteOk("/friends-family/");
  assertContains("friends-family", support, "Proof of concept for people invited into the room.");
  assertContains("friends-family", support, "Access is a privilege, not a general invitation.");
  assertContains("friends-family", support, "does not replace a signed NDA");
  assertContains("friends-family", support, "This is not a pyramid, recruiting chain, or pay-to-enter system.");
  assertContains("friends-family", support, "No payment for adding people");
  assertContains("friends-family", support, "Quality is tested first");
  assertContains("friends-family", support, "Referrers can be reviewed");
  assertContains("friends-family", support, "Tasks, systems, notes, tools, and useful work should be credited");
  assertContains("friends-family", support, "No payments are made for adding people.");
  assertContains("friends-family", support, "This trusted launch circle is here to get the foundation off the ground.");
  assertContains("friends-family", support, "Each person unlocks only their own invitation.");
  assertContains("friends-family", support, "Misty / Boss Suite");
  assertContains("friends-family", support, "Bear");
  assertContains("friends-family", support, "Robert");
  assertContains("friends-family", support, "Christina");
  assertContains("friends-family", support, "Professor Michael");
  assertContains("friends-family", support, "Andrew");
  assertContains("friends-family", support, "Andrew R");
  assertContains("friends-family", support, "Eddie");
  assertContains("friends-family", support, "Trent");
  assertContains("friends-family", support, "Berechia");
  assertContains("friends-family", support, "Elijah");
  assertContains("friends-family", support, "Brodie");
  assertContains("friends-family", support, "Professor Bacon");
  assertContains("friends-family", support, "Rebecca");
  assertContains("friends-family", support, "Jake");
  assertContains("friends-family", support, "Rahul");
  assertContains("friends-family", support, "This is a team, not a crowd.");
  assertContains("friends-family", support, "Learning systems");
  assertContains("friends-family", support, "Risk and remote work");
  assertContains("friends-family", support, "does not");
  assertContains("friends-family", support, "public endorser");
  assertContains("friends-family", support, "No sensitive access");
  assertContains("friends-family", support, "Private preview name");
  assertContains("friends-family", support, "Typed acknowledgement name");
  assertContains("friends-family", support, "copy protected ideas");
  assertContains("friends-family", support, "separate written owner approval");
  assertContains("friends-family", support, '<script src="./app.js?v=1" defer></script>');
  assertNotContains("friends-family", support, "LRC already has a suite hub, Goal Builder, Formed path");
  assertNotContains("friends-family", support, "The ecosystem has real routes, regression checks");
  assertNotContains("friends-family", support, "Ray");
  assertNotContains("friends-family", support, "Bearechia");

  const preview = await postJson("/api/private-preview/acknowledgement", {
    invitee: "misty",
    passphrase: "misty",
    signatureName: "Misty Preview Test",
    agreement: true,
    acknowledgementVersion: "lrc-private-preview-v1",
    source: "verification",
  });
  if (preview.response.status !== 201) fail(`/api/private-preview/acknowledgement returned ${preview.response.status}`);
  assertContains("private-preview proof", preview.json.preview?.proof || "", "LRC already has a suite hub");
  assertContains("private-preview boundary", (preview.json.preview?.boundaries || []).join(" "), "separate signed agreement");

  const rahulPreview = await postJson("/api/private-preview/acknowledgement", {
    invitee: "rahul",
    passphrase: "rahul",
    signatureName: "Rahul Preview Test",
    agreement: true,
    acknowledgementVersion: "lrc-private-preview-v1",
    source: "verification",
  });
  if (rahulPreview.response.status !== 201) fail(`Rahul private preview returned ${rahulPreview.response.status}`);
  assertContains("rahul private-preview pitch", rahulPreview.json.preview?.pitch || "", "product and technical judgment");
  assertContains("rahul private-preview boundary", (rahulPreview.json.preview?.boundaries || []).join(" "), "not a pyramid");
  assertContains("rahul private-preview boundary", (rahulPreview.json.preview?.boundaries || []).join(" "), "misuse by an invited person can trigger review");
  assertContains("rahul private-preview boundary", (rahulPreview.json.preview?.boundaries || []).join(" "), "work product should be credited");

  const professorBaconPreview = await postJson("/api/private-preview/acknowledgement", {
    invitee: "professor-bacon",
    passphrase: "professorbacon",
    signatureName: "Professor Bacon Preview Test",
    agreement: true,
    acknowledgementVersion: "lrc-private-preview-v1",
    source: "verification",
  });
  if (professorBaconPreview.response.status !== 201) {
    fail(`Professor Bacon private preview returned ${professorBaconPreview.response.status}`);
  }
  assertContains("professor bacon private-preview pitch", professorBaconPreview.json.preview?.pitch || "", "psychology and human-systems review");

  const deniedPreview = await postJson("/api/private-preview/acknowledgement", {
    invitee: "misty",
    passphrase: "wrong",
    signatureName: "Misty Preview Test",
    agreement: true,
    acknowledgementVersion: "lrc-private-preview-v1",
    source: "verification",
  });
  if (deniedPreview.response.status !== 403) fail("private preview should reject the wrong passphrase");

  const removedPreview = await postJson("/api/private-preview/acknowledgement", {
    invitee: "ray",
    passphrase: "ray",
    signatureName: "Ray Preview Test",
    agreement: true,
    acknowledgementVersion: "lrc-private-preview-v1",
    source: "verification",
  });
  if (removedPreview.response.status !== 404) fail("removed Ray private preview should not unlock");
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
