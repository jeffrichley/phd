# Notes for the next OpenDesign session

**§07's ROSTER SEATS SHOW A STATUS, NOT A SLOT KEY, 2026-09-09.** Your three unnamed seats
rendered their own `slot__key` text to the reader, so a committee member opening §07 saw
`COMMITTEE.MEMBER.2` in uppercase mono. Unfilled slots are a contract feature and honest on
a working page, but §07's entire audience is the committee.

**The seats stay.** Jeff's ruling: one committee, and the empty seats remain visible as
seats so a reader can see the committee's shape and which parts are settled. Their
`data-od-slot` divs are removed and each unnamed seat now carries a status instead, written
through `statusSpan` so glyph and word stay in step. **Members 2 and 3 read "Not yet
selected"; the external seat reads "After candidacy"**, because the seats are empty for
different reasons and one word for both would call a schedule a delay.

A new `committee.standing` slot sits above the grid, filled from the two lines
`content/committee.md` already authored and which had never reached any page. That is where
the explanation of why the seats are empty now lives, in Jeff's own words rather than in a
template key.

No names and no seat count are shown beyond the chair, per his 2026-09-08 carve-out: nobody
appears on the roster until they have agreed to serve.

**COUNTERS ARE DERIVED NOW, 2026-09-09. Do not hand-maintain the numbers in
`.stagemark` or `.pagehead__meta`.** Your topbar and pagehead counters shipped as static
template text and froze at the mockup's values, while the §00 cards summarising the same
collections derived correctly. The site therefore contradicted itself two clicks apart:
§00 said 21 literature entries and §05's own header said 0.

The build now writes them from the collections they name, driven by two tables
(`STAGEMARKS`, `PAGEHEAD_COUNTS`) applied inside `finish()`, which every page passes
through. **The placeholder values in your `od/` sources were left exactly as delivered**,
because they are honest mockup text and correcting them would only re-arm the drift. If
you add a page with a counter, add a row to the table rather than typing a number.

Nine counters are now derived: literature threads and entries, experiments runs and
records, results plates and filled, questions open and total hypotheses, notes entries and
open actions, and §07's `N filled` tag. The results plate total is derived from the count
of `.plate` elements in your own `results.html`, so the layout stays the source of truth
for how many plates exist.

Three counters were checked and deliberately left alone because they are true: results
"Plates 6 reserved", approvals "Members 4 slots · Decisions 0", questions "Questions 3
slots".

Two were checked and left alone because they are **ambiguous rather than stale**, and
guessing would have been worse than leaving them: `timeline.html`'s "Stage 01 of 07" and
`index.html`'s "Stage 01 · Proposal in draft" both assert a current position, and §06 has
stage 1 active while stage 2 is already complete, so there is no single current stage.
`timeline.html`'s "Dated 0" depends on whether a term like "Fall 2026" counts as a date,
which the contract does not define.

**§05 RENAMED, 2026-09-09: "Related work" is now "Literature corpus."** 23 occurrences
across 18 files, including all nine hand-built rails and **all four `tpl-*.html`
templates**. The templates are the ones that would quietly reintroduce the old label on a
regeneration, which is the same failure shape as the numbering warning below.

The name change is not cosmetic. "Related work" is a paper-level section that positions one
contribution against its near neighbours. §05 is a field survey, 21 entries growing toward
100+, threaded by argument, each entry naming where its source stops. It also had to avoid
colliding with §01's new "Literature survey": §01 carries the argument under ODU's own word,
§05 is the browsable evidence it is assembled from.

The URL stays `literature.html` and the section number stays §05, so no link anywhere
changed. `content/literature/lit-014.md` still uses "related work" as ordinary prose and was
deliberately left alone.

**The rail table in `CONTENT-CONTRACT.md` was also missing §10 Disciplines entirely**, and
still described the rail as "nine sections plus the log" when the built rail renders ten
plus the log. §10 is now listed under "The process" alongside §09, matching how the live
rail groups it. A regeneration from the older table would have dropped the Disciplines link
from every page and looked correct doing it, because the contract described exactly what it
would have produced.

**Two collections the contract still does not describe**, and this is the record of the gap
rather than an attempt to fill it. §10 Disciplines has a rail-table row and nothing else: no
description, no content schema. §09 gets four sentences, its generating templates named, and
its href-rewrite rule documented. `content/people/` is in neither the table nor the schema,
while generating `people-*.html`, one of which is live and reachable from §07's roster.

