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
// Normalise line endings at the only door into the file system. core.autocrlf hands a
// Windows checkout CRLF while the section parser splits on a bare newline, so every
// heading arrives with a trailing carriage return and matches no slot key: a fresh clone
// renders S01 empty from a build that exits without error. Fixed here rather than at the
// parser so it holds for every reader of every file, whatever git config a machine has.
// See phd-lab#42.
const read = (f) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const page = (f) => cheerio.load(read(path.join(OD, f)));
const mdFile = (f) => matter(read(f));
const md = (s) => marked.parse(s.trim());
const mdInline = (s) => marked.parseInline(s.trim());
const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const SITE_NAME = "Lifelong Learning for Snake-Form Underwater Robots";
// Stamped in the reader's timezone, not the build machine's. The Actions runner is on UTC,
// so a deploy after UTC midnight stamped tomorrow's date onto a page whose content had not
// changed: a committee member in Norfolk opening it tonight saw "Updated 2026-09-10". The
// label carries no timezone, so the only date that is not a future date to this audience is
// the Eastern one. See phd-lab#64.
const BUILD_DATE = new Date().toLocaleDateString("sv-SE", { timeZone: "America/New_York" });
// checklist item honoring the data-done mechanic: "[x] " prefix marks done, and the
// attribute, glyph, and sr-only prefix always change together (contract §7)
const checkItem = (raw) => {
  const done = /^\[x\]\s*/i.test(raw);
  const text = raw.replace(/^\[x\]\s*/i, "");
  return `<li data-done="${done}"><span class="checklist__mark" aria-hidden="true">${done ? "✓" : "○"}</span><span class="checklist__text"><span class="sr-only">${done ? "Done. " : "Open. "}</span>${mdInline(text)}</span></li>`;
};

