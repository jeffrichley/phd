---
layout: page.njk
title: The Plan
lead: Three contributions, one thesis — and how they become an ODU manuscript-based dissertation.
teaser: The three-paper arc, the chapter map, and the publication strategy.
order: 2
---
<!-- Sources: phd-lab docs/narrative/committee-narrative.md (locked 2026-08-24, #23);
     docs/adr/0003-chapter-map-manuscript-based-structure.md (locked 2026-08-24, #25);
     docs/adr/0001-publication-preprint-strategy.md (locked 2026-08-21, #11);
     issue #4 resolution ("why it is true of all three contributions"). -->

## The arc

One spine runs through all three studies: **structure buys what opacity cannot.** The
first study measures the fluid coupling that makes gait modes categorical; the second
cashes that structure at acquisition time; the third cashes it at planning time.

### Contribution 1 — the fluid coupling, measured

*IEEE RA-L; complete, at the submission gate; sole author.*

GPU simulators used for underwater robot learning specify an added-mass reaction from
potential-flow theory and do not realise it: a free-body probe measures effective mass
equal to dry mass. This paper supplies the validation protocol (Lamb effective mass,
Munk-moment ratio, momentum conservation), a Fossen hydrodynamics plugin that enters the
solver's own force buffer and matches the bare engine to 0.02%, and a quantified bias
floor of 16–20% for force-only approximations. The measured anisotropy — lateral 1.345,
axial 1.115 — is Lighthill's reactive-thrust term. It is the reason undulation and roll
are different regimes, and it is what makes the second and third studies a question about
the body rather than about an algorithm.

### Contribution 2 — skill acquisition across regimes

*IEEE RA-L planned (ICRA/IROS presentation option); methodology locked, build under way.*

Twelve acquisition targets span the boundary between dials (current, payload, density —
parametric, where warm-starting works) and switches (backward swim, station-keep, lost
joint, corkscrew — categorical, where it does not). The headline measurement is forward
transfer: samples to competence when a new skill is scaffolded from several retrieved
skills through the structured memory, against warm-starting from the single nearest
skill. The falsifier from [The Question](/question/) is tested here. Structural retention
is reported as a floor, never claimed as the result.

### Contribution 3 — the operating envelope

*IEEE RA-L planned (ICRA/IROS presentation option); question locked, follows study 2.*

Each skill card carries a certified operating envelope: a parametric extent over the
dials and a categorical membership over the switches, certified by ten seeds × one
hundred evaluations. A language-conditioned planner performs an envelope check on every
requested mission and refuses one that falls outside the library's union, naming the
uncovered facet. Coverage is set containment. The two later studies are linked rather
than sequential: study 2's transfer-versus-similarity slope *decides* study 3's retrieval
policy — the earlier chapter derives the later one's design.

## How the papers become the dissertation

ODU's manuscript-based format (Thesis & Dissertation Manual, Fall 2025) puts the papers
in as **appendices**, as published, and asks the body to argue. The body is narrative and
deliberately thin — on the order of 60–80 pages:

| Chapter | Holds |
|---|---|
| **1 — Introduction & Background** | The field, the problem, the thesis claim and its falsifier, the literature, how three studies cover the claim |
| **2 — Apparatus** | The platform, once: snake embodiment, oscillator + policy learning, the two-tier hydro substrate, the acquisition suite and the dial/switch split, the envelope protocol |
| **3 — Study 1: fluid coupling** | Critical review of Appendix A, plus the bridge measurement that ties the measured anisotropy to gait modes |
| **4 — Study 2: skill acquisition across regimes** | Review of Appendix B: the forward-transfer result and what its slope decides for chapter 5 |
| **5 — Study 3: operating envelope** | Review of Appendix C |
| **6 — Discussion & Conclusion** | Summative synthesis; future work, including a second morphology as future work only |
| **Appendices A–C** | The three papers as published, each behind the manual's front page with documented re-use permission |

The formal dissertation proposal borrows this structure directly: it is **chapters 1 and 2
written for real**, plus one-page plans for chapters 3–5 with study 1 as the preliminary
result. Nothing is written twice.

## Publication strategy

All three papers target **IEEE RA-L** as primary venue; papers 2 and 3 keep an ICRA/IROS
conference-presentation option. ODU permits chapters that are submitted and under review
at defense — **submission is the gate, not acceptance** — so the plan is submit early,
preprint on arXiv in the same window, and run up to two papers in review at once. Every
paper and every preprint gets a government pre-publication read before it goes out;
turnaround is same-day, so it is a step, not a schedule constraint. Paper 1 is sole
author; papers 2–3 are planned with Dr. Kaipa as co-author.

**Degree gates:** candidacy requires paper 1 submitted with papers 2–3 as locked questions
and methods; the defense requires all three submitted.

{% callout "Open decision — advisory committee" %}
The Form D1 advisory-committee slate (Dr. Kaipa plus two MAE faculty) is settled in
principle and being formed now; the dissertation committee proper (Form D2, with its
outside-department seat) is a post-candidacy decision. Both are tracked openly rather
than presented as done.
{% endcallout %}
