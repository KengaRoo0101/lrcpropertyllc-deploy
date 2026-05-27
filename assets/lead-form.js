const leadForm = document.querySelector("#lead-form");
const leadStatus = document.querySelector("#lead-status");

function setLeadStatus(message, state = "") {
  if (!leadStatus) return;
  leadStatus.textContent = message;
  leadStatus.dataset.state = state;
}

if (leadForm) {
  const handoffStorageKey = window.LRCLeadHandoff?.storageKey || "lrcLeadHandoff";
  const defaultSource = leadForm.elements.source?.value || "";

  function setFieldValue(field, value) {
    if (!field || !value) return;

    if (field.tagName === "SELECT") {
      const hasOption = Array.from(field.options).some((option) => option.value === value);
      if (!hasOption) {
        field.append(new Option(value, value));
      }
    }

    field.value = value;
  }

  function prefillFromParams() {
    const params = new URLSearchParams(window.location.search);
    const stored = readStoredHandoff();
    const interest = params.get("interest") || params.get("toolInterest") || stored.interest;
    const message = params.get("message") || stored.message;
    const source = params.get("source") || stored.source;

    setFieldValue(leadForm.elements.toolInterest, interest);
    setFieldValue(leadForm.elements.message, message);
    setFieldValue(leadForm.elements.source, source);

    if (interest || message || source) {
      setLeadStatus("Request path loaded. Add your contact info when you're ready.", "pending");
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash || ""}`);
    }
  }

  function readStoredHandoff() {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(handoffStorageKey) || "{}");
      window.sessionStorage.removeItem(handoffStorageKey);
      return stored && typeof stored === "object" ? stored : {};
    } catch (_error) {
      return {};
    }
  }

  prefillFromParams();

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-lead-interest]");
    if (!link) return;

    const interest = link.dataset.leadInterest;
    const message = link.dataset.leadMessage;
    const interestField = leadForm.elements.toolInterest;
    const messageField = leadForm.elements.message;
    const sourceField = leadForm.elements.source;
    setFieldValue(interestField, interest);
    setFieldValue(messageField, message);
    setFieldValue(sourceField, link.dataset.leadSource || defaultSource);
  });

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLeadStatus("Sending request...", "pending");

    const formData = new FormData(leadForm);
    const payload = {
      source: formData.get("source"),
      name: formData.get("name"),
      email: formData.get("email"),
      toolInterest: formData.get("toolInterest"),
      message: formData.get("message"),
      contactConsent: formData.get("contactConsent") === "on",
      researchConsent: formData.get("researchConsent") === "on",
    };
    const isCareerForm = String(payload.source || "").includes("careers");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        const error = new Error(result.error || "The request could not be sent.");
        error.status = response.status;
        throw error;
      }

      leadForm.reset();
      setLeadStatus(
        isCareerForm
          ? "Application received. We will follow up by email."
          : payload.researchConsent
            ? "Request received. Your contribution was noted for follow-up and ecosystem improvement."
            : "Request received. We will follow up by email.",
        "success"
      );
    } catch (error) {
      const message =
        error.status === 401
          ? "Unlock the live site with the preview password, then try again. You can also use the Email instead button."
          : error.message || "The form could not connect. Please use the Email instead button.";

      setLeadStatus(
        message,
        "error"
      );
      console.error("Lead form failed", error);
    }
  });
}
