const { spawnSync } = require("child_process");

const commands = [
  ["node", ["scripts/audit-links.js"]],
  ["node", ["scripts/audit-alt.js"]],
  ["node", ["scripts/audit-metadata.js"]],
  ["node", ["scripts/verify-ecosystem-routes.js"]],
];

for (const [command, args] of commands) {
  const label = [command, ...args].join(" ");
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Suite audit failed at: ${label}`);
    process.exit(result.status || 1);
  }
}

console.log("\nLRC suite audit passed.");
