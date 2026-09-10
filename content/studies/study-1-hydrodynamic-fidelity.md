---
# → study-1-hydrodynamic-fidelity.html, an unnumbered leaf linked from §01 §1.9, §03 and §04.
# Sources: this site only. Every number here is already published in §1.9, §03 or §04, and
# nothing is drawn from papers/underwater-hydro-fidelity/paper/. Paper 1 is at the IEEE RA-L
# submission gate, not accepted, and manuscript text has not had the pre-publication read.
# See phd-lab#69.
id: study-1
slug: study-1-hydrodynamic-fidelity
title: "Study 1 · Does the simulator carry the physics?"
kicker: "Study 1 · Complete"
lead: "The argument the runs support: what was asked, what was measured, and what the measurement does not buy."
status: done
bearing_on: [rq1]
runs: [exp-000, exp-001, exp-002, exp-003]
---

## What was asked

GPU simulators used for underwater robot learning specify an added-mass reaction from
potential-flow theory. [RQ1](questions.html#rq1) asks two things about that specification:
whether it is realised, and what the approximation costs when it is not.

The question is not incidental to the dissertation. The broadside added-mass term is
Lighthill's reactive thrust, which is to say it is undulatory propulsion rather than a
correction applied to it. A platform that specifies the term and does not deliver it trains
every gait against the wrong physics, and the error is structured rather than random.

## What was preregistered

The scheme comparison inside this study was preregistered on 2026-07-17, before any of its
data existed. Its hypotheses, its metrics, its seed count and its reporting rule were fixed
in writing in advance, and the reporting rule commits to publishing the outcome whichever way
it falls, at equal prominence.

The scope is stated exactly, because the same document that records the preregistration also
forbids stretching it: the rest of this study's evidence was gathered before that plan
existed and is not retroactively covered by it. The measurements reported below are not
preregistered results and are not presented as any.

## What was done

Two instruments, chosen for one property: neither integrates a trajectory to reach its answer.

The first is a free-body probe. It applies a known force and reads the effective mass back
out, on each axis, with nothing else running. What makes it decisive is that it cannot be
argued with. Effective mass is either the dry mass or it is not, and no tuning, controller or
integrator sits between the force and the number.

The second is an analytic battery of fixed-state force comparisons, conservation checks and
free decay, each rung compared against a closed-form reference rather than against another
simulation. The design rule was that a rung counts only if it can fail on its own terms.

That rule cost something, and the cost is on the record. An earlier comparison, overlaying
swim trajectories to look for a gap, was retracted as an instrument for this purpose. Steady
swim speed turns out to be nearly blind to the added-mass term, and the trajectory gaps that
first looked like physics traced to integrator and drag confounds instead. The end-to-end
swim survives as a sanity check and is not the proof. The runs are enumerated in
[§03](experiments.html), and the reasoning above is the part §03 does not carry.

## What was found

Three measurements, each traceable to its run.

**The specification is not realised.** On the stock pipeline the probe recovers effective
mass equal to dry mass on both axes; with the plugin active it recovers the potential-flow
coefficients for the body, and the lateral-to-axial ratio of roughly three is the anisotropy
the rest of the dissertation argues from. Run [exp-000](experiments.html#d000), figure in
[§04](results.html#p-rq1).

**The validation holds where it can fail.** All seven rungs pass, and the decisive ones are
the fixed-state comparisons with no time integration in them, where the Munk and Coriolis
term matches the Fossen reference to eight decimal places. Run
[exp-001](experiments.html#d001).

**The approximation has a floor.** A seven-point timestep-refinement study puts the
trajectory bias of force-only added-mass approximations at order 16 to 20 percent for an
articulated undulating body, and the number is a floor rather than an integration artifact
because it is the plateau that survives as the timestep is refined. Run
[exp-002](experiments.html#d002), figure in [§04](results.html), sealed at stamp
`20260811T212616Z`.

The plugin's practicality is a separate claim and is scoped as one: the injection path costs
about one percent of throughput against the same build with it disabled and matches the bare
engine to 0.02 percent, which validates the plumbing and says nothing about the physics. Run
[exp-003](experiments.html#d003).

## What it means, and what it does not

This study does not argue for the dissertation's thesis. It removes an alternative
explanation before the experiments that do.

[Study 2](questions.html#rq2) measures whether transfer benefit is flat or scaling in task
similarity. That measurement is only interpretable if the simulator reproduces the fluid
coupling that makes some task variation categorical in the first place. On a platform that
specifies added mass and does not realise it, a flat slope would be indistinguishable from an
artifact of the apparatus, and the result would mean nothing either way. What study 1 buys
the proposed work is interpretability, not a result, and that is the whole of its role in
[§1.9](proposal.html#s19).

Where it stops is worth stating as plainly as the findings.

It is a simulation result and makes no sim-to-real claim. The bias floor is measured for an
articulated undulating body, which is the regime this dissertation works in and not the
regime every force-only implementation targets; a rigid vehicle that neither undulates nor
manoeuvres violently is a different case and this study does not measure it. The seven-rung
battery establishes that the plugin agrees with closed-form references at fixed states, which
is a narrower claim than agreeing with water. And the throughput figure is a viability
result on one solver path, with no parity claimed against any other.

The study also does not measure the claim the dissertation most wants from it. That
undulation and corkscrew roll recruit different fluid couplings is physical reasoning from
the measured anisotropy, not a measurement, and it is named as reasoning wherever it appears.

## Provenance

Every number above is published elsewhere on this site and links to it. The runs are
[exp-000 through exp-003](experiments.html), the figures are in
[§04](results.html), and the consequence for the proposal is
[§1.9](proposal.html#s19). Sealed artifact stamps `20260811T212616Z` and
`20260812T162510Z` name the frozen packages the claims are read from; the throughput
measurement is stamped against a named commit of the simulator.

Paper 1 is at the IEEE RA-L submission gate and is not accepted. Nothing on this page is
drawn from the manuscript.
