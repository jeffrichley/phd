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
  - risk: "Peer-review latency on the four letters"
    likelihood: high
    impact: low
    mitigation: "ODU's manuscript format gates on submission, not acceptance; submit early, arXiv on submit, up to two papers in review at once"
  - risk: "Upstream simulator API for full 6×6 added-mass coupling ships late or not at all"
    likelihood: medium
    impact: low
    mitigation: "Disclosed limitation in paper 1; the validated plugin path does not depend on it"
  - risk: "The slenderness sweep shows no relationship between anisotropy and where the regime boundary falls"
    likelihood: medium
    impact: low
    mitigation: "The direction is predicted in advance, so a null is a reportable bound rather than a missing result: it would say embodiment sets a level but not a structure, which fails the mechanism claim while leaving the generality claim standing. The two are separable by design. Study 4 is also the last of the four and carries no other study's dependency"
  - risk: "Generating bodies across the aspect-ratio range is harder than a configuration change in the existing rig"
    likelihood: medium
    impact: medium
    mitigation: "Unconfirmed and stated as such rather than assumed away. The sweep's analytic ground truth (Tuckerman ellipsoid inertia factors, already cited by study 1's validation protocol) holds whatever the generation cost, so the design does not depend on the answer; the number of bodies does, and is left open until it is known"
research_questions:
  - "Do the GPU simulators used for underwater robot learning realise the added-mass physics that undulatory propulsion depends on, and what does the approximation cost?"
  - "Is transfer benefit flat in task similarity above the shared-substrate floor, or does it scale? That is the pre-named falsifier."
  - "Can certified operating envelopes let a planner refuse missions outside the skill library's coverage with the uncovered facet named, at a lower false-confidence rate than any opaque similarity threshold?"
  - "Does the structured-memory advantage hold across bodies of differing shape, and does a body's added-mass anisotropy predict where the categorical boundary between gait regimes falls? The first half asks whether the result is a property of the architecture or of one robot; the second asks what predicts the scaling RQ2 measures."
contributions:
  - "A validation protocol and hydrodynamics plugin that make GPU-simulator added-mass physics measured rather than assumed. The measurements themselves, and what they establish about feasibility, are in §1.9."
  - "The forward-transfer measurement across the dial/switch boundary: structured, inspectable skill memory versus nearest-skill warm-starting, on fifteen acquisition targets spanning parametric and categorical task variation"
  - "Certified operating envelopes and the envelope check: coverage as set containment, missions outside the library's union refused with the uncovered facet named"
  - "The result shown to be a property of the architecture rather than of one robot: a slenderness sweep that tests whether the structured-memory advantage holds across bodies of differing shape, and whether added-mass anisotropy predicts where the categorical boundary between gait regimes falls, with a carangiform body run out of family to locate the mechanism's bound"
slots:
  Abstract: proposal.abstract
  Problem statement: proposal.problem
  Stakes: proposal.problem.stakes
  Literature survey: proposal.literature
  The gap: proposal.gap
  Thesis statement: proposal.thesis
  Approach: proposal.approach
  Evaluation plan: proposal.evaluation
  Baselines: proposal.evaluation.baselines
  Preliminary results: proposal.preliminary
  Resources: proposal.resources
  Schedule: proposal.schedule
  Scope boundaries: proposal.scope
