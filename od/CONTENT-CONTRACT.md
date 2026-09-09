# Content contract

How Markdown becomes this site. Written for the agent that will do the converting.

The site is nine standalone HTML files plus a token sheet. There is no framework and no
build step — the converter's whole job is to find labelled slots and fill them.

---

## 1. The mechanic

Every fillable place in the HTML carries a `data-od-slot` key:

```html
<div class="slot" data-od-slot="proposal.problem">
  <span class="slot__key">proposal.problem · required</span>
  <p class="slot__hint">…what belongs here…</p>
</div>
```

Filling a slot is two operations:

1. Replace the element's **innerHTML** with the rendered Markdown fragment.
2. If the element has the class `slot`, remove `slot`, `slot--inline`, `slot--tall`
   and add `prose`. (That drops the dashed placeholder frame.) If it does not have
   `slot` — for example `.lede` or `.spine__note` — leave the classes alone.

Nothing else changes. Do not touch `class` attributes beyond that swap, do not add
inline styles, and do not emit `<style>` blocks. All presentation lives in
`css/tokens.css` and `css/site.css`.

**Unfilled slots are a feature.** A slot with no matching Markdown stays as-is and
renders as an honest labelled placeholder. Never invent content to fill one, and never
delete a slot to make the page look finished.

### Markdown → HTML mapping

| Markdown | Emit |
|---|---|
| Paragraph | `<p>` |
| `**bold**` / `*italic*` | `<strong>` / `<em>` |
| Unordered / ordered list | `<ul>` / `<ol>` (the `prose` class styles them) |
| `` `code` `` | `<code class="mono">` |
| Fenced block | `<pre class="mono">` |
| Link | `<a href>` |
| `$…$` / `$$…$$` | pass through untouched — no math renderer is wired yet |
| Image | `<figure><img><figcaption>` — see §5 |

Headings inside a slot body are usually a sign the content belongs in two slots.
If one appears, downgrade it to `<h3 class="sec__sub">`.

---

## 2. Directory layout

```
content/
  overview.md          → index.html
  proposal.md          → proposal.html
  questions.md         → questions.html
  results.md           → results.html
  timeline.md          → timeline.html
  committee.md         → approvals.html
  public.md            → landing.html
  experiments/         → experiments.html   (one file per run)
    exp-001.md
  literature/          → literature.html    (one file per entry)
    _threads.md
    lit-001.md
  notes/               → notes.html         (one file per meeting)
    2026-09-08-scoping.md
figures/               → referenced by results.html and proposal.html
```

Singular files fill named slots. Directories generate **collections** — see §4.

---

## 3. Singular page schemas

Each of these is one Markdown file. Slot keys come from `##` headings, slugified,
prefixed with the file's namespace. `## Problem statement` in `proposal.md` fills
`proposal.problem-statement`; if that key does not exist in the HTML, fall back to
the explicit `slot:` frontmatter mapping below.

### `content/proposal.md`

```yaml
---
version: v0.1          # rendered into the page header and the approvals doc list
status: draft          # draft | circulated | approved
prepared_for: ""
dated: 2026-09-08
subtitle: ""           # → proposal.subtitle
risks:                 # → the §1.8 table, one row each
  - risk: ""
    likelihood: ""     # low | medium | high
    impact: ""         # low | medium | high
    mitigation: ""
slots:                 # heading → slot key, when they differ
  Abstract: proposal.abstract
  Problem statement: proposal.problem
  Stakes: proposal.problem.stakes
  The gap: proposal.gap
  Thesis statement: proposal.thesis
  Approach: proposal.approach
  Evaluation plan: proposal.evaluation
  Baselines: proposal.evaluation.baselines
  Resources: proposal.resources
  Scope boundaries: proposal.scope
research_questions: ["", "", ""]   # → proposal.rq.1 … rq.3
contributions: ["", "", ""]        # → proposal.contribution.1 … .3
---
```

`proposal.thesis` must be a **single sentence**. If the Markdown gives more than one,
fill the slot with the first and leave the remainder in the advisor log rather than
silently concatenating.

### `content/questions.md`