const STATUS = {
  // One glyph, one label, site-wide. content/disciplines.md states ○ Open, and §06 rendered
  // ○ Planned on six stages beside ○ Open on five working-list rows: the same mark carrying two
  // meanings on one page. Planned is a real distinction from Open, a stage that is sequenced
  // against one that is merely not started, so it keeps its word and takes its own mark rather
  // than the word being flattened away. See phd-lab#84.
  open: ["○", "Open"], planned: ["◇", "Planned"], pending: ["◈", "Pending"],
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
// Four surfaces counted experiments.length and called the result "logged", "recorded" or
// "runs". phd-lab#79 added a queued row on purpose, so from that commit every one of them
// asserted an event that had not happened. The fix is not a smaller number: counting only
// completed runs hides the queued row and undoes the reason it exists. One derived phrase,
// used by all four, so they cannot disagree again. See phd-lab#83.
const runsDone = experiments.filter((e) => e.data.status === "done").length;
const runsAhead = experiments.length - runsDone;
const runTally = (verb = "complete") =>
  runsAhead ? `${runsDone} ${verb} · ${runsAhead} queued` : `${runsDone} ${verb}`;
const studies = listDir(`${C}/studies`);
const advisorNotes = listDir(`${C}/notes`);
const decisions = listDir(`${C}/decisions`);
const logEntries = listDir(`${C}/log`)
  .map((e) => ({ ...e, slug: e.file.replace(/\.md$/, ""), date: e.data.date instanceof Date ? e.data.date.toISOString().slice(0, 10) : String(e.data.date) }))
  .sort((a, b) => b.date.localeCompare(a.date) || b.file.localeCompare(a.file)); // newest first, stable
const allHypotheses = questions.flatMap((q) => q.hypotheses);
const openHypotheses = allHypotheses.filter((h) => h.status === "open").length;
const supportedHypotheses = allHypotheses.filter((h) => h.status === "supported").length;

// §00's card grid reads "what it holds · its state", and nine of its eleven second halves are
// state phrases: Draft, In motion, In force, Link-only, Ledger live. "2 supported" was the
// only card on the front page keeping score, which is why a reader stops on it. Naming which
// questions are answered is what resolves the ambiguity a count cannot: a reader who sees
// "RQ1 supported" knows the rest belong to studies that have not run.
//
// RQ rather than Study because each card's state phrase speaks in its own section's unit, and
// this card points at §02, whose content is research questions. See phd-lab#65.
function supportedQuestions(qs) {
  const done = qs.filter((q) => (q.hypotheses ?? []).length && q.hypotheses.every((h) => h.status === "supported"));
  if (!done.length) return "none supported yet";
  if (done.length === qs.length && qs.length > 1) return "all supported";
  const names = done.map((q) => q.id.toUpperCase());
  const list = names.length === 1 ? names[0]
    : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${list} supported`;
}

// A thrust foot used to read "0 of 6 supported". Jeff read it and asked what it was saying,
// which is the finding: a status line nobody decodes is worse than one that reads badly, and
// no reordering fixes a line that is not being read. content/questions.md has exactly two
// statuses, so 0 of 6 supported is literally true and reads as tested and failed, when the
// honest state is untested. The count leads on every card so a scanner cannot sort them into
// the good one and the bad one. See phd-lab#61.
function hypothesisTally(supported, total) {
  if (total === 0) return '<span class="dash">&mdash;</span>';
  const noun = total === 1 ? "1 hypothesis" : `${total} hypotheses`;
  if (supported === 0) return `${noun} · ${total === 1 ? "not tested yet" : "none tested yet"}`;
  if (supported === total) {
    if (total === 1) return `${noun} · supported`;
    return `${noun} · ${total === 2 ? "both" : "all"} supported`;
  }
  return `${noun} · ${supported} supported`;
}
const disciplinesC = mdFile(`${C}/disciplines.md`);
const tenetCount = (disciplinesC.content.match(/^## /gm) ?? []).length;
const litEntries = listDir(`${C}/literature`, (f) => /^lit-\d+\.md$/.test(f));
// The document's version and status live in content/proposal.md's front matter and are what
// #46's version cut edits. Three stagemarks render a document status and all three shipped as
// mockup text no code touched: index's "Stage 01 · Proposal in draft", proposal's
// "Doc v0.1 · Draft" and approvals' "Doc v0.1 · awaiting decision". They do not share a
// string, so the seam carries a per-page phrase rather than one global one, and each page is
// one row in STAGEMARKS below. See phd-lab#64 and #46.
const docVersion = String(proposal.data.version ?? "").trim();
const docStatus = String(proposal.data.status ?? "").trim();
if (!docStatus) warn("proposal.md front matter has no status; §00's stagemark cannot derive");
// S01's section count is derived, never asserted: od/proposal.html is the structure that
// produces the rail and the sNN anchors, so it is the only thing that can be right about it.
const proposalSections = page("proposal.html")("section.sec.doc").length;
let proposalFilled = 0; // set while §01 renders, read by §07's card tag
const resultPlates = page("results.html")(".plate").length;
// Committee seats are counted from the roster OD renders, the same way plates are counted
// from the plate elements: the markup is the structure a reader sees, so it is the only thing
// that can be right about how many seats there are. See phd-lab#65's label sweep.
const committeeSeats = (() => {
  const $a = page("approvals.html");
  // located from the chair's own card rather than by sibling order: #54 inserted the
  // committee.standing slot between the heading and the grid, and a .next() walk found it
  return $a('[data-od-slot="committee.chair"]').closest(".card").parent().children(".card").length;
})();
const openActions = advisorNotes
  .flatMap((n) => n.data.actions ?? [])
  .filter((a) => !/^\[x\]/i.test(a)).length;

// Topbar stagemarks and pagehead meta ship as static template text. They froze at the
// mockup's values while the §00 cards summarising the same collections derived correctly,
// so the site contradicted itself two clicks apart. One rule for the whole family: a
// counter is written from the collection it names. Applied in finish(), so every page
// passes through it and a new page cannot quietly skip it.
const STAGEMARKS = {
  "questions.html": `Open <b>${openHypotheses}</b> of ${allHypotheses.length} hypotheses`,
  "experiments.html": `Runs <b>${runsDone}</b> complete${runsAhead ? ` · ${runsAhead} queued` : ""}`,
  "results.html": `Plates <b>${resultPlates}</b> · ${results.figures.length} filled`,
  "literature.html": `Threads <b>${threads.length}</b> · ${litEntries.length} entries`,
  "notes.html": `Entries <b>${advisorNotes.length}</b>`,
  // §00 keeps the document status and loses the stage position: §06's stagemark answers
  // where the program is, and §00's own card grid says it again a few centimetres below.
  // The front door's job is what am I looking at, not where in the programme are we.
  "index.html": `Proposal in ${docStatus}`,
};
const PAGEHEAD_COUNTS = {
  // "slots" is right where the things are unfilled and wrong where they are filled. §02's four
  // questions are all written, so it was mockup language that survived the things arriving;
  // §07's committee genuinely has three empty seats, so there it describes the real state.
  "questions.html": { Questions: `Questions ${questions.length}`, Hypotheses: `Hypotheses ${allHypotheses.length} recorded` },
  "approvals.html": { Members: `Members ${committeeSeats} slots`, Decisions: `Decisions ${decisions.length}` },
  "results.html": { Plates: `Plates ${resultPlates} reserved` },
  "experiments.html": { Records: `Records ${runTally()}` },
  "literature.html": { Threads: `Threads ${threads.length}`, Entries: `Entries ${litEntries.length}` },
  "notes.html": { Entries: `Entries ${advisorNotes.length}`, "Open actions": `Open actions ${openActions}` },
  "timeline.html": { Stages: `Stages ${timelineC.stages.length}` },
};

// ---------- output scaffold ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const dir of ["css", "js"]) fs.cpSync(path.join(OD, dir), path.join(OUT, dir), { recursive: true });
fs.cpSync("assets", path.join(OUT, "assets"), { recursive: true });
fs.cpSync("figures", path.join(OUT, "figures"), { recursive: true });

const FEED_INDEX = "lab-log.html";
const entryHref = (slug) => `log-${slug}.html`;

function finish($, name) {
  // global path rewrites + invariants
  $('a[href="tpl-feed-index.html"]').attr("href", FEED_INDEX);
  $('a[href="tpl-landing.html"]').attr("href", "index.html"); // tpl wordmark → internal front door
  $("title").text($("title").text().replace(/\{\{[^}]*\}\}.*$/, SITE_NAME));
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
  // Study write-ups join "The record" nested under §03, because they are the argument its runs
  // support. No section number: a numbered "Studies" heading with one entry would advertise the
  // three studies that have nothing to write yet, which is why phd-lab#69 rejected it. Derived
  // from content/studies/ exactly as §03's ledger link is, so study 2's page appears in the rail
  // of all 44 pages without a template edit. See phd-lab#77.
  const expLink = $('#rail a[href="experiments.html"]').first();
  if (expLink.length) {
    let after = expLink;
    for (const st of studies) {
      const href = `${st.data.slug}.html`;
      if ($(`#rail a[href="${href}"]`).length) continue;
      const cur = name === href ? ' aria-current="page"' : "";
      if (cur) $("#rail a").removeAttr("aria-current");
      const label = String(st.data.rail ?? st.data.title).replace(/^Study (\d+).*$/, "Study $1");
      after.after(`
      <a class="rail__link rail__link--sub" href="${href}"${cur}><span class="rail__num">↳</span><span>${label}</span></a>`);
      after = $(`#rail a[href="${href}"]`).first();
    }
  } else if ($("#rail").length) warn(`${name}: no §03 rail link to nest study pages under`);
  // every rail carries the Outward group (od/proposal.html omits it)
  if ($("#rail").length && !$('#rail a[href="landing.html"]').length) {
    $("#rail").append(`\n    <div class="rail__group"><p class="rail__label">Outward</p><a class="rail__link" href="landing.html"><span class="rail__num">↗</span><span>Public page</span></a></div>`);
  }
  // "Nine surfaces, one record" counted nine when the rail carried eleven, on the same screen
  // as the rail. It is the frozen-counter defect inside a SENTENCE, which is why no label sweep
  // found it: every instrument built for those reads chrome, and prose is invisible to all of
  // them. Derived from the rail the page actually renders. See phd-lab#66.
  const NUM_WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"];
  // The count never broke; the definition stopped matching the screen. Matching on §NN was
  // right while every rail entry had a section number, and phd-lab#77 put a study page in the
  // rail without one, so a reader counting entries got twelve while the sentence said eleven.
  // Counting every rail entry that is a page keeps the sentence true when the next study
  // joins, and needs no edit to do it. See phd-lab#83.
  const surfaces = $("#rail a.rail__link").filter((_, el) => {
    const href = $(el).attr("href") ?? "";
    return href && !href.startsWith("#") && !href.startsWith("http");
  }).length;
  const surfaceWord = NUM_WORD[surfaces] ?? String(surfaces);
  // The reading order is where Dr. Kaipa decides what to read, and it named no study page even
  // though study 1 is the only surface that shows a study end to end. Derived from
  // content/studies/ the way §03's ledger link and the rail entry already are, so study 2
  // joins the path without an edit. See phd-lab#83.
  const orderNote = $(".note").filter((_, el) => /reading order/i.test($(el).find(".note__who").text())).first();
  if (orderNote.length && studies.length) {
    const links = studies.map((st) => `<a href="${st.data.slug}.html">${String(st.data.rail ?? st.data.title).replace(/^(Study \d+).*$/, "$1")}</a>`);
    const html = orderNote.html() ?? "";
    if (html.includes("§02 →")) orderNote.html(html.replace("§02 →", `§02 → ${links.join(" → ")} →`));
    else warn("index: the reading order note did not carry the expected path");
  }
  const structureNote = $(".note").filter((_, el) => /surfaces, one record/.test($(el).text())).first();
  if (structureNote.length) {
    structureNote.html(structureNote.html().replace(/\b[A-Z][a-z]+ surfaces, one record/,
      `${surfaceWord[0].toUpperCase()}${surfaceWord.slice(1)} surfaces, one record`));
  } else if (name === "index.html") warn("index: the Structure note's surface count was not found");
  // footer slots on generated pages; hand-built pages get a matching footer appended (§8.7)
  $('[data-od-slot="site.footer.line"]').text("Jeff Richley · ODU MAE PhD · advisor Dr. Krishnanand Kaipa");
  $('[data-od-slot="site.footer.updated"]').text(BUILD_DATE);
  if (!$("footer").length && name !== "landing.html") {
    $("body").append(`\n<footer class="sitefoot"><div class="sitefoot__inner"><span>Jeff Richley · ODU MAE PhD · advisor Dr. Krishnanand Kaipa</span><span class="mono">Updated ${BUILD_DATE}</span></div></footer>`);
  }
  const mark = STAGEMARKS[name];
  if (mark) {
    const el = $(".stagemark");
    if (el.length) el.html(mark); else warn(`${name}: stagemark not found`);
  }
  for (const [prefix, html] of Object.entries(PAGEHEAD_COUNTS[name] ?? {})) {
    const span = $(".pagehead__meta span").filter((_, el) => $(el).text().trim().startsWith(prefix));
    if (span.length) span.first().html(html); else warn(`${name}: pagehead counter "${prefix}" not found`);
  }
  // The program-position counter said "Stage 01 of 08", which reads as barely started to a
  // reader who has not scrolled past a completed study at the RA-L submission gate. There
  // is also no current stage to name: stage 1 is active while stage 2 is complete. So the
  // string does not assert a position at all; it renders the states that are not open,
  // derived off state: rather than from a rule about which stage counts as current.
  //
  // The clause count derives too. Three non-open stages produce three clauses without a
  // code change, and a stage going from active to done changes its own word. See phd-lab#58.
  //
  // Matched on the text "Stage N of M" rather than on a class, because od/landing.html
  // carries the counter in a bare span and od/timeline.html carries it in .stagemark. A
  // per-row label naming the stage its row is about does not match this shape and is left
  // alone, including the plural "Stages 03-05" ranges on the landing page.
  const stageMarks = timelineC.stages
    .filter((st) => st.state !== "open")
    .sort((a, b) => a.n - b.n)
    .map((st) => ({ n: String(st.n).padStart(2, "0"), word: st.state === "done" ? "complete" : st.state }));
  if (stageMarks.length) {
    $("span, p, li").filter((_, el) => /^Stage\s+\d+\s+of\s+\d+$/.test($(el).text().replace(/\s+/g, " ").trim()))
      .each((_, el) => {
        // keep whatever emphasis the element already used: .stagemark bolds its number,
        // the landing hero's meta spans do not, and neither should gain or lose it here
        const bold = /<b>/.test($(el).html() ?? "");
        $(el).html(stageMarks
          .map((m) => `Stage ${bold ? `<b>${m.n}</b>` : m.n} ${m.word}`)
          .join(" · "));
      });
  } else warn("stage counter: every stage is open, so no state clause was rendered");
  // OD's authoring comments are documentation for whoever edits the templates, and they
  // ship to every reader: 477 of them, 137 KB across the site, and a third of disciplines.html
  // by weight. They render as nothing, so nobody sees the cost. Stripped here, at the one
  // point every page passes through, rather than per page. The od/ sources keep them, which
  // is where they are useful. Checked first for anything a machine reads: no IE conditional
  // comments, no server-side includes, no template markers, no formatter or linter pragmas.
  // See phd-lab#57.
  $.root().find("*").contents().filter((_, n) => n.type === "comment").remove();
  if (!$('meta[name="robots"][content="noindex"]').length) warn(`${name}: missing noindex`);
  if (name !== "landing.html") // landing intentionally keeps its standalone .landnav chrome
    for (const sel of ["#navToggle", "#backdrop", "#rail"]) if (!$(sel).length) warn(`${name}: missing ${sel}`);
  // §01's internal "§1.5", "§1.8", "§1.9" and "§1.12" references were plain text. §01 went
  // from 11 sections to 13 in one day and all four still pointed at the right section, by
  // luck: nothing would have said otherwise. As anchors they are checked here, at the one
  // point every page passes through, and a renumbering makes this warn instead of leaving a
  // sentence aimed at the wrong section. Cross-page references already broke loudly; this is
  // what gives in-page ones the same property. See phd-lab#67.
  $('a[href^="#"]').each((_, el) => {
    const id = ($(el).attr("href") ?? "").slice(1);
    if (id && !$(`[id="${id}"]`).length) warn(`${name}: in-page link #${id} resolves to no element`);
  });
  // copy-level fixes (site name, defence/defense, dash style) live in the od/ sources
  // themselves, edited in place and logged in od/NOTES-FOR-OPEN-DESIGN.md — never as
  // build-time string replaces.
  fs.writeFileSync(path.join(OUT, name), $.html());
}

