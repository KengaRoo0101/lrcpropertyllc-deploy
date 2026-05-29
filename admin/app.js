const loginForm = document.querySelector("#admin-login");
const statusLine = document.querySelector("#admin-status");
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));
const refreshButton = document.querySelector("#refresh-admin");
const exportCsvButton = document.querySelector("#export-csv");
const exportJsonButton = document.querySelector("#export-json");
const checkoutSetupStatus = document.querySelector("#checkout-setup-status");

const recordLimit = 16;
let activeAdminCode = "";

if (window.location.protocol === "file:") {
  window.location.href = "http://localhost:3000/admin/";
}

const counts = {
  leads: document.querySelector("#lead-count"),
  growth: document.querySelector("#growth-count"),
  levi: document.querySelector("#levi-count"),
  careers: document.querySelector("#career-count"),
  formedIntakes: document.querySelector("#formed-count"),
  traffic: document.querySelector("#traffic-count"),
  agentActivity: document.querySelector("#agent-activity-count"),
  actionRequests: document.querySelector("#action-request-count"),
  payments: document.querySelector("#payment-count"),
  ninjaTasks: document.querySelector("#ninja-task-count"),
  featureRequests: document.querySelector("#feature-request-count"),
  privatePreview: document.querySelector("#private-preview-count"),
};

const lists = {
  requests: document.querySelector("#request-list"),
  growth: document.querySelector("#growth-list"),
  levi: document.querySelector("#levi-list"),
  careers: document.querySelector("#career-list"),
  formed: document.querySelector("#formed-list"),
  traffic: document.querySelector("#traffic-list"),
  agentActivity: document.querySelector("#agent-activity-list"),
  actionRequests: document.querySelector("#action-request-list"),
  payments: document.querySelector("#payment-list"),
  ninjaTasks: document.querySelector("#ninja-task-list"),
  featureRequests: document.querySelector("#feature-request-list"),
  privatePreview: document.querySelector("#private-preview-list"),
};

const pathwayLabels = {
  "formation-file": "Formation File",
  "launch-page": "Launch Page",
  "revenue-motion": "Revenue Motion",
  "publishing-system": "Publishing System",
  "ai-operations": "AI Operations",
  "full-buildout": "Full Buildout",
};

const featureStatusSteps = [
  "requested",
  "approved_for_build",
  "built_for_review",
  "approved_for_deploy",
  "deployed",
];

const featureStatusLabels = {
  requested: "New request",
  approved_for_build: "Build approved",
  built_for_review: "Built for review",
  approved_for_deploy: "Deploy approved",
  deployed: "Deployed",
};

const featureActionLabels = {
  approved_for_build: "Approve build",
  built_for_review: "Mark built",
  approved_for_deploy: "Approve deploy",
  deployed: "Mark deployed",
};

const featureStatusAliases = {
  submitted: "requested",
  reviewed: "approved_for_build",
  approved: "approved_for_build",
  created: "built_for_review",
  build_reviewed: "built_for_review",
  deploy_approved: "approved_for_deploy",
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message, state = "") {
  if (!statusLine) return;
  statusLine.textContent = message;
  statusLine.dataset.state = state;
}

function tabFromHash() {
  const hash = String(window.location.hash || "").replace(/^#/, "");
  const aliases = {
    "ninja-work": "ninja-tasks",
    "agent-work": "agent-activity",
    "agent-actions": "action-requests",
    actions: "action-requests",
    checkout: "payments",
    configure: "setup",
    config: "setup",
    features: "feature-requests",
    previews: "private-preview",
    "private-previews": "private-preview",
  };
  return aliases[hash] || hash || "requests";
}

function activateTab(tab = "requests", updateHash = false) {
  const resolvedTab = panels.some((panel) => panel.dataset.panel === tab) ? tab : "requests";
  tabButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.tab === resolvedTab));
  panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === resolvedTab));
  if (updateHash) window.history.replaceState(null, "", `#${resolvedTab}`);
}

function formatDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function emptyState(text) {
  return `<p class="empty-state">${escapeHtml(text)}</p>`;
}

