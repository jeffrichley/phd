---
# → landing.html. Pitch adapted (condensed) from committee-narrative.md's locked
# one-paragraph pitch — NOT verbatim; the full physics paragraph lives on index/proposal.
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
thrusts:
  - title: "The fluid coupling, measured"
    body: "GPU simulators specify added-mass physics they do not realise. This work supplies the validation protocol and a hydrodynamics plugin that closes the gap — and quantifies what force-only approximations cost."
  - title: "Skill acquisition across regimes"
    body: "Fifteen target skills spanning parametric variation (current, payload, a degraded joint) and categorical regime changes (backward swim, station-keep, corkscrew). The measurement: does structured skill memory beat warm-starting from the nearest skill?"
  - title: "The operating envelope"
    body: "Every skill card carries a certified envelope; a planner refuses missions outside the library's coverage and names the uncovered facet — refusal with a reason, not a similarity guess."
---

## Pitch

A snake-form underwater robot must acquire new skills over its working life without a
teacher at hand for each one. The obvious engineering shortcut — warm-start the new
controller from the most similar existing one — works only up to a floor set by the
body. That floor has a mechanism, this program measures it, and the dissertation shows
what converts it into forward transfer: an inspectable, structured skill memory whose
operating envelopes a planner can certify and refuse against. Simulation is the
apparatus; its hydrodynamic fidelity is validated rather than assumed.