// ---------- index.html (§00) ----------
{
  const $ = page("index.html");
  // The sentence under the title is the thesis claim, and §00 carried it unlabelled, so a
  // reader could not tell whether it was an abstract, a summary or the research question. The
  // label is chrome around the sentence and never an edit to it: the claim stays byte-identical
  // with §01 and the landing page. The falsifier goes beside it, because a claim shown next to
  // what would disprove it is §10's argument made once at the top of the site. See phd-lab#83.
  fillSlot($, "overview.thesis", mdInline(overview.thesis));
  const thesisEl = $('[data-od-slot="overview.thesis"]');
  if (thesisEl.length) {
    thesisEl.before('<p class="kicker kicker--accent" style="margin-bottom:var(--s2)">Thesis claim</p>');
    thesisEl.after('<p class="small muted" style="margin-top:var(--s3)">Its falsifier is stated with it: <a href="questions.html#rq2">RQ2 in §02</a> asks whether transfer benefit is flat in task similarity or scales, and a scaling result refutes this claim.</p>');
  } else warn("index: no thesis slot to label");
  fillSlot($, "overview.next_milestone", mdInline(overview.next_milestone));
  // status strip: match by label
  $(".stat").each((_, el) => {
    const k = $(el).find(".stat__k").text().trim();
    const v = $(el).find(".stat__v");
    if (k === "Advisor decision") {
      // the status pill doesn't wrap: short word in the pill, detail on a small line below,
      // and the whole stat links to the decision record so it's reachable without scrolling
      const [word, ...rest] = String(overview.status_strip.advisor_decision).split(" — ");
      v.html(`<a href="approvals.html#decisions" style="text-decoration:none">${statusSpan("active", word)}</a>` +
        (rest.length ? `<br><span class="small muted">${rest.join(" — ")} · <a href="approvals.html#decisions">decision record</a></span>` : ""));
    }
    if (k === "Experiments") v.html(`<span class="mono">${runTally()}</span>`);
    if (k === "Open hypotheses") v.html(`<span class="mono">${openHypotheses}</span>`);
  });
  // pagehead meta: the dashes are known facts
  $(".pagehead__meta > span").each((_, el) => {
    const label = $(el).text().trim().split(/\s/)[0];
    const v = { Program: overview.meta?.program, Advisor: overview.meta?.advisor, Committee: overview.meta?.committee, Updated: BUILD_DATE }[label];
    if (!v) return;
    // Committee and Advisor link straight to their sections; no scrolling to find them
    // Four labelled facts rendered as four bare spans with no separator, so they read as one
    // paragraph. A separator character was the wrong fix: a middot between inline spans strands
    // itself at the start of a line when the row wraps, and this block wraps on every phone. It
    // is a two-column definition grid instead, which has no separator to strand. Both halves are
    // real elements so the grid can place them; the label keeps the block's mono uppercase
    // register and the value drops it, which is what makes the label subordinate. See phd-lab#83.
    const val = label === "Committee" ? `<a href="approvals.html#roster">${v}</a>`
      : label === "Advisor" ? `<a href="people-krishnanand-kaipa.html">${v}</a>`
      : v;
    $(el).html(`<span class="meta__k">${label}</span><span class="meta__v mono">${val}</span>`);
  });
  $(".pagehead__meta").first().addClass("pagehead__meta--pairs");
  // journey spine: re-render every <li> from overview.spine (stale exemplar text otherwise ships)
  const spineOl = $("ol.spine").first();
  if (spineOl.length && overview.spine?.length) {
    spineOl.empty();
    // No "Stage NN" here. content/overview.md's spine carries when, what, note and state and
    // says nothing about stages: the number was the array index, and it collided with §06's
    // real stage vocabulary while contradicting it. §00's spine is a history ending at now and
    // §06's is the programme plan, so the date leads and the invented numbering goes. They are
    // not renumbered to agree, because agreeing would assert a correspondence that does not
    // exist. See phd-lab#66.
    //
    // The state renders as a glyph and a word, matching §06's spine. It was previously emitted
    // only as data-state, which the CSS draws as a bare coloured dot, and CONTENT-CONTRACT.md
    // line 277 forbids exactly that: status is never colour alone (WCAG 1.4.1). Jeff's intent
    // that the last entry reads as current was in the data and unreadable on the page.
    const spineWord = { done: "Complete", active: "Current", planned: "Planned" };
    overview.spine.forEach((m) => {
      const ms = m.state === "open" ? "planned" : m.state;
      spineOl.append(`\n<li data-state="${m.state}"><p class="spine__when"><span class="mono">${m.when}</span></p><h3 class="spine__what">${m.what}</h3><p class="spine__note">${mdInline(m.note)}</p><p class="spine__note">${statusSpan(ms, spineWord[ms])}</p></li>`);
    });
  } else warn("index: spine not rendered");
  // section-card feet: derive from the same counts the status strip uses
  const feet = {
    "proposal.html": [`${proposalSections} sections`, "Draft"],
    "questions.html": [`${allHypotheses.length} hypotheses`, supportedQuestions(questions)],
    "experiments.html": [runTally("runs complete"), "Ledger live"],
    "results.html": [`${results.figures.length} of ${resultPlates} plates filled`, "Study 1"],
    "literature.html": [`${threads.length} threads`, litEntries.length ? `${litEntries.length} entries` : "Entries pending verification"],
    "timeline.html": [`${timelineC.stages.length} stages`, "In motion"],
    "notes.html": [`${advisorNotes.length} entries`, "Advisor log"],
    "approvals.html": ["Form D1 in progress", decisions.length ? `${decisions.length} decisions` : "Ledger open, none yet"],
    "landing.html": ["Public front door", "Link-only"],
  };
  for (const [href, [l, r]] of Object.entries(feet)) {
    const foot = $(`a.card[href="${href}"] .card__foot`);
    if (foot.length) foot.html(`<span>${l}</span><span>${r}</span>`);
  }
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
  // OD's margin notes are instructions to the author, and six of them shipped to the reader:
  // a committee member was being told to "include at least one risk you genuinely cannot
  // fully mitigate", which makes a finished document look like a filled-in template. Named
  // one by one rather than pattern-matched, so this can neither over-reach nor go quietly
  // stale: a label that stops appearing warns instead of silently cutting nothing. Two notes
  // stay, because they address a reader rather than the author. See phd-lab#67.
  const AUTHORING_NOTES = ["Falsifiability", "Scope guard", "Mapping", "Credibility",
    "Common objection", "Why it earns its space"];
  for (const label of AUTHORING_NOTES) {
    const note = $(".note").filter((_, el) => $(el).find(".note__who").text().trim() === label).first();
    if (note.length) note.remove();
    else warn(`proposal: authoring note "${label}" not found (OD may have renamed it)`);
  }
  $("aside.doc__margin").each((_, el) => { if (!$(el).text().trim()) $(el).remove(); });
  // A button naming an action in the imperative is a claim that the action is available.
  // §07 is a read-only ledger with no form control on it, so this one sent a committee
  // member somewhere they could not record anything. Print stays: window.print() works.
  const decisionBtn = $('a.btn[href="approvals.html#decisions"]');
  if (decisionBtn.length) decisionBtn.remove();
  else warn("proposal: the record-a-decision button was not found");
  // §1.4 carried a coaching note where a falsifier belongs. The falsifier is not new: it is
  // the one already in §1.10's risk table and named by RQ2. It renders as a sibling of the
  // thesis rather than inside it, because the thesis is one sentence by contract §3.
  const thesisEl = $('[data-od-slot="proposal.thesis"]');
  if (thesisEl.length) thesisEl.after('<div class="prose" data-od-slot="proposal.thesis.falsifier"></div>');
  else warn("proposal: no proposal.thesis element to hang the falsifier on");
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
  // same cap as §02: OD carries proposal.rq.1 through .3 only. Clone the previous entry
  // for anything beyond, so §1.5 and §02 cannot disagree about how many questions exist.
  // §1.5 rendered four unlabelled paragraphs of prose, stacked. OD does carry "RQ1 —", but it
  // carries it in the slot hint, and a hint is replaced when the slot fills: the labelling
  // existed only while the page was empty and vanished at the moment there was something to
  // label. A placeholder correct in the mockup and self-erasing in production.
  //
  // The titles are not new text. content/questions.md authors a `short` for every question and
  // §02 already renders it; §1.5 was the only page ignoring it. Joined by id rather than by
  // list position, because these two files hold the same four questions and three of the four
  // have already drifted apart in wording: an ordinal join would one day pair one question's
  // title with another's text and say nothing. See phd-lab#72.
  const shortById = new Map(questions.map((q) => [q.id, q.short]));
  fm.research_questions.forEach((rq, i) => {
    const item = typeof rq === "string" ? { text: rq } : rq;
    const key = `proposal.rq.${i + 1}`;
    if (!$(`[data-od-slot="${key}"]`).length) {
      const prev = $(`[data-od-slot="proposal.rq.${i}"]`);
      if (!prev.length) { warn(`proposal: no clone base for ${key}`); return; }
      prev.after(prev.clone().attr("data-od-slot", key).attr("class", "slot slot--inline").empty());
    }
    if (!item.id) warn(`proposal: research question ${i + 1} has no id, so its title cannot be looked up`);
    const short = item.id ? shortById.get(item.id) : undefined;
    if (item.id && short === undefined) warn(`proposal: ${item.id} has no matching question in content/questions.md`);
    fillSlot($, key,
      `<h3><span class="tag tag--rq">${item.id ? item.id.toUpperCase() : `RQ${i + 1}`}</span> ` +
      `${short ? mdInline(short) : '<span class="dash">&mdash;</span>'}</h3><p>${mdInline(item.text)}</p>`);
  });
  // §02 is the register of research questions and §1.5 summarises it. A question in one and
  // not the other is a disagreement rather than a difference of scope, so it is said out loud.
  for (const q of questions)
    if (!fm.research_questions.some((rq) => typeof rq === "object" && rq.id === q.id))
      warn(`proposal: ${q.id} is in content/questions.md and absent from §1.5`);
  // same cap as §1.5, and study 4's contribution is what made it bite: OD carries
  // proposal.contribution.1 through .3 only. Clone the previous entry for anything beyond.
  //
  // Each contribution now carries its own trace. OD's note told the author that a
  // contribution should trace to a question and an evaluation; the note is cut above and the
  // trace is stated instead. It lives in front matter as data rather than in prose, so a
  // renumbered section breaks the in-page anchor check in finish() rather than leaving a
  // sentence that quietly points at the wrong place. See phd-lab#67.
  const secHref = (label) => `#s${String(label).replace(/^§/, "").replace(/\./g, "")}`;
  fm.contributions.forEach((c, i) => {
    const item = typeof c === "string" ? { text: c } : c;
    const key = `proposal.contribution.${i + 1}`;
    if (!$(`[data-od-slot="${key}"]`).length) {
      const prev = $(`[data-od-slot="proposal.contribution.${i}"]`);
      if (!prev.length) { warn(`proposal: no clone base for ${key}`); return; }
      prev.after(prev.clone().attr("data-od-slot", key).attr("class", "slot slot--inline").empty());
    }
    const trace = [];
    if (item.answers) trace.push(`Answers <a href="${secHref("§1.5")}">${item.answers}</a>`);
    if (item.evaluated) trace.push(`Evaluated in <a href="${secHref(item.evaluated)}">${item.evaluated}</a>`);
    // `state` is optional and exists because contribution 1's trace reads differently from the
    // other three: three say "Evaluated in §1.8" and one says "Evidence in §1.9", and a reader
    // who does not know why sees three that follow a pattern and one that does not. The label
    // stated the difference without the reason, so the reader supplied one and the cheapest
    // available reading was that something was missing. It is a field rather than a hardcoded
    // string so a second finished study inherits it. See phd-lab#67.
    if (item.evidence) {
      const where = `<a href="${secHref(item.evidence)}">${item.evidence}</a>`;
      trace.push(item.state ? `${item.state}; evidence in ${where}` : `Evidence in ${where}`);
    } else if (item.state) warn(`proposal: contribution ${i + 1} has a state but nowhere to hang it`);
    // a contribution with no evaluation is a plan, which is the thing OD's note was warning
    // the author about. Said once here, as a check, instead of on the page to the reader.
    if (!item.evaluated && !item.evidence) warn(`proposal: contribution ${i + 1} traces to no evaluation or evidence`);
    if (!item.answers) warn(`proposal: contribution ${i + 1} traces to no research question`);
    fillSlot($, key, `<p>${mdInline(item.text)}</p>` +
      (trace.length ? `<p class="small muted">${trace.join(" · ")}</p>` : ""));
  });
  // risks table: replace resting rows entirely. Four columns overflowed .table-wrap on a
  // desktop, where the horizontal scroll is a responsive fallback rather than the intent.
  // Likelihood and impact are one-word ratings that read fine together, so they share a
  // cell: three columns, both values kept. See phd-lab#67.
  const riskHeads = $('table:has(caption:contains("Identified risks")) thead tr').children("th");
  if (riskHeads.length === 4) {
    $(riskHeads[1]).text("Likelihood / impact");
    $(riskHeads[2]).remove();
  } else warn(`proposal: risks table has ${riskHeads.length} header cells, expected 4`);
  const tbody = $('table:has(caption:contains("Identified risks")) tbody');
  if (tbody.length) {
    tbody.empty();
    for (const r of fm.risks) {
      tbody.append(`\n<tr><td>${mdInline(r.risk)}</td><td>${r.likelihood} / ${r.impact}</td><td>${mdInline(r.mitigation)}</td></tr>`);
    }
  } else warn("proposal: risks tbody not found");
  // the closing box's prose was a to-do addressed to Jeff, the same class as the six
  // authoring notes. The button beside it is honest navigation to a real ledger and stays;
  // only the sentence turns outward, toward the reader who has to trust the ledger.
  const readyBox = $(".callout").filter((_, el) => /Ready for a decision/.test($(el).find("h3").text())).first();
  if (readyBox.length) {
    readyBox.find("h3").first().text("Decisions on this document");
    readyBox.find("p").first().html(
      `Every decision on this proposal is recorded in <a href="approvals.html">§07 Committee &amp; approvals</a> against a named version, so an approval always refers to a specific document rather than to whatever this page said on the day it was read.`
    );
  } else warn("proposal: the closing decision callout was not found");
  // header metadata: version / status / prepared for / dated — fill text occurrences if present
  const headMeta = $(".pagehead__meta");
  if (headMeta.length) {
    headMeta.first().html(
      `<span class="mono">${fm.version}</span> · ${statusSpan("open", "Draft")} · prepared for ${fm.prepared_for} · <span class="mono">${fm.dated instanceof Date ? fm.dated.toISOString().slice(0, 10) : fm.dated}</span>`
    );
  }
  // a section counts as filled when nothing inside it is still an unfilled slot. Measured
  // here rather than asserted on §07, because this is the only place the rendered §01 exists.
  proposalFilled = $("section.sec.doc").filter((_, el) => $(el).find(".slot").length === 0).length;
  finish($, "proposal.html");
}

