const express = require("express");
const nodeCrypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const Stripe = require("stripe");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = String(process.env.PUBLIC_URL || "http://localhost:3000").replace(/\/+$/, "");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";
const CHECKOUT_ENABLED = process.env.CHECKOUT_ENABLED || "";
const CHECKOUT_ALLOW_TEST = process.env.CHECKOUT_ALLOW_TEST || "";
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || "";
const DATA_DIR = path.join(__dirname, "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.jsonl");
const FORMED_INTAKES_FILE = path.join(DATA_DIR, "formed-intakes.jsonl");
const TRAFFIC_FILE = path.join(DATA_DIR, "traffic.jsonl");
const AGENT_ACTIVITY_FILE = path.join(DATA_DIR, "agent-activity.jsonl");
const AGENT_ACTION_REQUESTS_FILE = path.join(DATA_DIR, "agent-action-requests.jsonl");
const NINJA_TASKS_FILE = path.join(DATA_DIR, "ninja-tasks.jsonl");
const FEATURE_REQUESTS_FILE = path.join(DATA_DIR, "feature-requests.jsonl");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.jsonl");
const ENTITIES_FILE = path.join(DATA_DIR, "entities.jsonl");
const EVENTS_FILE = path.join(DATA_DIR, "events.jsonl");
const RECOMMENDATIONS_FILE = path.join(DATA_DIR, "recommendations.jsonl");
const APPROVALS_FILE = path.join(DATA_DIR, "approvals.jsonl");
const PRIVATE_PREVIEW_ACKS_FILE = path.join(DATA_DIR, "private-preview-acknowledgements.jsonl");
const VISITOR_COOKIE = "lrc_visitor_id";
const SESSION_COOKIE = "lrc_session_id";
const CHECKOUT_PRODUCT = "lrc-conversation-clarity-full-report";
const REAL_WORLD_PAYMENTS_ENABLED = false;
const PAYMENT_HOLD_MESSAGE = "Real-world payments are not active. Use the preview or contact LRC to continue.";
const CHECKOUT_DIAGNOSTIC_GUARDRAILS = [
  "No real-world payments are active.",
  "No financial transactions without explicit owner approval.",
  "No refunds, cancellations, or subscription changes without explicit owner approval.",
  "No deletion of Stripe, Cloudflare, payment, lead, admin records, or local files without explicit owner approval.",
  "No secret values returned.",
  "Read-only diagnostics and checkout URL creation only; payment completion is a separate owner-approved action.",
];
const AGENT_POLICY_VERSION = "lrc-agent-control-plane-v1";
const AGENT_SAFETY_PAUSE = "Nothing happens without your approval. You securely review and authorize payment before anything is charged.";
const AGENT_SAFE_CAPABILITIES = [
  "prepare starting plans",
  "summarize and route work",
  "prefill browser-side fields for review",
  "create approval packets",
  "log decisions and blockers",
];
const AGENT_EXTERNAL_ACTIONS = [
  "payment",
  "filing",
  "publishing",
  "message",
  "upload",
  "deletion",
  "account access",
  "permission change",
  "checkout",
  "subscription change",
];
const AGENT_BLOCKED_TERMS = [
  "bypass paywall",
  "get around paywall",
  "without approval",
  "steal",
  "fake review",
  "password",
  "secret key",
  "private key",
  "ssn",
  "bank account",
  "card number",
  "act as my lawyer",
  "legal advice",
];
const PRIVATE_PREVIEW_ACKNOWLEDGEMENT_VERSION = "lrc-private-preview-v1";
const PRIVATE_PREVIEW_INVITES = {
  misty: {
    label: "Misty / Boss Suite",
    envCode: "PRIVATE_PREVIEW_MISTY_CODE",
    fallbackCode: "misty",
    proof:
      "LRC already has a suite hub, Goal Builder, Formed path, JobsAI path, Ninja workflow path, SocialScan path, Be Happy path, and safety boundary working together as one ecosystem.",
    pitch:
      "Misty could connect as an independent AI-minded collaborator. The pitch is not to merge brands or take over Boss Suite; it is to explore optional shared workflows, AI testing, client organization, and practical templates where both sides stay clear.",
    safeFirstAsk:
      "Review one LRC tool, point out what is confusing, and suggest one Boss Suite-style workflow that could stay separate but compatible.",
    ctaLabel: "Show LRC Suite",
    ctaHref: "/suite/",
  },
  bear: {
    label: "Bear",
    envCode: "PRIVATE_PREVIEW_BEAR_CODE",
    fallbackCode: "bear",
    proof:
      "LRC can now show a live front door, product routes, safety notes, and local draft tools that a trusted tester can walk through and critique.",
    pitch:
      "Bear is already helping, so the safest fit is practical support: testing pages, reading drafts like a real user, spotting confusing steps, and helping decide what should be fixed before anything is shown more widely.",
    safeFirstAsk:
      "Test Goal, Formed, and one other tool, then send a short list of what felt clear, what felt risky, and what should be simplified.",
    ctaLabel: "Open Goal Builder",
    ctaHref: "/goal/",
  },
  robert: {
    label: "Robert",
    envCode: "PRIVATE_PREVIEW_ROBERT_CODE",
    fallbackCode: "robert",
    proof:
      "LRC can show live routes, private preview gating, checkout safe-hold, and a working review boundary instead of only an idea.",
    pitch:
      "Robert is being invited as a quality-first reviewer: someone who can look past presentation, ask whether the work is practical, and point out where the foundation needs to be stronger before wider exposure.",
    safeFirstAsk:
      "Review Founding Circle and one live tool, then send the three strongest concerns and one thing that already feels useful.",
    ctaLabel: "Open Founding Circle",
    ctaHref: "/founding-circle/",
  },
  christina: {
    label: "Christina",
    envCode: "PRIVATE_PREVIEW_CHRISTINA_CODE",
    fallbackCode: "christina",
    proof:
      "LRC now has a visible purpose page, support invitation barrier, product routes, and safety language that can be reviewed like a real early ecosystem.",
    pitch:
      "Christina is invited to review clarity and trust: whether someone can understand the purpose, where they fit, and what stays protected without getting lost in formatting.",
    safeFirstAsk:
      "Read the private invitation and tell LRC what feels clear, what feels too broad, and what would make a serious person lean in.",
    ctaLabel: "Read Founding Circle",
    ctaHref: "/founding-circle/",
  },
  professormichael: {
    label: "Professor Michael",
    envCode: "PRIVATE_PREVIEW_PROFESSOR_MICHAEL_CODE",
    fallbackCode: "professormichael",
    proof:
      "LRC has moved from a loose idea into a routed ecosystem with purpose language, stewardship boundaries, and approval gates that can be challenged and improved.",
    pitch:
      "Professor Michael is invited for standards and stewardship review: challenge the assumptions, ethics, governance, and credibility before this grows beyond a small trusted circle.",
    safeFirstAsk:
      "Review the Founding Circle standard and send the strongest objections, missing safeguards, and one practical next approval layer.",
    ctaLabel: "Read Safety Notes",
    ctaHref: "/safety.html",
  },
  andrew: {
    label: "Andrew",
    envCode: "PRIVATE_PREVIEW_ANDREW_CODE",
    fallbackCode: "andrew",
    proof:
      "LRC now has live pages, a stewardship packet, regression checks, checkout safe-hold, and scoped agent boundaries ready for careful learning-systems review.",
    pitch:
      "Andrew is invited for college coding and future-of-learning review: whether this can become a serious model for AI-assisted builders who learn by doing real governed work.",
    safeFirstAsk:
      "Review the stewardship packet and identify one learning-system risk, one technical opportunity, and one rule that would help builders improve safely.",
    ctaLabel: "Open Stewardship Packet",
    ctaHref: "/stewardship-packet/",
  },
  andrewr: {
    label: "Andrew R",
    envCode: "PRIVATE_PREVIEW_ANDREW_R_CODE",
    fallbackCode: "andrewr",
    proof:
      "LRC has a governed access model, referral accountability, trial review, paid usage boundaries, and private preview acknowledgements ready for risk review.",
    pitch:
      "Andrew R is invited for risk management and work-from-home operations review: abuse cases, remote trust, productivity signals, access discipline, and how to manage people without overreaching.",
    safeFirstAsk:
      "Review the packet and send the top three operational risks, plus one remote-work rule that would protect quality without killing creativity.",
    ctaLabel: "Open Stewardship Packet",
    ctaHref: "/stewardship-packet/",
  },
  eddie: {
    label: "Eddie",
    envCode: "PRIVATE_PREVIEW_EDDIE_CODE",
    fallbackCode: "eddie",
    proof:
      "LRC can already present a working front door, tool paths, private invitations, and approval boundaries that can be stress-tested for real-world usefulness.",
    pitch:
      "Eddie is invited for operational realism: whether the tools make sense to a practical person, where the flow feels weak, and what would make the first core group stronger.",
    safeFirstAsk:
      "Use the home page and one tool path, then send what felt useful, what felt confusing, and what should be removed before wider sharing.",
    ctaLabel: "Open LRC Home",
    ctaHref: "/",
  },
  trent: {
    label: "Trent",
    envCode: "PRIVATE_PREVIEW_TRENT_CODE",
    fallbackCode: "trent",
    proof:
      "LRC has multiple connected routes, a private invitation barrier, safe checkout hold, and tests that protect the baseline from drifting.",
    pitch:
      "Trent is invited for systems and quality review: look for fragile points, unclear handoffs, duplicated ideas, or places where the foundation needs more discipline before growth.",
    safeFirstAsk:
      "Review the LRC Suite and send the top three structural risks or quality fixes you would handle first.",
    ctaLabel: "Open LRC Suite",
    ctaHref: "/suite/",
  },
  berechia: {
    label: "Berechia",
    envCode: "PRIVATE_PREVIEW_BERECHIA_CODE",
    fallbackCode: "berechia",
    proof:
      "LRC now has a purpose-led invitation, private preview barrier, safety language, and product paths that can be reviewed for trust and human usefulness.",
    pitch:
      "Berechia is invited for rare judgment, trust, and stewardship review: whether the message feels grounded, respectful, and serious enough for the kind of people who should be near the foundation.",
    safeFirstAsk:
      "Read the purpose and private preview language, then send what feels sincere, what feels overbuilt, and what would make the invitation safer.",
    ctaLabel: "Read Founding Circle",
    ctaHref: "/founding-circle/",
  },
  elijah: {
    label: "Elijah",
    envCode: "PRIVATE_PREVIEW_ELIJAH_CODE",
    fallbackCode: "elijah",
    proof:
      "LRC now has a tangible stewardship packet, private invitation gate, live product routes, safe checkout hold, and governance language ready for serious review.",
    pitch:
      "Elijah is invited for operating discipline and credibility review: whether this feels clear, serious, and strong enough to keep people focused, accountable, and in line with the standard.",
    safeFirstAsk:
      "Read the stewardship packet and send what makes the idea feel credible, what feels unproven, and what would make a high-quality person take the next step.",
    ctaLabel: "Open Stewardship Packet",
    ctaHref: "/stewardship-packet/",
  },
  brodie: {
    label: "Brodie",
    envCode: "PRIVATE_PREVIEW_BRODIE_CODE",
    fallbackCode: "brodie",
    proof:
      "LRC can now show the operating model in one place: invitation, trial, review, ownership, AI data boundaries, paid usage resources, and removal accountability.",
    pitch:
      "Brodie is invited for manager-level practicality review: whether the system feels useful, manageable, and grounded for real work instead of abstract or overbuilt.",
    safeFirstAsk:
      "Review the packet like a real user, then send what feels simple, what feels confusing, and what should be cut before wider sharing.",
    ctaLabel: "Open Stewardship Packet",
    ctaHref: "/stewardship-packet/",
  },
  professorbacon: {
    label: "Professor Bacon",
    envCode: "PRIVATE_PREVIEW_PROFESSOR_BACON_CODE",
    fallbackCode: "professorbacon",
    proof:
      "LRC is now framed as a governed AI builder ecosystem with no paid recruiting, trial access, referral accountability, user-owned work, and explicit misuse review.",
    pitch:
      "Professor Bacon is invited for psychology and human-systems review: motivation, group dynamics, learning safety, prestige pressure, misuse risk, and whether the trial model supports responsible development.",
    safeFirstAsk:
      "Review the stewardship packet and identify the strongest human-risk issue, the clearest safeguard, and the one approval rule that should exist before scale.",
    ctaLabel: "Open Stewardship Packet",
    ctaHref: "/stewardship-packet/",
  },
  rebecca: {
    label: "Rebecca",
    envCode: "PRIVATE_PREVIEW_REBECCA_CODE",
    fallbackCode: "rebecca",
    proof:
      "LRC now has a purpose-led invitation, private preview barrier, safety language, and enough working routes to show that the idea is becoming a real foundation.",
    pitch:
      "Rebecca is invited because encouragement and steady belief matter at the start. The role here is purpose review: whether the invitation feels human, sincere, and strong enough to help the right people keep going.",
    safeFirstAsk:
      "Read the Founding Circle page and send what feels inspiring, what feels unclear, and what would make a trusted person take the work seriously.",
    ctaLabel: "Read Founding Circle",
    ctaHref: "/founding-circle/",
  },
  jake: {
    label: "Jake",
    envCode: "PRIVATE_PREVIEW_JAKE_CODE",
    fallbackCode: "jake",
    proof:
      "LRC has enough real structure to be judged now: live product routes, a private invite barrier, safe checkout hold, admin review path, and purpose-led stewardship language.",
    pitch:
      "Jake is invited for high-quality strategy and systems review. The ask is not broad commitment; it is sharp judgment on whether the foundation is coherent, serious, and worth tightening.",
    safeFirstAsk:
      "Review the Founding Circle and LRC Suite, then send the strongest strategic concern and the one improvement that would raise the quality fastest.",
    ctaLabel: "Open LRC Suite",
    ctaHref: "/suite/",
  },
  rahul: {
    label: "Rahul",
    envCode: "PRIVATE_PREVIEW_RAHUL_CODE",
    fallbackCode: "rahul",
    proof:
      "LRC has a live ecosystem surface, private invite acknowledgement flow, safe checkout hold, admin review path, and deployable Cloudflare Pages foundation.",
    pitch:
      "Rahul is invited for product and technical judgment: whether this is coherent enough to build on, which part should be tightened first, and where the foundation needs stronger architecture or restraint.",
    safeFirstAsk:
      "Review the suite and Founding Circle, then send one product risk, one technical risk, and one practical next build step.",
    ctaLabel: "Open LRC Suite",
    ctaHref: "/suite/",
  },
};
const PRIVATE_PREVIEW_BOUNDARIES = [
  "This preview does not create employment, contractor status, partnership, ownership, sponsorship, or endorsement.",
  "No secrets, customer data, payment access, admin access, deployment rights, or account permissions are granted.",
  "LRC is not a pyramid, recruiting chain, or pay-to-enter system; no payment, commission, rank, ownership, or authority is created by adding someone.",
  "Referrals only start review, and misuse by an invited person can trigger review of both the invitee and the person who referred them.",
  "Tasks, systems, tools, notes, knowledge, and work product should be credited to the person who created them unless a written agreement says otherwise.",
  "A separate signed agreement is required before deeper access, coding work, private files, customer data, or public representation.",
];

