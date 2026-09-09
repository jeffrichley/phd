---
name: update-progress-site
description: >-
  Use when changing anything on Jeff's advisor-facing progress site
  (jeffrichley.github.io/phd) — adding a lab-log entry, experiment run, committee
  decision, meeting note, or person profile; updating a paper or hypothesis status;
  promoting a library source to §05; refreshing volatile facts; or publishing/deploying
  the site. Also use when asked how the site is built or why a page renders wrong.
---

# Updating the progress site

The site is the **published record** of the PhD: Krishna and the committee read it.
Everything here serves two masters — the OpenDesign contract (`od/CONTENT-CONTRACT.md`,
authoritative for schemas and slot mechanics) and the program's honesty disciplines
(`content/disciplines.md`, published on the site itself as §10). When in doubt, the
disciplines win.

## How it builds

`content/*.md` → `scripts/build.mjs` (fills labeled slots in the `od/` HTML, generates
the §09 feed) → `_site/` → push to `main` → GitHub Action deploys to Pages. Edit
`content/` for anything that is content; edit `od/*.html` directly for design-copy fixes
(wrong wording, style rules) and log each in-place edit in `od/NOTES-FOR-OPEN-DESIGN.md`;
edit `scripts/build.mjs` only for rendering logic. Never patch page copy with build-time
string replaces (brittle, Jeff-rejected 2026-09-09) and never edit `_site/` (regenerated
every build). Style rule: no em dashes in prose (commas, colons, periods, parentheses);
exceptions are verbatim quotes, "—" empty-value markers, and "Figure N —" prefixes.

## The review gate

**Nothing new reaches the live site until Jeff has read the rendered text.** Draft →
build → show Jeff the built page or the exact prose → he approves → push. Lab notes are
*retellings* of the paperwright notebooks written for the advisor, never a raw pipe of
agent-facing notebook prose. Once an entry has been published, it is append-only: a
correction is a new dated entry, not an edit.

## Adding content

Schemas live in `od/CONTENT-CONTRACT.md` §3–§4 — copy them exactly. Locations:

| What happened | File | Notes |
|---|---|---|
| Result, finding, decision, milestone | `content/log/YYYY-MM-DD-slug.md` | Tag from the closed set result·decision·milestone·finding; excerpt written once in frontmatter |
| Experiment run | `content/experiments/exp-###.md` | Only sealed/stamped numbers; seeds means seeds — a Δt sweep is not "n seeds" |
| Advisor meeting | `content/notes/YYYY-MM-DD-slug.md` | `[x]` prefix on an action marks it done |
| Committee decision | `content/decisions/YYYY-MM-DD-slug.md` | Append-only ledger; outcome ∈ approved·revisions·changes·comment |
| Person confirmed on committee | `content/people/<slug>.md` | Only after they have agreed to serve; every fact sourced; no photo until Jeff supplies one |
| New literature entry | see **Promoting a source** below | |

## Hard rules (each is enforced on the site — breaking one breaks a published tenet)

- **No invented values.** A number, date, or citation you cannot trace to a source stays
  a `—`. Statuses are exact words (drafted · delivered · under review · submitted).
- **Verbatim means verbatim.** The thesis claim (issue phd-lab#4) is quoted character-
  exact wherever it appears. A condensed quote never claims to be verbatim.
- **Boundaries.** The company, its sim-to-real bar, agent names (Pepper, Wren, OKF), and
  unconfirmed committee names never appear. Gov pre-publication read is mentioned only
  as a step, never the arrangement behind it.
- **noindex** survives every change, on every page including new templates.

## Volatile facts — check on every substantive update

These go stale silently; each names its source of truth. Cumulative numbers in prose
always carry "as of <month year>".

| Fact | Where it appears | Re-verify against |
|---|---|---|
| GPU-hours total | proposal §1.9 | `phd-lab/admin/code-provenance-*.md` (newest) |
| Paper 1 status | overview strip, timeline, landing pub band | Jeff directly — the ladder record went stale once already |
| Course plan / credit arithmetic | proposal risk 1, timeline stage 1, 08-24 note | Newest DegreeWorks audit + phd-lab#27 (open 3-credit gap) — present as "settles with the Plan of Study" until #27 closes |
| Advisor-decision strip + delivery dates | `content/overview.md` | Jeff |
| Committee roster | approvals, people/ | Only people who have said yes |
| Run/hypothesis/entry counts | index cards, status strip | Derived by the build — never hand-edit |

## Promoting a source to §05 Related work

The program library (`phd-lab/library/`: notes + PDFs + refs.bib) is the integrity gate —
**no `lit-###.md` without a retrieved, verified document behind it.** To promote:
1. Confirm the source has a library note and PDF (or resolved registry record).
2. Write `content/literature/lit-###.md` per contract §4: thread a–d, `does` (steel-manned),
   and the required `stops` sentence — what the work does *not* do; the proposal's gap
   statement is assembled from these.
3. Review gate, then publish.

## Publishing

```
node scripts/build.mjs     # must end with zero WARN lines — a WARN is a defect, fix it
git add … && git commit && git push   # Action deploys; verify with gh run watch
```

Spot-check after deploy: the changed page renders, `noindex` present, no `slot__key`
text visible. The adversarial-audit disposition history lives in git log if a rule's
origin is unclear.
