const pillarData = {
  founders: {
    kicker: "Founder Intake",
    title: "Route business ideas into Formed. or a custom LRC build.",
    body:
      "If you have an idea, LLC, domain, or service concept, you need the right next step before a pitch.",
    points: [
      "Formation and launch-page readiness",
      "Offer clarity and contact path",
      "Review-ready follow-up for serious requests",
    ],
  },
  jobs: {
    kicker: "Jobs & Talent",
    title: "Send hiring and applicant needs toward JobsAI.",
    body:
      "Employers, applicants, and founders can be separated by need so the follow-up is useful instead of generic.",
    points: [
      "Applicant profile and resume support",
      "Founder role brief and hiring intake",
      "Local work and service-market signals",
    ],
  },
  media: {
    kicker: "Trust + Growth",
    title: "Use trust signals and content to build qualified attention.",
    body:
      "SocialScan, content, and landing pages become a measurement layer: who responds, what you need, and what deserves more investment.",
    points: [
      "Profile scan and public story cleanup",
      "Short-form content and campaign pages",
      "Creator and local-business audience groups",
    ],
  },
  market: {
    kicker: "Market Signals",
    title: "Use Untapped. to test practical lanes before scaling.",
    body:
      "Audience gaps, product ideas, local services, and founder offers can be evaluated by opt-in demand before inventory or ad spend expands.",
    points: [
      "Audience-first market validation",
      "First-offer and waitlist signals",
      "Growth Signal exports for follow-up review",
    ],
  },
};

const markets = [
  ["New founders", "Business ideas, LLC setup, launch pages, first offers, and basic systems."],
  ["Applicants", "Resume support, profile clarity, role fit, and practical next steps."],
  ["Founders hiring", "Role briefs, applicant questions, pay notes, and cleaner hiring funnels."],
  ["Creators", "Content buckets, short-form clips, webinars, and audience-building support."],
  ["Local businesses", "Simple pages, contact paths, promotions, reviews, and repeatable offers."],
  ["Pet households", "Pet-ready products, local services, care routines, and trusted recommendations."],
  ["Wellness buyers", "Matcha, routines, recovery-friendly resources, and practical daily support."],
  ["Prepared homes", "Storm kits, home readiness, water, power, first response, and checklists."],
  ["Recovery supporters", "Donation-first resource paths and non-clinical daily companion tools."],
  ["Service operators", "Scheduling, lead capture, follow-up, customer notes, and proof systems."],
];

const routeMap = {
  founder: {
    label: "Business formation or launch",
    title: "Start with Formed. or an LRC build review.",
    body:
      "Use the suite to clarify the offer, audience, launch page, and lead path before adding more tools or promotion.",
    action: "Recommended first offer: formation review, launch page, or full buildout scope.",
    href: "../formed/index.html#review",
    cta: "Open Formed. review",
  },
  markets: {
    label: "Untapped. market lane",
    title: "Start with Untapped. before a larger build.",
    body:
      "Connect an audience, underserved gap, first useful offer, and demand test before investing more.",
    action: "Market: early audience. Offer: small validation package. Test: one landing-page draft, one outreach prompt, and one response tracker.",
    href: "#route",
    cta: "Keep market test here",
  },
  jobs: {
    label: "Hiring, jobs, or applicant support",
    title: "Route into JobsAI. or Careers.",
    body:
      "Separate applicant support from founder hiring so the follow-up is practical and easy to act on.",
    action: "Recommended first offer: resume/profile support, role brief, or hiring intake.",
    href: "../jobsai/index.html#brief",
    cta: "Open JobsAI.",
  },
  media: {
    label: "Trust, growth, or content engine",
    title: "Use the suite to build trust and audience before the campaign.",
    body:
      "Use SocialScan, content, partner pages, and clear CTAs to learn what the audience responds to.",
    action: "Recommended first offer: profile scan, content map, clip plan, or campaign landing page.",
    href: "../socialscan/index.html#audit",
    cta: "Open SocialScan.",
  },
  offshoot: {
    label: "Rebuild through Off Shoot.",
    title: "Use Off Shoot. as the second-lane rebuild.",
    body:
      "When the first plan stalls, reshape the learning into a product lane with a clearer audience and offer.",
    action: "Recommended first offer: fallback product blueprint and audience validation page.",
    href: "#route",
    cta: "Refine route",
  },
  support: {
    label: "Recovery resources or donation support",
    title: "Keep this resource-first and donation-forward.",
    body:
      "Route support-minded people toward Be Happy. resources and established donation paths before any paid LRC offer.",
    action: "Recommended first action: resource link, donation path, or free daily support tool.",
    href: "../behappy/index.html#checkin",
    cta: "Open Be Happy.",
  },
};

const tabs = document.querySelectorAll(".pillar-tab");
const panel = document.querySelector("#pillarPanel");
const marketList = document.querySelector("#marketList");
const shuffleButton = document.querySelector("#shuffleMarkets");
const routeForm = document.querySelector(".route-form");
const routeOutput = document.querySelector("#routeOutput");
const useRouteButton = document.querySelector("#useRoute");
const form = document.querySelector(".join-form");
const formNote = document.querySelector("#formNote");
const interestSelect = form?.querySelector('[name="interest"]');
const messageField = form?.querySelector('[name="message"]');
const exampleButtons = document.querySelectorAll("[data-select-interest]");
const suiteRouteButtons = document.querySelectorAll("[data-route-goal]");

