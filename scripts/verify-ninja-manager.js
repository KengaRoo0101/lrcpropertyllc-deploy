const { spawn } = require("child_process");
const { once } = require("events");
const fs = require("fs");

const PORT = "3212";
const BASE_URL = `http://localhost:${PORT}`;
const STARTUP_TIMEOUT_MS = Math.max(parseInt(process.env.STARTUP_TIMEOUT_MS, 10) || 30000, 30000);

function fail(message) {
  throw new Error(message);
}

function assertContains(label, text, expected) {
  if (!String(text || "").includes(expected)) fail(`${label} missing expected text: ${expected}`);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) fail(`${label} expected ${expected}, got ${actual}`);
}

function assertTruthy(label, value) {
  if (!value) fail(`${label} should not be empty`);
}

function assertArray(label, value) {
  if (!Array.isArray(value) || !value.length) fail(`${label} should be a non-empty array`);
}

function startServer() {
  const server = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT, PUBLIC_URL: BASE_URL },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  
  server.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  
  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  return { server, getStdout: () => stdout, getStderr: () => stderr };
}

async function stopServer(server, getStdout, getStderr) {
  return new Promise((resolve) => {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
    
    const killTimeout = setTimeout(() => {
      if (!server.killed) {
        server.kill("SIGKILL");
      }
    }, 1200);
    
    server.once("exit", () => {
      clearTimeout(killTimeout);
      resolve();
    });
  });
}

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${BASE_URL}${pathname}`, options);
  const text = await response.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch (_error) {
    fail(`${pathname} did not return JSON: ${text.slice(0, 160)}`);
  }
  return { response, json };
}

async function waitForServer(server, getStdout, getStderr) {
  const started = Date.now();
  const timeoutMs = STARTUP_TIMEOUT_MS;
  
  while (Date.now() - started < timeoutMs) {
    if (server.exitCode !== null) {
      const stdout = getStdout();
      const stderr = getStderr();
      console.error("\n=== Server stdout ===");
      console.error(stdout || "(empty)");
      console.error("\n=== Server stderr ===");
      console.error(stderr || "(empty)");
      fail(`server exited early with code ${server.exitCode}`);
    }
    try {
      const { response } = await fetchJson("/api/ninja/tasks");
      if (response.ok) return;
    } catch (_error) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  
  const stdout = getStdout();
  const stderr = getStderr();
  console.error("\n=== Server stdout ===");
  console.error(stdout || "(empty)");
  console.error("\n=== Server stderr ===");
  console.error(stderr || "(empty)");
  fail(`server did not start within ${timeoutMs}ms`);
}

async function createTask(prompt) {
  const { response, json } = await fetchJson("/api/ninja/tasks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (response.status !== 201) fail(`task creation returned ${response.status}`);
  if (!json.ok || !json.task) fail("task creation did not return a task");
  return json.task;
}

function assertManagerTask(label, task) {
  assertContains(label, task.id, "ninja-");
  assertTruthy(`${label} goal`, task.goal);
  assertTruthy(`${label} assignedAgent`, task.assignedAgent);
  assertTruthy(`${label} assignedSite`, task.assignedSite);
  assertTruthy(`${label} allowedAction`, task.allowedAction);
  assertTruthy(`${label} usefulArtifact`, task.usefulArtifact);
  assertTruthy(`${label} usefulArtifact title`, task.usefulArtifact.title);
  assertArray(`${label} usefulArtifact items`, task.usefulArtifact.items);
  assertContains(`${label} usefulArtifact`, task.usefulArtifact.items.join(" "), "Route spine: LRC Home → Recommended Route → Starter Business Draft → Owner Approval → Preview, Contact, or[...]
  assertContains(`${label} usefulArtifact`, task.usefulArtifact.items.join(" "), "Smooth transition: keep the user in one path from the starter Business Draft into the recommended route.");
  assertContains(`${label} usefulArtifact`, task.usefulArtifact.items.join(" "), "Ninja continuity: preserve the route, blocker, approval gate, and next move without sending the user into extra pa[...]
  assertContains(`${label} usefulArtifact`, task.usefulArtifact.items.join(" "), "polished local product draft");
  assertContains(`${label} usefulArtifact`, task.usefulArtifact.items.join(" "), "Approval gate");
  assertContains(`${label} usefulArtifact`, task.usefulArtifact.items.join(" "), "Secure checkout path");
  assertArray(`${label} resultLog`, task.resultLog);
  assertArray(`${label} routes`, task.routes);
  assertContains(`${label} guardrail`, task.guardrail, "Action rule");
  assertContains(`${label} resultLog`, task.resultLog.join(" "), "No real-world payment");
}

async function run() {
  const packageJson = fs.readFileSync("package.json", "utf8");
  assertContains("package scripts", packageJson, '"verify:ninja": "node scripts/verify-ninja-manager.js"');

  const running = startServer();
  try {
    await waitForServer(running.server, running.getStdout, running.getStderr);

    const safeTask = await createTask("Build the Formed launch page draft");
    assertManagerTask("safe task", safeTask);
    assertEqual("safe task status", safeTask.status, "draftReady");
    assertEqual("safe task approval", safeTask.approvalRequired, false);
    assertContains("safe task assigned site", safeTask.assignedSite, "Formed");
    assertContains("safe task allowed action", safeTask.allowedAction, "Prepare the local");

    const guardedTask = await createTask("Configure Stripe checkout and publish the launch page");
    assertManagerTask("guarded task", guardedTask);
    assertEqual("guarded task status", guardedTask.status, "approvalNeeded");
    assertEqual("guarded task approval", guardedTask.approvalRequired, true);
    assertContains("guarded approval category", guardedTask.approvalCategory, "financial approval");
    assertContains("guarded allowed action", guardedTask.allowedAction, "pause before the real-world action");
    assertContains("guarded result log", guardedTask.resultLog.join(" "), "Paused before real-world step");

    const { response, json } = await fetchJson("/api/ninja/tasks");
    if (!response.ok || !json.ok || !Array.isArray(json.tasks)) fail("Ninja task list did not return an array");
  } finally {
    await stopServer(running.server, running.getStdout, running.getStderr);
  }

  console.log("Ninja manager verification passed.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
