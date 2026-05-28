(function () {
  const ACKNOWLEDGEMENT_VERSION = "lrc-private-preview-v1";

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setStatus(element, message, state) {
    if (!element) return;
    element.textContent = message;
    element.dataset.state = state;
  }

  function renderPreview(container, preview) {
    const boundaries = Array.isArray(preview.boundaries) ? preview.boundaries : [];
    container.innerHTML = `
      <p><strong>Proof of concept:</strong> ${escapeHtml(preview.proof)}</p>
      <p>${escapeHtml(preview.pitch)}</p>
      <p><strong>Safe first ask:</strong> ${escapeHtml(preview.safeFirstAsk)}</p>
      ${boundaries.length ? `<ul>${boundaries.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      <a class="secondary-button" href="${escapeHtml(preview.ctaHref || "../safety.html")}">${escapeHtml(preview.ctaLabel || "Review Safety Notes")}</a>
    `;
  }

  document.querySelectorAll("[data-invite-card]").forEach((card) => {
    const form = card.querySelector("[data-invite-form]");
    const status = card.querySelector("[data-invite-status]");
    const content = card.querySelector("[data-invite-content]");
    const expected = normalize(card.dataset.inviteCode);
    const submitButton = form?.querySelector("button[type='submit']");

    if (!form || !content || !expected) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const invitee = normalize(formData.get("invitee") || card.dataset.inviteCode);
      const passphrase = normalize(formData.get("passphrase"));
      const signatureName = String(formData.get("signatureName") || "").trim();
      const agreed = formData.get("agreement") === "on";

      if (!agreed) {
        setStatus(status, "Check the private preview acknowledgement before viewing this pitch.", "error");
        return;
      }

      if (passphrase !== expected) {
        setStatus(status, "Use the invited person's first name to view this pitch.", "error");
        return;
      }

      if (signatureName.length < 2) {
        setStatus(status, "Type your acknowledgement name before viewing this pitch.", "error");
        return;
      }

      if (submitButton) submitButton.disabled = true;
      setStatus(status, "Recording private preview acknowledgement...", "pending");

      try {
        const response = await fetch("/api/private-preview/acknowledgement", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            invitee,
            passphrase,
            signatureName,
            agreement: true,
            acknowledgementVersion: ACKNOWLEDGEMENT_VERSION,
            source: "friends-family",
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || !data.preview) {
          throw new Error(data.error || "Private preview could not be unlocked.");
        }

        renderPreview(content, data.preview);
        content.hidden = false;
        form.hidden = true;
        setStatus(
          status,
          data.stored
            ? "Acknowledgement recorded. Private preview unlocked. This does not create a role, grant access, or replace a signed agreement."
            : "Private preview unlocked. Storage was not confirmed, so use a signed agreement before deeper access.",
          data.stored ? "success" : "pending",
        );
      } catch (error) {
        setStatus(status, error.message || "Private preview could not be unlocked.", "error");
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
})();
