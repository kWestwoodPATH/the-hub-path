// theHUB @PATH - site interactions
// Helper: send GA event if gtag is loaded (only after cookie consent)
function hubTrack(name, params) {
  try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {}
}

(function () {
  'use strict';
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('is-open'));
    });
  }

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });

  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const banner = document.querySelector('#cookie-banner');
  const CONSENT_KEY = 'hub-analytics-consent';

  function loadAnalytics() {
    const GA_ID = 'G-VBXW6R9FE0';
    if (!GA_ID || GA_ID.includes('XXXX')) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent === 'accepted') loadAnalytics();
  else if (!consent && banner) banner.classList.add('is-visible');

  document.querySelectorAll('[data-consent]').forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = btn.getAttribute('data-consent');
      localStorage.setItem(CONSENT_KEY, choice);
      if (banner) banner.classList.remove('is-visible');
      if (choice === 'accepted') loadAnalytics();
      hubTrack('cookie_consent', { choice: choice });
    });
  });
})();

// ---- Accessibility widget ----
(function () {
  const KEY = 'hub-a11y-prefs';
  const html = document.documentElement;
  const body = document.body;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  function apply(prefs) {
    html.classList.remove('a11y-size-1', 'a11y-size-2', 'a11y-size-3');
    if (prefs.size && prefs.size > 1) html.classList.add('a11y-size-' + prefs.size);
    body.classList.toggle('a11y-contrast', !!prefs.contrast);
    body.classList.toggle('a11y-underline', !!prefs.underline);
    body.classList.toggle('a11y-reduce-motion', !!prefs.motion);
  }

  const prefs = load();
  apply(prefs);

  // Create the button + panel
  const btn = document.createElement('button');
  btn.className = 'a11y-button';
  btn.setAttribute('aria-label', 'Accessibility options');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'a11y-panel');
  btn.setAttribute('type', 'button');
  btn.innerHTML = '<span aria-hidden="true">&#9883;</span>';
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.className = 'a11y-panel';
  panel.id = 'a11y-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Accessibility options');
  panel.hidden = true;
  panel.innerHTML = `
    <button class="a11y-panel__close" type="button" aria-label="Close accessibility panel">&times;</button>
    <h3>Accessibility</h3>
    <div class="a11y-row">
      <label id="a11y-size-label">Text size</label>
      <div class="a11y-row__group" role="group" aria-labelledby="a11y-size-label">
        <button class="a11y-size-btn size-1" data-size="1" aria-label="Default text size">A</button>
        <button class="a11y-size-btn size-2" data-size="2" aria-label="Larger text">A</button>
        <button class="a11y-size-btn size-3" data-size="3" aria-label="Largest text">A</button>
      </div>
    </div>
    <div class="a11y-row">
      <label for="a11y-contrast">High contrast</label>
      <button class="a11y-toggle" id="a11y-contrast" type="button" aria-pressed="false" aria-label="Toggle high contrast"></button>
    </div>
    <div class="a11y-row">
      <label for="a11y-underline">Underline links</label>
      <button class="a11y-toggle" id="a11y-underline" type="button" aria-pressed="false" aria-label="Toggle underline links"></button>
    </div>
    <div class="a11y-row">
      <label for="a11y-motion">Reduce motion</label>
      <button class="a11y-toggle" id="a11y-motion" type="button" aria-pressed="false" aria-label="Toggle reduce motion"></button>
    </div>
    <button class="a11y-reset" type="button">Reset to defaults</button>
  `;
  document.body.appendChild(panel);

  function refreshUI() {
    const p = load();
    panel.querySelectorAll('.a11y-size-btn').forEach(b => {
      b.classList.toggle('is-active', parseInt(b.dataset.size, 10) === (p.size || 1));
    });
    panel.querySelector('#a11y-contrast').setAttribute('aria-pressed', p.contrast ? 'true' : 'false');
    panel.querySelector('#a11y-underline').setAttribute('aria-pressed', p.underline ? 'true' : 'false');
    panel.querySelector('#a11y-motion').setAttribute('aria-pressed', p.motion ? 'true' : 'false');
  }
  refreshUI();

  function openPanel() {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    refreshUI();
    hubTrack('a11y_panel_open');
  }
  function closePanel() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
  panel.querySelector('.a11y-panel__close').addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) closePanel(); });
  document.addEventListener('click', e => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) closePanel();
  });

  panel.querySelectorAll('.a11y-size-btn').forEach(b => {
    b.addEventListener('click', () => {
      const p = load();
      p.size = parseInt(b.dataset.size, 10);
      save(p); apply(p); refreshUI();
      hubTrack('a11y_change', { setting: 'size', value: p.size });
    });
  });

  const toggleMap = { 'a11y-contrast': 'contrast', 'a11y-underline': 'underline', 'a11y-motion': 'motion' };
  Object.entries(toggleMap).forEach(([id, key]) => {
    panel.querySelector('#' + id).addEventListener('click', () => {
      const p = load();
      p[key] = !p[key];
      save(p); apply(p); refreshUI();
      hubTrack('a11y_change', { setting: key, value: p[key] });
    });
  });

  panel.querySelector('.a11y-reset').addEventListener('click', () => {
    save({}); apply({}); refreshUI();
    hubTrack('a11y_reset');
  });
})();

