(function initFounderGuidedIntro() {
  "use strict";

  const packetVersion = "2026-05-30";
  let currentPacket = null;

  const form = document.querySelector("[data-orientation-form]");
  const packetTarget = document.querySelector("[data-review-packet]");
  const ackForm = document.querySelector("[data-ack-form]");
  const ackSubmit = document.querySelector("[data-ack-submit]");
  const ackStatus = document.querySelector("[data-ack-status]");
  const copyPacketButton = document.querySelector("[data-copy-packet]");
  const downloadPacketButton = document.querySelector("[data-download-packet]");
  const videoRoot = document.querySelector("[data-founder-video]");
  const videoFrame = document.querySelector("[data-founder-video-frame]");

  function clean(value, limit) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, limit);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function selectedValues(formData, key) {
    return formData.getAll(key).map((value) => clean(value, 120)).filter(Boolean);
  }

  function inferPotentialContributionArea(startingLane, statedInterest) {
    const lane = clean(startingLane, 80).toLowerCase();
    const interest = clean(statedInterest, 500).toLowerCase();

    if (lane.includes("business")) return "Strategy, operating clarity, and business system review";
    if (lane.includes("innovator")) return "Concept proof, opportunity mapping, and early prototype review";
    if (lane.includes("builder")) return "Tools, workflows, prompts, routes, and system testing";
    if (lane.includes("reviewer")) return "Quality, risk, ownership, privacy, claims, and usefulness review";
    if (lane.includes("learner")) return "Learning proof, explanation quality, and project-based growth";
    if (lane.includes("operator")) return "Checklists, records, handoffs, approvals, and accountable execution";
    if (lane.includes("creator")) return "Voice, content systems, contribution tracking, and ownership protection";
    if (interest.includes("data") || interest.includes("privacy")) return "Data, privacy, and review discipline";

    return "Exploratory / human review required";
  }

  function riskFlagsFor(packet) {
    const flags = [];

    if (packet.startingLane === "Exploratory / human review required") {
      flags.push("Starting lane needs human clarification.");
    }

    if (packet.responsibilitySignal.length < 40) {
      flags.push("Responsibility signal is short and should be reviewed carefully.");
    }

    if (packet.collaborationSignal.length < 40) {
      flags.push("Collaboration signal is short and should be reviewed carefully.");
    }

    if (!packet.protectionPriorities.length) {
      flags.push("No protection priorities selected.");
    }

    return flags.length ? flags : ["No automatic risk flags. Human review still required."];
  }

  function buildPacket(formData) {
    const selectedLane = clean(formData.get("startingLane"), 80);
    const startingLane = selectedLane === "Not sure yet" ? "Exploratory / human review required" : selectedLane;
    const statedInterest = clean(formData.get("statedInterest"), 1200);
    const responsibilitySignal = clean(formData.get("responsibilitySignal"), 1200);
    const collaborationSignal = clean(formData.get("collaborationSignal"), 1200);
    const qualitySignal = clean(formData.get("qualitySignal"), 900);

    const packet = {
      type: "initial_lrc_review_packet",
      version: packetVersion,
      page: "/stewardship-packet/",
      name: clean(formData.get("name"), 120),
      invitationSource: clean(formData.get("invitationSource"), 160),
      startingLane,
      statedInterest,
      potentialContributionArea: inferPotentialContributionArea(startingLane, statedInterest),
      responsibilitySignal,
      protectionPriorities: selectedValues(formData, "protectionPriorities"),
      collaborationSignal,
      qualitySignal,
      riskFlags: [],
      acknowledgements: {
        qualityGatedEnvironment: false,
        noEmploymentOwnershipCompensationRank: false,
        contributionTermsRequired: false,
        leverageRequiresResponsibility: false
      },
      humanReviewRequired: true,
      writtenTermsRequiredBeforeOperationalContribution: true,
      founderReview: "pending",
      coStewardReview: "pending",
      counselReviewNeeded: "case_by_case",
      createdAt: new Date().toISOString(),
      note: "This packet is not approval. It is an orientation record for human review."
    };

    packet.riskFlags = riskFlagsFor(packet);
    return packet;
  }

  function packetText(packet) {
    return JSON.stringify(packet, null, 2);
  }

  function renderPacket(packet) {
    if (!packetTarget) return;

    packetTarget.innerHTML = `
      <p class="eyebrow">Initial LRC Review Packet</p>
      <h3>Human review required.</h3>
      <dl class="lrc-packet-summary">
        <div><dt>Starting lane</dt><dd>${escapeHtml(packet.startingLane || "Pending")}</dd></div>
        <div><dt>Contribution area</dt><dd>${escapeHtml(packet.potentialContributionArea)}</dd></div>
        <div><dt>Founder review</dt><dd>${escapeHtml(packet.founderReview)}</dd></div>
        <div><dt>Counsel review</dt><dd>${escapeHtml(packet.counselReviewNeeded)}</dd></div>
      </dl>
      <p>${escapeHtml(packet.note)}</p>
      <pre class="lrc-packet-json">${escapeHtml(packetText(packet))}</pre>
      <div class="lrc-suite-actions">
        <button class="secondary-button" type="button" data-copy-generated-packet>Copy Review Packet</button>
        <button class="secondary-button" type="button" data-download-generated-packet>Download Review Packet</button>
      </div>
    `;

    const copyGenerated = packetTarget.querySelector("[data-copy-generated-packet]");
    const downloadGenerated = packetTarget.querySelector("[data-download-generated-packet]");

    copyGenerated.addEventListener("click", () => copyPacket(copyGenerated));
    downloadGenerated.addEventListener("click", downloadPacket);
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Fall back to a temporary textarea for browsers without clipboard permission.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }

  async function copyPacket(button) {
    if (!currentPacket) {
      updateAckStatus("Generate a review packet before copying.");
      return;
    }

    const copied = await copyText(packetText(currentPacket));
    const original = button.textContent;
    button.textContent = copied ? "Copied" : "Copy unavailable";
    setTimeout(() => {
      button.textContent = original;
    }, 1400);
  }

  function downloadPacket() {
    if (!currentPacket) {
      updateAckStatus("Generate a review packet before downloading.");
      return;
    }

    const blob = new Blob([packetText(currentPacket)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "initial-lrc-review-packet.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function updateAckStatus(message) {
    if (ackStatus) ackStatus.textContent = message;
  }

  function allAcknowledgementsChecked() {
    if (!ackForm) return false;
    return Array.from(ackForm.querySelectorAll("input[type='checkbox']")).every((input) => input.checked);
  }

  function readAcknowledgements() {
    if (!ackForm) return {};
    const data = new FormData(ackForm);
    return {
      qualityGatedEnvironment: data.has("qualityGatedEnvironment"),
      noEmploymentOwnershipCompensationRank: data.has("noEmploymentOwnershipCompensationRank"),
      contributionTermsRequired: data.has("contributionTermsRequired"),
      leverageRequiresResponsibility: data.has("leverageRequiresResponsibility")
    };
  }

  function updateAckButton() {
    if (!ackSubmit) return;
    ackSubmit.disabled = !allAcknowledgementsChecked();
  }

  function appendAcknowledgement() {
    const acknowledgementPatch = {
      acknowledgements: readAcknowledgements(),
      acknowledgedAt: new Date().toISOString()
    };

    if (!currentPacket) {
      currentPacket = {
        type: "initial_lrc_review_packet",
        version: packetVersion,
        page: "/stewardship-packet/",
        name: "",
        invitationSource: "",
        startingLane: "Acknowledgement only / orientation not completed",
        statedInterest: "",
        potentialContributionArea: "Human review required",
        responsibilitySignal: "",
        protectionPriorities: [],
        collaborationSignal: "",
        qualitySignal: "",
        riskFlags: ["Orientation questions were not completed before acknowledgement."],
        humanReviewRequired: true,
        writtenTermsRequiredBeforeOperationalContribution: true,
        founderReview: "pending",
        coStewardReview: "pending",
        counselReviewNeeded: "case_by_case",
        createdAt: new Date().toISOString(),
        note: "This packet is not approval. It is an orientation record for human review."
      };
    }

    currentPacket = {
      ...currentPacket,
      ...acknowledgementPatch
    };

    renderPacket(currentPacket);
    updateAckStatus("Standard accepted locally. No backend submission endpoint is configured here; copy or download the packet for human review.");
  }

  async function assetExists(url) {
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async function renderFounderVideo() {
    if (!videoRoot || !videoFrame) return;

    const videoSrc = "/assets/lrc-founder-brief.mp4";
    const posterSrc = "/assets/lrc-founder-video-poster.jpg";
    const [hasVideo, hasPoster] = await Promise.all([assetExists(videoSrc), assetExists(posterSrc)]);

    if (!hasVideo) return;

    videoFrame.innerHTML = `
      <video controls playsinline preload="metadata"${hasPoster ? ` poster="${posterSrc}"` : ""}>
        <source src="${videoSrc}" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    `;
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      currentPacket = buildPacket(new FormData(form));
      renderPacket(currentPacket);
      updateAckStatus("Packet generated locally. Human review is still required before any deeper access or operational contribution.");
      packetTarget.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  }

  if (ackForm) {
    ackForm.addEventListener("change", updateAckButton);
    ackForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!allAcknowledgementsChecked()) return;
      appendAcknowledgement();
    });
  }

  if (copyPacketButton) copyPacketButton.addEventListener("click", () => copyPacket(copyPacketButton));
  if (downloadPacketButton) downloadPacketButton.addEventListener("click", downloadPacket);

  updateAckButton();
  renderFounderVideo();
})();
