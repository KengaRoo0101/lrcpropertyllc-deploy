(function () {
  const guides = {
    home: {
      agent: "LRC Guide",
      guideName: "Levi",
      kicker: "Friendly AI guide",
      short: "Let me guide you",
      title: "Let Levi guide you.",
      greeting:
        "Ask a question, pick a simple option, or type a few words. I will answer first, then point you to the best next step.",
      says: "I recommend the next move, work the safe parts of the page, and help turn prompts into working LRC solutions.",
      canDo: [
        "Call in Ninja when the work spans multiple sites, deployment steps, payment checks, or computer/Codex actions.",
        "Match a rough idea to the right site and working solution.",
        "Look for useful connections between your goals, tools, and next actions.",
        "Do as much of the safe page work as your need allows.",
        "Adjust guidance as you move from beginner to experienced team member.",
        "Recognize useful contributions and turn consented signals into cleaner product and data signals for LRC."
      ],
      prompts: [
        "Use Ninja for the overall flow",
        "What can I do here?",
        "Route this for me",
        "Build a working solution",
        "I'm stuck"
      ],
      responses: [
        "Ninja manages the LRC agent flow from a computer-based console across sites, tasks, checks, deployments, and approvals. It assigns focused agents, tracks blockers, requests scoped computer/Codex access when the next safe step needs it, then asks explicit approval before guarded actions.",
        "Start with the thing you want finished. I will introduce the closest agent, look for useful connections, match the level of help to your know-how, prepare the safe page work, and wait for approval before anything leaves the page.",
        "I can recommend the closest path, fill the router, prepare the solution, and suggest when another LRC site should work with this one.",
        "Each site has a working solution: build path, work brief, market signal, trust check, solution path, or support step. The stronger path often connects more than one site.",
        "I can reduce this to the next safe action, keep you moving toward the end goal, then ask for approval before any transaction or submission."
      ],
      ctaLabel: "Start AI route",
      ctaHref: "#ai-router",
      emptyAnswer:
        "Across LRC, I can recommend the path, adapt to your know-how, look for useful cross-site connections, prepare as much safe page work as possible, and help turn the prompt into a working solution: a business build path, work brief, market signal, trust check, solution path, or support step. I stop for approval before anything is sent, filed, published, purchased, or changed."
    },
    formed: {
      agent: "Founder Build Agent",
      guideName: "Levi",
      kicker: "Formed. helper",
      short: "Let me guide you",
      title: "Let Levi guide you.",
      greeting:
        "Ask a question, pick a simple option, or type a few words. I will help find the next business step.",
      says: "Bring the idea. I can prepare the next business step for you, then stop for approval.",
      canDo: [
        "Prepare the next business setup step.",
        "Draft the build path, launch page, or follow-up flow.",
        "Collect the useful founder signal without making contact the main outcome."
      ],
      prompts: [
        "What can I do here?",
        "Choose build path",
        "I'm stuck"
      ],
      responses: [
        "Wow, that has a buildable shape. Let's make the first version clear enough to act on.",
        "I see what you're saying. Did you think about starting with the offer before the full system?",
        "What if we maybe reduce this to the next useful proof instead of trying to build everything at once?"
      ],
      ctaLabel: "Open first step",
      ctaHref: "#review"
    },
    jobsai: {
      agent: "Work Match Agent",
      guideName: "Levi",
      kicker: "JobsAI helper",
      short: "Let me guide you",
      title: "Let Levi guide you.",
      greeting:
        "Ask a question, pick a simple option, or type a few words. I will help clarify the work path.",
      says: "Clear work creates clearer opportunity.",
      canDo: [
        "Turn role confusion into a cleaner brief.",
        "Help applicants explain strengths and proof.",
        "Give founders clearer fit signals."
      ],
      prompts: [
        "What can I do here?",
        "Improve fit",
        "I'm stuck"
      ],
      responses: [
        "That's useful. Let's make the strongest proof easy to use.",
        "I see what you're saying. What about naming the work outcome before listing tasks?",
        "What if we maybe separate must-have skills from teachable skills?"
      ],
      ctaLabel: "Open work path",
      ctaHref: "#brief"
    },
    offshoot: {
      agent: "Route Guide Agent",
      guideName: "Levi",
      kicker: "Off Shoot helper",
      short: "Let me guide you",
      title: "Let Levi guide you.",
      greeting:
        "Ask a question, pick a simple option, or type a few words. I will help route the next move.",
      says: "No pressure to have it all sorted. Start with the closest lane.",
      canDo: [
        "Route a rough idea to the right site.",
        "Reduce wandering between tools.",
        "Help LRC understand what path people actually need."
      ],
      prompts: [
        "What can I do here?",
        "Find path",
        "I'm stuck"
      ],
      responses: [
        "Good. A rough idea is enough to start routing.",
        "I see what you're saying. Did you think about whether this is a build need or a market test?",
        "What if we maybe choose the smallest useful next path first?"
      ],
      ctaLabel: "Open route tool",
      ctaHref: "#route"
    },
    socialscan: {
      agent: "Trust Check Agent",
      guideName: "Levi",
      kicker: "SocialScan helper",
      short: "Let me guide you",
      title: "Let Levi guide you.",
      greeting:
        "Ask a question, pick a simple option, or type a few words. I will help clean up the first impression.",
      says: "A clearer profile creates clearer opportunity.",
      canDo: [
        "Review what a public profile communicates.",
        "Suggest the first cleanup step.",
        "Route profile needs into hiring, launch, or brand support."
      ],
      prompts: [
        "What can I do here?",
        "Check profile",
        "I'm stuck"
      ],
      responses: [
        "Nice. Let's make what your audience sees first match what you want them to understand.",
        "I see what you're saying. What about making the next action clearer in the bio?",
        "What if we maybe fix the first visible signal before adding more content?"
      ],
      ctaLabel: "Open trust check",
      ctaHref: "#audit"
    },
    behappy: {
      agent: "Daily Support Agent",
      guideName: "Levi",
      kicker: "Be Happy helper",
      short: "Let me guide you",
      title: "Let Levi guide you.",
      greeting:
        "Ask a question, pick a simple option, or type a few words. I will help keep the next step small.",
      says: "One honest step still counts. You do not have to carry the whole day at once.",
      canDo: [
        "Keep the next step small and steady.",
        "Point to support resources without replacing real care.",
        "Help organize general feedback when you choose to share it."
      ],
      prompts: [
        "What can I do here?",
        "One step",
        "I'm stuck"
      ],
      responses: [
        "That's enough for right now. One steady step is still movement.",
        "I see what you're saying. What about choosing the easiest safe action first?",
        "What if we maybe make this smaller so it is actually doable today?"
      ],
      ctaLabel: "Open check-in",
      ctaHref: "#checkin"
    },
    careers: {
      agent: "Applicant Fit Agent",
      guideName: "Levi",
      kicker: "Careers helper",
      short: "Let me guide you",
      title: "Let Levi guide you.",
      greeting:
        "Ask a question, pick a simple option, or type a few words. I will help make your proof easier to use.",
      says: "Say less, but make the right signal easy to see.",
      canDo: [
        "Shape a cleaner applicant note.",
        "Keep proof connected to the role.",
        "Prepare a better solution path into LRC hiring."
      ],
      prompts: [
        "What can I do here?",
        "Shape note",
        "I'm stuck"
      ],
      responses: [
        "That's a solid start. Let's make the strongest proof easy to find.",
        "I see what you're saying. Did you think about leading with the result you can create?",
        "What if we maybe remove anything that does not support the role?"
      ],
      ctaLabel: "Open application",
      ctaHref: "#apply"
    }
  };

  const autonomyRules = [
    "Act inside this page first: open the right tool, fill safe fields, draft useful output, and show the next step.",
    "Route across LRC when another product is a better fit, carrying only non-sensitive context.",
    "Promote the chosen product on its own and as part of the LRC ecosystem with approval-ready copy.",
    "Report safe action telemetry to admin so LRC can see what worked and what got blocked.",
    "Stop before payment, posting, filing, sending, consent-required submit, account access, or external changes."
  ];

  const LEVI_ROUTES = {
    formed: "Formed. Business Builder",
    jobsai: "JobsAI Work Match",
    untapped: "Untapped Market Finder",
    socialscan: "SocialScan Trust Check",
    offshoot: "Off Shoot Route Guide",
    behappy: "Be Happy Daily Support",
    clarity: "LRC Conversation Clarity"
  };

  const LEVI_PROMOTION = {
    formed: {
      independent: "Promote Formed. as the place to turn a business idea, LLC path, launch page, offer, or operating layer into a review-ready first build.",
      ecosystem: "Tie Formed. back to LRC by showing how JobsAI, SocialScan, Untapped, Off Shoot, Be Happy, and Conversation Clarity can support the founder after the first business path is clear."
    },
    jobsai: {
      independent: "Promote JobsAI as the place to clarify roles, applicant proof, resume direction, hiring needs, and founder work paths.",
      ecosystem: "Tie JobsAI back to LRC by routing founders to Formed., public trust work to SocialScan, market signals to Untapped, and early custom needs to Off Shoot."
    },
    untapped: {
      independent: "Promote Untapped as the place to test audience gaps, demand signals, first offers, and practical market lanes before building too much.",
      ecosystem: "Tie Untapped back to LRC by turning demand into Formed. build paths, SocialScan trust checks, JobsAI roles, and Off Shoot routing."
    },
    socialscan: {
      independent: "Promote SocialScan as the place to review public profile signals, trust gaps, bios, links, and first impressions before promotion or outreach.",
      ecosystem: "Tie SocialScan back to LRC by connecting cleaner public trust to Formed. launch pages, JobsAI applicant proof, Untapped audience tests, and Off Shoot routes."
    },
    offshoot: {
      independent: "Promote Off Shoot as the place to route rough, stalled, or unusual ideas into the closest useful next LRC path.",
      ecosystem: "Tie Off Shoot back to LRC by making it the switchboard for Formed., JobsAI, Untapped, SocialScan, Be Happy, Careers, and Conversation Clarity."
    },
    behappy: {
      independent: "Promote Be Happy as the place to keep one day visible through reflection, support options, resource-first guidance, and a small next step.",
      ecosystem: "Tie Be Happy back to LRC by keeping daily support separate from business, hiring, trust, market, and conversation tools while still helping people find the right path."
    },
    clarity: {
      independent: "Promote LRC Conversation Clarity as the place to turn long conversations into timing, gaps, shifts, chronology, and review moments without claiming intent or proof.",
      ecosystem: "Tie Conversation Clarity back to LRC by routing next steps into Off Shoot, SocialScan, Be Happy, JobsAI, or Formed. when the report reveals a practical need."
    }
  };
  let lastRenderedForcedLeviOutput = null;

  function routeCatalogKeyForLevi(routeKey) {
    if (routeKey === "untapped") return "market";
    if (routeKey === "clarity") return "conversation";
    return routeKey;
  }

  function buildForcedLeviOutput(input = {}) {
    const rawGoal = (input.goal || input.idea || input.message || "").trim();
    const audience = (input.audience || "the person who needs the next clear step").trim();
    const blocker = (input.blocker || input.problem || input.need || "").trim();
    const selectedPath = (input.path || "").trim();

    const goal = rawGoal || "Build this output";
    const need = blocker || "Turn this into the closest LRC workflow and prepare the next safe action.";

    const lower = `${goal} ${audience} ${need} ${selectedPath}`.toLowerCase();

    let routeKey = "offshoot";

    if (lower.includes("llc") || lower.includes("business") || lower.includes("start a business") || lower.includes("need structure") || lower.includes("structure") || lower.includes("launch") || lower.includes("formed")) {
      routeKey = "formed";
    } else if (lower.includes("job") || lower.includes("resume") || lower.includes("hiring") || lower.includes("role")) {
      routeKey = "jobsai";
    } else if (lower.includes("market") || lower.includes("audience") || lower.includes("offer") || lower.includes("demand")) {
      routeKey = "untapped";
    } else if (lower.includes("profile") || lower.includes("trust") || lower.includes("social") || lower.includes("brand")) {
      routeKey = "socialscan";
    } else if (lower.includes("daily") || lower.includes("routine") || lower.includes("support") || lower.includes("recovery")) {
      routeKey = "behappy";
    } else if (lower.includes("conversation") || lower.includes("timeline") || lower.includes("messages") || lower.includes("report")) {
      routeKey = "clarity";
    }

    const route = LEVI_ROUTES[routeKey];
    const promotion = LEVI_PROMOTION[routeKey] || LEVI_PROMOTION.offshoot;
    const routeConfig = routeCatalog[routeCatalogKeyForLevi(routeKey)] || routeCatalog.offshoot;
    const routeUrl = routeConfig ? routeHref(routeConfig, detectGuide()) : "#";
    const promotionDraft = `${route} helps ${audience} move from "${goal}" into a clearer next step. ${promotion.independent} Start with LRC Property LLC, then use ${route} when this is the path that fits.`;

    return {
      route,
      route_key: routeKey,
      route_url: routeUrl,
      reason: `${route} is the best starting path because the request needs a structured next step instead of more browsing.`,
      output: {
        title: `${route} Starter Output`,
        summary: `A review-ready first version for: ${goal}`,
        sections: [
          {
            heading: "Goal",
            content: goal
          },
          {
            heading: "Audience",
            content: audience
          },
          {
            heading: "Polished product to build",
            content: need
          },
          {
            heading: "First deliverable",
            content: `Create a polished ${route} starter product that names the outcome, the team member, the offer or workflow, the proof points, the next action, and what should be reviewed before anything is submitted or paid for.`
          },
          {
            heading: "Independent promotion",
            content: promotion.independent
          },
          {
            heading: "Ecosystem promotion",
            content: promotion.ecosystem
          },
          {
            heading: "Draft promotion preview",
            content: promotionDraft
          },
          {
            heading: "Approval boundary",
            content: "Levi can prepare copy, route people, fill safe fields, and draft the promotion handoff. A person must approve before posting, sending, submitting, buying, filing, or changing access."
          },
          {
            heading: "Ninja continuity",
            content: "Ninja keeps the route, blocker, review gate, and next move connected without adding extra panels."
          },
          {
            heading: "Secure checkout path",
            content: "Starting plan, owner review, then checkout hold or owner-approved checkout only when payment is enabled."
          },
          {
            heading: "Checklist",
            content: "1. Confirm the goal.\n2. Confirm the audience.\n3. Pick the closest LRC path.\n4. Generate the first useful draft.\n5. Prepare independent and ecosystem promotion copy.\n6. Stop before submission, payment, publishing, filing, or external changes."
          }
        ]
      },
      next_action: `Continue in ${route} with this structured brief, then stop at the owner approval gate before checkout, publishing, filing, sending, or external changes.`,
      promotion_draft: promotionDraft,
      upgrade_prompt: `Upgrade when you want LRC to turn this preview into a full ${route} deliverable, implementation path, launch asset, report, promotion campaign, or done-for-you build.`
    };
  }

  function isValidLeviOutput(data) {
    return Boolean(
      data &&
      typeof data.route === "string" &&
      typeof data.reason === "string" &&
      data.output &&
      typeof data.output.title === "string" &&
      typeof data.output.summary === "string" &&
      Array.isArray(data.output.sections) &&
      data.output.sections.length > 0 &&
      typeof data.next_action === "string" &&
      typeof data.upgrade_prompt === "string"
    );
  }

  function renderForcedLeviOutput(data, target) {
    if (!isValidLeviOutput(data)) {
      data = buildForcedLeviOutput({});
    }
    lastRenderedForcedLeviOutput = data;

    const preview =
      target ||
      document.querySelector("[data-levi-output]") ||
      document.querySelector("#levi-output") ||
      document.querySelector(".levi-preview") ||
      document.querySelector(".agent-preview");

    if (!preview) {
      console.warn("No Levi output container found.");
      return;
    }

    preview.innerHTML = `
      <section class="levi-output-card">
        <p class="eyebrow">Recommended route</p>
        <h3>${escapeHtml(data.route)}</h3>
        <p>${escapeHtml(data.reason)}</p>

        <div class="levi-deliverable">
          <p class="eyebrow">Starter deliverable</p>
          <h4>${escapeHtml(data.output.title)}</h4>
          <p>${escapeHtml(data.output.summary)}</p>
          ${data.output.sections.map(section => `
            <div class="levi-section">
              <h5>${escapeHtml(section.heading)}</h5>
              <p>${escapeHtml(section.content).replace(/\n/g, "<br>")}</p>
            </div>
          `).join("")}
        </div>

        <div class="levi-next-action">
          <strong>Next action:</strong>
          <p>${escapeHtml(data.next_action)}</p>
        </div>

        <div class="levi-upgrade">
          <strong>Upgrade path:</strong>
          <p>${escapeHtml(data.upgrade_prompt)}</p>
        </div>

        <div class="levi-work-actions">
          ${data.route_url ? `<a class="agent-guide-preview-button levi-primary-cta" href="${escapeHtml(data.route_url)}">Continue in ${escapeHtml(data.route)}</a>` : ""}
        </div>
      </section>
    `;
  }

  function buildLeviBriefText(data) {
    if (!isValidLeviOutput(data)) data = buildForcedLeviOutput({});
    const sections = data.output.sections
      .map((section) => `${section.heading}\n${section.content}`)
      .join("\n\n");
    return [
      `Recommended route\n${data.route}`,
      `Reason\n${data.reason}`,
      `Starter deliverable\n${data.output.title}\n${data.output.summary}`,
      sections,
      `Next action\n${data.next_action}`,
      `Upgrade path\n${data.upgrade_prompt}`
    ].join("\n\n");
  }

  async function copyLastLeviBrief(button) {
    const text = buildLeviBriefText(lastRenderedForcedLeviOutput);
    try {
      await navigator.clipboard.writeText(text);
      if (button) button.textContent = "Brief copied";
    } catch {
      if (button) button.textContent = "Copy unavailable";
    }
  }

  function detectGuide() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/formed/")) return "formed";
    if (path.includes("/jobsai/")) return "jobsai";
    if (path.includes("/offshoot/")) return "offshoot";
    if (path.includes("/socialscan/")) return "socialscan";
    if (path.includes("/behappy/")) return "behappy";
    if (path.includes("/careers/")) return "careers";
    return "home";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  const routeCatalog = {
    formed: {
      label: "Formed.",
      agent: "Founder Build Agent",
      href: "/formed/index.html?interest=Formed.+Business+Builder&source=lrc-agent-founder-build#review",
      localHref: "./formed/index.html?interest=Formed.+Business+Builder&source=lrc-agent-founder-build#review",
      outcome: "Business build path",
      reason: "Use when the need is setup, launch, offer clarity, website, operations, or AI buildout.",
      terms: ["business", "idea", "llc", "formed", "formation", "launch", "offer", "website", "domain", "founder", "startup", "company"]
    },
    jobsai: {
      label: "JobsAI",
      agent: "Work Match Agent",
      href: "/jobsai/#brief",
      localHref: "./jobsai/index.html#brief",
      outcome: "Work fit brief",
      reason: "Use when the need is hiring, roles, applicants, resumes, profiles, or work fit.",
      terms: ["job", "jobs", "hiring", "hire", "resume", "applicant", "role", "work", "career", "associate", "candidate"]
    },
    market: {
      label: "Untapped",
      agent: "Market Signal Agent",
      href: "/#untapped-markets",
      localHref: "#untapped-markets",
      outcome: "Market lane",
      reason: "Use when the need is audience, demand, customer gaps, validation, niche, or first offer testing.",
      terms: ["market", "audience", "demand", "untapped", "customer", "lane", "niche", "validate", "validation", "gap"]
    },
    socialscan: {
      label: "SocialScan",
      agent: "Trust Check Agent",
      href: "/socialscan/#audit",
      localHref: "./socialscan/index.html#audit",
      outcome: "Trust cleanup",
      reason: "Use when the need is profile, brand, public trust, social presence, bio, content, or outreach readiness.",
      terms: ["profile", "trust", "social", "linkedin", "brand", "public", "bio", "content", "presence", "outreach"]
    },
    offshoot: {
      label: "Off Shoot",
      agent: "Route Guide Agent",
      href: "/offshoot/#route",
      localHref: "./offshoot/index.html#route",
      outcome: "Solution route",
      reason: "Use when the need is rough, stalled, custom, early, or split across more than one product.",
      terms: ["stuck", "route", "custom", "workflow", "not sure", "confused", "where", "stalled"]
    },
    behappy: {
      label: "Be Happy",
      agent: "Daily Support Agent",
      href: "/behappy/#checkin",
      localHref: "./behappy/index.html#checkin",
      outcome: "Small support step",
      reason: "Use when the need is daily support, routine, resource-first progress, check-ins, or recovery-friendly next steps.",
      terms: ["daily", "recovery", "support", "meeting", "routine", "happy", "check-in", "checkin", "resource", "habit"]
    },
    conversation: {
      label: "Conversation Clarity",
      agent: "Conversation Review Agent",
      href: "/#paywall",
      localHref: "#paywall",
      outcome: "Conversation preview",
      reason: "Use when the need is message timing, gaps, shifts, chronology, or a full conversation report.",
      terms: ["conversation", "message", "messages", "text", "thread", "chat", "timing", "gap", "gaps", "shift", "chronology", "report", "clarity"]
    },
    careers: {
      label: "Careers",
      agent: "Applicant Fit Agent",
      href: "/careers/#apply",
      localHref: "./careers/index.html#apply",
      outcome: "Applicant fit note",
      reason: "Use when the need is applying directly to LRC or making proof easier to use for an open role.",
      terms: ["apply", "application", "assistant", "career", "proof", "interview", "opening"]
    }
  };

  const siteRouteKey = {
    formed: "formed",
    jobsai: "jobsai",
    offshoot: "offshoot",
    socialscan: "socialscan",
    behappy: "behappy",
    careers: "careers"
  };

  const founderFeedKey = "lrcFounderAgentFeedV1";
  const pendingGuideActionKey = "lrcPendingGuideActionV1";

  const collaborationPaths = {
    formed: "Founder build can connect to market testing, hiring, public trust, and AI operations.",
    jobsai: "Work signals can connect applicants, founders, roles, proof, and next hiring steps.",
    market: "Market signals can connect founder ideas to audiences, offers, landing pages, and outreach.",
    socialscan: "Trust signals can connect profile cleanup to JobsAI, Formed., launch content, and outreach.",
    offshoot: "Route signals can connect early needs to the closest product, tool, or custom build path.",
    behappy: "Support signals can connect daily progress to small routines, resources, and sustainable follow-through.",
    conversation: "Conversation signals can connect timing, gaps, and chronology review to a clear report path without guessing intent.",
    careers: "Applicant signals can connect proof, availability, and LRC support needs."
  };

  const founderAdvice = {
    home: "Founder note: keep the ecosystem pointed at finished outputs, not just interest. The strongest signal is what you try to build next.",
    formed: "Founder note: name the business path simply before offering a bigger package. Store the offer, stage, blocker, and next build step.",
    jobsai: "Founder note: matching gets stronger when role needs and applicant proof are stored as structured signals, not loose messages.",
    market: "Founder note: market feedback should tell you which audience, gap, and first offer deserve more build time.",
    socialscan: "Founder note: public-trust work should connect profile cleanup to launch, hiring, outreach, or brand support.",
    offshoot: "Founder note: route confusion is product data. Store where you get stuck and which site should take the next step.",
    behappy: "Founder note: support paths should stay small, human, and resource-first. Store only general patterns that improve care-facing guidance.",
    conversation: "Founder note: conversation reports should stay precise: timing, gaps, shifts, and chronology without claiming intent.",
    careers: "Founder note: applicant signals should clarify proof, availability, and fit so LRC can route work support better."
  };

  function routeHref(route, currentSite) {
    if (window.location.protocol !== "file:") return route.href;
    if (currentSite === "home") return route.localHref;
    if (route.href === "/#untapped-markets") return "../index.html#untapped-markets";
    const [path, hash] = route.href.split("#");
    return `..${path}index.html${hash ? `#${hash}` : ""}`;
  }

  function inferRouteMatches(prompt, currentSite) {
    const lower = String(prompt || "").toLowerCase();
    const currentRouteKey = siteRouteKey[currentSite] || null;
    const scored = Object.entries(routeCatalog).map(([key, route]) => {
      const termScore = route.terms.reduce((score, term) => score + (lower.includes(term) ? 3 : 0), 0);
      const currentScore = key === currentRouteKey ? 2 : 0;
      const fallbackScore = !lower && key === currentRouteKey ? 5 : 0;
      const routeFallback = !lower && key === "offshoot" && currentSite !== "offshoot" ? 1 : 0;
      return { key, route, score: termScore + currentScore + fallbackScore + routeFallback };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ key, route }) => ({
        key,
        label: route.label,
        agent: route.agent,
        outcome: route.outcome,
        reason: route.reason,
        href: routeHref(route, currentSite)
      }));
  }

  function ensureForwardRoutes(prompt, currentSite, routes) {
    const usable = Array.isArray(routes)
      ? routes.filter((route) => route && route.href && route.href !== "#lead")
      : [];
    if (usable.length) return usable;
    const fallback = routeCatalog.offshoot;
    return [
      {
        key: "offshoot",
        label: fallback.label,
        agent: fallback.agent,
        outcome: fallback.outcome,
        reason: fallback.reason,
        href: routeHref(fallback, currentSite || "home")
      }
    ];
  }

  function firstForwardRoute(prompt, currentSite, routes) {
    return ensureForwardRoutes(prompt, currentSite, routes)[0] || null;
  }

  function makeList(items) {
    return items.map((item) => `<li>${item}</li>`).join("");
  }

  function makePrompts(items) {
    return items
      .map((item, index) => `<button class="agent-guide-chip" type="button" data-guide-prompt="${index}">${item}</button>`)
      .join("");
  }

  function makeRouteList(routes) {
    if (!Array.isArray(routes) || !routes.length) return "";
    return `
      <div class="agent-route-list" aria-label="Recommended LRC solution paths">
        ${routes
          .map(
            (route) => `<a class="agent-route-chip" href="${escapeHtml(route.href)}">
              <span>${escapeHtml(route.label)}</span>
              <strong>${escapeHtml(route.outcome)}</strong>
            </a>`
          )
          .join("")}
      </div>
    `;
  }

  function readFounderFeed() {
    try {
      const parsed = JSON.parse(localStorage.getItem(founderFeedKey) || "[]");
      return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
    } catch {
      localStorage.removeItem(founderFeedKey);
      return [];
    }
  }

  function writeFounderFeed(items) {
    localStorage.setItem(founderFeedKey, JSON.stringify(items.slice(0, 12)));
  }

  function recordFounderSignal(site, prompt, asset, routes) {
    if (!asset || asset.blocked) return readFounderFeed();
    const signal = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      site,
      agent: asset.agent || "Levi",
      assetType: asset.assetType || "Page answer",
      prompt: String(prompt || "").slice(0, 120),
      summary: String(asset.summary || "").slice(0, 180),
      routes: (Array.isArray(routes) ? routes : []).map((route) => route.key || route.label).slice(0, 3),
      createdAt: new Date().toISOString()
    };
    const next = [signal, ...readFounderFeed().filter((item) => item.summary !== signal.summary)].slice(0, 12);
    writeFounderFeed(next);
    return next;
  }

  function readPendingGuideAction() {
    try {
      const pending = JSON.parse(sessionStorage.getItem(pendingGuideActionKey) || "null");
      return pending && typeof pending === "object" ? pending : null;
    } catch {
      sessionStorage.removeItem(pendingGuideActionKey);
      return null;
    }
  }

  function writePendingGuideAction(action) {
    if (!action) return;
    sessionStorage.setItem(pendingGuideActionKey, JSON.stringify({
      ...action,
      createdAt: Date.now()
    }));
  }

  function clearPendingGuideAction() {
    sessionStorage.removeItem(pendingGuideActionKey);
  }

  function isCurrentPageHref(href) {
    if (!href) return true;
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin && url.pathname === window.location.pathname;
    } catch {
      return href.startsWith("#");
    }
  }

  function buildDestinationAction(path, href) {
    const actionMap = {
      "Business formation": {
        type: "focus-target",
        target: "#review",
        form: "#formed-intake",
        field: "[name='businessIdea']",
        button: "[data-levi-draft='idea']",
        values: {
          "[name='stage']": "idea",
          "[name='pathway']": "formation-file",
          "[name='firstCustomer']": "Early-stage founder with a serious idea but no clear offer, launch path, or working system.",
          "[name='mainOffer']": "Formation File pathway — organize private setup details, mission, owner expectations, first offer, launch records, and the first launch page draft."
        },
        message: "Built the Formed. first-offer Business Draft and launch page draft. Nothing was submitted, published, filed, or charged."
      },
      "Hiring or jobs": {
        type: "focus-target",
        target: "#brief",
        form: "#jobsai-intake",
        field: "[name='role']",
        values: {
          "[name='stage']": "Need to define role",
          "[name='needsListing']": true,
          "[name='needsIntake']": true
        },
        safeSubmit: true,
        message: "Opened JobsAI and started the first work-fit brief."
      },
      "Market or audience test": {
        type: "focus-target",
        target: "#untapped-markets",
        form: "#market-tool-form",
        field: "[name='audience']",
        values: {
          "[name='gap']": "validation",
          "[name='stage']": "rough"
        },
        safeSubmit: true,
        message: "Opened Market Finder and started the first audience lane."
      },
      "Public trust or profile cleanup": {
        type: "focus-target",
        target: "#audit",
        form: "#socialscan-form",
        field: "[name='links']",
        values: {
          "[name='goal']": "Look more trustworthy",
          "[name='notes']": "Improve first impression, trust signals, and next cleanup action."
        },
        message: "Opened SocialScan and started the profile cleanup plan."
      },
      "Custom route or stalled idea": {
        type: "focus-target",
        target: "#route",
        form: ".route-form",
        field: "[name='need']",
        values: {
          "[name='goal']": "offshoot",
          "[name='stage']": "starting"
        },
        safeSubmit: true,
        message: "Opened Off Shoot and started the solution route."
      },
      "Recovery or daily support": {
        type: "focus-target",
        target: "#checkin",
        form: "#behappy-checkin",
        field: "[name='focus']",
        values: {
          "[name='state']": "Not sure yet",
          "[name='feeling'][value='unsure']": true,
          "[name='sobrietyStatus'][value='not-sure']": true,
          "[name='needsRoutine']": true
        },
        safeSubmit: true,
        message: "Opened Be Happy and started today's support step."
      },
      "Conversation analysis": {
        type: "focus-target",
        target: "#paywall",
        button: null,
        safeSubmit: false,
        message: "Opened Conversation Clarity. Payment and full-report unlock stay manual."
      }
    };
    return {
      ...(actionMap[path] || {}),
      href
    };
  }

  function makeFounderFeed(site, asset, routes, feedItems = readFounderFeed()) {
    const activeKeys = new Set([
      siteRouteKey[site] || "home",
      ...(Array.isArray(routes) ? routes.map((route) => route.key) : []),
      ...feedItems.flatMap((item) => [siteRouteKey[item.site] || item.site, ...(item.routes || [])])
    ]);
    const tracker = Object.entries(routeCatalog)
      .map(([key, route]) => {
        const isActive = activeKeys.has(key);
        return `<li class="${isActive ? "is-active" : ""}">
          <span>${escapeHtml(route.label)}</span>
          <strong>${escapeHtml(isActive ? "Working" : "Draft mode")}</strong>
        </li>`;
      })
      .join("");
    const recent = feedItems.slice(0, 3).map((item) => `<li>
      <span>${escapeHtml(item.agent || "Levi")}</span>
      <strong>${escapeHtml(item.assetType || "Signal")}</strong>
      <p>${escapeHtml(item.prompt || item.summary || "Useful signal captured.")}</p>
    </li>`).join("");
    const routeKey = Array.isArray(routes) && routes[0]?.key ? routes[0].key : siteRouteKey[site];
    const connection = (routeKey && collaborationPaths[routeKey])
      || collaborationPaths[siteRouteKey[site]]
      || "Levi tracks useful signals across sites so your tools and next steps can work together.";
    const advice = founderAdvice[routeKey] || founderAdvice[site] || founderAdvice.home;

    return `
      <div class="agent-founder-feed" data-founder-feed>
        <div class="agent-founder-feed-topline">
          <span>Founder feed</span>
          <strong>${feedItems.length}</strong>
        </div>
        <p>${escapeHtml(connection)}</p>
        <div class="agent-founder-advice">
          <span>Advice to founder</span>
          <p>${escapeHtml(advice)}</p>
        </div>
        <ul class="agent-site-tracker" aria-label="LRC site tracker">${tracker}</ul>
        <p class="agent-memory-note">Customer memory: saved in this browser now; long-term customer storage should be opt-in and scoped to your account or service path.</p>
        <div class="agent-feed-list" aria-label="Recent agent feedback">
          ${recent ? `<ul>${recent}</ul>` : `<p>No customer memory signals yet. Ask Levi a question to start the feed.</p>`}
        </div>
      </div>
    `;
  }

  const modes = [
    {
      key: "guide",
      label: "Guide",
      text: "I recommend the closest product path, then explain more or less based on your know-how."
    },
    {
      key: "draft",
      label: "Draft",
      text: "I turn the prompt into the most useful draft I can safely prepare and suggest related LRC paths."
    },
    {
      key: "assist",
      label: "Assist",
      text: "I work the page as far as safety allows, connect related next steps, then stop for approval before transactions."
    }
  ];

  function getCapacity(mode, profile, blocked) {
    if (blocked) {
      return {
        percent: 22,
        label: "Guardrail mode",
        reason: "I can organize the next safe step with approved access and request scoped approval for restricted action."
      };
    }

    const key = typeof mode === "string" ? mode : mode?.key;
    const hasPageAction = Boolean(profile?.action);

    if (key === "assist" && hasPageAction) {
      return {
        percent: 92,
        label: "Action-ready assist",
        reason: "I can recommend, draft, prefill the safe workflow, connect related LRC steps, and prepare a solution-ready output before approval."
      };
    }

    if (key === "assist") {
      return {
        percent: 84,
        label: "Strong assist",
        reason: "I can draft, route the work, connect useful next steps, reduce wasted steps, and stop at the approval point."
      };
    }

    if (key === "draft") {
      return {
        percent: 78,
        label: "Draft mode",
        reason: "I can turn the prompt into a useful draft, checklist, route, or product draft, then suggest what should connect next."
      };
    }

    return {
      percent: hasPageAction ? 74 : 68,
      label: "Draft mode guide",
      reason: "I can recommend the path, explain the next move, and prepare safe next-step context that can connect across the ecosystem."
    };
  }

  function getCoachingTip(mode, asset) {
    if (asset?.blocked) {
      return "Tip: remove sensitive details and describe the goal instead. Levi can still help with the safe structure.";
    }

    const key = typeof mode === "string" ? mode : mode?.key;
    if (key === "assist") {
      return "Tip: tell Levi the end goal, the output worth paying for, and who or what should connect next. Confirm before anything is submitted, sent, published, purchased, or changed.";
    }

    if (key === "draft") {
      return "Tip: give Levi the outcome, audience, stage, and related LRC path. Better context makes the draft more useful and easier to price.";
    }

    return "Tip: say the goal, your experience level, what you already tried, and who or what needs to connect. Levi will recommend a clearer next move and improve from the signal.";
  }


  const localAssetProfiles = {
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
        need: "Route this into the closest LRC workflow and prepare the next safe action."
      }
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
	        field: "[name='businessIdea']",
	        button: "[data-levi-draft='idea']",
	        values: {
	          "[name='stage']": "idea",
	          "[name='pathway']": "formation-file",
            "[name='firstCustomer']": "Early-stage founder with a serious idea but no clear offer, launch path, or working system.",
            "[name='mainOffer']": "Formation File pathway — organize private setup details, mission, owner expectations, first offer, launch records, and the first launch page draft."
	        },
	        message: "Built the Formed. first-offer Business Draft and launch page draft. Nothing was submitted, published, filed, or charged."
	      }
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
	          "[name='needsIntake']": true
	        },
	        safeSubmit: true,
	        message: "Opened JobsAI and started the first work-fit brief."
	      }
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
	          "[name='stage']": "starting"
	        },
	        safeSubmit: true,
	        message: "Opened Off Shoot and started the solution route."
	      }
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
	          "[name='notes']": "Improve first impression, trust signals, and next cleanup action."
	        },
	        message: "Opened SocialScan and started the profile cleanup plan."
	      }
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
	          "[name='needsRoutine']": true
	        },
	        safeSubmit: true,
	        message: "Opened Be Happy and started today's support step."
	      }
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
        message: "Opened Careers and started the applicant note."
      }
    }
  };

  const pageAnswers = {
    home: {
      summary: "This is the LRC front door. Levi can explain the ecosystem, route an idea into the right product, and capture useful non-sensitive signals that improve the tools.",
      nextSteps: ["Ask the plain question", "Pick the closest product path", "Use the matching tool first"]
    },
    formed: {
      summary: "Formed. helps founders move from a rough idea into a business build path: setup, launch page, offer, operations, and AI-supported workflow.",
      nextSteps: ["Name the business stage", "Choose the build path", "Create the next founder output"]
    },
    jobsai: {
      summary: "JobsAI turns role, hiring, resume, and applicant notes into clearer work-fit signals and next-step briefs.",
      nextSteps: ["Name the role or strength", "Separate must-have from teachable", "Create the first fit brief"]
    },
    offshoot: {
      summary: "Off Shoot routes rough ideas, stalled projects, and split needs into the closest LRC solution instead of making contact the main step.",
      nextSteps: ["Describe the stuck point", "Choose the closest lane", "Open the matching solution"]
    },
    socialscan: {
      summary: "SocialScan turns public links or notes you have the right to use into a practical profile cleanup and trust signal plan.",
      nextSteps: ["Name the public profile purpose", "Check the first impression", "Create the cleanup step"]
    },
    behappy: {
      summary: "Be Happy keeps the next support step small, resource-first, and grounded without replacing real care.",
      nextSteps: ["Choose one check-in", "Keep support visible", "Take the smallest safe step"]
    },
    careers: {
      summary: "The careers page helps applicants make proof, availability, and role fit easier for LRC to understand.",
      nextSteps: ["Name the proof", "Connect it to the role", "Prepare the application note"]
    }
  };

  function isGeneralQuestion(prompt) {
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
      "help me understand"
    ].some((term) => lower.includes(term));
  }

  function buildGeneralAnswer(site, mode, prompt) {
    const profile = localAssetProfiles[site] || localAssetProfiles.home;
    const answer = pageAnswers[site] || pageAnswers.home;
    return {
      ok: true,
      blocked: false,
      site,
      mode,
      agent: "Levi",
      assetType: "Page answer",
      summary: answer.summary,
      nextSteps: answer.nextSteps,
      routes: inferRouteMatches(prompt, site),
      solutionPath:
        "Levi can answer general questions on this page, explain the nearby tools, suggest a product route, and collect useful non-sensitive signals only when it improves your experience.",
      guardrail: "Use approved access only. Approval before guarded action. You stay in control.",
      capacity: getCapacity(mode, profile, false),
      coachingTip: "Tip: ask a normal question. Levi can answer first, then route you into the right tool only when it helps.",
      ctaLabel: profile.ctaLabel,
      ctaHref: profile.ctaHref,
      action: profile.action || null
    };
  }

  function inferHomeProfile(prompt) {
    const lower = String(prompt || "").toLowerCase();
    const matches = (terms) => terms.some((term) => lower.includes(term));

    if (matches(["business", "start a business", "need structure", "structure", "llc", "formed", "formation", "launch", "offer", "website", "domain"])) {
      return {
        agent: "Founder Build Agent",
        assetType: "Business build route",
        output: "route this into Formed. with a starter structure, Ninja continuity, and a secure checkout hold before any payment",
        nextSteps: ["Review the starter structure", "Continue in Formed", "Keep checkout behind owner approval"],
        ctaLabel: "Continue in Formed",
        ctaHref: "./formed/index.html?interest=Formed.+Business+Builder&source=lrc-agent-founder-build#review",
        action: {
          type: "parent-router",
          path: "Business formation",
          audience: "new founders or business owners",
          need: "Shape the setup, offer, launch page, AI operations path, and owner-approved checkout handoff."
        }
      };
    }

    if (matches(["job", "hiring", "hire", "resume", "applicant", "role", "work", "career"])) {
      return {
        agent: "Work Match Agent",
        assetType: "Work route",
        output: "route this into JobsAI so the role, applicant, or work signal becomes easier to use",
        nextSteps: ["Open JobsAI", "Name the role or strength", "Create the first fit brief"],
        ctaLabel: "Open JobsAI",
        ctaHref: "./jobsai/index.html#brief",
        action: {
          type: "parent-router",
          path: "Hiring or jobs",
          audience: "founders, applicants, or hiring teams",
          need: "Clarify the role, applicant signal, or work-match path."
        }
      };
    }

    if (matches(["market", "audience", "demand", "untapped", "customer", "lane", "niche"])) {
      return {
        agent: "Market Signal Agent",
        assetType: "Market route",
        output: "route this into Untapped Market Finder so the audience, gap, and first offer can be tested",
        nextSteps: ["Open the market tool", "Name the audience", "Find the first testable lane"],
        ctaLabel: "Find market lane",
        ctaHref: "#untapped-markets",
        action: {
          type: "parent-router",
          path: "Market or audience test",
          audience: "a specific audience worth testing",
          need: "Find the underserved gap, first offer, and testable market lane."
        }
      };
    }

    if (matches(["profile", "trust", "social", "linkedin", "brand", "public", "bio", "content"])) {
      return {
        agent: "Trust Check Agent",
        assetType: "Trust route",
        output: "route this into SocialScan so the public presence has a clear first cleanup step",
        nextSteps: ["Open SocialScan", "Check the first impression", "Prepare the first cleanup action"],
        ctaLabel: "Open SocialScan",
        ctaHref: "./socialscan/index.html#audit",
        action: {
          type: "parent-router",
          path: "Public trust or profile cleanup",
          audience: "you when you are improving a public profile or brand",
          need: "Improve the first impression, trust signal, and cleanup path."
        }
      };
    }

    if (matches(["stuck", "route", "custom", "workflow", "not sure", "confused", "idea", "where"])) {
      return {
        agent: "Route Guide Agent",
        assetType: "Route recommendation",
        output: "route this through Off Shoot so the rough need becomes the next closest LRC path",
        nextSteps: ["Open Route Guide", "Pick the closest lane", "Create the working solution path"],
        ctaLabel: "Open Route Guide",
        ctaHref: "./offshoot/index.html#route",
        action: {
          type: "parent-router",
          path: "Custom route or stalled idea",
          audience: "you when you have a rough or stuck idea",
          need: "Find the closest LRC lane before building more."
        }
      };
    }

	    if (matches(["daily", "recovery", "support", "meeting", "routine", "happy", "check-in", "checkin"])) {
	      return {
	        agent: "Daily Support Agent",
        assetType: "Daily support route",
        output: "route this into Be Happy so the need becomes one small support step",
        nextSteps: ["Open Be Happy", "Start the check-in", "Choose one support action"],
        ctaLabel: "Open Be Happy",
        ctaHref: "./behappy/index.html#checkin",
        action: {
          type: "parent-router",
          path: "Recovery or daily support",
          audience: "you when you need one steady support step",
          need: "Keep the next step small, resource-first, and human-supported."
	        }
	      };
	    }

	    if (matches(["conversation", "messages", "message", "text", "thread", "chat", "timing", "gaps", "gap", "shift", "chronology", "report", "clarity"])) {
	      return {
	        agent: "Conversation Review Agent",
	        assetType: "Conversation preview route",
	        output: "open Conversation Clarity so you can review timing, gaps, shifts, and chronology before any full-report unlock",
	        nextSteps: ["Open Conversation Clarity", "Review the preview", "Unlock the full report only if you choose"],
	        ctaLabel: "Open Conversation Clarity",
	        ctaHref: "#paywall",
	        action: {
	          type: "parent-router",
	          path: "Conversation analysis",
	          audience: "you when you need communication timing and chronology clarity",
	          need: "Review timing, gaps, shifts, and chronology without guessing intent."
	        }
	      };
	    }

	    return localAssetProfiles.home;
	  }

  function buildLocalAgentAsset(site, mode, prompt) {
    const profile = site === "home" ? inferHomeProfile(prompt) : localAssetProfiles[site] || localAssetProfiles.home;
    const startingPoint = String(prompt || "").trim() || "Start";
    const lower = startingPoint.toLowerCase();
    const hasSensitiveHint = [
      "password",
      "ssn",
      "social security",
      "bank",
      "full ein",
      "medical record",
      "card number"
    ].some((term) => lower.includes(term));
    const hasBlockedAccessHint = ["paywall", "bypass", "get around", "without approval"].some((term) =>
      lower.includes(term)
    );

    if (hasSensitiveHint) {
      return {
        ok: true,
        blocked: true,
        site,
        agent: profile.agent,
        assetType: profile.assetType,
        summary:
          "Keep secrets and sensitive records out of this box. Levi can still organize the next safe step with a plain-language goal.",
        nextSteps: ["Remove sensitive details", "Describe the goal in plain words", "Use qualified human support for serious decisions"],
        routes: inferRouteMatches(prompt, site),
        capacity: getCapacity(mode, profile, true),
        coachingTip: getCoachingTip(mode, { blocked: true }),
        guardrail: "Use approved access only. Approval before guarded action. You stay in control."
      };
    }

    if (hasBlockedAccessHint) {
      return {
        ok: true,
        blocked: true,
        site,
        agent: profile.agent,
        assetType: profile.assetType,
        summary:
          "Levi can plan, draft, and organize the next step using public or approved access, then request scoped approval for any guarded action.",
        nextSteps: ["Use public or approved sources", "Draft the next step", "Request scoped approval before anything is submitted, sent, published, purchased, or changed"],
        routes: inferRouteMatches(prompt, site),
        capacity: getCapacity(mode, profile, true),
        coachingTip: getCoachingTip(mode, { blocked: true }),
        guardrail: "Use approved access only. Approval before guarded action. You stay in control."
      };
    }

    if (isGeneralQuestion(startingPoint)) {
      return buildGeneralAnswer(site, mode, startingPoint);
    }

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
      routes: inferRouteMatches(prompt, site),
      solutionPath: `Levi can recommend along the way, adapt to your know-how, motivate progress toward the end goal, draft, organize, connect tasks and functions, collect useful non-sensitive signals, suggest cross-site solution paths, and prepare this as a ${profile.assetType.toLowerCase()} for you. It works the safe parts first, then requests scoped approval before anything is submitted, sent, filed, published, purchased, or access is changed.`,
      guardrail: "Use approved access only. Approval before guarded action. You stay in control.",
      capacity: getCapacity(mode, profile, false),
      coachingTip: getCoachingTip(mode, { blocked: false }),
      ctaLabel: profile.ctaLabel,
      ctaHref: profile.ctaHref,
      action: profile.action || null
    };
  }

  function makeModes() {
    return modes
      .map(
        (mode, index) =>
          `<button class="agent-guide-mode${index === 0 ? " is-active" : ""}" type="button" data-guide-mode="${mode.key}">${mode.label}</button>`
      )
      .join("");
  }

  function makeAutonomyRules() {
    return `
      <div class="agent-autonomy-rules">
        <span>Autonomy rules</span>
        <ul>${autonomyRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul>
      </div>
    `;
  }

  function renderGuide(config) {
    const guide = document.createElement("aside");
    guide.className = "lrc-agent-guide";
    guide.setAttribute("aria-label", `${config.guideName || "Levi"} ${config.agent} site guide`);
    guide.innerHTML = `
      <section class="agent-guide-panel" id="agent-guide-panel" aria-live="polite">
        <div class="agent-guide-topline">
          <p class="agent-guide-kicker">${config.guideName || "Levi"} • ${config.kicker}</p>
          <div class="agent-guide-window-actions">
            <button class="agent-guide-reset" type="button" data-guide-reset>Reset</button>
            <button class="agent-guide-close" type="button" aria-label="Close guide">X</button>
          </div>
        </div>
        <h2>${config.title}</h2>
        <p class="agent-guide-greeting">${config.greeting}</p>
        <p class="agent-guide-says" data-guide-says>${config.says}</p>
        ${makeAutonomyRules()}
        <div class="agent-guide-modes" role="group" aria-label="Levi mode" hidden>
          ${makeModes()}
        </div>
        <p class="agent-guide-label">Try</p>
        <div class="agent-guide-prompts">${makePrompts(config.prompts)}</div>
        <form class="agent-guide-ask" data-guide-ask>
          <label>
            How can I help?
            <textarea data-guide-input rows="2" placeholder="A few words is enough."></textarea>
          </label>
          <button type="submit">Build My Starting Plan</button>
        </form>
        <div class="agent-guide-answer" data-guide-answer data-levi-output hidden></div>
        ${makeFounderFeed(detectGuide(), null, [])}
        <p class="agent-guide-note">Approved access only. Approval before guarded action.</p>
      </section>
        <section class="agent-preview-modal" data-guide-preview-modal hidden aria-label="Levi solution plan" role="dialog" aria-modal="true">
        <div class="agent-preview-card">
          <div class="agent-preview-topline">
            <p class="agent-guide-kicker">Levi solution plan</p>
            <button class="agent-guide-close" type="button" data-guide-preview-close aria-label="Close preview">X</button>
          </div>
          <div data-guide-preview-content></div>
        </div>
      </section>
      <button class="agent-guide-toggle" type="button" aria-expanded="false" aria-controls="agent-guide-panel">
        <span class="agent-guide-face" aria-hidden="true">
          <span class="agent-guide-smile"></span>
          <span class="agent-guide-wave"></span>
        </span>
        <span class="agent-guide-copy">
          <strong>Levi Assist</strong>
          <span>Ask • Build • Route</span>
        </span>
      </button>
    `;
    document.body.appendChild(guide);
    return guide;
  }

  function init() {
    if (document.querySelector("[data-lrc-agent-input]")) return;
    if (document.querySelector(".lrc-agent-guide")) return;
    const guideKey = detectGuide();
    const config = guides[guideKey] || guides.home;
    const guide = renderGuide(config);
    const toggle = guide.querySelector(".agent-guide-toggle");
    const close = guide.querySelector(".agent-guide-close");
    const says = guide.querySelector("[data-guide-says]");
    const askForm = guide.querySelector("[data-guide-ask]");
    const guideInput = guide.querySelector("[data-guide-input]");
    const guideAnswer = guide.querySelector("[data-guide-answer]");
    const resetPosition = guide.querySelector("[data-guide-reset]");
    const panel = guide.querySelector(".agent-guide-panel");
    const previewModal = guide.querySelector("[data-guide-preview-modal]");
    const previewContent = guide.querySelector("[data-guide-preview-content]");
    const previewClose = guide.querySelector("[data-guide-preview-close]");
    const topLine = guide.querySelector(".agent-guide-topline");
	    const guidePositionKey = "lrcAgentGuidePositionV2";
	    let activeMode = modes[0];
	    let currentAsset = null;
	    let currentPrompt = "";
	    let lastAutoActionKey = "";
    let actionStatusItems = [];
    let dragState = null;

    function setOpen(isOpen) {
      guide.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("lrc-guide-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    }

    function openLiveAgent(prompt = "Build this output", mode = "assist") {
      guideInput.value = guideInput.value || prompt;
      setOpen(true);
      const modeButton = guide.querySelector(`[data-guide-mode='${mode}']`);
      if (modeButton) {
        modeButton.click();
      } else {
        showAgentAsset(config, activeMode, guideInput.value);
      }
      window.setTimeout(() => guideInput.focus({ preventScroll: true }), 120);
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

	    function showAnswer(message) {
	      guideAnswer.hidden = false;
	      guideAnswer.textContent = message;
	      guideAnswer.classList.remove("is-fresh");
	      window.requestAnimationFrame(() => guideAnswer.classList.add("is-fresh"));
	    }

	    function renderActionStatus() {
	      if (!actionStatusItems.length) return "";
	      return `
	        <div class="agent-action-status" aria-label="Levi action status">
	          <span>Action status</span>
	          <ul>${actionStatusItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
	        </div>
	      `;
	    }

	    function addActionStatus(message) {
	      if (!message) return;
	      actionStatusItems = [message, ...actionStatusItems.filter((item) => item !== message)].slice(0, 4);
	      const status = guideAnswer.querySelector(".agent-action-status");
	      if (status) {
	        status.outerHTML = renderActionStatus();
	      } else if (!guideAnswer.hidden && guideAnswer.innerHTML) {
	        guideAnswer.insertAdjacentHTML("beforeend", renderActionStatus());
	      }
	    }

    function showAsset(asset) {
      currentAsset = asset;
      const routes = ensureForwardRoutes(
        currentPrompt,
        guideKey,
        Array.isArray(asset.routes) && asset.routes.length ? asset.routes : inferRouteMatches(currentPrompt, guideKey)
      );
	      const feedItems = recordFounderSignal(guideKey, currentPrompt, asset, routes);
	      actionStatusItems = [];
	      guideAnswer.hidden = false;
      renderForcedLeviOutput(buildForcedLeviOutput({
        goal: currentPrompt,
        audience: asset.agent || "the person who needs the next clear step",
        need: asset.summary || asset.solutionPath || "",
        path: routes[0]?.label || asset.assetType || ""
      }), guideAnswer);
      const founderFeed = guide.querySelector("[data-founder-feed]");
	      if (founderFeed) founderFeed.outerHTML = makeFounderFeed(guideKey, asset, routes, feedItems);
	      guideAnswer.classList.remove("is-fresh");
	      window.requestAnimationFrame(() => guideAnswer.classList.add("is-fresh"));
	    }

    function openPreview() {
      if (!currentAsset) return;
      const steps = Array.isArray(currentAsset.nextSteps) ? currentAsset.nextSteps : [];
      const routes = ensureForwardRoutes(
        currentPrompt,
        guideKey,
        Array.isArray(currentAsset.routes) && currentAsset.routes.length ? currentAsset.routes : inferRouteMatches(currentPrompt, guideKey)
      );
      const capacity = currentAsset.capacity || getCapacity(currentAsset.mode || activeMode.key, currentAsset, currentAsset.blocked);
      const coachingTip = currentAsset.coachingTip || getCoachingTip(currentAsset.mode || activeMode.key, currentAsset);
      previewContent.innerHTML = `
        <p class="agent-preview-label">${escapeHtml(currentAsset.agent || "Levi")}</p>
        <h3>${escapeHtml(currentAsset.assetType || "Levi solution")}</h3>
        <p>${escapeHtml(currentAsset.summary || "")}</p>
        <div class="agent-capacity-meter agent-capacity-meter-preview" aria-label="Levi working capacity within guardrails">
          <div class="agent-capacity-topline">
            <span>${escapeHtml(capacity.label)}</span>
            <strong>${Number(capacity.percent) || 0}%</strong>
          </div>
          <div class="agent-capacity-track"><span style="width: ${Math.max(0, Math.min(100, Number(capacity.percent) || 0))}%"></span></div>
          <p>${escapeHtml(capacity.reason)}</p>
        </div>
        <p class="agent-guide-tip">${escapeHtml(coachingTip)}</p>
        ${steps.length ? `<ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>` : ""}
        ${routes.length ? `<p class="agent-preview-label">Best solution paths</p>${makeRouteList(routes)}` : ""}
        ${currentAsset.solutionPath ? `<p class="agent-preview-solution-path">${escapeHtml(currentAsset.solutionPath)}</p>` : ""}
        <p class="agent-preview-guardrail">${escapeHtml(currentAsset.guardrail || "Use approved access only. Approval before guarded action. You stay in control.")}</p>
        ${currentAsset.action ? `<button class="agent-guide-preview-button" type="button" data-guide-run-action>Open and start tool</button>` : ""}
        <button class="agent-guide-preview-button" type="button" data-guide-open-route>Open next route</button>
        <p class="agent-preview-local-note">Next safe move: open the matching tool, builder, audit, route, or workflow first. Share details only after the solution path is clear.</p>
        ${currentAsset.ctaHref && currentAsset.ctaLabel ? `<a class="agent-preview-action" href="${escapeHtml(currentAsset.ctaHref)}">${escapeHtml(currentAsset.ctaLabel)}</a>` : ""}
      `;
      setOpen(false);
      previewModal.hidden = false;
    }

    function closePreview() {
      previewModal.hidden = true;
    }

	    function setNativeValue(field, value) {
	      if (!field) return;
	      field.value = value;
	      field.dispatchEvent(new Event("input", { bubbles: true }));
	      field.dispatchEvent(new Event("change", { bubbles: true }));
	    }

	    function setGuideFieldValue(field, value) {
	      if (!field) return false;
	      if (field.type === "checkbox" || field.type === "radio") {
	        field.checked = Boolean(value);
	        field.dispatchEvent(new Event("input", { bubbles: true }));
	        field.dispatchEvent(new Event("change", { bubbles: true }));
	        return true;
	      }
	      if (field.tagName === "SELECT") {
	        const wanted = String(value || "").toLowerCase();
	        const option = Array.from(field.options || []).find((item) => {
	          const optionValue = String(item.value || "").toLowerCase();
	          const optionText = String(item.textContent || "").toLowerCase();
	          return optionValue === wanted || optionText === wanted || optionValue.includes(wanted) || optionText.includes(wanted);
	        });
	        if (option) {
	          field.value = option.value;
	          field.dispatchEvent(new Event("input", { bubbles: true }));
	          field.dispatchEvent(new Event("change", { bubbles: true }));
	          return true;
	        }
	      }
	      setNativeValue(field, value);
	      return true;
	    }

	    function fillActionValues(form, target, values) {
	      if (!values || typeof values !== "object") return 0;
	      return Object.entries(values).reduce((count, [selector, value]) => {
	        const field = form?.querySelector(selector) || target?.querySelector(selector) || document.querySelector(selector);
	        return count + (setGuideFieldValue(field, value) ? 1 : 0);
	      }, 0);
	    }

		    function submitSafeLocalPreview(form) {
		      if (!form) return false;
		      form.dataset.leviStarted = "true";
		      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		      return true;
		    }

	    function actionFilledFields(action, filledCount) {
	      const filled = Object.keys(action.values || {});
	      if (action.field && !filled.includes(action.field)) filled.unshift(action.field);
	      if (!filled.length && filledCount) filled.push("first visible field");
	      return filled;
	    }

	    function reportAgentActivity(action, message, filledCount = 0) {
	      const payload = {
	        site: guideKey,
	        mode: activeMode.key,
	        agent: currentAsset?.agent || config.agent || "Levi",
	        assetType: currentAsset?.assetType || "Agent action",
	        prompt: currentPrompt,
	        actionType: action.type || "focus-target",
	        target: action.target || "",
	        form: action.form || "",
	        filled: actionFilledFields(action, filledCount),
	        safeSubmit: Boolean(action.safeSubmit),
	        boundary: action.safeSubmit
	          ? "Safe local preview generated. No payment, publishing, sending, filing, or external submission."
	          : "Stopped at manual approval boundary.",
	        message,
	        href: action.href || currentAsset?.ctaHref || ""
	      };

	      fetch("/api/agent/activity", {
	        method: "POST",
	        headers: { "content-type": "application/json" },
	        body: JSON.stringify(payload)
	      }).catch(() => {});
	    }

	    function performFocusTargetAction(action, prompt, successMessage) {
	      const target = document.querySelector(action.target || currentAsset?.ctaHref);
      if (!target) {
        const href = action.href || currentAsset?.ctaHref;
        if (href && !isCurrentPageHref(href)) {
          writePendingGuideAction({
            ...action,
            prompt,
            href,
            message: successMessage || action.message
          });
          window.location.href = href;
          return true;
        }
        return false;
      }

      const form = document.querySelector(action.form) || target?.querySelector("form");
      const actionButton = action.button
        ? form?.querySelector(action.button) || target?.querySelector(action.button) || document.querySelector(action.button)
        : null;
	      const field =
	        (action.field ? form?.querySelector(action.field) : null) ||
	        form?.querySelector("textarea, input:not([type='hidden']):not([type='checkbox']):not([type='radio']), select");

	      target?.scrollIntoView({ behavior: "auto", block: "start" });
	      target?.setAttribute("data-levi-active", "true");

	      const filledCount = fillActionValues(form, target, action.values);

	      if (field) {
	        if ((field.tagName === "TEXTAREA" || field.tagName === "INPUT") && !field.value) {
	          setNativeValue(field, prompt || currentAsset?.output || currentAsset?.assetType || "Start here");
	        } else if (field.tagName === "SELECT" && !filledCount) {
	          setGuideFieldValue(field, prompt || currentAsset?.output || currentAsset?.assetType || "Start here");
	        }
	        window.setTimeout(() => field.focus({ preventScroll: true }), 180);
	      }

	      const finalMessage = successMessage || action.message || "Done. I opened the matching tool and started the next working output.";
	      if (actionButton) {
	        window.setTimeout(() => {
	          actionButton.click();
	          addActionStatus("Clicked the safe draft/start control.");
	        }, 280);
	      } else if (action.safeSubmit) {
	        window.setTimeout(() => {
	          submitSafeLocalPreview(form);
	          addActionStatus("Generated the safe local preview.");
	        }, 280);
	      } else {
	        addActionStatus("Stopped at the manual approval boundary.");
	      }

	      showAnswer(finalMessage);
	      addActionStatus(`Opened ${action.target || "the matching tool"}.`);
	      if (filledCount || field) addActionStatus("Filled the useful starting fields.");
	      reportAgentActivity(action, finalMessage, filledCount);
		      return true;
	    }

    function runCurrentAssetAction() {
      const action = currentAsset?.action;
      if (!action) return false;

      if (action.type === "parent-router") {
        const router = document.querySelector("#ai-router");
        const routeTab = router?.querySelector("[data-ai-tab='route']");
        const form = router?.querySelector("[data-ai-form='parent']");
        routeTab?.click();
        router?.scrollIntoView({ behavior: "auto", block: "start" });

	        if (form) {
	          setNativeValue(form.querySelector("[name='idea']"), currentPrompt || currentAsset.assetType || "LRC workflow");
	          setNativeValue(form.querySelector("[name='audience']"), action.audience || "who needs this");
	          setNativeValue(form.querySelector("[name='need']"), action.need || currentAsset.summary || "Route this into the closest LRC workflow.");
	          setNativeValue(form.querySelector("[name='path']"), action.path || "Not sure yet");
	          addActionStatus("Filled the umbrella router.");
	          reportAgentActivity({
	            ...action,
	            target: "#ai-router",
	            form: "[data-ai-form='parent']",
	            values: {
	              "[name='idea']": true,
	              "[name='audience']": true,
	              "[name='need']": true,
	              "[name='path']": true
	            }
	          }, "Filled the LRC umbrella router.", 4);
	          window.setTimeout(() => {
	            form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
	            addActionStatus("Generated the route preview.");
	          }, 120);
	        }

        const destinationAction = buildDestinationAction(action.path, currentAsset.ctaHref);
        if (destinationAction?.type && currentAsset.ctaHref && currentAsset.ctaHref !== "#ai-router") {
          const openDestination = () => {
            if (isCurrentPageHref(currentAsset.ctaHref)) {
              performFocusTargetAction(destinationAction, currentPrompt, destinationAction.message);
              return;
            }
            writePendingGuideAction({
              ...destinationAction,
              prompt: currentPrompt,
              message: destinationAction.message
            });
            window.location.href = currentAsset.ctaHref;
          };
          window.setTimeout(openDestination, form ? 260 : 0);
          closePreview();
          setOpen(false);
          showAnswer("Done. I prepared the route and opened the matching workflow. Nothing is submitted without your approval.");
          return true;
        }

        closePreview();
        setOpen(false);
        showAnswer("Done. I filled the AI router and prepared the working solution path. Confirm before anything leaves the page.");
        return true;
      }

      if (action.type === "focus-target") {
        const started = performFocusTargetAction({
          ...action,
          href: currentAsset.ctaHref
        }, currentPrompt, action.message);
        if (!started) return openBestRoute();

        recordFounderSignal(guideKey, currentPrompt, currentAsset, inferRouteMatches(currentPrompt, guideKey));
        closePreview();
        setOpen(false);
        return true;
      }

      if (currentAsset.ctaHref) {
        window.location.href = currentAsset.ctaHref;
        return true;
      }

      return false;
    }

	    function openBestRoute() {
	      const routes = ensureForwardRoutes(
	        currentPrompt,
        guideKey,
        Array.isArray(currentAsset?.routes) && currentAsset.routes.length
          ? currentAsset.routes
          : inferRouteMatches(currentPrompt, guideKey)
      );
      const route = firstForwardRoute(currentPrompt, guideKey, routes);
      if (!route?.href) return false;
      closePreview();
      setOpen(false);
	      window.location.href = route.href;
	      return true;
	    }

	    function hasSharedAgentSurface() {
	      return Boolean(document.querySelector("[data-lrc-agent-input]"));
	    }

	    function installInlineStartButton() {
	      if (hasSharedAgentSurface()) return;
	      const action = localAssetProfiles[guideKey]?.action;
	      if (!action?.target) return;
	      const target = document.querySelector(action.target);
	      if (!target || target.querySelector("[data-levi-inline-start]")) return;

	      const button = document.createElement("button");
	      button.type = "button";
	      button.className = "agent-inline-start";
	      button.dataset.leviInlineStart = "true";
	      button.textContent = "Start with Levi";
	      button.addEventListener("click", () => {
	        guideInput.value = guideInput.value || "Build this output";
	        openLiveAgent("Build this output", "assist");
	      });
	      target.insertAdjacentElement("afterbegin", button);
	    }

    function installLiveAgentBar() {
      if (hasSharedAgentSurface()) return;
      if (document.querySelector("[data-live-agent-bar]")) return;
      const mount = document.querySelector("main") || document.body;
      const bar = document.createElement("section");
      bar.className = "agent-live-bar";
      bar.dataset.liveAgentBar = "true";
      bar.id = "levi-agent";
      bar.innerHTML = `
        <div>
          <span>Draft mode agent</span>
          <strong>${escapeHtml(config.guideName || "Levi")} can open this page's tool, fill safe fields, draft the next output, and stop for approval.</strong>
        </div>
        <button type="button" data-open-levi data-levi-prompt="Build this output">Build My Starting Plan</button>
      `;
      mount.insertAdjacentElement("afterbegin", bar);
    }

    function clampPosition(left, top) {
      const rect = guide.getBoundingClientRect();
      const gap = 10;
      return {
        left: Math.min(Math.max(gap, left), window.innerWidth - rect.width - gap),
        top: Math.min(Math.max(gap, top), window.innerHeight - rect.height - gap)
      };
    }

    function setPosition(left, top) {
      const next = clampPosition(left, top);
      guide.style.left = `${next.left}px`;
      guide.style.top = `${next.top}px`;
      guide.style.right = "auto";
      guide.style.bottom = "auto";
      guide.classList.add("is-moved");
      document.body.classList.add("lrc-guide-moved");
      localStorage.setItem(guidePositionKey, JSON.stringify(next));
    }

    function restorePosition() {
      try {
        const saved = JSON.parse(localStorage.getItem(guidePositionKey) || "null");
        if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
          setPosition(saved.left, saved.top);
        }
      } catch {
        localStorage.removeItem(guidePositionKey);
      }
    }

    function resetGuidePosition() {
      localStorage.removeItem(guidePositionKey);
      guide.style.left = "";
      guide.style.top = "";
      guide.style.right = "";
      guide.style.bottom = "";
      guide.classList.remove("is-moved", "is-dragging");
      document.body.classList.remove("lrc-guide-moved");
    }

    function applyPendingGuideAction() {
      if (hasSharedAgentSurface()) {
        clearPendingGuideAction();
        return;
      }
      const pending = readPendingGuideAction();
      if (!pending) return;
      if (pending.createdAt && Date.now() - Number(pending.createdAt) > 30000) {
        clearPendingGuideAction();
        return;
      }

      const target = document.querySelector(pending.target || "");
      if (!target) return;
      clearPendingGuideAction();
      setOpen(true);
      performFocusTargetAction(
        pending,
        pending.prompt || currentPrompt,
        pending.message || "Done. I opened the matching tool and started the next working output."
      );
    }

    function canStartPanelDrag(event) {
      if (event.target.closest("button, a, input, textarea, select, summary, details")) return false;
      const rect = panel.getBoundingClientRect();
      const edge = 18;
      const nearLeft = event.clientX - rect.left <= edge;
      const nearRight = rect.right - event.clientX <= edge;
      const nearTop = event.clientY - rect.top <= 52;
      return nearLeft || nearRight || nearTop || event.target.closest(".agent-guide-topline");
    }

    function startDrag(event) {
      if (event.button !== 0) return;
      if (event.currentTarget === panel && !canStartPanelDrag(event)) return;
      const rect = guide.getBoundingClientRect();
      dragState = {
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top,
        moved: false
      };
      guide.classList.add("is-dragging");
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    function moveDrag(event) {
      if (!dragState) return;
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) {
        dragState.moved = true;
      }
      setPosition(dragState.left + dx, dragState.top + dy);
    }

    function endDrag(event) {
      if (!dragState) return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      window.setTimeout(() => {
        if (dragState?.moved) toggle.dataset.dragged = "true";
        guide.classList.remove("is-dragging");
        dragState = null;
      }, 0);
    }

    toggle.addEventListener("click", () => {
      if (toggle.dataset.dragged === "true") {
        delete toggle.dataset.dragged;
        return;
      }
      setOpen(!guide.classList.contains("is-open"));
    });

    toggle.addEventListener("pointerdown", startDrag);
    toggle.addEventListener("pointermove", moveDrag);
    toggle.addEventListener("pointerup", endDrag);
    toggle.addEventListener("pointercancel", endDrag);
    panel.addEventListener("pointerdown", startDrag);
    panel.addEventListener("pointermove", moveDrag);
    panel.addEventListener("pointerup", endDrag);
    panel.addEventListener("pointercancel", endDrag);

    close.addEventListener("click", () => setOpen(false));
    resetPosition.addEventListener("click", resetGuidePosition);
    previewClose.addEventListener("click", closePreview);
    previewModal.addEventListener("click", (event) => {
      if (event.target.closest("[data-guide-run-action]")) {
        runCurrentAssetAction();
        return;
      }
      if (event.target.closest("[data-guide-open-route]")) {
        openBestRoute();
        return;
      }
      if (event.target.closest(".agent-preview-action")) {
        closePreview();
        setOpen(false);
        return;
      }
      if (event.target === previewModal) closePreview();
    });
    guide.addEventListener("click", (event) => {
      if (event.target.closest("[data-guide-run-action]")) {
        runCurrentAssetAction();
        return;
      }
      if (event.target.closest("[data-guide-open-route]")) {
        openBestRoute();
        return;
      }

      const modeButton = event.target.closest("[data-guide-mode]");
      if (modeButton) {
        const nextMode = modes.find((mode) => mode.key === modeButton.dataset.guideMode) || modes[0];
        activeMode = nextMode;
        guide.querySelectorAll("[data-guide-mode]").forEach((button) => {
          const isActive = button === modeButton;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-pressed", String(isActive));
        });
        says.textContent = nextMode.text;
        if (nextMode.key === "assist") {
          const prompt = guideInput.value || "Route this for me";
          guideInput.value = prompt;
          showAgentAsset(config, activeMode, prompt);
        } else {
          guideAnswer.hidden = true;
          currentAsset = null;
        }
        return;
      }

      if (event.target.closest("[data-guide-preview-open]")) {
        openPreview();
      }
    });

    guide.querySelectorAll("[data-guide-prompt]").forEach((button) => {
      button.addEventListener("click", async () => {
        const index = Number(button.dataset.guidePrompt || 0);
        guideInput.value = config.prompts[index] || "";
        says.textContent = config.responses[index % config.responses.length];
        await showAgentAsset(config, activeMode, guideInput.value);
      });
    });

    askForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await showAgentAsset(config, activeMode, guideInput.value);
    });

    document.addEventListener("click", (event) => {
      const copyButton = event.target.closest("[data-copy-levi-output]");
      if (copyButton) {
        event.preventDefault();
        copyLastLeviBrief(copyButton);
        return;
      }

      const opener = event.target.closest("[data-open-levi]");
      if (!opener) return;
      event.preventDefault();
      openLiveAgent(opener.dataset.leviPrompt || "Build this output", opener.dataset.leviMode || "assist");
    });

	    if (window.location.search.includes("guide=open") || window.location.hash === "#agents" || window.location.hash === "#levi-agent") {
	      window.setTimeout(() => openLiveAgent("Build this output", "assist"), 500);
	    }
    installLiveAgentBar();
	    installInlineStartButton();
	    window.setTimeout(() => {
      if (!guide.classList.contains("is-open")) guide.classList.add("is-nudging");
    }, 1800);
    window.setTimeout(() => guide.classList.remove("is-nudging"), 6200);
    restorePosition();
    window.setTimeout(applyPendingGuideAction, 1200);

    async function showAgentAsset(currentConfig, mode, prompt) {
      currentPrompt = String(prompt || "").trim();
      guideAnswer.hidden = false;
      renderForcedLeviOutput(buildForcedLeviOutput({
        goal: currentPrompt,
        audience: currentConfig.agent || "the person who needs the next clear step",
        need: currentConfig.says || currentConfig.emptyAnswer || "",
        path: currentConfig.ctaLabel || ""
      }), guideAnswer);
      const asset = await requestAgentAsset(guideKey, mode.key, prompt);
      if (asset?.ok) {
        showAsset(asset);
        return;
      }
      renderForcedLeviOutput(buildForcedLeviOutput({
        goal: currentPrompt,
        audience: currentConfig.agent || "the person who needs the next clear step",
        need: buildAgentAnswer(currentConfig, mode, prompt),
        path: currentConfig.ctaLabel || ""
      }), guideAnswer);
    }

  }

  async function requestAgentAsset(site, mode, prompt) {
    if (window.location.protocol === "file:") {
      return buildLocalAgentAsset(site, mode, prompt);
    }

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ site, mode, prompt })
      });
      if (!response.ok) return buildLocalAgentAsset(site, mode, prompt);
      return response.json();
    } catch {
      return buildLocalAgentAsset(site, mode, prompt);
    }
  }

  function buildAgentAnswer(config, mode, rawInput) {
    const input = String(rawInput || "").trim();
    if (!input) {
      if (config.emptyAnswer) return config.emptyAnswer;
      return "Type a few words, or tap Start. I will keep it simple.";
    }

    const lower = input.toLowerCase();
    const sensitive =
      lower.includes("password") ||
      lower.includes("ssn") ||
      lower.includes("social security") ||
      lower.includes("bank") ||
      lower.includes("full ein") ||
      lower.includes("medical record") ||
      lower.includes("card number");

    if (sensitive) {
      return "I can help organize the next step, but do not paste secrets or sensitive records here. Keep passwords, SSNs, banking details, full EINs, and private medical details out of this guide.";
    }

    const blockedAccess =
      lower.includes("paywall") ||
      lower.includes("bypass") ||
      lower.includes("get around") ||
      lower.includes("without approval");

    if (blockedAccess) {
      return "I can plan the next step using public or approved access, then request scoped approval before submitting, publishing, purchasing, messaging, or changing access.";
    }

    const wantsAcrossSites =
      lower.includes("across") ||
      lower.includes("sites") ||
      lower.includes("scalable") ||
      lower.includes("assets") ||
      lower.includes("move up") ||
      lower.includes("integrate");

    if (wantsAcrossSites) {
      return "Across your sites, I can help create scalable assets: a business build path in Formed., a work path in JobsAI, a market signal in Untapped, a trust check in SocialScan, a route in Off Shoot, and a steady support step in Be Happy. Start with one need and I will point to the right site.";
    }

    const action = mode.key === "guide"
      ? "Start small. Name what you want, then pick one next step."
      : mode.key === "draft"
        ? "I can turn this into a short plan: goal, stage, missing piece, next step."
        : "I can prepare the next solution path, then request scoped approval before anything is sent, submitted, published, purchased, or access is changed.";

    const nudge = lower.includes("not sure") || lower.includes("stuck") || lower.includes("confused")
      ? "What if we make it smaller first?"
      : "What should you understand next?";

    return `${action} ${nudge}`;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
