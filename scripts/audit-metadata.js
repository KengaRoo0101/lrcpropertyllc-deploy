const fs = require("fs");
const path = require("path");

const pages = [
  "index.html",
  "suite/index.html",
  "rooms/index.html",
  "stewardship-packet/index.html",
  "founding-circle/index.html",
  "friends-family/index.html",
  "formed/index.html",
  "offshoot/index.html",
  "jobsai/index.html",
  "ninja/index.html",
  "socialscan/index.html",
  "careers/index.html",
  "behappy/index.html",
  "product-lab/index.html",
  "contact/index.html",
  "agentcheck/index.html",
  "404.html",
];

function read(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

function stripHiddenSections(html) {
  return html.replace(/<section[^>]*hidden[^>]*>[\s\S]*?<\/section>/gi, "");
}

const issues = [];

for (const file of pages) {
  if (!fs.existsSync(path.join(__dirname, "..", file))) {
    issues.push(`${file}: file is missing`);
    continue;
  }

  const html = read(file);
  const visibleHtml = stripHiddenSections(html);
  const h1s = [...visibleHtml.matchAll(/<h1\b[^>]*>/gi)];
  const checks = [
    [/<title>[^<]{8,}<\/title>/i, "title"],
    [/<meta\s+name="description"\s+content="[^"]{24,}"\s*\/?>/i, "meta description"],
    [/<meta\s+property="og:title"\s+content="[^"]{8,}"\s*\/?>/i, "Open Graph title"],
    [/<meta\s+property="og:description"\s+content="[^"]{24,}"\s*\/?>/i, "Open Graph description"],
    [/<meta\s+property="og:image"\s+content="[^"]+"\s*\/?>/i, "Open Graph image"],
  ];

  checks.forEach(([pattern, label]) => {
    if (!pattern.test(html)) issues.push(`${file}: missing ${label}`);
  });

  if (h1s.length !== 1) {
    issues.push(`${file}: expected one visible H1, found ${h1s.length}`);
  }
}

if (issues.length) {
  console.error("Metadata audit found issues:");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Metadata audit passed for ${pages.length} pages.`);