```yaml
---
questions:
  - id: rq1
    question: ""       # → rq.1.question
    motivation: ""     # → rq.1.motivation
    hypotheses:
      - id: H1.1       # → rq.1.h.1
        statement: ""
        status: open   # open | supported | inconclusive | refuted
        evidence: []   # run ids from content/experiments/
---
```

Status drives three things at once, and all three must stay in step:
the `data-state` attribute on the `<li data-item>` (filtering), the
`<span class="status" data-state="…">` glyph and word, and the run count in
`.card__foot`. The glyph map is in §6.

### `content/overview.md`, `content/public.md`, `content/timeline.md`, `content/committee.md`, `content/readiness.md`

Same pattern — frontmatter keys map 1:1 onto the `data-od-slot` values already present
in `index.html`, `landing.html`, `timeline.html`, and `approvals.html`. Grep the file
for `data-od-slot` to enumerate them; that list is the schema.

`content/timeline.md` and `content/readiness.md` additionally carry a `done:` boolean
per checklist line. That drives the `data-done` mechanic in §7 — attribute, glyph, and
screen-reader prefix all change together.

---

## 4. Collections

A collection directory generates repeated markup. The HTML ships a set of empty
records as the resting shape — **replace them entirely** when real records exist,
rather than appending after them.

### `content/experiments/exp-###.md` → `experiments.html`

```yaml
---
id: exp-006
date: 2026-09-08
rq: rq1                # → data-rq, drives the RQ filter chips
hypothesis: H1.1
env: ""
method: ""
seeds: 5
status: running        # queued | running | done | failed | superseded
commit: ""
metrics:
  success_rate: [mean, std]
artifacts:
  - label: ""
    href: ""
---

## Reading
Free text → the expanded detail row.
```

Emit two `<tr>` per record: the row (`<tr data-item data-state="…" data-rq="…">`) and
its detail row (`<tr class="detail" id="dNNN" hidden>`). The toggle button's
`aria-controls` must match the detail row's `id`, and ids must be unique — the filter
and sort code pairs each row with `nextElementSibling`, so **the detail row must
immediately follow its parent** with nothing between.

`status: done` maps to `data-state="done"`; `queued` maps to `data-state="queued"`.
A run with no file is not rendered at all — do not emit skeleton rows once real
records exist.

### `content/literature/lit-###.md` → `literature.html`

```yaml
---
id: lit-001
thread: a              # a | b | c | d → data-thread
cite: ""               # → lit.001.cite
does: ""               # → lit.001.does
stops: ""              # → lit.001.stops — required; this is the gap sentence
bearing_on: []         # rq ids
read: 2026-09-08
---
```

`_threads.md` supplies the four thread names and claims (`lit.thread.a.name`, `.claim`
and so on). `stops` is required: `proposal.gap` is assembled from these sentences, so an
entry without one cannot be cited there.

### `content/notes/YYYY-MM-DD-slug.md` → `notes.html`

```yaml
---
date: 2026-09-08
who: ""
topic: ""              # required
actions:
  - ""
---

Discussion body.
```

Markdown is the only source. There is no composer on `notes.html` and no way to
add an entry from the browser — see §7. Each file becomes one `[data-od-item]`
card, newest first; `actions` becomes a static checklist whose `data-done`
attribute you set from the Markdown.

### `content/decisions/YYYY-MM-DD-slug.md` → `approvals.html`

```yaml
---
date: 2026-09-08
member: ""             # must match a name in content/committee.md
document: ""           # e.g. "Proposal v1.0" — a named version, never "current draft"
outcome: approved      # approved | revisions | changes | comment
---

Comment body. Required for `revisions` and `changes`: what must change, and
against which section number.
```

Outcome maps to the status glyph in §6: `approved` → `● Approved`, `revisions` →
`◑ Approved with revisions`, `changes` → `✕ Changes requested`, `comment` →
`○ Comment only`. Newest first. **Append only** — a superseding decision is a new
file, never an edit to an existing one.

### `content/results.md` + `figures/` → `results.html`

```yaml
---
figures:
  - n: 1
    file: figures/fig-01-headline.svg
    caption: ""        # → figure.1.caption
    runs: []           # run ids — rendered into the provenance line
    group: headline    # headline | rq1 | rq2 | rq3 | ablation → which tab panel
headline_numbers:
  primary_metric: ""
  best_baseline: ""
  seeds_per_cell: ""
  compute_hours: ""
---
```

