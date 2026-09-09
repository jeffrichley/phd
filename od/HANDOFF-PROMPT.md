# Handoff prompt — PhD journey site

Paste everything below the rule into the other agent's session.

---

You are picking up a finished design system and turning it into a content
pipeline. The design is done. Your job is to write Markdown, convert it into the
existing HTML slots, and (if we go that way) wire an Eleventy build. **Do not
redesign anything.** Do not write CSS. Do not invent colours, numbers, dates, or
citations.

## 0. Where the files are

```
C:\Users\jeffr\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\ed3e9ebd-5a18-4da4-8431-dd1693b5b3fb\
```

Everything is standalone HTML + CSS + one JS file. No framework, no build step,
no package.json, nothing installed.

| File | Size | What it is |
|---|---|---|
| `CONTENT-CONTRACT.md` | 25.0 KB | **Read this first, in full.** The authoritative spec. This prompt is the orientation; that file is the contract. |
| `css/tokens.css` | 4.2 KB | The token sheet. Every colour, type step, space step, radius. |
| `css/site.css` | 33.0 KB | The component system, 16 numbered sections. |
| `js/site.js` | 10.0 KB | The interaction layer, 7 numbered blocks, all attribute-driven, all display-only. |
| `index.html` | 12.6 KB | §00 Overview — the site's spine. |
| `proposal.html` | 21.8 KB | §01 The advisor-approval document. |
| `questions.html` | 12.1 KB | §02 Research questions + hypothesis ledger. |
| `experiments.html` | 15.5 KB | §03 Run ledger. |
| `results.html` | 10.4 KB | §04 Figure plates. |
| `literature.html` | 12.2 KB | §05 Related work, threaded by argument. |
| `timeline.html` | 11.7 KB | §06 Program spine + 90-day list (static). |
| `approvals.html` | 16.4 KB | §07 Committee roster + published decision ledger. |
| `notes.html` | 8.1 KB | §08 Advisor meeting log. |
| `landing.html` | 18.7 KB | Public companion page. Standalone chrome, not the rail. |
| `tpl-landing.html` | 13.0 KB | Template: landing. Rail chrome. |
| `tpl-content.html` | 11.9 KB | Template: content page. Rail chrome. |
| `tpl-feed-index.html` | 11.0 KB | Template: feed index — §09 Lab log. Rail chrome. |
| `tpl-feed-entry.html` | 9.8 KB | Template: feed entry — §09 Lab log. Rail chrome. |

**Ignore `phd-journey-overview.html`.** It is a byte-identical duplicate of
`index.html` left over from a handoff. Delete it or leave it; never edit it, and
never link to it.

**Ignore `.od-skills/`.** Tooling, not site content.

## 1. The design direction, so you don't fight it

Direction is "journal plate": a well-set dissertation on the web. Paper-white
canvas `oklch(98.5% 0.003 285)`, deep violet ink accent `oklch(48% 0.19 292)`,
serif display / system-sans body / mono for run IDs and captions, hairline rules,
2px corners, numbered sections. The one flourish is a **margin apparatus** —
Tufte-style side notes running beside the proposal text, which is also where
anchored committee comments will eventually live.

Restyling the entire site is a single edit to `css/tokens.css`. You should never
need to open it. If you find yourself wanting a new shade, use
`color-mix(in oklch, var(--accent) 20%, var(--surface))` against an existing
token — never a raw hex.

## 2. Three mechanics, not one

This is the thing most converters get wrong. There are three attributes and they
behave differently when there is no content:

| Attribute | Meaning | Empty behaviour |
|---|---|---|
| `data-od-slot="key"` | **Fill in place.** Replace `innerHTML`. If the element also carries class `slot`, remove `slot` / `slot--inline` / `slot--tall` and add `prose`. | **Keep it.** It renders as a labelled dashed placeholder — an honest "not written yet". |
| `data-od-block="name"` | **A markup pattern**, not content. Clone it once per occurrence in the body Markdown, fill each clone, then delete the exemplar. | **Delete the exemplar.** |
| `data-od-repeat="key"` | **A list.** Clone the `[data-od-item]` child once per record, then delete the leftovers. | **Delete every item** and un-hide the sibling `.empty` note. |

Slots are persistent, blocks and repeat-items are disposable. A leftover
exemplar is a lie: it says "here are three lab entries" when there are none. An
unfilled slot is the truth.

To enumerate the slots on any page: `grep -o 'data-od-slot="[^"]*"' <file>`.
That list *is* the schema for that page.

## 3. Two page families, two shells

