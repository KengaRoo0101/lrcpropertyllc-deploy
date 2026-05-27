const STORAGE_KEY = "lrc_workspace_v1";
const PRODUCT = "Formed";
const VERSION = "formed-v1";
const APPROVAL_BOUNDARY = "Nothing happens without your approval. You securely review and authorize payment before anything is charged.";
const LOCAL_ONLY_NOTE = "No payment, filing, publishing, message, upload, account access, tax work, legal work, or external submission was performed.";

const guidedSteps = [
  {
    id: 1,
    title: "Business Idea",
    key: "businessIdea",
    question: "What idea can we help build today?",
    placeholder: "A clothing brand",
  },
  {
    id: 2,
    title: "Business Name",
    key: "businessName",
    question: "What would you like to call it?",
    placeholder: "North Coast Apparel",
  },
  {
    id: 3,
    title: "Business Type",
    key: "businessType",
    question: "What kind of business is this?",
    placeholder: "Online clothing store",
  },
  {
    id: 4,
    title: "Goals",
    key: "firstGoal",
    question: "What's the first thing you want this business to achieve?",
    placeholder: "Make my first $1,000",
  },
];

const supportActions = {
  "build-review": {
    label: "Request build review",
    status: "Build review requested. LRC can review the Business Draft before any paid or external step.",
    category: "service-review",
  },
  "tax-help": {
    label: "Request tax help",
    status: "Tax help requested. This is a request for qualified tax-preparer fit, not tax advice.",
    category: "tax-preparer-fit",
  },
  "bookkeeping-setup": {
    label: "Request bookkeeping setup",
    status: "Bookkeeping setup requested. This organizes records, categories, and review questions without providing accounting services.",
    category: "bookkeeping-setup",
  },
  "launch-support": {
    label: "Request launch support",
    status: "Launch support requested. Publishing, posting, sending, and checkout stay approval-gated.",
    category: "launch-support",
  },
  "ai-operations": {
    label: "Request AI operations setup",
    status: "AI operations setup requested. Account access and automation stay approval-gated.",
    category: "ai-operations",
  },
};

let currentArtifact = null;
let currentEntity = null;
let currentRecommendations = null;
let currentStep = 0;
let guidedAnswers = {};