function setupLabel(key) {
  const labels = {
    realWorldPaymentsEnabled: "Real-world payments",
    checkoutEnabled: "Checkout activation",
    publicUrl: "Public site URL",
    stripeSecret: "Stripe secret key",
    stripeSecretMode: "Production Stripe key status",
    stripeRestrictedKey: "Restricted key",
    stripePriceId: "Stripe price",
    stripePriceIdFormat: "Price format",
    stripeWebhookSecret: "Webhook secret",
  };
  return labels[key] || key;
}

function setupValue(key, value) {
  if (key === "stripeSecretMode") return value === "live" ? "production mode" : "not production mode";
  if (typeof value === "boolean") return value ? "ready" : "missing";
  return String(value || "missing");
}

function categoryMessage(category = "") {
  const messages = {
    ready: "Payment configuration is complete. Owner approval is still required before activation.",
    "real-world-payments-disabled": "Real-world payments are inactive.",
    "checkout-disabled": "Checkout is intentionally off until owner-approved configuration is complete.",
    "missing-secret-key": "Stripe secret key is missing.",
    "live-test-mismatch": "Stripe key and price mode do not match.",
    "missing-price-id": "Stripe price id is missing.",
    "invalid-price-id-format": "Stripe price id must start with price_.",
    "missing-webhook-secret": "Stripe webhook secret is missing.",
    "invalid-key": "Stripe rejected the key.",
    "wrong-account-or-price-not-found": "The key and price do not appear to belong to the same Stripe account.",
    "inactive-price": "The Stripe price exists but is inactive.",
    "stripe-price-lookup-failed": "Stripe price lookup failed.",
    "stripe-network-or-runtime-error": "Stripe could not be reached from the runtime.",
  };
  return messages[category] || "Payment setup needs owner review.";
}

function nextSetupStep(category = "") {
  if (category === "ready") return "Do not enable checkout while the no-payment rule is active.";
  if (category === "real-world-payments-disabled") return "Keep team members on preview, review, or contact paths. Do not enable checkout.";
  if (category === "checkout-disabled") return "Enable checkout only after owner approval and confirmed production payment configuration.";
  if (category === "missing-secret-key") return "Add STRIPE_SECRET_KEY in Cloudflare Pages production secrets. Keep the value out of chat.";
  if (category === "missing-price-id" || category === "invalid-price-id-format") return "Add the active production Stripe price id inside the approved secret manager.";
  if (category === "missing-webhook-secret") return "Add STRIPE_WEBHOOK_SECRET from the Stripe webhook endpoint.";
  if (category === "live-test-mismatch") return "Use matching production-mode Stripe credentials and price settings.";
  if (category === "wrong-account-or-price-not-found") return "Confirm the key and price id belong to the same approved Stripe account.";
  if (category === "inactive-price") return "Keep checkout inactive until the owner approves an active production Stripe price.";
  return "Review the Stripe and Cloudflare production configuration, then redeploy.";
}

function renderCheckoutSetup(data = {}) {
  if (!checkoutSetupStatus) return;
  const checks = data.checks || {};
  const checkRows = Object.entries(checks)
    .map(([key, value]) => {
      const ready = key === "stripeSecretMode" ? value === "live" : Boolean(value);
      return `
        <div class="setup-check ${ready ? "is-ready" : "needs-work"}">
          <span>${escapeHtml(setupLabel(key))}</span>
          <strong>${escapeHtml(setupValue(key, value))}</strong>
        </div>
      `;
    })
    .join("");

  checkoutSetupStatus.innerHTML = `
    <article class="record-card setup-card ${data.available ? "is-ready" : "needs-work"}">
      <div>
        <p class="record-kicker">${escapeHtml(data.available ? "Configured" : "Needs setup")}</p>
        <h3>${escapeHtml(categoryMessage(data.category))}</h3>
        <p>${escapeHtml(nextSetupStep(data.category))}</p>
      </div>
      <div class="setup-grid">${checkRows}</div>
      <p class="record-warning">No secrets are shown here. Do not complete a payment during verification. Owner approval is required before checkout is enabled.</p>
    </article>
  `;
}

