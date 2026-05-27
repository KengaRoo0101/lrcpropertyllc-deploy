const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const ignoreDirs = new Set(["node_modules", ".git", "data"]);
const internalHost = "www.lrcpropertyllc.com";

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

function fileForPath(pathname) {
  const clean = pathname.split("?")[0].replace(/\/+$/, "/");
  if (clean === "/") return path.join(root, "index.html");
  if (clean.endsWith("/")) return path.join(root, clean.slice(1), "index.html");
  if (path.extname(clean)) return path.join(root, clean.slice(1));
  const htmlFile = path.join(root, `${clean.slice(1)}.html`);
  if (fs.existsSync(htmlFile)) return htmlFile;
  return path.join(root, clean.slice(1), "index.html");
}

function anchorExists(html, anchor) {
  if (!anchor) return true;
  const escaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b(id|name)=["']${escaped}["']`, "i").test(html);
}

function normalizeHref(href, fromFile) {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return null;
  if (/^https?:\/\//i.test(href)) {
    const url = new URL(href);
    if (url.hostname !== internalHost) return null;
    return { pathname: url.pathname, hash: url.hash.replace(/^#/, "") };
  }
  if (href.startsWith("#")) {
    const current = path.relative(root, fromFile);
    const pathname = current === "index.html" ? "/" : `/${path.dirname(current).replace(/\\/g, "/")}/`;
    return { pathname, hash: href.slice(1) };
  }
  const [rawTarget, hash = ""] = href.split("#");
  const withoutHash = rawTarget.split("?")[0];
  if (withoutHash.startsWith("/")) {
    return { pathname: withoutHash, hash };
  }
  const baseDir = path.dirname(path.relative(root, fromFile)).replace(/\\/g, "/");
  const basePath = baseDir === "." ? "/" : `/${baseDir}/`;
  const resolved = path.posix.normalize(path.posix.join(basePath, withoutHash));
  return {
    pathname: resolved.startsWith("/") ? resolved : `/${resolved}`,
    hash,
  };
}

const issues = [];

for (const file of walk(root)) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, "utf8");
  const links = [...html.matchAll(/<a\b[^>]*\shref=(["'])(.*?)\1/gi)];
  links.forEach((match) => {
    const href = match[2].trim();
    const target = normalizeHref(href, file);
    if (!target) return;
    const targetFile = fileForPath(target.pathname);
    if (!fs.existsSync(targetFile)) {
      issues.push(`${rel}: ${href} -> missing ${path.relative(root, targetFile)}`);
      return;
    }
    if (target.hash) {
      const targetHtml = fs.readFileSync(targetFile, "utf8");
      if (!anchorExists(targetHtml, target.hash)) {
        issues.push(`${rel}: ${href} -> missing #${target.hash}`);
      }
    }
  });
}

if (issues.length) {
  console.error("Link audit found issues:");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log("Link audit passed.");