Replace the `.plate` div with `<img src="…" alt="…">` when a file exists; keep the
`<figcaption>` and its `<b>Figure N</b>` prefix. A figure with an empty `runs` list keeps
its `—` provenance line: **never** emit a number on this page without a run behind it.

---

## 5. Rules the converter must not break

- **No invented values.** Missing data renders as `<span class="dash">—</span>`.
  Never substitute a plausible number, date, or citation.
- **Status is never colour alone.** Every status carries a glyph and a word. Do not
  emit a bare coloured dot (WCAG 1.4.1).
- **No new colours.** If you need a shade, derive it with `color-mix()` from an existing
  token. Do not introduce hex values.
- **Ids stay unique** across a page — detail rows, tab panels, margin-note anchors.
- **Never add a control that writes.** No form, field, button, or script may send,
  submit, save, or delete. See §7 — this is a hard deployment constraint, not a
  style preference.
- **Don't reorder sections.** Section numbers (`§01`, `1.4`) are referenced by
  cross-links throughout the site.
- **Images need real `alt` text.** A figure's alt is not its caption; say what the
  reader would otherwise miss.

---

## 6. Reference tables

### Status vocabulary

| Meaning | `data-state` | Glyph | Word |
|---|---|---|---|
| Not started / pending | `open` | `○` | Open · Planned · Pending |
| In flight | `active` / `running` | `◐` | In progress · Running |
| Settled positively | `done` / `supported` / `approved` | `●` | Complete · Supported · Approved |
| Ran, undecided | `inconclusive` / `warn` / `revisions` | `◑` | Inconclusive · Approved w/ revisions |
| Settled negatively | `refuted` / `failed` / `stop` | `✕` | Refuted · Failed · Changes requested |
| Slot exists, no data | `unfilled` | `◌` | Unfilled |

### Token sheet

`css/tokens.css` is the only place colour, type scale, spacing, and rhythm are defined.
Six colour tokens (`--bg`, `--surface`, `--border`, `--muted`, `--fg`, `--accent`), five
status inks, three font stacks, a nine-step type scale, and a 4px spacing scale. Restyling
the whole site is an edit to that one file. The converter should never need to read it.

### Storage

None. The site writes nothing — no `localStorage`, no `sessionStorage`, no cookies.
See §7.

---

## 7. Static delivery — GitHub Pages

**The constraint.** This site is published to GitHub Pages, which serves static
files. There is no backend, no database, and no endpoint. Content is added by the
owner through the build pipeline before deploy, never through the browser. Readers
— the advisor and the committee — only ever view.

**What that forbids.** Nothing in any page or script may send, submit, save, or
delete. Concretely, none of these may appear anywhere in the site or in a generated
page:

| Forbidden | Why |
|---|---|
| `<form>`, `<input>` (except the filter box below), `<textarea>`, `<select>`, `<fieldset>` | There is nothing to submit to. |
| "Add", "New", "Edit", "Submit", "Save", "Delete" controls | Implies an authoring surface the reader does not have. |
| Comment, reply, or feedback widgets | Would need a server. |
| Sign-in, account, profile, "request access" | There are no accounts; everyone sees the same pages. |
| Contact forms, `mailto:` submit buttons | Same. A plain-text address is fine. |
| Admin, dashboard-editing, or settings views | Not shipped. Do not add one. |
| `fetch`, `XMLHttpRequest`, `sendBeacon`, `FormData` | Nothing to talk to. |
| `localStorage`, `sessionStorage`, `document.cookie` | State that survives a reload is a lie about a static page. |

**What is allowed** — display-only behaviour that changes what you can see in the
page you already have:

- Filter chips and the filter box (`[data-filter-scope]`, `js/site.js` §3)
- Sortable table columns (§4)
- Expandable rows and disclosures (§5)
- Tabs (§6)
- Margin-note anchor flashes (§7)
- The section-rail drawer (§1) and the reading-progress bar (§2)
- Hover and focus states, video player styling, `window.print()`

