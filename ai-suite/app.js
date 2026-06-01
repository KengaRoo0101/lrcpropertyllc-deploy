(function initAiSuiteBuildout() {
  "use strict";

  const rooms = [
    ["00", "Tour", "Orientation", "Suite Map draft", "Navigate the suite path"],
    ["01", "Identity", "Self-definition", "Agent Profile", "Use a working AI profile"],
    ["02", "Safety", "Boundary setting", "Data Boundary", "Controlled setup access"],
    ["03", "Sandbox", "Safe testing", "Sandbox Rule Sheet", "Experiment without live risk"],
    ["04", "AI Basics", "Prompt structure", "Basic Prompt Pattern", "Produce reliable outputs"],
    ["05", "Task Design", "Delegation", "Task Brief", "Give agents scoped work"],
    ["06", "Permissions", "Access review", "Connector Review", "Evaluate connectors and tools"],
    ["07", "Codex Buildout", "Approved work scope", "Approved Buildout Resource List", "Codex buildout access"],
    ["08", "Collaboration", "Human-agent workflow", "Collaboration Protocol", "Run reviewed multi-step work"],
    ["09", "Launch Readiness", "Release review", "Launch Checklist", "Move assets into controlled use"],
    ["10", "Operator Mode", "Maintenance", "Operator Mode Dashboard", "Maintain the suite over time"],
  ].map(([id, title, skill, asset, unlock]) => ({
    id,
    title,
    skill,
    asset,
    unlock,
    purpose: purposeFor(id),
    why: whyFor(id),
    builds: buildsFor(id, asset),
    boundary: boundaryFor(id),
    checklist: checklistFor(id),
    reward: rewardFor(id),
    starter: starterFor(id, title, asset),
  }));

  const state = {
    currentRoom: "00",
    completed: new Set(JSON.parse(sessionStorage.getItem("aiSuite.completedRooms") || "[]")),
    drafts: {},
  };

  const nodes = {
    roomList: document.querySelector("#room-list"),
    roomPanel: document.querySelector("#room-panel"),
    progress: document.querySelector("#ai-suite-progress"),
    unlockGrid: document.querySelector("#unlock-grid"),
    assetTitle: document.querySelector("#asset-title"),
    assetEditor: document.querySelector("#asset-editor"),
    assetStatus: document.querySelector("#asset-status"),
    markComplete: document.querySelector("#mark-complete"),
    copyAsset: document.querySelector("#copy-asset"),
    downloadAsset: document.querySelector("#download-asset"),
  };

  function currentRoom() {
    return rooms.find((room) => room.id === state.currentRoom) || rooms[0];
  }

  function render() {
    renderRooms();
    renderRoomPanel();
    renderAssetPanel();
    renderUnlocks();
  }

  function renderRooms() {
    nodes.roomList.innerHTML = rooms.map((room) => {
      const active = room.id === state.currentRoom ? "is-active" : "";
      const complete = state.completed.has(room.id) ? "is-complete" : "";
      return `
        <button class="ai-room-button ${active} ${complete}" type="button" data-room-id="${room.id}">
          <span class="ai-room-index">${room.id}</span>
          <span>
            <strong>${escapeHtml(room.title)}</strong>
            <small>${escapeHtml(room.asset)}</small>
          </span>
        </button>
      `;
    }).join("");

    nodes.roomList.querySelectorAll("[data-room-id]").forEach((button) => {
      button.addEventListener("click", () => {
        saveDraft();
        state.currentRoom = button.dataset.roomId;
        render();
        nodes.roomPanel.focus();
      });
    });

    nodes.progress.textContent = `${state.completed.size} / ${rooms.length} complete`;
  }

  function renderRoomPanel() {
    const room = currentRoom();
    nodes.roomPanel.innerHTML = `
      <p class="ai-room-kicker">Room ${room.id} | ${escapeHtml(room.skill)}</p>
      <h2>${escapeHtml(room.title)}</h2>
      <div class="ai-room-grid">
        ${card("Purpose", room.purpose)}
        ${card("Why it matters", room.why)}
        ${card("What the user builds", room.builds)}
        ${card("What the user unlocks", room.unlock)}
        ${card("Safety boundary", room.boundary)}
        ${card("Reward", room.reward)}
      </div>
      <div class="ai-room-card">
        <span>Completion checklist</span>
        <ul class="ai-room-list">
          ${room.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  function renderAssetPanel() {
    const room = currentRoom();
    nodes.assetTitle.textContent = room.asset;
    nodes.assetEditor.value = state.drafts[room.id] || room.starter;
    nodes.markComplete.textContent = state.completed.has(room.id) ? "Reopen room" : "Mark room complete";
    nodes.assetStatus.textContent = "Drafts are in-memory only. Copy or download to keep the asset.";
  }

  function renderUnlocks() {
    nodes.unlockGrid.innerHTML = rooms.map((room) => `
      <article class="ai-unlock-card ${state.completed.has(room.id) ? "is-complete" : ""}">
        <span>${room.id} ${escapeHtml(room.title)}</span>
        <p><strong>${escapeHtml(room.unlock)}.</strong> Asset: ${escapeHtml(room.asset)}.</p>
      </article>
    `).join("");
  }

  function saveDraft() {
    state.drafts[state.currentRoom] = nodes.assetEditor.value;
  }

  function persistCompleted() {
    sessionStorage.setItem("aiSuite.completedRooms", JSON.stringify([...state.completed]));
  }

  function card(label, value) {
    return `<div class="ai-room-card"><span>${escapeHtml(label)}</span><p>${escapeHtml(value)}</p></div>`;
  }

  function downloadMarkdown(filename, markdown) {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function slug(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  async function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch (error) {
        // Clipboard permissions can be unavailable in private review contexts.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  nodes.assetEditor.addEventListener("input", saveDraft);

  nodes.markComplete.addEventListener("click", () => {
    saveDraft();
    if (state.completed.has(state.currentRoom)) state.completed.delete(state.currentRoom);
    else state.completed.add(state.currentRoom);
    persistCompleted();
    render();
  });

  nodes.copyAsset.addEventListener("click", async () => {
    saveDraft();
    const copied = await copyText(nodes.assetEditor.value);
    nodes.assetStatus.textContent = copied ? "Asset copied." : "Copy unavailable. Download remains available.";
  });

  nodes.downloadAsset.addEventListener("click", () => {
    saveDraft();
    downloadMarkdown(slug(currentRoom().asset), nodes.assetEditor.value);
    nodes.assetStatus.textContent = "Asset downloaded.";
  });

  function purposeFor(id) {
    return {
      "00": "Orient the user to the buildout path and show that every room creates part of their own system.",
      "01": "Define who the user's AI suite serves and what role it should play.",
      "02": "Establish safety boundaries before unlocking stronger tools or Codex buildout work.",
      "03": "Create a safe place to test prompts, templates, and small workflows.",
      "04": "Teach the mechanics of useful context, constraints, examples, and output expectations.",
      "05": "Turn vague requests into task briefs an agent or Codex can execute.",
      "06": "Review connectors, file access, account access, and approval levels before use.",
      "07": "Define approved buildout resources where Codex can work.",
      "08": "Set up the working rhythm between the user, Codex, and future agents.",
      "09": "Prepare the user's AI suite assets for controlled real use.",
      "10": "Move from setup into ongoing operation of the user's AI suite.",
    }[id];
  }

  function whyFor(id) {
    return {
      "00": "This is not a course to consume. It is a guided buildout where safety, capability, and assets grow together.",
      "01": "A suite without identity becomes generic. Clear identity keeps later agents and workflows aligned.",
      "02": "Power without boundaries creates risk. Safety makes stronger access reviewable.",
      "03": "The sandbox lets the user build while keeping experiments separate from accounts, billing, and production.",
      "04": "Reliable AI work starts with clear instructions and reusable patterns.",
      "05": "Good task design reduces rework, prevents unsafe assumptions, and clarifies verification.",
      "06": "Permissions decide what an AI system can see and change.",
      "07": "Codex is useful when its working area is explicit and restricted.",
      "08": "Collaboration rules keep the user in control while agents do useful work.",
      "09": "Assets should move from practice to real use only after quality and safety review.",
      "10": "A useful suite needs maintenance, improvement, retirement, and new approval decisions.",
    }[id];
  }

  function buildsFor(id, asset) {
    if (id === "07") return "An approved buildout resource list naming exact folders, files, repos, and tests Codex may use.";
    if (id === "09") return "A launch checklist for the first approved AI suite workflow or asset bundle.";
    return `A reusable ${asset} that becomes part of the user's permanent AI suite.`;
  }

  function boundaryFor(id) {
    if (id === "06") return "Reviewing a connector is not the same as authorizing it. Separate approval is required before use.";
    if (id === "07") return "Codex may have full working access only inside approved buildout resources.";
    if (id === "09") return "Launch readiness does not include payments, production changes, personal data processing, or connector activation without approval.";
    return "No personal accounts, payment data, secrets, billing, organization administration, unrelated repositories, or production systems without separate approval.";
  }

  function checklistFor(id) {
    return {
      "00": ["Open the suite map.", "Name the buildout path.", "Understand safety gates.", "Confirm every room creates an asset."],
      "01": ["Name the suite or agent.", "List top jobs.", "Write tone preferences.", "Name what the suite must not do."],
      "02": ["Review restricted data.", "Confirm payments are out of scope.", "Name separate-approval zones.", "Save the boundary."],
      "03": ["Name the sandbox.", "List approved test data.", "List prohibited data.", "Create one dummy scenario."],
      "04": ["Write one prompt pattern.", "Include context and constraints.", "Define output format.", "Avoid restricted data."],
      "05": ["Name the task goal.", "List approved inputs.", "Define out of scope.", "Add verification."],
      "06": ["Name the connector.", "List read access.", "List write access.", "Approve, reject, or defer."],
      "07": ["Name approved resources.", "Name read-only resources.", "List prohibited resources.", "Approve one safe task."],
      "08": ["Define when agents proceed.", "Define when agents ask.", "Choose progress reporting.", "Set approval gates."],
      "09": ["Name the asset.", "Verify sandbox behavior.", "Review boundaries.", "Document stop conditions."],
      "10": ["List active assets.", "Choose review cadence.", "Identify stale assets.", "Name next safe improvement."],
    }[id];
  }

  function rewardFor(id) {
    return {
      "00": "The user can see the full path from beginner setup to operator mode.",
      "01": "The AI suite now has an identity layer.",
      "02": "The user earns the first safety unlock: controlled setup access.",
      "03": "The user unlocks safe experimentation.",
      "04": "The user unlocks reliable prompting.",
      "05": "The user unlocks structured delegation.",
      "06": "The user unlocks permission literacy.",
      "07": "The user unlocks controlled Codex buildout power.",
      "08": "The user unlocks a repeatable human-agent workflow.",
      "09": "The user unlocks launch readiness.",
      "10": "The user graduates into operator mode.",
    }[id];
  }

  function starterFor(id, title, asset) {
    return `# ${asset}

## Room

${id} ${title}

## Purpose


## Approved Inputs


## Boundary

No personal accounts, payment data, secrets, billing, organization administration, unrelated repositories, or production systems without separate approval.

## Draft


## Next Review

`;
  }

  render();
})();
