const form = document.querySelector("#jobsai-intake");
const output = document.querySelector("#brief-output");
const profileForm = document.querySelector("#profile-intake");
const profileOutput = document.querySelector("#profile-output");
const quickForm = document.querySelector("#work-match-form");
const quickInput = document.querySelector("#work-match-input");
const quickOutput = document.querySelector("#work-match-output");
const taskButtons = Array.from(document.querySelectorAll("[data-work-task]"));
const startButtons = Array.from(document.querySelectorAll("[data-jobsai-start]"));
const previewLabel = document.querySelector("[data-preview-label]");
const previewTitle = document.querySelector("[data-preview-title]");
const previewCopy = document.querySelector("[data-preview-copy]");
const previewList = document.querySelector("[data-preview-list]");

const WORK_TASKS = {
  hire: {
    label: "Hiring brief",
    title: "Hiring brief starter",
    fallback: "a role that needs clearer responsibilities, fit signals, and applicant next steps",
    cards: ["Role outcome", "Fit signals", "Applicant path"],
    next: "Refine the brief, then request human review before posting or outreach."
  },
  resume: {
    label: "Applicant fit",
    title: "Applicant fit summary",
    fallback: "an applicant who needs stronger proof, cleaner resume direction, and clearer role alignment",
    cards: ["Experience frame", "Proof to show", "Fit gaps"],
    next: "Improve the applicant summary, then review it before sending or publishing."
  },
  role: {
    label: "Role clarity",
    title: "Role clarity draft",
    fallback: "a role idea that needs responsibilities, success measures, and day-one priorities",
    cards: ["Primary work", "Success measure", "First 30 days"],
    next: "Confirm the responsibilities before turning this into listing copy."
  },
  review: {
    label: "Review workflow",
    title: "Applicant review workflow",
    fallback: "an applicant review process that needs intake questions, scorecard notes, and a clean decision record",
    cards: ["Screening lens", "Review notes", "Approval step"],
    next: "Use the workflow to organize review notes; people still make final hiring decisions."
  }
};

const HERO_PREVIEWS = [
  {
    label: "Role brief example",
    title: "Executive Assistant brief",
    copy: "Organize daily support needs into responsibilities, fit signals, applicant questions, and a review step before posting.",
    items: ["Role purpose", "30-day outcomes", "Applicant next step"]
  },
  {
    label: "Applicant summary example",
    title: "Operations support fit",
    copy: "Turn experience into a calm summary with proof points, transferable strengths, and role-specific gaps to review.",
    items: ["Useful proof", "Strong fit areas", "Next improvement"]
  },
  {
    label: "Workflow example",
    title: "Hiring review path",
    copy: "Move from rough notes to intake questions, scorecard prompts, owner approval, and a clear next action.",
    items: ["Intake", "Scorecard", "Owner review"]
  },
  {
    label: "Fit analysis example",
    title: "Candidate signal check",
    copy: "Separate must-have requirements from trainable skills so applicants and owners can review fit more clearly.",
    items: ["Must-have", "Trainable", "Clarify next"]
  }
];

let selectedTask = "hire";
let previewIndex = 0;
let previewTimer = null;
let liveDraftTimer = null;

function revealOutput(target) {
  if (!target) {
    return;
  }
  target.classList.remove("is-updated");
  void target.offsetWidth;
  target.classList.add("is-updated");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanText(value, fallback = "") {
  return String(value || fallback)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function queryParamValue(name) {
  try {
    return cleanText(new URLSearchParams(window.location.search).get(name), "");
  } catch (_error) {
    return "";
  }
}

function boolFromForm(formData, key) {
  return formData.get(key) === "on";
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function setAssistantVisible() {
  document.body.classList.add("jobsai-assist-visible");
}

function setSelectedTask(task) {
  selectedTask = WORK_TASKS[task] ? task : "hire";
  taskButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.workTask === selectedTask);
  });
}

function contextForDraft(value, task) {
  const config = WORK_TASKS[task] || WORK_TASKS.hire;
  return cleanText(value, config.fallback) || config.fallback;
}