function cleanText(value, fallback = "", limit = 360) {
  return String(value || fallback || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toSentence(value) {
  const text = cleanText(value);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function detectCategory(idea) {
  const text = idea.toLowerCase();
  if (/\b(ai|automation|agent|workflow|software|app|saas|tool)\b/.test(text)) return "ai-operations";
  if (/\b(clean|detail|repair|care|service|home|mobile|consult)\b/.test(text)) return "local-service";
  if (/\b(food|restaurant|catering|drink|bakery|meal)\b/.test(text)) return "food-service";
  if (/\b(brand|clothing|product|shop|store|ecommerce|commerce)\b/.test(text)) return "product-brand";
  if (/\b(bookkeeping|bookkeeper|books|receipts|expenses?|invoices?|accounting)\b/.test(text)) return "bookkeeping-setup";
  if (/\b(tax|payroll|1099)\b/.test(text)) return "tax-preparer-fit";
  return "founder-startup";
}

function targetCustomerFor(idea, category) {
  if (category === "local-service") return "Busy local customers who need a reliable service provider and a simple booking path.";
  if (category === "food-service") return "Local customers who already buy similar food or event options and need a clear reason to try yours first.";
  if (category === "ai-operations") return "Operators or founders who repeat the same manual workflow and need a simple AI-supported setup.";
  if (category === "product-brand") return "Early buyers who care about the problem, style, or outcome behind the first product.";
  if (category === "bookkeeping-setup") return "Founders who need clean records, categories, and a review-ready bookkeeping setup before professional handoff.";
  if (category === "tax-preparer-fit") return "LLC founders who need organized records before speaking with a qualified tax professional.";
  return `Early customers who already feel the problem behind ${idea}.`;
}

function offerFor(idea, category) {
  if (category === "tax-preparer-fit") {
    return "A tax-preparer fit packet that organizes founder context, records to gather, and review questions before any professional handoff.";
  }
  if (category === "bookkeeping-setup") {
    return "A bookkeeping setup packet that organizes income, expenses, receipts, invoices, review cadence, and questions before any professional handoff.";
  }
  if (category === "ai-operations") {
    return "A paid starter setup that turns one repeated workflow into an intake, summary, checklist, and weekly review loop.";
  }
  return `A starter offer that helps the first customer move from ${idea} to one clear result, with scope, timeline, and next step defined.`;
}

function positioningFor(idea, customer, category) {
  const lane = {
    "local-service": "local service",
    "food-service": "launch offer",
    "ai-operations": "AI operations setup",
    "product-brand": "focused product brand",
    "tax-preparer-fit": "founder support packet",
    "bookkeeping-setup": "bookkeeping setup tool",
    "founder-startup": "founder operating plan",
  }[category] || "founder operating plan";
  return `For ${customer.toLowerCase()}, ${idea} is a ${lane} that turns scattered interest into a clear first action.`;
}

function checklistFor(category) {
  const base = [
    "Name the working offer and the first customer.",
    "Write the promise in one sentence.",
    "Create one intake or booking path.",
    "Collect only the records needed for review.",
    "Ask approval before checkout, filing, publishing, sending, or account access.",
  ];
  if (category === "ai-operations") {
    base[2] = "Map the first repeatable workflow for AI-assisted intake and summaries.";
  }
  if (category === "tax-preparer-fit") {
    base[2] = "Gather bookkeeping status, entity stage, state focus, and questions for a qualified tax professional.";
  }
  if (category === "bookkeeping-setup") {
    base[2] = "Create a simple records map for income, expenses, receipts, invoices, and monthly review questions.";
  }
  return base;
}

function buildArtifact(ideaInput) {
  const idea = cleanText(ideaInput, "business setup support for new founders", 360);
  const category = detectCategory(idea);
  const targetCustomer = targetCustomerFor(idea, category);
  const firstOffer = offerFor(idea, category);
  const positioning = positioningFor(idea, targetCustomer, category);
  const launchChecklist = checklistFor(category);
  const nextBestStep = "Continue building after reviewing the Business Draft.";

  return {
    version: VERSION,
    product: PRODUCT,
    category,
    workingConcept: toSentence(idea),
    firstOffer,
    targetCustomer,
    positioning,
    launchChecklist,
    nextBestStep,
    approvalBoundary: LOCAL_ONLY_NOTE,
    checkoutNote: "You securely review and authorize payment before anything is charged.",
    createdAt: new Date().toISOString(),
  };
}

function intakeFromAnswers(answers = guidedAnswers) {
  return {
    businessIdea: cleanText(answers.businessIdea, "", 180),
    businessName: cleanText(answers.businessName, "", 120),
    businessType: cleanText(answers.businessType, "", 160),
    firstGoal: cleanText(answers.firstGoal, "", 180),
  };
}

function articleFor(value) {
  const text = cleanText(value).toLowerCase();
  return /^[aeiou]/.test(text) || text.startsWith("llc") ? "an" : "a";
}

function sentenceFragment(value) {
  const text = cleanText(value);
  if (!text || /^[A-Z0-9\s&.-]+$/.test(text)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function ideaFromAnswers(answers = guidedAnswers) {
  const intake = intakeFromAnswers(answers);
  const name = intake.businessName || intake.businessIdea || "New business";
  const type = intake.businessType || intake.businessIdea || "founder idea";
  const typeFragment = sentenceFragment(type);
  const goal = intake.firstGoal ? ` First goal: ${intake.firstGoal}.` : "";
  const idea = intake.businessIdea ? ` Original idea: ${intake.businessIdea}.` : "";
  return cleanText(`${name} is ${articleFor(typeFragment)} ${typeFragment}.${goal}${idea}`, "business setup support for new founders", 360);
}

function artifactText(artifact) {
  return [
    "Formed Business Draft",
    `Working concept: ${artifact.workingConcept}`,
    `First offer: ${artifact.firstOffer}`,
    `Target customer: ${artifact.targetCustomer}`,
    `Positioning: ${artifact.positioning}`,
    "Launch checklist:",
    ...artifact.launchChecklist.map((item, index) => `${index + 1}. ${item}`),
    `Next best step: ${artifact.nextBestStep}`,
    `Trust note: ${artifact.approvalBoundary}`,
  ].join("\n");
}

function withTimeout(promise, timeoutMs = 1200) {
  return Promise.race([
    promise,
    new Promise((_, reject) => window.setTimeout(() => reject(new Error("Clipboard timed out")), timeoutMs)),
  ]);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await withTimeout(navigator.clipboard.writeText(text));
      return true;
    } catch (_error) {}
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function workspaceFromArtifact(artifact, entity = currentEntity) {
  return {
    version: "1.0",
    product: PRODUCT,
    userGoal: artifact.workingConcept,
    activeRoute: "formed-startup",
    activeTool: "formed-founder-os",
    currentStep: "operating-plan-created",
    entityId: entity?.id || "",
    intake: intakeFromAnswers(),
    draft: {
      recommendedRoute: "Formed Launch Plan",
      plainEnglishDiagnosis: "The founder needs one offer, one customer, one launch checklist, and one next step.",
      nextThreeSteps: artifact.launchChecklist.slice(0, 3),
      draftDeliverable: artifactText(artifact),
      approvalBoundary: artifact.approvalBoundary,
      cta: "Continue Building",
    },
    reviewStatus: "needs-user-review",
    checkoutStatus: {
      available: false,
      mode: "hold",
      paymentStatus: "not_started",
    },
    deliverableStatus: "local-draft-only",
    events: [{
      type: "formed-plan-created",
      timestamp: new Date().toISOString(),
      product: PRODUCT,
      route: "formed-startup",
      inputLength: artifact.workingConcept.length,
      selectedCategory: artifact.category,
      uiAction: "build-starting-plan",
    }],
    lastUpdated: new Date().toISOString(),
  };
}

function saveWorkspace(artifact, entity = currentEntity) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaceFromArtifact(artifact, entity)));
  } catch (_error) {
    // Local storage is an enhancement; the page still works without it.
  }
}

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `${path} failed`);
  }
  return data;
}

