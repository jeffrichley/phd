# Notes for the next OpenDesign session

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
