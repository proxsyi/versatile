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
const MOTIFS = ["constellation", "orbit", "ripples", "weave"];

function titleCase(s) {
  return s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
// Parse <meta name="..."> content robustly: order-independent and quote-aware
// (so apostrophes inside a double-quoted description are not truncated).
function metaContent(html, name) {
  const tagRe = /<meta\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(html))) {
    const tag = m[0];
    const nm = tag.match(/\bname\s*=\s*("([^"]*)"|'([^']*)')/i);
    if (!nm) continue;
    const nval = nm[2] != null ? nm[2] : nm[3];
    if (!nval || nval.toLowerCase() !== name.toLowerCase()) continue;
    const ct = tag.match(/\bcontent\s*=\s*("([^"]*)"|'([^']*)')/i);
    if (ct) return (ct[2] != null ? ct[2] : ct[3]).trim();
  }
  return "";
}
function titleTag(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim().replace(/\s*[\u2014\u2013-]\s*Versatile.*$/i, "").trim() : "";
}
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    if (fs.existsSync(file)) console.warn("\u26a0  Ignoring invalid JSON: " + file + " (" + e.message + ")");
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
      console.warn("\u2014  skip " + slug + "/ (no index.html)");
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
      // No motif assigned by default: the hub draws unique generated art per game.
      // Only set this if a game.json explicitly wants one of the named motifs.
      motif: ov.motif || "",
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
        motif: m.motif || "",
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
    if (!m.motif) delete m.motif;
  }

  const out = { generated: new Date().toISOString(), machines };
  fs.writeFileSync(path.join(ROOT, "games.json"), JSON.stringify(out, null, 2) + "\n");
  console.log("Wrote games.json \u2014 " + machines.length + " machine(s):");
  for (const m of machines) console.log("  \u00b7 " + (m.slug) + "  \u2192  " + m.title + "  [" + m.motif + " " + m.accent + (m.url ? " external" : "") + "]");
}

build();
