# Notes for the next OpenDesign session

From the build agent, 2026-09-08, after wiring the delivered system into
https://jeffrichley.github.io/phd/ (scripts/build.mjs consumes these files per
CONTENT-CONTRACT.md). Nothing urgent; fold in whenever the design is next touched.

1. **Source `<title>` tags say "Lifelong Learning in Embodied Robotics".** The program's
   name is "Lifelong Learning for Snake-Form Underwater Robots". The build rewrites
   titles; fixing the source strings would let that override be deleted.
2. **The 360px render check is still owed** (your HANDOFF-PROMPT flagged it: no page was
   ever rendered in your sessions). It happens in Jeff's browser during content review;
   any drawer/footer misbehavior at phone width will be reported against the source files.
3. Everything else consumed cleanly: no renamed keys, drawer trio (`#navToggle`,
   `#backdrop`, `#rail`) present on all 14 rail pages in output, tpl wordmark rewritten to
   `index.html`, rail feed href rewritten to `lab-log.html`, per your docs.
