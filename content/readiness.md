---
# → §07's proposal readiness gate. od/approvals.html has claimed since it was built that these
# statuses come from this file; it did not exist and the build never read it, so all six
# rendered "Not met" because there was no data rather than because the work was undone.
#
# Each condition carries the evidence for its verdict and the scope of the check that produced
# it, so a later reader can re-run the check rather than trusting the mark. `met: false` is not
# a placeholder here: two are genuinely open and both are owned by a ticket.
conditions:
  - condition: "Thesis sentence (§1.4) is one sentence and could be false"
    met: true
    evidence: "§1.4 is a single sentence, and the falsifier beneath it names the result that would refute it."
  - condition: "Every claim in §1.3 points at an entry in §05"
    met: false
    evidence: "§1.3 contains no links to the corpus. Counted on the rendered section between the §1.3 and §1.4 headings. Owned by phd-lab#88."
  - condition: "Each contribution in §1.7 maps to an evaluation in §1.8"
    met: true
    evidence: "Every contribution carries its question and where it is tested, and a contribution that traces to neither warns at build time."
  - condition: "§1.10 names at least one risk that cannot be fully mitigated"
    met: true
    evidence: "Two rows qualify: the thesis being falsified, and the slenderness sweep returning a null. Neither is preventable, and both rows say what makes the outcome reportable anyway."
  - condition: "§1.12 says clearly what the dissertation is not"
    met: true
    evidence: "No hardware and no sim-to-real claim; morphology is bounded to swimming bodies, with the reason the mechanism claim has no purchase beyond them."
  - condition: "Version number cut and dated"
    met: false
    evidence: "The document is still v0.1 and the cut is Jeff's own act. Owned by phd-lab#46."
---
