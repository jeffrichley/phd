# Notes for the next OpenDesign session

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