// ---------- questions.html (§02) ----------
{
  const $ = page("questions.html");
  // OD ships three RQ sections and they are NOT the same shape: rq.1 and rq.2 carry a
  // motivation slot and a "Hypotheses" heading, rq.3 carries neither. The old cloner built
  // each missing section from whichever section came before it, so RQ4 was cloned from RQ3
  // and inherited both gaps, and two authored motivation paragraphs rendered nowhere.
  //
  // The cap was never "two slots". A clone cannot produce what its base lacks, and the base
  // was the wrong section. So rq.1 is the exemplar and every other section is built from it,
  // whether or not the template happens to ship one. One path instead of two: a fifth
  // question needs no template edit, and a slot key added to the exemplar arrives in every
  // section by construction rather than by being remembered. See phd-lab#68.
  const slotClassFor = (key) =>
    key.endsWith(".question") ? "slot" : key.includes(".h.") ? "slot slot--inline mb-0" : "slot slot--inline";
  const exemplar = $('[data-od-slot="rq.1.question"]').closest("section.sec");
  if (!exemplar.length) warn("questions: no rq.1 section to build the other questions from");
  let prevSection = exemplar;
  questions.forEach((q, qi) => {
    const n = qi + 1;
    if (n === 1) {
      if (q.short) exemplar.find(".sec__sub").first().text(q.short);
    } else if (exemplar.length) {
      const built = exemplar.clone();
      built.find("[data-od-slot]").each((_, el) => {
        const key = $(el).attr("data-od-slot").replace(/^rq\.1\./, `rq.${n}.`);
        $(el).attr("data-od-slot", key).attr("class", slotClassFor(key)).empty();
      });
      built.find("li[data-item]").slice(1).remove(); // one card; the hypothesis cloner grows it back
      built.attr("id", `rq${n}`).addClass("sec--rule");
      built.find(".sec__num").first().text(`RQ${n}`);
      // .text() on the subtitle also drops rq.3's stray "optional" tag, which the exemplar
      // does not have and which no question in the data is
      built.find(".sec__sub").first().text(q.short ?? `Research question ${n}`);
      const existing = $(`[data-od-slot="rq.${n}.question"]`).closest("section.sec");
      if (existing.length) existing.replaceWith(built); else prevSection.after(built);
      prevSection = $(`[data-od-slot="rq.${n}.question"]`).closest("section.sec");
    }
    fillSlot($, `rq.${n}.question`, mdInline(q.question));
    // this fill used to be wrapped in `if (slot exists)`, the only silently-guarded fillSlot
    // in the build, which turned a missing slot into missing content with nothing said. Every
    // other over-cap in this codebase renders a visible slot key, which is how phd-lab#45
    // found the last two. fillSlot warns by name instead, and the exemplar rebuild above
    // means the slot is always there to warn about.
    if (q.motivation) fillSlot($, `rq.${n}.motivation`, md(q.motivation));
    else warn(`questions: ${q.id} has no motivation`);
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
  // the template can also ship MORE sections than the data has questions. Drop those, so the
  // page follows the data in both directions instead of stranding an empty RQ that reads as
  // a question nobody has written yet.
  $("section.sec").each((_, el) => {
    const key = $(el).find("[data-od-slot^='rq.']").first().attr("data-od-slot");
    const m = key && key.match(/^rq\.(\d+)\./);
    if (m && Number(m[1]) > questions.length) $(el).remove();
  });
  // The status vocabulary defined four statuses and then told the author what to do about
  // three of them. Same family as §01's six authoring notes: a definition addresses a reader,
  // an instruction addresses Jeff. The definitions stay word for word, ○ Open is untouched,
  // and each instruction is named in full so a reworded card warns rather than keeping it.
  // See phd-lab#68.
  const STATUS_COACHING = [
    "Cite the run IDs, not the impression.",
    "Say what additional evidence would resolve it.",
    "Keep it visible: a refuted hypothesis that was honestly tested is a contribution.",
  ];
  for (const sentence of STATUS_COACHING) {
    const body = $(".card__body")
      .filter((_, el) => $(el).text().replace(/\s+/g, " ").includes(sentence)).first();
    if (!body.length) { warn(`questions: status coaching sentence not found: "${sentence}"`); continue; }
    body.html(body.html().replace(/\s+/g, " ").replace(sentence, "").trim());
  }
  finish($, "questions.html");
}

// Grow a hand-authored per-RQ control set to match content/questions.md. phd-lab#45 closed the
// ordinal-addressing class and reported zero instances left, which was true of its regex: that
// regex matched OD slot keys, and these are chip and tab markup, so it could not have found
// them. The rule is the shape rather than the pattern, and this is where the shape is closed:
// any hand-authored set of per-RQ controls whose length does not come from the collection it
// describes. `find(n)` locates the control for RQ n; `add(prev, n)` puts the missing one in
// place. See phd-lab#79.
function growPerRq(label, find, add) {
  for (let n = 1; n <= questions.length; n++) {
    if (find(n).length) continue;
    const prev = find(n - 1);
    if (!prev.length) { warn(`${label}: no clone base for RQ${n}`); return; }
    add(prev, n);
  }
}

// A done row cannot rot. A queued or running one rots untouched and invisibly, and these are
// the first rows on this site that can become false with nobody editing anything. Every
// non-done row renders the date it entered that state, so invisible staleness becomes visible
// staleness. Derived from the record's own field: perturb the field and the rendered row
// moves. See phd-lab#79.
const stamp = (d, state) => {
  if (state === "done") return "";
  const when = d.queued_on ?? d.started_on ?? d.date;
  if (!when) { warn(`experiments: ${d.id} is ${state} with no date to stamp`); return ""; }
  const iso = when instanceof Date ? when.toISOString().slice(0, 10) : String(when);
  return `<br><span class="mono" style="font-size:var(--t-micro);color:var(--muted)">${state} ${iso}</span>`;
};

// ---------- experiments.html (§03) ----------
{
  const $ = page("experiments.html");
  growPerRq("experiments",
    (n) => $(`[data-filter-group="rq"][data-filter-value="rq${n}"]`),
    (prev, n) => prev.after(prev.clone().attr("data-filter-value", `rq${n}`).attr("aria-pressed", "false").text(`RQ${n}`)));
  // §03 owns the runs and a study page owns the argument they support, which is the split
  // §00's Structure note requires: nothing here is a summary of something else. Linked so a
  // reader looking at a row can reach the reasoning, and derived from content/studies/ so
  // study 2's page appears here without an edit. See phd-lab#69.
  const studyLinks = studies.map((s) => `<a href="${s.data.slug}.html">${s.data.title}</a>`);
  if (studyLinks.length) {
    const lede = $(".pagehead .lede").first();
    if (lede.length) lede.after(`
<p class="small muted">Study write-ups, where the argument behind the runs is made:<br>${studyLinks.join("<br>")}</p>`);
    else warn("experiments: no lede to hang the study links on");
  }
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
  <td>${statusSpan(state)}${stamp(d, state)}</td>
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
  // The same cap on the other widget. RQ4's panel is deliberately empty rather than absent:
  // showing the full question set tells a reader where evidence exists and where it does not,
  // and a missing tab hides that RQ4 is real. The panel is built as an honest empty state
  // rather than cloned from RQ3's, because cloning would carry RQ3's figure number and its
  // "second plate reserved" note onto a question with no plates.
  growPerRq("results",
    (n) => $(`#t-rq${n}`),
    (prev, n) => {
      prev.after(prev.clone().attr("id", `t-rq${n}`).attr("aria-controls", `p-rq${n}`)
        .attr("aria-selected", "false").attr("tabindex", "-1").text(`RQ${n}`));
      const prevPanel = $(`#p-rq${n - 1}`);
      if (!prevPanel.length) { warn(`results: no panel to place RQ${n} after`); return; }
      prevPanel.after(`
<div id="p-rq${n}" role="tabpanel" aria-labelledby="t-rq${n}" tabindex="0" hidden><div class="grid grid--2"><div class="empty"><strong>No plates yet</strong>Figures for RQ${n} arrive when the study that answers it runs. The question itself is in <a href="questions.html#rq${n}">§02</a>.</div></div></div>`);
    });
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
    figcap.html(`<b>Figure ${f.n}</b>${f.plots ? ` · ${mdInline(f.plots)}` : ""} — ${mdInline(f.caption)}<br><span class="mono" style="font-size:var(--t-micro)">${runsHtml}</span>`);
  });
  // Every plate the loop above did not fill is still template scaffolding: it prints its own
  // source filename as body text and its caption renders "Figure N — — Caption pending", a
  // doubled dash from the fixed prefix meeting the empty caption slot. One tab away, RQ4's
  // generated panel says something a reader can use. Two empty-state treatments on one page,
  // so the unfilled plates take the good one. The plate's second line is a human description
  // of what is reserved and it survives; only the filename goes. See phd-lab#80.
  $("figure").filter((_, el) => $(el).find(".plate").length).each((_, el) => {
    const key = $(el).find(".plate__key");
    const what = (key.html() ?? "").split(/<br\s*\/?>/i)[1]?.replace(/<[^>]*>/g, "").trim();
    if (!what) warn("results: a reserved plate has no description to carry into its empty state");
    $(el).replaceWith(`<div class="empty"><strong>Reserved${what ? `: ${what}` : ""}</strong>This plate arrives when the run behind it reports. Nothing stands in for it until then.</div>`);
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
  });
  finish($, "results.html");
}

