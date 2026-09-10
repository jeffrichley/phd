---
# → landing.html. Pitch = committee-narrative.md's locked one-paragraph pitch, with these
# deviations recorded: hedge (Jeff 2026-09-08, "predicted to be" distinct regimes until
# the bridge measurement runs); dash-free restructuring (Jeff 2026-09-09); and the opening
# order, which deliberately differs from §1.0 (Jeff 2026-09-09); and one added sentence on
# generality (Jeff 2026-09-09).
#
# The added sentence is the one before "Simulation is the apparatus". The paragraph named
# studies 1 through 3 and left the generality question unanswered exactly where a reader
# forms it: everything after "realized on the platform" concerns that platform, so whether
# any of it holds for a different body had no answer here. Thrust card 02 was already titled
# "across bodies" with nothing behind it. Jeff's wording, phd-lab#56.
#
# The opening order is a decision, not drift. §1.0 was inverted to lead with the added-mass
# measurement (phd-lab#32) because its reader is a fluid dynamicist who already owns added
# mass. This page's reader is unknown, so it keeps the learning problem first and earns the
# physics with "That floor has a mechanism". Do not harmonise them. See phd-lab#44.
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
    html: "<strong>Validated Marine Added-Mass Dynamics for GPU Simulation: A Fossen Plugin on Isaac Lab Newton</strong>. J. E. Richley, sole author. Six-page letter targeting IEEE RA-L; with the advisor for his read, submission pending."
code_html: 'This site and its content pipeline are public at <a href="https://github.com/jeffrichley/phd">github.com/jeffrichley/phd</a>. The research code (the simulation platform and hydrodynamics plugin) is private during publication; a code and data package accompanies each paper at submission, citing sealed artifacts only.'
contact_html: 'Jeff Richley · <span class="mono">jrich107@odu.edu</span>'
thrusts:
  - title: "The fluid coupling, measured"
    covers: [rq1]
    body: "GPU simulators specify added-mass physics they do not realize. This work supplies the validation protocol and a hydrodynamics plugin that closes the gap and quantifies what force-only approximations cost."
  - title: "Skill acquisition across regimes and across bodies"
    covers: [rq2, rq4]
    body: "Fifteen target skills spanning parametric variation (current, payload, a degraded joint) and categorical regime changes (backward swim, station-keep, corkscrew). The measurement: does structured skill memory beat warm-starting from the nearest skill? The same question is then asked across bodies of differing shape, so the answer is a property of the architecture rather than of one robot."
  - title: "The operating envelope"
    covers: [rq3]
    body: "Every skill card carries a certified envelope; a planner refuses missions outside the library's coverage and names the uncovered facet: refusal with a reason, not a similarity guess."
---

## Pitch

A snake-form underwater robot must acquire new skills over its working life without a
teacher at hand for each one. The obvious engineering shortcut, warm-starting the new
controller from the most similar existing one, works only up to a floor set by the body.
That floor has a mechanism. A slender body carries about three times the added mass
broadside as axially (Lamb effective mass 1.345 vs 1.115, realized on the platform), and
that broadside term is the reactive thrust of undulatory swimming itself. Gait modes are
therefore predicted to be distinct dynamical regimes, not settings of one dial: lateral
undulation, corkscrew roll, and station-keeping recruit different fluid couplings, and
their controllers do not interpolate. Opaque parameter transfer carries the part every
gait shares (the oscillator driving the traveling wave and the thrust it produces) and
nothing else. This dissertation shows that an inspectable, structured skill memory is
what converts the categorical remainder into forward transfer, and that the same
structure lets a planner certify each skill's operating envelope and refuse a mission
outside it. Because the floor belongs to the body, the body becomes the last variable: the
same measurements run across a slenderness sweep and out to a swimmer that makes thrust by a
different mechanism, so what the structure buys is a property of the architecture rather than
of one robot. Simulation is the apparatus; its hydrodynamic fidelity is validated rather
than assumed.