function renderLead(lead) {
  return `
    <article class="record-card">
      <div>
        <h3>${escapeHtml(lead.name || "Unnamed request")}</h3>
        <p>${escapeHtml(lead.message || "No message provided.")}</p>
      </div>
      <div class="record-meta">
        <span>${escapeHtml(lead.email || "No email")}</span>
        <span>${escapeHtml(lead.toolInterest || "General")}</span>
        <span>${escapeHtml(lead.source || "Unknown source")}</span>
        <span>${formatDate(lead.createdAt)}</span>
      </div>
    </article>
  `;
}

function renderLeviLead(lead) {
  const message = String(lead.message || "");
  const source = String(lead.source || "").replace(/^levi-/, "") || "home";
  return `
    <article class="record-card levi-record">
      <div>
        <p class="record-kicker">${escapeHtml(source)} • ${escapeHtml(lead.toolInterest || "Levi preview")}</p>
        <h3>${escapeHtml(lead.name || "Levi handoff")}</h3>
        <p>${escapeHtml(message || "No preview details provided.")}</p>
      </div>
      <div class="record-meta">
        <span>${escapeHtml(lead.email || "No email")}</span>
        <span>${escapeHtml(lead.source || "levi")}</span>
        <span>${formatDate(lead.createdAt)}</span>
      </div>
      <p class="record-warning">Review first. Request scoped approval before submitting, publishing, purchasing, messaging, changing access, or using restricted access.</p>
    </article>
  `;
}