The one surviving input is `input[type="search"][data-search]` inside `.searchbox`.
It hides rows. It has no form around it, no submit, and no persistence.

**`noindex` is required.** Every page — including every page the pipeline generates —
must carry `<meta name="robots" content="noindex">` in `<head>`. All 15 files
currently do. If you add a template, add the tag.

**The `data-done` mechanic.** Checklists are static: their state is authored, not
ticked. Each `<li>` carries `data-done="false"` and renders:

```html
<li data-done="false">
  <span class="checklist__mark" aria-hidden="true">○</span>
  <span class="checklist__text"><span class="sr-only">Open. </span>The item text</span>
</li>
```

To mark one done, the build changes three things together — the attribute, the
glyph, and the screen-reader prefix:

```html
<li data-done="true">
  <span class="checklist__mark" aria-hidden="true">✓</span>
  <span class="checklist__text"><span class="sr-only">Done. </span>The item text</span>
</li>
```

Changing only the attribute leaves a `○` next to a struck-through line. Changing
only the glyph loses the state for a screen reader. Used by `approvals.html`
(readiness), `timeline.html` (working list), and each entry's action items in
`notes.html`. Sources: `content/readiness.md`, `content/timeline.md`, and the
`actions:` list in each `content/notes/*.md`.

**Where decisions and notes come from.** `approvals.html` renders
`content/decisions/*.md`; `notes.html` renders `content/notes/*.md`. Both are
append-only: a superseding decision is a new file against its own document version,
never an edit to an existing one. The commit history is the audit trail — which is
the thing a browser form would never have given you.

---

# 8. Template kit (Eleventy)

Sections 1–7 describe the nine hand-built pages. This section describes the **four
generic templates** — the layouts an Eleventy build clones per page, rather than
files you fill once.

| File | Template | Used for |
|---|---|---|
| `tpl-landing.html` | Landing | The site's front door |
| `tpl-content.html` | Content page | All five section pages — one layout, five instances |
| `tpl-feed-index.html` | Feed index | The lab-log list |
| `tpl-feed-entry.html` | Feed entry | One lab-log post |

They share `css/tokens.css` + `css/site.css` + `js/site.js` with the rest of the site.
No inline `<style>`, no framework, no build step assumed.

### One shell — resolved

The templates and the nine hand-built pages now use **the same chrome**: the left
section rail (`.shell` > `.rail` + `.main`) with the mobile drawer. The horizontal
`.topnav` the templates used to carry is gone, and its CSS has been deleted. Do not
reintroduce it — the whole point of the decision is that a page Eleventy generates
from `tpl-content.html` sits flush beside `proposal.html`.

The drawer (`js/site.js` §1) needs three things present and unrenamed on every page:
the `#navToggle` button inside `.topbar`, the `#backdrop` div, and `id="rail"` on the
nav. Below 1024px the rail is off-canvas and those three are the only way in.

**The one exception, on purpose:** `landing.html` keeps its standalone `.landnav`
hero treatment. It is the outward-facing front door, read by people with no interest
in the internal section structure, and its full-bleed hero has nowhere to put a rail.
`tpl-landing.html` — which is the *internal* front door, the generated equivalent of
`index.html` §00 — does use the rail, per the same decision. If the build ever points
`tpl-landing.html` at `landing.html`, that conflict has to be settled first.

### The rail — nine sections plus the log

Three fixed groups; only the links repeat.

| Group | Sections |
|---|---|
| The record | §00 Overview · §01 Proposal · §02 Questions & hypotheses · §03 Experiments · §04 Results & figures · §05 Related work |
| The process | §06 Timeline · §07 Committee & approvals · §08 Advisor log · **§09 Lab log** |
| Outward | ↗ Public page |

**§09 Lab log** is the feed — the dated record of results, findings, decisions, and
milestones, generated from `tpl-feed-index.html` / `tpl-feed-entry.html`. It is a
different surface from §08: §08 is the working conversation with your advisor, §09 is
the published narrative of the work. Both are chronological; only §09 is written for
someone else to read.

The rail links to it as `tpl-feed-index.html`, which is what exists today. **The build
rewrites that href to the generated feed URL** — that is the one path substitution
beyond the two `<link>` hrefs in §8.7.

