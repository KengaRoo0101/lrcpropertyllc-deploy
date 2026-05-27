(function () {
  const form = document.querySelector("#ninja-form");
  const promptInput = document.querySelector("#ninja-prompt");
  const listenToggle = document.querySelector("#listen-toggle");
  const listenStatus = document.querySelector("#listen-status");
  const statusText = document.querySelector("#status-text");
  const output = document.querySelector("#ninja-output");
  const taskList = document.querySelector("#task-list");
  const refreshTasks = document.querySelector("#refresh-tasks");
  const flowSite = document.querySelector("#flow-site");
  const flowGoal = document.querySelector("#flow-goal");
  const flowOwner = document.querySelector("#flow-owner");
  const flowNext = document.querySelector("#flow-next");
  const flowSteps = Array.from(document.querySelectorAll(".flow-step"));

  const voiceSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const listeningSupported = Boolean(SpeechRecognition);
  let recognition = null;
  let listening = false;
  let lastFinalPrompt = "";

  const routeProfiles = [
    {
      key: "business",
      terms: ["business", "formed", "llc", "formation", "launch", "offer", "website", "stripe", "checkout"],
      assignedSite: "Formed",
      assignedAgent: "Founder Build Agent",
      href: "/formed/index.html?source=ninja&intent=business&levi=draft&resultState=draftReady#review",
      blocker: "Ninja can prepare this. Approval is required before filing, publishing, charging, or submitting.",
      allowedAction: "Prepare the business structure, first offer, launch page outline, and approval checklist.",
      nextAction: "Review the draft, then open Formed if you want to continue."
    },
    {
      key: "jobs",
      terms: ["job", "hire", "hiring", "resume", "role", "applicant", "career"],
      assignedSite: "JobsAI",
      assignedAgent: "Work Match Agent",
      href: "/jobsai/index.html?source=ninja&intent=jobs&levi=draft&resultState=draftReady#brief",
      blocker: "No blocker for a draft. Human review is required before posting, applying, messaging, or hiring.",
      allowedAction: "Prepare the role or profile direction, positioning, matching signals, and next review step.",
      nextAction: "Review the draft, then open JobsAI if you want to continue."
    },
    {
      key: "market",
      terms: ["market", "audience", "test", "demand", "untapped", "customer", "niche"],
      assignedSite: "Off Shoot",
      assignedAgent: "Market Signal Agent",
      href: "/offshoot/index.html?source=ninja&intent=market&levi=draft&resultState=draftReady#route",
      blocker: "No blocker for a test plan. Approval is required before publishing, sending outreach, or collecting sensitive data.",
      allowedAction: "Prepare the audience lane, first test offer, response tracker, and plan.",
      nextAction: "Review the draft, then open Off Shoot if you want to continue."
    },
    {
      key: "trust",
      terms: ["trust", "profile", "social", "brand", "bio", "linkedin", "public"],
      assignedSite: "SocialScan",
      assignedAgent: "Trust Check Agent",
      href: "/socialscan/index.html?source=ninja&intent=trust&levi=draft&resultState=draftReady#audit",
      blocker: "No blocker for public-note cleanup. Approval is required before account access, posting, or messaging.",
      allowedAction: "Prepare three public trust issues, three fixes, and a cleanup step.",
      nextAction: "Review the draft, then open SocialScan if you want to continue."
    },
    {
      key: "route",
      terms: ["stuck", "route", "loop", "blocked", "unclear", "manager", "ninja", "ecosystem"],
      assignedSite: "Ninja",
      assignedAgent: "Ninja Work Manager",
      href: "/ninja/",
      blocker: "The goal is broad. Ninja needs one clear draft to start.",
      allowedAction: "Turn the request into one clear plan and stop before external action.",
      nextAction: "Name the one draft to prepare next."
    }
  ];

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function truncate(value, max = 140) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max - 1)}...` : text;
  }

  function toCustomerCopy(text = "") {
    return String(text)
      .replace(/\bninja\s+workflow\b/gi, "Recommended next step")
      .replace(/\broute\s+spine\b:?/gi, "")
      .replaceAll("starting plan", "draft")
      .replaceAll("Local draft", "Draft")
      .replaceAll("local preview", "draft")
      .replaceAll("Local preview", "Draft")
      .replaceAll("starter artifact", "starter Business Draft")
      .replaceAll("Starter artifact", "Starter Business Draft")
      .replaceAll("Starter Artifact", "Starter Business Draft")
      .replaceAll("artifact", "Business Draft")
      .replaceAll("Artifact", "Business Draft")
      .replaceAll("workflow row", "work item")
      .replaceAll("Workflow row", "Work item")
      .replaceAll("workflow", "plan")
      .replaceAll("Workflow", "Plan")
      .replaceAll("approval gate", "approval check")
      .replaceAll("Approval gate", "Approval check")
      .replaceAll("approval boundary", "approval check")
      .replaceAll("Approval boundary", "Approval check")
      .replaceAll("needsInput", "Waiting on you")
      .replaceAll("draftReady", "Draft ready")
      .replaceAll("Next move", "Recommended next step")
      .replaceAll("next move", "recommended next step")
      .replaceAll("Blocker", "What is stuck")
      .replaceAll("blocker", "what is stuck")
      .replaceAll("I assigned", "Best workspace")
      .replaceAll("Assigned", "Best workspace")
      .replace(/Founder Build Agent\\s*(?:->|on)\\s*Formed\\.?/g, "Formed")
      .replace(/Work Match Agent\\s*(?:->|on)\\s*JobsAI\\.?/g, "JobsAI")
      .replace(/Market Signal Agent\\s*(?:->|on)\\s*Off Shoot\\.?/g, "Off Shoot")
      .replace(/Trust Check Agent\\s*(?:->|on)\\s*SocialScan\\.?/g, "SocialScan")
      .replace(/Route Guide Agent\\s*(?:->|on)\\s*Off Shoot\\.?/g, "Off Shoot")
      .replace(/Ninja\\s*->\\s*Admin\\.?/g, "Ninja review");
  }

  function setStatus(message) {
    if (statusText) statusText.textContent = message;
  }

  function statusLabel(status = "") {
    if (status === "draftReady") return "Draft ready";
    if (status === "approvalNeeded") return "Approval needed";
    if (status === "needsInput") return "Waiting on you";
    return toCustomerCopy(status) || "Waiting on you";
  }

  function firstRoute(task = {}) {
    const routes = Array.isArray(task.routes) ? task.routes : [];
    const route = routes.find((item) => item?.href && item.href !== "/ninja/");
    return route || null;
  }

  function setHint(message) {
    if (listenStatus) listenStatus.textContent = message;
  }

  function setListenButton() {
    if (!listenToggle) return;
    listenToggle.disabled = !listeningSupported;
    listenToggle.textContent = listening ? "Stop" : "Talk";
    listenToggle.setAttribute("aria-pressed", String(listening));
  }

  function setFlowStage(stage = 1) {
    flowSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index + 1 <= stage);
    });
  }

  function guardedActionCategory(prompt = "") {
    const lower = String(prompt || "").toLowerCase();
    if (["payment", "pay", "refund", "cancel subscription", "purchase", "stripe", "checkout"].some((term) => lower.includes(term))) return "financial approval";
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
    if (["secret", "password", "key", "ssn", "bank", "card", "code"].some((term) => lower.includes(term))) return "sensitive-data approval";
    return "";
  }

  function profileForPrompt(prompt = "") {
    const lower = String(prompt || "").toLowerCase();
    return routeProfiles.find((profile) => profile.terms.some((term) => lower.includes(term))) || routeProfiles[4];
  }

  function usefulArtifactForTask(goal, profile) {
    const cleanGoal = truncate(goal, 180);
    if (profile.key === "business") {
      return {
        title: "Business launch draft",
        items: [
          "Best workspace: Formed.",
          `Draft: turn "${cleanGoal}" into a business structure, first offer, and launch page outline.`,
          "Approval check: review before filing, publishing, charging, submitting, or sending.",
        ]
      };
    }
    if (profile.key === "jobs") {
      return {
        title: "Work draft",
        items: [
          "Best workspace: JobsAI.",
          `Draft: turn "${cleanGoal}" into a role or profile brief.`,
          "Approval check: review before posting, applying, messaging, or hiring.",
        ]
      };
    }
    if (profile.key === "market") {
      return {
        title: "Market test draft",
        items: [
          "Best workspace: Off Shoot.",
          `Draft: turn "${cleanGoal}" into one audience lane and one test offer.`,
          "Approval check: review before outreach, publishing, collecting sensitive data, or spending.",
        ]
      };
    }
    if (profile.key === "trust") {
      return {
        title: "Trust cleanup draft",
        items: [
          "Best workspace: SocialScan.",
          `Draft: turn "${cleanGoal}" into three public trust issues and three fixes.`,
          "Approval check: review before account access, posting, or messaging.",
        ]
      };
    }
    return {
      title: "Ninja plan",
      items: [
        `Focus "${cleanGoal}" into one clear draft.`,
        "Keep the work inside this page until the draft is clear.",
        "Approval check: pause before anything is submitted, published, charged, or sent."
      ]
    };
  }

  function normalizeTask(task = {}, fallbackPrompt = "") {
    const goal = truncate(task.goal || fallbackPrompt || "Ninja task", 240);
    const profile = profileForPrompt(goal);
    const approvalCategory = task.approvalCategory || guardedActionCategory(goal);
    const approvalRequired = typeof task.approvalRequired === "boolean"
      ? task.approvalRequired
      : Boolean(approvalCategory);
    const status = approvalRequired ? "approvalNeeded" : (task.status === "waiting approval" ? "approvalNeeded" : task.status || "draftReady");
    const routes = Array.isArray(task.routes) && task.routes.length
      ? task.routes
      : [{ label: profile.assignedSite, href: profile.href, agent: profile.assignedAgent, key: profile.key }];
    const blocker = task.blocker || (approvalRequired
      ? `Approval status: owner approval required before the real-world part: ${approvalCategory}.`
      : profile.blocker);
    const allowedAction = task.allowedAction || profile.allowedAction;
    const usefulArtifact = task.usefulArtifact || usefulArtifactForTask(goal, profile);
    const resultLog = Array.isArray(task.resultLog) && task.resultLog.length
      ? task.resultLog
      : [
        "Captured the task.",
        `Best workspace: ${task.assignedSite || profile.assignedSite}.`,
        approvalRequired ? `Paused before the step that needs approval: ${approvalCategory}.` : "Prepared a draft. No external action was taken.",
        "No payment, submission, publishing, message, upload, deletion, or account change was performed."
      ];

    return {
      ...task,
      goal,
      status,
      assignedAgent: task.assignedAgent || profile.assignedAgent,
      assignedSite: task.assignedSite || profile.assignedSite,
      blocker,
      approvalRequired,
      approvalCategory,
      allowedAction,
      usefulArtifact,
      resultLog,
      nextAction: task.nextAction || profile.nextAction,
      routes,
      guardrail: task.guardrail || "Action rule: prepare drafts and checks; ask approval before real-world actions."
    };
  }

  function buildLocalTask(prompt) {
    const cleanPrompt = truncate(prompt, 240);
    if (!cleanPrompt) {
      return normalizeTask({
        goal: "Tell Ninja what you want to finish.",
        status: "needsInput",
        assignedAgent: "Ninja Work Manager",
        assignedSite: "Ninja",
        blocker: "Ninja is waiting for one sentence.",
        approvalRequired: false,
        allowedAction: "Start with one sentence and Ninja will prepare the first draft.",
        resultLog: [
          "Waiting for your request.",
          "No external action has happened."
        ],
        nextAction: "Type one sentence, then press Start."
      });
    }

    return normalizeTask({
      goal: cleanPrompt,
      createdAt: new Date().toISOString()
    }, cleanPrompt);
  }

  function updateFlow(task = null) {
    if (!task) {
      if (flowGoal) flowGoal.textContent = "Waiting for one goal or blocker.";
      if (flowOwner) flowOwner.textContent = "Ninja finds the best workspace.";
      if (flowSite) flowSite.textContent = "Approval status appears here.";
      if (flowNext) flowNext.textContent = "One safe next action appears here.";
      setFlowStage(1);
      return;
    }

    if (flowGoal) flowGoal.textContent = toCustomerCopy(truncate(task.goal, 96));
    if (flowOwner) flowOwner.textContent = toCustomerCopy(task.assignedSite);
    if (flowSite) flowSite.textContent = task.approvalRequired ? task.approvalCategory || "approval required" : "Approval required before any external action.";
    if (flowNext) flowNext.textContent = toCustomerCopy(truncate(task.nextAction, 120));
    setFlowStage(task.status === "needsInput" ? 1 : task.approvalRequired ? 3 : 4);
  }

  function customerDraftTitle(task = {}) {
    const workspace = toCustomerCopy(task.assignedSite || "Ninja").replace(/[.]+$/, "");
    if (task.status === "needsInput") return "Ninja plan";
    if (workspace === "Formed") return "Business launch draft";
    if (workspace === "JobsAI") return "Work draft";
    if (workspace === "Off Shoot") return "Market test draft";
    if (workspace === "SocialScan") return "Trust cleanup draft";
    return `${workspace || "Ninja"} draft`;
  }

  function customerDraftItems(task = {}) {
    if (task.status === "needsInput") {
      return [
        "Focus the request into one clear draft.",
        "Keep the work inside this page until the draft is clear.",
        "Approval check: pause before anything is submitted, published, charged, or sent."
      ];
    }

    const workspace = toCustomerCopy(task.assignedSite || "Ninja").replace(/[.]+$/, "");
    const goal = toCustomerCopy(truncate(task.goal, 150));
    const approvalLine = task.approvalRequired
      ? `Approval check: review ${task.approvalCategory || "the approval-needed step"} before anything outside this page happens.`
      : "Approval check: review before anything is submitted, published, charged, or sent.";

    if (workspace === "Formed") {
      return [
        "Best workspace: Formed.",
        `Draft: turn "${goal}" into a business structure, first offer, and launch page outline.`,
        approvalLine,
      ];
    }
    if (workspace === "JobsAI") {
      return [
        "Best workspace: JobsAI.",
        `Draft: turn "${goal}" into a role or profile brief with a review step.`,
        approvalLine,
      ];
    }
    if (workspace === "Off Shoot") {
      return [
        "Best workspace: Off Shoot.",
        `Draft: turn "${goal}" into an audience lane and first test offer.`,
        approvalLine,
      ];
    }
    if (workspace === "SocialScan") {
      return [
        "Best workspace: SocialScan.",
        `Draft: turn "${goal}" into public trust fixes and cleanup notes.`,
        approvalLine,
      ];
    }
    return [
      "Best workspace: Ninja.",
      `Draft: turn "${goal}" into one focused plan and one review step.`,
      approvalLine,
    ];
  }

  function draftSummary(task = {}) {
    if (task.status === "needsInput") return "Your draft will appear here.";
    return `${customerDraftTitle(task)} is ready for review.`;
  }

  function approvalSummary(task = {}) {
    if (task.status === "needsInput") {
      return "Nothing will be submitted, published, charged, or sent without your approval.";
    }
    if (task.approvalRequired) {
      return `Review ${task.approvalCategory || "the approval-needed step"} before anything outside this page happens.`;
    }
    return "Review first. Nothing leaves this page without approval.";
  }

  function nextStepLabel(task = {}) {
    const route = task.approvalRequired ? null : firstRoute(task);
    if (!route) return "";
    const label = toCustomerCopy(route.label || task.assignedSite || "workspace").replace(/[.]+$/, "");
    return `Continue in ${label}`;
  }

  function customerNextStep(task = {}) {
    if (task.status === "needsInput") return "Type one sentence, then press Start.";
    if (task.approvalRequired) return "Review the approval check before continuing.";
    const route = task.approvalRequired ? null : firstRoute(task);
    if (route) {
      const label = toCustomerCopy(route.label || task.assignedSite || "workspace").replace(/[.]+$/, "");
      return `Open ${label} when you are ready.`;
    }
    return "Name the draft you want first.";
  }

  function renderTask(task) {
    if (!output) return;
    const currentTask = task.status === "needsInput"
      ? "Tell Ninja what you want to finish."
      : truncate(task.goal, 120);
    const recommendedStep = customerNextStep(task);
    const route = firstRoute(task);
    const ctaLabel = nextStepLabel(task);
    output.innerHTML = `
      <section class="ninja-result-section">
        <h2>Current task</h2>
        <p>${escapeHtml(toCustomerCopy(currentTask))}</p>
      </section>
      <section class="ninja-result-section">
        <h2>Recommended next step</h2>
        <p>${escapeHtml(toCustomerCopy(recommendedStep))}</p>
      </section>
      <section class="ninja-result-section ninja-draft">
        <h2>Draft ready</h2>
        <p>${escapeHtml(toCustomerCopy(draftSummary(task)))}</p>
      </section>
      <section class="ninja-result-section">
        <h2>Approval check</h2>
        <p>${escapeHtml(toCustomerCopy(approvalSummary(task)))}</p>
      </section>
      ${route && ctaLabel ? `<a class="result-next-link" href="${escapeHtml(route.href)}">${escapeHtml(ctaLabel)}</a>` : ""}
    `;
    updateFlow(task);
  }

  function renderTasks(tasks) {
    if (!taskList) return;
    const items = Array.isArray(tasks) ? tasks.map((task) => normalizeTask(task)).slice(0, 6) : [];
    taskList.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("p");
      empty.textContent = "No result log yet.";
      taskList.append(empty);
      return;
    }

    items.forEach((task) => {
      const card = document.createElement("article");
      card.className = "task-card";
      card.innerHTML = `
        <span class="site-pill">${escapeHtml(statusLabel(task.status))}</span>
        <h3>${escapeHtml(toCustomerCopy(truncate(task.goal, 70)))}</h3>
        <p>Best workspace: ${escapeHtml(toCustomerCopy(task.assignedSite))}</p>
        <p>${escapeHtml(toCustomerCopy(truncate(task.blocker || "No approval-required action has happened.", 92)))}</p>
      `;
      taskList.append(card);
    });
  }

  async function loadTasks() {
    if (!taskList) return;
    try {
      const response = await fetch("/api/ninja/tasks");
      if (!response.ok) throw new Error("Ninja work list is not available yet.");
      const data = await response.json();
      renderTasks(data.tasks);
    } catch (_error) {
      renderTasks([]);
    }
  }

  function speak(text) {
    if (!voiceSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function responseText(task) {
    return toCustomerCopy([
      `Recommended next step: ${customerNextStep(task)}`,
      approvalSummary(task)
    ].join(" "));
  }

  async function createNinjaTask(prompt) {
    const response = await fetch("/api/ninja/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Ninja prepared the draft, but the saved work list could not be updated.");
    }

    return response.json();
  }

  function createRecognition() {
    if (!listeningSupported) return null;
    const instance = new SpeechRecognition();
    instance.lang = "en-US";
    instance.continuous = false;
    instance.interimResults = true;
    instance.maxAlternatives = 1;

    instance.addEventListener("start", () => {
      listening = true;
      setListenButton();
      setStatus("Listening");
      setHint("Speak one task. Ninja fills the field; press Start when ready.");
    });

    instance.addEventListener("result", (event) => {
      let transcript = "";
      let finalTranscript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const phrase = event.results[index][0].transcript.trim();
        transcript += `${phrase} `;
        if (event.results[index].isFinal) finalTranscript += `${phrase} `;
      }
      promptInput.value = transcript.trim();
      resizeInput();

      const prompt = finalTranscript.trim();
      if (prompt && prompt !== lastFinalPrompt) {
        lastFinalPrompt = prompt;
        setStatus("Waiting on you");
        setHint("Voice filled the field. Press Start when ready.");
      }
    });

    instance.addEventListener("error", (event) => {
      listening = false;
      setListenButton();
      setStatus("Waiting on you");
      setHint(event.error === "not-allowed" ? "Mic permission needed. You can still type the task." : "Mic stopped. You can type the task.");
    });

    instance.addEventListener("end", () => {
      listening = false;
      setListenButton();
      setStatus("Waiting on you");
    });

    return instance;
  }

  function resizeInput() {
    if (!promptInput) return;
    promptInput.style.height = "auto";
    promptInput.style.height = `${Math.min(promptInput.scrollHeight, 132)}px`;
  }

  async function submitPrompt(prompt) {
    const cleanPrompt = String(prompt || "").trim();
    if (!cleanPrompt) {
      const task = buildLocalTask("");
      renderTask(task);
      setStatus("Waiting on you");
      setHint("One sentence is enough.");
      return;
    }

    const localTask = buildLocalTask(cleanPrompt);
    renderTask(localTask);
    promptInput.value = "";
    resizeInput();
    setStatus("Draft ready");
    setHint("Ready.");

    try {
      const result = await createNinjaTask(cleanPrompt);
      const task = normalizeTask(result.task, cleanPrompt);
      renderTask(task);
      await loadTasks();
      setStatus(statusLabel(task.status));
      setHint("Ready.");
      speak(responseText(task));
    } catch (error) {
      setStatus(statusLabel(localTask.status));
      setHint(error.message || "Draft ready. The saved work list was not updated.");
      speak(responseText(localTask));
    }
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitPrompt(promptInput.value);
  });

  promptInput?.addEventListener("input", resizeInput);

  listenToggle?.addEventListener("click", () => {
    if (!listeningSupported) {
      setHint("Voice is not available in this browser yet. Type one task and press Enter.");
      return;
    }
    if (!recognition) recognition = createRecognition();
    if (listening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch (_error) {
      setHint("Mic is already starting.");
    }
  });

  refreshTasks?.addEventListener("click", loadTasks);

  setListenButton();
  resizeInput();
  loadTasks();
  renderTask(buildLocalTask(""));
  window.setTimeout(() => promptInput?.focus(), 50);
})();
