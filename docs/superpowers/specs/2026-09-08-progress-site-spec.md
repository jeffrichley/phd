# Progress site — spec

Settled in a grilling session with Jeff, 2026-09-08. Every decision below was put to him
explicitly and confirmed; the round-by-round record is in the session transcript. This spec
is the contract the implementation plan argues from.

## What this is

A **progress site**: an advisor-facing presentation of the dissertation plan plus a living
lab notebook that Krishna Kaipa (advisor) and later the committee watch over time. It is
explicitly **not** the formal ODU dissertation proposal document — that is drafted after the
wayfinder map (phd-lab#1) locks. See phd-lab `CONTEXT.md` § Advisor-facing site for the
canonical terms *progress site* and *lab note*.

**Deadline: in Krishna's hands by Tuesday 2026-09-15.**

## Access & hosting

- Public GitHub Pages, project site: **https://jeffrichley.github.io/phd** (repo
  `jeffrichley/phd`, public, on disk at `E:\workspaces\research\code\phd`).
- Anyone-with-the-link is acceptable. Every page carries `<meta name="robots"
  content="noindex">` so the site stays link-only in practice until Jeff decides whether the
  government pre-publication read applies to a proposal-level site. (ADR 0001 in this repo.)
- `phd-lab/REPOS.md` gets a line noting this repo as the program's first non-research
  sibling.

## Design & build pipeline

- **OpenDesign** (Jeff is driving it, in parallel) delivers four standalone HTML templates —
  landing, content page, feed index, feed entry — with all CSS inlined or in a split
  `tokens.css` (design tokens as CSS custom properties in `:root`). The slot inventory was
  handed to OpenDesign on 2026-09-08:
  1. **Landing** — site title + one-line subtitle · hero media slot (degrades gracefully if
     empty) · one-paragraph pitch · nav cards to the five sections · "latest from the lab"
     strip (3 most recent notes)
  2. **Content page** — page title + lead paragraph · prose body (h2/h3, lists,
     blockquotes) · callout box (open-decision flags) · figure w/ caption · video embed ·
     simple table · prev/next footer
  3. **Feed index** — entry cards: date, title, 1–2 line excerpt, optional tag
     (result / decision / milestone / finding)
  4. **Feed entry** — date, title, tag, prose body, figure/video blocks
- **Eleventy** (v3) converts hand-authored Markdown into those templates. Until OpenDesign
  delivers, the site builds against plain placeholder layouts exposing the same slots, so
  content work and design work never block each other. Swapping in the OpenDesign HTML is a
  layout-file change only.
- GitHub Actions builds and deploys to Pages on every push to `main`. No manual deploy step
  ever.

## Pages (v1)

1. **Landing** (`/`) — one-paragraph pitch (verbatim from phd-lab
   `docs/narrative/committee-narrative.md`, locked), hero video, nav cards, latest-notes
   strip.
2. **The Question** (`/question/`) — thesis claim verbatim with its falsifier (phd-lab
   issue #4, locked).
3. **The Plan** (`/plan/`) — three-contribution arc and the chapter map (phd-lab ADR 0003,
   locked; publication strategy from ADR 0001, locked).
4. **Method & Platform** (`/method/`) — sim substrate, morphology ladder, what gets
   measured (phd-lab CONTEXT.md vocabulary; wayfinder Notes).
5. **Timeline & Status** (`/timeline/`) — gate sequence and hard facts only (Fall 2026
   registration MAE 897 + MAE 899@3, 15 coursework credits remaining, GPA 4.00, paper 1
   submitted to RA-L 2026-09-03, paper 2 in methodology-design). The dated end-to-end
   schedule appears as an **open-decision callout** ("being locked with advisor") — it is a
   wayfinder frontier item and the page must not pretend otherwise.
6. **Lab Notes** (`/notes/`) — dated feed, live at launch, backfilled with every
   advisor-meaningful event (target 8–15 entries after Jeff prunes the inventory).

### Open-ends policy (decided)

- Committee/Form D2 and the dated schedule appear as open-decision callouts — named open
  questions read as rigor and hand Krishna an agenda.
- The company's sim-to-real bar **never appears on the site**. It is a company matter and
  showing it invites the two-quality-bars conflation the program rules warn about.

## Content workflow (decided)

- Claude drafts everything — five pages and all lab notes — from the locked sources, each
  page carrying an HTML comment naming which locked source it came from. **Jeff reviews
  before anything ships.** Locked sources:
  - `phd-lab/docs/narrative/committee-narrative.md` (one-paragraph + one-page pitches)
  - `phd-lab/docs/adr/0001-publication-preprint-strategy.md`
  - `phd-lab/docs/adr/0003-chapter-map-manuscript-based-structure.md`
  - phd-lab issue #4 (thesis claim + falsifier, quoted verbatim on the map)
  - wayfinder map body (issue #1) Notes section
  - `phd-lab/admin/README.md` standing facts
- **Backfill**: Claude inventories every advisor-meaningful event across both paper
  workspaces (`papers/*/notebook/`, decision files, dated logs) and the wayfinder history;
  Jeff prunes the list; Claude drafts the survivors.
- **Ongoing**: new lab notes are drafted by Claude from the paperwright notebooks,
  review-gated by Jeff, push → auto-deploy. Never an unreviewed pipe — notebook prose is
  agent-facing; lab notes are retellings (CONTEXT.md, *lab note*).

## Video (decided)

- MP4s committed directly to this repo (existing MP4s are 100–320 KB); native `<video>`
  tags, no YouTube. Clips that exist only as GIF are converted with ffmpeg first.
- Source library: `E:\workspaces\research\code\anguilla\media\` (curated set: clean_turn,
  clean_straight, waypoints, five_swim, gait_straight/circle/dive/dive_turn,
  isaac_swim_hydro, cmp_* comparisons) plus
  `anguilla\docs\investigations\2026-07-31-added-mass-fork-validation\outputs\` overlays.
  All gitignored in anguilla — they exist only on this machine; every clip is
  re-renderable on CPU from colocated pose arrays.
- Hero slot: one of `clean_turn` / `waypoints`; Claude extracts frames, evaluates, and
  proposes one for Jeff's call. Gait/comparison clips go on the Method page and in
  matching lab notes. Style is matplotlib animation (no photoreal path exists) — framed as
  honest sim output, which it is.

## Out of scope (v1)

- Narrated walkthrough video (decided against: production time in a one-week window, goes
  stale, Krishna gets Jeff's voice in person).
- Experiment dashboards / structured run data (post-v1, when there are experiments worth
  showing).
- Custom domain.
- Any restyling of OpenDesign's output beyond wiring content slots.

## This week (parallel tracks)

- Jeff drives OpenDesign against the slot inventory.
- Claude scaffolds the repo, drafts all MD content, builds the Eleventy pipeline with
  placeholder styling, prepares the video assets and backfill inventory.
- When templates land: swap layouts, Jeff reviews content, ship — with slack before
  Tuesday 2026-09-15.
