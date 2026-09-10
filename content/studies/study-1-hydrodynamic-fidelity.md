---
# → study-1-hydrodynamic-fidelity.html, an unnumbered leaf linked from §01 §1.9, §03 and §04.
# Sources: this site only. Every number here is already published in §1.9, §03 or §04, and
# nothing is drawn from papers/underwater-hydro-fidelity/paper/. Paper 1 is at the IEEE RA-L
# submission gate, not accepted, and manuscript text has not had the pre-publication read.
# See phd-lab#69.
id: study-1
slug: study-1-hydrodynamic-fidelity
title: "Study 1 · Does the simulator carry the physics?"
kicker: "Study 1 · Study complete"
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

One experiment inside this study was preregistered on 2026-07-17, before any of its data
existed: a controlled comparison of three ways to handle the added-mass reaction, run on one
body with one gait family and one integrator, so that the only variable is the scheme. The
three arms are *no reaction*, in which the term is omitted entirely; *filtered reaction*, in
which a lagged and smoothed estimate of it is applied as an external force; and *exact*, the
validated treatment used as the reference.

Four predictions were written down before the runs, each stated so that a result could
contradict it:

1. The *no reaction* arm departs furthest from *exact*.
2. The *filtered reaction* arm lands strictly between *no reaction* and *exact*.
3. The *filtered reaction* arm's error grows with how aggressively the body manoeuvres, and
   is near zero on steady cruise.
4. That error is monotone in the filter constant, so heavier smoothing costs more.

The measurements were fixed alongside them: two primary, yaw rate at a fixed drive and
trajectory divergence from the *exact* arm in body lengths, and two secondary, the split
between drag and added-mass thrust and the steady cruise speed. So were the conditions:
three gaits, five values of the filter constant spanning 0.1 to 1.0 with 0.3 as the default
under test, and five seeds in every cell, with no seed to be dropped.

The reporting rule is the part that costs something. It commits in advance to publishing the
result whichever way it falls, at equal prominence, and to stating the limits of the
comparison even where they cut against this work's own interest.

The scope is exactly one experiment, and saying so is part of the same commitment. The
document that records this preregistration also forbids stretching it, so everything reported
below was gathered before that plan existed and is not covered by it. Those measurements are
not preregistered results and are not presented as any.

## What was done

Two instruments, chosen for one property: neither integrates a trajectory to reach its
answer.

### The free-body probe

It applies a known force to a single body and reads the effective mass back out, on each
axis, with nothing else running. What makes it decisive is that it cannot be argued with.
Effective mass is either the dry mass or it is not, and no tuning, controller or integrator
sits between the force and the number.

### The analytic battery

Seven rungs, each comparing against a closed-form reference or a conservation law rather
than against another simulation. The design rule was that a rung counts only if it can fail
on its own terms, so each one is listed here with what it is checked against.

<div class="table-wrap">
<table class="simple">
<caption class="sr-only">The seven rungs of the analytic validation battery and what each is compared against</caption>
<thead><tr><th scope="col">Rung</th><th scope="col">Compared against</th></tr></thead>
<tbody>
<tr><td>1 · Acceleration reaction</td><td>The closed-form acceleration of a free body under a known force, on each axis, with the off-axis terms required to be zero</td></tr>
<tr><td>2 · Velocity term</td><td>The Fossen reference for the Munk and Coriolis wrench, in planar, yawed and full three-dimensional cases. This is the rung that matches to 2 × 10⁻⁸</td></tr>
<tr><td>3 · Energy</td><td>A coasting chain, whose wet energy may drift only as the integrator's order predicts, with no source or sink</td></tr>
<tr><td>4 · Momentum</td><td>A chain driven from rest with drag disabled, required to conserve wet impulse as well as the rigid baseline does</td></tr>
<tr><td>5 · Free decay</td><td>The analytic period of a one-degree-of-freedom spring oscillation, which the added mass shifts by a known ratio</td></tr>
<tr><td>6 · Articulated force</td><td>The chain's accelerations and bias forces against the assembled added-mass Jacobian and its Kirchhoff wrench, which is rungs 1 and 2 again on a jointed body</td></tr>
<tr><td>7 · End-to-end swim</td><td>The whole gait against the oracle with drag quadrature matched on both sides. A sanity check rather than a proof, agreeing to about 0.3 percent as the timestep is refined</td></tr>
</tbody>
</table>
</div>

That design rule cost something, and the cost is on the record. An earlier comparison,
overlaying swim trajectories to look for a gap, was retracted as an instrument for this
purpose. Steady swim speed turns out to be nearly blind to the added-mass term, and the
trajectory gaps that first looked like physics traced to integrator and drag confounds
instead. Rung 7 survives as a sanity check and is not the proof. The runs are enumerated in
[§03](experiments.html), and the reasoning above is the part §03 does not carry.

## What was found

Two verdicts, and they point in opposite directions.

**The stock pipeline does not deliver the physics it specifies.** Its documentation
specifies an added-mass reaction from potential-flow theory; the free-body probe run against
it recovers effective mass equal to the dry mass, on both axes. The reaction is not
attenuated or mistuned. It is absent. Run [exp-000](experiments.html#d000).

**The plugin delivers it, and the number it delivers is the one the dissertation argues
from.** The same probe run against the plugin recovers the potential-flow coefficients for
the body, and the lateral-to-axial ratio of roughly three is the anisotropy every later
study depends on. Same run, [exp-000](experiments.html#d000), both arms measured together.

<figure>
<img src="figures/fig2_gap_cost.png" alt="Two-panel figure: bar comparison of measured effective mass on the stock engine versus the plugin on both body axes, alongside divergence curves quantifying the cost of force-only approximation.">
<figcaption><b>Figure</b> · The gap and its cost, from run <span class="mono">exp-000</span> and run <span class="mono">exp-002</span>, as published in <a href="results.html#p-rq1">§04</a>. Left, the two verdicts above as measured effective mass on each axis, stock against plugin. Right, what approximating the term costs a trajectory.</figcaption>
</figure>

Two further measurements sit under those verdicts rather than beside them.

**The validation holds where it can fail.** All seven rungs pass, and the decisive ones are
the fixed-state comparisons with no time integration in them, where the Munk and Coriolis
term matches the Fossen reference to eight decimal places. Run
[exp-001](experiments.html#d001).

**The approximation has a floor.** A seven-point timestep-refinement study puts the
trajectory bias of force-only added-mass approximations at order 16 to 20 percent for an
articulated undulating body, and the number is a floor rather than an integration artifact
because it is the plateau that survives as the timestep is refined. Run
[exp-002](experiments.html#d002), sealed at stamp `20260811T212616Z`.

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
