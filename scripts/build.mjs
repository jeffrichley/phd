// Build: pour content/ into the OpenDesign pages (od/) per od/CONTENT-CONTRACT.md,
// generate the §09 Lab log from the tpl-feed templates, emit a flat static site to _site/.
// Contract rules honored here: slot fill = innerHTML replace + slot→prose class swap;
// unfilled slots stay; unfilled repeat items are deleted and the .empty note unhidden;
// resting-shape records are replaced entirely; no invented values (missing = —);
// status is always glyph + word; noindex on every page.
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import matter from "gray-matter";
import { marked } from "marked";

const OD = "od", OUT = "_site", C = "content";
const warn = (...a) => console.warn("WARN:", ...a);
const read = (f) => fs.readFileSync(f, "utf8");
const page = (f) => cheerio.load(read(path.join(OD, f)));
const mdFile = (f) => matter(read(f));
const md = (s) => marked.parse(s.trim());
const mdInline = (s) => marked.parseInline(s.trim());
const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const SITE_NAME = "Lifelong Learning for Snake-Form Underwater Robots";
const BUILD_DATE = new Date().toISOString().slice(0, 10);
// checklist item honoring the data-done mechanic: "[x] " prefix marks done, and the
// attribute, glyph, and sr-only prefix always change together (contract §7)
const checkItem = (raw) => {
  const done = /^\[x\]\s*/i.test(raw);
  const text = raw.replace(/^\[x\]\s*/i, "");
  return `<li data-done="${done}"><span class="checklist__mark" aria-hidden="true">${done ? "✓" : "○"}</span><span class="checklist__text"><span class="sr-only">${done ? "Done. " : "Open. "}</span>${mdInline(text)}</span></li>`;
};

const STATUS = {
  open: ["○", "Open"], planned: ["○", "Planned"], pending: ["○", "Pending"],
  active: ["◐", "In progress"], running: ["◐", "Running"], queued: ["○", "Queued"],
  done: ["●", "Complete"], supported: ["●", "Supported"], approved: ["●", "Approved"],
  inconclusive: ["◑", "Inconclusive"], revisions: ["◑", "Approved w/ revisions"],
  refuted: ["✕", "Refuted"], failed: ["✕", "Failed"], changes: ["✕", "Changes requested"],
  superseded: ["◑", "Superseded"], unfilled: ["◌", "Unfilled"],
};
const statusSpan = (state, word) => {
  const [glyph, defWord] = STATUS[state] ?? STATUS.unfilled;
  return `<span class="status" data-state="${state}"><span class="status__glyph" aria-hidden="true">${glyph}</span>${word ?? defWord}</span>`;
};

function fillSlot($, key, html, { keepClasses = false } = {}) {
  const el = $(`[data-od-slot="${key}"]`);
  if (!el.length) { warn(`slot not found: ${key}`); return; }
  el.html(html);
  if (!keepClasses && el.hasClass("slot")) {
    el.removeClass("slot slot--inline slot--tall").addClass("prose");
  }
}

// ---------- load content ----------
const proposal = mdFile(`${C}/proposal.md`);
const questions = mdFile(`${C}/questions.md`).data.questions;
const overview = mdFile(`${C}/overview.md`).data;
const timelineC = mdFile(`${C}/timeline.md`).data;
const publicC = mdFile(`${C}/public.md`);
const committee = mdFile(`${C}/committee.md`).data;
const results = mdFile(`${C}/results.md`).data;
const threads = mdFile(`${C}/literature/_threads.md`).data.threads;
const listDir = (d, filter = (f) => f.endsWith(".md") && !f.startsWith("_")) =>
  fs.existsSync(d) ? fs.readdirSync(d).filter(filter).sort().map((f) => ({ file: f, ...mdFile(path.join(d, f)) })) : [];
const experiments = listDir(`${C}/experiments`);
const advisorNotes = listDir(`${C}/notes`);
const decisions = listDir(`${C}/decisions`);
const logEntries = listDir(`${C}/log`)
  .map((e) => ({ ...e, slug: e.file.replace(/\.md$/, ""), date: e.data.date instanceof Date ? e.data.date.toISOString().slice(0, 10) : String(e.data.date) }))
  .sort((a, b) => b.date.localeCompare(a.date) || b.file.localeCompare(a.file)); // newest first, stable