function truthyEnv(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function stripeServerKeyMode(value) {
  const key = String(value || "");
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "test";
  return "";
}

function checkoutStatus() {
  return {
    ok: true,
    available: false,
    mode: "hold",
    paymentStatus: "not_started",
    message: PAYMENT_HOLD_MESSAGE,
  };
}

async function verifiedCheckoutStatus() {
  const status = checkoutStatus();
  if (!status.available) return status;

  try {
    const price = await stripe.prices.retrieve(STRIPE_PRICE_ID);
    const modeMatches = status.mode === "live" ? price.livemode === true : price.livemode === false;
    if (price.active !== false && modeMatches) return status;
  } catch (_error) {
    // Fall through to a safe public hold state.
  }

  return {
    ...status,
    available: false,
    mode: "hold",
    message: PAYMENT_HOLD_MESSAGE,
  };
}

async function diagnoseCheckoutConfig() {
  const baseStatus = checkoutStatus();
  const checks = {
    realWorldPaymentsEnabled: REAL_WORLD_PAYMENTS_ENABLED,
    checkoutEnabled: truthyEnv(CHECKOUT_ENABLED),
    publicUrl: Boolean(PUBLIC_URL),
    stripeSecret: Boolean(STRIPE_SECRET_KEY),
    stripeSecretMode: stripeServerKeyMode(STRIPE_SECRET_KEY) || "missing-or-invalid-prefix",
    stripeRestrictedKey: STRIPE_SECRET_KEY.startsWith("rk_"),
    stripePriceId: Boolean(STRIPE_PRICE_ID),
    stripePriceIdFormat: STRIPE_PRICE_ID.startsWith("price_"),
    stripeWebhookSecret: Boolean(STRIPE_WEBHOOK_SECRET),
  };

  const diagnostic = (category, available = false, extra = {}) => ({
    ok: true,
    category,
    available,
    guardrails: CHECKOUT_DIAGNOSTIC_GUARDRAILS,
    checks,
    ...extra,
  });

  if (!checks.realWorldPaymentsEnabled) return diagnostic("real-world-payments-disabled");
  if (!checks.checkoutEnabled) return diagnostic("checkout-disabled");
  if (!checks.stripeSecret) return diagnostic("missing-secret-key");
  if (checks.stripeSecretMode !== "live") return diagnostic("live-test-mismatch");
  if (!checks.stripePriceId) return diagnostic("missing-price-id");
  if (!checks.stripePriceIdFormat) return diagnostic("invalid-price-id-format");
  if (!checks.stripeWebhookSecret) return diagnostic("missing-webhook-secret");

  try {
    const price = await stripe.prices.retrieve(STRIPE_PRICE_ID);
    if (price.livemode !== true || baseStatus.mode !== "live") {
      return diagnostic("live-test-mismatch");
    }
    if (price.active === false) {
      return diagnostic("inactive-price");
    }

    return diagnostic("ready", true, {
      mode: "live",
      price: {
        active: price.active !== false,
        livemode: price.livemode === true,
        currency: cleanText(price.currency, 20),
        unitAmount: Number(price.unit_amount || 0),
      },
    });
  } catch (error) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return diagnostic("invalid-key");
    }
    if (error.statusCode === 404) {
      return diagnostic("wrong-account-or-price-not-found");
    }
    return diagnostic("stripe-price-lookup-failed");
  }
}

function paymentsReady() {
  return checkoutStatus().available;
}

function requirePayments(response) {
  if (paymentsReady()) return true;
  response.status(503).json({
    ok: false,
    error: checkoutStatus().message,
  });
  return false;
}

function buildCheckoutSessionCreateParams() {
  return {
    mode: "payment",
    line_items: [{
      price: STRIPE_PRICE_ID,
      quantity: 1,
    }],
    success_url: `${PUBLIC_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${PUBLIC_URL}/cancel.html`,
    metadata: {
      product: CHECKOUT_PRODUCT,
    },
  };
}

app.post("/stripe/webhook", express.raw({ type: "application/json" }), (request, response) => {
  const startedAt = Date.now();
  response.on("finish", () => {
    recordTraffic(request, response, startedAt);
  });

  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    response.status(503).send("Stripe webhook is not configured.");
    return;
  }

  const sig = request.headers["stripe-signature"];
  if (!sig) {
    response.status(400).send("Missing Stripe signature.");
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(request.body, sig, STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      recordPaymentSession(event.data.object).catch((error) => {
        console.warn(`Payment record could not be written: ${error.message}`);
      });
    }
    response.json({ received: true });
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.use(express.json({ limit: "32kb" }));

function safeStripeSessionId(value) {
  return /^cs_(test|live)_[A-Za-z0-9_]{8,}$/.test(String(value || "")) ? String(value) : "";
}

function normalizePaymentSession(session = {}) {
  return {
    createdAt: new Date().toISOString(),
    provider: "stripe",
    sessionId: cleanText(session.id, 220),
    mode: cleanText(session.livemode ? "live" : "test", 20),
    product: cleanText(session.metadata?.product || CHECKOUT_PRODUCT, 120),
    paymentStatus: cleanText(session.payment_status, 60),
    status: cleanText(session.status, 60),
    amountTotal: Number(session.amount_total || 0),
    currency: cleanText(session.currency, 20),
  };
}

async function recordPaymentSession(session) {
  const record = normalizePaymentSession(session);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(PAYMENTS_FILE, `${JSON.stringify(record)}\n`, "utf8");
}

async function retrieveCheckoutSession(sessionId) {
  const status = await verifiedCheckoutStatus();
  if (!status.available) {
    return {
      status: 503,
      body: {
        ok: false,
        verified: false,
        error: status.message,
      },
    };
  }

  const safeSessionId = safeStripeSessionId(sessionId);
  if (!safeSessionId) {
    return {
      status: 400,
      body: {
        ok: false,
        verified: false,
        error: "A valid Stripe checkout session id is required.",
      },
    };
  }

  const session = await stripe.checkout.sessions.retrieve(safeSessionId);
  const product = session.metadata?.product || "";
  const verified = session.payment_status === "paid" && product === CHECKOUT_PRODUCT;
  if (verified) await recordPaymentSession(session);

  return {
    status: 200,
    body: {
      ok: true,
      verified,
      paymentStatus: session.payment_status || "",
      status: session.status || "",
      product,
      message: verified
        ? "Checkout record matched the requested product, but real-world payments are inactive on this site."
        : "Checkout returned, but payment has not been confirmed for this product yet.",
    },
  };
}

function trafficKind(pathname, method) {
  if (pathname === "/__access") return "preview-access";
  if (pathname.startsWith("/api/admin/")) return "admin";
  if (pathname.startsWith("/api/")) return "api";
  if (pathname === "/create-checkout-session" || pathname.startsWith("/stripe/")) return "payment";
  if (pathname.startsWith("/assets/") || /\.[a-z0-9]+$/i.test(pathname)) return "asset";
  if (method === "POST") return "submission";
  return "page";
}

function shouldRecordTraffic(pathname) {
  return pathname !== "/api/admin/summary" && pathname !== "/api/admin/export";
}

function readCookieHeader(cookieHeader, name) {
  const match = String(cookieHeader || "").match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function safeCookieId(value) {
  return /^[a-f0-9-]{20,80}$/i.test(String(value || "")) ? String(value) : "";
}

function getAuditIds(request) {
  const cookie = request.get("cookie") || "";
  return {
    visitorId: safeCookieId(readCookieHeader(cookie, VISITOR_COOKIE)) || crypto.randomUUID(),
    sessionId: safeCookieId(readCookieHeader(cookie, SESSION_COOKIE)) || crypto.randomUUID(),
  };
}

function attachAuditCookies(request, response, auditIds) {
  const secure = isLocalRequest(request) ? "" : "; Secure";
  const base = `Path=/; HttpOnly${secure}; SameSite=Lax`;
  response.cookie(VISITOR_COOKIE, auditIds.visitorId, {
    maxAge: 180 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: !isLocalRequest(request),
    sameSite: "lax",
    path: "/",
  });
  response.cookie(SESSION_COOKIE, auditIds.sessionId, {
    maxAge: 30 * 60 * 1000,
    httpOnly: true,
    secure: !isLocalRequest(request),
    sameSite: "lax",
    path: "/",
  });
  return base;
}

function publicTrafficHeaders(request) {
  return {
    userAgent: cleanText(request.get("user-agent"), 300),
    referrer: cleanText(request.get("referer"), 500),
    ip: cleanText(request.get("x-forwarded-for") || request.ip || request.socket?.remoteAddress, 120),
  };
}

function buildTrafficRecord(request, response, startedAt) {
  const url = new URL(request.originalUrl || request.url || "/", PUBLIC_URL);
  const auditIds = request.auditIds || getAuditIds(request);
  return {
    createdAt: new Date().toISOString(),
    visitorId: auditIds.visitorId,
    sessionId: auditIds.sessionId,
    method: request.method,
    host: cleanText(request.get("host"), 200),
    path: cleanText(url.pathname, 500),
    search: cleanText(url.search, 500),
    status: response.statusCode,
    kind: trafficKind(url.pathname, request.method),
    durationMs: Math.max(0, Date.now() - startedAt),
    ...publicTrafficHeaders(request),
  };
}

async function recordTraffic(request, response, startedAt) {
  try {
    const url = new URL(request.originalUrl || request.url || "/", PUBLIC_URL);
    if (!shouldRecordTraffic(url.pathname)) return;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(TRAFFIC_FILE, `${JSON.stringify(buildTrafficRecord(request, response, startedAt))}\n`, "utf8");
  } catch (error) {
    console.warn(`Traffic audit could not be written: ${error.message}`);
  }
}

app.use((req, res, next) => {
  const startedAt = Date.now();
  req.auditIds = getAuditIds(req);
  attachAuditCookies(req, res, req.auditIds);
  res.on("finish", () => {
    recordTraffic(req, res, startedAt);
  });
  next();
});

const EXTENSIONLESS_PAGE_ROUTES = new Map([
  ["/suite", path.join(__dirname, "suite", "index.html")],
  ["/promo/posts", path.join(__dirname, "promo", "posts.html")],
  ["/promo/launch", path.join(__dirname, "promo", "launch.html")],
]);

app.get([...EXTENSIONLESS_PAGE_ROUTES.keys()], (req, res) => {
  const normalizedPath = req.path.replace(/\/+$/, "") || "/";
  res.sendFile(EXTENSIONLESS_PAGE_ROUTES.get(normalizedPath));
});

function isBlockedAssetPath(pathname) {
  const segments = String(pathname || "/").split("/").filter(Boolean);
  if (segments.some((segment) => segment.startsWith(".") && segment !== ".well-known")) {
    return true;
  }

  const firstSegment = segments[0] || "";
  const fileName = segments[segments.length - 1] || "";
  return (
    ["data", "node_modules", "scripts", "src", "ip-protection"].includes(firstSegment) ||
    fileName.endsWith(".md") ||
    [
      "_worker.js",
      "btl-redirect-worker.js",
      "package.json",
      "package-lock.json",
      "README.md",
      "WORKING_SYSTEM.md",
      "server.js",
      "wrangler.toml",
    ].includes(fileName)
  );
}

app.use((req, res, next) => {
  if (!isBlockedAssetPath(req.path || "/")) {
    next();
    return;
  }

  res.status(404).type("text/plain; charset=utf-8").send("Not found");
});

app.use(express.static(__dirname));

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

class Agent {
  constructor(name) {
    this.name = name;
  }

  run(input) {
    return {
      agent: this.name,
      ...this.process(input),
    };
  }
}

class LeviAgent extends Agent {
  constructor() {
    super("Levi");
  }

  process(input) {
    const route = routeWork(input);
    const agent = getAgent(route);
    const result = agent.run(input);

    return {
      route,
      result,
      approval_required: true,
    };
  }
}

class RoleAgent extends Agent {
  constructor() {
    super("RoleAgent");
  }

  process(input) {
    return buildStructuredBrief(input, "Role Brief");
  }
}

class ApplicantAgent extends Agent {
  constructor() {
    super("ApplicantAgent");
  }

  process(input) {
    return buildStructuredBrief(input, "Applicant Profile");
  }
}

class GeneralAgent extends Agent {
  constructor() {
    super("GeneralAgent");
  }

  process(input) {
    return buildStructuredBrief(input, "Work Brief");
  }
}

function routeWork(input) {
  const text = String(input || "").toLowerCase();
  if (text.includes("hire") || text.includes("role")) return "role";
  if (text.includes("resume") || text.includes("apply")) return "applicant";
  return "general";
}

function getAgent(route) {
  if (route === "role") return new RoleAgent();
  if (route === "applicant") return new ApplicantAgent();
  return new GeneralAgent();
}

function inferWorkAudience(input) {
  const text = String(input || "").toLowerCase();
  if (text.includes("hire") || text.includes("role")) return "Founder / Hiring";
  if (text.includes("resume") || text.includes("apply")) return "Applicant";
  return "Builder";
}

function buildStructuredBrief(input, type) {
  const text = cleanText(input, 240);
  return {
    deliverable_type: type,
    outcome: `Build a polished ${String(type || "work brief").toLowerCase()} for "${text}"`,
    audience: inferWorkAudience(text),
    problem: "Polished product path: route, audience, offer, proof points, and approval-safe next move.",
    next_step: "Build the first polished Business Draft, then continue in the recommended route for review.",
    checklist: [
      "Shape the polished product outcome",
      "Define audience and first offer",
      "Create review-ready copy or workflow",
      "Approve before any external action",
    ],
  };
}

function runWorkMatchAgent(input) {
  return new LeviAgent().run(input);
}

function workMatchPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LRC WorkMatch Agent</title>
    <link rel="stylesheet" href="/styles.css?v=15" />
    <link rel="stylesheet" href="/assets/lrc-affiliate-layout.css?v=4" />
  </head>
  <body class="lrc-affiliate workmatch-page">
    <main class="site-shell">
      <header class="site-header">
        <a class="brand-lockup" href="/" aria-label="LRC Property LLC home">
          <span class="brand-symbol"><img src="/assets/lrc-property-llc-logo.jpeg" alt="" /></span>
          <span><strong>LRC WorkMatch</strong><small>Levi routed work agent</small></span>
        </a>
        <nav class="header-links" aria-label="WorkMatch navigation">
          <a href="/">Home</a>
          <a href="/formed/">Formed</a>
          <a href="/ninja/">Ninja</a>
        </nav>
      </header>

      <section class="app-front-door" aria-label="LRC WorkMatch Agent">
        <div class="funnel-stack" data-funnel-status="workmatch">
          <p class="eyebrow">LRC WorkMatch Agent</p>
          <p class="trust-line">Approval required before any external action.</p>
          <h1>Levi WorkMatch</h1>
          <p class="hero-lede">Enter what you are trying to accomplish. Levi routes the work to RoleAgent, ApplicantAgent, or GeneralAgent and returns one structured brief.</p>

          <section class="router-output levi-controller" aria-label="Levi WorkMatch">
            <h2>What are you trying to accomplish?</h2>
            <p class="input-hint safety-pause-banner">Nothing happens without your approval. You securely review and authorize payment before anything is charged.</p>
            <form class="router-form" id="workmatch-form">
              <label>
                One prompt
                <input id="input" name="input" autocomplete="off" placeholder="Example: hire a support role" />
              </label>
              <button class="primary-button" type="submit">Build My Starting Plan</button>
            </form>
            <p class="input-hint">Choose a statement or enter your request, then build a starting plan.</p>
          </section>

          <div id="output" aria-live="polite"></div>
        </div>
      </section>
    </main>

    <script>
      const input = document.getElementById("input");
      const form = document.getElementById("workmatch-form");
      const output = document.getElementById("output");
      let lastText = "";

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        run();
      });

      async function run() {
        const value = input.value.trim();
        if (!value || value.length < 3 || value === lastText) return;
        lastText = value;

        const response = await fetch("/run-agent", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ input: value })
        });
        const data = await response.json();
        render(data);
      }

      function render(data) {
        if (!data || data.error) return;
        const brief = data.result || {};
        output.innerHTML = "";

        const card = document.createElement("section");
        card.className = "structured-brief output-card";
        card.setAttribute("aria-label", "Structured brief");

        const title = document.createElement("h3");
        title.textContent = brief.deliverable_type || "Work Brief";
        card.append(title);

        [
          ["Outcome", brief.outcome],
          ["Audience", brief.audience],
          ["Polished Product", brief.problem],
          ["Next Step", brief.next_step]
        ].forEach(([name, value]) => {
          const p = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = name + ": ";
          p.append(strong, value || "");
          card.append(p);
        });

        const checklistTitle = document.createElement("h4");
        checklistTitle.textContent = "Checklist";
        const list = document.createElement("ul");
        (brief.checklist || []).forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          list.append(li);
        });
        card.append(checklistTitle, list);

        const actions = document.createElement("div");
        actions.className = "actions";

        const copy = document.createElement("button");
        copy.className = "secondary-button";
        copy.type = "button";
        copy.textContent = "Copy";
        copy.addEventListener("click", async () => {
          await navigator.clipboard.writeText(output.innerText);
          copy.textContent = "Copied";
          setTimeout(() => { copy.textContent = "Copy"; }, 1400);
        });

        const refine = document.createElement("button");
        refine.className = "secondary-button";
        refine.type = "button";
        refine.textContent = "Refine";
        refine.addEventListener("click", () => {
          lastText = "";
          input.focus();
          input.select();
        });

        const upgrade = document.createElement("button");
        upgrade.className = "primary-button";
        upgrade.type = "button";
        upgrade.textContent = "Upgrade";
        upgrade.addEventListener("click", () => {
          window.location.href = "/formed/#build-review";
        });

        actions.append(copy, refine, upgrade);
        card.append(actions);
        output.append(card);
      }
    </script>
  </body>
