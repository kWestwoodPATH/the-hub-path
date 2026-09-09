/* =============================================================================
   The Hub course features — runtime
   Loaded by interview-skills.html and resume-writing.html.

   What this gives you (zero authoring effort, automatic):
     1. Progress Dashboard      — auto-rendered above the first module.
        Counts every <section class="module" id="..."> on the page and tracks
        which the learner has marked complete.
     2. Mark-module-complete    — a button auto-appended to every module.
     3. Resumable position      — scroll position (by module) is saved; on
        return the learner sees a "Jump back to where you left off" banner.
     4. Reset / Export controls — in the dashboard footer.

   What this gives you (a sprinkle of markup, by you):
     5. Branching scenarios     — drop in a <section class="tc-scenario">...
     6. Reflection journals     — drop in a <div data-reflection="...">...

   All data is stored in browser localStorage on the learner's own device.
   Nothing leaves the browser. See _shared/AUTHORING.md for examples.

   Required setup in each course HTML file:
     <meta name="course-id" content="interview-skills">      <!-- unique slug -->
     <meta name="course-title" content="Interview Skills">   <!-- pretty name -->
     <link rel="stylesheet" href="_shared/course-features.css">
     <script src="_shared/course-features.js" defer></script>

   That's it. The script auto-detects everything else.
   ========================================================================== */