### Family A — the nine hand-built pages

`index`, `proposal`, `questions`, `experiments`, `results`, `literature`,
`timeline`, `approvals`, `notes`, plus `landing`. These use a **left section
rail** (`#rail`, `.rail__link`) with a mobile drawer driven by `#navToggle`,
`#backdrop`, and `js/site.js` §1. They are hand-built one-offs: you fill their
slots, you don't generate them.

Each one has a distinct job:

- **`index.html` §00** — status strip (advisor decision, next milestone, run
  count, open hypotheses), the nine-surface record as cards, the journey spine.
  This is the page the committee lands on.
- **`proposal.html` §01** — thirteen numbered sections with the margin apparatus
  running alongside: 1.0 Abstract, 1.1 Problem, 1.2 Literature survey, 1.3 Gap,
  1.4 Thesis, 1.5 Questions, 1.6 Approach, 1.7 Contributions, 1.8 Evaluation,
  1.9 Preliminary results, 1.10 Risks, 1.11 Resources and schedule, 1.12 Scope.
  Built to read straight through or print (there is a print stylesheet at
  `site.css` §13). Two of those sections, Literature survey and Preliminary
  results, were inserted after this document was first written, because ODU's
  Graduate Catalog names them; a regeneration from the older structure would
  drop both and silently break every cross-reference into §01. `proposal.thesis` **must be a
  single sentence**; if the Markdown gives more, take the first and leave the
  rest for the advisor log rather than concatenating.
- **`questions.html` §02** — research questions, each with falsifiable
  hypotheses. Status drives three things that must stay in step: the `data-state`
  on `<li data-item>` (which the filter reads), the `<span class="status">` glyph
  and word, and the run count in `.card__foot`.
- **`experiments.html` §03** — the run ledger. Sortable, searchable, expandable
  rows. Emit **two `<tr>` per run**: `<tr data-item data-state data-rq>` followed
  *immediately* by `<tr class="detail" id="dNNN" hidden>`. The filter and sort
  code pairs each row with `nextElementSibling`, so nothing may come between
  them, and the toggle's `aria-controls` must match the detail row's `id`.
- **`results.html` §04** — figure plates, tabbed by research question. Replace
  the `.plate` div with a real `<img>`; keep the `<figcaption>` and its
  `<b>Figure N</b>` prefix. A figure with no runs behind it keeps its `—`
  provenance line. Never put a number on this page without a run ID behind it.
- **`literature.html` §05** — threaded by argument, not alphabet. Each entry has
  a required `stops` field: what the work does *not* do. `proposal.gap` is
  assembled from those sentences, so an entry without one can't be cited there.
- **`timeline.html` §06** — seven-stage program spine plus a 90-day list. The list
  is **static**: state is authored via the `data-done` mechanic, never ticked in
  the browser. See `CONTENT-CONTRACT.md` §7.
- **`approvals.html` §07** — committee roster and the published decision ledger,
  rendered from `content/decisions/*.md`. Append-only: a superseding decision is a
  new file against its own document version, never an edit to an existing one.
- **`notes.html` §08** — the meeting log, rendered from `content/notes/*.md`. Each
  entry's action items are a static `data-done` checklist.
- **`landing.html`** — public companion. Hero, research thrusts, device mockups,
  and a colophon saying how the record is kept. No form, no access request:
  everything is published and everyone sees the same pages.

**There are no forms anywhere in the site.** It deploys to GitHub Pages, which
serves static files — there is no server to receive anything. `CONTENT-CONTRACT.md`
§7 lists exactly what that forbids and what display-only behaviour is still fine.
Every page carries `<meta name="robots" content="noindex">`; keep it.

### Family B — the four templates

`tpl-landing.html`, `tpl-content.html`, `tpl-feed-index.html`,
`tpl-feed-entry.html`. These are **layouts to clone per page**, not files to fill
once.

**Chrome: resolved — the rail won.** All four templates now use the same left
section rail (`.shell` > `.rail` + `.main`) as the nine hand-built pages, with the
mobile drawer. The horizontal `.topnav` is gone and its CSS is deleted. Do not
reintroduce it: the whole point is that a page generated from `tpl-content.html`
sits flush beside `proposal.html`. Every `data-od-slot` / `data-od-block` /
`data-od-repeat` key is unchanged; only the chrome moved. `site.nav` now repeats
`a.rail__link[data-od-item]` inside three fixed `.rail__group`s.

