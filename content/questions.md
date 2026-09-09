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
    short: "What predicts where the boundary falls"
    question: "Does a body's added-mass anisotropy predict where the categorical boundary between gait regimes falls?"
    motivation: "RQ2 asks whether transfer benefit is flat in task similarity or scales. This asks what predicts the scaling, which turns a measured effect into a mechanism. A slenderness sweep makes the lateral-to-axial ratio a continuous independent variable rather than a fixed property of one robot."
    hypotheses:
      - id: H4.1
        statement: "The cross-regime transfer penalty, measured as additional samples-to-competence relative to within-regime transfer, scales with the difference in lateral-to-axial added-mass ratio between source and target body. Predicted direction: greater anisotropy produces sharper regime separation and a larger penalty."
        status: open
        evidence: []
      - id: H4.2
        statement: "The relationship established across the anguilliform sweep predicts regime structure for a carangiform body whose thrust is foil-dominated. Falsifier: it does not, which bounds the result to reactive-thrust swimmers and is reported as that bound."
        status: open
        evidence: []
---
