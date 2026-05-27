(function () {
  const STORAGE_KEY = "lrc_goal_packet_v1";
  const form = document.querySelector("#goal-form");
  const input = document.querySelector("#goal-input");
  const result = document.querySelector("[data-goal-result]");
  const routeLabel = document.querySelector("[data-goal-route-label]");
  const title = document.querySelector("[data-goal-result-title]");
  const summary = document.querySelector("[data-goal-result-summary]");
  const cleanGoal = document.querySelector("[data-goal-clean]");
  const artifact = document.querySelector("[data-goal-artifact]");
  const steps = document.querySelector("[data-goal-steps]");
  const primaryAction = document.querySelector("[data-goal-primary-action]");
  const reset = document.querySelector("[data-goal-reset]");

  const profiles = {
    formed: {
      routeLabel: "Formed.",
      title: "Formed. is the next route.",
      summary: "This goal needs a small first packet: organization, templates, checklists, launch preparation, and next steps.",
      artifact: "A starter business packet with the offer, audience, setup checklist, assumptions, and review questions.",
      actionLabel: "Continue in Formed",
      actionHref: "../formed/?source=goal#formed-start",
      steps: [
        "Shape the smallest useful business packet.",
        "Review assumptions and missing details.",
        "Continue only after approval for checkout, publishing, filing, sending, or outside access.",
      ],
    },
    btl: {
      routeLabel: "Between The Lines",
      title: "Between The Lines is the next route.",
      summary: "This goal needs a small neutral report scope before any full report or unlock.",
      artifact: "A report brief with Cover metadata, key findings, timeline highlights, pattern analysis, behavioral signals, chronology, methodology, and disclaimer.",
      actionLabel: "Request Report Setup",
      actionHref: "../contact/?interest=Between%20The%20Lines&source=goal",
      steps: [
        "Prepare the smallest useful report scope without guessing intent.",
        "Keep chronology, timing gaps, shifts, and cited evidence separate from interpretation.",
        "Use the disclaimer before any full report, payment, or handoff.",
      ],
    },
  };

  const btlTerms = [
    "between the lines",
    "conversation",
    "messages",
    "message",
    "texts",
    "text thread",
    "chat",
    "timeline",
    "timing",
    "gaps",
    "chronology",
    "pattern",
    "report",
    "investigative",
  ];

  const formedTerms = [
    "business",
    "formed",
    "launch",
    "offer",
    "customer",
    "company",
    "startup",
    "service",
    "website",
    "brand",
    "template",
    "checklist",
    "packet",
    "structure",
  ];

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 420);
  }

  function includesAny(text, terms) {
    return terms.some((term) => text.includes(term));
  }

  function inferProfile(goal) {
    const lower = goal.toLowerCase();
    if (includesAny(lower, btlTerms)) return profiles.btl;
    if (includesAny(lower, formedTerms)) return profiles.formed;
    return profiles.formed;
  }

  function withGoalParam(href, goal) {
    const url = new URL(href, window.location.href);
    url.searchParams.set("goal", goal);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function renderPacket(goal, profile, shouldScroll) {
    routeLabel.textContent = profile.routeLabel;
    title.textContent = profile.title;
    summary.textContent = profile.summary;
    cleanGoal.textContent = goal;
    artifact.textContent = profile.artifact;
    steps.innerHTML = "";
    profile.steps.forEach((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      steps.appendChild(item);
    });
    primaryAction.textContent = profile.actionLabel;
    primaryAction.href = withGoalParam(profile.actionHref, goal);
    result.hidden = false;
    if (shouldScroll) result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function savePacket(goal, profile) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          goal,
          route: profile.routeLabel,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (_error) {
      // Local storage is optional for this page.
    }
  }

  function loadPacket() {
    const params = new URLSearchParams(window.location.search);
    const goalFromUrl = cleanText(params.get("goal"));
    if (goalFromUrl) return goalFromUrl;
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return cleanText(saved.goal);
    } catch (_error) {
      return "";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const goal = cleanText(input.value);
    if (!goal) {
      input.focus();
      input.setAttribute("aria-invalid", "true");
      return;
    }
    input.removeAttribute("aria-invalid");
    const profile = inferProfile(goal);
    savePacket(goal, profile);
    renderPacket(goal, profile, true);
  });

  reset.addEventListener("click", () => {
    input.value = "";
    input.removeAttribute("aria-invalid");
    result.hidden = true;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (_error) {
      // Local storage is optional for this page.
    }
    input.focus();
  });

  const initialGoal = loadPacket();
  if (initialGoal) {
    input.value = initialGoal;
    renderPacket(initialGoal, inferProfile(initialGoal), false);
  }
})();