</html>`;
}

function normalizeLead(body) {
  const email = cleanText(body.email, 160).toLowerCase();
  const lead = {
    createdAt: new Date().toISOString(),
    source: cleanText(body.source, 80) || "lrc-parent",
    toolInterest: cleanText(body.toolInterest, 80),
    name: cleanText(body.name, 120),
    email,
    message: cleanText(body.message, 1200),
    contactConsent: body.contactConsent === true,
    researchConsent: body.researchConsent === true,
  };

  if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    throw new Error("A valid email is required.");
  }

  if (!lead.contactConsent) {
    throw new Error("Contact consent is required.");
  }

  return lead;
}

function normalizePrivatePreviewKey(value) {
  return cleanText(value, 120).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function privatePreviewAccessCode(invite, source = process.env) {
  return normalizePrivatePreviewKey(source[invite.envCode] || invite.fallbackCode);
}

function privatePreviewRecordId() {
  return `private-preview-${new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)}-${nodeCrypto.randomBytes(4).toString("hex")}`;
}

function privatePreviewIpHash(value) {
  const ip = cleanText(value, 120);
  return ip ? nodeCrypto.createHash("sha256").update(`lrc-private-preview:${ip}`).digest("hex") : "";
}

function previewResponse(invite) {
  return {
    inviteeLabel: invite.label,
    proof: invite.proof,
    pitch: invite.pitch,
    safeFirstAsk: invite.safeFirstAsk,
    ctaLabel: invite.ctaLabel,
    ctaHref: invite.ctaHref,
    boundaries: PRIVATE_PREVIEW_BOUNDARIES,
  };
}

function buildPrivatePreviewAcknowledgement(body = {}, req = null) {
  const invitee = normalizePrivatePreviewKey(body.invitee);
  const invite = PRIVATE_PREVIEW_INVITES[invitee];
  if (!invite) {
    const error = new Error("Private preview invitation was not found.");
    error.statusCode = 404;
    throw error;
  }

  const passphrase = normalizePrivatePreviewKey(body.passphrase);
  if (passphrase !== privatePreviewAccessCode(invite)) {
    const error = new Error("Private preview name did not match this invitation.");
    error.statusCode = 403;
    throw error;
  }

  const signatureName = cleanText(body.signatureName, 160);
  if (signatureName.length < 2) {
    const error = new Error("Typed acknowledgement name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (body.agreement !== true || body.acknowledgementVersion !== PRIVATE_PREVIEW_ACKNOWLEDGEMENT_VERSION) {
    const error = new Error("Private preview acknowledgement is required.");
    error.statusCode = 400;
    throw error;
  }

  const createdAt = new Date().toISOString();
  const record = {
    id: privatePreviewRecordId(),
    createdAt,
    source: cleanText(body.source, 80) || "friends-family",
    type: "private-preview-acknowledgement",
    invitee,
    inviteeLabel: invite.label,
    signatureName,
    acknowledgementVersion: PRIVATE_PREVIEW_ACKNOWLEDGEMENT_VERSION,
    boundariesAccepted: PRIVATE_PREVIEW_BOUNDARIES,
    noRoleCreated: true,
    noAccessGranted: true,
    separateAgreementRequired: true,
    path: cleanText(req?.path || "/api/private-preview/acknowledgement", 200),
    userAgent: cleanText(req?.get?.("user-agent"), 300),
    ipHash: privatePreviewIpHash(req?.ip || req?.get?.("x-forwarded-for") || ""),
  };

  return { record, preview: previewResponse(invite) };
}

function normalizeAgentActivity(body) {
  const activity = {
    createdAt: new Date().toISOString(),
    site: cleanText(body.site, 60) || "home",
    mode: cleanText(body.mode, 40) || "assist",
    agent: cleanText(body.agent, 100) || "Levi",
    assetType: cleanText(body.assetType, 100) || "Agent action",
    prompt: cleanText(body.prompt, 240),
    actionType: cleanText(body.actionType, 80) || "unknown",
    target: cleanText(body.target, 120),
    form: cleanText(body.form, 120),
    filled: Array.isArray(body.filled) ? body.filled.map((item) => cleanText(item, 120)).filter(Boolean).slice(0, 12) : [],
    safeSubmit: Boolean(body.safeSubmit),
    boundary: cleanText(body.boundary, 180),
    message: cleanText(body.message, 300),
    href: cleanText(body.href, 300),
  };

  return activity;
}

function guardedActionCategory(prompt = "") {
  const lower = String(prompt || "").toLowerCase();
  if (["payment", "pay", "refund", "cancel subscription", "purchase", "stripe"].some((term) => lower.includes(term))) return "financial approval";
  if (["delete", "remove record", "wipe", "destroy"].some((term) => lower.includes(term))) return "deletion approval";
  if ([
    "deploy",
    "publish",
    "post",
    "send message",
    "send email",
    "email ",
    "submit",
    "official filing",
    "file with",
    "filing",
    "upload to",
    "external upload",
    "book",
    "grant access",
    "account access",
    "change access",
    "share access",
    "change permission",
  ].some((term) => lower.includes(term))) return "action approval";
  if (["secret", "password", "key", "ssn", "bank", "card"].some((term) => lower.includes(term))) return "sensitive-data approval";
  return "";
}

function taskStatusForPrompt(prompt = "") {
  return guardedActionCategory(prompt) ? "approvalNeeded" : "draftReady";
}

function includesAnyTerm(text = "", terms = []) {
  const lower = String(text || "").toLowerCase();
  return terms.find((term) => lower.includes(term)) || "";
}

function agentPromptFromBody(body = {}) {
  return cleanText(
    body.prompt || body.input || body.goal || body.action || body.message || body.preview || "",
    900
  );
}

function inferAgentActionType(text = "") {
  const lower = String(text || "").toLowerCase();
  if (["pay", "payment", "checkout", "stripe", "refund", "subscription"].some((term) => lower.includes(term))) return "payment_or_checkout";
  if (["file", "filing", "llc", "formation"].some((term) => lower.includes(term))) return "filing_or_formation";
  if (["publish", "post", "deploy"].some((term) => lower.includes(term))) return "publish_or_deploy";
  if (["send", "message", "email", "sms"].some((term) => lower.includes(term))) return "send_message";
  if (["upload", "delete", "remove", "account access", "permission"].some((term) => lower.includes(term))) return "account_or_data_change";
  return "local_draft";
}

function classifyAgentPolicy(body = {}) {
  const prompt = agentPromptFromBody(body);
  const actionType = cleanText(body.actionType || body.type || inferAgentActionType(prompt), 80);
  const target = cleanText(body.target || body.href || body.site || "", 180);
  const combined = [prompt, actionType, target, body.preview || ""].join(" ");
  const blockedTerm = includesAnyTerm(combined, AGENT_BLOCKED_TERMS);
  const approvalCategory = blockedTerm ? "blocked" : guardedActionCategory(combined);
  const readOnlyIntent = /\b(audit|check|diagnose|inspect|review|summarize|compare|status)\b/i.test(combined);
  const riskLevel = blockedTerm
    ? "blocked"
    : approvalCategory
      ? "approval_required"
      : readOnlyIntent
        ? "read_only"
        : "draft_only";
  const outcome = riskLevel === "blocked"
    ? "blocked"
    : riskLevel === "approval_required"
      ? "needs_owner_approval"
      : "local_draft_allowed";

  return {
    version: AGENT_POLICY_VERSION,
    riskLevel,
    outcome,
    actionType,
    approvalRequired: riskLevel === "approval_required",
    blocked: riskLevel === "blocked",
    canExecuteNow: false,
    externalActionTaken: false,
    externalActionsAllowed: false,
    approvalCategory: approvalCategory || "",
    blockedReason: blockedTerm ? `Blocked term or request pattern: ${blockedTerm}` : "",
    safetyPause: AGENT_SAFETY_PAUSE,
    allowedNow: AGENT_SAFE_CAPABILITIES,
    externalActions: AGENT_EXTERNAL_ACTIONS,
    decision: riskLevel === "blocked"
      ? "Do not execute. Rewrite as a safe starting plan or owner-reviewed request."
      : riskLevel === "approval_required"
        ? "Prepare draft and approval packet only. Owner approval is required before any external action."
        : "Prepare a starting plan only.",
  };
}

function agentPolicyManifest() {
  return {
    ok: true,
    version: AGENT_POLICY_VERSION,
    mode: "local-draft-control-plane",
    safetyPause: AGENT_SAFETY_PAUSE,
    safeCapabilities: AGENT_SAFE_CAPABILITIES,
    approvalRequiredBefore: AGENT_EXTERNAL_ACTIONS,
    executeEndpointEnabled: false,
    storage: {
      local: "data/agent-action-requests.jsonl",
      worker: "LRC_LEADS keys with prefix agent:action-request:",
    },
  };
}

function actionPayloadHash(payload) {
  return nodeCrypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function buildAgentDraft(body = {}) {
  const prompt = agentPromptFromBody(body);
  const policy = classifyAgentPolicy({ ...body, prompt });
  return {
    ok: true,
    kind: "agent_draft",
    createdAt: new Date().toISOString(),
    prompt,
    policy,
    draft: buildLeviAgentAsset({ ...body, prompt }),
    externalActionTaken: false,
    approvalStatus: policy.approvalRequired
      ? "Owner approval required before external action."
      : "Starting plan only.",
  };
}

function buildAgentActionRequest(body = {}) {
  const prompt = agentPromptFromBody(body);
  const policy = classifyAgentPolicy({ ...body, prompt });
  const payload = {
    site: cleanText(body.site, 80) || "home",
    agent: cleanText(body.agent, 100) || "Levi",
    actionType: policy.actionType,
    prompt,
    target: cleanText(body.target || body.href, 240),
    preview: cleanText(body.preview || body.summary || body.message, 1200),
  };
  const createdAt = new Date().toISOString();
  const status = policy.blocked
    ? "blocked"
    : policy.approvalRequired
      ? "needs_owner_approval"
      : "draft_only";

  return {
    id: `agent-action-${Date.now()}-${nodeCrypto.randomBytes(4).toString("hex")}`,
    createdAt,
    status,
    approvalRequired: policy.approvalRequired,
    blocked: policy.blocked,
    canExecuteNow: false,
    externalActionTaken: false,
    policy,
    payload,
    payloadHash: actionPayloadHash(payload),
    ownerReview: policy.blocked
      ? "Blocked. No automated execution is available."
      : policy.approvalRequired
        ? "Owner must review and approve the exact target, preview, and action before execution can exist."
        : "Draft-only request logged for review. No external execution is available from this endpoint.",
  };
}

async function saveAgentActionRequest(actionRequest) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(AGENT_ACTION_REQUESTS_FILE, `${JSON.stringify(actionRequest)}\n`, "utf8");
}

async function saveAgentActionActivity(actionRequest) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(AGENT_ACTIVITY_FILE, `${JSON.stringify({
    createdAt: actionRequest.createdAt,
    site: actionRequest.payload.site,
    mode: "control-plane",
    agent: actionRequest.payload.agent,
    assetType: "Agent action request",
    prompt: actionRequest.payload.prompt,
    actionType: actionRequest.payload.actionType,
    target: actionRequest.payload.target,
    safeSubmit: false,
    boundary: actionRequest.policy.decision,
    message: `${actionRequest.status}: ${actionRequest.ownerReview}`,
    href: "",
  })}\n`, "utf8");
}

function ninjaNextAction(asset, approvalCategory) {
  if (approvalCategory) {
    return `I can organize the work and run read-only checks now. Before I ${approvalCategory.includes("financial") ? "touch payment flow" : "take that real-world action"}, I need explicit owner approval.`;
  }
  if (Array.isArray(asset.nextSteps) && asset.nextSteps.length) {
    return cleanText(`Start here: ${asset.nextSteps[0]}`, 220);
  }
  return "Start by naming the next visible output, then I will assign the focused agent.";
}

function ninjaAllowedAction(primaryRoute = {}, approvalCategory = "") {
  if (approvalCategory) {
    return "Create the plan, run safe read-only checks, and pause before the real-world action.";
  }
  const label = cleanText(primaryRoute.label || "LRC", 80);
  return `Prepare the local ${label} draft, route, checklist, or diagnostic without external action.`;
}

function ninjaResultLog(prompt = "", primaryRoute = {}, approvalCategory = "") {
  return [
    cleanText(`Captured task: ${prompt}`, 220),
    cleanText(`Assigned ${primaryRoute.agent || "Ninja"} on ${primaryRoute.label || "LRC"}.`, 160),
    approvalCategory
      ? cleanText(`Paused before real-world step: ${approvalCategory}.`, 160)
      : "Prepared a starting plan preview. No external action was taken.",
    "No real-world payment, deletion, submission, publishing, upload, message, access change, or sensitive-data transfer was performed.",
  ];
}

function ninjaUsefulArtifact(prompt = "", primaryRoute = {}, approvalCategory = "") {
  const label = cleanText(primaryRoute.label || "Formed", 80);
  const task = cleanText(prompt, 180);
  return {
    title: `${label} workflow`,
    items: [
      "Route spine: LRC Home → Recommended Route → Starter Business Draft → Owner Approval → Preview, Contact, or Checkout",
      "Smooth transition: keep the user in one path from the starter Business Draft into the recommended route.",
      "Ninja continuity: preserve the route, blocker, approval gate, and next move without sending the user into extra panels.",
      cleanText(`Business Draft: build a polished local product draft for "${task}" before opening another tool.`, 220),
      "Approval gate: review before filing, publishing, charging, submitting, sending, account changes, uploads, deletion, or secrets.",
      approvalCategory
        ? cleanText(`Secure checkout path: pause in hold because ${approvalCategory} is required before the real-world step.`, 220)
        : "Secure checkout path: starting plan, owner review, then checkout hold or owner-approved checkout only when payment is enabled.",
    ],
  };
}

function primaryNinjaRoute(routes, prompt = "") {
  const lower = String(prompt || "").toLowerCase();
  const wantsManager = ["ninja", "agent manager", "manager", "admin", "status", "blocker", "approval", "task board", "task"].some((term) => lower.includes(term));
  if (wantsManager) {
    return routes.find((route) => route.key === "admin" || route.agent === "Ninja") || routes[0] || {};
  }
  return routes[0] || {};
}

function buildNinjaTask(body = {}) {
  const prompt = cleanText(body.prompt, 700);
  if (!prompt) throw new Error("Reduce to one Business Draft before opening another tool.");

  const asset = buildLeviAgentAsset({
    site: "home",
    mode: "assist",
    prompt: `Ninja manager task: ${prompt}`,
  });
  const routes = Array.isArray(asset.routes) ? asset.routes.slice(0, 5) : [];
  const primaryRoute = primaryNinjaRoute(routes, prompt);
  const approvalCategory = guardedActionCategory(prompt);
  const now = new Date().toISOString();

  return {
    id: `ninja-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    createdAt: now,
    updatedAt: now,
    goal: prompt,
    status: taskStatusForPrompt(prompt),
    assignedAgent: cleanText(primaryRoute.agent || asset.agent || "Ninja", 100),
    assignedSite: cleanText(primaryRoute.label || "LRC", 80),
    blocker: approvalCategory ? `Approval status: owner approval required before the real-world part: ${approvalCategory}.` : "",
    approvalRequired: Boolean(approvalCategory),
    approvalCategory,
    allowedAction: ninjaAllowedAction(primaryRoute, approvalCategory),
    usefulArtifact: ninjaUsefulArtifact(prompt, primaryRoute, approvalCategory),
    resultLog: ninjaResultLog(prompt, primaryRoute, approvalCategory),
    nextAction: ninjaNextAction(asset, approvalCategory),
    summary: cleanText(asset.summary, 700),
    guardrail: cleanText(asset.guardrail?.startsWith("Action rule:") ? asset.guardrail : `Action rule: ${asset.guardrail || "move on starting plans and checks; ask approval only before real-world guarded actions."}`, 300),
    routes,
  };
}

