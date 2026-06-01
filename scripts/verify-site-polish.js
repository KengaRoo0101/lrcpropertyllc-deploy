const fs = require("fs");
const { spawnSync } = require("child_process");

function fail(message) {
  throw new Error(message);
}

function text(file) {
  return fs.readFileSync(file, "utf8");
}

function has(label, value, expected) {
  if (!value.includes(expected)) fail(`${label} missing: ${expected}`);
}

function lacks(label, value, phrase) {
  if (value.includes(phrase)) fail(`${label} still contains old public copy.`);
}

function checkSyntax(file) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.status !== 0) fail(`${file} syntax failed: ${result.stderr || result.stdout}`);
}

[
  "assets/lrc-agent.js",
  "assets/lrc-runtime.js",
  "assets/lrc-suite.js",
  "assets/checkout.js",
  "ai-suite/app.js",
  "formed/app.js",
  "ninja/app.js",
  "goal/app.js",
  "server.js",
  "_worker.js",
].forEach(checkSyntax);

const home = text("index.html");
[
  "Build the next version with guided LRC support.",
  "placeholder=\"I want to start a local service business\"",
  "data-lrc-agent-input",
  "data-lrc-agent-output hidden",
  "Choose the access level that fits the work.",
  "Promoted by LRC Property LLC",
  "$0 access gate",
  "$19/month",
  "$149 setup + $49/month",
  "Start Core Membership",
  "Membership is self-serve; sensitive actions still require review.",
].forEach((expected) => has("home", home, expected));

[
  "Employee Portal",
  "local timeclock",
  "only in this browser",
  "until the backend is connected",
  "Request membership review",
  "approved site password",
  "Membership starts with review, not an automatic checkout.",
].forEach((phrase) => lacks("home", home, phrase));

const checkout = text("assets/checkout.js");
[
  "#pay-button",
  "data-checkout-status",
  "lrc-core-membership",
  "/api/checkout-status",
  "/create-checkout-session",
  "Checkout pending",
].forEach((expected) => has("checkout", checkout, expected));

const worker = text("_worker.js");
const server = text("server.js");
has("worker", worker, "handleCreateCheckoutSession");
has("worker", worker, "/api/checkout-status");
has("server", server, "app.get(\"/api/checkout-status\"");
has("server", server, "buildCheckoutSessionCreateParams");

[
  "formed/index.html",
  "jobsai/index.html",
  "offshoot/index.html",
  "socialscan/index.html",
  "behappy/index.html",
  "careers/index.html",
  "contact/index.html",
].forEach((file) => has(file, text(file), "LRC Property LLC"));

console.log("Site polish verification passed.");
