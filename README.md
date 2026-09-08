# phd — progress site

Advisor-facing progress site for Jeff Richley's ODU MAE PhD: the dissertation plan as an
argument, plus a lab-notes feed the advisor can watch over time.

Live at **https://jeffrichley.github.io/phd** (noindex; link-only in practice — see
`docs/adr/0001-public-by-link-with-noindex.md`).

- Content is hand-authored Markdown in `src/`, drafted from locked sources in the
  [phd-lab](https://github.com/jeffrichley/phd-lab) program repo and review-gated by Jeff.
- Built with Eleventy v3; deployed to GitHub Pages by `.github/workflows/deploy.yml` on
  every push to `main`.
- Look and feel comes from OpenDesign templates in `src/_layouts/` + `src/assets/tokens.css`.
  Until those land, plain placeholder layouts expose the same content slots.

```
npm install
npm run serve   # local dev at localhost:8080/phd/
npm run build   # emits _site/
```

This is the research program's first non-research sibling repo (see phd-lab `REPOS.md`).
Spec and plan: `docs/superpowers/`.
