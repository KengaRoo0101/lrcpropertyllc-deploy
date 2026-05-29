const fs = require("fs");
const path = require("path");

const truthyValues = new Set(["1", "true", "yes", "on"]);
const wranglerVars = readWranglerVars();

function readEnv(name) {
  return String(process.env[name] || wranglerVars[name] || "").trim();
}

function envSource(name) {
  if (process.env[name]) return "env";
  if (wranglerVars[name]) return "wrangler.toml";
  return "missing";
}

function isTruthy(name) {
  return truthyValues.has(readEnv(name).toLowerCase());
}

function secretMode(secret) {
  if (secret.startsWith("sk_live_") || secret.startsWith("rk_live_")) return "live";
  if (secret.startsWith("sk_test_") || secret.startsWith("rk_test_")) return "test";
  return "";
}

function masked(value) {
  if (!value) return "missing";
  if (value.length <= 10) return "set";
  return `${value.slice(0, 7)}...${value.slice(-4)}`;
}

function isPlaceholder(value) {
  return /replace_me|\.\.\.|example/i.test(value);
}

function readWranglerVars() {
  const configPath = path.join(process.cwd(), "wrangler.toml");
  if (!fs.existsSync(configPath)) return {};
  const config = fs.readFileSync(configPath, "utf8");
  const vars = {};
  let section = "";

  for (const rawLine of config.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }
    if (section !== "vars" && section !== "env.production.vars") continue;

    const valueMatch = line.match(/^([A-Z0-9_]+)\s*=\s*"([^"]*)"$/);
    if (valueMatch) vars[valueMatch[1]] = valueMatch[2];
  }

  return vars;
}

const requireLive = process.argv.includes("--require-live");
const realWorldPaymentsEnabled = false;
const checkoutEnabled = isTruthy("CHECKOUT_ENABLED");
const testAllowed = isTruthy("CHECKOUT_ALLOW_TEST");
const stripeSecret = readEnv("STRIPE_SECRET_KEY");
const stripePrice = readEnv("STRIPE_PRICE_ID");
const webhookSecret = readEnv("STRIPE_WEBHOOK_SECRET");
const publicUrl = readEnv("PUBLIC_URL");
const mode = secretMode(stripeSecret);
const usableMode = mode === "live" || (mode === "test" && testAllowed);
const ready = Boolean(realWorldPaymentsEnabled && checkoutEnabled && usableMode && stripePrice && webhookSecret && publicUrl);

const blockers = [];
if (!realWorldPaymentsEnabled) blockers.push("real-world payments are disabled in code");
if (!checkoutEnabled) blockers.push("CHECKOUT_ENABLED is not true");
if (!publicUrl) blockers.push("PUBLIC_URL is missing");
if (!stripeSecret) blockers.push("STRIPE_SECRET_KEY is missing");
if (stripeSecret && !mode) blockers.push("STRIPE_SECRET_KEY must start with sk_live_, rk_live_, sk_test_, or rk_test_");
if (mode === "test" && !testAllowed) blockers.push("test Stripe key is held unless CHECKOUT_ALLOW_TEST=true");
if (!stripePrice) blockers.push("STRIPE_PRICE_ID is missing");
if (!webhookSecret) blockers.push("STRIPE_WEBHOOK_SECRET is missing");
if (stripeSecret && isPlaceholder(stripeSecret)) blockers.push("STRIPE_SECRET_KEY is still a placeholder");
if (stripePrice && isPlaceholder(stripePrice)) blockers.push("STRIPE_PRICE_ID is still a placeholder");
if (webhookSecret && isPlaceholder(webhookSecret)) blockers.push("STRIPE_WEBHOOK_SECRET is still a placeholder");

const shouldFail = requireLive && !ready;

console.log("Checkout configuration");
console.log(`- status: ${ready ? "ready" : "safe hold"}`);
console.log(`- real-world payments: ${realWorldPaymentsEnabled ? "enabled" : "inactive"}`);
console.log(`- CHECKOUT_ENABLED: ${checkoutEnabled}`);
console.log(`- CHECKOUT_ALLOW_TEST: ${testAllowed}`);
console.log(`- STRIPE_SECRET_KEY: ${mode || "missing"} (${masked(stripeSecret)})`);
console.log(`- STRIPE_PRICE_ID: ${stripePrice ? "set" : "missing"}`);
console.log(`- STRIPE_WEBHOOK_SECRET: ${webhookSecret ? "set" : "missing"}`);
console.log(`- PUBLIC_URL: ${publicUrl || "missing"}`);
console.log(`- config sources: CHECKOUT_ENABLED=${envSource("CHECKOUT_ENABLED")}, PUBLIC_URL=${envSource("PUBLIC_URL")}`);

if (!ready) {
  if (requireLive) {
    console.log("\nCheckout is not ready for real-world payment.");
    blockers.forEach((blocker) => console.log(`- ${blocker}`));
  } else {
    console.log("\nSafe hold: real-world payments are inactive.");
    if (checkoutEnabled) {
      blockers.forEach((blocker) => console.log(`- ${blocker}`));
    } else {
      console.log("- Team members stay on preview/contact paths.");
    }
  }
}

if (shouldFail) {
  process.exitCode = 1;
}
