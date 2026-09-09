---
version: v0.1
status: draft
prepared_for: "Dr. Krishnanand Kaipa, CRAMLab, ODU MAE"
dated: 2026-09-08
subtitle: "Lifelong skill acquisition for snake-form underwater robots — embodiment as the variable, learning as the means"
risks:
  - risk: "Coursework pace, not research, gates the calendar (15 coursework credits remain)"
    likelihood: medium
    impact: high
    mitigation: "Three MAE 897 independent studies mapped onto the three remaining research pieces; MAE 899 front-loadable; 800-level offering-rotation and Plan of Study requests already in flight"
  - risk: "The thesis is falsified — transfer benefit scales with task similarity"
    likelihood: medium
    impact: medium
    mitigation: "Falsifier named before any data; the boundary result is reportable either way, and the near/far comparison is within the baseline family so it cannot be dismissed as a weak baseline"
  - risk: "Peer-review latency on the three letters"
    likelihood: high
    impact: low
    mitigation: "ODU's manuscript format gates on submission, not acceptance; submit early, arXiv on submit, up to two papers in review at once"
  - risk: "Upstream simulator API for full 6×6 added-mass coupling ships late or not at all"
    likelihood: medium
    impact: low
    mitigation: "Disclosed limitation in paper 1; the validated plugin path does not depend on it"
research_questions:
  - "Do the GPU simulators used for underwater robot learning realise the added-mass physics that undulatory propulsion depends on — and what does the approximation cost?"
  - "Is transfer benefit flat in task similarity above the shared-substrate floor, or does it scale — the pre-named falsifier?"
  - "Can certified operating envelopes let a planner refuse missions outside the skill library's coverage with the uncovered facet named, at a lower false-confidence rate than any opaque similarity threshold?"
contributions:
  - "A validation protocol and hydrodynamics plugin that make GPU-simulator added-mass physics measured rather than assumed (bias floor of force-only approximations quantified at 16–20%; plugin matches the bare engine to 0.02%)"
  - "The forward-transfer measurement across the dial/switch boundary: structured, inspectable skill memory versus nearest-skill warm-starting, on twelve acquisition targets spanning parametric and categorical task variation"
  - "Certified operating envelopes and the envelope check: coverage as set containment, missions outside the library's union refused with the uncovered facet named"
slots:
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
---
<!-- Sources: phd-lab docs/narrative/committee-narrative.md (locked #23); issue #4
     resolution (locked); ADRs 0001/0002/0003; paper 2 methodology (locked 2026-08-24);
     wayfinder #1 Notes. No number here lacks a stamped artifact behind it. -->

## Abstract

A snake-form underwater robot must acquire new skills over its working life without a
teacher at hand for each one. The standard shortcut — warm-start the new controller from
the most similar existing one — works only up to a floor set by the body: a slender
swimmer carries about three times the added mass broadside as axially (Lamb effective
mass 1.345 vs 1.115, measured on this platform), and that broadside term is the reactive
thrust of undulatory swimming itself. Gait modes are therefore distinct dynamical
regimes, not settings of one dial. This dissertation shows that an inspectable,
structured skill memory is what converts that categorical remainder into forward
transfer, and that the same structure lets a planner certify each skill's operating
envelope and refuse a mission outside it. Simulation is the apparatus; its hydrodynamic
fidelity is validated rather than assumed.

## Problem statement

A field robot with a long service life is asked to do things it was not trained for:
swim against a current it has not met, carry a payload, back out of a pipe, hold station
at a dock. Retraining from scratch each time is unaffordable; warm-starting from the
nearest existing controller is the standard shortcut. For a snake swimming in water this
shortcut has a ceiling, and the ceiling is physical.

## Stakes

If the ceiling is real and structural, every fielded undulatory platform that relies on
parameter transfer is quietly paying it: acquisition cost that looks algorithmic is
actually set by the body–fluid coupling. And a mission planner that cannot see what a
skill covers has no principled way to refuse a mission it cannot perform — it can only
guess from similarity, and similarity is exactly what the coupling breaks.

## The gap

Three pieces are missing in current practice. GPU simulators used for underwater robot
learning specify an added-mass reaction from potential-flow theory and do not realise
it — a free-body probe measures effective mass equal to dry mass — so fidelity is
assumed where it should be measured. Transfer methods for locomotion treat task
variation as one continuous axis, which the added-mass anisotropy says it is not. And
skill libraries in robotics are overwhelmingly opaque parameter stores: nothing in them
can be certified, so nothing can be refused with a reason.

## Thesis statement

In snake-form locomotion under fluid coupling, skills decompose into a shared propulsive
substrate and categorically distinct task-specific structure; opaque parameter transfer
carries only the substrate, so an inspectable, structured skill-memory is what converts
the categorical remainder into forward transfer.

## Approach

Three studies, one spine: structure buys what opacity cannot. Study 1 measures the fluid
coupling — the validation protocol, the plugin that injects Fossen-model hydrodynamics
into the solver's own force buffer, the quantified bias floor — and establishes *why*
gait modes are categorical. Study 2 cashes that structure at acquisition time: twelve
target skills spanning the dial/switch boundary, each acquired from scratch, from the
nearest skill, and scaffolded from several retrieved skills through the structured
memory. Study 3 cashes it at planning time: certified envelopes on every skill card and
an envelope check that refuses uncovered missions. The studies are linked, not merely
sequential — study 2's transfer-versus-similarity slope decides study 3's retrieval
policy.

## Evaluation plan

Preregistered before data: competence is task success ≥ 0.8 held over three consecutive
100-rollout evaluation blocks; the headline is samples-to-competence per seed. Every new
skill is warm-started from both a near source and a far source — same method, same
tuning — so the flat-versus-scaling comparison lives inside the baseline family.
Envelope certification is ten seeds × one hundred evaluations, inside iff the IQM 95%
confidence-interval lower bound is ≥ 0.8. Structural retention is reported as a floor,
never claimed as a result.

## Baselines

Learning from scratch; warm-start from the single nearest skill; and the continual-
learning family — sequential fine-tuning, CLEAR, and PackNet — alongside the structured
memory. Blend-without-residual is measured to test the mechanism claim that skill blends
fail rather than landing between their parents.

## Resources

All computation in simulation: development on a personal RTX 4060 Ti; training campaigns
on DoD HPCMP systems under written permission, tens of GPU-hours per campaign. No ODU
lab resources are required. Every paper and preprint receives a same-day government
pre-publication read before it goes out.

## Scope boundaries

No hardware and no sim-to-real claim — simulation is the apparatus, with its fidelity
validated to a stated error in study 1. A second morphology (re-parameterized undulator,
serial arm, continuum arm) is mapped as future work and not promised. Self-generated
curricula are out of scope: a self-chosen task sequence would make acquisition cost
incomparable across methods and destroy the headline measurement.
