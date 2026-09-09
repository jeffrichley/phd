---
# Sources: issue #4 resolution (locked); paper 1 sealed claims (checkpoint 2026-08-11);
# paper 2 methodology + analysis plan (locked 2026-08-24); wayfinder #8 (paper 3 carve).
questions:
  - id: rq1
    short: "Does the simulator carry the physics?"
    question: "Do the GPU simulators used for underwater robot learning realise the added-mass physics that undulatory propulsion depends on, and what does the approximation cost?"
    motivation: "The broadside added-mass term is Lighthill's reactive thrust: it is undulatory propulsion. If the simulator does not carry it, every learned gait is trained against the wrong physics, and the error is structured, not noise."
    hypotheses:
      - id: H1.1
        statement: "Stock GPU pipelines specify an added-mass reaction but do not realise it: a free-body probe measures effective mass equal to dry mass."
        status: supported
        evidence: [exp-000, exp-001]
      - id: H1.2
        statement: "Force-only added-mass approximations carry an irreducible trajectory bias floor of 16–20% for an articulated undulating body."
        status: supported
        evidence: [exp-002]
  - id: rq2
    short: "Transfer benefit: flat or scaling?"
    question: "Is transfer benefit flat in task similarity above the shared-substrate floor, or does it scale?"
    motivation: "This is the thesis claim's named falsifier, tested within the baseline family: each new skill is warm-started from both a near and a far source, same method and tuning. Scaling benefit means the remainder was parametric and the memory is overhead."
    hypotheses:
      - id: H2.1
        statement: "Transfer benefit (reduction in samples-to-competence vs scratch) is flat in task similarity above a shared-substrate floor."
        status: open
        evidence: []
      - id: H2.2
        statement: "Blends of two parent skills fail rather than landing between their parents (measured with the compose operator's blend step, residual off)."
        status: open
        evidence: []
      - id: H2.3
        statement: "Retention is structural: the structured memory's backward transfer on earlier skills is ≈ 0, within one confidence-interval half-width of the skill's own retained success, and strictly better than every continual-learning baseline."
        status: open
        evidence: []
  - id: rq3
    short: "Certified envelopes and refusal"
    question: "Can certified operating envelopes let a planner refuse missions outside the library's coverage, naming the uncovered facet, at a lower false-confidence rate than an opaque similarity threshold?"
    motivation: "Coverage as set containment is checkable; similarity has no principled yes/no. The falsifier is a similarity-threshold sweep that matches the inspectable memory's false-confidence rate."
    hypotheses:
      - id: H3.1
        statement: "The envelope check's false-confidence rate is below every point on the opaque similarity-threshold sweep."
        status: open
        evidence: []
  - id: rq4
    short: "Does it hold across bodies, and what predicts the boundary"
    question: "Does the structured-memory advantage hold across bodies of differing shape, and does a body's added-mass anisotropy predict where the categorical boundary between gait regimes falls?"
    motivation: "The first half is the generality claim: study 2 establishes the advantage on one body, and an advantage that is a property of that body rather than of the architecture is not a thesis. The second half is the mechanism: RQ2 asks whether transfer benefit scales, and this asks what predicts the scaling. A slenderness sweep makes the lateral-to-axial ratio a continuous independent variable rather than a fixed property of one robot."
    hypotheses:
      - id: H4.1
        statement: "The structured-memory advantage over nearest-skill warm-starting, established on the reference body in study 2, holds on every body in the sweep. Falsifier: on any body the advantage's confidence interval includes or falls below zero, which would mean the advantage was a property of the reference body rather than of the architecture."
        status: open
        evidence: []
      - id: H4.2
        statement: "The magnitude of that advantage, and the cross-regime transfer penalty it offsets, scale with the difference in lateral-to-axial added-mass ratio between source and target body. Predicted direction: greater anisotropy difference produces a larger penalty and a larger structured-memory advantage. Falsifier: the penalty is flat in anisotropy difference, or scales in the opposite direction. Flat means embodiment sets a level but not a structure, and the mechanism claim fails while H4.1 can still stand."
        status: open
        evidence: []
      - id: H4.3
        statement: "The relationship estimated across the anguilliform sweep, which the carangiform body never enters, predicts that body's regime structure. Falsifier: the prediction interval fails to cover the carangiform result, which bounds the mechanism to whole-body reactive thrust rather than to fluid coupling generally, and is reported as that bound."
        status: open
        evidence: []
---