**Landing chrome, recorded:** `landing.html` intentionally keeps its standalone
`.landnav` hero treatment — it is the outward front door, read by people with no
interest in the internal section structure, and its full-bleed hero has nowhere to
put a rail. `tpl-landing.html` is the *internal* front door (the generated
equivalent of `index.html` §00) and does take the rail. If your build ever points
`tpl-landing.html` at `landing.html`, settle that collision before you generate.

**The feed has a home: §09 Lab log**, in the rail's "The process" group, directly
after §08. It is a different surface from §08 — §08 is the working conversation
with your advisor, §09 is the published dated record of results, findings,
decisions, and milestones. Every page in both families now carries the §09 entry.

The rail links to it as `tpl-feed-index.html`, which is what exists today. **Rewrite
that href to the generated feed URL at build time** — it is the only path
substitution beyond the two `<link>` hrefs per file.

## 4. Slot inventory for the templates

Full table is `CONTENT-CONTRACT.md` §8.2. Summary:

**Shared chrome, all four templates:** `site.title`, `site.subtitle`,
`site.stage`, `site.nav` (repeat — `aria-current="page"` on exactly one item and
nowhere else), `site.footer.line`, `site.footer.updated`.

**`tpl-landing.html`:** `landing.headline` (the only `<h1>`), `landing.pitch`
(one paragraph — keep the first if Markdown gives more), `landing.hero_media`,
`landing.hero_media.caption`, `landing.cta.primary`, `landing.cta.secondary`,
`landing.cards` (repeat ×5: title, teaser, meta, state, href), `landing.latest`
(repeat ×3, newest first), `landing.latest.empty`.

**`tpl-content.html`:** `page.kicker`, `page.title`, `page.lead`, `page.meta`,
`page.status`, `page.body`, `page.prev`, `page.next`.

**`tpl-feed-index.html`:** `feed.kicker`, `feed.title`, `feed.lead`,
`feed.entries` (repeat, newest first).

**`tpl-feed-entry.html`:** `entry.date` (ISO in `datetime`, human text inside),
`entry.title`, `entry.tag`, `entry.excerpt` (**write once in frontmatter** — the
index and the landing strip read the same field), `entry.body`, `entry.prev`,
`entry.next`.

**Four blocks, identical markup in `tpl-content.html` and `tpl-feed-entry.html`:**

| Block | Inner slots | Notes |
|---|---|---|
| `callout` | `block.callout.title`, `block.callout.body` | The "open decision" flag. Add `callout--accent` when blocking. |
| `figure` | `block.figure.caption` | Replace `.media__empty` with `<img src alt>`. `alt` is not the caption — say what a reader would otherwise miss. |
| `video` | `block.video.caption` | Replace `.media__empty` with an `<iframe>` carrying a real `title`. |
| `table` | `block.table.caption` | Uses `table.simple` inside `.table-wrap`. Three or four short columns. For a dense run ledger use `table.data` instead — that one has `min-width: 720px` and scrolls; `simple` does not. |

Blockquotes carry an optional `block.quote.source` inside `<cite>`.

### The media contract

`.media` picks its own state. First child `<img>`/`<video>` → media shown,
placeholder auto-hidden by `.media:has(…)`. First child `<iframe>` → embed shown,
placeholder hidden. Nothing → labelled grid placeholder. Deleting the whole
`<figure class="hero__media">` collapses the hero to one column rather than
leaving a dead half, via `.hero:not(:has(.hero__media))`.

All four are finished states. You never have to remember to remove a placeholder.

### Prev / next

Set `href` and the two spans from collection order. When there is no neighbour,
swap the `<a>` for `<span class="pagenav__link pagenav__link--none">` so the grid
keeps both columns. Content pages order by section; feed entries order by date,
and **previous is older**.

### Feed tags

Closed set of four: `result`, `decision`, `milestone`, `finding`. Class is
`tag--<value>`, filter attribute is `data-tag="<value>"`, or `data-tag=""` when
untagged (which survives "All" and is excluded by any specific tag — that is
correct, not a bug). The word is always rendered; colour is never the only cue.

## 5. The JavaScript is already written

`js/site.js` has seven feature-detected blocks. Pages only pay for what they use.
You should not need to write any new JS — you wire behaviour by emitting the right
attributes.

| § | Behaviour | Hook |
|---|---|---|
| 1 | Rail drawer | `#rail`, `#navToggle`, `#backdrop`, `[data-nav-close]` |
| 2 | Reading progress bar | `#progress` |
| 3 | Filter chips + filter box | `[data-filter-scope]` wrapping both chips and items |
| 4 | Sortable columns | `table[data-sortable]`, `th[data-sort="num|text"]` |
| 5 | Expandable rows | `[data-expand]` + matching `aria-controls` |
| 6 | Tabs | `[role="tablist"]` / `[role="tab"]` / `aria-controls` |
| 7 | Margin-note anchors | `.anchor-mark[data-target]` |

