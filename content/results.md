---
# → results.html (§04). Figures are paper 1's actual publication figures (PNGs byte-
# identical to paper/figures/); provenance per each figure's .provenance.md sidecar.
# Figure numbers match the page's fixed plates: 1 = headline, 2–3 = RQ1 panel.
# The RQ2/RQ3/ablation plates stay honestly unfilled until those studies run.
figures:
  - n: 1
    file: figures/fig3_bias_floor_s1.png
    caption: "The headline result: force-only added-mass approximations carry a trajectory bias floor of order 16–20% for an articulated undulating body (sealed 7-point Δt-refinement study)."
    alt: "Log-log convergence plot: trajectory error versus timestep for exact-hydro and force-only arms; the force-only curves plateau at a nonzero floor instead of converging to zero."
    runs: [exp-002]
    group: headline
  - n: 2
    file: figures/fig2_gap_cost.png
    caption: "The specification–realization gap (free-body effective-mass probe: stock = dry mass; plugin = 1.115 axial / 1.345 lateral) and the cost of approximating it."
    alt: "Two-panel figure: bar comparison of measured effective mass on the stock engine versus the plugin on both body axes, alongside divergence curves quantifying the cost of force-only approximation."
    runs: [exp-000]
    group: rq1
  - n: 3
    file: figures/fig3_throughput.png
    plots: "historical curve"
    caption: "Throughput scaling on one A100 (historical path-C benchmark, July 2026). The sealed fork-on measurement is separate: 644k steps/s at 16,384 envs, ~1% below fork-off on the same commit: a viability result, with no parity claimed across solver paths."
    alt: "Log-log plot of environment steps per second versus parallel environment count, rising steadily to the tens of thousands of environments."
    runs: [exp-003]
    group: rq1
headline_numbers:
  primary_metric: "bias floor of order 16–20% (force-only approximations)"
  best_baseline: "force-buffer injection check: 0.02% match to the bare engine"
  seeds_per_cell: "deterministic Δt-refinement (7 points); statistical seeds arrive with study 2"
---