const allHypotheses = questions.flatMap((q) => q.hypotheses);
const openHypotheses = allHypotheses.filter((h) => h.status === "open").length;
const supportedHypotheses = allHypotheses.filter((h) => h.status === "supported").length;
const disciplinesC = mdFile(`${C}/disciplines.md`);
const tenetCount = (disciplinesC.content.match(/^## /gm) ?? []).length;
const litEntries = listDir(`${C}/literature`, (f) => /^lit-\d+\.md$/.test(f));

// ---------- output scaffold ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const dir of ["css", "js"]) fs.cpSync(path.join(OD, dir), path.join(OUT, dir), { recursive: true });
fs.cpSync("assets/video", path.join(OUT, "assets/video"), { recursive: true });
fs.cpSync("figures", path.join(OUT, "figures"), { recursive: true });

const FEED_INDEX = "lab-log.html";
const entryHref = (slug) => `log-${slug}.html`;

function finish($, name) {
  // global path rewrites + invariants
  $('a[href="tpl-feed-index.html"]').attr("href", FEED_INDEX);
  $('a[href="tpl-landing.html"]').attr("href", "index.html"); // tpl wordmark → internal front door
  $("title").text($("title").text().replace(/Lifelong Learning in Embodied Robotics/g, SITE_NAME).replace(/\{\{[^}]*\}\}.*$/, SITE_NAME).replace(/ — /g, " · "));
  // strip OD authoring scaffolding that renders as visible content
  $(".note").each((_, el) => {
    if (/^(On this section|Awaiting you|Blocking on you|Dependency|Test)\b|Rows are generated|content\/|data-done|the build /.test($(el).text().trim()))
      $(el).remove();
  });
  const runTpl = $("#runTemplate");
  // NOTE: closest("section") is safe only because od/experiments.html's sole <section>
  // wraps nothing but this scaffolding block; revisit if OD restructures the page.
  if (runTpl.length) (runTpl.closest("section").length ? runTpl.closest("section") : runTpl.parent()).remove();
  // authoring copy outside .note elements: pipeline descriptions and resting-shape captions
  $("section").each((_, el) => { if ($(el).text().includes("CONTENT-CONTRACT")) $(el).remove(); });
  $("p").each((_, el) => {
    const t = $(el).text();
    if (/resting shape|data-od-slot|CONTENT-CONTRACT/.test(t) || /content\/(proposal|experiments|notes|decisions|results|committee|log|questions|timeline)/.test(t)) $(el).remove();
  });
  $(".pagehead__meta span").each((_, el) => { if ($(el).text().includes("content/")) $(el).remove(); });
  // meta description: drop moustache residue (callers set real descriptions first)
  $('meta[name="description"]').each((_, el) => {
    if (/\{\{/.test($(el).attr("content") ?? "")) $(el).remove();
  });
  // §10 Disciplines joins "The process" in every rail, directly after §09
  const labLink = $('#rail a[href="lab-log.html"]').first();
  if (labLink.length && !$('#rail a[href="disciplines.html"]').length) {
    const cur = name === "disciplines.html" ? ' aria-current="page"' : "";
    if (cur) $("#rail a").removeAttr("aria-current");
    labLink.after(`\n      <a class="rail__link" href="disciplines.html"${cur}><span class="rail__num">§10</span><span>Disciplines</span></a>`);
  }
  // every rail carries the Outward group (od/proposal.html omits it)
  if ($("#rail").length && !$('#rail a[href="landing.html"]').length) {
    $("#rail").append(`\n    <div class="rail__group"><p class="rail__label">Outward</p><a class="rail__link" href="landing.html"><span class="rail__num">↗</span><span>Public page</span></a></div>`);
  }
  // footer slots on generated pages; hand-built pages get a matching footer appended (§8.7)
  $('[data-od-slot="site.footer.line"]').text("Jeff Richley · ODU MAE PhD · advisor Dr. Krishnanand Kaipa");
  $('[data-od-slot="site.footer.updated"]').text(BUILD_DATE);
  if (!$("footer").length && name !== "landing.html") {
    $("body").append(`\n<footer class="sitefoot"><div class="sitefoot__inner"><span>Jeff Richley · ODU MAE PhD · advisor Dr. Krishnanand Kaipa</span><span class="mono">Updated ${BUILD_DATE}</span></div></footer>`);
  }
  if (!$('meta[name="robots"][content="noindex"]').length) warn(`${name}: missing noindex`);
  if (name !== "landing.html") // landing intentionally keeps its standalone .landnav chrome
    for (const sel of ["#navToggle", "#backdrop", "#rail"]) if (!$(sel).length) warn(`${name}: missing ${sel}`);
  const html = $.html()
    .split("Lifelong Learning in Embodied Robotics").join(SITE_NAME)
    .replace(/\bdefence\b/g, "defense").replace(/\bDefence\b/g, "Defense")
    // Jeff's style rule applied to kept OD editorial copy
    .replace("precisely where it stops — that boundary is the gap", "precisely where it stops; that boundary is the gap")
    .replace("Not a decision — a note for the record", "Not a decision, a note for the record")
    .replace("you disagreed with too — six months on", "you disagreed with too; six months on")
    .replace("after the fact — the commit history is the", "after the fact; the commit history is the");
  fs.writeFileSync(path.join(OUT, name), html);
}

// ---------- index.html (§00) ----------
{
  const $ = page("index.html");
  fillSlot($, "overview.thesis", mdInline(overview.thesis));
  fillSlot($, "overview.next_milestone", mdInline(overview.next_milestone));
  // status strip: match by label
  $(".stat").each((_, el) => {
    const k = $(el).find(".stat__k").text().trim();
    const v = $(el).find(".stat__v");
    if (k === "Advisor decision") {
      // the status pill doesn't wrap: short word in the pill, detail on a small line below
      const [word, ...rest] = String(overview.status_strip.advisor_decision).split(" — ");
      v.html(statusSpan("open", word) + (rest.length ? `<br><span class="small muted">${rest.join(" — ")}</span>` : ""));
    }
    if (k === "Experiments logged") v.html(`<span class="mono">${experiments.length}</span>`);
    if (k === "Open hypotheses") v.html(`<span class="mono">${openHypotheses}</span>`);
  });
  // pagehead meta: the dashes are known facts
  $(".pagehead__meta > span").each((_, el) => {
    const label = $(el).text().trim().split(/\s/)[0];
    const v = { Program: overview.meta?.program, Advisor: overview.meta?.advisor, Committee: overview.meta?.committee, Updated: BUILD_DATE }[label];
    if (!v) return;
    // Committee and Advisor link straight to their sections; no scrolling to find them
    if (label === "Committee") $(el).html(`${label} <a class="mono" href="approvals.html#roster">${v}</a>`);
    else if (label === "Advisor") $(el).html(`${label} <a class="mono" href="people-krishnanand-kaipa.html">${v}</a>`);
    else $(el).html(`${label} <span class="mono">${v}</span>`);
  });
  // journey spine: re-render every <li> from overview.spine (stale exemplar text otherwise ships)
  const spineOl = $("ol.spine").first();
  if (spineOl.length && overview.spine?.length) {
    spineOl.empty();
    overview.spine.forEach((m, i) => {
      spineOl.append(`\n<li data-state="${m.state}"><p class="spine__when">Stage 0${i + 1} · <span class="mono">${m.when}</span></p><h3 class="spine__what">${m.what}</h3><p class="spine__note">${mdInline(m.note)}</p></li>`);
    });
  } else warn("index: spine not rendered");
  // section-card feet: derive from the same counts the status strip uses
  const feet = {
    "proposal.html": ["11 sections", "Draft"],
    "questions.html": [`${allHypotheses.length} hypotheses`, `${supportedHypotheses} supported`],
    "experiments.html": [`${experiments.length} runs`, "Ledger live"],
    "results.html": [`${results.figures.length} of 6 plates filled`, "Study 1"],
    "literature.html": [`${threads.length} threads`, litEntries.length ? `${litEntries.length} entries` : "Entries pending verification"],
    "timeline.html": [`${timelineC.stages.length} stages`, "In motion"],
    "notes.html": [`${advisorNotes.length} entries`, "Advisor log"],
    "approvals.html": ["Form D1 in progress", "No decisions yet"],
    "landing.html": ["Public front door", "Link-only"],
  };
  for (const [href, [l, r]] of Object.entries(feet)) {
    const foot = $(`a.card[href="${href}"] .card__foot`);
    if (foot.length) foot.html(`<span>${l}</span><span>${r}</span>`);
  }
  $('a.card[href="timeline.html"] .card__body').text(
    "The program spine (coursework, the three studies, candidacy, defense), with the deliverable attached to each stage and honest status on every one."
  );
  // OD's card grid stops at §08: append §09 (feed) and §10 (disciplines) after the §08 card
  const notesCard = $('a.card[href="notes.html"]').first();
  if (notesCard.length) notesCard.after(`\n<a class="card" href="lab-log.html">
  <span class="card__num">§09</span>
  <span class="card__title">Lab log</span>
  <p class="card__body">The published, dated record of results, findings, decisions, and
    milestones; the page to watch between meetings.</p>
  <span class="card__foot"><span>${logEntries.length} entries</span><span>Live</span></span>
</a>\n<a class="card" href="disciplines.html">
  <span class="card__num">§10</span>
  <span class="card__title">Disciplines</span>
  <p class="card__body">The rules this record is kept by (falsifiers named first, preregistered
    analysis, sealed artifacts, append-only history), each one enforced somewhere checkable.</p>
  <span class="card__foot"><span>${tenetCount} tenets</span><span>In force</span></span>
</a>`);
  else warn("index: §08 card not found; §09/§10 cards not inserted");
  finish($, "index.html");
}

// ---------- proposal.html (§01) ----------
{
  const $ = page("proposal.html");
  const fm = proposal.data;
  // heading→slot mapping from frontmatter `slots`
  const sections = {};
  let current = null;
  for (const line of proposal.content.split("\n")) {
    const h = line.match(/^## (.+)$/);
    if (h) { current = h[1].trim(); sections[current] = []; }
    else if (current) sections[current].push(line);
  }
  for (const [heading, slot] of Object.entries(fm.slots)) {
    if (!sections[heading]) { warn(`proposal.md missing section: ${heading}`); continue; }
    fillSlot($, slot, md(sections[heading].join("\n")));
  }
  for (const heading of Object.keys(sections))
    if (!fm.slots[heading]) warn(`proposal.md section has no slot mapping (content dropped): ${heading}`);
  const thesisSentences = ($(`[data-od-slot="proposal.thesis"]`).text().match(/[.!?](\s|$)/g) ?? []).length;
  if (thesisSentences > 1) warn("proposal.thesis exceeds one sentence (contract §3)");
  // §1.5 system diagram: paper 1's architecture figure exists — connect them
  const apPlate = $(".plate").filter((_, el) => $(el).text().includes("approach-overview")).first();
  if (apPlate.length) {
    apPlate.replaceWith(`<img src="figures/fig1_architecture.png" alt="Block diagram: the Fossen hydrodynamics plugin computing added-mass and damping forces and writing them into the GPU solver's own force buffer, inside the learning loop." style="width:100%;height:auto">`);
    const fc = $("figcaption").filter((_, el) => $(el).text().includes("System overview")).first();
    if (fc.length) fc.html(`<b>Figure 1</b> — System overview: the validated hydrodynamics plugin inside the GPU learning stack (paper 1's architecture figure).`);
  }
  fillSlot($, "proposal.subtitle", mdInline(fm.subtitle));
  fm.research_questions.forEach((q, i) => fillSlot($, `proposal.rq.${i + 1}`, mdInline(q)));
  fm.contributions.forEach((c, i) => fillSlot($, `proposal.contribution.${i + 1}`, mdInline(c)));
  // risks table: replace resting rows entirely
  const tbody = $('table:has(caption:contains("Identified risks")) tbody');
  if (tbody.length) {
    tbody.empty();
    for (const r of fm.risks) {
      tbody.append(`\n<tr><td>${mdInline(r.risk)}</td><td>${r.likelihood}</td><td>${r.impact}</td><td>${mdInline(r.mitigation)}</td></tr>`);
    }
  } else warn("proposal: risks tbody not found");
  // header metadata: version / status / prepared for / dated — fill text occurrences if present
  const headMeta = $(".pagehead__meta");
  if (headMeta.length) {
    headMeta.first().html(
      `<span class="mono">${fm.version}</span> · ${statusSpan("open", "Draft")} · prepared for ${fm.prepared_for} · <span class="mono">${fm.dated instanceof Date ? fm.dated.toISOString().slice(0, 10) : fm.dated}</span>`
    );
  }
  finish($, "proposal.html");
}

// ---------- questions.html (§02) ----------
{
  const $ = page("questions.html");
  questions.forEach((q, qi) => {
    const n = qi + 1;
    // real short titles replace "Research question one" placeholders (and RQ3's stray "optional" tag)
    if (q.short) {
      const head = $(".sec__num").filter((_, el) => $(el).text().trim() === `RQ${n}`).first().siblings(".sec__sub");
      if (head.length) head.text(q.short);
    }
    fillSlot($, `rq.${n}.question`, mdInline(q.question));
    if ($(`[data-od-slot="rq.${n}.motivation"]`).length) fillSlot($, `rq.${n}.motivation`, md(q.motivation));
    q.hypotheses.forEach((h, hi) => {
      const key = `rq.${n}.h.${hi + 1}`;
      let slotEl = $(`[data-od-slot="${key}"]`);
      if (!slotEl.length) {
        // hand-built page ships fewer hypothesis cards than content has: clone the previous one
        const prev = $(`[data-od-slot="rq.${n}.h.${hi}"]`).closest("li[data-item]");
        if (!prev.length) { warn(`questions: no slot or clone base for ${key} (${h.id})`); return; }
        const clone = prev.clone();
        clone.find("[data-od-slot]").attr("data-od-slot", key).attr("class", "slot slot--inline mb-0").empty();
        prev.after(clone);
        slotEl = $(`[data-od-slot="${key}"]`);
      }
      const li = slotEl.closest("li[data-item]");
      li.find(".tag--rq").text(h.id);
      fillSlot($, key, mdInline(h.statement));
      li.attr("data-state", h.status);
      li.find(".status").replaceWith(statusSpan(h.status));
      const runs = h.evidence?.length ?? 0;
      li.find(".card__foot").html(
        `<span>Evidence: ${runs ? h.evidence.map((e) => `<span class="mono">${e}</span>`).join(", ") : '<span class="dash">—</span>'}</span><span>${runs} run${runs === 1 ? "" : "s"}</span>`
      );
    });
  });
  finish($, "questions.html");
}

// ---------- experiments.html (§03) ----------
{
  const $ = page("experiments.html");
  const tbody = $("table tbody").first();
  tbody.empty();
  for (const e of experiments) {
    const d = e.data;
    const date = d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date);
    const stateMap = { done: "done", running: "running", queued: "queued", failed: "failed", superseded: "superseded" };
    if (!stateMap[d.status]) warn(`experiments: ${d.id} has unmapped status "${d.status}" (falling back to open)`);
    const state = stateMap[d.status] ?? "open";
    const detailId = `d${d.id.replace(/\D/g, "")}`;
    const metrics = Object.entries(d.metrics ?? {}).map(([k, v]) => `<span class="mono">${k}</span>: ${Array.isArray(v) ? v.join(" – ") : v}`).join("<br>") || '<span class="dash">—</span>';
    const artifacts = (d.artifacts ?? []).map((a) => (a.href ? `<a href="${a.href}">${a.label}</a>` : a.label)).join("<br>") || '<span class="dash">—</span>';
    tbody.append(`
<tr data-item data-state="${state}" data-rq="${d.rq}">
  <td class="mono">${d.id}</td>
  <td class="num mono">${date}</td>
  <td><span class="tag tag--rq">${d.rq.toUpperCase()}</span> <span class="mono">${d.hypothesis}</span></td>
  <td>${mdInline(d.env)}</td>
  <td>${mdInline(d.method)}</td>
  <td class="num">${d.seeds}</td>
  <td>${statusSpan(state)}</td>
  <td><button class="rowbtn" data-expand aria-expanded="false" aria-controls="${detailId}" aria-label="Show detail for ${d.id}">+</button></td>
</tr>
<tr class="detail" id="${detailId}" hidden>
  <td colspan="8">
    <div class="grid grid--2">
      <div class="prose"><p class="card__num">Config</p><p>${d.commit ? `commit <span class="mono">${d.commit}</span>` : '<span class="dash">—</span>'}</p></div>
      <div class="prose"><p class="card__num">Metrics</p><p>${metrics}</p></div>
      <div class="prose"><p class="card__num">Artifacts</p><p>${artifacts}</p></div>
      <div class="prose"><p class="card__num">Reading</p>${md(e.content.replace(/^## Reading\s*/m, ""))}</div>
    </div>
  </td>
</tr>`);
  }
  // align filter chips with the contract's status vocabulary (unfilled can never occur; queued/superseded can)
  const unfilledChip = $('[data-filter-value="unfilled"]');
  if (unfilledChip.length) {
    unfilledChip.attr("data-filter-value", "queued").text("○ Queued");
    unfilledChip.after(`\n<button class="chip" data-filter-group="state" data-filter-value="superseded" aria-pressed="false">◑ Superseded</button>`);
  }
  finish($, "experiments.html");
}

// ---------- results.html (§04) ----------
{
  const $ = page("results.html");
  results.figures.forEach((f) => {
    // locate the figure by its fixed <b>Figure N</b> prefix (only fig 1 has a slot)
    const bTag = $("figcaption b").filter((_, el) => $(el).text().trim() === `Figure ${f.n}`).first();
    if (!bTag.length) { warn(`results: no figcaption for figure ${f.n}`); return; }
    const figcap = bTag.closest("figcaption");
    const fig = figcap.closest("figure");
    if (fs.existsSync(f.file)) {
      if (!f.alt) warn(`results: figure ${f.n} has no alt text (caption is not alt)`);
      fig.find(".plate").replaceWith(`<img src="${f.file}" alt="${escAttr(f.alt ?? "")}" style="width:100%;height:auto;border:1px solid var(--border);border-radius:2px">`);
    } else warn(`results: missing figure file ${f.file}`);
    const runsHtml = f.runs?.length
      ? `Runs: ${f.runs.map((r) => `<span class="mono">${r}</span>`).join(", ")}`
      : 'Runs: <span class="dash">—</span>';
    figcap.html(`<b>Figure ${f.n}</b> — ${mdInline(f.caption)}<br><span class="mono" style="font-size:var(--t-micro)">${runsHtml}</span>`);
  });
  // reserved plates (RQ2/RQ3/ablations) keep their honest empty state, but the
  // authoring-guidance callouts inside them are written to the author, not the reader
  for (const panel of ["#p-rq2", "#p-rq3", "#p-abl"]) $(`${panel} .callout`).remove();
  // headline numbers: match stat labels loosely
  $(".stat").each((_, el) => {
    const k = $(el).find(".stat__k").text().trim().toLowerCase();
    const v = $(el).find(".stat__v");
    const hn = results.headline_numbers;
    if (k.includes("primary") && hn.primary_metric) v.html(mdInline(hn.primary_metric));
    else if (k.includes("baseline") && hn.best_baseline) v.html(mdInline(hn.best_baseline));
    else if (k.includes("seed") && hn.seeds_per_cell) v.html(mdInline(hn.seeds_per_cell));
    else if (k.includes("compute")) v.html(hn.compute_hours ? mdInline(hn.compute_hours) : '<span class="dash">—</span>');
  });
  finish($, "results.html");
}

// ---------- literature.html (§05) ----------
{
  const $ = page("literature.html");
  for (const t of threads) {
    fillSlot($, `lit.thread.${t.id}.name`, t.name);
    fillSlot($, `lit.thread.${t.id}.claim`, mdInline(t.claim));
    // filter chips shipped with labels naming threads that don't exist — relabel from content
    const chipEl = $(`[data-filter-group="thread"][data-filter-value="${t.id}"]`);
    if (chipEl.length) chipEl.text(`${t.id.toUpperCase()} · ${t.chip ?? t.name}`);
  }
  // entry cards: exemplars never survive (§8.8); real entries render from content/literature/lit-*.md
  const litList = $('[data-od-slot^="lit.0"]').first().closest("ul");
  $('[data-od-slot^="lit.0"]').each((_, el) => {
    const card = $(el).closest(".card");
    (card.length ? card : $(el)).remove();
  });
  if (litEntries.length === 0) {
    $(".empty").removeAttr("hidden").html(`<strong>No entries published yet.</strong>
          A source appears here only after its document has been retrieved, read, and
          verified; see <a href="disciplines.html">§10 Disciplines</a>. The threads above
          name where each entry will land.`);
  } else {
    for (const e of litEntries) {
      const d = e.data;
      const read = d.read ? (d.read instanceof Date ? d.read.toISOString().slice(0, 10) : String(d.read)) : "";
      const bearing = (d.bearing_on ?? []).map((r) => r.toUpperCase()).join(", ");
      litList.append(`\n<li class="card" data-item data-thread="${d.thread}">
  <div class="row" style="justify-content:space-between">
    <span class="card__num">${d.id}</span><span class="tag">Thread ${d.thread.toUpperCase()}</span>
  </div>
  <p style="margin:var(--s2) 0 0">${mdInline(d.cite)}</p>
  <div class="grid grid--2" style="margin-top:var(--s3)">
    <div class="prose"><p class="card__num">Does</p><p>${mdInline(d.does)}</p></div>
    <div class="prose"><p class="card__num">Stops · the gap</p><p>${mdInline(d.stops)}</p></div>
  </div>
  <span class="card__foot"><span>Bearing on: ${bearing || '<span class="dash">—</span>'} · <a href="${d.id}.html">Full distillation →</a></span><span>Read: ${read || '<span class="dash">—</span>'}</span></span>
</li>`);
    }
  }
  finish($, "literature.html");
}

// ---------- timeline.html (§06) ----------
{
  const $ = page("timeline.html");
  // re-render the whole spine from content — filling stray slots grafts notes onto stale headings
  const wordMap = { done: "Complete", active: "In progress", open: "Planned" };
  const spineOl = $("ol.spine").first();
  if (spineOl.length && timelineC.stages?.length) {
    spineOl.empty();
    for (const s of timelineC.stages) {
      spineOl.append(`\n<li data-state="${s.state}"><p class="spine__when">Stage 0${s.n} · <span class="mono">${s.when}</span></p><h3 class="spine__what">${s.what}</h3><p class="spine__note">${mdInline(s.note)}</p><p class="spine__note">${statusSpan(s.state, wordMap[s.state])}</p></li>`);
    }
  } else warn("timeline: spine not rendered");
  // 90-day working list → checklist items ("[x] " prefix marks done)
  const list = $(".checklist").first();
  if (list.length && timelineC.ninety_days?.length) {
    list.empty();
    for (const item of timelineC.ninety_days) list.append("\n" + checkItem(item));
  }
  finish($, "timeline.html");
}

// ---------- approvals.html (§07) ----------
{
  const $ = page("approvals.html");
  // decisions repeat: none yet → delete items, un-hide empty note
  const rep = $('[data-od-repeat="decisions"]');
  rep.find("[data-od-item]").remove(); // exemplars never survive (contract §8.8)
  const emptyNote = rep.parent().find(".empty").length ? rep.parent().find(".empty") : $(".empty");
  if (decisions.length === 0) {
    emptyNote.removeAttr("hidden");
  } else {
    emptyNote.attr("hidden", "");
    const outcomeMap = {
      approved: ["approved", "Approved"], revisions: ["revisions", "Approved w/ revisions"],
      changes: ["changes", "Changes requested"], comment: ["open", "Comment only"],
    };
    [...decisions].reverse().forEach((dec, i) => { // newest first
      const d = dec.data;
      const [st, word] = outcomeMap[d.outcome] ?? ["open", d.outcome];
      const date = d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date);
      rep.append(`\n<li class="card" data-od-item>
  <div class="row" style="justify-content:space-between;align-items:flex-start">
    <div><span class="card__num">Decision ${decisions.length - i}</span>
      <div class="card__title" style="margin-top:4px">${mdInline(d.document ?? "")}</div></div>
    ${statusSpan(st, word)}
  </div>
  <div class="prose">${md(dec.content)}</div>
  <div class="card__foot"><span>${mdInline(d.member ?? "")}</span><span class="mono">${date}</span></div>
</li>`);
    });
  }
  $(".card__title").each((_, el) => $(el).text($(el).text().replace(" — ", ": ")));
  // anchor ids so cross-page links can land on the right section without scrolling
  $(".eyebrow-rule").each((_, el) => {
    const t = $(el).text().trim();
    if (t === "Committee roster") $(el).closest("section").attr("id", "roster");
    if (t === "Decision ledger") $(el).closest("section").attr("id", "decisions");
  });
  if (committee.chair_html) {
    fillSlot($, "committee.chair", committee.chair_html);
    $('[data-od-slot="committee.chair"]').closest(".card").find(".status")
      .replaceWith(statusSpan("active", "Advising"));
  }
  finish($, "approvals.html");
}

// ---------- notes.html (§08) ----------
{
  const $ = page("notes.html");
  const rep = $('[data-od-repeat="notes"]');
  const exemplar = rep.find("[data-od-item]").first();
  const items = [];
  for (const n of [...advisorNotes].reverse()) {
    const d = n.data;
    const date = d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date);
    const actions = (d.actions ?? []).map(checkItem).join("\n");
    const openCount = (d.actions ?? []).filter((a) => !/^\[x\]/i.test(a)).length;
    items.push(`
<li class="card" data-od-item>
  <div class="row" style="justify-content:space-between">
    <span class="card__num"><span class="mono">${date}</span> · ${d.who}</span>
    ${statusSpan(openCount ? "active" : "done", openCount ? `${openCount} open` : "Closed out")}
  </div>
  <p class="card__title">${mdInline(d.topic)}</p>
  <div class="prose">${md(n.content)}</div>
  <p class="card__num" style="margin:var(--s4) 0 var(--s2)">Action items</p>
  <ul class="checklist">${actions}</ul>
  <div class="card__foot"><span class="mono">content/notes/${n.file}</span><span>${openCount} open</span></div>
</li>`);
  }
  rep.find("[data-od-item]").remove();
  rep.append(items.join("\n"));
  const noteEmpty = rep.parent().find(".empty").length ? rep.parent().find(".empty") : $(".empty");
  if (items.length) noteEmpty.attr("hidden", "");
  else noteEmpty.removeAttr("hidden");
  finish($, "notes.html");
}

// ---------- landing.html (outward) ----------
{
  const $ = page("landing.html");
  const fm = publicC.data;
  const pitch = publicC.content.replace(/^## Pitch\s*/m, "");
  $(".hero h1").first().text(fm.headline); // the correct program name, replacing OD's placeholder
  fillSlot($, "public.lede", mdInline(pitch)); // slot is itself a <p>; block markdown would nest <p><p>
  fillSlot($, "public.thesis", mdInline(overview.thesis));
  (fm.thrusts ?? []).forEach((t, i) => {
    fillSlot($, `public.thrust.${i + 1}.title`, t.title);
    fillSlot($, `public.thrust.${i + 1}.body`, mdInline(t.body));
  });
  // CTAs from content (the template hardcodes its own pair)
  const ctas = $(".hero__cta a");
  if (ctas.length >= 2) {
    if (fm.cta_primary) $(ctas[0]).attr("href", fm.cta_primary.href).text(fm.cta_primary.label);
    if (fm.cta_secondary) $(ctas[1]).attr("href", fm.cta_secondary.href).text(fm.cta_secondary.label);
  }
  // hero meta dashes
  $(".hero__meta > span").each((_, el) => {
    const label = $(el).text().trim().split(/\s/)[0];
    const v = { Program: fm.meta?.program, Advisor: fm.meta?.advisor }[label];
    if (v) $(el).html(`${label} <span class="mono">${v}</span>`);
  });
  // hero media: native video as first child of a .media, or injected after the CTAs
  const media = $(".media").first();
  if (fm.hero_media?.file) {
    const vid = `<video controls muted loop playsinline preload="metadata" src="${fm.hero_media.file}"></video>`;
    if (media.length) media.prepend(vid);
    else if ($(".hero__cta").length) $(".hero__cta").after(`\n<figure class="media media--16x9">${vid}</figure>${fm.hero_media.caption ? `<p class="small muted">${fm.hero_media.caption}</p>` : ""}`);
    else warn("landing: hero_media declared but no insertion point found");
  }
  // OD copy: dash-free per Jeff's style rule
  $(".mock__cap").each((_, el) => $(el).text($(el).text().replace(" — ", ": ")));
  $("p, .note").each((_, el) => {
    const h = $(el).html();
    if (h && h.includes("sense that the link works — not")) $(el).html(h.replace("works — not", "works, not"));
  });
  // publications band
  (fm.pubs ?? []).forEach((p, i) => {
    const key = `pub.00${i + 1}`;
    const slotEl = $(`[data-od-slot="${key}"]`);
    if (!slotEl.length) { warn(`landing: no slot ${key}`); return; }
    slotEl.closest(".card").find(".tag").first().text(p.status);
    fillSlot($, key, p.html);
  });
  finish($, "landing.html");
}

// ---------- generated content pages (tpl-content): §10 Disciplines, people ----------
function genContentPage(name, { kicker, title, lead, bodyHtml, currentHref, prev, next, dropPagenav }) {
  const $ = page("tpl-content.html");
  $("#rail").replaceWith(railFrom);
  if (currentHref) setCurrent($, currentHref);
  fillSlot($, "site.title", "Lifelong Learning for Snake-Form Underwater Robots");
  $('[data-od-slot="site.subtitle"]').text("Dissertation progress — Jeff Richley, ODU MAE");
  $('[data-od-slot="site.stage"]').remove();
  $("title").text(`${title} — Lifelong Learning for Snake-Form Underwater Robots`);
  fillSlot($, "page.kicker", kicker);
  fillSlot($, "page.title", title);
  fillSlot($, "page.lead", lead);
  $('[data-od-slot="page.meta"]').remove();
  $('[data-od-slot="page.status"]').remove();
  $("[data-od-block]").remove();
  $(".doc__margin .note, .margin-stack .note").remove(); // tpl demo margin notes, not content
  $('meta[name="description"]').attr("content", escAttr(lead));
  fillSlot($, "page.body", bodyHtml);
  if (dropPagenav) $(".pagenav").remove();
  else {
    const setNav = (key, target, dir) => {
      const el = $(`[data-od-slot="${key}"]`);
      if (!el.length) return;
      if (target) { el.attr("href", target.href); el.html(`<span class="pagenav__dir">${dir}</span><span class="pagenav__title">${target.title}</span>`); }
      else el.replaceWith('<span class="pagenav__link pagenav__link--none"></span>');
    };
    setNav("page.prev", prev, "Previous");
    setNav("page.next", next, "Next");
  }
  finish($, name);
}

// ---------- §09 Lab log: feed index + entries ----------
const railFrom = (() => {
  const $ = page("index.html");
  return $("#rail").parent().html() && $.html($("#rail"));
})();
function setCurrent($, href) {
  $("#rail a").removeAttr("aria-current");
  $(`#rail a[href="${href}"]`).attr("aria-current", "page");
}
// shortcodes in log MD → media blocks
function renderLogBody(src, $tpl) {
  const body = src
    .replace(/{%\s*video\s+"([^"]+)"(?:\s*,\s*"([^"]*)")?\s*%}/g, (_, file, cap) =>
      `<figure class="media media--16x9" style="margin:var(--s5) 0"><video controls muted loop playsinline preload="metadata" src="assets/video/${file}" style="width:100%"></video></figure>${cap ? `<p class="small muted" style="margin-top:calc(-1*var(--s4))">${cap}</p>` : ""}`)
    .replace(/{%\s*callout\s+"([^"]+)"\s*%}([\s\S]*?){%\s*endcallout\s*%}/g, (_, title, inner) =>
      `<aside class="callout"><p class="card__num">${title}</p>${marked.parse(inner.trim())}</aside>`)
    .replace(/<!--[\s\S]*?-->/g, "");
  return marked.parse(body.trim());
}
// entry pages
logEntries.forEach((e, i) => {
  const $ = page("tpl-feed-entry.html");
  // replace tpl rail with the real one; mark §09 current
  $("#rail").replaceWith(railFrom);
  setCurrent($, "tpl-feed-index.html"); // railFrom still carries the pre-rewrite href; finish() rewrites it
  // chrome slots
  fillSlot($, "site.title", "Lifelong Learning for Snake-Form Underwater Robots");
  $('[data-od-slot="site.subtitle"]').text("Dissertation progress — Jeff Richley, ODU MAE");
  $('[data-od-slot="site.stage"]').remove();
  $("title").text(`${e.data.title} — Lab log`);
  $('meta[name="description"]').attr("content", escAttr(e.data.excerpt ?? ""));
  const dateEl = $('[data-od-slot="entry.date"]');
  dateEl.attr("datetime", e.date).text(e.date);
  fillSlot($, "entry.title", e.data.title);
  const tag = e.data.tag ?? "";
  const tagEl = $('[data-od-slot="entry.tag"]');
  if (tag) tagEl.attr("class", `tag tag--${tag}`).text(tag);
  else tagEl.remove(); // untagged: delete the span per §8.2, never invent a tag
  fillSlot($, "entry.excerpt", e.data.excerpt);
  // delete block exemplars, then fill body
  $("[data-od-block]").remove();
  fillSlot($, "entry.body", renderLogBody(e.content, page("tpl-feed-entry.html")));
  // prev/next: previous is older (list is newest-first, so older = i+1)
  const older = logEntries[i + 1], newer = logEntries[i - 1];
  const prevEl = $('[data-od-slot="entry.prev"]'), nextEl = $('[data-od-slot="entry.next"]');
  const setNav = (el, target, dir) => {
    if (!el.length) return;
    if (target) { el.attr("href", entryHref(target.slug)); el.find(".pagenav__title").length ? el.find(".pagenav__title").text(target.data.title) : el.html(`<span class="pagenav__dir">${dir}</span><span class="pagenav__title">${target.data.title}</span>`); }
    else el.replaceWith(`<span class="pagenav__link pagenav__link--none"></span>`);
  };
  setNav(prevEl, older, "Older");
  setNav(nextEl, newer, "Newer");
  finish($, entryHref(e.slug));
});
// feed index
{
  const $ = page("tpl-feed-index.html");
  $("#rail").replaceWith(railFrom);
  setCurrent($, "tpl-feed-index.html"); // pre-rewrite href; finish() rewrites it
  fillSlot($, "site.title", "Lifelong Learning for Snake-Form Underwater Robots");
  $('[data-od-slot="site.subtitle"]').text("Dissertation progress — Jeff Richley, ODU MAE");
  $('[data-od-slot="site.stage"]').remove();
  $("title").text("§09 Lab log — Lifelong Learning for Snake-Form Underwater Robots");
  fillSlot($, "feed.kicker", "§09 · Lab log");
  fillSlot($, "feed.title", "Lab log");
  fillSlot($, "feed.lead", "Dated record of results, findings, and decisions — newest first.");
  const rep = $('[data-od-repeat="feed.entries"]');
  $('meta[name="description"]').attr("content", "Dated record of results, findings, and decisions from the dissertation lab.");
  const items = logEntries.map((e) => {
    const tag = e.data.tag ?? "";
    return `
<li class="feed__item" data-item data-tag="${tag}" data-od-item>
  <a class="feed__link" href="${entryHref(e.slug)}">
    <time class="feed__date" datetime="${e.date}">${e.date}</time>
    <div>
      <span class="feed__title">${e.data.title}</span>
      <p class="feed__excerpt">${e.data.excerpt}</p>
    </div>
    ${tag ? `<span class="tag tag--${tag}">${tag}</span>` : ""}
  </a>
</li>`;
  });
  rep.find("[data-od-item]").remove();
  rep.append(items.join("\n"));
  if (!items.length) rep.parent().find(".empty").removeAttr("hidden");
  finish($, FEED_INDEX);
}
// §10 Disciplines
{
  const d = mdFile(`${C}/disciplines.md`);
  genContentPage("disciplines.html", {
    kicker: d.data.kicker, title: d.data.title, lead: d.data.lead,
    bodyHtml: md(d.content), currentHref: "disciplines.html",
    prev: { href: FEED_INDEX, title: "§09 Lab log" },
  });
}
// §05 detail pages — the distillation an unhurried committee member reads
for (const e of litEntries) {
  const d = e.data;
  const threadName = threads.find((t) => t.id === d.thread)?.name ?? "";
  genContentPage(`${d.id}.html`, {
    kicker: `§05 · Related work · Thread ${d.thread.toUpperCase()}`,
    title: d.cite,
    lead: `${threadName}. Bearing on ${(d.bearing_on ?? []).map((r) => r.toUpperCase()).join(", ") || "—"}; where it stops: ${d.stops}`,
    bodyHtml: md(e.content),
    currentHref: "literature.html",
    prev: { href: "literature.html", title: "§05 Related work" },
  });
}
// People profiles (linked from §07; not rail sections)
for (const p of listDir(`${C}/people`)) {
  const d = p.data;
  if (!d.slug) { d.slug = p.file.replace(/\.md$/, ""); warn(`people: ${p.file} has no slug; defaulting to filename`); }
  const links = (d.links ?? []).map((l) => `<a href="${l.href}">${l.label}</a>`).join(" · ");
  genContentPage(`people-${d.slug}.html`, {
    dropPagenav: true,
    kicker: "§07 · Committee",
    title: d.name,
    lead: `${d.role} — ${d.title_line}`,
    bodyHtml: md(p.content) + (links ? `<p class="small">${links}</p>` : ""),
    currentHref: "approvals.html",
  });
}
console.log(`Built ${fs.readdirSync(OUT).filter((f) => f.endsWith(".html")).length} pages into ${OUT}/`);
