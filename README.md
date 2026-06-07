# Versatile — a cabinet of small machines

A homepage that is a shelf of playable mini-games / tech demos. No sales copy.
The only “about me” lives behind the **?** button in the bottom-right.

## Add a machine (zero config)

1. Create a self-contained `games/<slug>/index.html`.
2. Push it:
   ```bash
   git add . && git commit -m "add <slug>" && git push
   ```

That's the whole workflow. On push, a GitHub Action scans `games/`, regenerates
`games.json`, and your machine appears on the shelf automatically.

- **Card title** comes from `game.json` → then `<title>` → then the folder name.
- **Blurb** comes from `game.json` → then `<meta name="description">`.
- **Accent** is auto-assigned from a palette unless you set it.
- **Preview animation** is uniquely generated from the slug for every machine — no two look alike, and you never have to draw or register one. Set `motif` only if you want one of the named house animations instead.

## Customize a machine (optional)

Drop a `games/<slug>/game.json`. Every field is optional:

```json
{
  "title": "Snake",
  "tag": "arcade",
  "blurb": "One honest line about it.",
  "accent": "#cde85a",
  "motif": "orbit",
  "order": 4
}
```

- `motif` = use a named house animation instead of the auto-generated one: `constellation` | `orbit` | `ripples` | `weave`. Leave it out to get unique generated art.
- `accent` = the card's glow color (any hex).
- `order` = where it sits on the shelf (lower = earlier; unset = alphabetical, after ordered ones).

## How it works

- `index.html` — the hub. Reads `games.json`, renders one card per machine, launches each full-screen in a sandboxed `<iframe>`.
- `games.json` — **generated automatically. Do not hand-edit — the Action overwrites it.**
- `scripts/build-manifest.js` — the scanner. Run `node scripts/build-manifest.js` locally to preview the manifest.
- `.github/workflows/build-manifest.yml` — runs the scanner on every push and commits `games.json`.

## Connect a separate repo

Local folders are the simple path. To pull in machines that live in other repos:

- **Submodule** (one site): `git submodule add https://github.com/USER/snake games/snake` — then it's scanned like any folder.
- **External Pages** (decoupled): add an entry to `extra-machines.json` at the repo root using an absolute `url`:
  ```json
  { "machines": [
    { "slug": "snake", "title": "Snake", "tag": "arcade", "blurb": "…", "url": "https://USER.github.io/snake/", "accent": "#cde85a", "motif": "orbit", "order": 5 }
  ] }
  ```
  These survive every regeneration (the scanner merges them in).

## Local preview

Open `index.html` directly, or serve the folder: `npx serve` (or any static server).

## Identity

Versatile · cashmservices@gmail.com · Remote, U.S. · legal: Cash M Services LLC