async function saveNinjaTask(task) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(NINJA_TASKS_FILE, `${JSON.stringify(task)}\n`, "utf8");
}

function getAdminCode(request) {
  return cleanText(request.get("x-admin-code"), 200);
}

function isLocalRequest(request) {
  const hostname = String(request.hostname || "").toLowerCase();
  const host = String(request.headers.host || "").toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || host.startsWith("localhost:");
}

function getAllowedAdminCode(request) {
  if (ADMIN_ACCESS_CODE) return ADMIN_ACCESS_CODE;
  return "";
}

function requireAdmin(request, response) {
  const allowedCode = getAllowedAdminCode(request);

  if (!allowedCode) {
    response.status(503).json({
      ok: false,
      error: "Admin access is not configured.",
    });
    return false;
  }

  if (getAdminCode(request) !== allowedCode) {
    response.status(401).json({
      ok: false,
      error: "Admin code required.",
    });
    return false;
  }

  return true;
}

async function readJsonLines(filePath) {
  try {
    const value = await fs.readFile(filePath, "utf8");
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  } catch {
    return [];
  }
}

async function writeJsonLines(filePath, records) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const body = records.length ? `${records.map((record) => JSON.stringify(record)).join("\n")}\n` : "";
  await fs.writeFile(filePath, body, "utf8");
}

async function appendJsonLine(filePath, record) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

function publicRecordId(prefix) {
  return `${prefix}-${new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)}-${nodeCrypto.randomBytes(4).toString("hex")}`;
}

function redactSensitiveText(value, maxLength = 700) {
  return cleanText(value, maxLength)
    .replace(/[<>]/g, "")
    .replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, "[redacted-ssn]")
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[redacted-card]")
    .replace(/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9_]+\b/g, "[redacted-key]")
    .replace(/\b(?:password|secret|private key)\s*[:=]\s*\S+/gi, "[redacted-secret]");
}

function compactStringArray(values = [], limit = 8, itemLength = 180) {
  return (Array.isArray(values) ? values : [])
    .map((value) => redactSensitiveText(value, itemLength))
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeFounderCategory(value) {
  const category = cleanText(value, 80).toLowerCase();
  return [
    "founder-startup",
    "local-service",
    "food-service",
    "product-brand",
    "ai-operations",
    "tax-preparer-fit",
    "bookkeeping-setup",
  ].includes(category) ? category : "founder-startup";
}

function sanitizeArtifact(body = {}) {
  const artifact = body.artifact && typeof body.artifact === "object" ? body.artifact : body;
  return {
    workingConcept: redactSensitiveText(artifact.workingConcept || body.workingConcept || body.businessIdea || body.idea, 360),
    firstOffer: redactSensitiveText(artifact.firstOffer, 520),
    targetCustomer: redactSensitiveText(artifact.targetCustomer, 360),
    positioning: redactSensitiveText(artifact.positioning, 520),
    launchChecklist: compactStringArray(artifact.launchChecklist, 8, 220),
    nextBestStep: redactSensitiveText(artifact.nextBestStep, 240),
  };
}

function normalizeEntityRecord(body = {}) {
  const artifact = sanitizeArtifact(body);
  const workingConcept = artifact.workingConcept;
  if (!workingConcept || workingConcept.length < 3) {
    throw new Error("A business idea is required.");
  }

  const now = new Date().toISOString();
  return {
    id: publicRecordId("entity"),
    createdAt: now,
    updatedAt: now,
    version: "1.0",
    product: "Formed",
    entityType: "founder-business",
    source: cleanText(body.source, 80) || "formed-v1",
    category: normalizeFounderCategory(body.category),
    localWorkspaceKey: "lrc_workspace_v1",
    rawSensitiveContentStored: false,
    externalActionTaken: false,
    approvalRequiredBefore: AGENT_EXTERNAL_ACTIONS,
    operationalData: artifact,
    signals: {
      inputLength: workingConcept.length,
      hasOffer: Boolean(artifact.firstOffer),
      hasCustomer: Boolean(artifact.targetCustomer),
      hasPositioning: Boolean(artifact.positioning),
      checklistItems: artifact.launchChecklist.length,
    },
  };
}

function safeMetadata(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 10)
      .map(([key, item]) => [cleanText(key, 60), redactSensitiveText(item, 180)])
      .filter(([key]) => Boolean(key))
  );
}

function normalizeEntityEvent(body = {}) {
  const now = new Date().toISOString();
  return {
    id: publicRecordId("event"),
    createdAt: now,
    eventType: cleanText(body.eventType || body.type, 80) || "formed-interaction",
    product: cleanText(body.product, 80) || "Formed",
    entityId: cleanText(body.entityId, 120),
    route: cleanText(body.route, 80) || "formed-startup",
    inputLength: Number.isFinite(Number(body.inputLength)) ? Number(body.inputLength) : 0,
    selectedCategory: normalizeFounderCategory(body.selectedCategory || body.category),
    uiAction: cleanText(body.uiAction, 80) || "unknown",
    metadata: safeMetadata(body.metadata),
    rawSensitiveContentStored: false,
    externalActionTaken: false,
  };
}

function recommendationsFor(body = {}) {
  const artifact = sanitizeArtifact(body);
  const category = normalizeFounderCategory(body.category);
  const recommendations = [
    {
      type: "build-review",
      label: "Request build review",
      reason: "Review the first offer, customer, positioning, and launch checklist before paid or public action.",
      priority: 1,
    },
  ];

  if (category === "tax-preparer-fit") {
    recommendations.push({
      type: "tax-help",
      label: "Request tax help",
      reason: "Prepare a tax-preparer fit request without giving tax advice or transferring sensitive records.",
      priority: 2,
    });
  } else if (category === "bookkeeping-setup") {
    recommendations.push({
      type: "bookkeeping-setup",
      label: "Request bookkeeping setup",
      reason: "Organize records, categories, cadence, and review questions without providing accounting services.",
      priority: 2,
    });
  } else {
    recommendations.push({
      type: "launch-support",
      label: "Request launch support",
      reason: "Turn the checklist into a reviewed launch path before publishing or sending anything.",
      priority: 2,
    });
  }

  recommendations.push({
    type: "ai-operations",
    label: "Request AI operations setup",
    reason: "Create intake, summary, and review loops after the offer and customer are clear.",
    priority: 3,
  });

  return {
    nextBestStep: artifact.nextBestStep || recommendations[0].label,
    recommendations,
    matchingSignals: {
      category,
      hasLaunchChecklist: artifact.launchChecklist.length > 0,
      supportFit: recommendations.map((item) => item.type),
    },
  };
}

function normalizeRecommendationRecord(body = {}) {
  const now = new Date().toISOString();
  return {
    id: publicRecordId("rec"),
    createdAt: now,
    product: cleanText(body.product, 80) || "Formed",
    entityId: cleanText(body.entityId, 120),
    source: "formed-v1",
    recommendation: recommendationsFor(body),
    rawSensitiveContentStored: false,
    externalActionTaken: false,
  };
}

function normalizeApprovalRecord(body = {}, checkout = checkoutStatus()) {
  const now = new Date().toISOString();
  const requestedAction = cleanText(body.requestedAction || body.actionType, 140) || "Founder support request";
  const actionType = cleanText(body.actionType, 80) || "support-request";
  const policy = classifyAgentPolicy({
    prompt: `${requestedAction} ${body.reason || ""}`,
    actionType,
    target: body.target || "",
  });

  return {
    id: publicRecordId("approval"),
    createdAt: now,
    updatedAt: now,
    product: cleanText(body.product, 80) || "Formed",
    entityId: cleanText(body.entityId, 120),
    actionType,
    requestedAction,
    category: cleanText(body.category, 80) || policy.approvalCategory || "human approval",
    reason: redactSensitiveText(body.reason, 360),
    status: "requested",
    approvalRequired: true,
    humanApprovalRequired: true,
    externalActionTaken: false,
    externalActionsAllowed: false,
    checkoutStatus: {
      available: checkout.available === true,
      mode: checkout.mode || "hold",
      paymentStatus: "not_started",
    },
    policy,
    nextAction: checkout.available
      ? "User must review and authorize Stripe Checkout before payment."
      : "Hold for owner review or contact path. Stripe Checkout is not active.",
    approvalBoundary: AGENT_SAFETY_PAUSE,
  };
}