function renderSupportButtons() {
  return `
    <button class="secondary-button" type="button" data-copy-plan>Save Draft</button>
    <button class="primary-button" type="button" data-continue-building>Continue Building</button>
    <button class="secondary-button" type="button" data-upgrade-plan>Upgrade</button>
  `;
}

function stepProgressHtml(activeIndex) {
  return guidedSteps
    .map((step, index) => `
      <span class="${index === activeIndex ? "is-active" : index < activeIndex ? "is-complete" : ""}">
        ${escapeHtml(String(step.id))}
      </span>
    `)
    .join("");
}

function renderStep(stepIndex) {
  const container = document.querySelector("[data-guided-flow]");
  if (!container) return;
  const step = guidedSteps[stepIndex];
  const savedValue = guidedAnswers[step.key] || "";

  container.innerHTML = `
    <div class="flow-card active">
      <div class="flow-progress" aria-hidden="true">${stepProgressHtml(stepIndex)}</div>
      <div class="flow-step">Step ${step.id} of ${guidedSteps.length}</div>
      <h2>${escapeHtml(step.title)}</h2>
      <p>${escapeHtml(step.question)}</p>
      <form id="step-form">
        <input
          type="text"
          id="step-input"
          name="${escapeHtml(step.key)}"
          value="${escapeHtml(savedValue)}"
          placeholder="${escapeHtml(step.placeholder)}"
          autocomplete="off"
          required
          autofocus
        />
        <button class="primary-button" type="submit">Continue</button>
      </form>
      <p class="form-note">Do not enter SSNs, card numbers, passwords, bank data, tax IDs, or private filings.</p>
    </div>
  `;

  const input = container.querySelector("#step-input");
  input?.focus({ preventScroll: true });
  input?.setSelectionRange(input.value.length, input.value.length);

  container.querySelector("#step-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = cleanText(input?.value, "", 180);
    if (!value) return;

    guidedAnswers[step.key] = value;
    animateOut(() => {
      currentStep += 1;
      if (currentStep < guidedSteps.length) {
        renderStep(currentStep);
      } else {
        renderComplete();
      }
    });
  });
}

function animateOut(callback) {
  const card = document.querySelector(".flow-card");
  if (!card) {
    callback();
    return;
  }
  card.classList.add("exit");
  window.setTimeout(callback, 260);
}

