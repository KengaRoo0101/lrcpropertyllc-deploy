const fs = require("fs");
const { spawnSync } = require("child_process");

const FOUNDATIONAL_COPY = {
  headline: "Build the next version with guided LRC support.",
  subheadline: "Bring the idea, problem, or work goal.",
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
    "friends-family/app.js",
    "assets/employee-portal-data.js",
    "assets/timeclock.js",
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
  assertContains("home", home, "placeholder=\"I want to start a local service business\"");
  assertContains("home", home, "/assets/lrc-system.css?v=22");
  assertContains("home", home, "/assets/lrc-runtime.js?v=6");
  assertContains("home", home, "/assets/lrc-agent.js?v=24");
  assertContains("home", home, "data-lrc-agent-input");
  assertContains("home", home, "data-lrc-agent-output hidden");
  assertContains("home", home, "founder-flow-page");
  assertContains("home", home, "Public home. Member tools and team workspaces require approved access.");
  assertContains("home", home, "Membership access");
  assertContains("home", home, "Membership starts with review, not an automatic checkout.");
  assertContains("home", home, "Member tools");
  assertContains("home", home, "One front door, multiple focused work paths.");
  assertContains("home", home, "href=\"./suite/\"");
  assertContains("home", home, "JobsAI + Careers");
  assertContains("home", home, "href=\"./founding-circle/\"");
  assertContains("home", home, "Founding Circle");
  assertContains("home", home, "href=\"./friends-family/\"");
  assertContains("home", home, "Friends & Family");
  assertContains("home", home, "LRC Employee Portal");
  assertContains("home", home, "legal document routing");
  assertContains("home", home, "employee-portal-data.js?v=1");
  assertContains("home", home, "timeclock.js?v=2");
  assertContains("home", home, "id=\"employee-portal-nav\"");
  assertContains("home", home, "id=\"employee-portal-content\"");
  assertContains("home", home, "It does not provide");
  assertContains("home", home, "HR compliance, or employment-law advice");
  const worker = readText("_worker.js");
  assertContains("worker", worker, "SITE_PASSWORD_PROTECTED_PREFIXES");
  assertContains("worker", worker, "isSitePasswordProtectedRoute");
  assertContains("worker", worker, "Team and admin access.");
  const portalData = readText("assets/employee-portal-data.js");
  const portalApp = readText("assets/timeclock.js");
  assertContains("employee portal data", portalData, "desk@lrcpropertyllc.com");
  assertContains("employee portal data", portalData, "legal@lrcpropertyllc.com");
  assertContains("employee portal data", portalData, "payroll@lrcpropertyllc.com");
  assertContains("employee portal data", portalData, "active_live");
  assertContains("employee portal app", portalApp, "Cloudflare email tunnel");
  assertContains("employee portal app", portalApp, "These inbound routes are live in Cloudflare");

  [
    "user-pathway",
    "pricing-panel",
    "product-lab-preview",
    "lead-panel",
    "feature-request-form",
    "Agent and tool routes",
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

function checkFriendsFamilyPage() {
  const page = readText("friends-family/index.html");
  const app = readText("friends-family/app.js");
  [
    "Private Preview Invitations | LRC Property LLC",
    "Proof of concept for people invited into the room.",
    "Access is a privilege, not a general invitation.",
    "does not replace a signed NDA",
    "Role-based proof-of-concept previews",
    "Each role unlocks only its own invitation.",
    "This is not a pyramid, recruiting chain, or pay-to-enter system.",
    "No payment for adding people",
    "Quality is tested first",
    "Referrers can be reviewed",
    "Tasks, systems, notes, tools, and useful work should be credited",
    "No payments are made for adding people.",
    "This trusted launch circle is here to get the foundation off the ground.",
    "visible acknowledgement barrier",
    "data-invite-card",
    "data-invite-form",
    "Role access code",
    "Typed acknowledgement",
    "AI operations collaborator",
    "Trusted support reviewer",
    "Quality reviewer",
    "Clarity and trust reviewer",
    "Standards and stewardship reviewer",
    "Learning systems reviewer",
    "Risk and remote-work reviewer",
    "Operational realism reviewer",
    "Systems and quality reviewer",
    "Trust and stewardship reviewer",
    "Credibility and signal reviewer",
    "Practicality and technical operations reviewer",
    "Psychology and human-systems reviewer",
    "Purpose and encouragement reviewer",
    "Strategy and systems reviewer",
    "Product and technical reviewer",
    "This is a team, not a crowd.",
    "Learning systems",
    "Risk and remote work",
    "copy protected ideas",
    "separate written owner approval",
    "./app.js?v=1",
  ].forEach((expected) => assertContains("friends-family page", page, expected));
  [
    "LRC already has a suite hub, Goal Builder, Formed path",
    "The ecosystem has real routes, regression checks",
  ].forEach((blocked) => assertNotContains("friends-family page", page, blocked));
  [
    "/api/private-preview/acknowledgement",
    "Acknowledgement recorded. Private preview unlocked.",
    "does not create a role, grant access, or replace a signed agreement",
    "role access code shown on this card",
  ].forEach((expected) => assertContains("friends-family app", app, expected));
}

function checkFoundingCirclePage() {
  const page = readText("founding-circle/index.html");
  [
    "LRC Founding Circle | Stewardship Invitation",
    "A serious invitation to build around purpose.",
    "AI, people, our future.",
    "Money can make the work durable, but money is not the center.",
    "The work is the sale.",
    "No pyramid, no paid recruiting, no automatic access.",
    "Trusted few first, heavy hitters later.",
    "Referral starts review.",
    "Quality is tested first.",
    "Inviters carry responsibility.",
    "Work belongs to its creator.",
    "This site demands quality.",
    "Hand picked, not open-door.",
    "Approval before power.",
    "Attorneys before deep work.",
    "Trust earns deeper access.",
    "What they build can be theirs. What joins LRC must be clear.",
    "Tasks and systems are credited.",
    "No payment, commission, rank, ownership, or",
    "The standard each person must agree to before deeper work.",
    "not legal advice and is not a contract",
    "../friends-family/",
    "../stewardship-packet/",
  ].forEach((expected) => assertContains("founding-circle page", page, expected));
}

function checkStewardshipPacketPage() {
  const page = readText("stewardship-packet/index.html");
  [
    "LRC Stewardship Packet | Attorney and Core Reviewer Brief",
    "An institution-grade standard for responsible AI builders.",
    "Attorney and core reviewer brief",
    "Read this first. Record the video later.",
    "Canva-ready founder brief",
    "The video should feel like a private founder note, not a commercial.",
    "Use this script in Canva, HeyGen, Descript, or ElevenLabs only when the voice and",
    "If the video does not improve trust, leave it off.",
    "What good looks like",
    "no synthetic-sounding narration",
    "Smart people do not need an ad.",
    "I am building LRC as a controlled place",
    "The facts are simple enough to verify",
    "The legal reviewer can carry this to the attorneys",
    "The trust reviewer is here because brilliant people",
    "The technical operations reviewer brings industry",
    "Learning systems and human-systems reviewers",
    "16 private invite profiles",
    "16 audited pages",
    "Checkout refuses sessions while safe hold is active",
    "AI capability is outpacing governance",
    "Good ideas fail in the handoff",
    "Access, action, and payment are separated",
    "Each reviewer covers a failure mode",
    "The standard is the advantage",
    "Show smart reviewers that this is already working.",
    "AI turns scattered thinking into usable systems, while people keep control.",
    "AI is the force multiplier.",
    "The site demonstrates the method",
    "Technical operations proof",
    "usable, buildable, and grounded",
    "Future-of-learning proof",
    "What each role does next",
    "Pressure-test the work system",
    "Pressure-test the learning model",
    "safe payment hold",
    "Why it can win",
    "Operator proof",
    "Attorney 1: structure proof",
    "Attorney 2: risk proof",
    "Invitation is earned. Access is governed. Usage is",
    "Work belongs to its creator unless written terms",
    "No recruiting compensation",
    "AI and data governance",
    "Claims review",
    "This is a team, not a",
    "This is the trusted launch circle to get the foundation off the ground.",
    "Call the heavy hitters after the foundation is safe.",
    "Trust reviewer",
    "Discipline reviewer",
    "Technical operations reviewer",
    "Culture and clarity reviewer",
    "Learning systems reviewer",
    "Risk and remote-work reviewer",
    "Psychology and human-systems reviewer",
    "future-of-learning",
    "risk-management and work-from-home operations",
    "Do not borrow another institution",
    "not legal advice and is not a contract",
    "../friends-family/",
  ].forEach((expected) => assertContains("stewardship-packet page", page, expected));
  [
    "data-video-audio",
    "Play founder brief",
    "Play explanation",
    "speechSynthesis",
    "stewardship-founder-brief.m4a",
    "./app.js?v=1",
  ].forEach((blocked) => assertNotContains("stewardship-packet page", page, blocked));
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
  checkFoundingCirclePage();
  checkStewardshipPacketPage();
  checkFriendsFamilyPage();
  checkFormedV1();
  checkGoalRoute();
  checkPrivateIpDisclosure();
  console.log("Site polish verification passed.");
}

run();
