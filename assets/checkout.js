(function () {
  const payButton = document.querySelector("#pay-button");
  const status = document.querySelector("[data-checkout-status]") || document.querySelector("#checkout-status");
  const defaultButtonText = payButton ? payButton.dataset.liveLabel || payButton.textContent.trim() : "";
  const holdMessage = "Stripe checkout is not active yet. Contact LRC or continue with the free starter path.";
  let checkoutAvailable = false;

  function showMessage(message, state = "error") {
    if (status) {
      status.textContent = message;
      status.dataset.state = state;
      return;
    }
    window.alert(message);
  }

  function setButtonState(available, message) {
    checkoutAvailable = Boolean(available);
    if (!payButton) return;

    payButton.disabled = !checkoutAvailable;
    payButton.setAttribute("aria-disabled", String(!checkoutAvailable));
    payButton.textContent = checkoutAvailable ? defaultButtonText : "Checkout pending";

    if (message) {
      showMessage(checkoutAvailable ? message : holdMessage, checkoutAvailable ? "success" : "hold");
    }
  }

  async function loadCheckoutStatus() {
    if (!payButton) return;

    setButtonState(false, "Checking checkout availability...");

    try {
      const response = await fetch("/api/checkout-status", {
        headers: {
          accept: "application/json",
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Checkout availability could not be confirmed.");
      }

      setButtonState(data.available, data.message || "Stripe checkout is ready.");
    } catch (error) {
      console.error("Checkout status could not be confirmed", error);
      setButtonState(false, holdMessage);
    }
  }

  async function startCheckout() {
    if (!payButton) return;
    if (!checkoutAvailable) {
      showMessage(holdMessage, "hold");
      return;
    }

    payButton.disabled = true;
    payButton.textContent = "Starting checkout...";

    try {
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: "lrc-core-membership",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout could not be started.");
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error("Checkout session could not be created", error);
      showMessage(error.message || "Checkout could not be started.");
      setButtonState(false, holdMessage);
    }
  }

  if (payButton) {
    loadCheckoutStatus();
    payButton.addEventListener("click", startCheckout);
  }
})();