---
<!-- Sources: phd-lab docs/narrative/committee-narrative.md (locked #23); issue #4
     resolution (locked); ADRs 0001/0002/0003; paper 2 methodology (locked 2026-08-24);
     wayfinder #1 Notes. No number here lacks a stamped artifact behind it. -->

## Abstract

A slender swimmer carries about three times the added mass broadside as axially, Lamb
effective mass 1.345 against 1.115, measured on this platform. That broadside term is not a
drag correction; it is the reactive thrust of undulatory swimming itself. Gait modes are therefore predicted to be
distinct dynamical regimes, not settings of one dial, a prediction the second study tests
directly. A snake-form underwater robot that must acquire new skills over its working life,
without a teacher at hand for each one, pays for that prediction directly: the standard
shortcut, warm-starting the new controller from the most similar existing one, works only
up to a floor the body sets. This dissertation shows that an inspectable, structured skill
memory is what converts that categorical remainder into forward transfer, and that the same
structure lets a planner certify each skill's operating envelope and refuse a mission
outside it. Simulation is the apparatus; its hydrodynamic fidelity is validated rather than
assumed.

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

## Literature survey

**Hydrodynamic fidelity in learning simulators.** Fossen (2011) supplies the specification
every underwater simulator works from: a six-degree-of-freedom vectorial model whose terms
are added mass, the added-mass Coriolis effect known as the Munk moment, damping, and the
restoring wrench. Lamb (1932) supplies the analytic ground truth for the added-mass
coefficients themselves, derived from potential flow for an idealised body. Recent GPU
learning platforms adopt that specification directly. MarineGym (Chu et al., 2025) is the
closest existing system to this work's platform, a per-link Fossen plugin reaching roughly
250,000 frames per second on a single GPU, and MuJoCo's fluid model (Google DeepMind,
2026) documents an added-mass term with an explicit acceleration reaction drawn from the
same theory. What none of them does is check the specification against the ground truth.
MarineGym never validates its force model analytically and never exercises an articulated
swimmer, and MuJoCo's documentation nowhere states whether the specified reaction is
actually realised as effective mass, so a reader of the documentation has no way to tell.
Across this thread fidelity is asserted rather than measured.

**Anguilliform propulsion and pattern generation.** Two classical theories divide the
field. Taylor (1952) treats each body element as feeling the quasi-steady drag of a
cylinder at the same speed and inclination, which makes thrust velocity-dependent and
contains no acceleration reaction anywhere. Lighthill (1971) extends elongated-body theory
to arbitrary amplitude and locates thrust in the reactive force between the undulating body
and the water it accelerates, which makes lateral added mass the propulsion term itself.
Modern computation settles the question for this regime: Daghooghi et al. (2025), using
wall-resolved large-eddy simulation, find that pressure around an anguilliform swimmer
scales with theoretical fluid acceleration, confirming added mass as the main propulsion
mechanism. On the control side, Matsuoka (1985) proves that mutually inhibiting neurons
with adaptation sustain oscillation, giving the standard locomotion oscillator its
mathematical basis, and Ijspeert et al. (2007) show a single spinal pattern generator under
one scalar descending drive producing both swimming and walking on a real robot, with an
abrupt switch between gaits rather than a blend. That last result is the closest published
evidence that gait modes are discrete regimes. What this thread does not contain is
learning. Ijspeert's repertoire is wired by hand, the drive only selects among behaviours
the designer built, and nothing is acquired, retained, or transferred.

**Transfer and continual learning for locomotion.** Continual World (Wołczyk et al., 2021)
established the benchmark and the vocabulary, twenty sequential manipulation tasks with
formal metrics for forward transfer and forgetting. The methods it evaluates fall into two
families this work adopts as baselines. Replay, represented by CLEAR (Rolnick et al.,
2019), mixes new experience with a uniform buffer and behavioural cloning and virtually
eliminates forgetting. Parameter isolation, represented by PackNet (Mallya and Lazebnik,
2018), prunes and freezes weights per task and achieves zero forgetting by construction.
Dohare et al. (2024) supply the failure mode both families must survive, showing that
networks under continual training progressively lose the ability to learn at all. More
recent robot systems push past stability toward reuse: GOLLUM (Srisuchinnawong and
Manoonpong, 2025) has a physical hexapod acquire several locomotion skills in about an hour
and combine learned skills to bootstrap new ones, LEGION (Meng et al., 2025) accumulates
skills on a real arm with zero measured forgetting, and Expert Composer (Christmann et al.,
2024) transitions smoothly between independently trained quadruped experts. In all of it
embodiment is held constant and task variation is parametric. Continual World's authors
explicitly scope transfer to low-level weight and feature reuse, and no method in the
thread conditions on the physics of the medium the robot moves through.

**Structured skill memory.** Voyager (Wang et al., 2024) is the canonical growing library,
storing every verified behaviour as an executable program in a retrievable store and
discovering several times more of its environment than prior methods. LOTUS (Wan et al.,
2024) is the strongest robot-side version, accumulating skills discovered from unsegmented
demonstrations and composing them through a meta-controller. On the language side, MemGPT
(Packer et al., 2023) gives a fixed-context model self-managed external storage, and
HippoRAG 2 (Gutiérrez et al., 2025) argues that a growing external memory is itself a form
of continual learning, since retrieval adapts a system without modifying its weights. Hu et
al. (2026) supply the counterpoint this dissertation has to answer: external memory does
not remove the stability and plasticity tradeoff, it relocates it into retrieval. What is
stored across this thread is text or code. Voyager's skills are programs over a high-level
game interface and its authors state plainly that they are not solving the sensorimotor
control problem, LOTUS selects over an opaque embedding and composes at execution time
rather than to make acquisition cheaper, and none of these memories holds a dynamical
controller.