function buildWorkMatchDraft(task = selectedTask, sentence = "") {
  const config = WORK_TASKS[task] || WORK_TASKS.hire;
  const context = contextForDraft(sentence, task);

  if (task === "resume") {
    return {
      label: config.label,
      title: config.title,
      summary: `JobsAI frames ${context} into a practical applicant-fit note that can be edited before use.`,
      cards: [
        { title: config.cards[0], copy: "Name the target role, seniority, and work setting." },
        { title: config.cards[1], copy: "Pull out specific experience, outcomes, and reliable support habits." },
        { title: config.cards[2], copy: "Mark unclear claims, missing examples, and anything that needs owner review." }
      ],
      bullets: ["Professional headline", "Proof-based summary", "Next resume improvement"],
      next: config.next
    };
  }

  if (task === "role") {
    return {
      label: config.label,
      title: config.title,
      summary: `JobsAI turns ${context} into role structure before it becomes a public listing.`,
      cards: [
        { title: config.cards[0], copy: "Define the daily work and what the owner should not have to repeat." },
        { title: config.cards[1], copy: "Separate must-have skills from preferred experience." },
        { title: config.cards[2], copy: "Set a short first milestone so fit is easier to review." }
      ],
      bullets: ["Role purpose", "Must-have signals", "30-day success measure"],
      next: config.next
    };
  }

  if (task === "review") {
    return {
      label: config.label,
      title: config.title,
      summary: `JobsAI organizes ${context} into a calmer applicant review system with approval boundaries.`,
      cards: [
        { title: config.cards[0], copy: "Use the same must-have criteria for every applicant." },
        { title: config.cards[1], copy: "Capture strengths, concerns, and follow-up questions in one place." },
        { title: config.cards[2], copy: "Pause before external messages, offers, rejections, or account changes." }
      ],
      bullets: ["Intake questions", "Review scorecard", "Owner approval checkpoint"],
      next: config.next
    };
  }

  return {
    label: config.label,
    title: config.title,
    summary: `JobsAI turns ${context} into a structured hiring brief with a clear next step.`,
    cards: [
      { title: config.cards[0], copy: "Name the role purpose, daily responsibilities, and first useful outcome." },
      { title: config.cards[1], copy: "List the experience, reliability, and communication signals worth reviewing." },
      { title: config.cards[2], copy: "Prepare candidate-facing copy and a simple response path." }
    ],
    bullets: ["Role clarity", "Hiring brief", "Candidate-facing copy"],
    next: config.next
  };
}

function renderWorkMatchDraft(draft) {
  if (!quickOutput) {
    return;
  }
  quickOutput.dataset.hasDraft = "true";
  quickOutput.innerHTML = `
    <p class="panel-label">${escapeHtml(draft.label)}</p>
    <h3>${escapeHtml(draft.title)}</h3>
    <p>${escapeHtml(draft.summary)}</p>
    <div class="draft-grid">
      ${draft.cards
        .map(
          (card) => `
            <article>
              <h4>${escapeHtml(card.title)}</h4>
              <p>${escapeHtml(card.copy)}</p>
            </article>
          `
        )
        .join("")}
    </div>
    <div class="result-block">
      <h4>Draft includes</h4>
      <ul>${renderList(draft.bullets)}</ul>
    </div>
    <p class="next-action-line"><span>Next</span>${escapeHtml(draft.next)}</p>
  `;
  revealOutput(quickOutput);
}

function generateQuickDraft(task = selectedTask, sentence = quickInput?.value || "") {
  setSelectedTask(task);
  renderWorkMatchDraft(buildWorkMatchDraft(selectedTask, sentence));
  setAssistantVisible();
}

