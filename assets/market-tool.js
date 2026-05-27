(function () {
  const form = document.querySelector("#market-tool-form");
  const output = document.querySelector("#market-tool-output");
  const leadForm = document.querySelector("#lead-form");

  if (!form || !output) return;

  const offerMap = {
    formation: {
      title: "New founders with ideas but no launch system.",
      route: "Formed. or an LRC launch review",
      starter: "a formation and first-page review",
      chips: ["LLC setup", "First offer", "Launch page"],
    },
    jobs: {
      title: "Applicants and founders stuck between need and fit.",
      route: "JobsAI. or JobsAI For Founders",
      starter: "a resume, profile, role brief, or hiring intake",
      chips: ["Role fit", "Profile cleanup", "Hiring brief"],
    },
    trust: {
      title: "People with useful work but weak public proof.",
      route: "SocialScan plus content cleanup",
      starter: "a profile scan and public-story cleanup",
      chips: ["Trust signals", "Public profile", "Content map"],
    },
    local: {
      title: "Local operators with demand but no follow-up system.",
      route: "LRC service page and intake build",
      starter: "a simple offer page with lead capture",
      chips: ["Local demand", "Contact path", "Follow-up"],
    },
    product: {
      title: "Product ideas that need demand before more spend.",
      route: "Off Shoot. fallback product path",
      starter: "a product blueprint and audience validation page",
      chips: ["Audience test", "Offer map", "Fallback lane"],
    },
    support: {
      title: "Support-minded people who need resource-first structure.",
      route: "Be Happy. resource path",
      starter: "a free support route, resource link, or donation-forward path",
      chips: ["Daily support", "Resources", "Donation-first"],
    },
  };

  const gapMap = {
    clarity: {
      label: "the next step needs shaping",
      action: "Start with a one-page explanation of the need, audience, and first action.",
    },
    trust: {
      label: "proof and confidence are missing",
      action: "Test with a trust review, public profile cleanup, and one clear proof point.",
    },
    followup: {
      label: "interest exists but follow-up is weak",
      action: "Add a direct intake, response promise, and review-ready summary.",
    },
    fit: {
      label: "the right match is hard to find",
      action: "Separate the audience by stage, need, and readiness before offering help.",
    },
    validation: {
      label: "demand needs to be proven before spending more",
      action: "Use a small waitlist, landing page, or review offer before a larger build.",
    },
  };

  const stageMap = {
    rough: "Write the market in one sentence, then test the smallest useful offer.",
    test: "Publish a focused intake and measure which audience responds.",
    active: "Use the current attention to tighten the offer and follow-up system.",
    stalled: "Move the learning into an Off Shoot. rebuild path before spending more.",
  };

  let currentRoute = "";

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cleanText(value, fallback) {
    return String(value || fallback)
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
  }

  function renderChips(items) {
    return items.map((item) => `<span class="market-pill">${escapeHtml(item)}</span>`).join("");
  }

  function setLeadRequest() {
    if (!currentRoute || !leadForm) return;

    const interestField = leadForm.elements.toolInterest;
    const messageField = leadForm.elements.message;
    const sourceField = leadForm.elements.source;

    if (interestField) interestField.value = "Untapped.";
    if (messageField) messageField.value = currentRoute;
    if (sourceField) sourceField.value = "lrc-market-tool";

    document.querySelector("#lead")?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const offer = offerMap[data.get("offer")] || offerMap.formation;
    const gap = gapMap[data.get("gap")] || gapMap.clarity;
    const stageAction = stageMap[data.get("stage")] || stageMap.rough;
    const audience = cleanText(data.get("audience"), "this audience");

    currentRoute = [
      `Untapped. ${offer.title}`,
      `Audience: ${audience}.`,
      `Gap: ${gap.label}.`,
      `First useful offer: ${offer.starter}.`,
      `Test path: ${gap.action}`,
      `LRC route: ${offer.route}.`,
      `Next move: ${stageAction}`,
    ].join(" ");

    output.innerHTML = `
      <p class="panel-label">Market lane</p>
      <h3>${escapeHtml(offer.title)}</h3>
      <p>
        Start by testing <strong>${escapeHtml(audience)}</strong> where ${escapeHtml(gap.label)}.
        Keep the offer small enough to learn from before building the larger system.
      </p>
      <ul class="market-route-list">
        <li><strong>First useful offer:</strong> ${escapeHtml(offer.starter)}</li>
        <li><strong>Test path:</strong> ${escapeHtml(gap.action)}</li>
        <li><strong>LRC route:</strong> ${escapeHtml(offer.route)}</li>
        <li><strong>Next move:</strong> ${escapeHtml(stageAction)}</li>
      </ul>
      <div class="market-pill-row">${renderChips(offer.chips)}</div>
      <div class="market-tool-actions">
        <button class="primary-button" type="button" data-use-market-route>Use this in request</button>
        <a class="secondary-button" href="./offshoot/index.html">Open Suite Hub</a>
      </div>
    `;

    output.classList.remove("is-updated");
    void output.offsetWidth;
    output.classList.add("is-updated");
  });

  output.addEventListener("click", (event) => {
    if (event.target.closest("[data-use-market-route]")) {
      setLeadRequest();
    }
  });
})();