const FEATURE_STATUS_STEPS = [
  "requested",
  "approved_for_build",
  "built_for_review",
  "approved_for_deploy",
  "deployed",
];

const FEATURE_STATUS_LABELS = {
  requested: "New request",
  approved_for_build: "Build approved",
  built_for_review: "Built for review",
  approved_for_deploy: "Deploy approved",
  deployed: "Deployed",
};

const FEATURE_NEXT_ACTIONS = {
  requested: "Admin approves the feature for build or leaves it in review.",
  approved_for_build: "Create the feature from the build packet. Do not deploy yet.",
  built_for_review: "Review the local build and approve deployment only when it is ready.",
  approved_for_deploy: "Deploy only after this approval is recorded.",
  deployed: "Deployment recorded. Keep the review log for follow-up.",
};

const FEATURE_STATUS_ALIASES = {
  submitted: "requested",
  reviewed: "approved_for_build",
  approved: "approved_for_build",
  created: "built_for_review",
  build_reviewed: "built_for_review",
  deploy_approved: "approved_for_deploy",
};

function normalizeFeatureStatus(value) {
  const status = cleanText(value, 40).toLowerCase().replace(/[\s-]+/g, "_");
  if (FEATURE_STATUS_ALIASES[status]) return FEATURE_STATUS_ALIASES[status];
  return FEATURE_STATUS_STEPS.includes(status) ? status : "";
}

function nextFeatureStatus(status) {
  const index = FEATURE_STATUS_STEPS.indexOf(status);
  if (index < 0 || index >= FEATURE_STATUS_STEPS.length - 1) return "";
  return FEATURE_STATUS_STEPS[index + 1];
}

function featureStatusLabel(status) {
  return FEATURE_STATUS_LABELS[normalizeFeatureStatus(status)] || status || "New request";
}

function buildFeaturePacket(feature = {}) {
  const title = cleanText(feature.title, 140) || "Requested feature";
  const area = cleanText(feature.area, 80) || "LRC site";
  const description = cleanText(feature.description, 1200);
  const reason = cleanText(feature.reason, 700);

  return {
    title,
    area,
    userStory: `As an LRC user, I want ${title.toLowerCase()} so the ${area} workflow is easier to finish.`,
    buildBrief: `Build "${title}" for ${area}. User request: ${description || "No extra details provided."}${reason ? ` Outcome: ${reason}.` : ""}`,
    acceptanceChecks: [
      "The user can complete the feature path without extra mode choices.",
      "The feature produces a visible output, status, or next action.",
      "Admin approval remains visible before public, paid, external, or deploy actions.",
      "No secrets, payment details, account access, or private records are exposed.",
    ],
    deployGuardrail: "Deploy only after admin marks the build approved for deployment.",
  };
}

function buildFeatureRequest(body = {}) {
  const email = cleanText(body.email, 160).toLowerCase();
  const title = cleanText(body.title, 140);
  const description = cleanText(body.description, 1200);
  const area = cleanText(body.area, 80) || "LRC site";
  const requesterName = cleanText(body.name || body.requesterName, 120);
  const reason = cleanText(body.reason, 700);
  const createdAt = new Date().toISOString();
  const id = `feature-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}-${nodeCrypto.randomBytes(3).toString("hex")}`;

  if (!title || title.length < 4) {
    throw new Error("Feature title is required.");
  }

  if (!description || description.length < 12) {
    throw new Error("Feature details are required.");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email is required.");
  }

  if (body.contactConsent !== true) {
    throw new Error("Contact consent is required.");
  }

  return {
    id,
    createdAt,
    updatedAt: createdAt,
    title,
    area,
    description,
    reason,
    requesterName,
    email,
    status: "requested",
    statusLabel: featureStatusLabel("requested"),
    nextAction: FEATURE_NEXT_ACTIONS.requested,
    guardrail: "Admin approval is required before creation, deploy approval is required before deployment, and no public change happens from the public request form.",
    approvalRequired: true,
    approvalCategory: "feature approval",
    buildPacket: buildFeaturePacket({ title, area, description, reason }),
    approvalLog: [
      {
        at: createdAt,
        status: "requested",
        note: "Feature request submitted by public form. Awaiting admin build approval.",
      },
    ],
  };
}

async function saveFeatureRequest(featureRequest) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(FEATURE_REQUESTS_FILE, `${JSON.stringify(featureRequest)}\n`, "utf8");
}

async function updateFeatureRequestStatus(id, body = {}) {
  const featureId = cleanText(id, 120);
  const nextStatus = normalizeFeatureStatus(body.status);
  if (!featureId || !nextStatus) {
    throw new Error("A valid feature id and status are required.");
  }

  const records = await readJsonLines(FEATURE_REQUESTS_FILE);
  const index = records.findIndex((record) => record.id === featureId);
  if (index < 0) {
    throw new Error("Feature request was not found.");
  }

  const current = records[index];
  const currentStatus = normalizeFeatureStatus(current.status) || "requested";
  const expected = nextFeatureStatus(currentStatus);
  if (!expected) {
    throw new Error("Feature request is already complete.");
  }
  if (expected && nextStatus !== expected) {
    throw new Error(`Next allowed status is ${featureStatusLabel(expected)}.`);
  }

  const updatedAt = new Date().toISOString();
  const note = cleanText(body.note, 500) || FEATURE_NEXT_ACTIONS[nextStatus] || "Status updated by admin.";
  const approvalLog = Array.isArray(current.approvalLog) ? current.approvalLog : [];
  records[index] = {
    ...current,
    statusPrevious: current.status || currentStatus,
    status: nextStatus,
    statusLabel: featureStatusLabel(nextStatus),
    updatedAt,
    nextAction: FEATURE_NEXT_ACTIONS[nextStatus] || "",
    approvalRequired: nextStatus !== "deployed",
    approvalCategory: nextStatus === "approved_for_deploy" ? "deployment approval" : "feature approval",
    buildPacket: current.buildPacket || buildFeaturePacket(current),
    approvalLog: [
      ...approvalLog,
      {
        at: updatedAt,
        status: nextStatus,
        note,
      },
    ],
  };

  await writeJsonLines(FEATURE_REQUESTS_FILE, records);
  return records[index];
}

const roadmapModules = [
  {
    title: "Explore the idea",
    outcome: "Clarify the customer, offer, first version, and whether the idea is ready to become a business.",
  },
  {
    title: "Shape the LLC review",
    outcome: "Organize owner structure, state focus, name readiness, service clarity, and open questions.",
  },
  {
    title: "Prepare the setup file",
    outcome: "Collect practical details, records, documents, and decisions before official or professional action.",
  },
  {
    title: "Build the operating layer",
    outcome: "Create checklists, intake notes, customer replies, review habits, and AI-assisted support systems.",
  },
  {
    title: "Branch into the next tool",
    outcome: "Move into hiring, communication review, recovery support, or custom build help when the need is clear.",
  },
];

const branchTools = [
  {
    title: "JobsAI.",
    outcome: "Use when the next step is hiring, role clarity, applicant flow, or resume/profile support.",
  },
  {
    title: "LRC Conversation Clarity",
    outcome: "Use when the next step is reviewing communication, timing gaps, solution paths, or long conversation threads.",
  },
  {
    title: "LRC Property LLC",
    outcome: "Use when the next step is broader build help, custom tool planning, or routing an idea that does not fit one product yet.",
  },
];

const pathwayDetails = {
  "formation-file": {
    package: "Formation File pathway",
    price: "$19 to $49",
    step: "Build the private formation file: official-record checklist, mission, owner expectations, first offer, and review notes.",
  },
  "launch-page": {
    package: "Launch Checklist pathway",
    price: "$99 to $249",
    step: "Build the public launch page: domain route, offer page, lead form, trust pages, and go-live checklist.",
  },
  "revenue-motion": {
    package: "Revenue Motion pathway",
    price: "Scoped from $5,000",
    step: "Build the revenue motion: offer language, first campaign copy, follow-up sequence, referral ask, and weekly pipeline review.",
  },
  "publishing-system": {
    package: "Publishing System pathway",
    price: "Scoped from $6,500",
    step: "Build the publishing system: content pillars, approval checklist, channel calendar, asset tracker, and post-publish review.",
  },
  "ai-operations": {
    package: "AI Operations pathway",
    price: "$99 to $249",
    step: "Build the AI operations layer: intake prompts, lead summaries, content refresh, decision log, and weekly founder review.",
  },
  "full-buildout": {
    package: "Done-With-You Buildout",
    price: "$500+",
    step: "Build the full system: formation file, launch page, revenue motion, publishing system, admin path, AI drivers, and first proof review.",
  },
};

function normalizeOfficialRecords(body) {
  return {
    legalName: cleanText(body.legalName, 160),
    stateEntityId: cleanText(body.stateEntityId, 80),
    formationDate: cleanText(body.formationDate, 20),
    articlesStatus: cleanText(body.articlesStatus, 80),
    articlesReference: cleanText(body.articlesReference, 420),
    einStatus: cleanText(body.einStatus, 80),
    einReference: cleanText(body.einReference, 80),
    copyrightPlan: cleanText(body.copyrightPlan, 120),
    trademarkPlan: cleanText(body.trademarkPlan, 120),
    missionStatement: cleanText(body.missionStatement, 520),
    officialPrivateNotes: cleanText(body.officialPrivateNotes, 520),
  };
}

function normalizeFormedIntake(body) {
  if (body.storageConsent !== true) {
    throw new Error("Review submission consent is required.");
  }

  const stage = cleanText(body.stage, 80) || "idea";
  const state = cleanText(body.state, 80) || "California";
  const owners = cleanText(body.owners, 80) || "unknown";
  const pathway = cleanText(body.pathway, 80);
  const selectedPathway = pathwayDetails[pathway];
  const officialRecords = normalizeOfficialRecords(body);
  const flags = {
    hasName: body.hasName === true,
    hasOffer: body.hasOffer === true,
    needsDocuments: body.needsDocuments === true,
    wantsAi: body.wantsAi === true,
    needsWebsite: body.needsWebsite === true,
    needsPromotion: body.needsPromotion === true,
  };
  const nextSteps = [];

  if (!flags.hasOffer) nextSteps.push("Clarify the first customer, first offer, and first useful outcome.");
  if (!flags.hasName) nextSteps.push("Prepare one preferred business name and at least two backup names before official checks.");
  nextSteps.push(`Confirm jurisdiction-specific requirements for ${state} before any filing decision.`);
  if (owners !== "one") nextSteps.push("Write down owner roles, decision rights, and contribution expectations.");
  if (flags.needsDocuments) nextSteps.push("Create a document packet for formation details, operating rules, and launch records.");
  if (officialRecords.legalName || officialRecords.articlesStatus || officialRecords.einStatus) {
    nextSteps.push("Keep legal name, filing references, formation document status, and tax ID reference in the private admin record only.");
  }
  if (officialRecords.articlesStatus && officialRecords.articlesStatus !== "filed") {
    nextSteps.push("Resolve the formation document status before relying on the setup file.");
  }
  if (officialRecords.einStatus && officialRecords.einStatus !== "received") {
    nextSteps.push("Confirm the tax ID path with the relevant tax authority or qualified tax support before payroll, banking, or tax use.");
  }
  if (officialRecords.copyrightPlan || officialRecords.trademarkPlan) {
    nextSteps.push("Separate copyright notice, owned content tracking, trademark clearance, and professional IP review from general launch copy.");
  }
  if (officialRecords.missionStatement) {
    nextSteps.push("Turn the mission statement into homepage positioning, internal decision language, and first promotion copy.");
  }
  if (flags.needsWebsite) nextSteps.push("Map the domain, canonical website path, lead form, trust pages, and first service page.");
  if (flags.needsPromotion) nextSteps.push("Prepare launch copy, first-channel promotion, follow-up notes, and a simple campaign calendar.");
  if (flags.needsWebsite || flags.needsPromotion) nextSteps.push("Capture a true founder-pilot note or first customer testimonial after the launch is live.");
  if (flags.wantsAi) nextSteps.push("Add AI-assisted templates only after the business basics are clear.");
  if (selectedPathway) nextSteps.unshift(selectedPathway.step);

  const recommendedPackage = selectedPathway?.package || (flags.needsWebsite || flags.needsPromotion
    ? "Launch buildout package"
    : flags.needsDocuments || flags.wantsAi || stage === "ready"
      ? "Premium setup package"
      : "Foundation formation package");

  return {
    createdAt: new Date().toISOString(),
    requester: {
      name: cleanText(body.name, 120),
      email: cleanText(body.email, 160),
      businessName: cleanText(body.businessName, 160),
      businessIdea: cleanText(body.businessIdea, 360),
      firstCustomer: cleanText(body.firstCustomer, 360),
      mainOffer: cleanText(body.mainOffer, 420),
      biggestBlocker: cleanText(body.biggestBlocker, 420),
      existingWebsite: cleanText(body.existingWebsite, 180),
      desiredNextStep: cleanText(body.desiredNextStep, 160),
      budgetRange: cleanText(body.budgetRange, 80),
      timeline: cleanText(body.timeline, 80),
    },
    stage,
    state,
    owners,
    pathway,
    storageConsent: true,
    ...flags,
    summary: selectedPathway
      ? "Your review is organized into a definite Formed. pathway with a concrete deliverable, review condition, and next build action."
      : "Your review is organized around idea clarity, entity readiness, official setup, public launch, and the operating layer that comes after formation.",
    recommendedPackage,
    priceRange: {
      "Formation File pathway": "$19 to $49",
      "Launch Checklist pathway": "$99 to $249",
      "Revenue Motion pathway": "Scoped from $5,000",
      "Publishing System pathway": "Scoped from $6,500",
      "AI Operations pathway": "$99 to $249",
      "Done-With-You Buildout": "$500+",
      "Launch buildout package": "$99 to $249",
      "Premium setup package": "$99 to $249",
      "Foundation formation package": "$19 to $49",
    }[recommendedPackage],
    nextSteps,
    teachingPath: roadmapModules,
    branchTools,
    documentsToPrepare: [
      "Business name ideas",
      "Owner, member, director, or partner details",
      "Business purpose and offer summary",
      "Registered agent and address details",
      "Formation document private file reference",
      "Tax ID confirmation stored outside public copy",
      "Copyright notice and owned-content list",
      "Trademark clearance or review notes",
      "Mission statement and brand-use notes",
      "Operating rules or owner expectations",
      "Domain, website, and promotion notes",
      "Publishing calendar, content approvals, and asset inventory",
      "Launch checklist and recordkeeping plan",
    ],
    officialRecords,
    cautions: [
      "Formed. does not file documents or make official decisions from this preview.",
      "Government fees, jurisdiction taxes, hosting, domains, software, ads, and professional services are separate from Formed. service pricing unless included in a written scope.",
      "Review official sources and qualified professionals before taking legal, tax, or financial action.",
    ],
  };
}