function renderHeroPreview(preview) {
  if (!previewLabel || !previewTitle || !previewCopy || !previewList) {
    return;
  }
  previewLabel.textContent = preview.label;
  previewTitle.textContent = preview.title;
  previewCopy.textContent = preview.copy;
  previewList.innerHTML = preview.items.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function startHeroPreviewRotation() {
  if (!previewLabel || previewTimer) {
    return;
  }
  renderHeroPreview(HERO_PREVIEWS[previewIndex]);
  previewTimer = window.setInterval(() => {
    previewIndex = (previewIndex + 1) % HERO_PREVIEWS.length;
    renderHeroPreview(HERO_PREVIEWS[previewIndex]);
  }, 4200);
}

function customizeLeviSupport() {
  const support = document.querySelector(".levi-support");
  if (!support) {
    return;
  }

  support.querySelectorAll(".lrc-btn").forEach((button) => {
    if (/prepare starting plan/i.test(button.textContent || "")) {
      button.textContent = "Generate First Draft";
    }
  });

  const supportValue = support.querySelector(".lrc-output .lrc-value");
  if (supportValue && /runtime will prepare/i.test(supportValue.textContent || "")) {
    supportValue.textContent = "Use Levi only when you want help clarifying or finishing the JobsAI draft.";
  }

  const supportLabel = support.querySelector(".lrc-output .lrc-label");
  if (supportLabel) {
    supportLabel.textContent = "Levi Assist";
  }
}

function observeLeviSupport() {
  const support = document.querySelector(".levi-support");
  if (!support) {
    return;
  }
  customizeLeviSupport();
  const observer = new MutationObserver(customizeLeviSupport);
  observer.observe(support, { childList: true, subtree: true });
}

function buildBrief(payload) {
  const role = cleanText(payload.role, "the role") || "the role";
  const workType = cleanText(payload.workType, "Not sure yet");
  const stage = cleanText(payload.stage, "Need to define role");
  const needsPremium = payload.needsPremium || payload.needsResume || payload.needsIntake;

  const nextSteps = [
    `Define what ${role} does in the first 30 days.`,
    `Confirm whether the role is ${workType.toLowerCase()} before publishing.`,
    "Prepare applicant questions and owner review before external action."
  ];

  const listingFocus = ["Role purpose", "Daily responsibilities", "Applicant next step"];

  if (payload.needsResume) {
    listingFocus[2] = "Resume and applicant-fit support";
  }
  if (payload.needsIntake) {
    nextSteps[2] = "Create intake questions and review notes before applications arrive.";
  }

  return {
    packageName: needsPremium ? "Premium Support" : "Starter Brief",
    price: needsPremium ? "From $249" : "$99",
    summary: `${role} is in the "${stage}" stage. JobsAI should turn the need into a clear brief before publishing or upgrading the workflow.`,
    listingFocus,
    nextSteps,
    caution:
      "JobsAI provides informational hiring support only. Review listings for accuracy, compliance, and equal opportunity requirements before publishing."
  };
}

function renderBrief(brief) {
  if (!output) {
    return;
  }
  output.innerHTML = `
    <p class="panel-label">Recommended path</p>
    <p class="result-state" data-result-state="draftReady">Draft mode</p>
    <h3>${escapeHtml(brief.packageName)}</h3>
    <p class="price-result">${escapeHtml(brief.price)}</p>
    <p>${escapeHtml(brief.summary)}</p>

    <div class="result-block">
      <h4>Brief focus</h4>
      <ul>${renderList(brief.listingFocus)}</ul>
    </div>

    <div class="result-block">
      <h4>Next steps</h4>
      <ul>${renderList(brief.nextSteps)}</ul>
    </div>

    <p class="result-caution">${escapeHtml(brief.caution)}</p>
  `;
  revealOutput(output);
  setAssistantVisible();
}

function buildProfile(payload) {
  const targetRole = cleanText(payload.targetRole, "the target role") || "the target role";
  const experienceLevel = cleanText(payload.experienceLevel, "Experienced");
  const strengths = cleanText(
    payload.strengths,
    "organized communication, follow-through, scheduling, research, and practical support"
  );
  const proof = cleanText(
    payload.proof,
    "helped teams stay organized, followed up on details, and kept work moving"
  );

  const firstStrength = strengths.split(",")[0].trim() || "Operations";
  const headline = `${targetRole} support | ${firstStrength} | Practical and reliable`;
  const about = `I help teams and business owners stay organized, communicate clearly, and keep practical work moving. My strongest support areas include ${strengths}. I bring a ${experienceLevel.toLowerCase()} perspective and focus on useful follow-through, clean notes, and steady execution.`;

  return {
    headline,
    about,
    proofPoints: [
      `Target direction: ${targetRole}`,
      `Useful proof to include: ${proof}`,
      "Keep the tone specific, calm, and evidence-based."
    ],
    nextSteps: [
      "Add a recent role, project, or measurable example.",
      "Replace broad claims with concrete support work.",
      "Review for accuracy before posting anywhere."
    ],
    caution:
      "This is editable profile copy only. JobsAI is not affiliated with LinkedIn and does not publish, submit, or guarantee hiring outcomes."
  };
}

function renderProfile(profile) {
  if (!profileOutput) {
    return;
  }

  profileOutput.innerHTML = `
    <p class="panel-label">Profile draft</p>
    <p class="result-state" data-result-state="draftReady">Draft mode</p>
    <h3>Professional headline</h3>
    <p>${escapeHtml(profile.headline)}</p>

    <div class="result-block">
      <h4>About section</h4>
      <p>${escapeHtml(profile.about)}</p>
    </div>

    <div class="result-block">
      <h4>Profile notes</h4>
      <ul>${renderList(profile.proofPoints)}</ul>
    </div>

    <div class="result-block">
      <h4>Next improvements</h4>
      <ul>${renderList(profile.nextSteps)}</ul>
    </div>

    <p class="result-caution">${escapeHtml(profile.caution)}</p>
  `;
  revealOutput(profileOutput);
  setAssistantVisible();
}

taskButtons.forEach((button) => {
  button.addEventListener("click", () => {
    generateQuickDraft(button.dataset.workTask, quickInput?.value || "");
  });
});

startButtons.forEach((button) => {
  button.addEventListener("click", () => {
    generateQuickDraft(button.dataset.jobsaiStart, quickInput?.value || "");
  });
});

if (quickForm && quickOutput) {
  quickForm.addEventListener("submit", (event) => {
    event.preventDefault();
    generateQuickDraft(selectedTask, quickInput?.value || "");
  });
}

if (quickInput && quickOutput) {
  quickInput.addEventListener("input", () => {
    if (quickOutput.dataset.hasDraft !== "true") {
      return;
    }
    window.clearTimeout(liveDraftTimer);
    liveDraftTimer = window.setTimeout(() => {
      generateQuickDraft(selectedTask, quickInput.value);
    }, 220);
  });
}

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      role: formData.get("role"),
      workType: formData.get("workType"),
      stage: formData.get("stage"),
      needsListing: boolFromForm(formData, "needsListing"),
      needsResume: boolFromForm(formData, "needsResume"),
      needsIntake: boolFromForm(formData, "needsIntake"),
      needsPremium: boolFromForm(formData, "needsPremium")
    };

    renderBrief(buildBrief(payload));
  });
}

