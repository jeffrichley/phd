---
layout: page.njk
title: The Question
lead: The one sentence this dissertation defends, and the result that would prove it wrong.
teaser: The thesis claim, verbatim, with its falsifier named before any data exists.
order: 1
---
<!-- Sources: phd-lab issue #4 (thesis claim + falsifier, locked 2026-08-17);
     docs/narrative/committee-narrative.md (locked 2026-08-24, #23);
     CONTEXT.md § Committee-facing vocabulary. -->

## The claim

> In snake-form locomotion under fluid coupling, skills decompose into a shared
> propulsive substrate and categorically distinct task-specific structure; opaque
> parameter transfer carries only the substrate, so an inspectable, structured
> skill-memory is what converts the categorical remainder into forward transfer.

The body is the grammatical subject; the learning method is the means. That ordering is
deliberate: this is a claim about what a swimming body's physics does to skill reuse, and
it can come out false.

## The falsifier, named before any plot exists

**If transfer benefit scales with task similarity** — if warm-starting a new skill from a
closely related existing one reliably beats warm-starting from an unrelated one — then the
"categorical remainder" was parametric after all, plain parameter transfer is the right
tool, and the structured memory is overhead.

Naming the falsifier now, before the experiments run, is the point. A falsifier named
after the plot is a rationalization; named before, the outcome is a result either way.

## What the claim means, term by term

**Propulsive substrate.** The part of every skill set by morphology and fluid rather than
by the task: one limit-cycle oscillator drives the travelling wave along the body, and the
water's reaction to that wave is the thrust. Every gait shares it. Warm-starting *will*
beat learning from scratch — the substrate guarantees that much, and the claim concedes it
up front. The claim is that transfer cannot get past that floor.

**Categorically distinct structure.** Task variations split into **dials** and
**switches**. A dial is parametric — swim against a stronger current, carry a heavier
payload, operate in denser water. Controllers interpolate across a dial. A switch is a
different dynamical regime — swim backward, hold station, lose a joint, roll into a
corkscrew — and controllers do not interpolate across one. Operationally: transfer benefit
should be **flat in task similarity above the substrate floor**, and blends of two parent
skills should fail rather than land between their parents.

**Why the split is physical, not algorithmic.** A slender body carries roughly three times
the added mass broadside as axially — Lamb effective mass 1.345 lateral versus 1.115
axial, measured on this platform, not assumed from theory. The broadside term is
Lighthill's reactive thrust: it *is* undulatory propulsion. Different gaits recruit these
couplings differently, which is why gait modes are regimes rather than settings of one
dial — and why this is a mechanical engineering question before it is a learning question.

**Inspectable, structured skill-memory.** A library of skill cards whose contents can be
read — which task, which conditions, which operating envelope — rather than a single
opaque parameter vector. Structured, inspectable memory is now standard in production AI
systems; the dissertation asks whether that same structure buys forward transfer when the
skills are dynamical controllers under fluid coupling. The property is the contribution,
not any particular format.

## What would satisfy a skeptic

The measurement is designed so it cannot be dismissed as a weak baseline. Each new skill
is warm-started from both a *near* source and a *far* source — same method, same tuning,
different source skill — and the claim lives or dies on the shape of that comparison. If
the near source wins consistently, the thesis is falsified and the dissertation reports
that boundary honestly. The contribution is where the line falls, not that a favored
method wins.