// ---- Job board welcome tour ----
(function () {
  const overlay = document.querySelector('#tour-overlay');
  if (!overlay) return;
  const TOUR_KEY = 'hub-job-tour-seen';
  const closeBtn = document.querySelector('#tour-close');
  const dismissBtn = document.querySelector('#tour-dismiss');
  const showBtn = document.querySelector('#show-tour');

  function open() { overlay.hidden = false; document.body.style.overflow = 'hidden'; }
  function close(reason) {
    overlay.hidden = true;
    document.body.style.overflow = '';
    try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) {}
    hubTrack('tour_close', { reason: reason || 'unknown' });
  }

  if (!localStorage.getItem(TOUR_KEY)) {
    setTimeout(() => { open(); hubTrack('tour_shown', { trigger: 'first_visit' }); }, 400);
  }
  if (closeBtn) closeBtn.addEventListener('click', () => close('x'));
  if (dismissBtn) dismissBtn.addEventListener('click', () => close('got_it'));
  if (showBtn) showBtn.addEventListener('click', () => { open(); hubTrack('tour_shown', { trigger: 'manual' }); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close('outside'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) close('escape'); });
})();

// ---- Homepage welcome popup (first visit) ----
(function () {
  const overlay = document.querySelector('#welcome-overlay');
  if (!overlay) return;
  const WELCOME_KEY = 'hub-welcome-seen';
  const closeBtn = document.querySelector('#welcome-close');
  const dismissBtn = document.querySelector('#welcome-dismiss');

  function close(reason) {
    overlay.hidden = true;
    document.body.style.overflow = '';
    try { localStorage.setItem(WELCOME_KEY, '1'); } catch (e) {}
    hubTrack('welcome_close', { reason: reason || 'unknown' });
  }

  if (!localStorage.getItem(WELCOME_KEY)) {
    setTimeout(() => {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      hubTrack('welcome_shown', { trigger: 'first_visit' });
    }, 600);
  }
  if (closeBtn) closeBtn.addEventListener('click', () => close('x'));
  if (dismissBtn) dismissBtn.addEventListener('click', () => close('got_it'));
  // Clicking a destination card counts as engagement; let the link navigate.
  overlay.querySelectorAll('.welcome-card').forEach(card => {
    card.addEventListener('click', () => {
      try { localStorage.setItem(WELCOME_KEY, '1'); } catch (e) {}
      hubTrack('welcome_card_click', { dest: card.getAttribute('href') });
    });
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) close('outside'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) close('escape'); });
})();

