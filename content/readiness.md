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
  - condition: "Every claim in §1.3 points at the thread in §05 that establishes it"
    met: true
    evidence: "All three claims link to their thread, and the links are keyed on the thread's id so renaming one cannot strand them. Counted on the rendered section between the §1.3 and §1.4 headings, which is where the zero was measured."
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
    met: true
    evidence: "Cut at v0.1, dated 2026-09-10. The number stays v0.1 because nothing has a decision recorded against it yet; the date is when the version was cut, not when it is sent. §01's header carries both."
---
