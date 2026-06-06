# Versatile — a cabinet of small machines

A homepage that is a shelf of playable mini-games / tech demos. No sales copy.
The only “about me” lives behind the **?** button in the bottom-right.

## How it works

- `index.html` — the hub (the cabinet). It reads `games.json` and renders one card per machine.
- `games.json` — the manifest. **This is the only file you edit to add a machine.**
- `games/<slug>/index.html` — each machine is a self-contained HTML file.
- Clicking a card opens that machine full-screen in a sandboxed `<iframe>` (its HTML is pulled in live).

## Adding a machine (local folder)

1. Drop a self-contained `index.html` at `games/<slug>/index.html`.
2. Add an entry to `games.json`:
   ```json
   { "slug":"my-thing", "title":"My Thing", "tag":"toy", "blurb":"One honest line.", "path":"games/my-thing/", "accent":"#7fb2ff", "motif":"orbit" }
   ```
3. Commit. It appears on the shelf.

`motif` (card preview animation) is one of: `constellation`, `orbit`, `ripples`. Unknown values fall back to constellation.

## Connecting a SEPARATE repo (pull its HTML)

Two supported ways — the manifest accepts either `path` (same site) or `url` (anywhere):

### A) External GitHub Pages (fully decoupled — easiest)
Each machine is its own repo with Pages turned on. In `games.json`, use an absolute `url`:
```json
{ "slug":"snake", "title":"Snake", "tag":"arcade", "blurb":"…", "url":"https://USER.github.io/snake/", "accent":"#cde85a", "motif":"orbit" }
```
The hub iframes that URL. Update the game by pushing to its own repo — the hub needs no changes.

### B) Git submodule (one site, many repos)
Pull a game repo into this one as a folder:
```bash
git submodule add https://github.com/USER/snake games/snake
git commit -am "add snake machine"
```
Then add a normal `path:"games/snake/"` entry. (Use a Pages build that checks out submodules — see below.)

## Recommended GitHub setup

1. **One repo**, e.g. `versatile` (or `arcade`). Public.
2. **Settings → Pages → Deploy from a branch → `main` / root.** Site goes live at `https://USER.github.io/versatile/`.
3. Want a real domain? Add a `CNAME` file with e.g. `versatile.dev` and point DNS at GitHub Pages.
4. Every machine must be a single self-contained `index.html` (no build step) so it works both standalone and embedded.

### Auto-discovery (optional upgrade)
Tag each machine repo with the GitHub topic `versatile-machine`. A scheduled GitHub Action in this repo queries the API for repos with that topic and regenerates `games.json` automatically — then “connecting a repo” is just adding the topic. (Ask me to scaffold the Action when you want it.)

## Notes
- Everything is vanilla HTML/CSS/JS — no frameworks, no dependencies, works offline.
- Identity facts: brand **Versatile**; legal **Cash M Services LLC**; contact **cashmservices@gmail.com**; **Remote, U.S.**