(function () {
  'use strict';

  // ---------- Boot / config ---------------------------------------------------

  const courseIdMeta = document.querySelector('meta[name="course-id"]');
  if (!courseIdMeta || !courseIdMeta.content) {
    console.warn('[course-features] <meta name="course-id"> missing — features disabled.');
    return;
  }
  const COURSE_ID = courseIdMeta.content.trim();
  const COURSE_TITLE =
    (document.querySelector('meta[name="course-title"]') || {}).content ||
    document.title;
  const STORAGE_PREFIX = 'thehub-course:' + COURSE_ID + ':';

  // ---------- Storage helpers (safe in privacy mode) --------------------------

  const storage = {
    get(key) {
      try { return localStorage.getItem(STORAGE_PREFIX + key); }
      catch (_) { return null; }
    },
    set(key, val) {
      try { localStorage.setItem(STORAGE_PREFIX + key, val); }
      catch (_) { /* quota or privacy mode — silently no-op */ }
    },
    remove(key) {
      try { localStorage.removeItem(STORAGE_PREFIX + key); }
      catch (_) { /* no-op */ }
    },
    getJSON(key, fallback) {
      const raw = this.get(key);
      if (raw == null) return fallback;
      try { return JSON.parse(raw); }
      catch (_) { return fallback; }
    },
    setJSON(key, val) { this.set(key, JSON.stringify(val)); },
    allKeysWithPrefix(suffix) {
      const out = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.indexOf(STORAGE_PREFIX + suffix) === 0) out.push(k);
        }
      } catch (_) { /* no-op */ }
      return out;
    },
  };

  // ---------- Discover modules ------------------------------------------------

  const moduleEls = Array.from(document.querySelectorAll('section.module[id]'));
  const modules = moduleEls.map(function (el) {
    return {
      id: el.id,
      title: (el.querySelector('h2, h3') || {}).textContent
        ? el.querySelector('h2, h3').textContent.trim() : el.id,
      tag: (el.querySelector('.module-tag') || {}).textContent
        ? el.querySelector('.module-tag').textContent.trim() : '',
      el: el,
    };
  });

  function getCompleted() {
    return new Set(storage.getJSON('completed', []));
  }
  function saveCompleted(set) {
    storage.setJSON('completed', Array.from(set));
    renderDashboard();
  }

  // ---------- 1. Mark-module-complete buttons ---------------------------------

  modules.forEach(function (mod) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tc-mark-complete';
    function refresh() {
      const done = getCompleted().has(mod.id);
      btn.textContent = done ? '✓ Module complete' : 'Mark module complete';
      btn.classList.toggle('tc-mark-complete--done', done);
      btn.setAttribute('aria-pressed', String(done));
    }
    btn.addEventListener('click', function () {
      const c = getCompleted();
      if (c.has(mod.id)) c.delete(mod.id); else c.add(mod.id);
      saveCompleted(c);
      refresh();
    });
    refresh();
    mod.el.appendChild(btn);
  });

  // ---------- 2. Progress dashboard -------------------------------------------

  let dashboardEl = null;

  function renderDashboard() {
    if (!dashboardEl) return;
    const completed = getCompleted();
    const total = modules.length;
    const done = modules.filter(function (m) { return completed.has(m.id); }).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    dashboardEl.innerHTML =
      '<h3 class="tc-dashboard__title">Your progress</h3>' +
      '<div class="tc-dashboard__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><div class="tc-dashboard__bar-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="tc-dashboard__stats"><strong>' + done + '</strong> of ' + total + ' modules complete · ' + pct + '%</p>' +
      '<p class="tc-dashboard__privacy">🔒 <strong>Your progress and reflections are stored only in this browser on this device.</strong> PATH Employment Services and the course author cannot see them. They are not synced or sent anywhere.</p>' +
      '<details class="tc-dashboard__modules">' +
        '<summary>Module checklist</summary>' +
        '<ul>' + modules.map(function (m) {
          const isDone = completed.has(m.id);
          return '<li class="' + (isDone ? 'tc-done' : '') + '">' +
            '<a href="#' + m.id + '">' +
              (isDone ? '✓' : '○') + ' ' +
              (m.tag ? '<em>' + escapeHTML(m.tag) + ':</em> ' : '') +
              escapeHTML(m.title) +
            '</a>' +
          '</li>';
        }).join('') + '</ul>' +
      '</details>' +
      '<div class="tc-dashboard__actions">' +
        '<button type="button" data-action="export-reflections">⤓ Export my reflections</button>' +
        '<button type="button" data-action="reset-progress">Reset my progress</button>' +
      '</div>';
  }

  function mountDashboard() {
    dashboardEl = document.getElementById('course-dashboard');
    if (!dashboardEl && moduleEls.length) {
      dashboardEl = document.createElement('aside');
      dashboardEl.id = 'course-dashboard';
      // Insert just before the first module
      const first = moduleEls[0];
      first.parentNode.insertBefore(dashboardEl, first);
    }
    if (!dashboardEl) return;
    dashboardEl.classList.add('tc-dashboard');
    renderDashboard();

    dashboardEl.addEventListener('click', function (e) {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      if (action === 'reset-progress') {
        const ok = confirm('Reset all your progress and reflections for this course?\n\nThis only affects your device — no data is sent anywhere.\n\nThis cannot be undone.');
        if (!ok) return;
        try {
          const toDelete = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf(STORAGE_PREFIX) === 0) toDelete.push(k);
          }
          toDelete.forEach(function (k) { localStorage.removeItem(k); });
        } catch (_) { /* no-op */ }
        location.reload();
      } else if (action === 'export-reflections') {
        exportReflections();
      }
    });
  }

  // ---------- 3. Resumable reading position -----------------------------------

  let resumeBannerEl = null;

  function saveCurrentPosition() {
    // The "current" module is the topmost one whose top edge is above 40% viewport
    let current = null;
    const cutoff = window.innerHeight * 0.4;
    for (let i = 0; i < modules.length; i++) {
      const rect = modules[i].el.getBoundingClientRect();
      if (rect.top <= cutoff) current = modules[i];
      else break;
    }
    if (current) storage.set('position', current.id);
  }

  function showResumeBanner(moduleId) {
    const mod = modules.find(function (m) { return m.id === moduleId; });
    if (!mod) return;
    resumeBannerEl = document.createElement('div');
    resumeBannerEl.className = 'tc-resume-banner';
    resumeBannerEl.setAttribute('role', 'status');
    resumeBannerEl.innerHTML =
      '<span>You were last reading <strong>' +
        (mod.tag ? escapeHTML(mod.tag) + ': ' : '') +
        escapeHTML(mod.title) +
      '</strong>.</span>' +
      '<button type="button" data-action="resume">Jump there</button>' +
      '<button type="button" data-action="dismiss" aria-label="Dismiss">×</button>';
    document.body.appendChild(resumeBannerEl);
    resumeBannerEl.addEventListener('click', function (e) {
      const t = e.target.closest('[data-action]');
      if (!t) return;
      if (t.dataset.action === 'resume') {
        mod.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      resumeBannerEl.remove();
      resumeBannerEl = null;
    });
    // Auto-dismiss after 20s
    setTimeout(function () {
      if (resumeBannerEl) { resumeBannerEl.remove(); resumeBannerEl = null; }
    }, 20000);
  }

  // Save position on scroll, debounced
  let scrollTimer = null;
  window.addEventListener('scroll', function () {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(saveCurrentPosition, 500);
  }, { passive: true });

  // Show resume banner on load if conditions are right
  function maybeShowResume() {
    const saved = storage.get('position');
    if (!saved) return;
    // Don't nag if user explicitly navigated to a hash
    if (location.hash) return;
    // Don't show if saved position is the first module (they hadn't really started)
    if (modules.length && saved === modules[0].id) return;
    setTimeout(function () { showResumeBanner(saved); }, 800);
  }

  // ---------- 4. Reflection journals ------------------------------------------

  function wireReflection(el) {
    const id = el.dataset.reflection;
    if (!id) return;
    // Prompt text comes from data-prompt OR the element's existing text
    const promptText = (el.dataset.prompt || el.textContent || '').trim();
    const stored = storage.get('reflection:' + id) || '';

    el.classList.add('tc-reflection');
    el.innerHTML =
      '<p class="tc-reflection__prompt">' + escapeHTML(promptText) + '</p>' +
      '<p class="tc-reflection__privacy"><strong>Private to you.</strong> Your reflection is saved only in this browser on this device. It is <strong>not</strong> sent to PATH Employment Services, the course author, or any server.</p>' +
      '<textarea class="tc-reflection__input" rows="4" aria-label="Your reflection" placeholder="Type your reflection here. Nothing is sent anywhere."></textarea>' +
      '<p class="tc-reflection__status" aria-live="polite">' + (stored ? 'Saved on your device.' : 'Not yet written.') + '</p>';
    el.querySelector('.tc-reflection__input').value = stored;

    const textarea = el.querySelector('.tc-reflection__input');
    const status = el.querySelector('.tc-reflection__status');
    let saveTimer = null;
    textarea.addEventListener('input', function () {
      status.textContent = 'Saving…';
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        storage.set('reflection:' + id, textarea.value);
        status.textContent = textarea.value.trim() ? 'Saved on your device.' : 'Cleared.';
      }, 400);
    });
  }

  document.querySelectorAll('[data-reflection]').forEach(wireReflection);

  function exportReflections() {
    const keys = storage.allKeysWithPrefix('reflection:');
    if (!keys.length) {
      alert("You haven't written any reflections in this course yet.");
      return;
    }
    const lines = [
      '# Reflections — ' + COURSE_TITLE,
      'Exported ' + new Date().toLocaleString(),
      '',
      'These are your private notes from this course. They were stored only on your device.',
      '',
    ];
    keys.sort().forEach(function (key) {
      const id = key.substring((STORAGE_PREFIX + 'reflection:').length);
      const text = (localStorage.getItem(key) || '').trim();
      if (!text) return;
      lines.push('## ' + id, '', text, '');
    });
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reflections-' + COURSE_ID + '-' + new Date().toISOString().slice(0, 10) + '.md';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  // ---------- 5. Branching scenarios ------------------------------------------

  function wireScenario(root) {
    const scenarioId = root.dataset.scenario || root.id || ('scenario-' + Math.random().toString(36).slice(2, 8));
    const explored = new Set(storage.getJSON('scenario:' + scenarioId, []));

    const choiceButtons = Array.from(root.querySelectorAll('[data-choice]'));
    const outcomeEls = Array.from(root.querySelectorAll('[data-outcome]'));
    const debriefEl = root.querySelector('.tc-scenario__debrief, [data-debrief]');

    // Hide outcomes + debrief initially (unless user already explored ≥2 in prior visit)
    outcomeEls.forEach(function (o) { o.hidden = true; });
    if (debriefEl) debriefEl.hidden = explored.size < 2;

    // Insert a hint line if missing and debrief exists
    if (debriefEl && !root.querySelector('.tc-scenario__debrief-gate')) {
      const hint = document.createElement('p');
      hint.className = 'tc-scenario__debrief-gate';
      hint.textContent = 'Try at least two different responses to unlock the debrief.';
      debriefEl.parentNode.insertBefore(hint, debriefEl);
      hint.hidden = explored.size >= 2;
    }
    const hintEl = root.querySelector('.tc-scenario__debrief-gate');

    function refresh() {
      choiceButtons.forEach(function (b) {
        b.classList.toggle('tc-explored', explored.has(b.dataset.choice));
      });
      if (debriefEl) debriefEl.hidden = explored.size < 2;
      if (hintEl) hintEl.hidden = explored.size >= 2;
    }

    choiceButtons.forEach(function (btn) {
      // Wrap choice buttons in a container if not already wrapped
      btn.addEventListener('click', function () {
        const choice = btn.dataset.choice;
        // Hide other outcomes, show this one
        outcomeEls.forEach(function (o) { o.hidden = o.dataset.outcome !== choice; });
        explored.add(choice);
        storage.setJSON('scenario:' + scenarioId, Array.from(explored));
        refresh();
        // Scroll the outcome into view if it's below the fold
        const outcome = outcomeEls.find(function (o) { return o.dataset.outcome === choice; });
        if (outcome) {
          const rect = outcome.getBoundingClientRect();
          if (rect.top > window.innerHeight - 80 || rect.top < 0) {
            outcome.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });

    refresh();
  }

  document.querySelectorAll('.tc-scenario, [data-scenario]').forEach(wireScenario);

  // ---------- Utilities -------------------------------------------------------

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---------- Init ------------------------------------------------------------

  function init() {
    mountDashboard();
    maybeShowResume();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
