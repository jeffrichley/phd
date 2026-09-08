# Progress Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the advisor-facing progress site at jeffrichley.github.io/phd — five proposal pages plus a backfilled lab-notes feed, building from Markdown through Eleventy, deployed by GitHub Actions — reviewable by Jeff well before 2026-09-15.

**Architecture:** Eleventy v3 static site. Hand-authored Markdown in `src/` pours into Nunjucks layouts that expose exactly the slot inventory promised to OpenDesign; placeholder layouts ship first so content and design never block each other, and the OpenDesign swap later touches only `src/_layouts/` + `src/assets/tokens.css`. GitHub Actions deploys `_site/` to Pages on every push to main.

**Tech Stack:** Node 22, Eleventy v3 (ESM config, HtmlBasePlugin for the `/phd/` path prefix), Nunjucks layouts, markdown-it (Eleventy default), ffmpeg for GIF→MP4, `gh` CLI for repo/Pages setup.

**Spec:** `docs/superpowers/specs/2026-09-08-progress-site-spec.md` (same repo). The spec carries the decided slot inventory, sources-of-truth list, open-ends policy, and video policy — every content task cites it.

## Global Constraints

- Site URL is `https://jeffrichley.github.io/phd` — every layout href must survive the `/phd/` path prefix (HtmlBasePlugin handles rewriting; never hand-write `/phd/` in content).
- Every page carries `<meta name="robots" content="noindex">` (spec § Access; ADR 0001).
- The company's sim-to-real bar never appears in any content file (spec § Open-ends policy).
- Content pages each carry an HTML comment naming their locked phd-lab source (spec § Content workflow).
- Lab notes are retellings for the advisor, never pasted agent-facing notebook prose (phd-lab CONTEXT.md, *lab note*).
- Committed video is MP4 only, `yuv420p`, `faststart`, each file well under 1 MB (spec § Video).
- Jeff reviews all content before the URL goes to Krishna; pushing to the public repo during the build week is acceptable (he accepted anyone-with-the-link), but nothing gets *announced* unreviewed.
- No `Co-Authored-By` trailer in commits (matches phd-lab convention; none of Jeff's repos use it).

---

### Task 1: Eleventy skeleton that builds

**Files:**
- Create: `package.json`, `eleventy.config.js`, `.gitignore`, `README.md`
- Create: `src/_data/site.json`, `src/_layouts/base.njk`, `src/_layouts/page.njk`, `src/assets/tokens.css`, `src/assets/site.css`, `src/index.md`

**Interfaces:**
- Produces: layout chain `page.njk` → `base.njk`; front-matter contract for all pages: `title`, `lead`, `order` (int, nav position), `layout`. Shortcodes `callout` (paired) and `video(src, caption)` available in Markdown (markdownTemplateEngine is njk). `site.json` keys: `title`, `subtitle`, `pathPrefix`.

- [ ] **Step 1: package.json + config**

```json
{
  "name": "phd",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  }
}
```

```js
// eleventy.config.js
import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addPairedShortcode("callout", function (content, label) {
    return `<aside class="callout"><p class="callout-label">${label}</p>\n\n${content}\n</aside>`;
  });
  eleventyConfig.addShortcode("video", function (src, caption) {
    const cap = caption ? `<figcaption>${caption}</figcaption>` : "";
    return `<figure class="video"><video controls muted loop playsinline preload="metadata" src="/assets/video/${src}"></video>${cap}</figure>`;
  });

  eleventyConfig.addCollection("notes", (api) =>
    api.getFilteredByGlob("src/notes/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("pages", (api) =>
    api.getFilteredByGlob("src/*.md").filter((p) => p.data.order !== undefined)
      .sort((a, b) => a.data.order - b.data.order)
  );

  return {
    dir: { input: "src", includes: "_includes", layouts: "_layouts", output: "_site" },
    pathPrefix: "/phd/",
    markdownTemplateEngine: "njk",
  };
}
```

`.gitignore`: `node_modules/`, `_site/`. `base.njk` renders html head (title from front matter + site.json, `<meta name="robots" content="noindex">`, both stylesheets), a `<nav>` looping `collections.pages` by title, `{{ content | safe }}`, footer "Jeff Richley · ODU MAE PhD". `page.njk` extends base: `<h1>{{ title }}</h1><p class="lead">{{ lead }}</p>`, content, then prev/next links via `collections.pages | getPreviousCollectionItem` / `getNextCollectionItem`. `tokens.css` = placeholder `:root` custom properties (colors, type scale, spacing, radii) clearly commented "PLACEHOLDER — replaced by OpenDesign tokens.css". `site.css` = minimal readable styling against those tokens only. `src/index.md` = stub landing (real content in Task 4).

- [ ] **Step 2: install and build**

Run: `npm install && npx @11ty/eleventy`
Expected: build succeeds, `_site/index.html` exists and contains the noindex meta.

- [ ] **Step 3: commit** — `chore: eleventy skeleton with slot-compatible placeholder layouts`

### Task 2: Program bookkeeping (this repo + phd-lab)

**Files:**
- Create: `CONTEXT.md`, `docs/adr/0001-public-by-link-with-noindex.md`, `.nvmrc` (`22`)
- Modify: `E:\workspaces\research\phd-lab\REPOS.md` (add sibling row)

**Interfaces:** none downstream; provenance only.

- [ ] **Step 1:** `CONTEXT.md` — glossary seeding *progress site*, *lab note*, *slot inventory*, *open-decision callout*, pointing back to phd-lab CONTEXT.md § Advisor-facing site as canonical.
- [ ] **Step 2:** ADR 0001 — Context: standing gov pre-publication read condition vs. advisor needs a URL by 09-15. Decision: public Pages, anyone-with-link, `noindex` on every page; site treated as not-published until the pre-pub-read question is settled. Alternatives rejected: access-controlled hosting (friction, new infra), fully-indexed public (forecloses the read). Reversal path: delete the meta tag.
- [ ] **Step 3:** REPOS.md row: `phd` | `E:\workspaces\research\code\phd` | advisor-facing progress site (first non-research sibling). Commit phd-lab separately (`docs: REPOS.md notes the progress-site sibling`).
- [ ] **Step 4:** commit site repo — `docs: context glossary and ADR 0001 (public-by-link with noindex)`

### Task 3: GitHub repo + Pages deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: live site at https://jeffrichley.github.io/phd rebuilding on every push to main.

- [ ] **Step 1: workflow**

```yaml
name: Deploy to Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx @11ty/eleventy
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2:** `gh repo create jeffrichley/phd --public --source . --push` (commit workflow first), then `gh api -X POST repos/jeffrichley/phd/pages -f build_type=workflow` (POST fails if Pages exists → then PUT).
- [ ] **Step 3: verify** — `gh run watch` until green; `curl -sI https://jeffrichley.github.io/phd/` returns 200; response HTML contains noindex.

### Task 4: Video assets + hero proposal

**Files:**
- Create: `src/assets/video/*.mp4` (hero candidates + gait set + selected comparison/validation clips)

**Interfaces:**
- Produces: filenames content tasks reference via `{% video %}`: `waypoints.mp4`, `clean_turn.mp4`, `gait_straight.mp4`, `gait_circle.mp4`, `gait_dive.mp4`, `gait_dive_turn.mp4`, `isaac_swim_hydro.mp4`, `five_swim.mp4`, plus validation overlays as needed by notes.

- [ ] **Step 1:** copy existing MP4s from `anguilla\media\`; convert GIF-only clips (`clean_turn`, `five_swim`, `isaac_swim_hydro`, …): `ffmpeg -i in.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" out.mp4`. Verify each < 1 MB.
- [ ] **Step 2:** extract 3 frames each from `clean_turn` and `waypoints` (`ffmpeg -i x.mp4 -vf fps=1/3 frame_%d.png` to scratchpad), view, pick hero recommendation with one-line rationale for Jeff.
- [ ] **Step 3:** build passes with passthrough copy; commit — `feat: sim clips from anguilla media (mp4, committed per spec)`

### Task 5: Landing + The Question

**Files:**
- Create/replace: `src/index.md` (layout `landing.njk` — create it: base + hero slot + pitch + nav cards from `collections.pages` + latest 3 of `collections.notes`), `src/question.md` (`order: 1`)

Sources (read fully before drafting): `phd-lab/docs/narrative/committee-narrative.md` (one-paragraph pitch → landing, verbatim; one-page pitch → landing prose), wayfinder issue #1 Destination, issue #4 (thesis claim + falsifier — quote both **verbatim** on `/question/`, then unpack each clause in committee vocabulary per CONTEXT.md § Committee-facing vocabulary). Source-comment each file. Verify: build, hero video renders, claim text matches #4 byte-for-byte. Commit per page.

### Task 6: The Plan

**Files:** `src/plan.md` (`order: 2`)

Sources: ADR 0003 (chapter map: papers as appendices A–C, narrative body Ch.1 intro / Ch.2 apparatus / Ch.3–5 thin study chapters / Ch.6 conclusion — render as the page's table), ADR 0001 (all three papers target IEEE RA-L; ICRA/IROS option for 2–3; arXiv after gov read — state the gov read plainly; it is a strength), wayfinder Decisions list for the three-contribution arc. Callout: committee formation / Form D2 as open decision. Verify + commit.

### Task 7: Method & Platform

**Files:** `src/method.md` (`order: 3`)

Sources: CONTEXT.md § Committee-facing vocabulary (operating envelope, envelope check, propulsive substrate, dial/switch — use committee terms, define on first use), wayfinder Notes (sim-acceptable/no-hardware framing), morphology ladder § (future-work framing per ADR 0002 — stretch, not load-bearing). Embed `gait_*` clips and `isaac_swim_hydro`. **Do not mention the sim-to-real bar.** Verify + commit.

### Task 8: Timeline & Status

**Files:** `src/timeline.md` (`order: 4`)

Sources: `admin/README.md` standing facts (48 credits / 21 applied / 15 coursework remaining / GPA 4.00 / Fall 2026 = MAE 897 + MAE 899@3), submission-gate definition (CONTEXT.md), paper statuses from `papers/*/.research-state.json` + notebooks (paper 1: submitted RA-L 2026-09-03; paper 2: methodology-design, Phase A retrain planned Fall 2026). Two callouts: dated schedule "being locked with advisor"; committee/Form D2 open. No invented dates. Verify + commit.

### Task 9: Lab-notes feed + backfill

**Files:**
- Create: `src/_layouts/note.njk`, `src/notes/index.njk` (feed index over `collections.notes`), `src/notes/notes.json` (`{"layout": "note.njk", "tags": []}` defaults)
- Create: `src/notes/2026-09-03-ral-submission.md`, `src/notes/2026-07-31-added-mass-validation.md`, `src/notes/2026-08-24-paper2-methodology-recut.md` (three flagship notes, drafted now)
- Create: `docs/notes-backfill-inventory.md` — the full dated-event inventory from `papers/*/notebook/log/`, decision files, wayfinder Decisions, admin/ milestones; one line each (date, event, source path, proposed tag), for Jeff to prune

Front-matter contract per note: `title`, `date`, `tag` (result|decision|milestone|finding), `excerpt`. Verify: feed index lists 3 notes newest-first; landing strip shows same 3. Commit.

### Task 10: Integration check + handoff

- [ ] Full build; click-path check over `_site/` (every nav link resolves under `/phd/`, noindex on every page, all `<video>` sources exist).
- [ ] Push; confirm live deploy green.
- [ ] Report to Jeff with: live URL, hero recommendation, backfill inventory to prune, review request — and the note that layouts are placeholder until OpenDesign lands.

**Blocked on Jeff after this:** OpenDesign templates (swap = edit `src/_layouts/*` + `tokens.css` only), content review, backfill pruning, hero call.

## Self-review

Spec coverage: hosting/noindex → T2/T3; pipeline → T1/T3; five pages → T4–T8 (landing layout in T5); feed + backfill → T9; video policy → T4; open-ends policy → T6/T7/T8 constraints; parallel-tracks → placeholder layouts (T1) + swap note (T10). Type consistency: front-matter keys (`title`, `lead`, `order`, `date`, `tag`, `excerpt`) and collection names (`pages`, `notes`) used identically throughout. No placeholders beyond content-drafting instructions that name their exact sources.
