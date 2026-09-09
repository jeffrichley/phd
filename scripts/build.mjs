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
const esc = (s) => cheerio.load("<i>").html; // placeholder, unused

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
  .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
const openHypotheses = questions.flatMap((q) => q.hypotheses).filter((h) => h.status === "open").length;

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
  const SITE_NAME = "Lifelong Learning for Snake-Form Underwater Robots";
  $("title").text($("title").text().replace(/Lifelong Learning in Embodied Robotics/g, SITE_NAME).replace(/\{\{[^}]*\}\}.*$/, SITE_NAME));
  // §10 Disciplines joins "The process" in every rail, directly after §09
  const labLink = $('#rail a[href="lab-log.html"]').first();
  if (labLink.length && !$('#rail a[href="disciplines.html"]').length) {
    const cur = name === "disciplines.html" ? ' aria-current="page"' : "";
    if (cur) $("#rail a").removeAttr("aria-current");
    labLink.after(`\n      <a class="rail__link" href="disciplines.html"${cur}><span class="rail__num">§10</span><span>Disciplines</span></a>`);
  }
  if (!$('meta[name="robots"][content="noindex"]').length) warn(`${name}: missing noindex`);
  if (name !== "landing.html") // landing intentionally keeps its standalone .landnav chrome
    for (const sel of ["#navToggle", "#backdrop", "#rail"]) if (!$(sel).length) warn(`${name}: missing ${sel}`);
  fs.writeFileSync(path.join(OUT, name), $.html());
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
    if (k === "Advisor decision") v.html(statusSpan("open", overview.status_strip.advisor_decision));
    if (k === "Experiments logged") v.html(`<span class="mono">${experiments.length}</span>`);
    if (k === "Open hypotheses") v.html(`<span class="mono">${openHypotheses}</span>`);
  });
  // journey spine: fill any milestone.N.when/.note slots that exist from overview.spine
  (overview.spine ?? []).forEach((m, i) => {
    const n = i + 1;
    if ($(`[data-od-slot="milestone.${n}.when"]`).length) fillSlot($, `milestone.${n}.when`, m.when);
    if ($(`[data-od-slot="milestone.${n}.note"]`).length) fillSlot($, `milestone.${n}.note`, mdInline(m.what));
  });
  // OD's card grid stops at §08: append §09 (feed) and §10 (disciplines) after the §08 card
  const notesCard = $('a.card[href="notes.html"]').first();
  if (notesCard.length) notesCard.after(`\n<a class="card" href="lab-log.html">
  <span class="card__num">§09</span>
  <span class="card__title">Lab log</span>
  <p class="card__body">The published, dated record of results, findings, decisions, and
    milestones — the page to watch between meetings.</p>
  <span class="card__foot"><span>${logEntries.length} entries</span><span>Live</span></span>
</a>\n<a class="card" href="disciplines.html">
  <span class="card__num">§10</span>
  <span class="card__title">Disciplines</span>
  <p class="card__body">The rules this record is kept by — falsifiers named first, preregistered
    analysis, sealed artifacts, append-only history — each one enforced somewhere checkable.</p>
  <span class="card__foot"><span>8 tenets</span><span>In force</span></span>
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
      `<span class="mono">${fm.version}</span> · ${statusSpan("open", "Draft — under advisor review")} · prepared for ${fm.prepared_for} · <span class="mono">${fm.dated instanceof Date ? fm.dated.toISOString().slice(0, 10) : fm.dated}</span>`
    );
  }
  finish($, "proposal.html");
}

// ---------- questions.html (§02) ----------
{
  const $ = page("questions.html");
  questions.forEach((q, qi) => {
    const n = qi + 1;
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
  const restingDetailGrid = null;
  tbody.empty();
  for (const e of experiments) {
    const d = e.data;
    const date = d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date);
    const state = { done: "done", running: "running", queued: "queued", failed: "failed", superseded: "superseded" }[d.status] ?? "open";
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
      fig.find(".plate").replaceWith(`<img src="${f.file}" alt="${f.caption}" style="width:100%;height:auto;border:1px solid var(--border);border-radius:2px">`);
    } else warn(`results: missing figure file ${f.file}`);
    const runsHtml = f.runs?.length
      ? `Runs: ${f.runs.map((r) => `<span class="mono">${r}</span>`).join(", ")}`
      : 'Runs: <span class="dash">—</span>';
    figcap.html(`<b>Figure ${f.n}</b> — ${mdInline(f.caption)}<br><span class="mono" style="font-size:var(--t-micro)">${runsHtml}</span>`);
  });
  // headline numbers: match stat labels loosely
  $(".stat").each((_, el) => {
    const k = $(el).find(".stat__k").text().trim().toLowerCase();
    const v = $(el).find(".stat__v");
    const hn = results.headline_numbers;
    if (k.includes("primary") && hn.primary_metric) v.html(mdInline(hn.primary_metric));
    else if (k.includes("baseline") && hn.best_baseline) v.html(mdInline(hn.best_baseline));
    else if (k.includes("seed") && hn.seeds_per_cell) v.html(mdInline(hn.seeds_per_cell));
    else if (k.includes("compute") && !hn.compute_hours) v.html('<span class="dash">—</span>');
  });
  finish($, "results.html");
}

// ---------- literature.html (§05) ----------
{
  const $ = page("literature.html");
  for (const t of threads) {
    fillSlot($, `lit.thread.${t.id}.name`, t.name);
    fillSlot($, `lit.thread.${t.id}.claim`, mdInline(t.claim));
  }
  finish($, "literature.html");
}

// ---------- timeline.html (§06) ----------
{
  const $ = page("timeline.html");
  (timelineC.stages ?? []).forEach((s) => {
    if ($(`[data-od-slot="timeline.${s.n}.when"]`).length) fillSlot($, `timeline.${s.n}.when`, s.when);
    if ($(`[data-od-slot="timeline.${s.n}.note"]`).length) fillSlot($, `timeline.${s.n}.note`, mdInline(s.note));
  });
  // spine rows: set what/when/state where structure allows (match by position)
  const rows = $(".spine > *");
  // 90-day working list → checklist items (all open; done state is authored)
  const list = $(".checklist").first();
  if (list.length && timelineC.ninety_days?.length) {
    list.empty();
    for (const item of timelineC.ninety_days) {
      list.append(`\n<li data-done="false"><span class="checklist__mark" aria-hidden="true">○</span><span class="checklist__text"><span class="sr-only">Open. </span>${mdInline(item)}</span></li>`);
    }
  }
  finish($, "timeline.html");
}

// ---------- approvals.html (§07) ----------
{
  const $ = page("approvals.html");
  // decisions repeat: none yet → delete items, un-hide empty note
  const rep = $('[data-od-repeat="decisions"]');
  if (decisions.length === 0) {
    rep.find("[data-od-item]").remove();
    $(".empty").removeAttr("hidden");
  } else warn("approvals: decision rendering not yet implemented for non-empty set");
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
    const actions = (d.actions ?? []).map((a) => {
      const done = /^\[x\]\s*/i.test(a);
      const text = a.replace(/^\[x\]\s*/i, "");
      return `<li data-done="${done}"><span class="checklist__mark" aria-hidden="true">${done ? "✓" : "○"}</span><span class="checklist__text"><span class="sr-only">${done ? "Done. " : "Open. "}</span>${mdInline(text)}</span></li>`;
    }).join("\n");
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
  finish($, "notes.html");
}

// ---------- landing.html (outward) ----------
{
  const $ = page("landing.html");
  const fm = publicC.data;
  const pitch = publicC.content.replace(/^## Pitch\s*/m, "");
  fillSlot($, "public.lede", md(pitch));
  fillSlot($, "public.thesis", mdInline(overview.thesis));
  (fm.thrusts ?? []).forEach((t, i) => {
    fillSlot($, `public.thrust.${i + 1}.title`, t.title);
    fillSlot($, `public.thrust.${i + 1}.body`, mdInline(t.body));
  });
  // hero media: native video as first child of .media
  const media = $(".media").first();
  if (media.length && fm.hero_media?.file) {
    media.prepend(`<video controls muted loop playsinline preload="metadata" src="${fm.hero_media.file}"></video>`);
  }
  finish($, "landing.html");
}

// ---------- generated content pages (tpl-content): §10 Disciplines, people ----------
function genContentPage(name, { kicker, title, lead, bodyHtml, currentHref }) {
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
  fillSlot($, "page.body", bodyHtml);
  for (const key of ["page.prev", "page.next"]) {
    const el = $(`[data-od-slot="${key}"]`);
    if (el.length) el.replaceWith('<span class="pagenav__link pagenav__link--none"></span>');
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
function grabExemplar($, sel) {
  const el = $(sel).first();
  const html = $.html(el);
  return html;
}
// shortcodes in log MD → media blocks
function renderLogBody(src, $tpl) {
  const videoEx = $tpl('[data-od-block="video"]');
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
  setCurrent($, FEED_INDEX);
  // chrome slots
  fillSlot($, "site.title", "Lifelong Learning for Snake-Form Underwater Robots");
  $('[data-od-slot="site.subtitle"]').text("Dissertation progress — Jeff Richley, ODU MAE");
  $('[data-od-slot="site.stage"]').remove();
  $("title").text(`${e.data.title} — Lab log`);
  const dateEl = $('[data-od-slot="entry.date"]');
  dateEl.attr("datetime", e.date).text(e.date);
  fillSlot($, "entry.title", e.data.title);
  const tagEl = $('[data-od-slot="entry.tag"]');
  tagEl.attr("class", `tag tag--${e.data.tag}`).text(e.data.tag);
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
  setCurrent($, FEED_INDEX);
  fillSlot($, "site.title", "Lifelong Learning for Snake-Form Underwater Robots");
  $('[data-od-slot="site.subtitle"]').text("Dissertation progress — Jeff Richley, ODU MAE");
  $('[data-od-slot="site.stage"]').remove();
  $("title").text("§09 Lab log — Lifelong Learning for Snake-Form Underwater Robots");
  fillSlot($, "feed.kicker", "§09 · Lab log");
  fillSlot($, "feed.title", "Lab log");
  fillSlot($, "feed.lead", "Dated record of results, findings, and decisions — newest first.");
  const rep = $('[data-od-repeat="feed.entries"]');
  const items = logEntries.map((e) => `
<li class="feed__item" data-item data-tag="${e.data.tag}" data-od-item>
  <a class="feed__link" href="${entryHref(e.slug)}">
    <time class="feed__date" datetime="${e.date}">${e.date}</time>
    <div>
      <span class="feed__title">${e.data.title}</span>
      <p class="feed__excerpt">${e.data.excerpt}</p>
    </div>
    <span class="tag tag--${e.data.tag}">${e.data.tag}</span>
  </a>
</li>`);
  rep.find("[data-od-item]").remove();
  rep.append(items.join("\n"));
  finish($, FEED_INDEX);
}
// §10 Disciplines
{
  const d = mdFile(`${C}/disciplines.md`);
  genContentPage("disciplines.html", {
    kicker: d.data.kicker, title: d.data.title, lead: d.data.lead,
    bodyHtml: md(d.content), currentHref: "disciplines.html",
  });
}
// People profiles (linked from §07; not rail sections)
for (const p of listDir(`${C}/people`)) {
  const d = p.data;
  const links = (d.links ?? []).map((l) => `<a href="${l.href}">${l.label}</a>`).join(" · ");
  genContentPage(`people-${d.slug}.html`, {
    kicker: "§07 · Committee",
    title: d.name,
    lead: `${d.role} — ${d.title_line}`,
    bodyHtml: md(p.content) + (links ? `<p class="small">${links}</p>` : ""),
    currentHref: "approvals.html",
  });
}
console.log(`Built ${fs.readdirSync(OUT).filter((f) => f.endsWith(".html")).length} pages into ${OUT}/`);