function renderOfficialRecords(records = {}) {
  const items = [
    records.legalName ? ["Legal name", records.legalName] : null,
    records.stateEntityId ? ["State filing ref", records.stateEntityId] : null,
    records.formationDate ? ["Formation date", records.formationDate] : null,
    records.articlesStatus ? ["Articles status", records.articlesStatus] : null,
    records.articlesReference ? ["Articles ref", records.articlesReference] : null,
    records.einStatus ? ["EIN status", records.einStatus] : null,
    records.einReference ? ["EIN ref", records.einReference] : null,
    records.copyrightPlan ? ["Copyright", records.copyrightPlan] : null,
    records.trademarkPlan ? ["Trademark", records.trademarkPlan] : null,
    records.missionStatement ? ["Mission", records.missionStatement] : null,
    records.officialPrivateNotes ? ["Private notes", records.officialPrivateNotes] : null,
  ].filter(Boolean);

  if (!items.length) return "";

  return `
    <div class="record-detail-grid" aria-label="Private official records">
      ${items
        .map(
          ([label, value]) => `
            <div>
              <span>${escapeHtml(label)}</span>
              <p>${escapeHtml(value)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderFormedIntake(item) {
  const steps = Array.isArray(item.nextSteps) ? item.nextSteps : [];
  const pathway = pathwayLabels[item.pathway] || item.pathway || "";
  return `
    <article class="record-card">
      <div>
        <h3>${escapeHtml(item.recommendedPackage || "LLC formation review")}</h3>
        <p>${escapeHtml(item.summary || "No summary available.")}</p>
      </div>
      <div class="record-meta">
        <span>${escapeHtml(item.priceRange || "No package")}</span>
        ${pathway ? `<span>${escapeHtml(pathway)}</span>` : ""}
        <span>${escapeHtml(item.state || "State unknown")}</span>
        <span>${escapeHtml(item.owners || "Owner structure unknown")}</span>
        <span>${formatDate(item.createdAt)}</span>
      </div>
      ${renderOfficialRecords(item.officialRecords)}
      ${steps.length ? `<ul>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ul>` : ""}
    </article>
  `;
}

function renderTraffic(item) {
  const path = `${item.path || "/"}${item.search || ""}`;
  return `
    <article class="record-card traffic-record">
      <div>
        <p class="record-kicker">${escapeHtml(item.kind || "visit")} • ${escapeHtml(String(item.status || ""))}</p>
        <h3>${escapeHtml(path)}</h3>
        <p>${escapeHtml(item.referrer ? `From ${item.referrer}` : "Direct or referrer not provided.")}</p>
      </div>
      <div class="record-meta">
        <span>${escapeHtml(item.visitorId ? `Visitor ${item.visitorId}` : "No visitor ID")}</span>
        <span>${escapeHtml(item.sessionId ? `Session ${item.sessionId}` : "No session ID")}</span>
        <span>${escapeHtml(item.host || "Host unknown")}</span>
        <span>${escapeHtml(item.country || "Country unknown")}</span>
        <span>${escapeHtml(item.ip ? "IP recorded privately" : "No IP")}</span>
        <span>${escapeHtml(item.durationMs ? `${item.durationMs}ms` : "No duration")}</span>
        <span>${formatDate(item.createdAt)}</span>
      </div>
      ${item.userAgent ? `<p class="record-warning">${escapeHtml(item.userAgent)}</p>` : ""}
    </article>
  `;
}

function renderAgentActivity(item) {
  const filled = Array.isArray(item.filled) ? item.filled : [];
  return `
    <article class="record-card agent-activity-record">
      <div>
        <p class="record-kicker">${escapeHtml(item.site || "home")} • ${escapeHtml(item.mode || "assist")} • ${escapeHtml(item.actionType || "action")}</p>
        <h3>${escapeHtml(item.agent || "Levi")} ${escapeHtml(item.assetType ? `- ${item.assetType}` : "")}</h3>
        <p>${escapeHtml(item.message || "No action message recorded.")}</p>
      </div>
      <div class="record-meta">
        <span>${escapeHtml(item.target || "No target")}</span>
        <span>${escapeHtml(item.form || "No form")}</span>
        <span>${escapeHtml(item.safeSubmit ? "Safe preview generated" : "Manual boundary")}</span>
        <span>${formatDate(item.createdAt)}</span>
      </div>
      ${filled.length ? `<ul>${filled.map((field) => `<li>${escapeHtml(field)}</li>`).join("")}</ul>` : ""}
      ${item.boundary ? `<p class="record-warning">${escapeHtml(item.boundary)}</p>` : ""}
    </article>
  `;
}

function renderActionRequest(item) {
  const payload = item.payload || {};
  const policy = item.policy || {};
  const goal = payload.prompt || item.goal || item.prompt || "Agent action request";
  const status = item.status || policy.outcome || "draft_only";
  const approvalCategory = policy.approvalCategory || item.approvalCategory || "none";
  const payloadHash = item.payloadHash || "No payload hash recorded";
  const boundary = item.externalActionTaken === true ? "externalActionTaken: true" : "externalActionTaken: false";

  return `
    <article class="record-card action-request-record">
      <div>
        <p class="record-kicker">${escapeHtml(payload.site || "home")} • ${escapeHtml(payload.agent || "Levi")}</p>
        <h3>${escapeHtml(goal)}</h3>
        <p>${escapeHtml(item.ownerReview || policy.decision || "Queued for owner review. No external action is available from this endpoint.")}</p>
      </div>
      <div class="record-meta action-request-meta">
        <span>${escapeHtml(`Status: ${status}`)}</span>
        <span>${escapeHtml(`Approval category: ${approvalCategory}`)}</span>
        <span class="hash-pill">${escapeHtml(`Payload hash: ${payloadHash}`)}</span>
        <span>${escapeHtml(`Created: ${formatDate(item.createdAt)}`)}</span>
      </div>
      <p class="record-warning">${escapeHtml(`${boundary}. Stored for review only; no submit, publish, purchase, message, delete, access change, or restricted-system action was performed.`)}</p>
    </article>
  `;
}

function renderPayment(item) {
  const dollars = Number(item.amountTotal || 0) / 100;
  const amount = item.amountTotal
    ? `${dollars.toLocaleString(undefined, { style: "currency", currency: String(item.currency || "usd").toUpperCase() })}`
    : "Amount unavailable";
  return `
    <article class="record-card payment-record">
      <div>
        <p class="record-kicker">${escapeHtml(item.provider || "stripe")} • ${escapeHtml(item.paymentStatus || "unknown")} • ${escapeHtml(item.mode || "mode unknown")}</p>
        <h3>${escapeHtml(item.product || "Payment product")}</h3>
        <p>${escapeHtml(item.sessionId || "No session id recorded.")}</p>
      </div>
      <div class="record-meta">
        <span>${escapeHtml(amount)}</span>
        <span>${escapeHtml(item.status || "Status unknown")}</span>
        <span>${formatDate(item.createdAt)}</span>
      </div>
    </article>
  `;
}

function renderNinjaTask(item) {
  const routes = Array.isArray(item.routes) ? item.routes : [];
  const resultLog = Array.isArray(item.resultLog) ? item.resultLog.slice(0, 4) : [];
  const approval = item.approvalRequired
    ? `Approval required: ${item.approvalCategory || "owner approval"}`
    : "Local draft only. Approval required before any external action.";
  const status = item.status === "draftReady" ? "Draft mode" : item.status || "Draft mode";
  const routeLinks = routes
    .slice(0, 3)
    .map((route) => {
      const href = String(route.href || "#");
      const label = String(route.label || href);
      return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
    })
    .join("");

  return `
    <article class="record-card ninja-task-record">
      <div>
        <p class="record-kicker">${escapeHtml(item.assignedSite || "LRC")} • ${escapeHtml(item.assignedAgent || "Ninja")} • ${escapeHtml(status)}</p>
        <h3>${escapeHtml(item.goal || "Ninja task")}</h3>
        <p>${escapeHtml(item.allowedAction || item.nextAction || item.summary || "No allowed action recorded.")}</p>
      </div>
      <div class="record-meta">
        <span>${escapeHtml(approval)}</span>
        <span>${escapeHtml(item.blocker || "No blocker")}</span>
        <span>${formatDate(item.createdAt)}</span>
      </div>
      ${resultLog.length ? `<ul class="record-result-log">${resultLog.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>` : ""}
      ${routeLinks ? `<div class="record-links">${routeLinks}</div>` : ""}
      <p class="record-warning">${escapeHtml(item.guardrail || "Guardrail: no financial transaction, deletion, submission, publishing, messaging, booking, access change, or secret transmission without explicit owner approval.")}</p>
    </article>
  `;
}

function normalizeFeatureStatus(status = "requested") {
  const key = String(status || "").toLowerCase().replace(/[\s-]+/g, "_");
  return featureStatusAliases[key] || (featureStatusSteps.includes(key) ? key : "requested");
}

function nextFeatureStatus(status = "requested") {
  const index = featureStatusSteps.indexOf(normalizeFeatureStatus(status));
  if (index < 0 || index >= featureStatusSteps.length - 1) return "";
  return featureStatusSteps[index + 1];
}

function renderApprovalLog(log = []) {
  const items = Array.isArray(log) ? log.slice(-4).reverse() : [];
  if (!items.length) return "";
  return `
    <ul class="record-result-log">
      ${items.map((entry) => `<li>${escapeHtml(featureStatusLabels[normalizeFeatureStatus(entry.status)] || entry.status || "Update")}: ${escapeHtml(entry.note || "")}</li>`).join("")}
    </ul>
  `;
}

function renderFeatureRequest(item) {
  const status = normalizeFeatureStatus(item.status);
  const nextStatus = nextFeatureStatus(status);
  const nextLabel = featureActionLabels[nextStatus] || "";
  const packet = item.buildPacket || {};
  return `
    <article class="record-card feature-request-record" data-feature-id="${escapeHtml(item.id || "")}">
      <div>
        <p class="record-kicker">${escapeHtml(item.area || "LRC")} • ${escapeHtml(featureStatusLabels[status] || status)}</p>
        <h3>${escapeHtml(item.title || "Feature request")}</h3>
        <p>${escapeHtml(item.description || "No feature details provided.")}</p>
        ${item.reason ? `<p>${escapeHtml(item.reason)}</p>` : ""}
      </div>
      <div class="record-meta">
        <span>${escapeHtml(item.requesterName || "Requester")}</span>
        <span>${escapeHtml(item.email || "No email")}</span>
        <span>${formatDate(item.updatedAt || item.createdAt)}</span>
      </div>
      ${renderApprovalLog(item.approvalLog)}
      <div class="record-feature-packet">
        <p class="record-kicker">Build packet</p>
        <p>${escapeHtml(packet.userStory || `As an LRC team member, I want ${String(item.title || "this feature").toLowerCase()} so the workflow is easier to finish.`)}</p>
        <p>${escapeHtml(packet.buildBrief || item.description || "No build brief available.")}</p>
        ${Array.isArray(packet.acceptanceChecks) ? `<ul>${packet.acceptanceChecks.map((check) => `<li>${escapeHtml(check)}</li>`).join("")}</ul>` : ""}
        <p>${escapeHtml(packet.deployGuardrail || "Deploy only after admin approval.")}</p>
      </div>
      <p class="record-warning">${escapeHtml(item.guardrail || "Admin approval is required before creation or deployment.")}</p>
      <div class="record-links">
        ${nextStatus ? `<button class="quiet-button" type="button" data-feature-status="${escapeHtml(nextStatus)}">${escapeHtml(nextLabel)}</button>` : ""}
        <button class="quiet-button" type="button" data-copy-feature-packet>Copy build packet</button>
      </div>
      <p class="record-warning">${escapeHtml(item.nextAction || "Keep the request in admin review.")}</p>
    </article>
  `;
}

function renderPrivatePreview(item) {
  const boundaries = Array.isArray(item.boundariesAccepted) ? item.boundariesAccepted : [];
  return `
    <article class="record-card private-preview-record">
      <div>
        <p class="record-kicker">${escapeHtml(item.inviteeLabel || item.invitee || "Private preview")} • ${escapeHtml(item.acknowledgementVersion || "acknowledgement")}</p>
        <h3>${escapeHtml(item.signatureName || "Unsigned acknowledgement")}</h3>
        <p>${escapeHtml("Preview was unlocked for review only. No role, access, ownership, or authority was granted.")}</p>
      </div>
      <div class="record-meta">
        <span>${escapeHtml(item.source || "friends-family")}</span>
        <span>${escapeHtml(item.noRoleCreated ? "No role created" : "Review role claim")}</span>
        <span>${escapeHtml(item.noAccessGranted ? "No access granted" : "Review access claim")}</span>
        <span>${formatDate(item.createdAt)}</span>
      </div>
      ${boundaries.length ? `<ul>${boundaries.map((boundary) => `<li>${escapeHtml(boundary)}</li>`).join("")}</ul>` : ""}
      <p class="record-warning">${escapeHtml("Use a real signed NDA, contractor agreement, associate agreement, or IP assignment before deeper access or work.")}</p>
    </article>
  `;
}

function featurePacketText(card) {
  const heading = card.querySelector("h3")?.textContent || "Feature request";
  const packet = card.querySelector(".record-feature-packet")?.innerText || "";
  return [`Feature: ${heading}`, packet].filter(Boolean).join("\n\n");
}

function renderSummary(data) {
  const leads = (Array.isArray(data.leads) ? data.leads : []).slice(0, recordLimit);
  const formedIntakes = (Array.isArray(data.formedIntakes) ? data.formedIntakes : []).slice(0, recordLimit);
  const traffic = (Array.isArray(data.traffic) ? data.traffic : []).slice(0, recordLimit);
  const agentActivity = (Array.isArray(data.agentActivity) ? data.agentActivity : []).slice(0, recordLimit);
  const actionRequests = (Array.isArray(data.actionRequests) ? data.actionRequests : []).slice(0, recordLimit);
  const payments = (Array.isArray(data.payments) ? data.payments : []).slice(0, recordLimit);
  const ninjaTasks = (Array.isArray(data.ninjaTasks) ? data.ninjaTasks : []).slice(0, recordLimit);
  const featureRequests = (Array.isArray(data.featureRequests) ? data.featureRequests : []).slice(0, recordLimit);
  const privatePreview = (Array.isArray(data.privatePreview) ? data.privatePreview : []).slice(0, recordLimit);
  const serverCounts = data.counts || {};
  const growthLeads = leads.filter((lead) => isGrowthSignalLead(lead));
  const leviLeads = leads.filter((lead) => isLeviLead(lead));
  const careerLeads = leads.filter((lead) => String(lead.source || "").includes("careers"));
  const requestLeads = leads.filter((lead) => {
    const source = String(lead.source || "");
    return !source.includes("careers") && !isGrowthSignalLead(lead) && !isLeviLead(lead);
  });

  if (counts.leads) counts.leads.textContent = String(serverCounts.leads ?? leads.length);
  if (counts.growth) counts.growth.textContent = String(serverCounts.growth ?? growthLeads.length);
  if (counts.levi) counts.levi.textContent = String(serverCounts.levi ?? leviLeads.length);
  if (counts.careers) counts.careers.textContent = String(serverCounts.careers ?? careerLeads.length);
  if (counts.formedIntakes) counts.formedIntakes.textContent = String(serverCounts.formedIntakes ?? formedIntakes.length);
  if (counts.traffic) counts.traffic.textContent = String(serverCounts.traffic ?? traffic.length);
  if (counts.agentActivity) counts.agentActivity.textContent = String(serverCounts.agentActivity ?? agentActivity.length);
  if (counts.actionRequests) counts.actionRequests.textContent = String(serverCounts.actionRequests ?? actionRequests.length);
  if (counts.payments) counts.payments.textContent = String(serverCounts.payments ?? payments.length);
  if (counts.ninjaTasks) counts.ninjaTasks.textContent = String(serverCounts.ninjaTasks ?? ninjaTasks.length);
  if (counts.featureRequests) counts.featureRequests.textContent = String(serverCounts.featureRequests ?? featureRequests.length);
  if (counts.privatePreview) counts.privatePreview.textContent = String(serverCounts.privatePreview ?? privatePreview.length);

  if (lists.requests) {
    lists.requests.innerHTML = requestLeads.length
      ? requestLeads.map(renderLead).join("")
      : emptyState("No general requests yet.");
  }

  if (lists.growth) {
    lists.growth.innerHTML = growthLeads.length
      ? growthLeads.map(renderLead).join("")
      : emptyState("No Suite Hub or market signals yet.");
  }

  if (lists.levi) {
    lists.levi.innerHTML = leviLeads.length
      ? leviLeads.map(renderLeviLead).join("")
      : emptyState("No Levi previews sent to LRC yet.");
  }

  if (lists.careers) {
    lists.careers.innerHTML = careerLeads.length
      ? careerLeads.map(renderLead).join("")
      : emptyState("No career applications yet.");
  }

  if (lists.formed) {
    lists.formed.innerHTML = formedIntakes.length
      ? formedIntakes.map(renderFormedIntake).join("")
      : emptyState("No LLC formation reviews yet.");
  }

  if (lists.traffic) {
    lists.traffic.innerHTML = traffic.length
      ? traffic.map(renderTraffic).join("")
      : emptyState("No traffic events recorded yet.");
  }

  if (lists.agentActivity) {
    lists.agentActivity.innerHTML = agentActivity.length
      ? agentActivity.map(renderAgentActivity).join("")
      : emptyState("No agent actions recorded yet.");
  }

  if (lists.actionRequests) {
    lists.actionRequests.innerHTML = actionRequests.length
      ? actionRequests.map(renderActionRequest).join("")
      : emptyState("No agent action requests queued yet.");
  }

  if (lists.payments) {
    lists.payments.innerHTML = payments.length
      ? payments.map(renderPayment).join("")
      : emptyState("No verified payment records yet.");
  }

  if (lists.ninjaTasks) {
    lists.ninjaTasks.innerHTML = ninjaTasks.length
      ? ninjaTasks.map(renderNinjaTask).join("")
      : emptyState("No Ninja tasks assigned yet.");
  }

  if (lists.featureRequests) {
    lists.featureRequests.innerHTML = featureRequests.length
      ? featureRequests.map(renderFeatureRequest).join("")
      : emptyState("No feature requests submitted yet.");
  }

  if (lists.privatePreview) {
    lists.privatePreview.innerHTML = privatePreview.length
      ? privatePreview.map(renderPrivatePreview).join("")
      : emptyState("No private preview acknowledgements yet.");
  }
}

function isGrowthSignalLead(lead) {
  const source = String(lead.source || "");
  return source === "lrc-suite-hub" || source === "lrc-growth-hub" || source === "lrc-market-tool";
}

function isLeviLead(lead) {
  return String(lead.source || "").startsWith("levi-");
}

function getStoredCode() {
  return activeAdminCode;
}

function getActiveTab() {
  return document.querySelector(".tab-button.is-active")?.dataset.tab || "requests";
}

async function loadSummary(code) {
  setStatus("Opening dashboard...", "pending");

  const response = await fetch("/api/admin/summary", {
    headers: {
      "x-admin-code": code,
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Dashboard could not be opened.");
  }

  renderSummary(data);
  await loadCheckoutSetup(code);
  activateTab(tabFromHash());
  document.body.classList.add("admin-ready");
  setStatus(`Dashboard ready. Updated ${formatDate(data.generatedAt)}.`, "success");
}

async function loadCheckoutSetup(code) {
  if (!checkoutSetupStatus) return;
  checkoutSetupStatus.innerHTML = emptyState("Checking payment hold status...");
  try {
    const response = await fetch("/api/admin/checkout-diagnostic", {
      headers: { "x-admin-code": code },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || "Setup check could not run.");
    renderCheckoutSetup(data);
  } catch (error) {
    checkoutSetupStatus.innerHTML = `<p class="empty-state">${escapeHtml(error.message || "Setup check could not run.")}</p>`;
  }
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const code = String(formData.get("code") || "").trim();
  if (!code) return;

  try {
    activeAdminCode = code;
    await loadSummary(code);
  } catch (error) {
    activeAdminCode = "";
    setStatus(error.message || "Dashboard could not be opened.", "error");
  }
});

refreshButton?.addEventListener("click", async () => {
  const code = getStoredCode();
  if (!code) {
    setStatus("Enter the admin code first.", "error");
    return;
  }

  try {
    await loadSummary(code);
  } catch (error) {
    setStatus(error.message || "Dashboard could not be opened.", "error");
  }
});

async function exportCurrentTab(format) {
  const code = getStoredCode();
  if (!code) {
    setStatus("Enter the admin code first.", "error");
    return;
  }

  const type = getActiveTab();
  setStatus(format === "csv" ? "Preparing the list..." : "Preparing full details...", "pending");

  try {
    const response = await fetch(`/api/admin/export?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}`, {
      headers: {
        "x-admin-code": code,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Download could not be created.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lrc-${type}.${format}`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(format === "csv" ? "List downloaded." : "Full details downloaded.", "success");
  } catch (error) {
    setStatus(error.message || "Download could not be created.", "error");
  }
}

exportCsvButton?.addEventListener("click", () => exportCurrentTab("csv"));
exportJsonButton?.addEventListener("click", () => exportCurrentTab("json"));

async function updateFeatureStatus(featureId, status) {
  const code = getStoredCode();
  if (!code) {
    setStatus("Enter the admin code first.", "error");
    return;
  }

  setStatus("Updating feature approval step...", "pending");
  try {
    const response = await fetch(`/api/admin/feature-requests/${encodeURIComponent(featureId)}/status`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-code": code,
      },
      body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Feature status could not be updated.");
    }
    await loadSummary(code);
    activateTab("feature-requests", true);
    setStatus("Feature approval step updated.", "success");
  } catch (error) {
    setStatus(error.message || "Feature status could not be updated.", "error");
  }
}

lists.featureRequests?.addEventListener("click", (event) => {
  const copyButton = event.target.closest("[data-copy-feature-packet]");
  if (copyButton) {
    const card = copyButton.closest("[data-feature-id]");
    navigator.clipboard?.writeText(featurePacketText(card)).then(() => {
      copyButton.textContent = "Copied";
      window.setTimeout(() => {
        copyButton.textContent = "Copy build packet";
      }, 1400);
    }).catch(() => {
      setStatus("Build packet could not be copied.", "error");
    });
    return;
  }

  const button = event.target.closest("[data-feature-status]");
  if (!button) return;
  const card = button.closest("[data-feature-id]");
  const featureId = card?.dataset.featureId || "";
  if (!featureId) return;
  updateFeatureStatus(featureId, button.dataset.featureStatus);
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTab(button.dataset.tab, true);
  });
});

activateTab(tabFromHash());

window.addEventListener("hashchange", () => activateTab(tabFromHash()));

window.addEventListener("error", (event) => {
  setStatus(event.message || "Dashboard hit a browser error.", "error");
});
