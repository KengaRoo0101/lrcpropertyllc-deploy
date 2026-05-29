const { spawn, spawnSync } = require("child_process");
const { once } = require("events");

const PORT = "3199";
const BASE_URL = `http://localhost:${PORT}`;

function fail(message) {
  throw new Error(message);
}

function checkSyntax(file) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.status !== 0) {
    fail(`${file} failed syntax check:\n${result.stderr || result.stdout}`);
  }
}

async function fetchText(pathname, options = {}) {
  const response = await fetch(`${BASE_URL}${pathname}`, options);
  const text = await response.text();
  return { response, text };
}

async function fetchJson(pathname, options = {}) {
  const { response, text } = await fetchText(pathname, {
    headers: { accept: "application/json", ...(options.headers || {}) },
    ...options,
  });
  let json = {};
  try {
    json = JSON.parse(text);
  } catch (error) {
    fail(`${pathname} did not return JSON: ${text}`);
  }
  return { response, json };
}

function startServer(envOverrides = {}) {
  const server = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT,
      PUBLIC_URL: BASE_URL,
      ...envOverrides,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  return { server, getStderr: () => stderr };
}

async function stopServer(server, getStderr) {
  server.kill("SIGTERM");
  await Promise.race([
    once(server, "exit"),
    new Promise((resolve) => setTimeout(resolve, 1200)),
  ]);
  if (server.exitCode && server.exitCode !== 0 && !server.killed) {
    fail(`server failed during verification: ${getStderr()}`);
  }
}

async function waitForServer(server) {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    if (server.exitCode !== null) fail(`server exited early with code ${server.exitCode}`);
    try {
      const { response } = await fetchText("/");
      if (response.ok) return;
    } catch (_error) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  fail("server did not start within 8 seconds");
}

function assertContains(label, text, expected) {
  const normalizedText = text.replace(/\s+/g, " ");
  const normalizedExpected = expected.replace(/\s+/g, " ");
  if (!normalizedText.includes(normalizedExpected)) {
    fail(`${label} missing expected text: ${expected}`);
  }
}

function assertNotContains(label, text, blocked) {
  const normalizedText = text.replace(/\s+/g, " ");
  const normalizedBlocked = blocked.replace(/\s+/g, " ");
  if (normalizedText.includes(normalizedBlocked)) {
    fail(`${label} contains blocked text: ${blocked}`);
  }
}

async function run() {
  ["server.js", "_worker.js", "assets/checkout.js"].forEach(checkSyntax);

  let running = startServer({
      CHECKOUT_ENABLED: "",
      CHECKOUT_ALLOW_TEST: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_PRICE_ID: "",
      STRIPE_WEBHOOK_SECRET: "",
  });

  try {
    const { server, getStderr } = running;
    await waitForServer(server);

    const status = await fetchJson("/api/checkout-status");
    if (!status.response.ok) fail("/api/checkout-status did not return 200");
    if (status.json.available !== false) fail("checkout status should be unavailable without config");
    if (status.json.mode !== "hold") fail("checkout status should be mode=hold without config");
    assertContains("checkout status message", status.json.message || "", "Real-world payments are not active");

    const checkout = await fetchJson("/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ product: "lrc-conversation-clarity-full-report" }),
    });
    if (checkout.response.status !== 503) fail("checkout session route should return 503 without config");
    assertContains("checkout error", checkout.json.error || "", "Real-world payments are not active");

    const confirmation = await fetchJson("/api/checkout-session?session_id=cs_test_launchhold123456");
    if (confirmation.response.status !== 503) fail("checkout confirmation route should return 503 without config");
    if (confirmation.json.verified !== false) fail("checkout confirmation should not verify without config");
    assertContains("checkout confirmation error", confirmation.json.error || "", "Real-world payments are not active");

    const home = await fetchText("/");
    assertContains("home", home.text, "LRC Property LLC | Guided Tools and Membership Access");
    assertContains("home", home.text, "Guided tools and member access");
    assertContains("home", home.text, "/assets/lrc-system.css");
    assertContains("home", home.text, "/assets/lrc-agent.js");
    assertContains("home", home.text, "data-lrc-agent-input");
    assertContains("home", home.text, "data-lrc-agent-output");
    assertContains("home", home.text, "Public home. Member tools and team workspaces require approved access.");
    assertContains("home", home.text, "Membership starts with review, not an automatic checkout.");
    assertNotContains("home", home.text, "app-front-door");
    assertNotContains("home", home.text, "id=\"lrc-react-funnel\"");
    assertNotContains("home", home.text, "home-funnel.js");
    assertNotContains("home", home.text, "File-safe fallback");
    assertNotContains("home", home.text, "buildStructuredBrief");
    assertNotContains("home", home.text, "create-checkout-session");
    assertNotContains("home", home.text, "checkout.js");
    assertNotContains("home", home.text, "Unlock Full Report");
    assertNotContains("home", home.text, "Request Conversation Clarity preview");

    const success = await fetchText("/success.html?session_id=test_session");
    assertContains("success page", success.text, "Checkout returned to LRC");
    assertContains("success page", success.text, "Real-world payments are not active on this site.");
    assertContains("success page", success.text, "No payment confirmation is being processed here.");
    assertContains("success page", success.text, "/formed/#formed-start");
    assertContains("success page", success.text, "/contact/");
    assertNotContains("success page", success.text, "/#paywall");
    assertNotContains("success page", success.text, "/#lead");
    assertNotContains("success page", success.text, "Payment successful");
    assertNotContains("success page", success.text, "Your full report is unlocked.");

    const cancel = await fetchText("/cancel.html");
    assertContains("cancel page", cancel.text, "Checkout was not completed");
    assertContains("cancel page", cancel.text, "No real-world payment, Formed buildout checkout, or paid access unlock was started");
    assertContains("cancel page", cancel.text, "/formed/#formed-start");
    assertContains("cancel page", cancel.text, "/contact/");
    assertNotContains("cancel page", cancel.text, "/#paywall");
    assertNotContains("cancel page", cancel.text, "/#lead");
    assertNotContains("cancel page", cancel.text, "Payment canceled");
  } finally {
    await stopServer(running.server, running.getStderr);
  }

  running = startServer({
    CHECKOUT_ENABLED: "true",
    CHECKOUT_ALLOW_TEST: "false",
    STRIPE_SECRET_KEY: "sk_live_invalid_launch_key",
    STRIPE_PRICE_ID: "price_invalid_launch",
    STRIPE_WEBHOOK_SECRET: "whsec_invalid_launch",
  });

  try {
    const { server } = running;
    await waitForServer(server);

    const status = await fetchJson("/api/checkout-status");
    if (!status.response.ok) fail("/api/checkout-status did not return 200 for invalid config");
    if (status.json.available !== false) fail("checkout status should stay unavailable with invalid Stripe config");
    if (status.json.mode !== "hold") fail("checkout status should be mode=hold with invalid Stripe config");
    assertContains("invalid checkout status message", status.json.message || "", "Real-world payments are not active");

    const checkout = await fetchJson("/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ product: "lrc-conversation-clarity-full-report" }),
    });
    if (checkout.response.status !== 503) fail("checkout session route should return 503 with invalid Stripe config");
    assertContains("invalid checkout error", checkout.json.error || "", "Real-world payments are not active");
    assertNotContains("invalid checkout error", checkout.json.error || "", "Invalid API Key");
  } finally {
    await stopServer(running.server, running.getStderr);
  }

  console.log("Checkout hold verification passed.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