function flattenForExport(record = {}) {
  return {
    createdAt: record.createdAt || "",
    visitorId: record.visitorId || "",
    sessionId: record.sessionId || "",
    method: record.method || "",
    host: record.host || "",
    path: record.path || "",
    search: record.search || "",
    status: record.status || "",
    kind: record.kind || "",
    country: record.country || "",
    ip: record.ip || "",
    userAgent: record.userAgent || "",
    referrer: record.referrer || "",
    durationMs: record.durationMs || "",
    provider: record.provider || "",
    paymentStatus: record.paymentStatus || "",
    amountTotal: record.amountTotal || "",
    currency: record.currency || "",
    source: record.source || "",
    toolInterest: record.toolInterest || "",
    name: record.name || "",
    email: record.email || "",
    stage: record.stage || "",
    state: record.state || "",
    owners: record.owners || "",
    pathway: record.pathway || "",
    topic: record.topic || "",
    recommendedPackage: record.recommendedPackage || "",
    priceRange: record.priceRange || "",
    message: record.message || record.summary || "",
    site: record.site || record.payload?.site || "",
    mode: record.mode || "",
    agent: record.agent || record.payload?.agent || "",
    assetType: record.assetType || "",
    actionType: record.actionType || record.payload?.actionType || record.policy?.actionType || "",
    target: record.target || record.payload?.target || "",
    form: record.form || "",
    filled: Array.isArray(record.filled) ? record.filled.join("; ") : "",
    safeSubmit: record.safeSubmit ?? "",
    boundary: record.boundary || record.policy?.decision || "",
    href: record.href || "",
    goal: record.goal || record.payload?.prompt || "",
    assignedAgent: record.assignedAgent || "",
    assignedSite: record.assignedSite || "",
    blocker: record.blocker || "",
    approvalRequired: record.approvalRequired ?? record.policy?.approvalRequired ?? "",
    approvalCategory: record.approvalCategory || record.policy?.approvalCategory || "",
    nextAction: record.nextAction || "",
    guardrail: record.guardrail || "",
    id: record.id || "",
    riskLevel: record.policy?.riskLevel || "",
    outcome: record.policy?.outcome || "",
    payloadHash: record.payloadHash || "",
    ownerReview: record.ownerReview || "",
    title: record.title || "",
    area: record.area || "",
    description: record.description || "",
    reason: record.reason || "",
    requesterName: record.requesterName || "",
    statusLabel: record.statusLabel || "",
    userStory: record.buildPacket?.userStory || "",
    buildBrief: record.buildPacket?.buildBrief || "",
    deployGuardrail: record.buildPacket?.deployGuardrail || "",
    entityId: record.entityId || record.id || "",
    entityType: record.entityType || "",
    eventType: record.eventType || "",
    selectedCategory: record.selectedCategory || record.category || record.recommendation?.matchingSignals?.category || "",
    requestedAction: record.requestedAction || "",
    humanApprovalRequired: record.humanApprovalRequired ?? "",
    externalActionTaken: record.externalActionTaken ?? "",
    firstOffer: record.operationalData?.firstOffer || "",
    targetCustomer: record.operationalData?.targetCustomer || "",
    positioning: record.operationalData?.positioning || "",
    recommendation: record.recommendation?.nextBestStep || "",
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(records) {
  const headers = [
    "createdAt",
    "visitorId",
    "sessionId",
    "method",
    "host",
    "path",
    "search",
    "status",
    "kind",
    "country",
    "ip",
    "userAgent",
    "referrer",
    "durationMs",
    "provider",
    "paymentStatus",
    "amountTotal",
    "currency",
    "source",
    "toolInterest",
    "name",
    "email",
    "stage",
    "state",
    "owners",
    "pathway",
    "topic",
    "recommendedPackage",
    "priceRange",
    "message",
    "site",
    "mode",
    "agent",
    "assetType",
    "actionType",
    "target",
    "form",
    "filled",
    "safeSubmit",
    "boundary",
    "href",
    "goal",
    "status",
    "assignedAgent",
    "assignedSite",
    "blocker",
    "approvalRequired",
    "approvalCategory",
    "nextAction",
    "guardrail",
    "id",
    "riskLevel",
    "outcome",
    "payloadHash",
    "ownerReview",
    "title",
    "area",
    "description",
    "reason",
    "requesterName",
    "statusLabel",
    "userStory",
    "buildBrief",
    "deployGuardrail",
    "entityId",
    "entityType",
    "eventType",
    "selectedCategory",
    "requestedAction",
    "humanApprovalRequired",
    "externalActionTaken",
    "firstOffer",
    "targetCustomer",
    "positioning",
    "recommendation",
  ];
  return [
    headers.join(","),
    ...records.map((record) => {
      const flat = flattenForExport(record);
      return headers.map((header) => csvEscape(flat[header])).join(",");
    }),
  ].join("\n");
}

async function getAdminDatasets() {
  const leads = await readJsonLines(LEADS_FILE);
  const formedIntakes = await readJsonLines(FORMED_INTAKES_FILE);
  const traffic = await readJsonLines(TRAFFIC_FILE);
  const agentActivity = await readJsonLines(AGENT_ACTIVITY_FILE);
  const actionRequests = await readJsonLines(AGENT_ACTION_REQUESTS_FILE);
  const payments = await readJsonLines(PAYMENTS_FILE);
  const ninjaTasks = await readJsonLines(NINJA_TASKS_FILE);
  const featureRequests = await readJsonLines(FEATURE_REQUESTS_FILE);
  const entities = await readJsonLines(ENTITIES_FILE);
  const events = await readJsonLines(EVENTS_FILE);
  const recommendations = await readJsonLines(RECOMMENDATIONS_FILE);
  const approvals = await readJsonLines(APPROVALS_FILE);
  const privatePreview = await readJsonLines(PRIVATE_PREVIEW_ACKS_FILE);
  const growth = leads.filter((lead) => isGrowthSignalLead(lead));
  const levi = leads.filter((lead) => isLeviLead(lead));
  const careers = leads.filter((lead) => String(lead.source || "").includes("careers"));
  const requests = leads.filter((lead) => {
    const source = String(lead.source || "");
    return !source.includes("careers") && !isGrowthSignalLead(lead) && !isLeviLead(lead);
  });
  return { leads, requests, growth, levi, careers, formedIntakes, traffic, agentActivity, actionRequests, payments, ninjaTasks, featureRequests, entities, events, recommendations, approvals, privatePreview };
}

function isGrowthSignalLead(lead) {
  const source = String(lead.source || "");
  return source === "lrc-suite-hub" || source === "lrc-growth-hub" || source === "lrc-market-tool";
}

function isLeviLead(lead) {
  return String(lead.source || "").startsWith("levi-");
}

function selectAdminDataset(datasets, type) {
  if (type === "requests") return datasets.requests;
  if (type === "growth") return datasets.growth;
  if (type === "levi") return datasets.levi;
  if (type === "careers") return datasets.careers;
  if (type === "formed") return datasets.formedIntakes;
  if (type === "traffic") return datasets.traffic;
  if (type === "agent-activity") return datasets.agentActivity;
  if (type === "action-requests" || type === "agent-actions") return datasets.actionRequests;
  if (type === "payments") return datasets.payments;
  if (type === "ninja-tasks") return datasets.ninjaTasks;
  if (type === "feature-requests") return datasets.featureRequests;
  if (type === "entities") return datasets.entities;
  if (type === "events") return datasets.events;
  if (type === "recommendations") return datasets.recommendations;
  if (type === "approvals") return datasets.approvals;
  if (type === "private-preview" || type === "private-preview-acknowledgements") return datasets.privatePreview;
  return datasets.leads;
}

const leviAssetProfiles = {
  ninja: {
    agent: "Ninja",
    assetType: "Agent manager plan",
    output: "manage the LRC agent system from a computer-based console, sequence the next steps, assign focused agents, request safe access when needed, and mark approval checkpoints",
    nextSteps: ["Map the finished outcome", "Assign the right focused agents", "Sequence the site and agent steps", "Request only the access needed for the next safe step", "Ask approval questions before guarded actions"],
    ctaLabel: "Open LRC agent map",
    ctaHref: "/#agents",
    action: {
      type: "focus-target",
      target: "#agents",
      safeSubmit: false,
      message: "Opened the LRC agent map. Ninja manages the agent flow, assigns focused agents, requests safe access when needed, and keeps guarded actions approval-gated.",
    },
  },
  home: {
    agent: "LRC Guide",
    assetType: "Cross-site solution map",
    output: "route the need into the right LRC site, product path, useful data signal, and next safe page action",
    nextSteps: ["Name the need", "Create the next product step", "Capture the useful signal"],
    ctaLabel: "Start AI route",
    ctaHref: "#ai-router",
    action: {
      type: "parent-router",
      path: "Not sure yet",
      need: "Route this into the closest LRC workflow and prepare the next safe action.",
    },
  },
  formed: {
    agent: "Founder Build Agent",
    assetType: "Business build path",
    output: "turn the idea into setup, launch, offer, and AI workflow steps",
    nextSteps: ["Name the offer", "Pick the build path", "Open the Formed. builder"],
    ctaLabel: "Open first step",
    ctaHref: "#review",
    action: {
      type: "focus-target",
      target: "#review",
      form: "#formed-intake",
      button: "[data-levi-draft='idea']",
      values: {
        "[name='stage']": "idea",
        "[name='pathway']": "full-buildout",
      },
      message: "Opened Formed. and started the next business build output.",
    },
  },
  jobsai: {
    agent: "Work Match Agent",
    assetType: "Work fit brief",
    output: "turn role or applicant notes into a clearer fit signal",
    nextSteps: ["Name the role or strength", "Separate must-have from teachable", "Open the work path"],
    ctaLabel: "Open work path",
    ctaHref: "#brief",
    action: {
      type: "focus-target",
      target: "#brief",
      form: "#jobsai-intake",
      field: "[name='role']",
      values: {
        "[name='stage']": "Need to define role",
        "[name='needsListing']": true,
        "[name='needsIntake']": true,
      },
      safeSubmit: true,
      message: "Opened JobsAI and started the first work-fit brief.",
    },
  },
  offshoot: {
    agent: "Route Guide Agent",
    assetType: "Solution route",
    output: "turn a rough or stuck idea into a working product path and useful signal",
    nextSteps: ["Name the current goal", "Pick the closest product lane", "Open the solution route"],
    ctaLabel: "Open route tool",
    ctaHref: "#route",
    action: {
      type: "focus-target",
      target: "#route",
      form: ".route-form",
      field: "[name='need']",
      values: {
        "[name='goal']": "offshoot",
        "[name='stage']": "starting",
      },
      safeSubmit: true,
      message: "Opened Off Shoot and started the solution route.",
    },
  },
  socialscan: {
    agent: "Trust Check Agent",
    assetType: "Public trust checklist",
    output: "turn a public profile or presence into the first cleanup step",
    nextSteps: ["Name the profile purpose", "Check the first impression", "Open the trust check"],
    ctaLabel: "Open trust check",
    ctaHref: "#audit",
    action: {
      type: "focus-target",
      target: "#audit",
      form: "#socialscan-form",
      field: "[name='links']",
      values: {
        "[name='goal']": "Look more trustworthy",
        "[name='notes']": "Improve first impression, trust signals, and next cleanup action.",
      },
      message: "Opened SocialScan and started the profile cleanup plan.",
    },
  },
  behappy: {
    agent: "Daily Support Agent",
    assetType: "One-step support plan",
    output: "turn the day into one grounded support step",
    nextSteps: ["Choose one check-in", "Keep real support visible", "Open the daily step"],
    ctaLabel: "Open check-in",
    ctaHref: "#checkin",
    action: {
      type: "focus-target",
      target: "#checkin",
      form: "#behappy-checkin",
      field: "[name='focus']",
      values: {
        "[name='state']": "Not sure yet",
        "[name='feeling'][value='unsure']": true,
        "[name='sobrietyStatus'][value='not-sure']": true,
        "[name='needsRoutine']": true,
      },
      safeSubmit: true,
      message: "Opened Be Happy and started today's support step.",
    },
  },
  careers: {
    agent: "Applicant Fit Agent",
    assetType: "Applicant fit summary",
    output: "turn strengths and proof into a cleaner application note",
    nextSteps: ["Name the proof", "Connect it to the role", "Open the application"],
    ctaLabel: "Open application",
    ctaHref: "#apply",
    action: {
      type: "focus-target",
      target: "#apply",
      form: "#lead-form",
      field: "[name='message']",
      message: "Opened Careers and started the applicant note.",
    },
  },
};

const ninjaApprovalQuestions = [
  "Do you approve creating or entering any payment, refund, cancellation, subscription, or purchase action?",
  "Do you approve deleting or permanently changing any local, Cloudflare, Stripe, lead, payment, or admin record?",
  "Do you approve sending, submitting, publishing, filing, uploading, messaging, booking, or changing access?",
  "Do you approve transmitting the specific sensitive data to the specific destination needed for this step?",
];

function wantsNinjaAgent(prompt = "") {
  const lower = String(prompt || "").toLowerCase();
  return [
    "ninja",
    "overall flow",
    "broad view",
    "all sites",
    "across sites",
    "site ecosystem",
    "organize overall",
    "overall steps",
    "general over all",
  ].some((term) => lower.includes(term));
}

function buildNinjaAgentAsset(site, mode, prompt) {
  const routes = inferLeviRoutes(prompt, site);
  return {
    ok: true,
    blocked: false,
    site,
    mode,
    agent: "Ninja",
    assetType: "Agent manager plan",
    summary:
      "Ninja is the manager of the LRC agents. From a computer-based console, it coordinates products, focused agents, tasks, approvals, and deployment steps. It can sequence work, assign the right focused agent, and request additional access when the next safe step needs it, then stops to ask explicit approval questions before guarded actions.",
    nextSteps: [
      "Define the finished product or operational outcome.",
      "Choose which focused agent owns each step.",
      "Track agent status, blocker, reason, and approval gate.",
      "Request only the browser, computer, Codex, or account access needed for the next safe step.",
      "Prepare safe drafts, checks, routes, and diagnostics first.",
      "Ask approval before any transaction, deletion, submission, publishing, filing, upload, message, booking, account access, or sensitive-data transmission.",
    ],
    routes,
    solutionPath:
      "Ninja works as the manager above Levi and the focused agents from the desktop console: it turns the full goal into an ordered flow, assigns work to the correct product agent, keeps the current blocker visible, requests scoped access when safe, and identifies which steps require explicit owner approval before action.",
    guardrail:
      "Ninja follows the same guardrails as Levi and Impecable, asks more approval questions before high-risk actions, requests scoped access for guarded steps, and logs the result after approved actions.",
    approvalQuestions: ninjaApprovalQuestions,
    ctaLabel: "Open agent map",
    ctaHref: "/#agents",
    action: leviAssetProfiles.ninja.action,
  };
}

const leviRouteCatalog = {
  formed: {
    label: "Formed.",
    agent: "Founder Build Agent",
    href: "/formed/#review",
    outcome: "Business build path",
    reason: "Use when the need is setup, launch, offer clarity, website, tax-preparer matching, operations, structure, or AI buildout.",
    terms: ["business", "start a business", "need structure", "structure", "idea", "llc", "formed", "formation", "launch", "offer", "website", "domain", "founder", "startup", "company", "tax", "taxes", "tax prep", "tax preparer", "preparer", "bookkeeping", "accountant", "accounting", "payroll", "1099"],
  },
  jobsai: {
    label: "JobsAI",
    agent: "Work Match Agent",
    href: "/jobsai/#brief",
    outcome: "Work fit brief",
    reason: "Use when the need is hiring, roles, applicants, resumes, profiles, or work fit.",
    terms: ["job", "jobs", "hiring", "hire", "resume", "applicant", "role", "work", "career", "employee", "candidate"],
  },
  market: {
    label: "Untapped",
    agent: "Market Signal Agent",
    href: "/#untapped-markets",
    outcome: "Market lane",
    reason: "Use when the need is audience, demand, customer gaps, validation, niche, or first offer testing.",
    terms: ["market", "audience", "demand", "untapped", "customer", "lane", "niche", "validate", "validation", "gap"],
  },
  socialscan: {
    label: "SocialScan",
    agent: "Trust Check Agent",
    href: "/socialscan/#audit",
    outcome: "Trust cleanup",
    reason: "Use when the need is profile, brand, public trust, social presence, bio, content, or outreach readiness.",
    terms: ["profile", "trust", "social", "linkedin", "brand", "public", "bio", "content", "presence", "outreach"],
  },
  offshoot: {
    label: "Off Shoot",
    agent: "Route Guide Agent",
    href: "/offshoot/#route",
    outcome: "Solution route",
    reason: "Use when the need is rough, stalled, custom, early, or split across more than one product.",
    terms: ["stuck", "route", "custom", "workflow", "not sure", "confused", "where", "stalled"],
  },
  behappy: {
    label: "Be Happy",
    agent: "Daily Support Agent",
    href: "/behappy/#checkin",
    outcome: "Small support step",
    reason: "Use when the need is daily support, routine, resource-first progress, check-ins, or recovery-friendly next steps.",
    terms: ["daily", "recovery", "support", "meeting", "routine", "happy", "check-in", "checkin", "resource", "habit"],
  },
  conversation: {
    label: "Conversation Clarity",
    agent: "Conversation Review Agent",
    href: "/#paywall",
    outcome: "Conversation preview",
    reason: "Use when the need is message timing, gaps, shifts, chronology, or a full conversation report.",
    terms: ["conversation", "message", "messages", "text", "thread", "chat", "timing", "gap", "gaps", "shift", "chronology", "report", "clarity"],
  },
  checkout: {
    label: "Checkout",
    agent: "Impecable",
    href: "/#paywall",
    outcome: "Payment readiness",
    reason: "Use when the need is Stripe, payment hold, Cloudflare payment secrets, launch-day payment checks, or no-payment confirmation.",
    terms: ["checkout", "stripe", "payment", "payments", "price", "webhook", "secret key", "cloudflare", "payment hold", "no payment"],
  },
  admin: {
    label: "Admin",
    agent: "Ninja",
    href: "/admin/",
    outcome: "Admin review",
    reason: "Use when the need is leads, task status, activity, approvals, payment records, diagnostics, or review queue.",
    terms: ["admin", "activity", "approval", "approvals", "status", "task", "tasks", "diagnostic", "review queue", "records"],
  },
  careers: {
    label: "Careers",
    agent: "Applicant Fit Agent",
    href: "/careers/#apply",
    outcome: "Applicant fit note",
    reason: "Use when the need is applying directly to LRC or making proof easier to use for an open role.",
    terms: ["apply", "application", "assistant", "career", "proof", "interview", "opening"],
  },
};

const leviSiteRouteKey = {
  formed: "formed",
  jobsai: "jobsai",
  offshoot: "offshoot",
  socialscan: "socialscan",
  behappy: "behappy",
  careers: "careers",
};

function inferLeviRoutes(prompt = "", site = "home") {
  const lower = String(prompt || "").toLowerCase();
  const currentRouteKey = leviSiteRouteKey[site] || null;
  return Object.entries(leviRouteCatalog)
    .map(([key, route]) => {
      const termScore = route.terms.reduce((score, term) => score + (lower.includes(term) ? 3 : 0), 0);
      const currentScore = key === currentRouteKey ? 2 : 0;
      const fallbackScore = !lower && key === currentRouteKey ? 5 : 0;
      const routeFallback = !lower && key === "offshoot" && site !== "offshoot" ? 1 : 0;
      return { key, route, score: termScore + currentScore + fallbackScore + routeFallback };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ key, route }) => ({
      key,
      label: route.label,
      agent: route.agent,
      outcome: route.outcome,
      reason: route.reason,
      href: route.href,
    }));
}

const leviPageAnswers = {
  home: {
    summary: "This is the LRC front door. Levi can explain the ecosystem, route an idea into the right product, and capture useful non-sensitive signals that improve the tools.",
    nextSteps: ["Ask the plain question", "Pick the closest product path", "Use the matching tool first"],
  },
  formed: {
    summary: "Formed. helps founders move from a rough idea into a business build path: setup, launch page, offer, operations, and AI-supported workflow.",
    nextSteps: ["Name the business stage", "Choose the build path", "Create the next founder output"],
  },
  jobsai: {
    summary: "JobsAI turns role, hiring, resume, and applicant notes into clearer work-fit signals and next-step briefs.",
    nextSteps: ["Name the role or strength", "Separate must-have from teachable", "Create the first fit brief"],
  },
  offshoot: {
    summary: "Off Shoot routes rough ideas, stalled projects, and split needs into the closest LRC solution instead of making contact the main step.",
    nextSteps: ["Describe the stuck point", "Choose the closest lane", "Open the matching solution"],
  },
  socialscan: {
    summary: "SocialScan turns public links or notes you have the right to use into a practical profile cleanup and trust signal plan.",
    nextSteps: ["Name the public profile purpose", "Check the first impression", "Create the cleanup step"],
  },
  behappy: {
    summary: "Be Happy keeps the next support step small, resource-first, and grounded without replacing real care.",
    nextSteps: ["Choose one check-in", "Keep support visible", "Take the smallest safe step"],
  },
  careers: {
    summary: "The careers page helps applicants make proof, availability, and role fit easier for LRC to understand.",
    nextSteps: ["Name the proof", "Connect it to the role", "Prepare the application note"],
  },
};

function isGeneralLeviQuestion(prompt = "") {
  const lower = String(prompt || "").toLowerCase().trim();
  if (!lower) return false;
  return [
    "what is",
    "what does",
    "what can",
    "how do",
    "how does",
    "how can",
    "explain",
    "who are you",
    "what are you",
    "what is this page",
    "what does this page",
    "pricing",
    "price",
    "cost",
    "privacy",
    "terms",
    "help me understand",
  ].some((term) => lower.includes(term));
}

function buildGeneralLeviAnswer(site, mode, prompt) {
  const profile = leviAssetProfiles[site] || leviAssetProfiles.home;
  const answer = leviPageAnswers[site] || leviPageAnswers.home;
  return {
    ok: true,
    blocked: false,
    site,
    mode,
    agent: "Levi",
    assetType: "Page answer",
    summary: answer.summary,
    nextSteps: answer.nextSteps,
    routes: inferLeviRoutes(prompt, site),
    solutionPath:
      "Levi can answer general questions on this page, explain the nearby tools, suggest a product route, and collect useful non-sensitive signals only when it improves your experience.",
    guardrail: "Use approved access only. Approval before guarded action. You stay in control.",
    ctaLabel: profile.ctaLabel,
    ctaHref: profile.ctaHref,
    action: profile.action || null,
  };
}

function inferHomeLeviProfile(prompt = "") {
  const lower = String(prompt || "").toLowerCase();
  const matches = (terms) => terms.some((term) => lower.includes(term));

  if (matches(["bookkeeping", "bookkeeper", "books", "receipts", "expense", "expenses", "invoice", "invoices", "accountant", "accounting"])) {
    return {
      agent: "Founder Build Agent",
      assetType: "Bookkeeping setup route",
      output: "route this into Formed. so the founder can build a bookkeeping setup packet before any handoff or account access",
      nextSteps: ["Open Formed", "Build the bookkeeping setup packet", "Request bookkeeping setup only after review"],
      ctaLabel: "Open bookkeeping setup",
      ctaHref: "/formed/#formed-start",
      action: {
        type: "parent-router",
        path: "Bookkeeping setup",
        audience: "Founders who need clean records and review-ready bookkeeping organization",
        need: "Shape the records checklist, category map, monthly cadence, and approval-based handoff questions.",
      },
    };
  }

  if (matches(["tax", "taxes", "tax prep", "tax preparer", "preparer", "payroll", "1099"])) {
    return {
      agent: "Founder Build Agent",
      assetType: "Tax-preparer match route",
      output: "route this into Formed. so the founder can build a tax-preparer match packet before any referral or message",
      nextSteps: ["Open Founder Tax Match", "Build the local match packet", "Send to LRC only with founder consent"],
      ctaLabel: "Open tax match",
      ctaHref: "/formed/#tax-match",
      action: {
        type: "parent-router",
        path: "Founder tax match",
        audience: "LLC founders who need qualified tax-preparer fit",
        need: "Shape the tax-preparer match packet, records checklist, questions, and consent-based handoff.",
      },
    };
  }

  if (matches(["business", "start a business", "need structure", "structure", "llc", "formed", "formation", "launch", "offer", "website", "domain"])) {
    return {
      agent: "Founder Build Agent",
      assetType: "Business build route",
      output: "route this into Formed. with a starter structure, Ninja continuity, and a secure checkout hold before any payment",
      nextSteps: ["Review the starter structure", "Continue in Formed", "Keep checkout behind owner approval"],
      ctaLabel: "Continue in Formed",
      ctaHref: "/formed/#review",
      action: {
        type: "parent-router",
        path: "Business formation",
        audience: "new founders or business owners",
        need: "Shape the setup, offer, launch page, AI operations path, and owner-approved checkout handoff.",
      },
    };
  }

  if (matches(["job", "hiring", "hire", "resume", "applicant", "role", "work", "career"])) {
    return {
      agent: "Work Match Agent",
      assetType: "Work route",
      output: "route this into JobsAI so the role, applicant, or work signal becomes easier to use",
      nextSteps: ["Open JobsAI", "Name the role or strength", "Create the first fit brief"],
      ctaLabel: "Open JobsAI",
      ctaHref: "/jobsai/#brief",
      action: {
        type: "parent-router",
        path: "Hiring or jobs",
        audience: "founders, applicants, or hiring teams",
        need: "Clarify the role, applicant signal, or work-match path.",
      },
    };
  }

  if (matches(["market", "audience", "demand", "untapped", "customer", "lane", "niche"])) {
    return {
      agent: "Market Signal Agent",
      assetType: "Market route",
      output: "route this into Untapped Market Finder so the audience, gap, and first offer can be tested",
      nextSteps: ["Open the market tool", "Name the audience", "Find the first testable lane"],
      ctaLabel: "Find market lane",
      ctaHref: "/#untapped-markets",
      action: {
        type: "parent-router",
        path: "Market or audience test",
        audience: "a specific audience worth testing",
        need: "Find the underserved gap, first offer, and testable market lane.",
      },
    };
  }

  if (matches(["profile", "trust", "social", "linkedin", "brand", "public", "bio", "content"])) {
    return {
      agent: "Trust Check Agent",
      assetType: "Trust route",
      output: "route this into SocialScan so the public presence has a clear first cleanup step",
      nextSteps: ["Open SocialScan", "Check the first impression", "Prepare the first cleanup action"],
      ctaLabel: "Open SocialScan",
      ctaHref: "/socialscan/#audit",
      action: {
        type: "parent-router",
        path: "Public trust or profile cleanup",
        audience: "you when you are improving a public profile or brand",
        need: "Improve the first impression, trust signal, and cleanup path.",
      },
    };
  }

  if (matches(["stuck", "route", "custom", "workflow", "not sure", "confused", "idea", "where"])) {
    return {
      agent: "Route Guide Agent",
      assetType: "Route recommendation",
      output: "route this through Off Shoot so the rough need becomes the next closest LRC path",
      nextSteps: ["Open Route Guide", "Pick the closest lane", "Create the working solution path"],
      ctaLabel: "Open Route Guide",
      ctaHref: "/offshoot/#route",
      action: {
        type: "parent-router",
        path: "Custom route or stalled idea",
        audience: "you when you have a rough or stuck idea",
        need: "Find the closest LRC lane before building more.",
      },
    };
  }

  if (matches(["daily", "recovery", "support", "meeting", "routine", "happy", "check-in", "checkin"])) {
    return {
      agent: "Daily Support Agent",
      assetType: "Daily support route",
      output: "route this into Be Happy so the need becomes one small support step",
      nextSteps: ["Open Be Happy", "Start the check-in", "Choose one support action"],
      ctaLabel: "Open Be Happy",
      ctaHref: "/behappy/#checkin",
      action: {
        type: "parent-router",
        path: "Recovery or daily support",
        audience: "you when you need one steady support step",
        need: "Keep the next step small, resource-first, and human-supported.",
      },
    };
  }

  if (matches(["conversation", "messages", "message", "text", "thread", "chat", "timing", "gaps", "gap", "shift", "chronology", "report", "clarity"])) {
    return {
      agent: "Conversation Review Agent",
      assetType: "Conversation preview route",
      output: "open Conversation Clarity so you can review timing, gaps, shifts, and chronology before any full-report unlock",
      nextSteps: ["Open Conversation Clarity", "Review the preview", "Unlock the full report only if you choose"],
      ctaLabel: "Open Conversation Clarity",
      ctaHref: "/#paywall",
      action: {
        type: "parent-router",
        path: "Conversation analysis",
        audience: "you when you need communication timing and chronology clarity",
        need: "Review timing, gaps, shifts, and chronology without guessing intent.",
      },
    };
  }

  return leviAssetProfiles.home;
}

function buildLeviAgentAsset(body = {}) {
  const site = cleanText(body.site, 40) || "home";
  const prompt = cleanText(body.prompt, 500);
  const mode = cleanText(body.mode, 30) || "guide";
  const profile = site === "home" ? inferHomeLeviProfile(prompt) : leviAssetProfiles[site] || leviAssetProfiles.home;
  const lower = prompt.toLowerCase();
  const hasSensitiveHint = ["password", "ssn", "social security", "bank", "full ein", "medical record", "card number"].some((term) => lower.includes(term));
  const hasBlockedAccessHint = ["paywall", "bypass", "get around", "without approval"].some((term) => lower.includes(term));

  if (hasSensitiveHint) {
    return {
      ok: true,
      blocked: true,
      site,
      agent: profile.agent,
      assetType: profile.assetType,
      summary: "Keep secrets and sensitive records out of this box. Levi can still organize the next safe step with a plain-language goal.",
      nextSteps: ["Remove sensitive details", "Describe the goal in plain words", "Use qualified human support for serious decisions"],
      routes: inferLeviRoutes(prompt, site),
      guardrail: "Use approved access only. Approval before guarded action. You stay in control.",
    };
  }

  if (hasBlockedAccessHint) {
    return {
      ok: true,
      blocked: true,
      site,
      agent: profile.agent,
      assetType: profile.assetType,
      summary: "Levi can plan, draft, and organize the next step using public or approved access, then request scoped approval for any guarded action.",
      nextSteps: ["Use public or approved sources", "Draft the next step", "Request scoped approval before anything is submitted, sent, published, purchased, or changed"],
      routes: inferLeviRoutes(prompt, site),
      guardrail: "Use approved access only. Approval before guarded action. You stay in control.",
    };
  }

  if (wantsNinjaAgent(prompt)) {
    return buildNinjaAgentAsset(site, mode, prompt);
  }

  if (isGeneralLeviQuestion(prompt)) {
    return buildGeneralLeviAnswer(site, mode, prompt);
  }

  const startingPoint = prompt || "Start";
  return {
    ok: true,
    blocked: false,
    site,
    mode,
    agent: profile.agent,
    assetType: profile.assetType,
    summary: site === "home"
      ? `Best match: ${profile.agent}. I can ${profile.output} for you.`
      : `I can ${profile.output} for you. Starting point: ${startingPoint}.`,
    nextSteps: profile.nextSteps,
    routes: inferLeviRoutes(prompt, site),
    solutionPath: `Levi can recommend along the way, adapt to your know-how, motivate progress toward the end goal, draft, organize, connect tasks and functions, collect useful non-sensitive signals, suggest cross-site solution paths, and prepare this as a ${profile.assetType.toLowerCase()} for you. It works the safe parts first, then requests scoped approval before anything is submitted, sent, filed, published, purchased, or access is changed.`,
    guardrail: "Use approved access only. Approval before guarded action. You stay in control.",
    ctaLabel: profile.ctaLabel,
    ctaHref: profile.ctaHref,
    action: profile.action || null,
  };
}

app.post("/api/lead", async (req, res) => {
  try {
    const lead = normalizeLead(req.body || {});
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(LEADS_FILE, `${JSON.stringify(lead)}\n`, "utf8");
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Lead could not be saved.",
    });
  }
});