Both build correctly today, so this is a documentation gap rather than a build failure. The
risk it names is a regenerating OD session producing a page for a section its own contract
does not describe. **The descriptions are yours to write**, in your voice and for collections
you designed the shape of; inventing them here is how a contract acquires an
authoritative-sounding rule that is wrong.

**SECTION COUNT IS NOW DERIVED, 2026-09-09.** Three of your files asserted that §01 has
eleven sections, and the build re-asserted it on every run from a string literal in
`scripts/build.mjs`. §01 has thirteen. The count is now computed from
`od/proposal.html`'s own `section.sec.doc` elements, so it tracks the structure that
produces the rail and the anchors and cannot drift from it again.

Two of your literals are now placeholders the build overwrites, both marked with an HTML
comment saying so: `index.html`'s proposal card foot, and `approvals.html`'s `13 sections`
tag. Their values are aligned to today's truth so a regeneration without the build step
would not ship the old number, but the build is what makes them right.

Two other spots were made **count-free** rather than corrected, deliberately, because §01
took two insertions in a single day and a corrected number is a number that goes stale
again: `landing.html`'s proposal figcaption now reads "a numbered section rail", and
`approvals.html`'s proposal card body opens "The full proposal document, currently in
draft." Please keep counts out of prose. If a number is worth showing, it belongs in a
slot or a tag the build can fill.

Still asserted and still wrong, reported rather than changed because it is a claim about
readiness rather than structure: the `0 filled` tag beside the section tag on
`approvals.html`. Every slot in the built §01 is filled; there are zero `class="slot"`
elements left in the output.

**SECOND SECTION REORDER, 2026-09-09, also authorized.** ODU's catalog names two sections
the proposal must contain, and the literature survey below was only the first. **§1.9
Preliminary results** (`id="s19"`, slot `proposal.preliminary`) was inserted after
Evaluation plan, shifting Risks to 1.10, Resources and schedule to 1.11, and Scope to 1.12.
Four of the twenty `§1.x` references moved (one §1.9, three §1.11) plus anchors s19, s110,
s111. All twenty re-verified semantically, all thirteen anchors confirmed to resolve.

Also in that change, and worth knowing because it is the opposite of an insertion: the
schedule went into **your existing §1.11 "Resources & schedule"** as a second slot,
`proposal.schedule`, rather than becoming a new section. Your section title already promised
a schedule and your margin note already said "answer it here, in months, not adjectives",
so the design already had the right home for it and only the content was missing. That
choice is what kept this renumber to four references instead of twenty.

**SECTION REORDER IN proposal.html, done deliberately, 2026-09-09.** Your contract says do
not reorder sections because the numbers are cross-linked. This was done anyway, **with
Jeff's explicit authorization**, because ODU's Graduate Catalog requires the dissertation
proposal to contain a literature survey section and §01 had none. A new **§1.2 Literature
survey** (`id="s12"`, slot `proposal.literature`) was inserted between Problem and Gap,
because a survey establishes command of the field and the gap asserts what is missing from
it, so the gap only reads correctly after it.

Everything from the old 1.2 through 1.10 shifted up by one, now 1.3 through 1.11. Five
surfaces were renumbered together: section `id="sNN"` anchors, rail `href="#sNN"` links,
`rail__num` and `sec__num` display numbers, the `<!-- === 1.N === -->` comments, and all
**20 `§1.x` cross-references** across approvals, landing, literature, proposal, questions
and timeline. Two references to §1.1 were correctly left alone. Each was verified to resolve
to the section it semantically means, not merely to a section that exists. If you regenerate
any of these files, you will reintroduce the old numbering and silently break those
references.

**IMPORTANT — these od/ files have been edited in place since delivery** (2026-09-09):
site name corrected everywhere ("Lifelong Learning for Snake-Form Underwater Robots"),
defence→defense, title-bar separators to middots, em dashes removed from editorial copy
per Jeff's style rule, §06 card body rewritten, approvals sections carry no new markup
but the build adds id="roster"/id="decisions". **Diff against this tree before
overwriting any file with a regenerated version.**

From the build agent, 2026-09-08, after wiring the delivered system into
https://jeffrichley.github.io/phd/ (scripts/build.mjs consumes these files per
CONTENT-CONTRACT.md). Nothing urgent; fold in whenever the design is next touched.

