---
layout: landing.njk
hero: waypoints.mp4
heroCaption: A trained policy steering the snake through a 20-waypoint course in simulation — 3D view and top-down trace.
---
<!-- Source: phd-lab docs/narrative/committee-narrative.md (locked 2026-08-24, #23) — "One paragraph" verbatim. -->

A snake-form underwater robot must acquire new skills over its working life without a
teacher at hand for each one. The obvious engineering shortcut — warm-start the new
controller from the most similar existing one — works only up to a floor set by the body.
That floor has a mechanism. A slender body carries about three times the added mass
broadside as axially (Lamb effective mass 1.345 vs 1.115, measured on the platform), and
that broadside term is the reactive thrust of undulatory swimming itself. Gait modes are
therefore distinct dynamical regimes, not settings of one dial: lateral undulation,
corkscrew roll, and station-keeping recruit different fluid couplings, and their
controllers do not interpolate. Opaque parameter transfer carries the part every gait
shares — the oscillator driving the travelling wave and the thrust it produces — and
nothing else. This dissertation shows that an inspectable, structured skill memory is what
converts the categorical remainder into forward transfer, and that the same structure lets
a planner certify each skill's operating envelope and refuse a mission outside it.
Simulation is the apparatus; its hydrodynamic fidelity is validated rather than assumed.
