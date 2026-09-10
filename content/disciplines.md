---
# → generated §10 page (tpl-content). The tenets the program runs on, each tied to the
# place on this site where it is visibly in force. No aspirational rules: if a tenet
# isn't enforced somewhere checkable, it doesn't belong on this page.
kicker: "§10 · Disciplines"
title: "How this record is kept"
lead: "The rules this program runs on, each one enforced somewhere you can check, not aspirational."
# The status vocabulary, declared once. The glyph encodes POSITION, not started through done,
# and the label supplies the FAMILY: work states, decision states, evidence states. That is why
# one mark carries several words. The build checks this table against every glyph actually
# rendered across the site, so it cannot drift into being a description of what it used to be.
glyphs:
  - mark: "○"
    position: "Not started, and nothing is preventing it"
    words: "Open · Draft · Awaiting decision · Not met · Not yet selected · Comment only"
  - mark: "◇"
    position: "Not started, sequenced and waiting on something"
    words: "Planned · Queued"
  - mark: "◐"
    position: "In flight"
    words: "In progress · Running · Current · Advising"
  - mark: "●"
    position: "Done, affirmative"
    words: "Complete · Approved · Supported"
  - mark: "◑"
    position: "Done, qualified"
    words: "Approved with revisions · Approved w/ revisions · Inconclusive · Superseded"
  - mark: "✕"
    position: "Done, negative"
    words: "Failed · Refuted · Changes requested"
  - mark: "◈"
    position: "Not started, and not yet reachable"
    words: "After candidacy · Pending"
  - mark: "◌"
    position: "No state recorded, which is itself the finding"
    words: "Unfilled"
---

## Falsifiers are named before the plot

Every headline claim carries, written down in advance, the result that would prove it
wrong. The thesis claim's falsifier, *if transfer benefit scales with task similarity,
the memory is overhead*, was locked on 2026-08-17, before any transfer experiment
existed. A falsifier named after the plot is a rationalization; named before, the outcome
is a result either way. An earlier, stronger version of the claim was rejected precisely
because the task suite would have falsified it trivially.

*In force at:* [The thesis claim is locked, falsifier first](log-2026-08-17-thesis-claim-locked.html) · [§02 Questions](questions.html)

## Analysis plans are preregistered

Hypotheses, competence thresholds, seed counts, and the exact transfer comparisons for
study 2 were written down on 2026-08-24, while no confirmatory data existed. When the
numbers arrive they are judged against a plan that could not have bent to meet them.

The practice is not new to that recut. One experiment inside study 1, a controlled
comparison of added-mass approximation schemes, was preregistered on 2026-07-17 before any
of its data existed, with its hypotheses, its metrics, its seed count and its reporting rule
fixed in writing beforehand, and that reporting rule commits to publishing the outcome
whichever way it falls.

*In force at:* [Paper 2's methodology recut and preregistered](log-2026-08-24-methodology-recut.html) · [§1.8 Evaluation plan](proposal.html#s18)

## Claims cite sealed artifacts only

A number enters a manuscript only from an immutable, timestamped artifact package: a
dated, frozen data drop with the generating commit recorded. The bias-floor study is
sealed at stamp `20260811T212616Z`; the throughput study at `20260812T162510Z` against
a named commit. Re-running the code can add a new sealed package; nothing can quietly
change an old one.

*In force at:* [§03 Experiments](experiments.html): expand any completed row

## No citation without retrieved evidence

A source is cited only after the actual document has been retrieved, read, and filed:
a real PDF or a resolved registry record, never an abstract-level acquaintance. Every
entry on [§05 Literature corpus](literature.html) passed that gate before it appeared, and
several central-looking sources waited outside it until their documents were actually
read. An empty slot is honest; a plausible-looking citation that no one has read is not.

*In force at:* [§05 Literature corpus](literature.html), where the code that manages `refs.bib` is what enforces it · [lit-003](lit-003.html), Lamb (1932), which ships with no resolvable identifier because the registry holds a 1933 review of the book rather than the book: the gate refused rather than guessed

## Adversarial review comes before friendly review

Before the first paper went to the advisor, it went through a deliberate "Reviewer 2"
pass: an adversarial review hunting for overclaims, missing baselines, and
reproducibility gaps. The packet the advisor received included that review and the
disposition of every weakness it found. 

*In force at:* [Paper 1 advisor packet delivered](log-2026-08-13-advisor-packet.html)

## The record is append-only

This governs entries: the lab log, the advisor log, and the decision ledger. From the
moment an entry is published to this site's readers, it is never edited after the fact; a correction or superseding decision is a new dated entry against a named version, and the repository history is the audit trail. What you read here is what was
true when it was written, or a new dated entry saying otherwise.

The proposal document is not an entry and is not held by this rule. It is governed by
versioning instead: if the direction of the work changes, that is a new version, and
`v0.1` together with every decision recorded against it stays on the record exactly as it
was. The two rules answer different questions: one keeps the record of what happened, the
other lets the plan change without erasing what it used to say.

*In force at:* [§07 Committee &amp; approvals](approvals.html#decisions) · [§07's versioning note](approvals.html#versioning) · [§08 Advisor log](notes.html)

## Empty means not done

Nothing on this site is padded to look finished. Unfilled sections render as labeled
placeholders; a hypothesis stays **○ Open** until a preregistered run reports; a stage that
is sequenced but not started is **◇ Planned**, which is a different thing from open; a figure
plate stays empty until there is a run behind it; statuses are exact words (*drafted,
delivered, under review, submitted*), never optimistic blurs. If a surface here looks sparse, that is the state of the work, and it will fill in public.

*In force at:* [§04 Results](results.html), where plates with no run behind them render as labeled reserved slots · [§07's decision ledger](approvals.html#decisions), which reads *No decisions recorded yet*

## Two claims, two bars

The dissertation claims only what its evidence supports at the venue's bar; the
simulation platform underneath is deliberately validated beyond what any single claim
requires. That is why paper 1 exists at all: the apparatus is trusted first, and only
then is anything measured on it.

*In force at:* [§04 Results](results.html) · [Method &amp; platform, §01 Proposal](proposal.html)
