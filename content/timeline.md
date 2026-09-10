---
# → timeline.html (§06). Sources: admin/README.md standing facts; ADR 0001 degree gates;
# wayfinder #1 Notes; #26 MAE 897 topics. The dated end-to-end schedule is deliberately
# open — no invented dates.
stages:
  - n: 9
    short: "advisory committee"
    track: program
    what: "Advisory committee formed"
    when: "—"
    state: open
    note: "Handbook §5.6 requires it before 9 semester hours, which makes it one of the earliest gates. Which ODU form records it is unsettled: the Handbook, the form's own printed title and the Kuali system name it three different ways, and the question is with Dr. Kaipa"
  - n: 1
    short: "coursework"
    track: program
    what: "Coursework foundation"
    when: "2025 → end set by the Plan of Study"
    state: active
    note: "48 credits beyond the master's (24 coursework + 24 dissertation), against ODU's 3.00 GPA requirement, which Jeff currently clears at 4.00. Fall 2026 = MAE 897 Undulatory Propulsion + MAE 899. Later terms are slotted when the [Plan of Study](timeline.html#plan-of-study) and the offering rotation land; deliberately undated here."
  - n: 10
    short: "diagnostic exam"
    track: program
    what: "Diagnostic examination"
    when: "—"
    state: open
    note: "A separate and earlier gate than the candidacy examination, and its own milestone on the DegreeWorks tracker rather than part of coursework (Handbook §5.7)"
  - n: 2
    short: "study 1"
    track: research
    what: "Study 1: fluid coupling, measured"
    when: "—"
    state: done
    note: "Complete; at the IEEE RA-L submission gate, sole author"
  - n: 3
    short: "the platform build"
    track: research
    what: "Skill-library platform build + first training campaign"
    when: "Fall 2026 (MAE 897)"
    state: open
    note: "Build tickets cut 2026-09-08; then the 10-seed baseline retrain on HPC"
  - n: 4
    short: "study 2"
    track: research
    needs: [3]
    what: "Study 2: skill acquisition across regimes"
    when: "—"
    state: open
    note: "Methodology and analysis plan preregistered 2026-08-24; runs follow the platform build"
  - n: 5
    short: "candidacy"
    track: program
    needs:
      - 1
      - gate: "paper 1 submitted"
        stages: [2]
    what: "Candidacy examination and dissertation proposal"
    when: "—"
    state: open
    note: "Gate: paper 1 submitted; papers 2, 3 and 4 locked questions + methods. The examination sits in the last coursework semester by handbook rule, and the proposal is recorded on Form D3 as a Dissertation Prospectus"
  - n: 11
    short: "dissertation committee"
    track: program
    needs: [5]
    what: "Dissertation committee formed"
    when: "—"
    state: open
    note: "Form D2, filed after passing the candidacy examination and before advancement to candidacy. At least one member comes from outside the department, which is a university catalog rule rather than an MAE one (Handbook §5.9)"
  - n: 6
    short: "study 3"
    track: research
    needs: [4]
    what: "Study 3: operating envelope (MAE 897: Envelope Certification)"
    when: "—"
    state: open
    note: "Follows study 2's trained skill cards; its retrieval policy is decided by study 2's slope"
  - n: 7
    short: "study 4"
    track: research
    needs: [2, 4]
    independent_of: [6]
    what: "Study 4: the slenderness sweep (embodiment as the variable)"
    when: "—"
    state: open
    note: "Needs studies 1 and 2 and is independent of study 3; the reasoning is in [§1.12](proposal.html#s112)"
  - n: 8
    short: "the defense"
    track: program
    needs:
      - gate: "all four papers submitted"
        stages: [2, 4, 6, 7]
    what: "Defense"
    when: "—"
    state: open
    note: "Gate: all four papers submitted; acceptance is upside, not required"
  - n: 12
    short: "acceptance and deposit"
    track: program
    needs: [8]
    what: "Dissertation acceptance, then ProQuest submission"
    when: "—"
    state: open
    note: "Form D5 records acceptance; the dissertation is then submitted to ProQuest. The program does not end at the defense (Handbook §5.17; Thesis and Dissertation Manual)"
ninety_days:
  - "Confirm paper 1 RA-L submission logged"
  - "File Form D1, the advisory committee (Dr. Kaipa + two MAE faculty)"
  - "File the [Plan of Study](timeline.html#plan-of-study)"
  - "MAE 897 build: skill-library platform per the cut tickets"
  - "Run the 10-seed baseline retrain on HPC ([exp-004](experiments.html#d004))"
---