**What the four leave open.** Read in order, the threads converge on one untested question.
The physics says the fluid coupling is the propulsion mechanism, and that gaits built on it
switch rather than blend. The transfer literature assumes task variation lies on one
continuous axis, which is exactly what the physics denies. The memory literature shows that
inspectable, structured stores buy real capability, but only where the stored item is text
or a program, and the one robot library that composes does so from an opaque store and at
execution time rather than at acquisition. And the simulator literature means any study
attempting to settle this must first show its apparatus reproduces the coupling rather than
assuming it. No published work asks whether an inspectable, structured skill memory buys
forward transfer when the skills are dynamical controllers under fluid coupling. That is
the question this dissertation takes up. The corpus behind this survey, with each source's
contribution and the specific limit it reaches, is browsable in
[§05](literature.html).

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

Four studies, one spine: structure buys what opacity cannot. Study 1 measures the fluid
coupling (the validation protocol, the plugin that injects Fossen-model hydrodynamics
into the solver's own force buffer, the quantified bias floor) and establishes *why*
gait modes are categorical. Study 2 cashes that structure at acquisition time: fifteen
target skills spanning the dial/switch boundary, each acquired from scratch, from the
nearest skill, and scaffolded from several retrieved skills through the structured
memory. Study 3 cashes it at planning time: certified envelopes on every skill card and
an envelope check that refuses uncovered missions. Study 4 varies the body itself: a
slenderness sweep across anguilliform bodies of differing added-mass anisotropy, same gait
family, which makes the lateral-to-axial ratio a continuous independent variable rather
than a fixed property of one robot. One carangiform body, where thrust is foil-dominated
rather than whole-body reactive, is run last and deliberately out of family. The studies
are linked, not merely sequential: study 2's transfer-versus-similarity slope decides
study 3's retrieval policy, and study 4 asks what predicts that slope.

## Evaluation plan

Preregistered before data: competence is task success ≥ 0.8 held over three consecutive
100-rollout evaluation blocks; the headline is samples-to-competence per seed. Every new
skill is warm-started from both a near source and a far source, with the same method and
tuning, so the flat-versus-scaling comparison lives inside the baseline family.
Envelope certification is ten seeds × one hundred evaluations, inside iff the IQM 95%
confidence-interval lower bound is ≥ 0.8.

Study 4 is evaluated on the same apparatus, with the body as the independent variable.
Each body in the slenderness sweep has its lateral-to-axial added-mass ratio measured by
the study 1 protocol before any learning, so the independent variable is measured rather
than nominal, and Tuckerman's ellipsoid inertia factors give an analytic expectation at
every aspect ratio to check that measurement against. H4.1 is the generality
test and it comes first, because an advantage that is a property of the reference body
rather than of the architecture is not a thesis: the study 2 comparison is rerun on every
body in the sweep, and the hypothesis fails if the advantage's confidence interval includes
or falls below zero on any of them. H4.2 is the mechanism test, regressing the cross-regime
transfer penalty, the additional samples-to-competence relative to within-regime transfer,
on the difference in that ratio between source and target body, with the predicted
direction stated in advance. Its falsifier is the same shape as H2.1's one level up: study
2 asks whether the effect is flat in the task, study 4 asks whether it is flat in the body,
and a flat result here would mean embodiment sets a level but not a structure, which fails
the mechanism claim while leaving H4.1 standing. H4.3 is a held-out prediction rather than
a fit: the relationship is estimated across the anguilliform bodies only, then used to
predict regime structure for the carangiform body, which is run last and never enters the
estimate. A prediction interval that fails to cover the carangiform result bounds the
mechanism to whole-body reactive thrust rather than to fluid coupling generally, and that
bound is the reported outcome.

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

## Preliminary results

Study 1 is complete and at the IEEE RA-L submission gate. Its role in this proposal is not
to be counted as finished work but to establish that the apparatus can measure what the
remaining two studies need measured.

A free-body probe on the stock GPU pipeline recovers effective mass equal to dry mass,
which is to say the added-mass reaction the simulator specifies is not realised at all.
With the hydrodynamics plugin active, the same probe recovers 1.115 axial and 1.345
lateral, matching the potential-flow coefficients for the body. A seven-rung analytic
battery, built from fixed-state force comparisons, conservation checks and free decay
rather than from integrated trajectories, passes on every rung, with the added-mass
Coriolis term matching the Fossen reference to 2 × 10⁻⁸. A sealed timestep-refinement study
puts the trajectory bias floor of force-only approximations at order 16 to 20 percent, a
plateau that survives as the timestep is refined and is therefore a floor rather than an
integration artifact. The injection path itself costs about 1 percent of throughput against
the same build with the fork disabled, and matches the bare engine to 0.02 percent, which
validates the plumbing rather than the physics.

What this buys the proposed work is interpretability, not a result. Study 2 measures whether
transfer benefit is flat or scaling in task similarity, and that measurement is only
meaningful if the simulator reproduces the fluid coupling that makes some task variation
categorical in the first place. On a platform that specifies added mass and does not realise
it, a flat slope would be indistinguishable from an artifact of the apparatus. Study 1
removes that alternative explanation before the acquisition experiments begin, which is the
sense in which it demonstrates feasibility. Every number above traces to a sealed artifact
package and is browsable with its run in [§03](experiments.html) and
[§04](results.html).

## Resources

All computation in simulation: development on a personal RTX 4060 Ti; training campaigns
on DoD HPC allocations, tens of GPU-hours total as of September 2026. No ODU
lab resources are required. Every paper and preprint receives a same-day or next-day government
pre-publication read before it goes out.

## Schedule

Two clocks run on this degree and this section states both rather than averaging them.
Coursework is calendar-locked and partly known. Research milestones are given relative to
the approval of this proposal, written T0, because the approval date is not yet knowable and
a calendar date for it would be invented rather than estimated.

**On the calendar.** Study 1 is complete and at the IEEE RA-L submission gate. Fall 2026
is MAE 897 Undulatory Propulsion and MAE 899, and it carries the skill-library platform
build and the first ten-seed training campaign. Fifteen coursework
credits remain beyond it. Which terms carry the rest depends on the Plan of Study. The
department does not publish an 800-level offering rotation beyond the current term, so
remaining courses are placed as offerings are announced, and the MAE 897 independent studies
are scheduled with my advisor rather than against a departmental calendar. Handbook §5.8
places the candidacy examination in the last coursework semester, so the proposal date is
set by when coursework ends rather than by when the research is ready.

**Relative to approval.** Study 2's acquisition campaign completes by roughly T0 plus two to
three months, and its analysis and manuscript by roughly T0 plus five. Study 3 begins from
study 2's certified skill cards, since its retrieval policy is decided by the slope study 2
measures, and reaches submission by roughly T0 plus eight to nine. Study 4 runs on the
apparatus study 1 already validated and depends on no other study's output, so it is
schedulable against compute rather than against a predecessor; it is placed last because it
is the least constrained, not because it is least important, and reaches submission by
roughly T0 plus eleven to twelve. The defense follows once all four manuscripts are
submitted, which is the ODU gate rather than acceptance.

**On the size of those intervals.** Study 1 went from the platform's first commit to a
consistency-passed manuscript in about thirteen days. The intervals above are budgeted well
above that rate, deliberately, because studies 2 and 3 are experimental campaigns rather
than single analyses: study 2 alone measures fifteen acquisition targets across seven
methods, at ten seeds and no fewer than three stream orderings. The remaining research is on
the order of six to nine months of working time. Calendar span is longer, because the degree
is part-time and the coursework track runs alongside rather than pausing.

Against the eight-year limit, which runs from a January 2025 start to January 2033, this
uses a fraction of the time available. The binding constraint on the schedule is coursework
scheduling rather than research throughput.

## Scope boundaries

No hardware and no sim-to-real claim: simulation is the apparatus, with its fidelity
validated to a stated error in study 1. A second morphology (re-parameterized undulator,
serial arm, continuum arm) is mapped as future work and not promised. Self-generated
curricula are out of scope: a self-chosen task sequence would make acquisition cost
incomparable across methods and destroy the headline measurement.