// A citation a reader cannot follow is a citation they have to take on trust, and §1.3's gap
// is assembled from these entries. Every identifier here was verified against a real record
// before it shipped: the DOIs resolve through Crossref with matching title and authors, and
// the arXiv ids were already the ids each paper was read through. An entry that cannot be
// verified ships bare rather than carrying a plausible guess, because a fabricated identifier
// on a literature page is worse than a blank one. See phd-lab#82.
// The source pattern is non-global on purpose: a /g regex carries lastIndex between calls, so
// .test() is stateful and answers about where it left off rather than about the string it was
// handed. The first version of this warned on two entries that do have an arXiv id and stayed
// silent on the one that has nothing.
const ARXIV_SRC = String.raw`arXiv:(\d{4}\.\d{4,5}(?:v\d+)?)`;
function citeHtml(d) {
  const cite = String(d.cite ?? "");
  const hasArxiv = new RegExp(ARXIV_SRC).test(cite);
  let html = mdInline(cite).replace(new RegExp(ARXIV_SRC, "g"),
    (_, id) => `<a href="https://arxiv.org/abs/${id}">arXiv:${id}</a>`);
  if (d.doi) html += ` · <a href="https://doi.org/${d.doi}">doi.org/${d.doi}</a>`;
  else if (d.url) {
    // a documentation entry usually already prints its own address in the citation, so link
    // that occurrence in place rather than appending a second copy of the same string
    const bare = String(d.url).replace(/^https?:\/\//, "");
    if (html.includes(bare)) html = html.replace(bare, `<a href="${d.url}">${bare}</a>`);
    else html += ` · <a href="${d.url}">${bare}</a>`;
  }
  if (!d.doi && !d.url && !hasArxiv) warn(`literature: ${d.id} carries no resolvable identifier`);
  return html;
}

// ---------- literature.html (§05) ----------
{
  const $ = page("literature.html");
  // "The four threads" was hardwired above a list of five. A corrected hand-written count is
  // the same defect with a longer fuse, so the heading counts the collection it introduces.
  // See phd-lab#82.
  const NUM_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve"];
  const threadHead = $(".eyebrow-rule").filter((_, el) => /threads$/i.test($(el).text().trim())).first();
  if (threadHead.length) {
    const word = NUM_WORDS[threads.length] ?? String(threads.length);
    threadHead.text(`The ${word} threads`);
  } else warn("literature: no threads heading found to derive");
  // OD ships thread cards and filter chips for exactly a through d, keyed by letter. Same
  // defect as the numeric ordinal caps: a growable collection addressed by a fixed key, and
  // a letter is an ordinal in a hat. A fifth thread warned and rendered nothing, so both the
  // card and its chip are cloned from the previous one for anything the template lacks.
  threads.forEach((t, i) => {
    const prev = threads[i - 1];
    if (prev && !$(`[data-od-slot="lit.thread.${t.id}.name"]`).length) {
      const card = $(`[data-od-slot="lit.thread.${prev.id}.name"]`).closest(".card");
      if (!card.length) warn(`literature: no clone base for thread ${t.id}`);
      else {
        const clone = card.clone();
        clone.find(".card__num").text(`Thread ${t.id.toUpperCase()}`);
        clone.find("[data-od-slot]").each((_, el) => {
          const key = $(el).attr("data-od-slot").replace(`.${prev.id}.`, `.${t.id}.`);
          $(el).attr("data-od-slot", key)
            .attr("class", key.endsWith(".claim") ? "slot slot--inline mb-0" : $(el).attr("class"))
            .empty();
        });
        card.after(clone);
      }
      const prevChip = $(`[data-filter-group="thread"][data-filter-value="${prev.id}"]`);
      if (prevChip.length && !$(`[data-filter-group="thread"][data-filter-value="${t.id}"]`).length)
        prevChip.after(prevChip.clone().attr("data-filter-value", t.id).attr("aria-pressed", "false"));
    }
    fillSlot($, `lit.thread.${t.id}.name`, t.name);
    fillSlot($, `lit.thread.${t.id}.claim`, mdInline(t.claim));
    // filter chips shipped with labels naming threads that don't exist — relabel from content
    const chipEl = $(`[data-filter-group="thread"][data-filter-value="${t.id}"]`);
    if (chipEl.length) chipEl.text(`${t.id.toUpperCase()} · ${t.chip ?? t.name}`);
  });
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
      const bearing = (d.bearing_on ?? []).map((r) => r.toUpperCase()).join(", ");
      litList.append(`\n<li class="card" data-item data-thread="${d.thread}">
  <div class="row" style="justify-content:space-between">
    <span class="card__num">${d.id}</span><span class="tag">Thread ${d.thread.toUpperCase()}</span>
  </div>
  <p style="margin:var(--s2) 0 0">${citeHtml(d)}</p>
  <div class="grid grid--2" style="margin-top:var(--s3)">
    <div class="prose"><p class="card__num">Does</p><p>${mdInline(d.does)}</p></div>
    <div class="prose"><p class="card__num">Stops · the gap</p><p>${mdInline(d.stops)}</p></div>
  </div>
  <span class="card__foot"><span>Bearing on: ${bearing || '<span class="dash">—</span>'} · <a href="${d.id}.html">Full distillation →</a></span></span>
</li>`);
    }
  }
  finish($, "literature.html");
}

