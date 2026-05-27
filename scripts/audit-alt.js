const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const ignoreDirs = new Set(["node_modules", ".git", "data"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

const issues = [];

for (const file of walk(root)) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, "utf8");
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  imgs.forEach((tag, index) => {
    if (!/\salt\s*=\s*(['"])[\s\S]*?\1/i.test(tag)) {
      issues.push(`${rel}: img ${index + 1} missing alt attribute`);
    }
  });
}

if (issues.length) {
  console.error("Alt text audit found issues:");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log("Alt text audit passed.");
