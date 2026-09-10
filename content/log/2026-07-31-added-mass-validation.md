---
title: "The swim was the wrong instrument: the added-mass fork passes the right one"
date: 2026-07-31
tag: finding
covers: exp-001
excerpt: A trajectory-overlay comparison got retracted as evidence; in its place, a seven-rung analytic battery (force comparisons, conservation checks, free decay), and the fork passes all seven.
---
<!-- Source: anguilla docs/investigations/2026-07-31-added-mass-fork-validation/
     (README §3 reframe, §4 retractions, §7 gap decomposition, §8 citation rules). -->

This investigation began as a swim-trajectory comparison (run the forked solver and
the analytic oracle on the same gait and overlay the paths), and its most important
result was realising that comparison proves nothing. Steady swim speed is nearly blind
to the added-mass term, and the historical trajectory "gaps" decomposed entirely into
integrator and drag confounds, not physics. The earlier "fork matches oracle" reading
was **retracted in the investigation's own record**, so it is never repeated, here or
anywhere.

What replaced it is the right instrument: a seven-rung analytic battery built from
direct force comparisons at fixed states (no time integration to confound), momentum
and energy conservation checks, and free-decay tests. The fork passes all seven rungs;
the Munk/Coriolis term, the named prime suspect, matches the Fossen reference to
2×10⁻⁸. The end-to-end swim survives only as a sanity check (~0.3% with matched drag as
Δt→0), never as the proof.

{% video "four_way_wet_dry.mp4", "Four-way path diagnostic (fork on/off × wet/dry), used to chase a wiggle confound, not as validation evidence." %}

The battery became the spine of paper 1's evidence chain, and the retraction became a
working rule: name the instrument's blind spots before citing it.