app.post("/api/private-preview/acknowledgement", async (req, res) => {
  try {
    const { record, preview } = buildPrivatePreviewAcknowledgement(req.body || {}, req);
    await appendJsonLine(PRIVATE_PREVIEW_ACKS_FILE, record);
    res.status(201).json({ ok: true, stored: true, acknowledgementId: record.id, preview });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      ok: false,
      error: error.message || "Private preview acknowledgement could not be recorded.",
    });
  }
});

app.post("/api/feature-requests", async (req, res) => {
  try {
    const featureRequest = buildFeatureRequest(req.body || {});
    await saveFeatureRequest(featureRequest);
    res.status(201).json({ ok: true, featureRequest });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Feature request could not be saved.",
    });
  }
});

app.get("/api/entities", (_req, res) => {
  res.json({
    ok: true,
    endpoint: "/api/entities",
    mode: "structured-founder-data",
    rawSensitiveContentStored: false,
  });
});

app.post("/api/entities", async (req, res) => {
  try {
    const entity = normalizeEntityRecord(req.body || {});
    await appendJsonLine(ENTITIES_FILE, entity);
    res.status(201).json({ ok: true, stored: true, entity });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Entity could not be saved.",
    });
  }
});

app.get("/api/events", (_req, res) => {
  res.json({
    ok: true,
    endpoint: "/api/events",
    mode: "metadata-only",
    rawSensitiveContentStored: false,
  });
});

