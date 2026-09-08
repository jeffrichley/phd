# 0001 — Public-by-link with noindex

Status: accepted (Jeff, 2026-09-08, grilling session)

## Context

The advisor needs a URL he can open by 2026-09-15. The program carries a standing
condition: every paper and preprint gets a government pre-publication read before it goes
out. Whether a proposal-level website triggers that condition is undecided, and the
program's own convention treats committee-facing material as private by default
(phd-lab `admin/README.md`: "This repo is private. That is why student records can live
here."). A public website would be the program's first public artifact.

## Decision

Host on public GitHub Pages (`jeffrichley.github.io/phd`), shared by link, with
`<meta name="robots" content="noindex">` on every page. The site is treated as
**not published** — link-only in practice — until Jeff settles whether the
pre-publication read applies, or runs the site through that read once.

## Alternatives rejected

- **Access-controlled hosting** (Cloudflare Access, private Pages): real protection, but
  new infrastructure and login friction for committee members, in a one-week window.
- **Fully indexed public site**: forecloses the pre-publication-read question instead of
  deferring it. Publishing cannot be undone.

## Consequences

- The repo itself is public; nothing sensitive (student records, admin correspondence)
  may ever land in it. Those stay in phd-lab, which is private.
- Reversal path when the site is cleared to be truly public: delete the meta tag.
- The layouts must keep the noindex meta through the OpenDesign template swap — it lives
  in the base layout head, and any replacement head must carry it.