Every one of those only shows, hides, reorders, or highlights content already in
the page. **Nothing sends, submits, saves, or deletes** — no `fetch`, no
`localStorage`, no cookies. That is a deployment constraint, not a style choice:
see `CONTENT-CONTRACT.md` §7. Five blocks that used to exist (persisted checklists,
the decision form, the meeting composer, copy-to-clipboard, the access-request form)
have been deleted along with their markup. Do not write them back.

The filter (§3) needs four things, all present already on the feed index:

```
[data-filter-scope]                                     wraps chips AND items
[data-filter-group="tag"][data-filter-value="result"][aria-pressed]
[data-item][data-tag="result"]                          group name → data-<group>
[data-search]  [data-count]  [data-empty]               all optional
```

**Focus discipline — do not "improve" this.** Every handler in that file avoids
replacing the container it lives in. The chip handler toggles attributes rather
than re-rendering the list, so the clicked chip keeps focus. The sort handler
moves existing nodes via a fragment rather than rebuilding rows. Result counts are
announced through the `#live` aria-live region. If you rebuild a list on click,
every keyboard affordance built on focus silently breaks, and no unit test that
calls `focus()` directly will catch it.

## 6. Rules you must not break

- **No invented values.** Missing data renders as `<span class="dash">—</span>`.
  Never substitute a plausible number, date, citation, or committee name.
- **Status is never colour alone.** Every status carries a glyph *and* a word
  (WCAG 1.4.1). Never emit a bare coloured dot.
- **No new colours.** Derive with `color-mix()` from an existing token.
- **No inline styles, no `<style>` blocks.** All presentation lives in the two
  CSS files.
- **Ids stay unique** across a page: detail rows, checkbox `data-key`s, tab
  panels.
- **Don't reorder sections.** `§01`, `1.4` and friends are cross-linked
  throughout the site.
- **Real `alt` text** on every image.
- Headings inside a slot body usually mean the content belongs in two slots. If
  one appears anyway, downgrade it to `<h3 class="sec__sub">`.

### Status vocabulary

| Meaning | `data-state` | Glyph | Word |
|---|---|---|---|
| Not started / pending | `open` | `○` | Open · Planned · Pending |
| In flight | `active` / `running` | `◐` | In progress · Running |
| Settled positively | `done` / `supported` / `approved` | `●` | Complete · Supported · Approved |
| Ran, undecided | `inconclusive` / `warn` / `revisions` | `◑` | Inconclusive · Approved w/ revisions |
| Settled negatively | `refuted` / `failed` / `stop` | `✕` | Refuted · Failed · Changes requested |
| Slot exists, no data | `unfilled` | `◌` | Unfilled |

### Component classes available to you

Use these; don't invent class names. `wrap` `wrap--text` `wrap--wide` `sec`
`sec--rule` `sec__head` `sec__num` `sec__title` `sec__sub` `pagehead`
`pagehead__meta` `kicker` `kicker--accent` `eyebrow-rule` `lede` `prose` `doc`
`doc__body` `doc__margin` `margin-stack` `note` `note__who` `note--pending`
`anchor-mark` `slot` `slot__key` `slot__hint` `slot--inline` `slot--tall`
`slot--filled` `status` `status__glyph` `chip` `chips` `tag` `tag--result`
`tag--decision` `tag--milestone` `tag--finding` `tag--rq` `card` `card__num`
`card__title` `card__body` `card__foot` `stat` `stat--accent` `stat__k`
`stat__v` `grid` `grid--2` `grid--3` `grid--4` `row` `stack` `stack-lg`
`table-wrap` `plate` `plate__key` `media` `media--16x9` `media--16x10`
`media__empty` `callout` `callout--accent` `spine` `spine__when` `spine__what`
`spine__note` `checklist` `checklist__mark` `checklist__text` `btn` `btn--ghost`
`btn--small` `rowbtn` `searchbox` `toolbar` `toolbar__group` `toolbar__count`
`empty` `divider` `dash` `mono` `num` `small` `muted` `sr-only` `skip`
`shell` `rail` `rail__group` `rail__label` `rail__link` `rail__num` `rail__close` `topbar` `topbar__end` `nav-toggle` `backdrop` `wordmark` `wordmark__name` `wordmark__sub` `stagemark` `hero` `hero__title`
`hero__sub` `hero__pitch` `hero__media` `hero__actions` `feed` `feed__item`
`feed__link` `feed__date` `feed__title` `feed__excerpt` `pagenav`
`pagenav__link` `pagenav__link--next` `pagenav__link--none` `pagenav__dir`
`pagenav__title` `sitefoot` `sitefoot__inner`.

