---
# → results.html (§04). Figures are paper 1's actual publication figures, copied from
# papers/underwater-hydro-fidelity/paper/figures/ with their generator provenance intact.
# Rule honored: no number on this page without a run behind it.
figures:
  - n: 1
    file: figures/fig1_architecture.png
    caption: "Plugin architecture: Fossen-model hydrodynamic forces entering the GPU solver's own force buffer."
    runs: []
    group: headline
  - n: 2
    file: figures/fig2_gap_cost.png
    caption: "The specification–realisation gap and what force-only approximation costs."
    runs: [exp-001, exp-002]
    group: rq1
  - n: 3
    file: figures/fig3_bias_floor_s1.png
    caption: "Bias floor of force-only added-mass approximations, straight swim (sealed study, n = 7)."
    runs: [exp-002]
    group: rq1
  - n: 4
    file: figures/fig3_throughput.png
    caption: "Environment throughput of the validated plugin path at scale."
    runs: [exp-003]
    group: headline
headline_numbers:
  primary_metric: "16–20% bias floor (force-only approximations)"
  best_baseline: "plugin matches bare engine to 0.02% when disabled"
  seeds_per_cell: "7 (bias-floor study)"
  compute_hours: ""
---
