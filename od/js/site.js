/* ============================================================================
   site.js — display-only interaction layer

   HARD CONSTRAINT: this site is published to GitHub Pages. There is no server,
   no database, and no endpoint. Nothing in this file may send, submit, save,
   or delete anything — no fetch, no XHR, no localStorage, no sessionStorage,
   no cookies, no form submission. Every block below only shows, hides,
   reorders, or highlights content that is already in the page.

   Content arrives through the build pipeline (Markdown → HTML) before deploy.
   If a feature request needs persistence, it belongs in the pipeline, not here.

   Every block is feature-detected: pages only pay for what they use.

   Focus discipline: a handler never replaces the container it lives in.
   Clicking a control leaves focus on that control; changes are made by
   toggling attributes and announced through an aria-live region.
   ========================================================================= */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function announce(msg) {
    var live = $('#live');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 40);
  }

  /* -- 1. Section rail drawer --------------------------------------------- */
  (function () {
    var rail = $('#rail'), toggle = $('#navToggle'), backdrop = $('#backdrop');
    if (!rail || !toggle) return;

    function setOpen(open) {
      rail.setAttribute('data-open', open ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (backdrop) backdrop.setAttribute('data-open', open ? 'true' : 'false');
      document.body.style.overflow = open && window.innerWidth < 1024 ? 'hidden' : '';
    }
    toggle.addEventListener('click', function () {
      setOpen(rail.getAttribute('data-open') !== 'true');
    });
    if (backdrop) backdrop.addEventListener('click', function () { setOpen(false); toggle.focus(); });
    $$('[data-nav-close]').forEach(function (b) {
      b.addEventListener('click', function () { setOpen(false); toggle.focus(); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && rail.getAttribute('data-open') === 'true') { setOpen(false); toggle.focus(); }
    });
    $$('.rail__link', rail).forEach(function (a) {
      a.addEventListener('click', function () { if (window.innerWidth < 1024) setOpen(false); });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) { setOpen(false); document.body.style.overflow = ''; }
    });
  })();

  /* -- 2. Reading progress ------------------------------------------------ */
  (function () {
    var bar = $('#progress');
    if (!bar) return;
    function tick() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  })();

  /* -- 3. Filter chips + search ------------------------------------------- */
  (function () {
    var scopes = $$('[data-filter-scope]');
    if (!scopes.length) return;

    scopes.forEach(function (scope) {
      var items = $$('[data-item]', scope);
      var chips = $$('[data-filter-group]', scope);
      var search = $('[data-search]', scope);
      var counter = $('[data-count]', scope);
      var emptyNote = $('[data-empty]', scope);
      var lastShown = 0;

      function apply() {
        var active = {};
        chips.forEach(function (c) {
          if (c.getAttribute('aria-pressed') === 'true' && c.dataset.filterValue !== '*') {
            (active[c.dataset.filterGroup] = active[c.dataset.filterGroup] || []).push(c.dataset.filterValue);
          }
        });
        var q = search ? search.value.trim().toLowerCase() : '';
        var shown = 0;

        items.forEach(function (item) {
          var ok = Object.keys(active).every(function (g) {
            return active[g].indexOf(item.dataset[g] || '') > -1;
          });
          if (ok && q) ok = (item.textContent || '').toLowerCase().indexOf(q) > -1;
          item.hidden = !ok;
          // an out-of-scope row takes its detail row and its toggle state with it
          var detail = item.nextElementSibling;
          if (!ok && detail && detail.matches && detail.matches('tr.detail')) {
            detail.hidden = true;
            var toggle = item.querySelector('[data-expand]');
            if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '+'; }
          }
          if (ok) shown++;
        });

        lastShown = shown;
        if (counter) counter.textContent = shown + ' of ' + items.length + ' shown';
        if (emptyNote) {
          emptyNote.hidden = shown !== 0;
          // Name the filter that actually emptied the table. The static copy talked about
          // status, so filtering by RQ emptied the ledger and the page explained itself in
          // terms of a filter the reader had not touched. Every chip is kept deliberately, so
          // a chip that matches nothing has to say something true about why. See phd-lab#79.
          if (shown === 0) {
            var said = [];
            Object.keys(active).forEach(function (g) {
              active[g].forEach(function (v) {
                var chip = chips.filter(function (c) {
                  return c.dataset.filterGroup === g && c.dataset.filterValue === v;
                })[0];
                if (chip) said.push(chip.textContent.trim());
              });
            });
            var body = emptyNote.querySelector('[data-empty-body]') || emptyNote;
            if (q && said.length) body.textContent = 'No records match ' + said.join(' and ') + ' with the text you typed.';
            else if (q) body.textContent = 'No records match the text you typed.';
            else if (said.length) body.textContent = 'No records against ' + said.join(' and ') + ' yet.';
            else body.textContent = 'No records to show.';
          }
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var group = chip.dataset.filterGroup;
          var siblings = chips.filter(function (c) { return c.dataset.filterGroup === group; });
          if (chip.dataset.filterValue === '*') {
            siblings.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
          } else {
            chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
            var any = siblings.some(function (c) {
              return c.dataset.filterValue !== '*' && c.getAttribute('aria-pressed') === 'true';
            });
            siblings.forEach(function (c) {
              if (c.dataset.filterValue === '*') c.setAttribute('aria-pressed', any ? 'false' : 'true');
            });
          }
          apply(); // toggles attributes only — chip keeps focus
          announce(lastShown + ' of ' + items.length + ' shown.');
        });
      });
      if (search) search.addEventListener('input', apply);
      apply();
    });
  })();

  /* -- 4. Sortable columns ------------------------------------------------- */
  (function () {
    $$('table[data-sortable]').forEach(function (table) {
      var body = table.tBodies[0];
      if (!body) return;
      $$('th[data-sort]', table).forEach(function (th, idx) {
        var btn = $('button', th);
        if (!btn) return;
        btn.addEventListener('click', function () {
          var dir = th.getAttribute('aria-sort') === 'ascending' ? -1 : 1;
          $$('th[data-sort]', table).forEach(function (o) { o.removeAttribute('aria-sort'); });
          th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');

          var col = $$('th', table).indexOf(th);
          var kind = th.dataset.sort;
          var rows = $$('tr[data-item]', body);
          var pairs = rows.map(function (r) {
            var next = r.nextElementSibling;
            return [r, (next && next.matches('tr.detail')) ? next : null];
          });
          pairs.sort(function (a, b) {
            var av = (a[0].cells[col] || {}).textContent || '';
            var bv = (b[0].cells[col] || {}).textContent || '';
            if (kind === 'num') {
              var an = parseFloat(av.replace(/[^0-9.\-]/g, '')), bn = parseFloat(bv.replace(/[^0-9.\-]/g, ''));
              an = isNaN(an) ? -Infinity : an; bn = isNaN(bn) ? -Infinity : bn;
              return (an - bn) * dir;
            }
            return av.trim().localeCompare(bv.trim(), undefined, { numeric: true }) * dir;
          });
          var frag = document.createDocumentFragment();
          pairs.forEach(function (p) { frag.appendChild(p[0]); if (p[1]) frag.appendChild(p[1]); });
          body.appendChild(frag); // moves existing nodes — focus is preserved
        });
      });
    });
  })();

  /* -- 5. Expandable rows / disclosures ------------------------------------ */
  (function () {
    $$('[data-expand]').forEach(function (btn) {
      var target = document.getElementById(btn.getAttribute('aria-controls'));
      if (!target) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        target.hidden = open;
        btn.textContent = open ? '+' : '−';
      });
    });
  })();

  /* -- 6. Tabs -------------------------------------------------------------- */
  (function () {
    $$('[role="tablist"]').forEach(function (list) {
      var tabs = $$('[role="tab"]', list);
      function select(tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(tab); });
        tab.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var next = tabs[(i + d + tabs.length) % tabs.length];
          select(next); next.focus();
        });
      });
    });
  })();

  /* -- 7. Margin-note anchors ---------------------------------------------- */
  (function () {
    $$('.anchor-mark[data-target]').forEach(function (mark) {
      mark.addEventListener('click', function () {
        var note = document.getElementById(mark.dataset.target);
        if (!note) return;
        note.classList.remove('is-flash');
        void note.offsetWidth;
        note.classList.add('is-flash');
        window.setTimeout(function () { note.classList.remove('is-flash'); }, 1300);
      });
    });
  })();

})();