## 7. Known open items — do not paper over these

1. **Nothing on this site can be submitted, and that is permanent.** It deploys to
   GitHub Pages. Every form, field, composer, checkbox, copy button, and
   access-request affordance has been removed, along with the five `js/site.js`
   blocks behind them. If a feature seems to need persistence, it belongs in the
   build pipeline. `CONTENT-CONTRACT.md` §7 is the authority.
2. **No render verification, this session or the last.** Tag balance across all 15
   HTML files and CSS brace balance both pass, and an exhaustive grep sweep
   confirms zero forms, zero storage APIs, and zero network calls. But no page has
   been rendered: Chrome and Edge both exist on this machine and produce no output
   through this session's shell. Responsive behaviour rests on the CSS rules, not
   on measurement. Open the four templates and `approvals.html` / `notes.html` at
   360px before building against them. The rules that should hold: hero collapses
   at 899px, feed row and pagenav at 639px, the rail goes off-canvas below 1024px
   with the drawer as the way in, tables sit inside `.table-wrap`.
3. **The rail conversion was mechanical, not re-laid-out.** The four templates had
   their shell swapped by scripted edit. Inner indentation was left alone, so the
   content inside `.main` is indented one level shallower than the hand-built
   pages. Cosmetic, but tidy it if you regenerate the files anyway.
4. **`landing.html` embeds two shared device frames** at
   `/frames/browser-chrome.html?screen=/proposal.html` and an iPhone frame. Those
   files exist on disk but were never confirmed to resolve at the preview URL. If
   they render blank, say so rather than deleting them.
5. **Everything is currently empty.** Every slot renders as a labelled dashed
   frame. No dates, metrics, citations, or committee names were invented. The `—`
   marks are the intended state, not a bug to fix.

## 8. Content directory you should author

```
content/
  overview.md          → index.html
  proposal.md          → proposal.html
  questions.md         → questions.html
  results.md           → results.html
  timeline.md          → timeline.html
  committee.md         → approvals.html    (roster)
  readiness.md         → approvals.html    (data-done checklist state)
  public.md            → landing.html
  experiments/         → experiments.html   (one file per run: exp-###.md)
  literature/          → literature.html    (_threads.md + lit-###.md)
  notes/               → notes.html         (YYYY-MM-DD-slug.md)
  decisions/           → approvals.html     (YYYY-MM-DD-slug.md, append-only)
figures/               → referenced by results.html and proposal.html
```

Singular files fill named slots. Directories generate collections. Full
frontmatter schemas for every one of these are in `CONTENT-CONTRACT.md` §3 and
§4 — copy them exactly rather than designing your own.

## 9. If you wire Eleventy

- **Stylesheet paths.** The templates use relative `css/…` so they preview from
  the project root. Nested URLs like `/lab/<slug>/` need root-relative `/css/…`.
  That is the only path edit, two lines per file.
- **Partials.** Topbar, section rail and footer are byte-identical across the four
  templates, and match the nine hand-built pages. They are inlined so each file
  opens standalone; lift them to `_includes/` on the way in. The rail partial takes
  the current section as a parameter so `aria-current="page"` lands in one place.
- **`noindex` in the head partial.** Every generated page needs
  `<meta name="robots" content="noindex">`. All 15 files here carry it.
- **Collections.** `feed.entries` and `landing.latest` read the same collection;
  `latest` is `.slice(0, 3)` of it. `site.nav` is a data file, not a collection.
- **Blocks are shortcodes, not raw Markdown.** `{% figure %}`, `{% video %}`,
  `{% callout %}`, `{% table %}` map 1:1 onto the four exemplars. Copy their
  markup verbatim into the shortcode bodies.

## 10. Do this first

1. Read `CONTENT-CONTRACT.md` end to end.
2. Open `proposal.html` and `tpl-content.html` side by side. They should look like
   the same site now — same rail, same groups, §09 Lab log in both. If they do
   not, stop and say so.
3. Draft `content/proposal.md`, starting with the thesis sentence for
   `proposal.thesis` — every other section hangs off it.
4. Then `content/literature/`, because `proposal.gap` is assembled from the
   `stops` field of those entries.
5. Leave every slot you have no real content for exactly as it is.
