#!/usr/bin/env node
/**
 * Scans games/ and (re)generates games.json.
 * Rule: every games/<slug>/index.html becomes a machine on the shelf.
 * Zero config needed. Optional games/<slug>/game.json overrides any field.
 * Optional extra-machines.json (at repo root) adds external entries (e.g. other repos' Pages URLs).
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const GAMES = path.join(ROOT, "games");
const PALETTE = ["#e7b84b", "#7fb2ff", "#6fd6c4", "#ff8a6b", "#b79cff", "#cde85a"];
const MOTIFS = ["constellation", "orbit", "ripples"];

function titleCase(s) {
  return s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function metaContent(html, name) {
  const re1 = new RegExp('<meta[^>]*name=["\']' + name + '["\'][^>]*content=["\']([^"\']*)["\']', "i");
  const re2 = new RegExp('<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']' + name + '["\']', "i");
  const m = html.match(re1) || html.match(re2);
  return m ? m[1].trim() : "";
}
function titleTag(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim().replace(/\s*[\u2014\u2013-]\s*Versatile.*$/i, "").trim() : "";
}
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    if (fs.existsSync(file)) console.warn("⚠  Ignoring invalid JSON: " + file + " (" + e.message + ")");
    return null;
  }
}

function build() {
  if (!fs.existsSync(GAMES)) {
    console.error("No games/ directory found.");
    process.exit(1);
  }
  const slugs = fs
    .readdirSync(GAMES, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const machines = [];
  for (const slug of slugs) {
    const dir = path.join(GAMES, slug);
    const idx = path.join(dir, "index.html");
    if (!fs.existsSync(idx)) {
      console.warn("—  skip " + slug + "/ (no index.html)");
      continue;
    }
    const html = fs.readFileSync(idx, "utf8");
    const ov = readJSON(path.join(dir, "game.json")) || {};
    const h = hash(slug);
    machines.push({
      slug,
      title: ov.title || titleTag(html) || titleCase(slug),
      tag: ov.tag || metaContent(html, "versatile:tag") || "",
      blurb: ov.blurb || metaContent(html, "description") || "",
      path: "games/" + slug + "/",
      accent: ov.accent || PALETTE[h % PALETTE.length],
      motif: ov.motif || MOTIFS[h % MOTIFS.length],
      order: ov.order != null ? Number(ov.order) : null,
    });
  }

  // Optional external/extra machines (e.g. other repos' Pages URLs)
  const extra = readJSON(path.join(ROOT, "extra-machines.json"));
  if (extra && Array.isArray(extra.machines)) {
    for (const m of extra.machines) {
      if (!m || (!m.path && !m.url)) continue;
      machines.push({
        slug: m.slug || (m.title || "external").toLowerCase().replace(/\s+/g, "-"),
        title: m.title || "Untitled",
        tag: m.tag || "",
        blurb: m.blurb || "",
        path: m.path,
        url: m.url,
        accent: m.accent || PALETTE[hash(m.slug || m.title || "x") % PALETTE.length],
        motif: m.motif || MOTIFS[hash(m.slug || m.title || "x") % MOTIFS.length],
        order: m.order != null ? Number(m.order) : null,
      });
    }
  }

  machines.sort((a, b) => {
    const ao = a.order == null ? 9999 : a.order;
    const bo = b.order == null ? 9999 : b.order;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });
  for (const m of machines) {
    if (m.order == null) delete m.order;
    if (m.url == null) delete m.url;
  }

  const out = { generated: new Date().toISOString(), machines };
  fs.writeFileSync(path.join(ROOT, "games.json"), JSON.stringify(out, null, 2) + "\n");
  console.log("Wrote games.json — " + machines.length + " machine(s):");
  for (const m of machines) console.log("  · " + (m.slug) + "  →  " + m.title + "  [" + m.motif + " " + m.accent + (m.url ? " external" : "") + "]");
}

build();
