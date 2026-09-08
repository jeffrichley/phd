---
layout: page.njk
title: Method & Platform
lead: Simulation is the apparatus — with its hydrodynamic fidelity validated, not assumed.
teaser: The sim substrate, the oscillator, dials and switches, and the envelope protocol.
order: 3
---
<!-- Sources: phd-lab CONTEXT.md § Committee-facing vocabulary; wayfinder map (#1) Notes;
     docs/adr/0002-second-morphology-stretch-ladder.md (locked 2026-08-24, #12);
     docs/narrative/committee-narrative.md (locked 2026-08-24, #23).
     Per program policy this page never discusses company quality bars. -->

## The apparatus

All work is in simulation; no hardware is claimed. That concession is stated openly
because it is backed: the first study exists to make it defensible. The platform is a
GPU-based robot-learning stack (Isaac Lab on the Newton physics backend) carrying a
custom Fossen-model hydrodynamics plugin — named `lighthill`, after the theory it
implements — that injects added-mass and damping forces into the solver's own force
buffer. The plugin matches the bare engine to 0.02% when disabled, and its added-mass
behaviour is validated against an analytic oracle by free-body probes, momentum
conservation, and the Lamb/Munk benchmarks. A measured fidelity is a strength; an assumed
one is the objection.

{% video "five_swim.mp4", "Five hydrodynamic model variants swimming the same gait — the platform's fidelity tiers raced side by side." %}

## The propulsive substrate

One limit-cycle oscillator with a shared drive generates the travelling wave along the
body — a mechanical oscillator, in the tradition of central pattern generators for
anguilliform swimming. The water's reaction to the wave is the thrust: the measured
lateral added-mass factor (1.345, against 1.115 axial) is Lighthill's reactive-thrust
term. The substrate — oscillator plus reactive thrust — is fixed by morphology and fluid,
not learned, and it is the part every skill shares. The body does part of the control.

{% video "gait_straight.mp4", "Open-loop straight-swim gait from the shared oscillator." %}

{% video "gait_dive.mp4", "The same oscillator driving a dive — 3D track with top-down inset." %}

## Dials and switches

The acquisition suite of twelve target skills is built to span a boundary:

- **Dials** — parametric task variations: current, payload, water density. Controllers
  interpolate across a dial; warm-starting works.
- **Switches** — categorically different regimes: backward swim, station-keeping, a lost
  joint, corkscrew roll. Different fluid couplings are recruited; controllers do not
  interpolate.

A suite that *contains the boundary* proves more than one built from pure switches: the
claim is about where the line falls, and the suite must be able to find it on either
side.

## What gets measured

**Acquisition (study 2).** Samples to competence for each new skill, warm-started three
ways: from scratch, from the single nearest existing skill, and scaffolded from several
retrieved skills through the structured memory. Competence is task success ≥ 0.8 held
over three consecutive hundred-rollout evaluation blocks, per seed.

**Certification (study 3).** Each skill card's **operating envelope** — a parametric
extent over the dials and a categorical membership over the switches — certified by ten
seeds × one hundred evaluations, inside if and only if the IQM confidence-interval lower
bound is at least 0.8. The term is chosen deliberately: it is what aerospace calls a
flight envelope. A mission request outside the library's union of envelopes is refused
with the uncovered facet named — an **envelope check**, not a similarity guess.

{% video "waypoints.mp4", "A trained policy on a 20-waypoint course — the kind of task-level behaviour the skill library is built from." %}

## Second morphology — future work, deliberately

A stretch ladder beyond the snake is mapped — a re-parameterized undulator, then a rigid
serial underwater manipulator, then a continuum arm — but it is future work and is not
promised in the proposal. Embodiment is the independent variable's *mechanism* here, not
a population to sample: the added-mass anisotropy and the shared oscillator explain the
substrate/structure decomposition, and the falsifier is testable with one body.

{% callout "Open decision — the bridge measurement" %}
The shipped fidelity study does not itself measure that undulation and corkscrew recruit
different couplings; today that step is physical reasoning. A per-gait added-mass
measurement on the exact-hydro oracle is queued as chapter tissue (about a day of work) to
turn the bridge sentence into a number.
{% endcallout %}
