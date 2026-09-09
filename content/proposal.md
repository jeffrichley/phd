---
version: v0.1
status: draft
prepared_for: "Dr. Krishnanand Kaipa, CRAMLab, ODU MAE"
dated: 2026-09-08
subtitle: "Lifelong skill acquisition for snake-form underwater robots: embodiment as the variable, learning as the means"
risks:
  - risk: "Coursework pace, not research, gates the calendar (15 coursework credits remain)"
    likelihood: medium
    impact: high
    mitigation: "MAE 897 independent studies ride the dissertation's own research pieces; MAE 899 is front-loadable; the Plan of Study (requests in flight) settles the remaining course slots and the 800-level arithmetic"
  - risk: "The thesis is falsified: transfer benefit scales with task similarity"
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
  - "Do the GPU simulators used for underwater robot learning realise the added-mass physics that undulatory propulsion depends on, and what does the approximation cost?"
  - "Is transfer benefit flat in task similarity above the shared-substrate floor, or does it scale? That is the pre-named falsifier."
  - "Can certified operating envelopes let a planner refuse missions outside the skill library's coverage with the uncovered facet named, at a lower false-confidence rate than any opaque similarity threshold?"
contributions:
  - "A validation protocol and hydrodynamics plugin that make GPU-simulator added-mass physics measured rather than assumed (bias floor of force-only approximations quantified at 16–20%; plugin matches the bare engine to 0.02%)"
  - "The forward-transfer measurement across the dial/switch boundary: structured, inspectable skill memory versus nearest-skill warm-starting, on fifteen acquisition targets spanning parametric and categorical task variation"
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
teacher at hand for each one. The standard shortcut, warm-starting the new controller from
the most similar existing one, works only up to a floor set by the body: a slender
swimmer carries about three times the added mass broadside as axially (Lamb effective
mass 1.345 vs 1.115, measured on this platform), and that broadside term is the reactive
thrust of undulatory swimming itself. Gait modes are therefore predicted to be distinct
dynamical regimes, not settings of one dial, a prediction the second study tests
directly. This dissertation shows that an inspectable,
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
skill covers has no principled way to refuse a mission it cannot perform; it can only
guess from similarity, and similarity is exactly what the coupling breaks.

## The gap

Three pieces are missing in current practice. GPU simulators used for underwater robot
learning specify an added-mass reaction from potential-flow theory and do not realise
it (a free-body probe measures effective mass equal to dry mass), so fidelity is
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
coupling (the validation protocol, the plugin that injects Fossen-model hydrodynamics
into the solver's own force buffer, the quantified bias floor) and establishes *why*
gait modes are categorical. Study 2 cashes that structure at acquisition time: fifteen
target skills spanning the dial/switch boundary, each acquired from scratch, from the
nearest skill, and scaffolded from several retrieved skills through the structured
memory. Study 3 cashes it at planning time: certified envelopes on every skill card and
an envelope check that refuses uncovered missions. The studies are linked, not merely
sequential: study 2's transfer-versus-similarity slope decides study 3's retrieval
policy.

## Evaluation plan

Preregistered before data: competence is task success ≥ 0.8 held over three consecutive
100-rollout evaluation blocks; the headline is samples-to-competence per seed. Every new
skill is warm-started from both a near source and a far source, with the same method and
tuning, so the flat-versus-scaling comparison lives inside the baseline family.
Envelope certification is ten seeds × one hundred evaluations, inside iff the IQM 95%
confidence-interval lower bound is ≥ 0.8.

Retention is a qualifying property here, not a contribution. A method that loses earlier
skills as it acquires new ones is not a serious candidate, so the design removes that
failure mode by construction: stored cards are frozen and each new skill is a bounded
residual on top of them, so nothing that already works is overwritten. That is verified
rather than asserted. Backward transfer, the change in performance on earlier skills
after later ones are acquired, is measured per run and tested against every
continual-learning baseline. The preregistered bound is ≈ 0, defined as a backward-transfer
magnitude no larger than one confidence-interval half-width of the skill's own retained
success, and the measured value is reported with it. The falsifier is written down: the
result fails if the structured memory's backward-transfer interval reaches the level of
sequential fine-tuning or replay. The headline remains forward transfer, because retention
obtained by construction is not evidence for the thesis. What is genuinely uncertain, and
what the study is built to decide, is whether structure buys cheaper acquisition.

## Baselines

The direct precedents are the current generation of skill-library agents. LOTUS retrieves
from an opaque embedding store; GOLLUM grows a library of separately trained columns and
reuses them by transferring weights. Both define a skill as this work does, a separately
learned and separately stored module, and both are measured on forward transfer rather
than on forgetting. Neither can state why a given prior skill was selected, and that
inspectability is the property under test.

Both mechanisms are measured, not merely cited. GOLLUM-style opaque reuse is instantiated
as the warm-start baseline: the same oracle selection and the same tuning as the
structured memory, but the whole policy is initialised from the nearest source's weights.
It is the baseline to beat. LOTUS-style opaque selection is held as a control here, where
retrieval is an oracle, so the acquisition result is not confounded by retrieval quality;
whether selection is load-bearing at all is measured by a random-selection ablation, and
solving retrieval is study 3. Learning from scratch is the denominator, and the
continual-learning family, sequential fine-tuning, CLEAR, and PackNet, runs alongside as
the monolithic-gradient comparison and supplies the forgetting floor the retention check
reads against.

Two further measurements test the mechanism rather than the outcome: a warm-start
substitution, which swaps the composed base for the single nearest source and separates
structured reuse from reuse in general, and blend-without-residual, which tests whether
skill blends fail rather than landing between their parents.

## Resources

All computation in simulation: development on a personal RTX 4060 Ti; training campaigns
on DoD HPC allocations, tens of GPU-hours total as of September 2026. No ODU
lab resources are required. Every paper and preprint receives a same-day or next-day government
pre-publication read before it goes out.

## Scope boundaries

No hardware and no sim-to-real claim: simulation is the apparatus, with its fidelity
validated to a stated error in study 1. A second morphology (re-parameterized undulator,
serial arm, continuum arm) is mapped as future work and not promised. Self-generated
curricula are out of scope: a self-chosen task sequence would make acquisition cost
incomparable across methods and destroy the headline measurement.