1. **Source `<title>` tags say "Lifelong Learning in Embodied Robotics".** The program's
   name is "Lifelong Learning for Snake-Form Underwater Robots". The build rewrites
   titles; fixing the source strings would let that override be deleted.
2. **The 360px render check is still owed** (your HANDOFF-PROMPT flagged it: no page was
   ever rendered in your sessions). It happens in Jeff's browser during content review;
   any drawer/footer misbehavior at phone width will be reported against the source files.
3. Everything else consumed cleanly: no renamed keys, drawer trio (`#navToggle`,
   `#backdrop`, `#rail`) present on all 14 rail pages in output, tpl wordmark rewritten to
   `index.html`, rail feed href rewritten to `lab-log.html`, per your docs.

## Source defects found by the 2026-09-08 adversarial generation audit
(The build works around all of these; fixing the sources would let the workarounds go.)

- `index.html` card grid has no `data-od-slot` on any `.card__foot`, so counts were
  frozen at "Empty"; the grid also stops at §08 (no §09 card). Build now rewrites feet
  and injects §09/§10 cards.
- `index.html`/`timeline.html` spines ship stale hand-built stage text with only a
  scattering of slots (3 of 8 / 4 of 14 needed); build now re-renders both wholesale.
- `landing.html` has no headline slot, no `.media` for the hero, and no `landing.cta.*`
  slots (§8.2 documents them for tpl-landing but the real landing lacks them). Its
  `public.lede` slot is itself a `<p>` (block markdown nests illegally).
- Authoring margin notes (`.note` "On this section / Awaiting you / Blocking on you…")
  and the `#runTemplate` block render as reader-visible content; build strips them.
- `od/proposal.html` rail omits the Outward group; hand-built pages have no `<footer>`
  while templates do (§8.7 says chrome matches).
- `experiments.html` filter chips: `unfilled` can never occur on a generated row;
  `queued`/`superseded` (contract vocabulary) have no chips. `literature.html` chip
  labels (Continual/Embodiment/Memory/Evaluation) match no defined thread.
- `questions.html` headings were never renamed from "Research question one/two/three";
  RQ3 carries a stray "optional" tag.
- `<title>` strings and body `<h1>`s carry "Lifelong Learning in Embodied Robotics".
  British "defence" appears at a US institution.
- CONTENT-CONTRACT.md gaps: `content/readiness.md` specified but the approvals readiness
  list is hardcoded; `content/people/` and `content/disciplines.md` (new collections)
  have no schema; `proposal.thesis` single-sentence rule and figure-`alt` rules are
  contract-only (now enforced by the build with warnings).
- `site.css` had no global `[hidden]` rule, only `table.data tr[hidden]` and
  `.feed__item[hidden]`. The filter chips and search box hide rows by setting the `hidden`
  attribute, and `.card { display: flex }` overrides the UA default, so on `questions.html`
  (9 cards) and `literature.html` (26 cards) every filter ran and hid nothing. Fixed in
  place with a global `[hidden] { display: none !important }` in the reset.
- `.prose` has no `p` margin rule of its own, so sibling `.prose` blocks inherit only the
  base `p { margin: 0 0 1em }` and `p:last-child { margin-bottom: 0 }`. On §1.7's four
  contribution blocks that measured 17px from a contribution to its own trace line and 0px
  from that trace to the next contribution, so each trace read as a heading for the block
  below it. Fixed with a slot-scoped rule; `.prose` itself is untouched because it is
  sitewide.
- The rail has no vocabulary for a page nested under a numbered section. Study write-ups are
  the argument a section's runs support rather than sections of their own, so they carry no
  section number and would otherwise sit flush with §03. Added `.rail__link--sub`, an indent
  and a narrower glyph column, generated from `content/studies/`.
- `results.html` shipped five authoring notes as permanent prose, none of them a `slot__hint`,
  so none self-erased when a plate filled. One told the author to draft the headline figure
  "even from imagined data", on the page whose job is showing real measurements. Cut in the
  source; the two reader-facing notes stay. Unfilled `.plate` divs also printed their own
  source filename as body text and captioned themselves "Figure N — — Caption pending"; the
  build now gives every unfilled plate the same `.empty` treatment the generated RQ4 panel uses.
