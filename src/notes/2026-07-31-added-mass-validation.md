---
title: The added-mass force is real, and the fork that carries it holds up
date: 2026-07-31
tag: finding
excerpt: A four-way validation — added mass on/off, wet/dry — shows the forked solver reproducing the analytic oracle's trajectories, and shows what force-only approximations miss.
---
<!-- Source: anguilla docs/investigations/2026-07-31-added-mass-fork-validation/ -->

The platform's central physics question was whether the added-mass reaction — the water's
inertia pushing back on the body's acceleration — could be carried inside the GPU solver
itself rather than approximated as an external force. This investigation ran the forked
solver against an analytic oracle four ways: added mass on and off, in water and dry.

{% video "four_way_wet_dry.mp4", "Four-way comparison: solver fork with added mass on/off, wet and dry, against the analytic oracle." %}

The overlay result: with the added-mass term active, the fork's trajectories track the
oracle; with it off, the body swims measurably differently on the same gait and the same
drag. That difference is not a tuning artifact — it is the reactive thrust term doing
work, and it is the physical basis for the dissertation's claim that gait modes are
distinct dynamical regimes.

{% video "oracle_vs_fork_swim.mp4", "Oracle vs fork, same gait — trajectory overlay." %}

This validation became the spine of paper 1's evidence chain.