if (profileForm && profileOutput) {
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(profileForm);
    const payload = {
      targetRole: formData.get("targetRole"),
      experienceLevel: formData.get("experienceLevel"),
      strengths: formData.get("strengths"),
      proof: formData.get("proof")
    };

    renderProfile(buildProfile(payload));
  });
}

function shouldPrefillFromRouter() {
  return (
    queryParamValue("source") === "lrc-router" ||
    queryParamValue("levi") === "draft" ||
    queryParamValue("intent") === "jobs"
  );
}

function prefillRouterFields() {
  if (!shouldPrefillFromRouter()) return;
  const input = queryParamValue("input") ||
    "Executive assistant or operations support role with clear proof, responsibilities, and next application step.";

  if (quickInput) {
    quickInput.value = input;
    generateQuickDraft("hire", input);
  }

  if (form) {
    const roleField = form.querySelector("[name='role']");
    const workTypeField = form.querySelector("[name='workType']");
    const stageField = form.querySelector("[name='stage']");
    if (roleField) roleField.value = input;
    if (workTypeField) workTypeField.value = "Remote or hybrid";
    if (stageField) stageField.value = "Need to define role";
    ["needsListing", "needsResume", "needsIntake"].forEach((name) => {
      const field = form.querySelector(`[name='${name}']`);
      if (field) field.checked = true;
    });
  }

  if (profileForm) {
    const targetRole = profileForm.querySelector("[name='targetRole']");
    const experienceLevel = profileForm.querySelector("[name='experienceLevel']");
    const strengths = profileForm.querySelector("[name='strengths']");
    const proof = profileForm.querySelector("[name='proof']");
    if (targetRole) targetRole.value = input;
    if (experienceLevel) experienceLevel.value = "Experienced";
    if (strengths) strengths.value = "organized communication, follow-through, scheduling, research, and practical support";
    if (proof) proof.value = "kept work moving, followed up on details, and helped teams stay organized";
  }
}

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 220) {
      setAssistantVisible();
    }
  },
  { passive: true }
);

["pointerdown", "keydown"].forEach((eventName) => {
  document.addEventListener(
    eventName,
    (event) => {
      if (event.target.closest("#work-match, #brief, #profile, .hero-actions")) {
        setAssistantVisible();
      }
    },
    { passive: true }
  );
});

startHeroPreviewRotation();
observeLeviSupport();
prefillRouterFields();
