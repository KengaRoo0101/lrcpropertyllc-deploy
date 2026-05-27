const fs = require("fs");
const path = require("path");

const BASE_URL = (process.env.PUBLIC_URL || "https://www.lrcpropertyllc.com").replace(/\/+$/, "");
const ADMIN_CODE_PATH = path.join(process.cwd(), ".admin-access-code");

function readAdminCode() {
  if (process.env.ADMIN_ACCESS_CODE) return process.env.ADMIN_ACCESS_CODE.trim();
  if (fs.existsSync(ADMIN_CODE_PATH)) return fs.readFileSync(ADMIN_CODE_PATH, "utf8").trim();
  return "";
}

async function readJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch (_error) {
    body = { raw: text.slice(0, 300) };
  }
  return { response, body };
}

async function main() {
  const adminCode = readAdminCode();

  console.log("No real-world payment verification");
  console.log(`- target: ${BASE_URL}`);

  const status = await readJson(`${BASE_URL}/api/checkout-status`);
  console.log(`- checkout-status: HTTP ${status.response.status}`);
  console.log(`  available: ${Boolean(status.body.available)}`);
  console.log(`  mode: ${status.body.mode || "unknown"}`);

  let diagnostic = null;
  if (adminCode) {
    diagnostic = await readJson(`${BASE_URL}/api/admin/checkout-diagnostic`, {
      headers: { "x-admin-code": adminCode },
    });
    console.log(`- diagnostic: HTTP ${diagnostic.response.status}`);
    console.log(`  category: ${diagnostic.body.category || "unknown"}`);
    console.log(`  available: ${Boolean(diagnostic.body.available)}`);
    if (diagnostic.body.checks) {
      console.log(`  stripeSecretMode: ${diagnostic.body.checks.stripeSecretMode || "unknown"}`);
      console.log(`  stripePriceIdFormat: ${Boolean(diagnostic.body.checks.stripePriceIdFormat)}`);
      console.log(`  stripeWebhookSecret: ${Boolean(diagnostic.body.checks.stripeWebhookSecret)}`);
    }
  } else {
    console.log("- diagnostic: skipped; .admin-access-code or ADMIN_ACCESS_CODE is missing");
  }

  const checkout = await readJson(`${BASE_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
  });
  const checkoutUrl = typeof checkout.body.url === "string" && checkout.body.url.startsWith("https://checkout.stripe.com/");
  console.log(`- create-checkout-session: HTTP ${checkout.response.status}`);
  console.log(`  stripe checkout url: ${checkoutUrl ? "yes" : "no"}`);

  const paymentsInactive = status.body.available === false
    && status.body.mode === "hold"
    && checkout.response.status === 503
    && !checkoutUrl;

  if (!paymentsInactive) {
    console.log("\nUnexpected payment readiness detected. Review checkout configuration before sharing the site.");
    process.exitCode = 1;
    return;
  }

  console.log("\nReal-world payments are inactive. No Stripe checkout URL was created.");
}

main().catch((error) => {
  console.error(`Payment checkout verification failed: ${error.message}`);
  process.exitCode = 1;
});