## 8.1 Three mechanics

| Attribute | Meaning | If there is no content |
|---|---|---|
| `data-od-slot="key"` | **Fill in place.** Replace innerHTML. If the element also has class `slot`, drop `slot`/`slot--inline`/`slot--tall` and add `prose`. | **Keep it.** It renders as an honest labelled placeholder. |
| `data-od-block="name"` | **A markup pattern**, not content. Clone once per occurrence in the body Markdown, fill the clone, then delete the exemplar. | Delete the exemplar. |
| `data-od-repeat="key"` | **A list.** Clone the `[data-od-item]` child once per record; delete the leftovers. | Delete every item and show the sibling `.empty` note. |

The distinction matters: slots are **persistent** (an empty slot is a truthful "not
written yet"), blocks and repeat-items are **disposable** (a leftover exemplar is a lie).

## 8.2 Slot inventory

**Shared chrome — present in all four templates**

| Key | Type | Notes |
|---|---|---|
| `site.title` | text | Required. Wordmark and `<h1>` source. |
| `site.subtitle` | text | One line. Mono uppercase; truncates on phones. |
| `site.stage` | text | Optional stage marker in the top bar. Delete the span if unused. |
| `site.nav` | repeat | One `a.rail__link[data-od-item]` per section, inside the `.rail__group` it belongs to. The repeat sits on `nav#rail`; the three groups are fixed chrome. `aria-current="page"` on the current one **and nowhere else**. |
| `site.footer.line`, `site.footer.updated` | text | Footer. |

**`tpl-landing.html`**

| Key | Type | Notes |
|---|---|---|
| `landing.headline` | text | Required. The only `<h1>` on the page. |
| `landing.pitch` | markdown | **One paragraph.** If the Markdown gives more, keep the first and leave the rest for the proposal — do not concatenate. |
| `landing.hero_media` | media | See §8.3. |
| `landing.hero_media.caption` | text | Optional; delete the `<figcaption>` if the media needs none. |
| `landing.cta.primary`, `landing.cta.secondary` | text + href | Two buttons. |
| `landing.cards` | repeat ×5 | Per item: `card.title`, `card.teaser` (one line), `card.meta`, `card.state`, and the `href`. |
| `landing.latest` | repeat ×3 | The three newest feed entries, newest first. Per item: `entry.date`, `entry.title`, `entry.excerpt`, `entry.tag`. |
| `landing.latest.empty` | note | Un-hide this and delete all three cards when the feed is empty. Never fabricate entries to fill the strip. |

**`tpl-content.html`**

| Key | Type | Notes |
|---|---|---|
| `page.kicker` | text | Section number + name, e.g. `§01 · Proposal`. |
| `page.title` | text | Required. |
| `page.lead` | markdown | One standfirst paragraph, no headings. |
| `page.meta` | list | Optional; delete the div if the page has no metadata. |
| `page.status` | text | Optional top-bar stage marker. |
| `page.body` | markdown | Required. Supports `h2`, `h3`, `p`, `ul`, `ol`, `blockquote`, `code`, `pre`, plus the four blocks. |
| `page.prev`, `page.next` | link | See §8.4. |

**`tpl-feed-index.html`**

| Key | Type | Notes |
|---|---|---|
| `feed.kicker`, `feed.title`, `feed.lead` | text / markdown | Page head. |
| `feed.entries` | repeat | Newest first. Per item: `entry.date`, `entry.title`, `entry.excerpt`, `entry.tag`. |

**`tpl-feed-entry.html`**

| Key | Type | Notes |
|---|---|---|
| `entry.date` | date | Required. ISO in `datetime`, human text inside. |
| `entry.title` | text | Required. |
| `entry.tag` | text | Optional. Delete the span when untagged. |
| `entry.excerpt` | text | 1–2 lines. **Write once in frontmatter** — the index and the landing strip read the same field. |
| `entry.body` | markdown | Required. Same block library as `page.body`. |
| `entry.prev`, `entry.next` | link | Older / newer. |

**Blocks — identical markup in `tpl-content.html` and `tpl-feed-entry.html`**

| Block | Inner slots | Notes |
|---|---|---|
| `callout` | `block.callout.title`, `block.callout.body` | The "open decision" flag. Add `callout--accent` when it is blocking. |
| `figure` | `block.figure.caption` | Replace `.media__empty` with `<img src alt>`. The `<b>Figure N</b>` prefix stays. `alt` is not the caption. |
| `video` | `block.video.caption` | Replace `.media__empty` with an `<iframe>` carrying a real `title`. |
| `table` | `block.table.caption` | `table.simple` inside `.table-wrap`. Three or four short columns. For a dense run ledger use `table.data` instead — that one scrolls, this one does not. |

Blockquotes also carry an optional `block.quote.source` inside `<cite>`.

## 8.3 The hero-media contract

`.media` has three states and chooses between them itself:

| First child of `.media` | Result |
|---|---|
| `<img>` or `<video>` | Media shown, placeholder auto-hidden by `.media:has(…)` |
| `<iframe>` | Embed shown, placeholder auto-hidden |
| nothing | Labelled grid placeholder |

Deleting the whole `<figure class="hero__media">` collapses the hero to a single
column rather than leaving a dead half — that is `.hero:not(:has(.hero__media))`.

**All three are finished states.** There is no arrangement that yields an empty box
or a broken grid, and the converter never has to remember to remove the placeholder.

## 8.4 Prev / next

Set `href` and the two spans from the collection order. When there is no neighbour,
swap the `<a>` for `<span class="pagenav__link pagenav__link--none">` so the grid keeps
both columns. On a content page, previous/next is section order; on a feed entry it is
date order — **previous is older**.

## 8.5 Feed tags

Closed set of four: `result`, `decision`, `milestone`, `finding`. Class is
`tag--<value>`; the item's filter attribute is `data-tag="<value>"`, or `data-tag=""`
when untagged (which survives "All" and is excluded by any specific tag — correct, not
a bug). The word is always rendered, so colour is a second cue and never the only one.

## 8.6 Filtering — no new JavaScript

`js/site.js` §3 already ships a generic filter. Four parts, all on the feed index:

```
[data-filter-scope]                                    wraps chips AND items
[data-filter-group="tag"][data-filter-value="result"][aria-pressed]
[data-item][data-tag="result"]                         group name → data-<group>
[data-search]  [data-count]  [data-empty]              all optional
```

The chip handler toggles attributes only; it never re-renders its own container, so the
clicked chip keeps focus and keyboard navigation keeps an anchor. Do not "improve" this
by rebuilding the list on click — that silently breaks every keyboard affordance.

## 8.7 Wiring to Eleventy

- **Stylesheet paths.** The templates use relative `css/…` so they preview from the
  project root. Nested URLs (`/lab/<slug>/`) need root-relative `/css/…`. Two lines per
  file. The only other path edit is the §09 rail href — see "The rail" above.
- **Partials.** Topbar, section rail and footer are byte-identical across the four
  files, and match the nine hand-built pages. They are inlined so each opens
  standalone; lift them to `_includes/` on the way in. The rail partial takes the
  current section as a parameter so `aria-current="page"` lands in exactly one place.
- **`noindex`.** Every generated page needs `<meta name="robots" content="noindex">`.
  All 15 files here carry it; injecting it in the head partial is the reliable way to
  keep that true for generated pages. See §7.
- **Collections.** `feed.entries` and `landing.latest` read the same collection —
  `latest` is `.slice(0, 3)` of it. `site.nav` is a data file, not a collection.
- **Blocks in Markdown.** A block is emitted by a shortcode, not by raw Markdown.
  `{% figure %}`, `{% video %}`, `{% callout %}`, `{% table %}` map 1:1 onto the four
  exemplars — copy their markup verbatim into the shortcode bodies.

## 8.8 Rules from §5 still apply

No invented values, status never colour alone, no new colours outside `tokens.css`,
unique ids, real `alt` text. The template kit adds one more:

- **A leftover exemplar is a lie.** An unfilled `data-od-slot` is honest — it says "not
  written yet". An unfilled `data-od-block` or `data-od-item` is not; it says "here are
  three lab entries" when there are none. Delete them.
