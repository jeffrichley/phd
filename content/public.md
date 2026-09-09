---
# → landing.html. Pitch = committee-narrative.md's locked one-paragraph pitch, with one
# deviations recorded: hedge (Jeff 2026-09-08, "predicted to be" distinct regimes until
# the bridge measurement runs) and dash-free restructuring (Jeff 2026-09-09).
headline: "Lifelong Learning for Snake-Form Underwater Robots"
cta_primary:
  label: "Read the proposal"
  href: "proposal.html"
cta_secondary:
  label: "Watch the lab feed"
  href: "notes.html"
hero_media:
  file: "assets/video/waypoints.mp4"
  caption: "A trained policy steering the snake through a 20-waypoint course in simulation."
meta:
  program: "PhD in Engineering (ME concentration), ODU"
  advisor: "Dr. Krishnanand Kaipa"
pubs:
  - id: pub-001
    status: "Complete; at the submission gate"
    html: "<strong>Validated Marine Added-Mass Dynamics for GPU Simulation: A Fossen Plugin on Isaac Lab Newton</strong>. J. E. Richley, sole author. Six-page letter targeting IEEE RA-L; through advisor review, submission pending."
code_html: 'This site and its content pipeline are public at <a href="https://github.com/jeffrichley/phd">github.com/jeffrichley/phd</a>. The research code (the simulation platform and hydrodynamics plugin) is private during publication; a code and data package accompanies each paper at submission, citing sealed artifacts only.'
contact_html: 'Jeff Richley · <span class="mono">jrich107@odu.edu</span>'
thrusts:
  - title: "The fluid coupling, measured"
    body: "GPU simulators specify added-mass physics they do not realise. This work supplies the validation protocol and a hydrodynamics plugin that closes the gap and quantifies what force-only approximations cost."
  - title: "Skill acquisition across regimes"
    body: "Fifteen target skills spanning parametric variation (current, payload, a degraded joint) and categorical regime changes (backward swim, station-keep, corkscrew). The measurement: does structured skill memory beat warm-starting from the nearest skill?"
  - title: "The operating envelope"
    body: "Every skill card carries a certified envelope; a planner refuses missions outside the library's coverage and names the uncovered facet: refusal with a reason, not a similarity guess."
---

## Pitch

A snake-form underwater robot must acquire new skills over its working life without a
teacher at hand for each one. The obvious engineering shortcut, warm-starting the new
controller from the most similar existing one, works only up to a floor set by the body.
That floor has a mechanism. A slender body carries about three times the added mass
broadside as axially (Lamb effective mass 1.345 vs 1.115, measured on the platform), and
that broadside term is the reactive thrust of undulatory swimming itself. Gait modes are
therefore predicted to be distinct dynamical regimes, not settings of one dial: lateral
undulation, corkscrew roll, and station-keeping recruit different fluid couplings, and
their controllers do not interpolate. Opaque parameter transfer carries the part every
gait shares (the oscillator driving the travelling wave and the thrust it produces) and
nothing else. This dissertation shows that an inspectable, structured skill memory is
what converts the categorical remainder into forward transfer, and that the same
structure lets a planner certify each skill's operating envelope and refuse a mission
outside it. Simulation is the apparatus; its hydrodynamic fidelity is validated rather
than assumed.