// ---------- timeline.html (§06) ----------
{
  const $ = page("timeline.html");
  // re-render the whole spine from content — filling stray slots grafts notes onto stale headings
  const stageState = (st) => (st === "open" ? "planned" : st);
  const wordMap = { done: "Complete", active: "In progress", planned: "Planned" };
  // One ordered list of eight stages asserted a sequence the program does not follow, and the
  // page already said so: stage 05's own note puts the candidacy exam in the last coursework
  // semester by handbook rule, so it is scheduled by the coursework calendar and not by the
  // studies it sat between. A committee member read that order as research waits on candidacy.
  // It does not, and the site was hiding the advisor's confidence inside an ordering that
  // implied the opposite.
  //
  // Two tracks from the same eight stages, and a dependency is drawn only where a stage's own
  // note states one. Absence of a dependency is the claim that two stages are concurrent, so
  // the tracks say that in a sentence rather than leaving it to be inferred from whitespace.
  // Deliberately not a time axis: six of eight stages are undated by design, and a calendar
  // would reintroduce every one of them. See phd-lab#85.
  const stageBy = new Map((timelineC.stages ?? []).map((s) => [s.n, s]));
  const stageRef = (n) => {
    const t = stageBy.get(n);
    if (!t) { warn(`timeline: stage ${n} is referenced by another stage and does not exist`); return `stage ${n}`; }
    return `<a href="#stage-${n}">${t.short ?? t.what.split(":")[0].split("(")[0].trim()}</a>`;
  };
  const TRACKS = [
    ["program", "Program", "The degree's own gates, on the university's calendar."],
    ["research", "Research", "The dissertation work: the platform, and the four studies."],
  ];
  const spineOl = $("ol.spine").first();
  if (spineOl.length && timelineC.stages?.length) {
    const host = spineOl.parent();
    const known = new Set(TRACKS.map(([id]) => id));
    for (const s of timelineC.stages)
      if (!known.has(s.track)) warn(`timeline: stage ${s.n} has no known track (${s.track ?? "unset"})`);
    const blocks = TRACKS.map(([id, label, lede]) => {
      const rows = timelineC.stages.filter((s) => s.track === id);
      if (!rows.length) { warn(`timeline: track ${id} has no stages`); return ""; }
      const items = rows.map((s) => {
        const st = stageState(s.state);
        // A dependency names a gate rather than a stage wherever the two differ. Stage 02 is
        // Complete and its gate, paper 1 submitted, is not: study 1 being finished is not the
        // paper being sent. A need that resolved to that stage's filled glyph would tell a
        // reader candidacy is unblocked, which is the confident wrong answer this ticket
        // exists to remove rather than relocate.
        const deps = (s.needs ?? []).map((d) => {
          if (typeof d === "number") return stageRef(d);
          const on = (d.stages ?? []).filter((n) => stageBy.has(n));
          if (on.length !== (d.stages ?? []).length) warn(`timeline: stage ${s.n} gates on a stage that does not exist`);
          if (!d.gate) { warn(`timeline: stage ${s.n} has a dependency with no gate text`); return on.map(stageRef).join(", "); }
          return on.length === 1 ? `<a href="#stage-${on[0]}">${d.gate}</a>` : d.gate;
        });
        const indep = (s.independent_of ?? []).map(stageRef);
        const list = (xs) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
        const rel = [
          deps.length ? `Waits on ${list(deps)}` : "Waits on nothing else here",
          indep.length ? `independent of ${list(indep)}` : "",
        ].filter(Boolean).join(" · ");
        return `\n<li id="stage-${s.n}" data-state="${s.state}"><p class="spine__when">Stage 0${s.n} · <span class="mono">${s.when}</span></p><h3 class="spine__what">${s.what}</h3><p class="spine__note">${mdInline(s.note)}</p><p class="spine__note small muted">${rel}</p><p class="spine__note">${statusSpan(st, wordMap[st])}</p></li>`;
      }).join("");
      return `<div class="track"><p class="eyebrow-rule">${label}</p><p class="small muted">${lede}</p><ol class="spine">${items}\n</ol></div>`;
    }).join("\n");
    spineOl.replaceWith(`<p class="small muted" style="margin-bottom:var(--s5)">The two tracks run concurrently. A stage waits only on what its own line says it waits on; anything not named is not a dependency.</p>\n<div class="tracks">${blocks}</div>`);
    if (!host.find(".track").length) warn("timeline: tracks did not render");
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
  // anchor ids so cross-page links can land on the right section without scrolling
  $(".eyebrow-rule").each((_, el) => {
    const t = $(el).text().trim();
    if (t === "Committee roster") $(el).closest("section").attr("id", "roster");
    if (t === "Decision ledger") $(el).closest("section").attr("id", "decisions");
  });
  // the proposal card's section tag: same derived count, different element. It is not a
  // card foot, so the feet table on index.html does not reach it.
  $("span.tag.mono").filter((_, el) => /^\d+ sections$/.test($(el).text().trim()))
    .text(`${proposalSections} sections`);
  $("span.tag.mono").filter((_, el) => /^\d+ filled$/.test($(el).text().trim()))
    .text(`${proposalFilled} filled`);
  if (committee.chair_html) {
    fillSlot($, "committee.chair", committee.chair_html);
    $('[data-od-slot="committee.chair"]').closest(".card").find(".status")
      .replaceWith(statusSpan("active", "Advising"));
  }
  // Jeff's ruling: one committee, and the empty seats stay visible as seats rather than
  // becoming prose. What they must not show is a raw slot key, which is what a committee
  // member saw. So each unnamed seat carries a status instead, written through statusSpan
  // so glyph and word stay in step per the contract.
  //
  // Two words rather than one, because the seats are empty for different reasons. Members 2
  // and 3 are being recruited now under a form in progress; the external seat cannot be
  // filled until candidacy. "Not yet selected" on the external seat would read as a delay
  // rather than as a schedule.
  const SEAT_STATE = {
    "Member 2": ["open", "Not yet selected"],
    "Member 3": ["open", "Not yet selected"],
    "External member": ["pending", "After candidacy"],
  };
  $(".card__num").each((_, el) => {
    const seat = SEAT_STATE[$(el).text().trim()];
    if (seat) $(el).siblings(".status").replaceWith(statusSpan(seat[0], seat[1]));
  });
  // his own two lines explain why the seats are empty, and had never reached a page
  const standing = [committee.advisory_committee, committee.dissertation_committee].filter(Boolean);
  if (standing.length) fillSlot($, "committee.standing", mdInline(standing.join(" ")));
  else warn("approvals: committee.md authors neither advisory_committee nor dissertation_committee");
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
  // Thrust cards are generated, not addressed, and each thrust declares which research
  // questions it covers. Coverage is explicit rather than positional because the two are
  // deliberately not one-to-one: study 4 folds into thrust 2 rather than adding a fourth
  // card, so a check that compares counts would fire forever on a correct arrangement.
  // The detector survives the fold by reading the mapping: it warns when a question is
  // claimed by no thrust, which is the state that actually loses a question from the page.
  {
    const thrusts = fm.thrusts ?? [];
    const grid = $(".grid").filter((_, el) => $(el).find('[data-od-slot^="public.thrust."]').length).first();
    if (!grid.length) warn("landing: thrust grid not found");
    else {
      grid.attr("class", `grid grid--${Math.min(thrusts.length, 4)}`);
      grid.empty();
      const byId = new Map(questions.map((q) => [q.id, q]));
      const claimed = new Set();
      thrusts.forEach((t, i) => {
        const ids = t.covers ?? [];
        if (!ids.length) warn(`landing: thrust ${i + 1} ("${t.title}") declares no covers; add covers: [rqN] in content/public.md`);
        const covered = ids.map((id) => {
          if (!byId.has(id)) warn(`landing: thrust ${i + 1} covers "${id}", which is not a research question in content/questions.md`);
          else claimed.add(id);
          return byId.get(id);
        }).filter(Boolean);
        const hyps = covered.flatMap((q) => q.hypotheses ?? []);
        const supported = hyps.filter((h) => h.status === "supported").length;
        const names = covered.map((q) => q.id.toUpperCase());
        // a thrust mapped to nothing is a real state worth showing, not a blank to hide
        const maps = names.length
          ? `Maps to ${names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0]}`
          : "Not yet mapped to a question";
        // the site's own empty marker, so an unmapped thrust stays visible to the sweep
        // that counts unfilled dashes rather than rendering one the sweep cannot see
        const tally = covered.length ? hypothesisTally(supported, hyps.length) : '<span class="dash">&mdash;</span>';
        grid.append(`
<div class="card">
  <span class="card__num">${String(i + 1).padStart(2, "0")}</span>
  <span class="card__title">${mdInline(t.title)}</span>
  <p class="card__body">${mdInline(t.body)}</p>
  <span class="card__foot"><span>${maps}</span><span>${tally}</span></span>
</div>`);
      });
      const orphans = questions.filter((q) => !claimed.has(q.id)).map((q) => q.id.toUpperCase());
      if (orphans.length)
        warn(`landing: ${orphans.join(", ")} claimed by no thrust in content/public.md, so ${orphans.length > 1 ? "they are" : "it is"} absent from the public page`);
    }
  }
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
  // publications band. OD ships pub.001 and pub.002 only, so a third publication warned
  // and vanished. Papers 2 and 3 are planned and this page says so, so the cap was on
  // their path. Clone the previous card for anything the template does not carry, which
  // is the same fix as §1.5 and §1.7 and the last of that family.
  (fm.pubs ?? []).forEach((p, i) => {
    const key = `pub.00${i + 1}`;
    let slotEl = $(`[data-od-slot="${key}"]`);
    if (!slotEl.length) {
      const prev = $(`[data-od-slot="pub.00${i}"]`).closest("li.card");
      if (!prev.length) { warn(`landing: no slot or clone base for ${key}`); return; }
      const clone = prev.clone();
      clone.find("[data-od-slot]").attr("data-od-slot", key).attr("class", "slot slot--inline").empty();
      clone.find(".card__num").text(`pub-${String(i + 1).padStart(3, "0")}`);
      prev.after(clone);
      slotEl = $(`[data-od-slot="${key}"]`);
    }
    slotEl.closest(".card").find(".tag").first().text(p.status);
    fillSlot($, key, p.html);
  });
  // outward page shows no raw slot machinery: drop pub rows beyond the real ones,
  // fill the repository and build-date lines, and reduce contact to an honest dash
  // until Jeff supplies the address
  $('[data-od-slot^="pub.0"]').each((_, el) => {
    if ($(el).hasClass("slot")) $(el).closest("li.card").remove();
  });
  if (fm.code_html) fillSlot($, "code.001", fm.code_html);
  $("p.card__body").each((_, el) => {
    if ($(el).text().trim().startsWith("Last build")) $(el).html(`Last build <span class="mono">${BUILD_DATE}</span>`);
  });
  const contact = $('[data-od-slot="public.contact"]');
  if (contact.length && !fm.contact_html) {
    contact.removeClass("slot slot--inline").addClass("prose")
      .html('<p class="small muted">Contact <span class="dash">—</span></p>');
  } else if (fm.contact_html) fillSlot($, "public.contact", fm.contact_html);
  finish($, "landing.html");
}

// ---------- generated content pages (tpl-content): §10 Disciplines, people ----------
function genContentPage(name, { kicker, title, lead, bodyHtml, currentHref, prev, next, dropPagenav }) {
  const $ = page("tpl-content.html");
  $("#rail").replaceWith(railFrom);
  if (currentHref) setCurrent($, currentHref);
  fillSlot($, "site.title", "Lifelong Learning for Snake-Form Underwater Robots");
  $('[data-od-slot="site.subtitle"]').text("Dissertation progress · Jeff Richley, ODU MAE");
  $('[data-od-slot="site.stage"]').remove();
  $("title").text(`${title} · ${SITE_NAME}`); // middot, matching the hand-built pages
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
  $('[data-od-slot="site.subtitle"]').text("Dissertation progress · Jeff Richley, ODU MAE");
  $('[data-od-slot="site.stage"]').remove();
  $("title").text(`${e.data.title} · Lab log · ${SITE_NAME}`);
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
  $('[data-od-slot="site.subtitle"]').text("Dissertation progress · Jeff Richley, ODU MAE");
  $('[data-od-slot="site.stage"]').remove();
  $("title").text(`§09 Lab log · ${SITE_NAME}`);
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
    kicker: `§05 · Literature corpus · Thread ${d.thread.toUpperCase()}`,
    title: d.cite,
    lead: `${threadName}. Bearing on ${(d.bearing_on ?? []).map((r) => r.toUpperCase()).join(", ") || "—"}; where it stops: ${d.stops}`,
    bodyHtml: md(e.content),
    currentHref: "literature.html",
    prev: { href: "literature.html", title: "§05 Literature corpus" },
  });
}
// Study write-ups (linked from §01 §1.9, §03 and §04; not rail sections). A study page owns
// the argument its runs support, which no page here owned: §03 owns the runs, §04 owns the
// plates, §1.9 owns one paragraph of consequence inside the proposal. It is an unnumbered
// leaf on purpose. The site's grammar is a numbered index owning unnumbered children (lit-*
// under §05, log-* under §09, people-* under §07), and a numbered "Studies" section holding
// one entry would advertise the three studies that have nothing to write yet. Promote it
// when study 2 lands and the index has something to index. See phd-lab#69.
for (const s of studies) {
  const d = s.data;
  if (!d.slug) { d.slug = s.file.replace(/\.md$/, ""); warn(`studies: ${s.file} has no slug; defaulting to filename`); }
  genContentPage(`${d.slug}.html`, {
    kicker: d.kicker ?? "Study",
    title: d.title,
    lead: d.lead,
    bodyHtml: md(s.content),
    currentHref: "experiments.html",
    prev: { href: "experiments.html", title: "§03 Experiments" },
    next: { href: "results.html", title: "§04 Results & figures" },
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
    lead: `${d.role} · ${d.title_line}`, // middot, not an em dash: this renders as prose
    bodyHtml: md(p.content) + (links ? `<p class="small">${links}</p>` : ""),
    currentHref: "approvals.html",
  });
}
console.log(`Built ${fs.readdirSync(OUT).filter((f) => f.endsWith(".html")).length} pages into ${OUT}/`);