// ---- Job board ----
(function () {
  const list = document.querySelector('#job-list');
  if (!list) return;
  const search = document.querySelector('#job-search');
  const regionSel = document.querySelector('#job-region');
  const catSel = document.querySelector('#job-category');
  const eduSel = document.querySelector('#job-edu');
  const srcSel = document.querySelector('#job-source');
  const submittedOnly = document.querySelector('#job-submitted-only');
  const empty = document.querySelector('#job-empty');
  const countEl = document.querySelector('#job-count');
  const statsEl = document.querySelector('#jobs-stats');
  const REGION_ORDER = ['Hamilton', 'Halton', 'Niagara', 'Brantford', 'Haldimand-Norfolk', 'Other'];

  const jobs = (window.HUB_JOBS || []).slice();
  const meta = window.HUB_JOBS_META || {};
  if (!jobs.length) { list.innerHTML = '<p>No jobs posted yet. Check back soon.</p>'; return; }
  jobs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (statsEl) {
    const sub = jobs.filter(j => j.submitted).length;
    statsEl.innerHTML =
      '<span><strong>' + jobs.length + '</strong> listings</span>' +
      '<span><strong>' + sub + '</strong> submitted by PATH</span>' +
      (meta.generated ? '<span>Updated <strong>' + meta.generated + '</strong></span>' : '') +
      (meta.window_days ? '<span>Past <strong>' + meta.window_days + ' days</strong></span>' : '');
  }

  // Inject JobPosting structured data (top 30 jobs, freshest first)
  injectJobPostingSchema(jobs.slice(0, 30));

  const regions = REGION_ORDER.filter(r => jobs.some(j => j.region === r));
  const cats = [...new Set(jobs.map(j => j.category).filter(Boolean))].sort();
  const sources = [...new Set(jobs.map(j => j.source).filter(Boolean))].sort();
  if (regionSel) regionSel.innerHTML = '<option value="">All regions</option>' + regions.map(r => '<option value="' + esc(r) + '">' + esc(r) + '</option>').join('');
  if (catSel) catSel.innerHTML = '<option value="">All job types</option>' + cats.map(c => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
  if (srcSel) srcSel.innerHTML = '<option value="">All sources</option>' + sources.map(s => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('');

  // ---- Multi-select state ----
  const selectedJobs = new Set();
  const multiBar = document.querySelector('#multi-select-bar');
  const multiBarCount = document.querySelector('#multi-select-count');
  const multiBarSend = document.querySelector('#multi-select-send');
  const multiBarClear = document.querySelector('#multi-select-clear');

  function updateMultiBar() {
    if (!multiBar) return;
    const n = selectedJobs.size;
    if (multiBarCount) multiBarCount.textContent = String(n);
    multiBar.classList.toggle('is-visible', n > 0);
  }

  if (multiBarSend) {
    multiBarSend.addEventListener('click', () => {
      const items = jobs.filter(j => selectedJobs.has(jobId(j)));
      if (!items.length) return;
      hubTrack('multi_send_to_client', { count: items.length });
      window.location.href = buildMultiMailto(items);
    });
  }

  if (multiBarClear) {
    multiBarClear.addEventListener('click', () => {
      selectedJobs.clear();
      list.querySelectorAll('input.job-select').forEach(cb => { cb.checked = false; });
      updateMultiBar();
    });
  }

  list.addEventListener('change', e => {
    const cb = e.target.closest('input.job-select');
    if (!cb) return;
    const card = cb.closest('.job-card');
    if (!card) return;
    const id = card.dataset.jobId;
    if (cb.checked) selectedJobs.add(id);
    else selectedJobs.delete(id);
    updateMultiBar();
  });

  render();
  [search, regionSel, catSel, eduSel, srcSel, submittedOnly].forEach(el => {
    if (!el) return;
    let debounce;
    el.addEventListener('input', () => {
      render();
      clearTimeout(debounce);
      debounce = setTimeout(() => hubTrack('job_filter', {
        field: el.id || el.name || 'unknown',
        value: el.type === 'checkbox' ? (el.checked ? 'on' : 'off') : (el.value || 'cleared')
      }), 800);
    });
  });

  // Delegate clicks for apply + send-to-client
  list.addEventListener('click', e => {
    const applyBtn = e.target.closest('a.btn--primary[href*="://"]');
    if (applyBtn) {
      const card = applyBtn.closest('.job-card');
      const title = card ? card.querySelector('.job-card__title')?.textContent.trim() : '';
      hubTrack('apply_click', { job_title: title.slice(0, 80), employer: card?.querySelector('.job-card__meta strong')?.textContent || '', source: applyBtn.href.split('/')[2] || '' });
    }
    const sendBtn = e.target.closest('a.btn--outline[href^="mailto:"]');
    if (sendBtn && sendBtn.title === 'Send to client') {
      const card = sendBtn.closest('.job-card');
      const title = card ? card.querySelector('.job-card__title')?.textContent.trim() : '';
      hubTrack('send_to_client', { job_title: title.slice(0, 80) });
    }
  });

  function render() {
    const q = (search.value || '').trim().toLowerCase();
    const region = regionSel ? regionSel.value : '';
    const cat = catSel ? catSel.value : '';
    const edu = eduSel ? eduSel.value : '';
    const src = srcSel ? srcSel.value : '';
    const subOnly = submittedOnly && submittedOnly.checked;
    const filtered = jobs.filter(j => {
      if (region && j.region !== region) return false;
      if (cat && j.category !== cat) return false;
      if (edu && j.edu_level !== edu) return false;
      if (src && j.source !== src) return false;
      if (subOnly && !j.submitted) return false;
      if (q) {
        const hay = (j.title + ' ' + j.employer + ' ' + (j.location || '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (countEl) {
      countEl.textContent = filtered.length === jobs.length
        ? 'Showing all ' + jobs.length + ' listings'
        : 'Showing ' + filtered.length + ' of ' + jobs.length + ' listings';
    }
    list.innerHTML = renderGrouped(filtered);
    if (empty) empty.classList.toggle('hidden', filtered.length > 0);
  }

  function renderGrouped(filtered) {
    const byRegion = {};
    filtered.forEach(j => {
      const r = j.region || 'Other';
      const c = j.category || 'Other';
      if (!byRegion[r]) byRegion[r] = {};
      if (!byRegion[r][c]) byRegion[r][c] = [];
      byRegion[r][c].push(j);
    });
    const regionList = REGION_ORDER.filter(r => byRegion[r]);
    return regionList.map((r) => {
      const catMap = byRegion[r];
      const catList = Object.keys(catMap).sort();
      const regionCount = catList.reduce((n, c) => n + catMap[c].length, 0);
      return '<details class="region-block">' +
        '<summary class="region-heading"><span class="region-heading__name">' + esc(r) + '</span>' +
        '<span class="region-heading__count">' + regionCount + ' listing' + (regionCount === 1 ? '' : 's') + '</span></summary>' +
        catList.map(c => '<details class="category-block">' +
          '<summary class="category-heading">' + esc(c) + ' <span class="category-heading__count">(' + catMap[c].length + ')</span></summary>' +
          catMap[c].map(jobCard).join('') +
        '</details>').join('') +
      '</details>';
    }).join('');
  }

  function jobCard(j) {
    const id = jobId(j);
    const checked = selectedJobs.has(id) ? ' checked' : '';
    const star = j.submitted ? '<span class="star-submitted" title="Submitted by PATH">&#11088; Submitted by PATH</span>' : '';
    const posted = j.date ? 'Posted ' + fmtDate(j.date) : '';
    const employerHtml = j.company_url
      ? '<a href="' + esc(j.company_url) + '" target="_blank" rel="noopener"><strong>' + esc(j.employer || '') + '</strong></a>'
      : '<strong>' + esc(j.employer || '') + '</strong>';
    const transit = renderTransit(j);
    const tips = (j.tip_resume || j.tip_cover)
      ? '<details class="job-tips"><summary>Resume &amp; cover letter tips</summary>' +
        (j.tip_resume ? '<div class="tip"><span class="tip-label">Resume</span> ' + esc(j.tip_resume) + '</div>' : '') +
        (j.tip_cover  ? '<div class="tip"><span class="tip-label">Cover letter</span> ' + esc(j.tip_cover) + '</div>' : '') +
        '</details>'
      : '';
    const clientLink = (j.client_subject && j.client_body)
      ? '<a class="btn btn--outline btn--small" href="mailto:?subject=' + encodeURIComponent(j.client_subject) + '&body=' + encodeURIComponent(j.client_body) + '" title="Send to client">&#9993; Send to client</a>'
      : '';
    return '<article class="job-card" data-edu="' + esc(j.edu_level || '') + '" data-job-id="' + esc(id) + '">' +
      '<label class="job-card__select" title="Select to email multiple jobs to a client"><input type="checkbox" class="job-select"' + checked + ' aria-label="Select this job for multi-send"></label>' +
      '<div class="job-card__main">' +
        '<h3 class="job-card__title">' +
          (j.url ? '<a href="' + esc(j.url) + '" target="_blank" rel="noopener">' + esc(j.title) + '</a>' : esc(j.title)) +
          ' ' + star +
        '</h3>' +
        '<p class="job-card__meta">' +
          '<span>' + employerHtml + '</span>' +
          (j.location ? '<span class="sep">&middot;</span><span>' + esc(j.location) + '</span>' : '') +
          (j.edu_label ? '<span class="sep">&middot;</span><span class="edu-tag edu-' + esc(j.edu_level) + '">' + esc(j.edu_label) + '</span>' : '') +
          (transit ? '<span class="sep">&middot;</span>' + transit : '') +
        '</p>' +
        tips +
      '</div>' +
      '<div class="job-card__aside">' +
        '<div class="job-card__salary"><strong>' + esc(j.salary || 'Not listed') + '</strong></div>' +
        (posted ? '<div class="job-card__posted"><span class="dot"></span>' + esc(posted) + '</div>' : '') +
        (j.source ? '<span class="source-pill source-pill--' + slug(j.source) + '">' + esc(j.source) + '</span>' : '') +
        (j.url ? '<a class="btn btn--primary btn--small" href="' + esc(j.url) + '" target="_blank" rel="noopener">Apply &#8599;</a>' : '') +
        clientLink +
      '</div>' +
    '</article>';
  }

  function jobId(j) {
    return j.url || ((j.title || '') + '|' + (j.employer || '') + '|' + (j.location || ''));
  }

  function renderTransit(j) {
    if (j.transit_accessible === true) {
      const agency = j.transit_agency || 'Transit nearby';
      const url = j.transit_agency_url || '';
      const label = url
        ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(agency) + '</a>'
        : esc(agency);
      return '<span class="transit transit--bus" title="Bus stop within 10-min walk">' +
        '<span class="transit-icon" aria-hidden="true">&#128652;</span>' +
        '<span class="transit-label">' + label + '</span>' +
        '</span>';
    }
    if (j.transit_accessible === false) {
      return '<span class="transit transit--car" title="No bus stop within 10-min walk">' +
        '<span class="transit-icon" aria-hidden="true">&#128663;</span>' +
        '<span class="transit-label">Car needed</span>' +
        '</span>';
    }
    return '';
  }

  function buildMultiMailto(items) {
    const subject = items.length === 1
      ? (items[0].client_subject || ('Job opportunity: ' + items[0].title))
      : items.length + ' job opportunities for you';
    const intro = items.length === 1
      ? 'I came across this job and thought it might be a good fit. Take a look:'
      : 'I came across these ' + items.length + ' jobs and thought they might be a good fit. Take a look:';
    const outro = items.length === 1
      ? 'Want to apply, or talk through whether it is a fit? Let me know.'
      : 'Want to apply to any of these, or talk through whether any are a fit? Let me know.';
    const divider = '\n\n--------------------------------------\n\n';
    const blocks = items.map(buildJobBlock).join(divider);
    const body = 'Hi [client name],\n\n' + intro + divider + blocks + divider + outro + '\n\n—\n';
    return 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function buildJobBlock(j) {
    const employerLink = j.company_url || ('https://duckduckgo.com/?q=%21ducky+' + encodeURIComponent((j.employer || '') + ' about us'));
    const salaryLine = (j.salary && j.salary !== 'Not listed') ? '  ' + j.salary : '';
    return 'THE JOB\n' +
      (j.title || '') + '\n' +
      (j.employer || '') + (j.location ? ' — ' + j.location : '') + salaryLine + '\n\n' +
      'APPLY HERE\n' + (j.url || '(see source)') + '\n\n' +
      'ABOUT THE EMPLOYER\n' + employerLink + '\n\n' +
      (j.tip_resume ? 'RESUME TIPS\n' + j.tip_resume + '\n\n' : '') +
      (j.tip_cover  ? 'COVER LETTER ANGLE\n' + j.tip_cover : '');
  }

  function injectJobPostingSchema(jobsSubset) {
    const baseUrl = location.origin + location.pathname.replace(/[^\/]*$/, '');
    const items = jobsSubset.filter(j => j.title && j.employer).map(j => {
      const valid = j.date ? new Date(new Date(j.date).getTime() + 30 * 86400000).toISOString().split('T')[0] : null;
      return {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: j.title,
        description: (j.tip_resume ? j.tip_resume + ' ' : '') + 'Apply through our job board at theHUB @PATH.',
        datePosted: j.date || undefined,
        validThrough: valid || undefined,
        employmentType: 'FULL_TIME',
        hiringOrganization: { '@type': 'Organization', name: j.employer },
        jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: j.location || 'Hamilton', addressRegion: 'ON', addressCountry: 'CA' } },
        directApply: false,
        url: j.url
      };
    });
    if (!items.length) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(items);
    document.head.appendChild(script);
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
  function fmtDate(iso) { try { return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }); } catch (e) { return iso; } }
})();

// ---- Events + calendar ----
(function () {
  const calEl = document.querySelector('#event-calendar');
  const featured = document.querySelector('#event-featured');
  const upcoming = document.querySelector('#event-upcoming');
  if (!calEl && !featured && !upcoming) return;
  const data = window.HUB_EVENTS || [];

  // Parse "YYYY-MM-DD" in LOCAL time so a date never shifts back a day (the
  // default Date(string) parses as UTC, which shows as the day before in ET).
  function parseLocal(iso) {
    const p = String(iso).split('-').map(Number);
    return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function isExt(url) { return url && /^https?:/.test(url); }
  function fmtLong(d) { return d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }
  // Weekly series show as a range ("Wednesdays, July 8 – August 26, 2026"); single events show the full date.
  function dateLabel(e) {
    if (e._until) {
      const wd = e._d.toLocaleDateString('en-CA', { weekday: 'long' }) + 's';
      const startStr = e._d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' });
      const endStr = e._until.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
      return wd + ', ' + startStr + ' – ' + endStr;
    }
    return fmtLong(e._d);
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const all = data
    .filter(e => e && e.date)
    .map(e => Object.assign({}, e, { _d: parseLocal(e.date), _until: e.weeklyUntil ? parseLocal(e.weeklyUntil) : null }))
    .sort((a, b) => a._d - b._d);
  all.forEach((e, i) => { e._i = i; });
  const endDate = e => e._until || e._d;            // last occurrence (for weekly series)
  const upcomingEvents = all.filter(e => endDate(e) >= today);

  // ----- Featured banner (only on pages that include one) -----
  let feat = null;
  if (featured) {
    if (!upcomingEvents.length) {
      featured.innerHTML = '<p>No upcoming events scheduled. Check back soon.</p>';
    } else {
      feat = upcomingEvents.find(e => e.featured) || upcomingEvents[0];
      featured.innerHTML = featuredHTML(feat);
    }
  }

  // ----- Upcoming list -----
  if (upcoming) {
    const list = feat ? upcomingEvents.filter(e => e !== feat) : upcomingEvents;
    upcoming.innerHTML = list.length ? list.map(eventCardHTML).join('') : '<p>No upcoming events scheduled. Check back soon.</p>';
  }

  // ----- Calendar -----
  if (calEl) renderCalendar();

  injectEventSchema(upcomingEvents.length ? upcomingEvents : all);

  function dateParts(d) {
    return {
      day: d.toLocaleDateString('en-CA', { weekday: 'long' }),
      month: d.toLocaleDateString('en-CA', { month: 'short' }).toUpperCase(),
      num: d.getDate(),
      year: d.getFullYear()
    };
  }
  function featuredHTML(e) {
    const dp = dateParts(e._d);
    const visual = e.image
      ? '<div class="event__image" style="background-image:url(\'' + e.image + '\')"></div>'
      : '<div class="event__datetile" aria-hidden="true">' +
          '<span class="event__datetile-day">' + dp.day + '</span>' +
          '<span class="event__datetile-month">' + dp.month + '</span>' +
          '<span class="event__datetile-num">' + dp.num + '</span>' +
          '<span class="event__datetile-year">' + dp.year + '</span>' +
        '</div>';
    return visual +
      '<div class="event__body">' +
        '<span class="event__featured-tag">Featured Event</span>' +
        '<h2>' + esc(e.title) + '</h2>' +
        '<p class="lead">' + esc(e.description) + '</p>' +
        (e.location ? '<p><strong>Where:</strong> ' + esc(e.location) + '</p>' : '') +
        '<p><strong>When:</strong> ' + dateLabel(e) + (e.time ? ' &middot; ' + esc(e.time) : '') + '</p>' +
        (e.registerUrl ? '<a class="btn btn--accent" href="' + e.registerUrl + '"' + (isExt(e.registerUrl) ? ' target="_blank" rel="noopener"' : '') + '>Register</a>' : '') +
      '</div>';
  }
  function eventCardHTML(e) {
    return '<article class="card">' +
      '<span class="event__date">' + dateLabel(e) + '</span>' +
      '<h3>' + esc(e.title) + '</h3>' +
      (e.time || e.location ? '<p class="card__meta">' + esc(e.time || '') + (e.time && e.location ? ' &middot; ' : '') + esc(e.location || '') + '</p>' : '') +
      '<p>' + esc(e.description) + '</p>' +
      '<div class="card__footer">' +
        (e.registerUrl ? '<a class="btn btn--outline" href="' + e.registerUrl + '"' + (isExt(e.registerUrl) ? ' target="_blank" rel="noopener"' : '') + '>Register</a>' : '') +
      '</div>' +
    '</article>';
  }

  function renderCalendar() {
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDay = {};
    all.forEach(e => {
      const occ = [];
      if (e._until) {
        for (let cur = new Date(e._d); cur <= e._until; cur.setDate(cur.getDate() + 7)) occ.push(new Date(cur));
      } else {
        occ.push(e._d);
      }
      occ.forEach(dt => {
        const k = dt.getFullYear() + '-' + dt.getMonth() + '-' + dt.getDate();
        (byDay[k] = byDay[k] || []).push(e);
      });
    });
    const start = (upcomingEvents[0] || all[0] || { _d: new Date() })._d;
    const view = new Date(start.getFullYear(), start.getMonth(), 1);

    function draw() {
      const y = view.getFullYear(), m = view.getMonth();
      const startDow = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      let h = '<div class="cal__bar">' +
        '<button class="cal__nav" type="button" data-nav="-1" aria-label="Previous month">‹</button>' +
        '<h2 class="cal__title">' + MONTHS[m] + ' ' + y + '</h2>' +
        '<button class="cal__nav" type="button" data-nav="1" aria-label="Next month">›</button>' +
        '</div><div class="cal__grid" role="grid">';
      WD.forEach(w => { h += '<div class="cal__dow" role="columnheader">' + w + '</div>'; });
      for (let i = 0; i < startDow; i++) h += '<div class="cal__cell cal__cell--empty" role="gridcell"></div>';
      for (let d = 1; d <= days; d++) {
        const evs = byDay[y + '-' + m + '-' + d] || [];
        const cellDate = new Date(y, m, d);
        const isToday = cellDate.getTime() === today.getTime();
        const past = cellDate < today;
        const cls = 'cal__cell' + (evs.length ? ' cal__cell--has' : '') + (isToday ? ' cal__cell--today' : '') + (past ? ' cal__cell--past' : '');
        h += '<div class="' + cls + '" role="gridcell"><span class="cal__date">' + d + '</span>';
        evs.forEach(e => {
          h += '<button class="cal__chip" type="button" data-ev="' + e._i + '" title="' + escAttr(e.title + (e.time ? ' · ' + e.time : '')) + '">' + esc(e.title) + '</button>';
        });
        h += '</div>';
      }
      calEl.innerHTML = h + '</div>';
    }

    calEl.addEventListener('click', function (ev) {
      const nav = ev.target.closest('[data-nav]');
      if (nav) { view.setMonth(view.getMonth() + Number(nav.getAttribute('data-nav'))); draw(); return; }
      const chip = ev.target.closest('[data-ev]');
      if (chip) openModal(all[Number(chip.getAttribute('data-ev'))]);
    });
    draw();
  }

  function openModal(e) {
    if (!e) return;
    let modal = document.querySelector('#cal-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cal-modal';
      modal.className = 'cal-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = '<div class="cal-modal__backdrop" data-close></div>' +
        '<div class="cal-modal__panel"><button class="cal-modal__close" type="button" aria-label="Close" data-close>×</button>' +
        '<div class="cal-modal__content"></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (ev) { if (ev.target.hasAttribute('data-close')) modal.classList.remove('is-open'); });
      document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') modal.classList.remove('is-open'); });
    }
    modal.querySelector('.cal-modal__content').innerHTML =
      '<span class="event__date">' + dateLabel(e) + (e.time ? ' &middot; ' + esc(e.time) : '') + '</span>' +
      '<h3 id="cal-modal-title">' + esc(e.title) + '</h3>' +
      (e.location ? '<p class="card__meta">' + esc(e.location) + '</p>' : '') +
      '<p>' + esc(e.description) + '</p>' +
      (e.registerUrl ? '<p><a class="btn btn--accent" href="' + e.registerUrl + '"' + (isExt(e.registerUrl) ? ' target="_blank" rel="noopener"' : '') + '>Register</a></p>' : '');
    modal.setAttribute('aria-labelledby', 'cal-modal-title');
    modal.classList.add('is-open');
    const c = modal.querySelector('.cal-modal__close'); if (c) c.focus();
  }

  function injectEventSchema(events) {
    const items = events.filter(e => e.title && e.date).map(e => ({
      '@context': 'https://schema.org/',
      '@type': 'Event',
      name: e.title,
      startDate: e.date,
      description: e.description || e.title,
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'VirtualLocation', url: location.href },
      organizer: { '@type': 'Organization', name: 'theHUB @PATH', url: 'https://kwestwoodpath.github.io/the-hub-path/' }
    }));
    if (!items.length) return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(items);
    document.head.appendChild(s);
  }
})();

// ---- Newsletter past-session detection ----
(function () {
  const cards = document.querySelectorAll('.session-card[data-last-date]');
  if (!cards.length) return;
  const today = new Date(new Date().toDateString());
  cards.forEach(card => {
    const last = new Date(card.dataset.lastDate);
    if (isNaN(last.getTime()) || last >= today) return;
    card.classList.add('session-card--closed');
    const btn = card.querySelector('a.btn, button.btn');
    if (btn) {
      const badge = document.createElement('span');
      badge.className = 'session-card__closed-badge';
      badge.textContent = 'Registration closed';
      badge.setAttribute('aria-label', 'Registration closed - session date has passed');
      btn.replaceWith(badge);
    }
  });
})();

// ---- Newsletter sidebar ----
(function () {
  const sidebar = document.querySelector('#newsletter-sidebar-list');
  if (!sidebar) return;
  const data = window.HUB_NEWSLETTERS || [];
  const sorted = data.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const here = location.pathname.split('/').pop();
  sidebar.innerHTML = sorted.map(n => {
    const d = new Date(n.date);
    const label = d.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
    const href = n.page || '#';
    const current = (n.page && href === here) ? ' is-current' : '';
    return '<li><a href="' + href + '" class="' + current.trim() + '"><span class="sidebar-date">' + label + '</span><span class="sidebar-title">' + n.title + '</span></a></li>';
  }).join('');
})();

// ---- Track external nav events (Calendly, MS Forms) ----
(function () {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.href || '';
    if (href.includes('calendly.com')) hubTrack('calendly_click', { url: href });
    else if (href.includes('forms.office.com')) hubTrack('form_open', { url: href });
  });
})();
