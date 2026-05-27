(() => {
  const form = document.querySelector("#feature-request-form");
  const status = document.querySelector("#feature-request-status");

  if (!form) return;

  function setStatus(message, state = "") {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function value(name) {
    return String(new FormData(form).get(name) || "").trim();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Preparing feature build packet for admin review...", "pending");

    const payload = {
      title: value("title"),
      area: value("area"),
      description: value("description"),
      reason: value("reason"),
      name: value("name"),
      email: value("email"),
      contactConsent: form.elements.contactConsent?.checked === true,
    };

    try {
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Feature request could not be saved.");
      }

      form.reset();
      setStatus("Feature request saved. Admin approval is required before build or deploy.", "success");
    } catch (error) {
      setStatus(error.message || "Feature request could not be saved. Use contact as a fallback.", "error");
    }
  });
})();
