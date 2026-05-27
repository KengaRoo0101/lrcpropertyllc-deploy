const form = document.querySelector("#socialscan-form");
const output = document.querySelector("#socialscan-output");

function clean(value, fallback = "") {
  return String(value || fallback).replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

function queryParamValue(name) {
  try {
    return clean(new URLSearchParams(window.location.search).get(name), "");
  } catch (_error) {
    return "";
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function buildPlan(data) {
  const auditType = clean(data.get("auditType"), "Founder or owner profile");
  const goal = clean(data.get("goal"), "Look more trustworthy");
  const links = clean(data.get("links"), "No public links added yet.");
  const notes = clean(data.get("notes"), "No notes added yet.");

  const typeMap = {
    "Founder or owner profile": [
      "Make the bio say what you build, who it helps, and what the next step is.",
      "Pin or feature one post that explains the offer without sounding like an ad.",
      "Remove confusion between personal updates, business proof, and asks for support."
    ],
    "Applicant profile": [
      "Make experience, reliability, availability, and work style easy to understand.",
      "Connect profile language to the type of role or project you want next.",
      "Clean up posts or bios that distract from the work path you want."
    ],
    "Personal founder brand": [
      "Show the mission, the work ethic, and the human reason behind the company.",
      "Keep the public story consistent across profiles and pinned content.",
      "Use one clear call to action for people who want to help, hire, buy, or follow."
    ],
    "Company or tool launch": [
      "Make the profile explain the tool, the audience, and the first action.",
      "Use launch posts to show the problem, the promise, and the next step.",
      "Check that links, bios, and profile images match the live website."
    ],
    "Community presence": [
      "Make the community purpose clear before asking people to join.",
      "Show how input helps improve tools without making people feel watched.",
      "Create simple prompts people can answer safely and usefully."
    ]
  };

  const routeMap = {
    "Find better-fit work": {
      label: "Open JobsAI.",
      href: "../jobsai/index.html#resume",
      copy: "Use JobsAI. when the profile needs to support applicant fit, role clarity, or a stronger work story."
    },
    "Attract applicants": {
      label: "Build a founder role",
      href: "../jobsai/index.html#founders",
      copy: "Use JobsAI For Founders when the profile needs to support a cleaner role post or hiring path."
    },
    "Prepare for promotion": {
      label: "Open Formed.",
      href: "../formed/index.html#review",
      copy: "Use Formed. when the public profile needs to connect to a launch page, offer, or business buildout."
    },
    "Clean up mixed messaging": {
      label: "Open Route Guide",
      href: "../offshoot/index.html",
      copy: "Use Off Shoot. when the profile is pointing in too many directions and needs a cleaner route."
    }
  };

  return {
    auditType,
    goal,
    links,
    notes,
    actions: typeMap[auditType] || typeMap["Founder or owner profile"],
    route: routeMap[goal] || {
      label: "Open Formed.",
      href: "../formed/index.html#review",
      copy: "Use Formed. when the profile needs to support a clearer business launch, offer, or next public step."
    }
  };
}

if (form && output) {
  function renderPlan(data) {
    const plan = buildPlan(data);
    output.innerHTML = `
      <p class="eyebrow">Audit plan</p>
      <p class="result-state" data-result-state="draftReady">Draft mode</p>
      <h3>${escapeHtml(plan.auditType)}</h3>
      <p><strong>Goal:</strong> ${escapeHtml(plan.goal)}</p>
      <div class="result-block">
        <h4>Public inputs to review</h4>
        <p>${escapeHtml(plan.links)}</p>
      </div>
      <div class="result-block">
        <h4>What to pay attention to</h4>
        <p>${escapeHtml(plan.notes)}</p>
      </div>
      <div class="result-block">
        <h4>First cleanup actions</h4>
        <ul>${list(plan.actions)}</ul>
      </div>
      <div class="result-block">
        <h4>Next LRC path</h4>
        <p>${escapeHtml(plan.route.copy)}</p>
        <div class="socialscan-actions">
          <a class="primary-button" href="${escapeHtml(plan.route.href)}">${escapeHtml(plan.route.label)}</a>
          <a class="secondary-button" href="../offshoot/index.html#route">Compare another route</a>
        </div>
      </div>
    `;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderPlan(new FormData(form));
  });

  if (
    queryParamValue("source") === "lrc-router" ||
    queryParamValue("levi") === "draft" ||
    queryParamValue("intent") === "trust"
  ) {
    const input = queryParamValue("input") ||
      "Founder profile with mixed business, personal, and launch messaging.";
    form.querySelector("[name='auditType']").value = "Founder or owner profile";
    form.querySelector("[name='goal']").value = "Look more trustworthy";
    form.querySelector("[name='links']").value = "Public links or profile notes can be added here.";
    form.querySelector("[name='notes']").value = input;
  }
}