app.post("/api/events", async (req, res) => {
  try {
    const event = normalizeEntityEvent(req.body || {});
    await appendJsonLine(EVENTS_FILE, event);
    res.status(201).json({ ok: true, stored: true, event });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Event could not be saved.",
    });
  }
});

app.get("/api/recommendations", (_req, res) => {
  res.json({
    ok: true,
    endpoint: "/api/recommendations",
    mode: "formed-v1",
  });
});

app.post("/api/recommendations", async (req, res) => {
  try {
    const recommendation = normalizeRecommendationRecord(req.body || {});
    await appendJsonLine(RECOMMENDATIONS_FILE, recommendation);
    res.status(201).json({ ok: true, stored: true, recommendation });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Recommendation could not be created.",
    });
  }
});

app.get("/api/approvals", (_req, res) => {
  res.json({
    ok: true,
    endpoint: "/api/approvals",
    mode: "approval-safe-hold",
    externalActionTaken: false,
  });
});

app.post("/api/approvals", async (req, res) => {
  try {
    const approval = normalizeApprovalRecord(req.body || {}, await verifiedCheckoutStatus());
    await appendJsonLine(APPROVALS_FILE, approval);
    res.status(201).json({ ok: true, stored: true, approval });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Approval request could not be saved.",
    });
  }
});

app.get("/api/agent", (_req, res) => {
  res.json({ ok: true, endpoint: "/api/agent" });
});

app.get("/api/agent/policy", (_req, res) => {
  res.json(agentPolicyManifest());
});

app.get("/run-agent", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.send(workMatchPageHtml());
});

app.post("/run-agent", (req, res) => {
  const input = cleanText(req.body?.input, 700);
  if (!input || input.length < 3) {
    res.json({ error: "Input too short" });
    return;
  }

  res.json(runWorkMatchAgent(input));
});

app.get("/api/checkout-status", async (_req, res) => {
  res.json(await verifiedCheckoutStatus());
});

app.get("/api/checkout-session", async (req, res) => {
  try {
    const result = await retrieveCheckoutSession(req.query.session_id);
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(502).json({
      ok: false,
      verified: false,
      error: error.message || "Checkout session could not be verified.",
    });
  }
});

app.post("/api/agent", (req, res) => {
  res.json(buildLeviAgentAsset(req.body || {}));
});

app.post("/api/agent/draft", (req, res) => {
  res.json(buildAgentDraft(req.body || {}));
});

app.post("/api/agent/action-request", async (req, res) => {
  try {
    const actionRequest = buildAgentActionRequest(req.body || {});
    await saveAgentActionRequest(actionRequest);
    await saveAgentActionActivity(actionRequest);
    res.status(201).json({ ok: true, stored: true, request: actionRequest });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Agent action request could not be prepared.",
    });
  }
});

app.get("/api/ninja/tasks", async (_req, res) => {
  const tasks = (await readJsonLines(NINJA_TASKS_FILE)).slice(0, 50);
  res.json({ ok: true, tasks });
});

app.post("/api/ninja/tasks", async (req, res) => {
  try {
    const task = buildNinjaTask(req.body || {});
    await saveNinjaTask(task);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(AGENT_ACTIVITY_FILE, `${JSON.stringify({
      createdAt: task.createdAt,
      site: "ninja",
      mode: "manager",
      agent: task.assignedAgent,
      assetType: "Ninja task",
      prompt: task.goal,
      actionType: task.approvalRequired ? "waiting-approval" : "assigned",
      target: task.routes[0]?.href || "/ninja/",
      safeSubmit: false,
      boundary: task.blocker || task.guardrail,
      message: `${task.status}: ${task.nextAction}`,
      href: task.routes[0]?.href || "",
    })}\n`, "utf8");
    res.status(201).json({ ok: true, task });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Ninja task could not be created.",
    });
  }
});

app.post("/api/agent/activity", async (req, res) => {
  try {
    const activity = normalizeAgentActivity(req.body || {});
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(AGENT_ACTIVITY_FILE, `${JSON.stringify(activity)}\n`, "utf8");
    res.status(201).json({ ok: true, stored: true });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Agent activity could not be saved.",
    });
  }
});

app.post(["/create-checkout-session", "/api/create-checkout-session"], async (_req, res) => {
  const status = await verifiedCheckoutStatus();
  if (!status.available) {
    res.status(503).json({
      ...status,
      ok: false,
      error: status.message,
    });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create(buildCheckoutSessionCreateParams());
    res.json({ url: session.url });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: PAYMENT_HOLD_MESSAGE,
    });
  }
});

app.post("/api/intake", async (req, res) => {
  try {
    const plan = normalizeFormedIntake(req.body || {});
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(FORMED_INTAKES_FILE, `${JSON.stringify(plan)}\n`, "utf8");
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "The LLC formation review could not be created.",
    });
  }
});

app.get("/api/admin/summary", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { leads, formedIntakes, careers, growth, levi, traffic, agentActivity, actionRequests, payments, ninjaTasks, featureRequests, entities, events, recommendations, approvals, privatePreview } = await getAdminDatasets();

  res.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    counts: {
      leads: leads.length,
      growth: growth.length,
      levi: levi.length,
      formedIntakes: formedIntakes.length,
      careers: careers.length,
      traffic: traffic.length,
      agentActivity: agentActivity.length,
      actionRequests: actionRequests.length,
      payments: payments.length,
      ninjaTasks: ninjaTasks.length,
      featureRequests: featureRequests.length,
      entities: entities.length,
      events: events.length,
      recommendations: recommendations.length,
      approvals: approvals.length,
      privatePreview: privatePreview.length,
    },
    leads: leads.slice(0, 100),
    formedIntakes: formedIntakes.slice(0, 100),
    traffic: traffic.slice(0, 250),
    agentActivity: agentActivity.slice(0, 250),
    actionRequests: actionRequests.slice(0, 250),
    payments: payments.slice(0, 250),
    ninjaTasks: ninjaTasks.slice(0, 250),
    featureRequests: featureRequests.slice(0, 250),
    entities: entities.slice(0, 250),
    events: events.slice(0, 250),
    recommendations: recommendations.slice(0, 250),
    approvals: approvals.slice(0, 250),
    privatePreview: privatePreview.slice(0, 250),
  });
});

app.post("/api/admin/feature-requests/:id/status", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const featureRequest = await updateFeatureRequestStatus(req.params.id, req.body || {});
    res.json({ ok: true, featureRequest });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || "Feature request status could not be updated.",
    });
  }
});

app.get("/api/admin/checkout-diagnostic", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json(await diagnoseCheckoutConfig());
});

app.get("/api/admin/export", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const type = cleanText(req.query.type, 40) || "leads";
  const format = cleanText(req.query.format, 20) || "csv";
  const datasets = await getAdminDatasets();
  const records = selectAdminDataset(datasets, type);

  if (format === "json") {
    res.set("Cache-Control", "no-store");
    res.set("Content-Disposition", `attachment; filename="lrc-${type}.json"`);
    res.json({ ok: true, type, records });
    return;
  }

  res.set("Cache-Control", "no-store");
  res.set("Content-Type", "text/csv; charset=utf-8");
  res.set("Content-Disposition", `attachment; filename="lrc-${type}.csv"`);
  res.send(toCsv(records));
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "lrcpropertyllc-site" });
});

app.use((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(404).json({ ok: false, error: "Not found" });
    return;
  }
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.listen(PORT, () => {
  console.log(`LRC Property LLC site running on http://localhost:${PORT}`);
});