function renderComplete() {
  const container = document.querySelector("[data-guided-flow]");
  if (!container) return;
  const intake = intakeFromAnswers();

  container.innerHTML = `
    <div class="flow-card complete active">
      <div class="success-icon" aria-hidden="true">✓</div>
      <h2>Your Business Draft Is Ready</h2>
      <p>Formed created your recommended structure, launch steps, and business roadmap.</p>
      <div class="results-preview">
        ${guidedSteps.map((step) => `
          <div class="result-item">
            <strong>${escapeHtml(step.title)}:</strong>
            <span>${escapeHtml(intake[step.key])}</span>
          </div>
        `).join("")}
      </div>
      <button class="primary-button" type="button" data-view-plan>View My Plan</button>
    </div>
  `;

  createPlanFromGuidedAnswers();
  container.querySelector("[data-view-plan]")?.addEventListener("click", () => {
    document.querySelector("[data-founder-output]")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function createPlanFromGuidedAnswers() {
  currentArtifact = buildArtifact(ideaFromAnswers());
  currentEntity = null;
  currentRecommendations = null;
  saveWorkspace(currentArtifact);
  renderArtifact(currentArtifact, "Plan saved locally. Continue when ready.", { scroll: false });
  syncArtifact(currentArtifact, { scroll: false });
}

function renderArtifact(artifact, syncStatus = "Plan saved locally. Continue when ready.", options = {}) {
  const output = document.querySelector("[data-founder-output]");
  if (!output) return;
  output.hidden = false;
  output.innerHTML = `
    <div class="formed-artifact-card">
      <div class="artifact-header">
        <p class="eyebrow">Business Draft</p>
        <h2>${escapeHtml(artifact.workingConcept)}</h2>
        <p>${escapeHtml(syncStatus)}</p>
      </div>

      <div class="formed-artifact-grid">
        <article>
          <span>First offer</span>
          <p>${escapeHtml(artifact.firstOffer)}</p>
        </article>
        <article>
          <span>Target customer</span>
          <p>${escapeHtml(artifact.targetCustomer)}</p>
        </article>
        <article>
          <span>Positioning</span>
          <p>${escapeHtml(artifact.positioning)}</p>
        </article>
        <article>
          <span>Next best step</span>
          <p>${escapeHtml(artifact.nextBestStep)}</p>
        </article>
      </div>

      <div class="formed-checklist">
        <span>Launch checklist</span>
        <ol>
          ${artifact.launchChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      </div>

      <div class="approval-strip">
        <strong>Trust note</strong>
        <p>${escapeHtml(artifact.approvalBoundary)} ${escapeHtml(artifact.checkoutNote)}</p>
      </div>

      <div class="formed-actions" aria-label="Founder support actions">
        ${renderSupportButtons()}
      </div>

      <div class="entity-status" data-entity-status>
        <span>Draft: saved</span>
        <span>Next: ${escapeHtml(currentRecommendations?.recommendation?.recommendation?.nextBestStep || artifact.nextBestStep)}</span>
        <span>Checkout: hold</span>
      </div>
    </div>
  `;
  if (options.scroll !== false) {
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  bindArtifactActions(output, artifact);
}

function updateStatus(message, state = "") {
  const status = document.querySelector("[data-entity-status]");
  if (!status) return;
  status.dataset.state = state;
  status.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <span>Draft: saved</span>
    <span>Checkout: hold</span>
  `;
}

async function syncArtifact(artifact, options = {}) {
  try {
    const entityResult = await postJson("/api/entities", {
      source: "formed-v1",
      product: PRODUCT,
      version: VERSION,
      category: artifact.category,
      workingConcept: artifact.workingConcept,
      artifact,
      rawSensitiveContentStored: false,
    });
    currentEntity = entityResult.entity;
    saveWorkspace(artifact, currentEntity);

    await postJson("/api/events", {
      eventType: "formed-plan-created",
      entityId: currentEntity.id,
      product: PRODUCT,
      route: "formed-startup",
      inputLength: artifact.workingConcept.length,
      selectedCategory: artifact.category,
      uiAction: "build-starting-plan",
    });

    currentRecommendations = await postJson("/api/recommendations", {
      entityId: currentEntity.id,
      product: PRODUCT,
      category: artifact.category,
      artifact,
    });
    renderArtifact(artifact, "Plan saved. Your next step is ready.", options);
  } catch (error) {
    saveWorkspace(artifact);
    renderArtifact(artifact, "Plan saved locally. Continue when ready.", options);
  }
}

async function requestSupport(actionType, artifact) {
  const action = supportActions[actionType];
  if (!action || !artifact) return;
  updateStatus(`${action.label} is being prepared.`, "pending");

  try {
    const approval = await postJson("/api/approvals", {
      entityId: currentEntity?.id || "",
      product: PRODUCT,
      actionType,
      category: action.category,
      requestedAction: action.label,
      reason: artifact.nextBestStep,
    });

    await postJson("/api/events", {
      eventType: "formed-support-requested",
      entityId: currentEntity?.id || "",
      product: PRODUCT,
      route: "formed-startup",
      inputLength: artifact.workingConcept.length,
      selectedCategory: artifact.category,
      uiAction: actionType,
      metadata: {
        approvalId: approval.approval?.id || "",
        supportCategory: action.category,
      },
    }).catch(() => {});

    if (actionType === "build-review") {
      const statusResponse = await fetch("/api/checkout-status", { headers: { accept: "application/json" } });
      const checkout = await statusResponse.json().catch(() => ({ available: false, mode: "hold" }));
      if (checkout.available) {
        updateStatus("Build review approved for checkout. Use the secure checkout button when ready.", "success");
        showCheckoutButton(artifact);
        return;
      }
    }

    updateStatus(`${action.status} No external action was taken.`, "success");
  } catch (error) {
    updateStatus(`${action.label} stayed local. Shared request storage is temporarily unavailable. No external action was taken.`, "error");
  }
}

function showCheckoutButton(artifact) {
  const actions = document.querySelector(".formed-actions");
  if (!actions || actions.querySelector("[data-secure-checkout]")) return;
  const button = document.createElement("button");
  button.className = "primary-button";
  button.type = "button";
  button.dataset.secureCheckout = "true";
  button.textContent = "Continue to secure checkout";
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Opening secure checkout";
    try {
      await postJson("/api/approvals", {
        entityId: currentEntity?.id || "",
        product: PRODUCT,
        actionType: "secure-checkout",
        category: "financial approval",
        requestedAction: "Open Stripe Checkout",
        reason: artifact.nextBestStep,
      });
      const response = await fetch("/create-checkout-session", { method: "POST", headers: { accept: "application/json" } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) throw new Error(data.error || "Stripe Checkout is in hold.");
      window.location.assign(data.url);
    } catch (error) {
      updateStatus(`Secure checkout did not open: ${error.message}`, "error");
      button.disabled = false;
      button.textContent = "Continue to secure checkout";
    }
  });
  actions.append(button);
}

function bindArtifactActions(output, artifact) {
  output.querySelector("[data-copy-plan]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    try {
      const copied = await copyText(artifactText(artifact));
      if (!copied) throw new Error("Copy unavailable");
      button.textContent = "Draft Saved";
      updateStatus("Business Draft saved locally.", "success");
    } catch (_error) {
      updateStatus("Copy was blocked by the browser. The plan is still visible.", "error");
    }
    window.setTimeout(() => {
      button.textContent = "Save Draft";
    }, 1400);
  });

  output.querySelector("[data-continue-building]")?.addEventListener("click", () => {
    updateStatus("Continue from this Business Draft. Nothing external was triggered.", "success");
  });

  output.querySelector("[data-upgrade-plan]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "Checking Upgrade";
    try {
      const statusResponse = await fetch("/api/checkout-status", { headers: { accept: "application/json" } });
      const checkout = await statusResponse.json().catch(() => ({ available: false, mode: "hold" }));
      if (!checkout.available) {
        updateStatus(checkout.message || "Upgrade is prepared, but checkout is still in hold.", "error");
        return;
      }
      showCheckoutButton(artifact);
      updateStatus("Upgrade is ready. Use Stripe Checkout when you are ready.", "success");
    } catch (_error) {
      updateStatus("Upgrade is not available right now. Nothing was charged.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "Upgrade";
    }
  });
}

function restoreWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved?.draft?.draftDeliverable || saved.activeTool !== "formed-founder-os") return;
    guidedAnswers = {
      ...guidedAnswers,
      ...(saved.intake && typeof saved.intake === "object" ? saved.intake : {}),
    };
    const lines = saved.draft.draftDeliverable.split("\n");
    const concept = cleanText(saved.userGoal || lines[1]?.replace("Working concept:", ""), "", 360);
    if (!concept) return;
    currentArtifact = buildArtifact(concept);
    currentEntity = saved.entityId ? { id: saved.entityId } : null;
    renderArtifact(currentArtifact, "Restored the latest local Formed plan.", { scroll: false });
  } catch (_error) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_removeError) {}
  }
}

function init() {
  const flow = document.querySelector("[data-guided-flow]");
  if (!flow) return;

  renderStep(currentStep);
  restoreWorkspace();
}

init();