let currentRoute = null;

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function queryParamValue(name) {
  try {
    return String(new URLSearchParams(window.location.search).get(name) || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);
  } catch (_error) {
    return "";
  }
}

function renderPillar(key) {
  const pillar = pillarData[key];
  panel.innerHTML = `
    <p class="panel-kicker">${pillar.kicker}</p>
    <h3>${pillar.title}</h3>
    <p>${pillar.body}</p>
    <ul>${pillar.points.map((point) => `<li>${point}</li>`).join("")}</ul>
  `;
}

function renderMarkets() {
  const selected = [...markets].sort(() => Math.random() - 0.5).slice(0, 6);
  marketList.innerHTML = selected
    .map(
      ([title, detail]) => `
        <article class="market-item">
          <strong>${title}</strong>
          <span>${detail}</span>
        </article>
      `
    )
    .join("");
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    renderPillar(tab.dataset.pillar);
  });
});

shuffleButton.addEventListener("click", renderMarkets);

function renderRoutePreview(data) {
  const route = routeMap[data.get("goal")] || routeMap.founder;
  const stage = String(data.get("stage") || "starting");
  const need = String(data.get("need") || "").trim();
  const stageText = {
    starting: "starting from rough notes",
    launching: "ready to launch publicly",
    active: "already active and needs growth",
    stalled: "the first plan stalled",
  }[stage] || "starting from rough notes";

  currentRoute = {
    interest: route.label,
    message: [
      `Route preview: ${route.title}`,
      `Stage: ${stageText}.`,
      need ? `Need: ${need}.` : "",
      route.action,
    ]
      .filter(Boolean)
      .join(" "),
  };

  routeOutput.innerHTML = `
    <p class="panel-kicker">Suggested route</p>
    <p class="result-state" data-result-state="${route === routeMap.offshoot ? "needsInput" : "draftReady"}">${route === routeMap.offshoot ? "Needs input" : "Draft mode"}</p>
    <h3>${escapeHtml(route.title)}</h3>
    <p>${escapeHtml(route.body)}</p>
    <p><strong>${escapeHtml(route.action)}</strong></p>
    <div class="result-block">
      <h4>Routed plan</h4>
      <ul>
        <li>Assigned tool: ${escapeHtml(route.label)}</li>
        <li>Blocker: ${escapeHtml(need || "The next useful output was not named yet.")}</li>
        <li>Allowed action: build the starting plan and stop before external action.</li>
      </ul>
    </div>
    <a class="secondary-dark-button" href="${escapeHtml(route.href)}">${escapeHtml(route.cta)}</a>
  `;
}

function previewRoute(goal, stage = "starting", need = "") {
  const data = new Map([
    ["goal", goal],
    ["stage", stage],
    ["need", need],
  ]);
  renderRoutePreview(data);
}

function useCurrentRoute() {
  if (!currentRoute) return;
  if (interestSelect) interestSelect.value = currentRoute.interest;
  if (messageField) messageField.value = currentRoute.message;
  document.querySelector("#join")?.scrollIntoView({ behavior: "auto", block: "start" });
}

routeForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderRoutePreview(new FormData(routeForm));
});

useRouteButton?.addEventListener("click", useCurrentRoute);

suiteRouteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const goal = button.dataset.routeGoal || "founder";
    previewRoute(
      goal,
      goal === "offshoot" ? "stalled" : goal === "markets" ? "active" : "starting",
      "Suite Hub routing"
    );
    document.querySelector("#route")?.scrollIntoView({ behavior: "auto", block: "start" });
  });
});

function prefillRouterFields() {
  const intent = queryParamValue("intent");
  if (
    queryParamValue("source") !== "lrc-router" &&
    queryParamValue("levi") !== "draft" &&
    !intent
  ) {
    return;
  }

  const goalMap = {
    business: "founder",
    jobs: "jobs",
    market: "markets",
    trust: "media",
    stuck: "offshoot"
  };
  const goal = goalMap[intent] || "offshoot";
  const input = queryParamValue("input") ||
    (intent === "market"
      ? "Early-stage founders who need one clear offer before spending on a larger build."
      : "The next move needs shaping and the system needs one routed plan.");

  if (routeForm) {
    routeForm.querySelector("[name='goal']").value = goal;
    routeForm.querySelector("[name='stage']").value = goal === "markets" ? "active" : "starting";
    routeForm.querySelector("[name='need']").value = input;
  }
}

exampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const interest = button.dataset.selectInterest || "";
    if (interestSelect) interestSelect.value = interest;
    if (messageField && !messageField.value.trim()) {
      messageField.value =
        "If the first plan does not work, I want to rebuild through Off Shoot. Brand lane, audience, offer, content engine, and lead capture.";
    }
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const payload = {
    source: "lrc-suite-hub",
    toolInterest: data.get("interest"),
    name: data.get("name"),
    email: data.get("email"),
    message: data.get("message"),
    contactConsent: data.get("contactConsent") === "on",
    researchConsent: data.get("researchConsent") === "on",
  };

  formNote.textContent = "Sending...";

  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "The intake could not be saved.");
    }

    form.reset();
    formNote.textContent = "Saved. LRC can review this path and follow up by email.";
  } catch (error) {
    formNote.textContent = error.message || "The intake could not be saved.";
  }
});

renderMarkets();
prefillRouterFields();
