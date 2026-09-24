/**
 * à¦†à¦‡à¦¨à¦¸à¦¹à¦¾à¦¯à¦¼ â€” SPA router à¦“ à¦¸à¦¬ à¦ªà§‡à¦œà§‡à¦° à¦²à¦œà¦¿à¦•à¥¤
 * à¦°à¦¾à¦‰à¦Ÿ: #/, #/topics, #/topic/:id, #/article/:id, #/guide, #/search?q=,
 *       #/apply, #/track, #/offices, #/news, #/help, #/login, #/register,
 *       #/dashboard, #/complaint
 */
'use strict';

// ---------- à¦›à§‹à¦Ÿ helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');

let BOOT = null;           // /api/bootstrap à¦¥à§‡à¦•à§‡ à¦†à¦¸à¦¾ à¦¡à§‡à¦Ÿà¦¾
let ME = null;             // à¦²à¦—à¦‡à¦¨ à¦•à¦°à¦¾ à¦‡à¦‰à¦œà¦¾à¦°
const bnNum = (s) => String(s).replace(/[0-9]/g, (d) => 'à§¦à§§à§¨à§©à§ªà§«à§¬à§­à§®à§¯'[d]);

async function apiGet(name, params = {}) {
  const q = new URLSearchParams(params).toString();
  const r = await fetch('/api/' + name + (q ? '?' + q : ''));
  return r.json();
}
async function apiPost(name, body) {
  const r = await fetch('/api/' + name, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {})
  });
  return r.json();
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 3500);
}

// ---------- à¦¥à¦¿à¦® / à¦­à¦¾à¦·à¦¾ / a11y ----------
function initShell() {
  // à¦¡à¦¾à¦¯à¦¼à¦¨à¦¾à¦®à¦¿à¦• à¦²à¦¾à¦‡à¦­ à¦¬à¦¾à¦‚à¦²à¦¾ à¦¤à¦¾à¦°à¦¿à¦–
  const dateEl = $('#govLiveDate');
  if (dateEl) {
    const now = new Date();
    const days = ['à¦°à¦¬à¦¿à¦¬à¦¾à¦°', 'à¦¸à§‹à¦®à¦¾à¦¬à¦¾à¦°', 'à¦®à¦™à§à¦—à¦²à¦¬à¦¾à¦°', 'à¦¬à§à¦§à¦¬à¦¾à¦°', 'à¦¬à§ƒà¦¹à¦¸à§à¦ªà¦¤à¦¿à¦¬à¦¾à¦°', 'à¦¶à§à¦•à§à¦°à¦¬à¦¾à¦°', 'à¦¶à¦¨à¦¿à¦¬à¦¾à¦°'];
    const months = ['à¦œà¦¾à¦¨à§à§Ÿà¦¾à¦°à¦¿', 'à¦«à§‡à¦¬à§à¦°à§à§Ÿà¦¾à¦°à¦¿', 'à¦®à¦¾à¦°à§à¦š', 'à¦à¦ªà§à¦°à¦¿à¦²', 'à¦®à§‡', 'à¦œà§à¦¨', 'à¦œà§à¦²à¦¾à¦‡', 'à¦†à¦—à¦¸à§à¦Ÿ', 'à¦¸à§‡à¦ªà§à¦Ÿà§‡à¦®à§à¦¬à¦°', 'à¦…à¦•à§à¦Ÿà§‹à¦¬à¦°', 'à¦¨à¦­à§‡à¦®à§à¦¬à¦°', 'à¦¡à¦¿à¦¸à§‡à¦®à§à¦¬à¦°'];
    dateEl.textContent = `${days[now.getDay()]}, ${bnNum(now.getDate())} ${months[now.getMonth()]}, ${bnNum(now.getFullYear())}`;
  }

  // Force light theme â€“ dark mode disabled
  document.documentElement.dataset.theme = 'light';
  // Hide theme toggle button if present
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.style.display = 'none';
  }

  // à¦­à¦¾à¦·à¦¾
  const savedLang = localStorage.getItem('lang');
  if (savedLang) document.documentElement.lang = savedLang;
  const langToggleBtn = $('#langToggle');
  if (langToggleBtn) {
    langToggleBtn.textContent = document.documentElement.lang === 'bn' ? 'æ–‡A English' : 'à¦¬à¦¾à¦‚ à¦¬à¦¾à¦‚à¦²à¦¾';
    langToggleBtn.onclick = () => {
      const next = document.documentElement.lang === 'bn' ? 'en' : 'bn';
      document.documentElement.lang = next;
      localStorage.setItem('lang', next);
      langToggleBtn.textContent = next === 'bn' ? 'æ–‡A English' : 'à¦¬à¦¾à¦‚ à¦¬à¦¾à¦‚à¦²à¦¾';
      applyI18n();
      route();
    };
  }

  // à¦ªà§à¦°à¦¬à§‡à¦¶à¦—à¦®à§à¦¯à¦¤à¦¾
  const a11y = JSON.parse(localStorage.getItem('a11y') || '{}');
  if (a11y.fscale) document.documentElement.style.setProperty('--fscale', a11y.fscale);
  if (a11y.contrast) document.documentElement.dataset.contrast = 'high';
  $('#a11yToggle').onclick = () => $('#a11yPanel').classList.toggle('hidden');
  const floatingA11y = $('#floatingA11yBtn');
  if (floatingA11y) {
    floatingA11y.onclick = () => $('#a11yPanel').classList.toggle('hidden');
  }
  $('#fsInc').onclick = () => setFscale(Math.min(1.5, (a11y.fscale || 1) + .1));
  $('#fsDec').onclick = () => setFscale(Math.max(.8, (a11y.fscale || 1) - .1));
  $('#contrastToggle').onclick = () => {
    const on = document.documentElement.dataset.contrast === 'high';
    if (on) delete document.documentElement.dataset.contrast; else document.documentElement.dataset.contrast = 'high';
    a11y.contrast = !on; localStorage.setItem('a11y', JSON.stringify(a11y));
  };
  $('#a11yReset').onclick = () => { localStorage.removeItem('a11y'); location.reload(); };
  function setFscale(v) {
    a11y.fscale = Math.round(v * 10) / 10;
    document.documentElement.style.setProperty('--fscale', a11y.fscale);
    localStorage.setItem('a11y', JSON.stringify(a11y));
  }

  // à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦®à§‡à¦¨à§
  $('#navBurger').onclick = () => $('#mainNav').classList.toggle('open');

  // à¦šà§à¦¯à¦¾à¦Ÿ
  const chatBody = $('#chatBody');
  const chatOpen = () => { $('#chatWidget').classList.remove('hidden'); $('#chatText').focus(); };
  $('#chatFab').onclick = () => { const w = $('#chatWidget'); if (w.classList.contains('hidden')) chatOpen(); else w.classList.add('hidden'); };
  $('#chatClose').onclick = () => $('#chatWidget').classList.add('hidden');
  window.__chatOpen = chatOpen;

  const chatNav = (route, label) => {
    if (route === location.hash) return;
    const div = document.createElement('div');
    div.className = 'msg bot chat-acted';
    div.textContent = 'âž¡ï¸ ' + (label || route);
    chatBody.appendChild(div); chatBody.scrollTop = chatBody.scrollHeight;
  };

  const renderActions = (r) => {
    const wrap = document.createElement('div');
    wrap.className = 'chat-actions';
    const mkBtn = (html, cls, fn) => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'chat-chip ' + cls; btn.innerHTML = html;
      btn.onclick = fn; return btn;
    };
    if (r.action && r.action.route) {
      wrap.appendChild(mkBtn(esc(r.action.label || r.action.route), 'primary', () => {
        chatNav(r.action.route, r.action.label);
        $('#chatWidget').classList.add('hidden');
        location.hash = r.action.route;
      }));
    }
    for (const key of r.actions || []) {
      const acts = {
        home: ['#/','ðŸ  à¦¹à§‹à¦®'], library: ['#/topics','ðŸ“š à¦²à¦¾à¦‡à¦¬à§à¦°à§‡à¦°à¦¿'], guide: ['#/guide','ðŸ§­ à¦—à¦¾à¦‡à¦¡'],
        apply: ['#/apply','ðŸ“ à¦†à¦¬à§‡à¦¦à¦¨'], track: ['#/track','ðŸ“¦ à¦Ÿà§à¦°à§à¦¯à¦¾à¦•'], offices: ['#/offices','ðŸ—ºï¸ à¦…à¦«à¦¿à¦¸'],
        news: ['#/news','ðŸ“° à¦¨à¦¿à¦‰à¦œ'], help: ['#/help','ðŸ¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾'], call: ['#/call','ðŸ“ž à¦•à¦² à¦•à¦°à§à¦¨'],
        login: ['#' + (ME ? '/dashboard' : '/login'), ME ? 'ðŸ‘¤ à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡' : 'ðŸ” à¦²à¦—à¦‡à¦¨'],
        dashboard: ['#/dashboard','ðŸ‘¤ à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡'], complaint: ['#/complaint','ðŸ“£ à¦…à¦­à¦¿à¦¯à§‹à¦—'], search: ['#/search','ðŸ” à¦–à§à¦à¦œà§à¦¨']
      };
      const a = acts[key]; if (!a) continue;
      wrap.appendChild(mkBtn(a[1], '', () => {
        chatNav(a[0], a[1]);
        $('#chatWidget').classList.add('hidden');
        location.hash = a[0];
      }));
    }
    if (wrap.children.length) chatBody.appendChild(wrap);
  };

  const renderQuick = (r) => {
    if (!r.quick || !r.quick.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'chat-actions quick';
    for (const q of r.quick) {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'chat-chip'; btn.textContent = q;
      btn.onclick = () => {
        const fake = document.createElement('div');
        fake.className = 'msg user'; fake.textContent = q;
        chatBody.appendChild(fake); chatBody.scrollTop = chatBody.scrollHeight;
        sendChat(q);
      };
      wrap.appendChild(btn);
    }
    chatBody.appendChild(wrap);
  };

  const sendChat = async (override) => {
    const txt = (override != null ? override : $('#chatText').value).trim();
    if (!txt) return;
    if (override == null) $('#chatText').value = '';
    chatBody.insertAdjacentHTML('beforeend', `<div class="msg user">${esc(txt)}</div>`);
    chatBody.scrollTop = chatBody.scrollHeight;
    const typing = document.createElement('div');
    typing.className = 'msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatBody.appendChild(typing); chatBody.scrollTop = chatBody.scrollHeight;
    const r = await apiPost('chat', { message: txt });
    typing.remove();
    const reply = String(r.reply || t('errGeneric'));
    const fmt = esc(reply).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    chatBody.insertAdjacentHTML('beforeend', `<div class="msg bot">${fmt}</div>`);
    if (r.route && r.autoNavigate !== false && r.action) {
      renderActions(r);
    } else if (r.action && r.action.route) {
      // à¦…à¦Ÿà§‹ à¦¨à§‡à¦­à¦¿à¦—à§‡à¦Ÿ â€” à¦¸à¦¾à¦‡à¦Ÿ à¦•à¦¨à§à¦Ÿà§à¦°à§‹à¦²
      chatNav(r.action.route, r.action.label);
      location.hash = r.action.route;
    }
    renderActions(r);
    renderQuick(r);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  $('#chatForm').onsubmit = async (e) => { e.preventDefault(); await sendChat(); };
}

// ---------- router ----------
const routes = [
  { re: /^#?\/?$/, fn: pageHome },
  { re: /^#\/services$/, fn: pageServices },
  { re: /^#\/eligibility$/, fn: pageEligibility },
  { re: /^#\/topics$/, fn: pageTopics },
  { re: /^#\/topic\/([\w-]+)$/, fn: pageTopic },
  { re: /^#\/section\/([\w-]+)$/, fn: pageSection },
  { re: /^#\/form\/([\w-]+)$/, fn: pageForm },
  { re: /^#\/article\/([\w-]+)$/, fn: pageArticle },
  { re: /^#\/guide$/, fn: pageGuide },
  { re: /^#\/search$/, fn: pageSearch },
  { re: /^#\/apply$/, fn: pageApply },
  { re: /^#\/track$/, fn: pageTrack },
  { re: /^#\/offices$/, fn: pageOffices },
  { re: /^#\/news$/, fn: pageNews },
  { re: /^#\/news\/([\w-]+)$/, fn: pageNewsDetail },
  { re: /^#\/call$/, fn: pageCall },
  { re: /^#\/help$/, fn: pageHelp },
  { re: /^#\/help\/([\w-]+)$/, fn: pageHelpChannel },
  { re: /^#\/login(\?.*)?$/, fn: pageLogin },
  { re: /^#\/(register|signup)(\?.*)?$/, fn: pageRegister },
  { re: /^#\/dashboard$/, fn: pageDashboard },
  { re: /^#\/console(\?.*)?$/, fn: pageConsole },
  { re: /^#\/complaint$/, fn: pageComplaint }
];

async function route() {
  const hash = location.hash || '#/';
  applyI18n();
  $$('#mainNav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === hash.split('?')[0]));
  for (const r of routes) {
    const m = hash.match(r.re);
    if (m) { try { await r.fn(...m.slice(1)); } catch (e) { console.error(e); app.innerHTML = `<div class="empty-state">${t('errGeneric')}</div>`; } window.scrollTo(0, 0); return; }
  }
  app.innerHTML = `<div class="empty-state"><h2>à§ªà§¦à§ª</h2><p>à¦ªà§‡à¦œà¦Ÿà¦¿ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦¯à¦¾à¦¯à¦¼à¦¨à¦¿à¥¤</p></div>`;
}

// ---------- à¦®à§à¦¯à¦¾à¦ª (Leaflet) ----------
let mapObj = null;
function initOfficeMap(highlightId) {
  const el = document.getElementById('map');
  if (!el || typeof L === 'undefined') return;
  if (mapObj) { mapObj.remove(); mapObj = null; }
  mapObj = L.map('map', { scrollWheelZoom: true }).setView([23.8, 90.2], 6.4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(mapObj);
  const group = [];
  for (const o of BOOT.offices) {
    if (o.lat == null) continue;
    const color = o.type === 'special' ? '#C25E4C' : o.type === 'labour' ? '#B8863B' : o.type === 'pilot' ? '#5A7A9A' : '#3D9970';
    const marker = L.circleMarker([o.lat, o.lng], { radius: 7, color, fillColor: color, fillOpacity: .85, weight: 2 });
    marker.bindPopup(`<div class="map-popup"><strong>${esc(o.name)}</strong><span>${esc(o.address)}</span><br>ðŸ“ž <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br>ðŸ•˜ ${esc(o.hours)}</div>`);
    marker.on('click', () => highlightCard(o.id));
    marker.addTo(mapObj);
    group.push(marker);
    o._marker = marker;
  }
  if (highlightId) {
    const o = BOOT.offices.find((x) => x.id === highlightId);
    if (o && o._marker) {
      mapObj.setView([o.lat, o.lng], 12);
      setTimeout(() => o._marker.openPopup(), 350);
    }
  }
}
function highlightCard(id) {
  const card = document.querySelector(`[data-office="${id}"]`);
  if (card) {
    $$('.office-card').forEach((c) => c.classList.remove('active'));
    card.classList.add('active');
    card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ---------- à¦¹à§‹à¦® à¦ªà§‡à¦œ (Reference Site Inspired UI) ----------
async function pageHome() {
  app.innerHTML = `
  <!-- à§§. à¦¹à¦¿à¦°à§‹ à¦¸à§‡à¦•à¦¶à¦¨ (Gavel Background & Judicial Atmosphere) -->
  <section class="ref-hero">
    <div class="container ref-hero-inner">
      <h1 class="ref-hero-title">
        à¦¨à§à¦¯à¦¾à¦¯à¦¼à¦¬à¦¿à¦šà¦¾à¦°à§‡à¦° à¦ªà¦¥à§‡,<br>à¦†à¦®à¦°à¦¾ à¦†à¦›à¦¿ à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦¾à¦¶à§‡, à¦à¦• à¦ à¦¿à¦•à¦¾à¦¨à¦¾à¦¯à¦¼
      </h1>
      <p class="ref-hero-subtitle">
        à¦†à¦‡à¦¨à¦¿ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶, à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾à¦° à¦œà¦¨à§à¦¯ à¦†à¦¬à§‡à¦¦à¦¨, à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾ à¦à¦¬à¦‚ à¦®à¦¾à¦®à¦²à¦¾à¦° à¦…à¦—à§à¦°à¦—à¦¤à¦¿â€”à¦¸à¦¬à¦•à¦¿à¦›à§ à¦¸à¦¹à¦œà§‡à¦‡ à¦ªà¦¾à¦¨ à¦à¦• à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦®à§‡
      </p>
      <div class="ref-hero-actions">
        <a class="btn-ref-hero-primary" href="#/apply">
          <span>à¦¨à¦¤à§à¦¨ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨</span> <span>â†’</span>
        </a>
        <a class="btn-ref-hero-outline" href="#/track">
          <span>ðŸ”</span> <span>à¦†à¦¬à§‡à¦¦à¦¨ à¦Ÿà§à¦°à§à¦¯à¦¾à¦• à¦•à¦°à§à¦¨</span>
        </a>
      </div>
      <div class="hero-demo-chips">
        <span>à¦¡à§‡à¦®à§‹ à¦Ÿà§à¦°à§à¦¯à¦¾à¦•à¦¿à¦‚ à¦Ÿà§‡à¦¸à§à¦Ÿ:</span>
        <button type="button" class="chip-ref-demo" data-id="APP-2026-0001" data-phone="01711223344" data-last4="3344">APP-2026-0001 (à¦®à¦¯à¦¼à§‚à¦°à§€ / à§©à§©à§ªà§ª)</button>
        <button type="button" class="chip-ref-demo" data-id="DLAS-NET-2026-04420" data-phone="01711223344" data-last4="3344">DLAS-NET-2026-04420 (à§©à§©à§ªà§ª)</button>
      </div>
    </div>
  </section>

  <!-- à§¨. à¦†à¦ªà¦¨à¦¾à¦° à¦œà¦¨à§à¦¯ à¦†à¦®à¦°à¦¾ à¦¯à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦—à§à¦²à§‹ à¦¦à¦¿à¦šà§à¦›à¦¿ (Services & Stats) -->
  <section class="ref-section">
    <div class="container">
      <div class="sec-header-split">
        <div>
          <h2 class="sec-heading-serif">à¦†à¦ªà¦¨à¦¾à¦° à¦œà¦¨à§à¦¯ à¦†à¦®à¦°à¦¾ à¦¯à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦—à§à¦²à§‹ à¦¦à¦¿à¦šà§à¦›à¦¿</h2>
        </div>
        <div>
          <p class="sec-heading-desc">
            à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦‡à¦¨à¦¿ à¦¸à¦®à¦¸à§à¦¯à¦¾à¦° à¦§à¦°à¦¨ à¦¯à¦¾à¦‡ à¦¹à§‹à¦• à¦¨à¦¾ à¦•à§‡à¦¨, à¦¸à¦ à¦¿à¦• à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà§‡à¦¤à§‡ à¦†à¦ªà¦¨à¦¾à¦•à§‡ à¦à¦•à¦¾ à¦ªà¦¥ à¦–à§à¦à¦œà¦¤à§‡ à¦¹à¦¬à§‡ à¦¨à¦¾à¥¤ à¦†à¦®à¦°à¦¾ à¦¥à¦¾à¦•à¦›à¦¿ à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦¾à¦¶à§‡à¥¤
          </p>
        </div>
      </div>

      <div class="ref-services-grid">
        <div class="ref-service-card">
          <div class="ref-service-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3>à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦¬à¦¿à¦°à§‹à¦§ à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿</h3>
          <p>à¦†à¦¦à¦¾à¦²à¦¤à§‡à¦° à¦¦à§€à¦°à§à¦˜ à¦ªà§à¦°à¦•à§à¦°à¦¿à¦¯à¦¼à¦¾à¦¯à¦¼ à¦¨à¦¾ à¦—à¦¿à¦¯à¦¼à§‡ à¦‰à¦ªà¦¯à§à¦•à§à¦¤ à¦¬à¦¿à¦°à§‹à¦§ à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦¶à¦¾à¦¨à§à¦¤à¦¿à¦ªà§‚à¦°à§à¦£à¦­à¦¾à¦¬à§‡ à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿à¦° à¦¸à§à¦¯à§‹à¦—à¥¤</p>
        </div>

        <div class="ref-service-card">
          <div class="ref-service-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>à¦†à¦‡à¦¨à¦—à¦¤ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶</h3>
          <p>à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦‡à¦¨à¦¿ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§€à¦¯à¦¼ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦“ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦†à¦‡à¦¨ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾à¦° à¦¸à¦ à¦¿à¦• à¦¦à¦¿à¦•à¦¨à¦¿à¦°à§à¦¦à§‡à¦¶à¦¨à¦¾à¥¤</p>
        </div>

        <div class="ref-service-card">
          <div class="ref-service-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v18M7 21h10M12 6l7 2M12 6L5 8M19 8l-2.5 6a3.5 3.5 0 0 1-5 0L19 8zM5 8l2.5 6a3.5 3.5 0 0 0 5 0L5 8z"/>
            </svg>
          </div>
          <h3>à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦“ à¦†à¦¦à¦¾à¦²à¦¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾</h3>
          <p>à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾à¦° à¦­à¦¿à¦¤à§à¦¤à¦¿à¦¤à§‡ à¦ªà§à¦¯à¦¾à¦¨à§‡à¦² à¦†à¦‡à¦¨à¦œà§€à¦¬à§€à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦®à¦¾à¦®à¦²à¦¾ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦“ à¦†à¦¦à¦¾à¦²à¦¤-à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¥¤</p>
        </div>

        <div class="ref-service-card">
          <div class="ref-service-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3>à¦œà¦°à§à¦°à¦¿ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾</h3>
          <p>à¦œà¦°à§à¦°à¦¿ à¦¨à¦¿à¦°à§à¦¯à¦¾à¦¤à¦¨, à¦¬à¦¿à¦¨à¦¾ à¦¬à¦¿à¦šà¦¾à¦°à§‡ à¦†à¦Ÿà¦• à¦“ à¦†à¦‡à¦¨à¦¿ à¦¸à¦®à¦¸à§à¦¯à¦¾à¦¯à¦¼ à¦¤à¦¾à§Žà¦•à§à¦·à¦£à¦¿à¦• à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦“ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦†à¦‡à¦¨à¦¿ à¦ªà¦¦à¦•à§à¦·à§‡à¦ªà¥¤</p>
        </div>
      </div>

      <!-- Metrics Bar -->
      <div class="ref-metrics-bar">
        <div class="ref-metric-item">
          <h4>à§© à¦¬à¦›à¦°</h4>
          <span>à¦ªà§à¦°à¦•à¦²à§à¦ªà§‡à¦° à¦¸à¦®à¦¯à¦¼à¦•à¦¾à¦²</span>
        </div>
        <div class="ref-metric-item">
          <h4>à§©à§¦à§¦</h4>
          <span>à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨à¦¸à¦®à§‚à¦¹</span>
        </div>
        <div class="ref-metric-item">
          <h4>à§¬à§ª</h4>
          <span>à¦œà§‡à¦²à¦¾à¦¯à¦¼ à¦ªà§‚à¦°à§à¦£ à¦•à¦­à¦¾à¦°à§‡à¦œ</span>
        </div>
        <div class="ref-metric-item">
          <h4>à§¬.à§« à¦²à¦•à§à¦·+</h4>
          <span>à¦¸à§‡à¦¬à¦¾à¦—à§à¦°à¦¹à§€à¦¤à¦¾ à¦¨à¦¾à¦—à¦°à¦¿à¦•</span>
        </div>
      </div>
    </div>
  </section>

  <!-- à§©. à¦†à¦ªà¦¨à¦¿ à¦•à§‹à¦¨ à¦§à¦°à¦¨à§‡à¦° à¦†à¦‡à¦¨à¦¿ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦šà¦¾à¦¨? (Photographic Topic Cards) -->
  <section class="ref-section-alt">
    <div class="container">
      <div class="sec-header-split">
        <div>
          <h2 class="sec-heading-serif">à¦†à¦ªà¦¨à¦¿ à¦•à§‹à¦¨ à¦§à¦°à¦¨à§‡à¦° à¦†à¦‡à¦¨à¦¿ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦šà¦¾à¦¨?</h2>
        </div>
        <div>
          <p class="sec-heading-desc">
            à¦¬à¦¿à¦­à¦¿à¦¨à§à¦¨ à¦¬à¦¿à¦·à§Ÿà§‡ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾à¦° à¦œà¦¨à§à¦¯ à¦‰à¦ªà¦¯à§à¦•à§à¦¤ à¦¬à¦¿à¦­à¦¾à¦— à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨à¥¤
          </p>
        </div>
      </div>

      <div class="ref-topics-grid">
        <a class="ref-topic-card" href="#/topic/family">
          <div class="ref-topic-img-wrap">
            <img src="/img/topic_family.jpg" alt="à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾" loading="lazy">
          </div>
          <div class="ref-topic-body">
            <h3>à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦•</h3>
            <p>à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦¸à¦®à§à¦ªà¦°à§à¦•, à¦¬à¦¿à¦¬à¦¾à¦¹, à¦¦à§‡à¦¨à¦®à§‹à¦¹à¦°, à¦¬à¦¿à¦šà§à¦›à§‡à¦¦, à¦¸à¦¨à§à¦¤à¦¾à¦¨à§‡à¦° à¦¹à§‡à¦«à¦¾à¦œà¦¤ à¦“ à¦…à¦¨à§à¦¯à¦¾à¦¨à§à¦¯ à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦¬à¦¿à¦·à§Ÿà¥¤</p>
          </div>
        </a>

        <a class="ref-topic-card" href="#/topic/land">
          <div class="ref-topic-img-wrap">
            <img src="/img/topic_land.jpg" alt="à¦œà¦®à¦¿ à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾" loading="lazy">
          </div>
          <div class="ref-topic-body">
            <h3>à¦œà¦®à¦¿ à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤</h3>
            <p>à¦œà¦®à¦¿ à¦•à§à¦°à§Ÿ-à¦¬à¦¿à¦•à§à¦°à§Ÿ, à¦°à§‡à¦•à¦°à§à¦¡ à¦¸à¦‚à¦¶à§‹à¦§à¦¨ à¦“ à¦…à¦—à§à¦°à¦•à§à¦°à§Ÿ (Pre-emption) à¦…à¦§à¦¿à¦•à¦¾à¦°-à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤à¥¤</p>
          </div>
        </a>

        <a class="ref-topic-card" href="#/topic/elder">
          <div class="ref-topic-img-wrap">
            <img src="/img/topic_elder.jpg" alt="à¦…à¦­à¦¿à¦­à¦¾à¦¬à¦•à¦¦à§‡à¦° à¦­à¦°à¦£à¦ªà§‹à¦·à¦£" loading="lazy">
          </div>
          <div class="ref-topic-body">
            <h3>à¦…à¦­à¦¿à¦­à¦¾à¦¬à¦•à¦¦à§‡à¦° à¦­à¦°à¦£à¦ªà§‹à¦·à¦£</h3>
            <p>à¦ªà¦¿à¦¤à¦¾-à¦®à¦¾à¦¤à¦¾à¦° à¦­à¦°à¦£à¦ªà§‹à¦·à¦£ à¦†à¦‡à¦¨ à§¨à§¦à§§à§© à¦“ à¦ªà§à¦°à¦¬à§€à¦£à¦¦à§‡à¦° à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦“ à¦¤à¦¾à¦à¦¦à§‡à¦° à¦…à¦§à¦¿à¦•à¦¾à¦°-à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤à¥¤</p>
          </div>
        </a>

        <a class="ref-topic-card" href="#/topic/civil">
          <div class="ref-topic-img-wrap">
            <img src="/img/topic_civil.jpg" alt="à¦¦à§‡à¦“à§Ÿà¦¾à¦¨à¦¿ à¦¬à¦¿à¦°à§‹à¦§" loading="lazy">
          </div>
          <div class="ref-topic-body">
            <h3>à¦¦à§‡à¦“à§Ÿà¦¾à¦¨à¦¿</h3>
            <p>à¦¸à¦®à§à¦ªà¦¤à§à¦¤à¦¿, à¦šà§à¦•à§à¦¤à¦¿, à¦…à¦§à¦¿à¦•à¦¾à¦°, à¦¸à¦¾à¦²à¦¿à¦¸ à¦“ à¦•à§à¦·à¦¤à¦¿à¦ªà§‚à¦°à¦£-à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾à¥¤</p>
          </div>
        </a>
      </div>

      <div style="text-align:center">
        <a class="btn-ref-more" href="#/topics">à¦†à¦°à¦“ à¦†à¦‡à¦¨à¦¿ à¦¬à¦¿à¦·à§Ÿ à¦¦à§‡à¦–à§à¦¨ â†’</a>
      </div>
    </div>
  </section>

  <!-- à§ª. à¦†à¦®à¦¿ à¦•à¦¿ à¦†à¦°à§à¦¥à¦¿à¦• à¦¸à¦¹à¦¯à§‹à¦—à¦¿à¦¤à¦¾ à¦ªà¦¾à¦¬à§‹? (Eligibility Checker) -->
  <section class="ref-section">
    <div class="container">
      <div class="ref-eligibility-wrap">
        <div>
          <h2 class="sec-heading-serif">à¦†à¦®à¦¿ à¦•à¦¿ à¦†à¦°à§à¦¥à¦¿à¦• à¦¸à¦¹à¦¯à§‹à¦—à¦¿à¦¤à¦¾ à¦ªà¦¾à¦¬à§‹?</h2>
          <p style="font-weight:700;margin-top:1.5rem;font-size:1.1rem;color:#0F172A">à¦•à¦¾à¦°à¦¾ à¦¬à¦¿à¦¶à§‡à¦· à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦ªà¦¾à¦¬à§‡à¦¨:</p>
          <ul class="eligibility-check-list">
            <li class="eligibility-check-item">
              <span class="check-circle">âœ“</span>
              <span><strong>à¦¨à¦¾à¦°à§€ à¦à¦¬à¦‚ à¦¶à¦¿à¦¶à§</strong> (à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦¿à¦¤ à¦†à§Ÿà§‡à¦° à¦¶à¦°à§à¦¤ à¦¶à¦¿à¦¥à¦¿à¦² à¦“ à¦…à¦—à§à¦°à¦¾à¦§à¦¿à¦•à¦¾à¦°)</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">âœ“</span>
              <span><strong>à¦…à¦¸à¦šà§à¦›à¦² à¦“ à¦¦à¦°à¦¿à¦¦à§à¦° à¦¨à¦¾à¦—à¦°à¦¿à¦•</strong> (à¦¬à¦¾à¦°à§à¦·à¦¿à¦• à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦†à§Ÿ â‚¹à§§,à§«à§¦,à§¦à§¦à§¦-à¦à¦° à¦•à¦®)</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">âœ“</span>
              <span><strong>à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€ à¦¬à§à¦¯à¦•à§à¦¤à¦¿</strong> (à¦¶à¦¾à¦°à§€à¦°à¦¿à¦• à¦¬à¦¾ à¦®à¦¾à¦¨à¦¸à¦¿à¦• à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€)</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">âœ“</span>
              <span><strong>à¦¬à§€à¦° à¦®à§à¦•à§à¦¤à¦¿à¦¯à§‹à¦¦à§à¦§à¦¾</strong> à¦“ à¦…à¦¸à¦šà§à¦›à¦² à¦®à§à¦•à§à¦¤à¦¿à¦¯à§‹à¦¦à§à¦§à¦¾ à¦ªà¦°à¦¿à¦¬à¦¾à¦°</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">âœ“</span>
              <span><strong>à¦•à¦¾à¦°à¦¾à¦—à¦¾à¦°à§‡ à¦¬à¦¿à¦¨à¦¾ à¦¬à¦¿à¦šà¦¾à¦°à§‡ à¦†à¦Ÿà¦•</strong> à¦“ à¦¹à§‡à¦«à¦¾à¦œà¦¤à§‡ à¦¥à¦¾à¦•à¦¾ à¦¬à§à¦¯à¦•à§à¦¤à¦¿</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">âœ“</span>
              <span><strong>à¦®à¦¾à¦¨à¦¬à¦ªà¦¾à¦šà¦¾à¦° à¦“ à¦…à§à¦¯à¦¾à¦¸à¦¿à¦¡ à¦¸à¦¹à¦¿à¦‚à¦¸à¦¤à¦¾à¦° à¦¶à¦¿à¦•à¦¾à¦°</strong> à¦¬à§à¦¯à¦•à§à¦¤à¦¿</span>
            </li>
          </ul>
        </div>

        <div class="ref-card-box">
          <h3>à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦†à¦°à§à¦¥à¦¿à¦• à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦ªà¦¾à¦“à§Ÿà¦¾à¦° à¦¯à§‹à¦—à§à¦¯?</h3>
          <p style="font-size:0.88rem;color:#64748B;margin-bottom:1.5rem">
            à¦†à¦ªà¦¨à¦¾à¦° à¦†à§Ÿ, à¦®à¦¾à¦®à¦²à¦¾à¦° à¦§à¦°à¦¨ à¦“ à¦…à¦¬à¦¸à§à¦¥à¦¾à¦¨à§‡à¦° à¦¤à¦¥à§à¦¯ à¦¦à¦¿à§Ÿà§‡ à¦œà§‡à¦¨à§‡ à¦¨à¦¿à¦¨ à¦†à¦ªà¦¨à¦¿ à¦†à¦°à§à¦¥à¦¿à¦• à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾à¦° à¦œà¦¨à§à¦¯ à¦¯à§‹à¦—à§à¦¯ à¦•à¦¿ à¦¨à¦¾
          </p>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">à¦¬à¦¾à¦°à§à¦·à¦¿à¦• à¦†à§Ÿ (à¦Ÿà¦¾à¦•à¦¾) *</label>
              <input id="homeIncomeInput" type="number" value="84000" placeholder="à¦¯à§‡à¦®à¦¨ à§®à§ªà§¦à§¦à§¦" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">à¦†à¦¬à§‡à¦¦à¦¨à¦•à¦¾à¦°à§€à¦° à¦§à¦°à¦¨ *</label>
              <select id="homeCategorySelect" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
                <option value="general">à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦…à¦¸à¦šà§à¦›à¦² à¦¨à¦¾à¦—à¦°à¦¿à¦•</option>
                <option value="women">à¦¨à¦¾à¦°à§€ à¦¬à¦¾ à¦¶à¦¿à¦¶à§</option>
                <option value="freedom">à¦¬à§€à¦° à¦®à§à¦•à§à¦¤à¦¿à¦¯à§‹à¦¦à§à¦§à¦¾ à¦¬à¦¾ à¦ªà¦°à¦¿à¦¬à¦¾à¦°</option>
                <option value="disabled">à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€ à¦¬à§à¦¯à¦•à§à¦¤à¦¿</option>
                <option value="prisoner">à¦•à¦¾à¦°à¦¾à¦¬à¦¨à§à¦¦à§€ / à¦¹à§‡à¦«à¦¾à¦œà¦¤à§‡ à¦†à¦Ÿà¦•</option>
                <option value="victim">à¦…à§à¦¯à¦¾à¦¸à¦¿à¦¡ à¦†à¦•à§à¦°à¦¾à¦¨à§à¦¤ / à¦ªà¦¾à¦šà¦¾à¦°à§‡à¦° à¦¶à¦¿à¦•à¦¾à¦°</option>
              </select>
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">à¦®à¦¾à¦®à¦²à¦¾à¦° à¦§à¦°à¦¨ *</label>
              <select id="homeCaseTypeSelect" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
                <option value="family">à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦¬à¦¿à¦°à§‹à¦§</option>
                <option value="land">à¦œà¦®à¦¿ à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤</option>
                <option value="elder">à¦…à¦­à¦¿à¦­à¦¾à¦¬à¦•à¦¦à§‡à¦° à¦­à¦°à¦£à¦ªà§‹à¦·à¦£</option>
                <option value="civil">à¦¦à§‡à¦“à§Ÿà¦¾à¦¨à¦¿</option>
                <option value="criminal">à¦«à§Œà¦œà¦¦à¦¾à¦°à¦¿</option>
              </select>
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">à¦œà§‡à¦²à¦¾ *</label>
              <select id="homeDistrictSelect" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
                <option value="à¦¢à¦¾à¦•à¦¾">à¦¢à¦¾à¦•à¦¾</option>
                <option value="à¦•à§à¦®à¦¿à¦²à§à¦²à¦¾">à¦•à§à¦®à¦¿à¦²à§à¦²à¦¾</option>
                <option value="à¦šà¦Ÿà§à¦Ÿà¦—à§à¦°à¦¾à¦®">à¦šà¦Ÿà§à¦Ÿà¦—à§à¦°à¦¾à¦®</option>
                <option value="à¦¸à¦¿à¦²à§‡à¦Ÿ">à¦¸à¦¿à¦²à§‡à¦Ÿ</option>
                <option value="à¦°à¦¾à¦œà¦¶à¦¾à¦¹à§€">à¦°à¦¾à¦œà¦¶à¦¾à¦¹à§€</option>
                <option value="à¦–à§à¦²à¦¨à¦¾">à¦–à§à¦²à¦¨à¦¾</option>
                <option value="à¦¬à¦°à¦¿à¦¶à¦¾à¦²">à¦¬à¦°à¦¿à¦¶à¦¾à¦²</option>
                <option value="à¦°à¦‚à¦ªà§à¦°">à¦°à¦‚à¦ªà§à¦°</option>
                <option value="à¦¨à§‡à¦¤à§à¦°à¦•à§‹à¦¨à¦¾">à¦¨à§‡à¦¤à§à¦°à¦•à§‹à¦¨à¦¾</option>
              </select>
            </div>
            <button class="btn-ref-submit" id="homeCheckBtn" type="button">à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§à¦¨</button>
            <div id="homeEligibilityResult" style="margin-top:10px"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- à§«. à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦à¦–à¦¨ à¦†à¦°à¦“ à¦¸à¦¹à¦œ à¦à¦¬à¦‚ à¦¸à§à¦¬à¦šà§à¦› (Emerald Banner with 5 Steps) -->
  <section class="ref-emerald-section">
    <div class="container">
      <div class="ref-emerald-grid">
        <div class="ref-emerald-left">
          <h2>à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦à¦–à¦¨<br>à¦†à¦°à¦“ à¦¸à¦¹à¦œ à¦à¦¬à¦‚ à¦¸à§à¦¬à¦šà§à¦›</h2>
          <p>
            à¦•à¦¯à¦¼à§‡à¦•à¦Ÿà¦¿ à¦¸à¦¹à¦œ à¦§à¦¾à¦ªà§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦° à¦œà¦¨à§à¦¯ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨ à¦à¦¬à¦‚ à¦ªà¦°à¦¬à¦°à§à¦¤à§€ à¦ªà§à¦°à¦•à§à¦°à¦¿à¦¯à¦¼à¦¾ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦¸à¦¬ à¦¸à¦®à¦¯à¦¼ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦¥à¦¾à¦•à§à¦¨à¥¤
          </p>
          <a class="btn-ref-white" href="#/apply">
            <span>à¦†à¦¬à§‡à¦¦à¦¨ à¦¶à§à¦°à§ à¦•à¦°à§à¦¨</span> <span>â†’</span>
          </a>
        </div>

        <div class="ref-steps-list">
          <div class="ref-step-item">
            <span class="ref-step-num">à§¦à§§</span>
            <div class="ref-step-content">
              <h4>à¦†à¦ªà¦¨à¦¾à¦° à¦¸à¦®à¦¸à§à¦¯à¦¾à¦° à¦•à¦¥à¦¾ à¦œà¦¾à¦¨à¦¾à¦¨</h4>
              <p>à¦†à¦ªà¦¨à¦¾à¦° à¦¤à¦¥à§à¦¯ à¦à¦¬à¦‚ à¦†à¦ªà¦¨à¦¿ à¦•à§€ à¦§à¦°à¦¨à§‡à¦° à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦šà¦¾à¦¨, à¦¤à¦¾ à¦†à¦®à¦¾à¦¦à§‡à¦° à¦œà¦¾à¦¨à¦¾à¦¨à¥¤</p>
            </div>
          </div>
          <div class="ref-step-item">
            <span class="ref-step-num">à§¦à§¨</span>
            <div class="ref-step-content">
              <h4>à¦†à¦¬à§‡à¦¦à¦¨ à¦œà¦®à¦¾ à¦¦à¦¿à¦¨</h4>
              <p>à¦†à¦¬à§‡à¦¦à¦¨à¦Ÿà¦¿ à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦•à¦°à§à¦¨ à¦à¦¬à¦‚ à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§€à¦¯à¦¼ à¦¤à¦¥à§à¦¯ à¦“ à¦•à¦¾à¦—à¦œà¦ªà¦¤à§à¦° à¦œà¦®à¦¾ à¦¦à¦¿à¦¨à¥¤</p>
            </div>
          </div>
          <div class="ref-step-item">
            <span class="ref-step-num">à§¦à§©</span>
            <div class="ref-step-content">
              <h4>à¦†à¦¬à§‡à¦¦à¦¨ à¦¯à¦¾à¦šà¦¾à¦‡</h4>
              <p>à¦œà§‡à¦²à¦¾ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦“ à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§€à¦¯à¦¼ à¦¤à¦¥à§à¦¯ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à¦¬à§‡à¥¤</p>
            </div>
          </div>
          <div class="ref-step-item">
            <span class="ref-step-num">à§¦à§ª</span>
            <div class="ref-step-content">
              <h4>à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦¨à¦¿à¦¨</h4>
              <p>à¦†à¦ªà¦¨à¦¾à¦° à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨ à¦“ à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦†à¦‡à¦¨à¦—à¦¤ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶, à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾, à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦“ à¦†à¦¦à¦¾à¦²à¦¤-à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà¦¾à¦¬à§‡à¦¨à¥¤</p>
            </div>
          </div>
          <div class="ref-step-item">
            <span class="ref-step-num">à§¦à§«</span>
            <div class="ref-step-content">
              <h4>à¦†à¦¬à§‡à¦¦à¦¨à§‡à¦° à¦…à¦—à§à¦°à¦—à¦¤à¦¿ à¦¦à§‡à¦–à§à¦¨</h4>
              <p>à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦¬à¦¾ à¦®à¦¾à¦®à¦²à¦¾à¦° à¦…à¦—à§à¦°à¦—à¦¤à¦¿ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦¥à¦¾à¦•à§à¦¨ à¦à¦¬à¦‚ à¦ªà¦°à¦¬à¦°à§à¦¤à§€ à¦•à¦°à¦£à§€à¦¯à¦¼ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦œà¦¾à¦¨à§à¦¨à¥¤</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- à§¬. à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾à¦° à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦†à¦ªà¦¡à§‡à¦Ÿ (Tracking Layout) -->
  <section class="ref-section-alt">
    <div class="container">
      <div class="ref-track-wrap">
        <div>
          <div class="ref-track-photo-box">
            <img src="/img/tracking_citizen.jpg" alt="à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà§à¦°à¦¾à¦°à§à¦¥à§€ à¦¨à¦¾à¦—à¦°à¦¿à¦•" loading="lazy">
          </div>
          <h2 class="sec-heading-serif" style="margin-top:1.5rem">à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦° à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦†à¦ªà¦¡à§‡à¦Ÿ</h2>
          <p style="color:#64748B;font-size:1rem;margin-top:6px">à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦¸à¦®à¦¯à¦¼ à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦¬à¦¾ à¦®à¦¾à¦®à¦²à¦¾à¦° à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦…à¦¬à¦¸à§à¦¥à¦¾ à¦¦à§‡à¦–à§à¦¨à¥¤</p>
        </div>

        <div class="ref-card-box">
          <h3>à¦†à¦¬à§‡à¦¦à¦¨ à¦Ÿà§à¦°à§à¦¯à¦¾à¦• à¦•à¦°à§à¦¨</h3>
          <p style="font-size:0.86rem;color:#64748B;margin-bottom:1.2rem">
            à¦†à¦ªà¦¨à¦¾à¦° à¦°à¦¸à¦¿à¦¦à§‡ à¦²à§‡à¦–à¦¾ à¦®à¦¾à¦®à¦²à¦¾ à¦¨à¦®à§à¦¬à¦° à¦“ à¦®à§‹à¦¬à¦¾à¦‡à¦²à§‡à¦° à¦¶à§‡à¦· à§ª à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦¦à¦¿à¦¯à¦¼à§‡ à¦²à¦¾à¦‡à¦­ à¦…à¦—à§à¦°à¦—à¦¤à¦¿ à¦œà¦¾à¦¨à§à¦¨
          </p>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">à¦®à¦¾à¦®à¦²à¦¾ à¦¨à¦®à§à¦¬à¦° *</label>
              <input id="trackAppId" value="APP-2026-0001" placeholder="à¦¯à§‡à¦®à¦¨ DLAS-NET-2026-04417 à¦¬à¦¾ APP-2026-0001" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
              <small style="color:#94A3B8;display:block;margin-top:3px">à¦†à¦ªà¦¨à¦¾à¦° à¦°à¦¸à¦¿à¦¦à§‡ à¦²à§‡à¦–à¦¾ à¦¥à¦¾à¦•à§‡ à¦à¦¬à¦‚ à¦à¦¸à¦à¦®à¦à¦¸à§‡ à¦ªà¦¾à¦ à¦¾à¦¨à§‹ à¦¹à¦¯à¦¼</small>
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦®à§à¦¬à¦° *</label>
              <input id="trackPhone" value="01711223344" placeholder="01XXXXXXXXX" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
              <small style="color:#94A3B8;display:block;margin-top:3px">à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¾à¦° à¦¸à¦®à¦¯à¦¼ à¦¯à§‡ à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦®à§à¦¬à¦°à¦Ÿà¦¿ à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦•à¦°à§‡à¦›à§‡à¦¨</small>
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">à¦«à§‹à¦¨ à¦¨à¦®à§à¦¬à¦° à¦¬à¦¾ à¦à¦¨à¦†à¦‡à¦¡à¦¿à¦° à¦¶à§‡à¦· à§ª à¦¸à¦‚à¦–à§à¦¯à¦¾ *</label>
              <input id="trackLast4" value="3344" maxlength="4" placeholder="à§­à§®à§¯à§¦" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
              <small style="color:#94A3B8;display:block;margin-top:3px">à¦†à¦¬à§‡à¦¦à¦¨à§‡à¦° à¦¸à¦®à¦¯à¦¼ à¦¯à§‡ à¦¨à¦®à§à¦¬à¦°à¦Ÿà¦¿ à¦¦à¦¿à¦¯à¦¼à§‡à¦›à¦¿à¦²à§‡à¦¨</small>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button type="button" class="chip-ref-demo" style="background:#E2E8F0;color:#0F172A;border:none" onclick="fillHomeTrack('APP-2026-0001','01711223344','3344')">à¦¡à§‡à¦®à§‹: APP-2026-0001</button>
              <button type="button" class="chip-ref-demo" style="background:#E2E8F0;color:#0F172A;border:none" onclick="fillHomeTrack('DLAS-NET-2026-04420','01711223344','3344')">à¦¡à§‡à¦®à§‹: DLAS-NET-2026-04420</button>
            </div>
            <button class="btn-ref-submit" id="trackSearchBtn" type="button">à¦†à¦¬à§‡à¦¦à¦¨à§‡à¦° à¦…à¦¬à¦¸à§à¦¥à¦¾ à¦¦à§‡à¦–à§à¦¨</button>
            <div id="trackHomeResult"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- à§­. à¦†à¦ªà¦¨à¦¾à¦° à¦¸à§à¦¬à¦¿à¦§à¦¾à¦®à¦¤à§‹ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦¨à¦¿à¦¨ (The 5 Doors) -->
  <section class="ref-section">
    <div class="container">
      <div class="sec-header-split">
        <div>
          <h2 class="sec-heading-serif">à¦†à¦ªà¦¨à¦¾à¦° à¦¸à§à¦¬à¦¿à¦§à¦¾à¦®à¦¤à§‹ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦¨à¦¿à¦¨</h2>
        </div>
        <div>
          <p class="sec-heading-desc">
            à¦…à¦¨à¦²à¦¾à¦‡à¦¨à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à¦›à§‡à¦¨ à¦¨à¦¾ à¦¬à¦¾ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦ªà§à¦°à§Ÿà§‹à¦œà¦¨? à¦†à¦ªà¦¨à¦¾à¦° à¦¸à§à¦¬à¦¿à¦§à¦¾à¦®à¦¤à§‹ à¦¬à¦¿à¦­à¦¿à¦¨à§à¦¨ à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦“ à¦ªà§à¦°à§Ÿà§‹à¦œà¦¨à§€à§Ÿ à¦¤à¦¥à§à¦¯ à¦¨à¦¿à¦¨à¥¤
          </p>
        </div>
      </div>

      <div class="ref-doors-grid">
        <a class="ref-door-card" href="tel:16699">
          <div class="ref-door-icon">ðŸ“ž</div>
          <h4>à¦«à§‹à¦¨ à¦•à¦²à§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡</h4>
          <p>à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦¤à¦¥à§à¦¯, à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦¬à¦¾ à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦¨à¦¿à§Ÿà§‡ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦ªà§‡à¦¤à§‡ à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨à§‡ à¦•à¦¥à¦¾ à¦¬à¦²à§à¦¨à¥¤</p>
          <span class="ref-door-link">à¦•à¦² à¦•à¦°à§à¦¨ à§§à§¬à§¬à§¯à§¯ â€º</span>
        </a>

        <a class="ref-door-card" href="#/offices">
          <div class="ref-door-icon">ðŸ¢</div>
          <h4>à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸</h4>
          <p>à¦†à¦ªà¦¨à¦¾à¦° à¦¨à¦¿à¦•à¦Ÿà¦¸à§à¦¥ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸à§‡ à¦—à¦¿à§Ÿà§‡ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦ªà§à¦°à§Ÿà§‹à¦œà¦¨à§€à§Ÿ à¦¤à¦¥à§à¦¯ à¦“ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦¨à¦¿à¦¨à¥¤</p>
          <span class="ref-door-link">à¦•à¦¾à¦°à§à¦¯à¦¾à¦²à§Ÿ à¦–à§à¦à¦œà§à¦¨ â€º</span>
        </a>

        <a class="ref-door-card" href="#/help">
          <div class="ref-door-icon">ðŸ›ï¸</div>
          <h4>à¦‡à¦‰à¦¡à¦¿à¦¸à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾</h4>
          <p>à¦†à¦ªà¦¨à¦¾à¦° à¦¨à¦¿à¦•à¦Ÿà¦¸à§à¦¥ à¦‡à¦‰à¦¨à¦¿à§Ÿà¦¨ à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à§‡à¦¨à§à¦Ÿà¦¾à¦°à§‡ (UDC) à¦—à¦¿à§Ÿà§‡ DLAS-à¦à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦¨à¦¿à¦¨à¥¤</p>
          <span class="ref-door-link">à¦¨à¦¿à¦•à¦Ÿà¦¸à§à¦¥ à¦‡à¦‰à¦¡à¦¿à¦¸à¦¿ â€º</span>
        </a>

        <a class="ref-door-card" href="#/call">
          <div class="ref-door-icon">#ï¸âƒ£</div>
          <h4>IVR / à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦«à§‹à¦¨</h4>
          <p>à¦¸à§à¦®à¦¾à¦°à§à¦Ÿà¦«à§‹à¦¨ à¦¬à¦¾ à¦‡à¦¨à§à¦Ÿà¦¾à¦°à¦¨à§‡à¦Ÿ à¦›à¦¾à§œà¦¾à¦‡ à§§à§¬à§¬à§¯à§¯ à¦¨à¦®à§à¦¬à¦°à§‡ à¦•à¦² à¦•à¦°à§‡ à¦†à¦‡à¦¨à¦¿ à¦¤à¦¥à§à¦¯ à¦“ à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦¿à¦¤ à¦¸à§‡à¦¬à¦¾ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦œà¦¾à¦¨à§à¦¨à¥¤</p>
          <span class="ref-door-link">à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ â€º</span>
        </a>

        <a class="ref-door-card" href="javascript:void(0)" onclick="window.__chatOpen && window.__chatOpen()">
          <div class="ref-door-icon">ðŸ¤–</div>
          <h4>AI-à¦à¦° à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾ à¦¨à¦¿à¦¨</h4>
          <p>à¦¸à§à¦®à¦¾à¦°à§à¦Ÿà¦«à§‹à¦¨ à¦¬à¦¾ à¦‡à¦¨à§à¦Ÿà¦¾à¦°à¦¨à§‡à¦Ÿà§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ AI à¦¸à¦¹à¦•à¦¾à¦°à§€à¦° à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯à§‡ à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦†à¦‡à¦¨à¦¿ à¦¤à¦¥à§à¦¯, à¦¦à¦¿à¦•à¦¨à¦¿à¦°à§à¦¦à§‡à¦¶à¦¨à¦¾ à¦“ à¦¸à§‡à¦¬à¦¾ à¦œà¦¾à¦¨à§à¦¨à¥¤</p>
          <span class="ref-door-link">à¦¸à§à¦®à¦¾à¦°à§à¦Ÿ à¦¸à¦¹à¦•à¦¾à¦°à§€ â€º</span>
        </a>
      </div>

      <div style="margin-top:2rem;background:#F8FAF9;border:1px solid #E5E7EB;border-radius:12px;padding:22px;display:flex;align-items:flex-start;gap:14px">
        <span style="font-size:24px">ðŸ”’</span>
        <div>
          <strong style="color:#0F172A;font-size:1.05rem">à¦ªà§à¦°à¦¾à¦‡à¦­à§‡à¦Ÿ à¦“ à¦¨à¦¿à¦°à¦¾à¦ªà¦¦</strong>
          <p style="color:#64748B;font-size:0.92rem;margin-top:4px;line-height:1.55">
            à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦šà¦¾à¦“à¦¯à¦¼à¦¾ à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦—à§‹à¦ªà¦¨à§€à¦¯à¦¼à¥¤ à¦†à¦ªà¦¨à¦¾à¦° à¦¤à¦¥à§à¦¯ à¦•à§‡à¦¬à¦² à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨à¦Ÿà¦¿ à¦¦à§‡à¦–à¦›à§‡à¦¨ à¦à¦®à¦¨ à¦¦à¦¾à¦¯à¦¼à¦¿à¦¤à§à¦¬à¦ªà§à¦°à¦¾à¦ªà§à¦¤ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸à¦¾à¦°à¦°à¦¾à¦‡ à¦¦à§‡à¦–à§‡à¦¨, à¦¬à¦¿à¦ªà¦°à§€à¦¤ à¦ªà¦•à§à¦·à¦•à§‡ à¦•à¦–à¦¨à§‹ à¦•à§‹à¦¨à§‹ à¦¤à¦¥à§à¦¯ à¦¬à¦¾ à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦œà¦¾à¦¨à¦¾à¦¨à§‹ à¦¹à¦¯à¦¼ à¦¨à¦¾à¥¤
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- à§®. à¦†à¦ªà¦¨à¦¾à¦° à¦•à¦¿ à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦†à¦›à§‡? (Interactive FAQ Accordion) -->
  <section class="ref-faq-section">
    <div class="container">
      <div class="ref-faq-grid">
        <div>
          <h2 style="font-family:'Noto Serif Bengali',serif;font-size:clamp(2rem,3vw,2.7rem);color:#FFF;line-height:1.25">
            à¦†à¦ªà¦¨à¦¾à¦° à¦•à¦¿ à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦†à¦›à§‡?
          </h2>
          <p style="color:#A7F3D0;font-size:1.05rem;margin-top:14px;line-height:1.6">
            à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§€à¦¯à¦¼ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦¸à¦šà¦°à¦¾à¦šà¦° à¦ªà§à¦°à¦¶à§à¦¨ à¦à¦¬à¦‚ à¦‰à¦¤à§à¦¤à¦°
          </p>
        </div>

        <div class="ref-accordion" id="refFaqAccordion">
          <div class="ref-faq-item open">
            <div class="ref-faq-header">
              <span>à¦à¦‡ à¦¸à§‡à¦¬à¦¾ à¦•à¦¿ à¦¸à¦¤à§à¦¯à¦¿à¦‡ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡?</span>
              <span class="ref-faq-arrow">â–¼</span>
            </div>
            <div class="ref-faq-body">
              à¦¹à§à¦¯à¦¾à¦à¥¤ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦¯à¦¼ à¦†à¦ªà¦¨à¦¾à¦° à¦•à§‹à¦¨à§‹ à¦–à¦°à¦š à¦¨à§‡à¦‡ â€” à¦†à¦¬à§‡à¦¦à¦¨ à¦«à¦¿ à¦¨à§‡à¦‡, à¦†à¦‡à¦¨à¦œà§€à¦¬à§€à¦° à¦«à¦¿ à¦¨à§‡à¦‡, à¦•à§‹à¦°à§à¦Ÿ à¦«à¦¿ à¦¨à§‡à¦‡à¥¤ à¦°à¦¾à¦·à§à¦Ÿà§à¦° à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦–à¦°à¦š à¦¬à¦¹à¦¨ à¦•à¦°à§‡à¥¤ à¦•à§‡à¦‰ à¦à¦‡ à¦¸à§‡à¦¬à¦¾à¦° à¦œà¦¨à§à¦¯ à¦Ÿà¦¾à¦•à¦¾ à¦šà¦¾à¦‡à¦²à§‡ à§§à§¬à§¬à§¯à§¯-à¦ à¦œà¦¾à¦¨à¦¾à¦¨à¥¤
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>à¦†à¦®à¦¾à¦° à¦¤à¦¥à§à¦¯ à¦•à¦¿ à¦—à§‹à¦ªà¦¨ à¦¥à¦¾à¦•à¦¬à§‡?</span>
              <span class="ref-faq-arrow">â–¼</span>
            </div>
            <div class="ref-faq-body">
              à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦—à§‹à¦ªà¦¨ à¦¥à¦¾à¦•à¦¬à§‡à¥¤ Five Doors, One Record à¦ªà§à¦°à¦¯à§à¦•à§à¦¤à¦¿à¦¤à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦“ à¦¬à§à¦¯à¦•à§à¦¤à¦¿à¦—à¦¤ à¦¤à¦¥à§à¦¯ à¦¸à§à¦°à¦•à§à¦·à¦¿à¦¤ à¦¡à¦¾à¦Ÿà¦¾à¦¬à§‡à¦œà§‡ à¦à¦¨à¦•à§à¦°à¦¿à¦ªà§à¦Ÿà§‡à¦¡ à¦¥à¦¾à¦•à§‡ à¦à¦¬à¦‚ à¦¬à¦¿à¦ªà¦°à§€à¦¤ à¦ªà¦•à§à¦·à¦•à§‡ à¦•à¦–à¦¨à§‹à¦‡ à¦•à§‹à¦¨à§‹ à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦¦à§‡à¦–à¦¾à¦¨à§‹ à¦¹à¦¯à¦¼ à¦¨à¦¾à¥¤
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>à¦†à¦®à¦¾à¦° à¦•à¦¾à¦›à§‡ à¦¸à§à¦®à¦¾à¦°à§à¦Ÿà¦«à§‹à¦¨ à¦¨à§‡à¦‡, à¦¤à¦¾à¦¹à¦²à§‡ à¦•à§€à¦­à¦¾à¦¬à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¬?</span>
              <span class="ref-faq-arrow">â–¼</span>
            </div>
            <div class="ref-faq-body">
              à¦†à¦ªà¦¨à¦¿ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¬à¦¾à¦Ÿà¦¨ à¦«à§‹à¦¨ à¦¥à§‡à¦•à§‡ à¦Ÿà§‹à¦²-à¦«à§à¦°à¦¿ à§§à§¬à§¬à§¯à§¯ à¦¨à¦®à§à¦¬à¦°à§‡ à¦•à¦² à¦•à¦°à§‡ à¦•à¦¥à¦¾ à¦¬à¦²à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨ à¦…à¦¥à¦¬à¦¾ à¦¨à¦¿à¦•à¦Ÿà¦¸à§à¦¥ à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à§‡à¦¨à§à¦Ÿà¦¾à¦°à§‡ (UDC) à¦—à¦¿à¦¯à¦¼à§‡ à¦‰à¦¦à§à¦¯à§‹à¦•à§à¦¤à¦¾à¦° à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦¯à¦¼ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨à¥¤
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>à¦†à¦®à¦¿ à¦•à¦¿ à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à§‡à¦¨à§à¦Ÿà¦¾à¦° à¦¥à§‡à¦•à§‡ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦ªà§‡à¦¤à§‡ à¦ªà¦¾à¦°à¦¿?</span>
              <span class="ref-faq-arrow">â–¼</span>
            </div>
            <div class="ref-faq-body">
              à¦¹à§à¦¯à¦¾à¦, à¦¦à§‡à¦¶à§‡à¦° à¦¸à¦¬ à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à§‡à¦¨à§à¦Ÿà¦¾à¦°à§‡à¦° à¦‰à¦¦à§à¦¯à§‹à¦•à§à¦¤à¦¾à¦°à¦¾ DLAS à¦ªà§‹à¦°à§à¦Ÿà¦¾à¦²à§‡ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¨à¦¾à¦—à¦°à¦¿à¦•à¦¦à§‡à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦¦à¦¾à¦–à¦¿à¦² à¦“ à¦Ÿà§à¦°à§à¦¯à¦¾à¦•à¦¿à¦‚à¦¯à¦¼à§‡ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦•à¦°à§‡à¦¨à¥¤
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>à¦¸à¦¿à¦¦à§à¦§à¦¾à¦¨à§à¦¤ à¦¨à¦¾ à¦®à¦¾à¦¨à¦²à§‡ à¦•à§€ à¦¹à¦¬à§‡?</span>
              <span class="ref-faq-arrow">â–¼</span>
            </div>
            <div class="ref-faq-body">
              à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾ (ADR) à¦‰à¦­à¦¯à¦¼ à¦ªà¦•à§à¦·à§‡à¦° à¦¸à¦®à§à¦®à¦¤à¦¿à¦° à¦­à¦¿à¦¤à§à¦¤à¦¿à¦¤à§‡ à¦¹à¦¯à¦¼à¥¤ à¦¯à¦¦à¦¿ à¦•à§‹à¦¨à§‹ à¦ªà¦•à§à¦· à¦¸à¦®à§à¦®à¦¤ à¦¨à¦¾ à¦¹à¦¯à¦¼, à¦¤à¦¾à¦¹à¦²à§‡ à¦†à¦¦à¦¾à¦²à¦¤à§‡ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦ªà§‚à¦°à§à¦£à¦¾à¦™à§à¦— à¦®à¦¾à¦®à¦²à¦¾ à¦²à¦¡à¦¼à¦¾à¦° à¦œà¦¨à§à¦¯ à¦°à¦¾à¦·à§à¦Ÿà§à¦°à§€à¦¯à¦¼ à¦–à¦°à¦šà§‡ à¦ªà§à¦¯à¦¾à¦¨à§‡à¦² à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦¨à¦¿à¦¯à¦¼à§‹à¦— à¦•à¦°à¦¾ à¦¹à¦¯à¦¼à¥¤
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>à¦•à¦¤ à¦¸à¦®à¦¯à¦¼ à¦²à¦¾à¦—à§‡?</span>
              <span class="ref-faq-arrow">â–¼</span>
            </div>
            <div class="ref-faq-body">
              à¦ªà§à¦°à¦¾à¦¥à¦®à¦¿à¦• à¦¸à§à¦•à§à¦°à¦¿à¦¨à¦¿à¦‚ à§© à¦•à¦¾à¦°à§à¦¯à¦¦à¦¿à¦¬à¦¸à§‡à¦° à¦®à¦§à§à¦¯à§‡ à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦¹à¦¯à¦¼ à¦à¦¬à¦‚ à¦œà¦°à§à¦°à¦¿ à¦¨à¦¿à¦°à§à¦¯à¦¾à¦¤à¦¨ à¦¬à¦¾ à¦¬à¦¿à¦¨à¦¾ à¦¬à¦¿à¦šà¦¾à¦°à§‡ à¦†à¦Ÿà¦• à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤ à¦†à¦¬à§‡à¦¦à¦¨ à§¨à§ª à¦˜à¦£à§à¦Ÿà¦¾à¦° à¦®à¦§à§à¦¯à§‡ à¦…à¦—à§à¦°à¦¾à¦§à¦¿à¦•à¦¾à¦° à¦­à¦¿à¦¤à§à¦¤à¦¿à¦¤à§‡ à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿ à¦•à¦°à¦¾ à¦¹à¦¯à¦¼à¥¤
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- à§¯. à§¬à§ª à¦œà§‡à¦²à¦¾ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸ à¦“ à¦Ÿà§à¦°à¦¾à¦‡à¦¬à§à¦¯à§à¦¨à¦¾à¦² (District Map & Directory) -->
  <section class="ref-section">
    <div class="container">
      <div class="sec-header-split">
        <div>
          <h2 class="sec-heading-serif">à§¬à§ª à¦œà§‡à¦²à¦¾ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸ à¦“ à¦Ÿà§à¦°à¦¾à¦‡à¦¬à§à¦¯à§à¦¨à¦¾à¦²</h2>
        </div>
        <div>
          <p class="sec-heading-desc">
            à¦†à¦ªà¦¨à¦¾à¦° à¦œà§‡à¦²à¦¾à¦° à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸à§‡à¦° à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦«à§‹à¦¨ à¦¨à¦®à§à¦¬à¦°, à¦•à§‹à¦°à§à¦Ÿà§‡à¦° à¦…à¦¬à¦¸à§à¦¥à¦¾à¦¨ à¦à¦¬à¦‚ à¦¦à¦¾à¦¯à¦¼à¦¿à¦¤à§à¦¬à¦°à¦¤ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾à¦° à¦¤à¦¥à§à¦¯ à¦–à§à¦à¦œà§à¦¨à¥¤
          </p>
        </div>
      </div>
      <div class="office-finder">
        <div>
          <div class="search-bar" style="margin:0 0 1rem">
            <input id="offQ" placeholder="à¦œà§‡à¦²à¦¾à¦° à¦¨à¦¾à¦® à¦²à¦¿à¦–à§à¦¨ â€” à¦¯à§‡à¦®à¦¨: à¦¢à¦¾à¦•à¦¾, à¦•à§à¦®à¦¿à¦²à§à¦²à¦¾, à¦šà¦Ÿà§à¦Ÿà¦—à§à¦°à¦¾à¦®, à¦–à§à¦²à¦¨à¦¾, à¦¸à¦¿à¦²à§‡à¦Ÿ, à¦œà¦¯à¦¼à¦ªà§à¦°à¦¹à¦¾à¦Ÿâ€¦">
          </div>
          <div class="office-list" id="homeOffices"></div>
        </div>
        <div id="map"></div>
      </div>
    </div>
  </section>

  <!-- à§§à§¦. à¦ªà§à¦°à§‹à¦­à¦¾à¦‡à¦¡à¦¾à¦° à¦“ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦•à¦¨à¦¸à§‹à¦² à¦¬à§à¦¯à¦¾à¦¨à¦¾à¦° -->
  <section class="section" style="background:#003628;color:#fff;padding:45px 0">
    <div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px">
      <div style="max-width:700px">
        <span class="badge warn" style="margin-bottom:8px">ðŸ›ï¸ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦“ à¦ªà§à¦°à§‹à¦­à¦¾à¦‡à¦¡à¦¾à¦° à¦²à¦—à¦‡à¦¨</span>
        <h2 style="color:#FFF;margin-bottom:8px;font-size:1.6rem">à¦œà§‡à¦²à¦¾ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾, à¦ªà§à¦¯à¦¾à¦¨à§‡à¦² à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦“ à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾à¦•à¦¾à¦°à§€ à¦•à¦¨à¦¸à§‹à¦²</h2>
        <p style="color:rgba(255,255,255,0.85);font-size:0.92rem">
          DLAO à¦…à¦«à¦¿à¦¸à¦¾à¦°, à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾à¦•à¦¾à¦°à§€, à¦†à¦‡à¦¨à¦œà§€à¦¬à§€, à¦‡à¦‰à¦¡à¦¿à¦¸à¦¿ à¦…à¦ªà¦¾à¦°à§‡à¦Ÿà¦° à¦“ à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨ à¦à¦œà§‡à¦¨à§à¦Ÿà§‡à¦° à¦œà¦¨à§à¦¯ à¦¸à¦®à¦¨à§à¦¬à¦¿à¦¤ à¦•à¦¾à¦°à§à¦¯à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¥¤ à¦¡à§‡à¦®à§‹ à¦ªà¦¿à¦¨: <strong>1234</strong>
        </p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a href="#/console" class="btn btn-gold btn-lg">ðŸ› ï¸ à¦ªà§à¦°à§‹à¦­à¦¾à¦‡à¦¡à¦¾à¦° à¦•à¦¨à¦¸à§‹à¦²à§‡ à¦ªà§à¦°à¦¬à§‡à¦¶ â†’</a>
      </div>
    </div>
  </section>
  `;

  // Init Office Map
  initOfficeMap();

  // Populate Offices
  const renderOffices = (q) => {
    if (!BOOT || !BOOT.offices) return;
    const list = BOOT.offices.filter((o) => !q || (o.name + o.district + o.address).toLowerCase().includes(q.toLowerCase()));
    $('#homeOffices').innerHTML = list.slice(0, 8).map((o) => officeCard(o)).join('') ||
      `<div class="empty-state" style="padding:1.5rem;text-align:center">à¦•à§‹à¦¨à§‹ à¦…à¦«à¦¿à¦¸ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦¯à¦¾à¦¯à¦¼à¦¨à¦¿</div>`;
  };
  renderOffices('');
  $('#offQ').oninput = (e) => renderOffices(e.target.value);

  // Wire up Tracking Form
  window.fillHomeTrack = (id, phone, last4) => {
    $('#trackAppId').value = id;
    if (phone) $('#trackPhone').value = phone;
    $('#trackLast4').value = last4;
    $('#trackSearchBtn').click();
  };

  $$('.chip-ref-demo').forEach((btn) => {
    btn.onclick = () => {
      window.fillHomeTrack(btn.dataset.id, btn.dataset.phone, btn.dataset.last4);
    };
  });

  $('#trackSearchBtn').onclick = async () => {
    const id = ($('#trackAppId').value || '').trim();
    const last4 = ($('#trackLast4').value || '').trim();
    const box = $('#trackHomeResult');
    if (!id || !last4) {
      box.innerHTML = `<div class="badge danger" style="padding:8px 12px;margin-top:12px;display:block">à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦†à¦‡à¦¡à¦¿ à¦“ à¦¶à§‡à¦· à§ª à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦¦à¦¿à¦¨</div>`;
      return;
    }
    box.innerHTML = `<div style="padding:12px;color:#64748B;font-size:0.9rem">à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à¦¾ à¦¹à¦šà§à¦›à§‡â€¦</div>`;
    const r = await apiPost('track', { appId: id, last4 });
    if (r.error) {
      box.innerHTML = `<div class="badge danger" style="padding:8px 12px;margin-top:12px;display:block">âŒ ${esc(r.error)}</div>`;
      return;
    }
    box.innerHTML = `
      <div style="background:#F8FAF9;border-radius:12px;padding:16px;margin-top:14px;border:1px solid #05513A">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="color:#05513A;font-size:1.1rem">à¦§à¦¾à¦ª ${bnNum(r.stage + 1)}: ${esc(r.stageLabel)}</strong>
          ${r.emergency ? '<span class="badge warn">à¦œà¦°à§à¦°à¦¿</span>' : '<span class="badge success">à¦¸à¦•à§à¦°à¦¿à¦¯à¦¼</span>'}
        </div>
        ${r.nextStep ? `<p style="font-size:0.9rem;color:#1E293B;margin-bottom:8px">ðŸŽ¯ <strong>à¦ªà¦°à¦¬à¦°à§à¦¤à§€ à¦ªà¦¦à¦•à§à¦·à§‡à¦ª:</strong> ${esc(r.nextStep)}</p>` : ''}
        ${(r.headsUp && r.headsUp.length) ? `<ul style="font-size:0.85rem;color:#64748B;padding-left:18px;margin:6px 0">${r.headsUp.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
          <small style="color:#64748B">à¦†à¦‡à¦¡à¦¿: ${esc(r.appId)}</small>
          <a href="#/track?id=${encodeURIComponent(id)}" class="btn btn-outline btn-sm">à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦Ÿà¦¾à¦‡à¦®à¦²à¦¾à¦‡à¦¨ â†’</a>
        </div>
      </div>
    `;
  };

  // Wire up Eligibility Checker
  const checkHomeElig = () => {
    const inc = Number($('#homeIncomeInput').value || 0);
    const cat = $('#homeCategorySelect').value;
    const res = $('#homeEligibilityResult');
    const priorityCats = ['women', 'freedom', 'disabled', 'prisoner', 'victim'];
    if (priorityCats.includes(cat)) {
      res.innerHTML = `
        <div style="background:#E8F5EF;border:1px solid #05513A;border-radius:8px;padding:12px;color:#05513A;font-size:0.92rem">
          <strong>âœ… à¦†à¦ªà¦¨à¦¿ à¦…à¦—à§à¦°à¦¾à¦§à¦¿à¦•à¦¾à¦° à¦­à¦¿à¦¤à§à¦¤à¦¿à¦¤à§‡ à§§à§¦à§¦% à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à§Ÿà¦¤à¦¾à¦° à¦¯à§‹à¦—à§à¦¯!</strong>
          <p style="margin-top:4px;font-size:0.84rem;color:#1E293B">à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦¨à§€à¦¤à¦¿à¦®à¦¾à¦²à¦¾ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦à¦‡ à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿à¦° à¦¨à¦¾à¦—à¦°à¦¿à¦•à¦—à¦£ à¦†à¦¯à¦¼à§‡à¦° à¦¶à¦°à§à¦¤ à¦¬à§à¦¯à¦¤à¦¿à¦°à§‡à¦•à§‡à¦‡ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦–à¦°à¦šà§‡ à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦“ à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾ à¦ªà¦¾à¦¬à§‡à¦¨à¥¤</p>
          <a href="#/apply" class="btn btn-primary btn-sm" style="margin-top:8px;display:inline-block">à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨ â†’</a>
        </div>`;
    } else if (inc <= 150000) {
      res.innerHTML = `
        <div style="background:#E8F5EF;border:1px solid #05513A;border-radius:8px;padding:12px;color:#05513A;font-size:0.92rem">
          <strong>âœ… à¦†à¦ªà¦¨à¦¿ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦–à¦°à¦šà§‡ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾à¦° à¦¯à§‹à¦—à§à¦¯!</strong>
          <p style="margin-top:4px;font-size:0.84rem;color:#1E293B">à¦†à¦ªà¦¨à¦¾à¦° à¦¬à¦¾à¦°à§à¦·à¦¿à¦• à¦†à¦¯à¦¼ (à§³${bnNum(inc)}) à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà§à¦°à¦¾à¦ªà§à¦¤à¦¿à¦° à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¸à§€à¦®à¦¾à¦° à¦®à¦§à§à¦¯à§‡ à¦°à¦¯à¦¼à§‡à¦›à§‡à¥¤</p>
          <a href="#/apply" class="btn btn-primary btn-sm" style="margin-top:8px;display:inline-block">à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨ â†’</a>
        </div>`;
    } else {
      res.innerHTML = `
        <div style="background:#FEF3C7;border:1px solid #D97706;border-radius:8px;padding:12px;color:#92400E;font-size:0.92rem">
          <strong>âš–ï¸ à¦¬à¦¿à¦¶à§‡à¦· à¦¬à¦¿à¦¬à§‡à¦šà¦¨à¦¾à¦¯à¦¼ à¦†à¦¬à§‡à¦¦à¦¨ à¦ªà¦°à§à¦¯à¦¾à¦²à§‹à¦šà¦¨à¦¾ à¦•à¦°à¦¾ à¦¹à¦¬à§‡</strong>
          <p style="margin-top:4px;font-size:0.84rem;color:#1E293B">à¦¬à¦¾à¦°à§à¦·à¦¿à¦• à¦†à¦¯à¦¼ à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¸à§€à¦®à¦¾à¦° à¦¬à§‡à¦¶à¦¿ à¦¹à¦²à§‡à¦“ à¦®à¦¾à¦®à¦²à¦¾à¦° à¦¬à§à¦¯à¦¯à¦¼à¦­à¦¾à¦° à¦“ à¦¬à¦¿à¦¶à§‡à¦· à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦ªà¦°à¦¿à¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦¬à¦¿à¦¬à§‡à¦šà¦¨à¦¾à¦¯à¦¼ à¦œà§‡à¦²à¦¾ à¦†à¦‡à¦¨ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¦à¦¿à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨à¥¤</p>
          <a href="#/apply" class="btn btn-outline btn-sm" style="margin-top:8px;display:inline-block">à¦¯à¦¾à¦šà¦¾à¦‡à§Ÿà§‡à¦° à¦†à¦¬à§‡à¦¦à¦¨ â†’</a>
        </div>`;
    }
  };
  $('#homeCheckBtn').onclick = checkHomeElig;
  $('#homeCategorySelect').onchange = checkHomeElig;

  // Wire up FAQ Accordion
  $$('.ref-faq-item').forEach((item) => {
    const hdr = item.querySelector('.ref-faq-header');
    hdr.onclick = () => {
      const isOpen = item.classList.contains('open');
      $$('.ref-faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    };
  });
}

// ---------- à¦¸à§‡à¦¬à¦¾à¦¸à¦®à§‚à¦¹ à¦ªà§‡à¦œ ----------
async function pageServices() {
  app.innerHTML = `
  <div class="container page-head">
    <span class="section-tag">à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦†à¦‡à¦¨à¦¿ à¦¸à§‡à¦¬à¦¾</span>
    <h1>âš–ï¸ à¦œà¦¾à¦¤à§€à¦¯à¦¼ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦¸à§‡à¦¬à¦¾à¦¸à¦®à§‚à¦¹</h1>
    <p>à¦†à¦‡à¦¨à¦—à¦¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà§à¦°à¦¦à¦¾à¦¨ à¦†à¦‡à¦¨ à§¨à§¦à§¦à§¦-à¦à¦° à¦…à¦§à§€à¦¨à§‡ à¦…à¦¸à¦šà§à¦›à¦² à¦“ à¦¸à§à¦¬à¦¿à¦§à¦¾-à¦¬à¦žà§à¦šà¦¿à¦¤ à¦¨à¦¾à¦—à¦°à¦¿à¦•à¦¦à§‡à¦° à¦œà¦¨à§à¦¯ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦–à¦°à¦šà§‡ à¦¸à¦•à¦² à¦†à¦‡à¦¨à¦¿ à¦ªà§à¦°à¦¤à¦¿à¦•à¦¾à¦°à¥¤</p>
  </div>
  <div class="container">
    <div class="services-grid" style="margin-bottom:2.5rem">
      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">ðŸ’¬</div>
          <div>
            <span class="service-tag-badge">à¦ªà¦°à¦¾à¦®à¦°à§à¦¶</span>
            <h3>à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦†à¦‡à¦¨à¦¿ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶</h3>
          </div>
        </div>
        <p>à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦®à¦¾à¦®à¦²à¦¾ à¦•à¦°à¦¾à¦° à¦†à¦—à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦…à¦§à¦¿à¦•à¦¾à¦°, à¦†à¦‡à¦¨à¦—à¦¤ à¦¸à§à¦¯à§‹à¦— à¦“ à¦®à¦¾à¦®à¦²à¦¾à¦° à¦¸à¦®à§à¦­à¦¾à¦¬à§à¦¯à¦¤à¦¾ à¦¨à¦¿à¦¯à¦¼à§‡ à¦œà§‡à¦²à¦¾ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸ à¦¬à¦¾ à¦Ÿà§‹à¦²-à¦«à§à¦°à¦¿ à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨ à§§à§¬à§¬à§¯à§¯-à¦ à¦¤à¦¾à§Žà¦•à§à¦·à¦£à¦¿à¦• à¦ªà¦°à¦¾à¦®à¦°à§à¦¶à¥¤</p>
        <a class="btn btn-outline btn-block" href="#/guide">à¦†à¦‡à¦¨à¦¿ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦šà¦¾à¦¨ â†’</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">âš–ï¸</div>
          <div>
            <span class="service-tag-badge">à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦¨à¦¿à¦¯à¦¼à§‹à¦—</span>
            <h3>à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦–à¦°à¦šà§‡ à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦¨à¦¿à¦¯à¦¼à§‹à¦—</h3>
          </div>
        </div>
        <p>à¦†à¦¦à¦¾à¦²à¦¤à§‡ à¦¦à§‡à¦“à¦¯à¦¼à¦¾à¦¨à¦¿, à¦«à§Œà¦œà¦¦à¦¾à¦°à¦¿ à¦“ à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦®à§‹à¦•à¦¦à§à¦¦à¦®à¦¾à¦¯à¦¼ à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦°à¦¾à¦·à§à¦Ÿà§à¦°à§€à¦¯à¦¼ à¦–à¦°à¦šà§‡ à¦…à¦­à¦¿à¦œà§à¦ž à¦ªà§à¦¯à¦¾à¦¨à§‡à¦² à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦¨à¦¿à¦¯à¦¼à§‹à¦—à¥¤ à¦•à§‹à¦¨à§‹ à¦«à¦¿ à¦ªà§à¦°à¦¦à¦¾à¦¨ à¦•à¦°à¦¤à§‡ à¦¹à¦¬à§‡ à¦¨à¦¾à¥¤</p>
        <a class="btn btn-primary btn-block" href="#/apply">à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦ªà§‡à¦¤à§‡ à¦†à¦¬à§‡à¦¦à¦¨ â†’</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">ðŸ¤</div>
          <div>
            <span class="service-tag-badge">ADR</span>
            <h3>à¦¬à¦¿à¦•à¦²à§à¦ª à¦¬à¦¿à¦°à§‹à¦§ à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿ (ADR)</h3>
          </div>
        </div>
        <p>à¦†à¦¦à¦¾à¦²à¦¤à§‡à¦° à¦¬à¦¾à¦‡à¦°à§‡ à¦¦à§à¦‡ à¦ªà¦•à§à¦·à§‡à¦° à¦¸à¦®à§à¦®à¦¤à¦¿à¦¤à§‡ à¦†à¦ªà¦¸-à¦®à§€à¦®à¦¾à¦‚à¦¸à¦¾à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦•à¦® à¦¸à¦®à¦¯à¦¼à§‡ à¦“ à¦¬à¦¿à¦¨à¦¾ à¦–à¦°à¦šà§‡ à¦¬à¦¿à¦°à§‹à¦§ à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿à¥¤ à¦†à¦¦à¦¾à¦²à¦¤à§‡à¦° à¦¡à¦¿à¦•à§à¦°à¦¿à¦° à¦¸à¦®à¦¾à¦¨ à¦®à¦°à§à¦¯à¦¾à¦¦à¦¾ à¦¸à¦®à§à¦ªà¦¨à§à¦¨à¥¤</p>
        <a class="btn btn-outline btn-block" href="#/apply?purpose=mediation">à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ â†’</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">ðŸ›¡ï¸</div>
          <div>
            <span class="service-tag-badge">à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦•</span>
            <h3>à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦“ à¦¦à§‡à¦¨à¦®à§‹à¦¹à¦° à¦¬à¦¿à¦°à§‹à¦§</h3>
          </div>
        </div>
        <p>à¦¯à§Œà¦¤à§à¦•, à¦¬à¦¿à¦¬à¦¾à¦¹à¦¬à¦¿à¦šà§à¦›à§‡à¦¦, à¦¦à§‡à¦¨à¦®à§‹à¦¹à¦° à¦†à¦¦à¦¾à¦¯à¦¼, à¦¨à¦¾à¦¬à¦¾à¦²à¦• à¦¸à¦¨à§à¦¤à¦¾à¦¨à§‡à¦° à¦…à¦­à¦¿à¦­à¦¾à¦¬à¦•à¦¤à§à¦¬ à¦“ à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦­à¦°à¦£à¦ªà§‹à¦·à¦£ à¦†à¦¦à¦¾à¦¯à¦¼à§‡ à¦¬à¦¿à¦¶à§‡à¦· à¦†à¦‡à¦¨à¦¿ à¦¸à§‡à¦²à¥¤</p>
        <a class="btn btn-outline btn-block" href="#/topic/family">à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦¸à¦®à¦¾à¦§à¦¾à¦¨ â†’</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">ðŸ“œ</div>
          <div>
            <span class="service-tag-badge">à¦­à§‚à¦®à¦¿</span>
            <h3>à¦­à§‚à¦®à¦¿ à¦“ à¦¸à¦®à§à¦ªà¦¤à§à¦¤à¦¿ à¦¬à¦¿à¦°à§‹à¦§ à¦ªà§à¦°à¦¤à¦¿à¦•à¦¾à¦°</h3>
          </div>
        </div>
        <p>à¦œà¦®à¦¿ à¦œà¦¬à¦°à¦¦à¦–à¦², à¦­à§à¦¯à¦¼à¦¾ à¦¦à¦²à¦¿à¦², à¦–à¦¤à¦¿à¦¯à¦¼à¦¾à¦¨ à¦¸à¦‚à¦¶à§‹à¦§à¦¨, à¦¨à¦¾à¦®à¦œà¦¾à¦°à¦¿ à¦“ à¦‰à¦¤à§à¦¤à¦°à¦¾à¦§à¦¿à¦•à¦¾à¦° à¦¸à¦®à§à¦ªà¦¤à§à¦¤à¦¿ à¦¬à¦£à§à¦Ÿà¦¨à§‡à¦° à¦¬à¦¿à¦°à§‹à¦§à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¥¤</p>
        <a class="btn btn-outline btn-block" href="#/topic/land">à¦­à§‚à¦®à¦¿ à¦…à¦§à¦¿à¦•à¦¾à¦° à¦¦à§‡à¦–à§à¦¨ â†’</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">ðŸš¨</div>
          <div>
            <span class="service-tag-badge">à¦•à¦¾à¦°à¦¾ à¦…à¦§à¦¿à¦•à¦¾à¦°</span>
            <h3>à¦•à¦¾à¦°à¦¾à¦¬à¦¨à§à¦¦à§€ à¦“ à¦œà¦¾à¦®à¦¿à¦¨ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾</h3>
          </div>
        </div>
        <p>à¦†à¦Ÿà¦• à¦¬à¦¿à¦šà¦¾à¦°à¦¾à¦§à§€à¦¨ à¦¬à¦¨à§à¦¦à§€à¦¦à§‡à¦° à¦œà¦¾à¦®à¦¿à¦¨ à¦†à¦¬à§‡à¦¦à¦¨ à¦“ à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦¨à¦¿à¦¯à¦¼à§‹à¦—à§‡à¦° à¦œà¦¨à§à¦¯ à¦œà§‡à¦²à¦–à¦¾à¦¨à¦¾ à¦ªà¦°à¦¿à¦¦à¦°à§à¦¶à¦¨à§‡à¦° à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾ à¦“ à¦¬à¦¿à¦¶à§‡à¦·à¦¾à¦§à¦¿à¦•à¦¾à¦° à¦¸à§‡à¦²à¥¤</p>
        <a class="btn btn-gold btn-block" href="#/apply?emergency=true">à¦œà¦°à§à¦°à¦¿ à¦œà¦¾à¦®à¦¿à¦¨ à¦†à¦¬à§‡à¦¦à¦¨ â†’</a>
      </div>
    </div>
  </div>`;
}

// ---------- à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾ à¦¯à¦¾à¦šà¦¾à¦‡ à¦ªà§‡à¦œ ----------
async function pageEligibility() {
  app.innerHTML = `
  <div class="container page-head">
    <span class="section-tag">à¦†à¦‡à¦¨à¦—à¦¤ à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾</span>
    <h1>âœ… à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾à¦° à¦…à¦§à¦¿à¦•à¦¾à¦° à¦¯à¦¾à¦šà¦¾à¦‡</h1>
    <p>à¦†à¦ªà¦¨à¦¿ à¦¬à¦¾ à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦°à¦¿à¦¬à¦¾à¦° à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦…à¦°à§à¦¥à¦¾à¦¯à¦¼à¦¨à§‡ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾à¦° à¦¯à§‹à¦—à§à¦¯ à¦•à¦¿à¦¨à¦¾ à¦¤à¦¾ à§¨ à¦®à¦¿à¦¨à¦¿à¦Ÿà§‡ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§à¦¨à¥¤</p>
  </div>
  <div class="container">
    <div class="eligibility-box" style="margin-bottom:3rem">
      <div class="eligibility-form">
        <div class="field">
          <label>à¦†à¦ªà¦¨à¦¾à¦° à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦¶à§à¦°à§‡à¦£à¦¿/à¦¬à¦¿à¦¬à§‡à¦šà§à¦¯ à¦¬à¦¿à¦·à§Ÿ:</label>
          <select id="elPageGroup">
            <option value="general">à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦…à¦¸à¦šà§à¦›à¦² à¦¨à¦¾à¦—à¦°à¦¿à¦•</option>
            <option value="women_child">à¦¨à¦¿à¦°à§à¦¯à¦¾à¦¤à¦¿à¦¤à¦¾/à¦…à¦¸à¦¹à¦¾à¦¯à¦¼ à¦¨à¦¾à¦°à§€ à¦“ à¦¶à¦¿à¦¶à§</option>
            <option value="disabled">à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€ à¦¬à§à¦¯à¦•à§à¦¤à¦¿ (à¦¶à¦¾à¦°à§€à¦°à¦¿à¦•/à¦®à¦¾à¦¨à¦¸à¦¿à¦•)</option>
            <option value="prisoner">à¦•à¦¾à¦°à¦¾à¦¬à¦¨à§à¦¦à§€ à¦“ à¦¬à¦¿à¦¨à¦¾ à¦¬à¦¿à¦šà¦¾à¦°à§‡ à¦†à¦Ÿà¦• à¦¬à§à¦¯à¦•à§à¦¤à¦¿</option>
            <option value="freedom_fighter">à¦…à¦¸à¦šà§à¦›à¦² à¦¬à§€à¦° à¦®à§à¦•à§à¦¤à¦¿à¦¯à§‹à¦¦à§à¦§à¦¾ à¦¬à¦¾ à¦ªà¦°à¦¿à¦¬à¦¾à¦°</option>
            <option value="acid_victim">à¦à¦¸à¦¿à¦¡à¦¦à¦—à§à¦§ à¦¬à¦¾ à¦ªà¦¾à¦šà¦¾à¦°à§‡à¦° à¦¶à¦¿à¦•à¦¾à¦° à¦¬à§à¦¯à¦•à§à¦¤à¦¿</option>
            <option value="garments_worker">à¦¶à§à¦°à¦®à¦¿à¦• à¦¬à¦¾ à¦¦à¦¿à¦¨à¦®à¦œà§à¦° (à¦•à¦°à§à¦®à¦•à§à¦·à§‡à¦¤à§à¦°à§‡ à¦•à§à¦·à¦¤à¦¿à¦—à§à¦°à¦¸à§à¦¤)</option>
          </select>
        </div>
        <div class="field">
          <label>à¦ªà¦°à¦¿à¦¬à¦¾à¦°à§‡à¦° à¦®à¦¾à¦¸à¦¿à¦• à¦®à§‹à¦Ÿ à¦†à¦¯à¦¼ (à¦Ÿà¦¾à¦•à¦¾):</label>
          <input type="number" id="elPageIncome" placeholder="à¦¯à§‡à¦®à¦¨: à§§à§¨à§¦à§¦à§¦" value="12000" min="0">
        </div>
      </div>
      <div class="eligibility-result" id="elPageResult"></div>

      <div style="margin-top:2rem;border-top:1px solid var(--border);padding-top:1.5rem">
        <h3 style="font-size:1.15rem;margin-bottom:10px">à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦¨à§€à¦¤à¦¿à¦®à¦¾à¦²à¦¾ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾:</h3>
        <ul style="color:var(--text-muted);font-size:0.92rem;line-height:1.7;padding-left:20px">
          <li>à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦…à¦¸à¦šà§à¦›à¦² à¦¬à§à¦¯à¦•à§à¦¤à¦¿ à¦¯à¦¾à¦° à¦¬à¦¾à§Žà¦¸à¦°à¦¿à¦• à¦†à¦¯à¦¼ à§§,à§®à§¦,à§¦à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾à¦° à¦¨à¦¿à¦šà§‡ (à¦…à¦¥à¦¬à¦¾ à¦¸à§à¦ªà§à¦°à§€à¦® à¦•à§‹à¦°à§à¦Ÿà§‡ à§¨,à§ªà§¦,à§¦à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾à¦° à¦¨à¦¿à¦šà§‡)à¥¤</li>
          <li>à¦¨à¦¾à¦°à§€ à¦“ à¦¶à¦¿à¦¶à§ à¦¨à¦¿à¦°à§à¦¯à¦¾à¦¤à¦¨ à¦¦à¦®à¦¨ à¦†à¦‡à¦¨à§‡à¦° à¦†à¦“à¦¤à¦¾à¦§à§€à¦¨ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦­à¦¿à¦•à¦Ÿà¦¿à¦® à¦¨à¦¾à¦°à§€ à¦¬à¦¾ à¦¶à¦¿à¦¶à§à¥¤</li>
          <li>à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€ à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦à¦¬à¦‚ à¦®à¦¾à¦¨à¦¬à¦ªà¦¾à¦šà¦¾à¦° à¦¬à¦¾ à¦à¦¸à¦¿à¦¡ à¦¸à¦¨à§à¦¤à§à¦°à¦¾à¦¸à§‡à¦° à¦¶à¦¿à¦•à¦¾à¦° à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦¬à§à¦¯à¦•à§à¦¤à¦¿ (à¦†à¦¯à¦¼à§‡à¦° à¦¸à§€à¦®à¦¾ à¦ªà§à¦°à¦¯à§‹à¦œà§à¦¯ à¦¨à¦¯à¦¼)à¥¤</li>
          <li>à¦†à¦¦à¦¾à¦²à¦¤à§‡ à¦¬à¦¾ à¦•à¦¾à¦°à¦¾à¦—à¦¾à¦°à§‡ à¦†à¦Ÿà¦• à¦…à¦¸à¦šà§à¦›à¦² à¦¬à¦¿à¦šà¦¾à¦°à¦¾à¦§à§€à¦¨ à¦¬à¦¾ à¦¸à¦¾à¦œà¦¾à¦ªà§à¦°à¦¾à¦ªà§à¦¤ à¦¬à¦¨à§à¦¦à§€à¥¤</li>
          <li>à¦…à¦¸à¦šà§à¦›à¦² à¦¬à§€à¦° à¦®à§à¦•à§à¦¤à¦¿à¦¯à§‹à¦¦à§à¦§à¦¾ à¦“ à¦¬à§€à¦°à¦¾à¦™à§à¦—à¦¨à¦¾à¦—à¦£à¥¤</li>
          <li>à¦¶à§à¦°à¦®à¦¿à¦• à¦¯à¦¾à¦° à¦šà¦¾à¦•à¦°à¦¿ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à¦­à¦¾à¦¬à§‡ à¦¬à¦°à¦–à¦¾à¦¸à§à¦¤ à¦¹à¦¯à¦¼à§‡à¦›à§‡ à¦¬à¦¾ à¦¨à§à¦¯à¦¾à¦¯à§à¦¯ à¦ªà¦¾à¦“à¦¨à¦¾ à¦¥à§‡à¦•à§‡ à¦¬à¦žà§à¦šà¦¿à¦¤à¥¤</li>
        </ul>
      </div>
    </div>
  </div>`;

  function checkPageEligibility() {
    const group = $('#elPageGroup')?.value || 'general';
    const income = Number($('#elPageIncome')?.value || 0);
    const resBox = $('#elPageResult');
    if (!resBox) return;

    const always = ['women_child', 'disabled', 'prisoner', 'freedom_fighter', 'acid_victim', 'garments_worker'];
    if (always.includes(group)) {
      resBox.innerHTML = `
        <div class="result-text">
          <strong style="color:var(--gov-green)">âœ… à¦†à¦ªà¦¨à¦¿ à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦° à¦¯à§‹à¦—à§à¦¯!</strong>
          <p>à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà§à¦°à¦¦à¦¾à¦¨ à¦†à¦‡à¦¨ à§¨à§¦à§¦à§¦ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦†à¦ªà¦¨à¦¾à¦° à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿à¦° à¦œà¦¨à§à¦¯ à¦¶à¦¤à¦­à¦¾à¦— à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦–à¦°à¦šà§‡ à¦¸à§‡à¦¬à¦¾ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à¦¾ à¦¹à¦¯à¦¼à§‡à¦›à§‡à¥¤</p>
        </div>
        <a class="btn btn-primary" href="#/apply">à¦†à¦¬à§‡à¦¦à¦¨ à¦œà¦®à¦¾ à¦¦à¦¿à¦¨ â†’</a>
      `;
    } else if (income <= 15000) {
      resBox.innerHTML = `
        <div class="result-text">
          <strong style="color:var(--gov-green)">âœ… à¦†à¦ªà¦¨à¦¿ à¦¶à¦¤à¦­à¦¾à¦— à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾à¦° à¦¯à§‹à¦—à§à¦¯!</strong>
          <p>à¦†à¦ªà¦¨à¦¾à¦° à¦®à¦¾à¦¸à¦¿à¦• à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦†à¦¯à¦¼ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦†à¦‡à¦¨à¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà§à¦°à¦¦à¦¾à¦¨ à¦¨à§€à¦¤à¦¿à¦®à¦¾à¦²à¦¾à¦° à¦®à¦§à§à¦¯à§‡ à¦°à¦¯à¦¼à§‡à¦›à§‡à¥¤</p>
        </div>
        <a class="btn btn-primary" href="#/apply">à¦†à¦¬à§‡à¦¦à¦¨ à¦œà¦®à¦¾ à¦¦à¦¿à¦¨ â†’</a>
      `;
    } else if (income <= 25000) {
      resBox.innerHTML = `
        <div class="result-text">
          <strong style="color:var(--gov-gold)">âš–ï¸ à¦†à¦ªà¦¨à¦¿ à¦¸à§à¦ªà§à¦°à§€à¦® à¦•à§‹à¦°à§à¦Ÿ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦¬à¦¾ à¦¬à¦¿à¦¶à§‡à¦· à¦¬à¦¿à¦¬à§‡à¦šà¦¨à¦¾à¦¯à¦¼ à¦¯à§‹à¦—à§à¦¯</strong>
          <p>à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¯à¦¼ à¦œà§‡à¦²à¦¾ à¦†à¦¦à¦¾à¦²à¦¤à§‡à¦° à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¸à§€à¦®à¦¾à¦° à¦•à¦¾à¦›à¦¾à¦•à¦¾à¦›à¦¿, à¦¤à¦¬à§‡ à¦¬à¦¿à¦¶à§‡à¦· à¦¬à§à¦¯à¦¯à¦¼ à¦¬à¦¿à¦¬à§‡à¦šà¦¨à¦¾à¦¯à¦¼ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦•à¦®à¦¿à¦Ÿà¦¿ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¦à¦¿à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¥¤</p>
        </div>
        <a class="btn btn-gold" href="#/apply">à¦¯à¦¾à¦šà¦¾à¦‡à¦¯à¦¼à§‡à¦° à¦œà¦¨à§à¦¯ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨ â†’</a>
      `;
    } else {
      resBox.innerHTML = `
        <div class="result-text">
          <strong>â„¹ï¸ à¦†à¦¯à¦¼à§‡à¦° à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¸à§€à¦®à¦¾à¦° à¦‰à¦ªà¦°à§‡ â€” à¦¤à¦¬à§‡ à¦¬à¦¿à¦¶à§‡à¦· à¦¬à¦¿à¦¬à§‡à¦šà¦¨à¦¾à¦¯à¦¼ à¦†à¦¬à§‡à¦¦à¦¨ à¦—à§à¦°à¦¾à¦¹à§à¦¯ à¦¹à¦¤à§‡ à¦ªà¦¾à¦°à§‡</strong>
          <p>à¦ªà¦°à¦¿à¦¬à¦¾à¦°à§‡à¦° à¦¸à¦¦à¦¸à§à¦¯à¦¦à§‡à¦° à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾ à¦“ à¦¨à¦¿à¦°à§à¦­à¦°à¦¤à¦¾à¦° à¦¬à§à¦¯à¦¯à¦¼ à¦¬à¦¿à¦¬à§‡à¦šà¦¨à¦¾à¦¯à¦¼ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦¬à¦¿à¦¶à§‡à¦· à¦›à¦¾à¦¡à¦¼ à¦¦à¦¿à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨à¥¤</p>
        </div>
        <a class="btn btn-outline" href="#/guide">à¦¬à¦¿à¦•à¦²à§à¦ª à¦—à¦¾à¦‡à¦¡ à¦¦à§‡à¦–à§à¦¨ â†’</a>
      `;
    }
  }

  $('#elPageGroup').onchange = checkPageEligibility;
  $('#elPageIncome').oninput = checkPageEligibility;
  checkPageEligibility();
}

function officeCard(o) {
  return `<div class="office-card" data-office="${o.id}" onclick="focusOffice('${o.id}')">
    <h3>${esc(o.name)}</h3>
    <p>${esc(o.address)}</p>
    <p>ðŸ•˜ ${esc(o.hours)}</p>
    <a class="office-phone" href="tel:${esc(o.phone)}">ðŸ“ž ${esc(o.phone)}</a>
  </div>`;
}

function focusOffice(id) {
  const o = BOOT.offices.find((x) => x.id === id);
  if (!o) return;
  highlightCard(id);
  if (mapObj && o._marker) {
    mapObj.setView([o.lat, o.lng], 13);
    o._marker.openPopup();
  }
}
window.focusOffice = focusOffice;

function newsCard(n) {
  return `<a class="news-card" href="#/news/${n.id}">
    <div class="news-img"><img src="${esc(n.img)}" alt="" loading="lazy" onerror="this.style.display='none';this.parentElement.style.fontSize='3rem';this.parentElement.innerHTML='ðŸ“°'"></div>
    <div class="news-body">
      <span class="news-badge ${n.type}">${n.type === 'event' ? t('event') : t('news')}</span>
      <h3>${esc(n.title)}</h3>
      <div class="news-date">${t('posted')}: ${esc(n.date)}</div>
    </div>
  </a>`;
}

// ---------- à¦Ÿà¦ªà¦¿à¦• à¦ªà§‡à¦œ ----------
async function pageTopics() {
  app.innerHTML = `
  <div class="container page-head">
    <h1>${t('libraryTitle')}</h1><p>${t('libraryBody')}</p>
    <div class="search-bar" style="margin-top:1rem;max-width:100%">
      <input id="topicQ" placeholder="${t('searchPh')}">
    </div>
  </div>
  <div class="container"><div class="topic-grid" id="topicGrid"></div></div>`;
  const render = (q = '') => {
    const cats = BOOT.categories.filter((c) => !q || (c.title + c.desc).toLowerCase().includes(q.toLowerCase()));
    $('#topicGrid').innerHTML = cats.map((c) => {
      const count = (BOOT.articles || []).filter((a) => a.topic === c.id).length;
      return `<a class="topic-card" href="#/topic/${c.id}">
        <span class="topic-icon">${c.icon}</span>
        <span><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p>
        <small style="color:var(--brand)">${bnNum(count)}à¦Ÿà¦¿ à¦†à¦°à§à¦Ÿà¦¿à¦•à§‡à¦²</small></span>
      </a>`;
    }).join('') || `<div class="empty-state">${t('noResults')}</div>`;
  };
  render();
  $('#topicQ').oninput = (e) => render(e.target.value);
}

async function pageTopic(id) {
  const cat = BOOT.categories.find((c) => c.id === id);
  if (!cat) return pageTopics();
  const sections = BOOT.sections[id] || [];
  const countAll = (list) => list.reduce((n, s) => n + (s.children ? countAll(s.children) : 1), 0);
  app.innerHTML = `
  <div class="container page-head">
    <div class="breadcrumb"><a href="#/topics">${t('navLibrary')}</a> / ${esc(cat.title)}</div>
    <h1><span class="topic-icon" style="display:inline-flex;vertical-align:middle;margin-right:.5rem">${cat.icon}</span>${esc(cat.title)}</h1>
    <p>${esc(cat.desc)}</p>
  </div>
  <div class="container">
    <div class="topic-grid">
      ${sections.map((s) => `
        <a class="topic-card" href="${s.kind === 'form' ? '#/form/' + s.formId : '#/section/' + s.id}">
          <span class="topic-icon">${s.icon || (s.kind === 'form' ? 'ðŸ“„' : 'ðŸ“–')}</span>
          <span><h3>${esc(s.title)}</h3>
          ${s.desc ? `<p>${esc(s.desc)}</p>` : ''}
          <small style="color:var(--brand)">${s.kind === 'form' ? t('formBadge') : s.children ? bnNum(countAll(s.children)) + 'à¦Ÿà¦¿ à¦†à¦‡à¦Ÿà§‡à¦®' : t('readArt')}</small></span>
        </a>`).join('')}
    </div>
    <div class="quick-ans" style="margin-top:1.6rem">
      <strong>${t('needMoreHelp')}</strong>
      <p style="color:var(--muted);margin:.3rem 0 .7rem">${t('moreHelpBody')}</p>
      <a class="btn btn-primary btn-sm" href="#/guide">${t('useGuide')} â†’</a>
    </div>
  </div>`;
}

// à¦¸à§‡à¦•à¦¶à¦¨ (folder) à¦ªà§‡à¦œ â€” à¦¸à¦¾à¦¬-à¦¸à¦¾à¦¬-à¦†à¦‡à¦Ÿà§‡à¦®
async function pageSection(id) {
  // à¦¸à¦¬ à¦Ÿà¦ªà¦¿à¦•à§‡à¦° à¦¸à§‡à¦•à¦¶à¦¨à¦—à§à¦²à§‹à¦¤à§‡ à¦–à§à¦à¦œà¦¿
  let section = null, parentCat = null;
  for (const [catId, secs] of Object.entries(BOOT.sections)) {
    const hit = secs.find((s) => s.id === id);
    if (hit) { section = hit; parentCat = BOOT.categories.find((c) => c.id === catId); break; }
  }
  if (!section) return pageTopics();
  app.innerHTML = `
  <div class="container page-head">
    <div class="breadcrumb">
      <a href="#/topics">${t('navLibrary')}</a> /
      ${parentCat ? `<a href="#/topic/${parentCat.id}">${esc(parentCat.title)}</a> /` : ''}
      ${esc(section.title)}
    </div>
    <h1>${section.icon || ''} ${esc(section.title)}</h1>
  </div>
  <div class="container"><div class="art-grid art-grid-2">
    ${(section.children || []).map((ch) => {
      if (ch.kind === 'form') {
        return `<a class="art-card" href="#/form/${ch.formId}">
          <span class="art-form-badge">${t('formBadge')}</span>
          <h3>${esc(ch.title)}</h3>
          <p>${t('fillForm')} â†’</p>
        </a>`;
      }
      const a = BOOT.articles.find((x) => x.id === ch.id);
      return `<a class="art-card" href="#/article/${ch.id}">
        <h3>${esc(ch.title)}</h3>
        <p>${a ? esc(a.summary) : ''}</p>
        ${a ? `<div class="art-meta"><span>â± ${esc(a.read)}</span></div>` : ''}
      </a>`;
    }).join('')}
  </div></div>`;
}

// ---------- à¦«à¦°à¦® à¦ªà§‡à¦œ (input â†’ generated output) ----------
async function pageForm(id) {
  const f = await apiGet('form', { id });
  if (!f || f.error) return pageTopics();
  app.innerHTML = `
  <div class="container page-head">
    <div class="breadcrumb"><a href="#/topics">${t('navLibrary')}</a> / ${esc(f.title)}</div>
    <h1>ðŸ“„ ${esc(f.title)}</h1>
    ${f.law ? `<p>ðŸ“œ à¦†à¦‡à¦¨: ${esc(f.law)}</p>` : ''}
  </div>
  <div class="container"><div class="form-card">
    <div class="form-grid" id="formFields">
      ${f.fields.map((fd) => `
        <div class="field ${fd.type === 'textarea' ? 'full' : ''}">
          <label>${esc(fd.label)} ${fd.req ? '<span class="req">*</span>' : ''}</label>
          ${fd.type === 'textarea'
            ? `<textarea id="ff_${fd.id}"></textarea>`
            : fd.type === 'select'
              ? `<select id="ff_${fd.id}">${(fd.options || []).map((o) => `<option>${esc(o)}</option>`).join('')}</select>`
              : `<input id="ff_${fd.id}" type="${fd.type === 'number' ? 'number' : fd.type === 'date' ? 'date' : 'text'}">`}
        </div>`).join('')}
    </div>
    <div id="formErr" class="form-error hidden"></div>
    <button class="btn btn-primary btn-block" id="fGen" style="margin-top:1.2rem">${t('generate')}</button>
    <div id="formOut"></div>
  </div></div>`;
  $('#fGen').onclick = () => {
    const missing = [];
    const vals = {};
    for (const fd of f.fields) {
      const v = $('#ff_' + fd.id)?.value.trim() || '';
      if (fd.req && !v) missing.push(fd.label);
      vals[fd.id] = v;
    }
    if (missing.length) {
      const e = $('#formErr');
      e.textContent = 'à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§€à¦¯à¦¼ à¦˜à¦° à¦ªà§‚à¦°à¦£ à¦•à¦°à§à¦¨: ' + missing.join(', ');
      e.classList.remove('hidden');
      return;
    }
    $('#formErr').classList.add('hidden');
    const today = new Date().toLocaleDateString('bn-BD');
    let out = `à¦¤à¦¾à¦°à¦¿à¦–: ${today}\n\n`;
    out += `à¦¬à¦¿à¦·à¦¯à¦¼: ${f.title}\n`;
    if (f.law) out += `à¦†à¦‡à¦¨: ${f.law}\n`;
    out += `\n${'â€”'.repeat(24)}\n\n`;
    for (const fd of f.fields) out += `${fd.label}: ${vals[fd.id] || 'â€”'}\n`;
    out += `\n${'â€”'.repeat(24)}\n\n`;
    out += `à¦†à¦¬à§‡à¦¦à¦¨à¦•à¦¾à¦°à§€/à¦¨à§‹à¦Ÿà¦¿à¦¶à¦¦à¦¾à¦¤à¦¾\nà¦¸à§à¦¬à¦¾à¦•à§à¦·à¦°: ______________\n\n`;
    out += `(à¦¸à¦‚à¦¶à§à¦²à¦¿à¦·à§à¦Ÿ à¦…à¦«à¦¿à¦¸à§‡ à¦œà¦®à¦¾ à¦¦à§‡à¦“à¦¯à¦¼à¦¾à¦° à¦†à¦—à§‡ à¦ªà¦¡à¦¼à§‡ à¦¨à¦¿à¦¨à¥¤ à¦à¦‡ à¦¨à§‹à¦Ÿà¦¿à¦¶/à¦†à¦¬à§‡à¦¦à¦¨à¦Ÿà¦¿ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦° à¦œà¦¨à§à¦¯ à¦¤à§ˆà¦°à¦¿ â€” à¦†à¦‡à¦¨à¦¿ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦¨à¦¯à¦¼à¥¤)`;
    $('#formOut').innerHTML = `
      <h2 style="margin-top:1.6rem">âœ… à¦†à¦ªà¦¨à¦¾à¦° ${t('formBadge')} à¦¤à§ˆà¦°à¦¿ à¦¹à¦¯à¦¼à§‡à¦›à§‡</h2>
      <div class="output-doc" id="outDoc">${esc(out)}</div>
      <div class="output-actions">
        <button class="btn btn-outline" id="outCopy">ðŸ“‹ ${t('printCopy')}</button>
        <a class="btn btn-primary" href="#/apply">${t('ctaApply')} â†’</a>
      </div>`;
    $('#outCopy').onclick = () => {
      navigator.clipboard.writeText($('#outDoc').textContent).then(() => toast(t('copied')));
    };
    $('#formOut').scrollIntoView({ behavior: 'smooth' });
  };
}

async function pageArticle(id) {
  const a = await apiGet('article', { id });
  if (!a || a.error) return pageTopics();
  const cat = BOOT.categories.find((c) => c.id === a.topic);
  const bodyHtml = (a.body || []).map((b) => {
    if (b.h) return `<h2>${esc(b.h)}</h2>`;
    if (b.p) return `<p>${esc(b.p)}</p>`;
    if (b.li) return `<ul>${b.li.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (b.warn) return `<div class="warn">âš ï¸ ${esc(b.warn)}</div>`;
    return '';
  }).join('');
  const related = BOOT.articles.filter((x) => x.topic === a.topic && x.id !== a.id).slice(0, 3);
  app.innerHTML = `
  <div class="container page-head article-wrap">
    <div class="breadcrumb"><a href="#/topics">${t('navLibrary')}</a> / <a href="#/topic/${esc(a.topic)}">${esc(cat?.title || '')}</a></div>
    <h1>${esc(a.title)}</h1>
    <div class="article-meta"><span>${t('updated')}: ${esc(a.updated)}</span><span>â± ${t('read')}: ${esc(a.read)}</span></div>
    <p><strong>${esc(a.summary)}</strong></p>
    ${bodyHtml}
    <div class="quick-ans">
      <strong>à¦à¦‡ à¦¬à¦¿à¦·à¦¯à¦¼à§‡ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦¦à¦°à¦•à¦¾à¦°?</strong>
      <p style="margin:.4rem 0 .8rem;color:var(--muted)">à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨ â€” à¦¯à§‹à¦—à§à¦¯ à¦¹à¦²à§‡ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦“ à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾ à¦ªà¦¾à¦¬à§‡à¦¨à¥¤</p>
      <a class="btn btn-primary btn-sm" href="#/apply">${t('ctaApply')}</a>
      <a class="btn btn-outline btn-sm" href="tel:16699" style="margin-left:.5rem">ðŸ“ž à§§à§¬à§¬à§¯à§¯</a>
    </div>
    ${related.length ? `<h2 style="margin-top:2rem">${t('relatedArt')}</h2>
      <div class="art-grid" style="margin-top:1rem">${related.map((r) => `<a class="art-card" href="#/article/${r.id}"><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p></a>`).join('')}</div>` : ''}
  </div>`;
}

// ---------- à¦—à¦¾à¦‡à¦¡ à¦‰à¦‡à¦œà¦¾à¦°à§à¦¡ ----------
const guideState = { q: 1, topic: null, need: null, income: null };
async function pageGuide() {
  guideState.q = 1; guideState.topic = null; guideState.need = null; guideState.income = null;
  renderGuide();
}
function renderGuide() {
  const g = BOOT.guide;
  const key = 'q' + guideState.q;
  const step = g[key];
  if (step) {
    app.innerHTML = `
    <div class="container page-head"><h1>ðŸ§­ ${t('navGuide')}</h1><p>${t('guideLead')}</p></div>
    <div class="container"><div class="form-card">
      <div class="wizard-steps">
        ${[1, 2, 3].map((i) => `<div class="wstep ${i === guideState.q ? 'active' : i < guideState.q ? 'done' : ''}">${bnNum(i)}</div>`).join('')}
      </div>
      <h2 style="margin-bottom:1rem">${esc(step.title)}</h2>
      ${step.options.map((o, i) => `<button class="guide-option" data-i="${i}">${esc(o.label)}</button>`).join('')}
      <div class="wizard-actions">
        ${guideState.q > 1 ? `<button class="btn btn-ghost" id="gBack">â† ${t('guideBack')}</button>` : '<span></span>'}
      </div>
    </div></div>`;
    $$('.guide-option').forEach((btn) => btn.onclick = () => {
      const o = step.options[+btn.dataset.i];
      if (o.topic) guideState.topic = o.topic;
      if (o.need) guideState.need = o.need;
      if (o.income != null) guideState.income = o.income;
      if (o.next) { guideState.q++; renderGuide(); }
      else renderGuideResult();
    });
    const back = $('#gBack');
    if (back) back.onclick = () => { guideState.q--; renderGuide(); };
    return;
  }
  renderGuideResult();
}
async function renderGuideResult() {
  const r = await apiPost('guide', guideState);
  app.innerHTML = `
  <div class="container page-head"><h1>ðŸŽ¯ ${t('guideResult')}</h1></div>
  <div class="container"><div class="form-card" style="max-width:760px">
    ${r.topic ? `<div class="section-eyebrow">${r.topic.icon} ${esc(r.topic.title)}</div>` : ''}
    ${r.eligibility ? `<div class="quick-ans"><strong>${esc(r.eligibility.title)}</strong><p style="color:var(--muted)">${esc(r.eligibility.sub)}</p></div>` : ''}
    <p style="margin:1rem 0">${esc(r.next)}</p>
    ${r.articles.length ? `<h3>${t('guideReadArt')}</h3>
      <div class="art-grid" style="margin-top:.8rem">${r.articles.map((a) => `<a class="art-card" href="#/article/${a.id}"><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p></a>`).join('')}</div>` : ''}
    <div class="wizard-actions">
      <button class="btn btn-ghost" id="gRestart">â†º ${t('guideRestart')}</button>
      <a class="btn btn-primary" href="#/apply">${t('ctaApply')} â†’</a>
    </div>
  </div></div>`;
  $('#gRestart').onclick = () => pageGuide();
}

// ---------- à¦†à¦¬à§‡à¦¦à¦¨ à¦«à¦°à¦® ----------
async function pageApply() {
  const districts = Object.values(BOOT.mediationDistricts && BOOT.divisions ? BOOT.divisions : []).flat();
  const allDistricts = [...new Set(BOOT.offices.map((o) => o.district))];
  const state = { step: 1, data: {} };
  render();

  function render() {
    const steps = ['à¦¸à¦®à¦¸à§à¦¯à¦¾', 'à¦ªà¦°à¦¿à¦šà¦¯à¦¼', 'à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦—', 'à¦†à¦°à§à¦¥-à¦¸à¦¾à¦®à¦¾à¦œà¦¿à¦•', 'à¦¬à¦¿à¦°à§‹à¦§à§€ à¦ªà¦•à§à¦·', 'à¦¯à¦¾à¦šà¦¾à¦‡ à¦“ à¦œà¦®à¦¾'];
    app.innerHTML = `
    <div class="container page-head"><h1>ðŸ“ ${t('applyTitle')}</h1><p>${t('applyLead')}</p></div>
    <div class="container"><div class="form-card" style="max-width:720px">
      <div class="wizard-steps">${steps.map((s, i) => `<div class="wstep ${i + 1 === state.step ? 'active' : i + 1 < state.step ? 'done' : ''}">${bnNum(i + 1)}. ${s}</div>`).join('')}</div>
      <div id="stepBody"></div>
      <div class="wizard-actions">
        <button class="btn btn-ghost" id="aPrev" ${state.step === 1 ? 'style="visibility:hidden"' : ''}>â† ${t('guideBack')}</button>
        <button class="btn btn-primary" id="aNext">${state.step === 6 ? 'âœ“ à¦œà¦®à¦¾ à¦¦à¦¿à¦¨' : t('guideNext') + ' â†’'}</button>
      </div>
    </div></div>`;
    renderStep();
    $('#aPrev').onclick = () => { if (state.step > 1) { state.step--; render(); } };
    $('#aNext').onclick = () => {
      if (!collect()) return;
      if (state.step < 6) { state.step++; render(); }
      else submit();
    };
  }

  function stepHtml(inner) { $('#stepBody').innerHTML = inner; }

  function renderStep() {
    const d = state.data;
    if (state.step === 1) {
      stepHtml(`
        <div class="field"><label>${'à¦†à¦ªà¦¨à¦¾à¦° à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦•à§‹à¦¨ à¦§à¦°à¦¨à§‡à¦°?'} <span class="req">*</span></label>
          <select id="f_caseType">${BOOT.caseTypes.map((c) => `<option value="${c.id}" ${d.caseType === c.id ? 'selected' : ''}>${esc(c.label)} â€” ${esc(c.desc)}</option>`).join('')}</select></div>
        <div class="field" style="margin-top:.9rem"><label>${'à¦†à¦ªà¦¨à¦¾à¦° à¦‰à¦¦à§à¦¦à§‡à¦¶à§à¦¯'}</label>
          <select id="f_purpose">
            <option value="new" ${d.purpose === 'new' ? 'selected' : ''}>à¦¨à¦¤à§à¦¨ à¦®à¦¾à¦®à¦²à¦¾/à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿</option>
            <option value="mediation" ${d.purpose === 'mediation' ? 'selected' : ''}>à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾à¦¯à¦¼ à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿ à¦šà¦¾à¦‡</option>
            <option value="lawyer" ${d.purpose === 'lawyer' ? 'selected' : ''}>à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦“ à¦†à¦¦à¦¾à¦²à¦¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾</option>
            <option value="change-lawyer" ${d.purpose === 'change-lawyer' ? 'selected' : ''}>à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨à§‡à¦° à¦…à¦¨à§à¦°à§‹à¦§ (à¦šà¦²à¦®à¦¾à¦¨ à¦®à¦¾à¦®à¦²à¦¾à¦¯à¦¼)</option>
            <option value="advice" ${d.purpose === 'advice' ? 'selected' : ''}>à¦¶à§à¦§à§ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶</option>
          </select></div>
        <div class="field" style="margin-top:.9rem"><label>${'à¦œà§‡à¦²à¦¾'} <span class="req">*</span></label>
          <select id="f_district">${allDistricts.map((x) => `<option ${d.district === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
        <div class="field" style="margin-top:.9rem"><label>${'à¦¸à¦®à¦¸à§à¦¯à¦¾à¦° à¦¬à¦¿à¦¬à¦°à¦£'} <span class="req">*</span></label>
          <textarea id="f_problem" placeholder="à¦•à§€ à¦˜à¦Ÿà§‡à¦›à§‡, à¦•à¦¬à§‡ à¦¥à§‡à¦•à§‡, à¦ªà§à¦°à¦¤à¦¿à¦ªà¦•à§à¦· à¦•à§‡ â€” à¦¸à¦‚à¦•à§à¦·à§‡à¦ªà§‡ à¦²à¦¿à¦–à§à¦¨">${esc(d.problem || '')}</textarea></div>
        <label class="check-line" style="margin-top:.8rem"><input type="checkbox" id="f_emergency" ${d.emergency ? 'checked' : ''}> à¦œà¦°à§à¦°à¦¿ à¦†à¦‡à¦¨à¦—à¦¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨</label>
        <label class="check-line"><input type="checkbox" id="f_sensitive" ${d.sensitive ? 'checked' : ''}> à¦à¦Ÿà¦¿ à¦¸à§à¦ªà¦°à§à¦¶à¦•à¦¾à¦¤à¦° à¦…à¦­à¦¿à¦¯à§‹à¦— (à¦¨à¦¿à¦°à§à¦¯à¦¾à¦¤à¦¨/à¦¨à¦¿à¦°à¦¾à¦ªà¦¤à§à¦¤à¦¾ à¦à§à¦à¦•à¦¿) â€” à¦¸à§€à¦®à¦¿à¦¤ à¦…à§à¦¯à¦¾à¦•à§à¦¸à§‡à¦¸à§‡ à¦°à¦¾à¦–à§à¦¨</label>`);
    } else if (state.step === 2) {
      stepHtml(`
        <div class="field"><label>${t('name')} <span class="req">*</span></label><input id="f_name" value="${esc(d.name || '')}"></div>
        <div class="form-grid" style="margin-top:.9rem">
          <div class="field"><label>${'à¦²à¦¿à¦™à§à¦—'}</label><select id="f_gender"><option>à¦ªà§à¦°à§à¦·</option><option>à¦®à¦¹à¦¿à¦²à¦¾</option><option>à¦…à¦¨à§à¦¯</option></select></div>
          <div class="field"><label>${'à¦¬à¦¯à¦¼à¦¸'}</label><input id="f_age" type="number" min="0" value="${esc(d.age || '')}"></div>
        </div>
        <div class="field" style="margin-top:.9rem"><label>${t('nid')}</label><input id="f_nid" value="${esc(d.nid || '')}" placeholder="à§§à§¦/à§§à§©/à§§à§­ à¦¡à¦¿à¦œà¦¿à¦Ÿ"></div>`);
    } else if (state.step === 3) {
      stepHtml(`
        <div class="field"><label>${t('phone')} <span class="req">*</span></label><input id="f_phone" value="${esc(d.phone || '')}" placeholder="${t('phonePh')}"><div class="hint">à¦à¦‡ à¦¨à¦®à§à¦¬à¦°à§‡à¦‡ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦à¦¸à¦à¦®à¦à¦¸ à¦¯à¦¾à¦¬à§‡</div></div>
        <div class="field" style="margin-top:.9rem"><label>${t('email')}</label><input id="f_email" value="${esc(d.email || '')}"></div>
        <div class="field" style="margin-top:.9rem"><label>${'à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦ à¦¿à¦•à¦¾à¦¨à¦¾'}</label><textarea id="f_addr" style="min-height:70px">${esc(d.addr || '')}</textarea></div>
        <div class="quick-ans" style="margin-top:1rem">
          <strong>ðŸ“µ à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— (A1)</strong> â€” à¦†à¦ªà¦¨à¦¾à¦° à¦«à§‹à¦¨ à¦…à¦¨à§à¦¯ à¦•à§‡à¦‰ à¦¨à¦¿à¦¯à¦¼à¦¨à§à¦¤à§à¦°à¦£ à¦•à¦°à¦²à§‡ à¦à¦–à¦¾à¦¨à§‡ à¦²à¦¿à¦–à§à¦¨; à¦…à¦«à¦¿à¦¸ à¦¶à§à¦§à§ à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦¨à¦®à§à¦¬à¦°à§‡, à¦¨à¦¿à¦°à¦ªà§‡à¦•à§à¦· à¦­à¦¾à¦·à¦¾à¦¯à¦¼ à¦•à¦¥à¦¾ à¦¬à¦²à¦¬à§‡à¥¤
        </div>
        <div class="form-grid" style="margin-top:.9rem">
          <div class="field"><label>à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦¨à¦®à§à¦¬à¦° (à¦¨à¦¾ à¦¦à¦¿à¦²à§‡ à¦‰à¦ªà¦°à§‡à¦° à¦«à§‹à¦¨à¦‡ à¦§à¦°à¦¾ à¦¹à¦¬à§‡)</label><input id="f_safe" value="${esc(d.safeNumber || '')}" placeholder="01XXXXXXXXX"></div>
          <div class="field"><label>à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦—à§‡à¦° à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦¸à¦®à¦¯à¦¼</label><input id="f_window" value="${esc(d.window || '')}" placeholder="à¦¯à§‡à¦®à¦¨: à¦¸à¦•à¦¾à¦² à§§à§§à¦Ÿà¦¾â€“à¦¦à§à¦ªà§à¦° à§§à¦Ÿà¦¾"></div>
        </div>
        <div class="field" style="margin-top:.9rem"><label>à¦¯à§‡ à¦¨à¦®à§à¦¬à¦°à§‡ à¦•à¦² à¦•à¦°à¦¾ à¦¯à¦¾à¦¬à§‡ à¦¨à¦¾ (à¦•à¦®à¦¾ à¦¦à¦¿à¦¯à¦¼à§‡ à¦†à¦²à¦¾à¦¦à¦¾ à¦•à¦°à§à¦¨)</label><input id="f_unsafe" value="${esc(d.unsafeNumbers || '')}" placeholder="018XXXXXXXX, 019XXXXXXXX"><div class="hint">à¦à¦‡ à¦¨à¦®à§à¦¬à¦°à§‡ à¦°à¦¿à¦‚ à¦—à§‡à¦²à§‡ à¦•à¦² à¦¬à¦¿à¦²à¦®à§à¦¬à¦¿à¦¤ à¦¹à¦¬à§‡ à¦“ à¦²à¦— à¦¹à¦¬à§‡ â€” à¦•à¦¾à¦°à¦£à¦¸à¦¹ à¦°à§‡à¦•à¦°à§à¦¡à§‡ à¦¥à¦¾à¦•à¦¬à§‡</div></div>`);
    } else if (state.step === 4) {
      stepHtml(`
        <div class="form-grid">
          <div class="field"><label>${'à¦ªà§‡à¦¶à¦¾'}</label><input id="f_occ" value="${esc(d.occ || '')}"></div>
          <div class="field"><label>${'à¦®à¦¾à¦¸à¦¿à¦• à¦†à¦¯à¦¼ (à¦Ÿà¦¾à¦•à¦¾)'}</label><input id="f_income" type="number" min="0" value="${esc(d.income || '')}"></div>
        </div>
        <div class="field" style="margin-top:.9rem"><label>${'à¦¨à¦¿à¦°à§à¦­à¦°à¦¶à§€à¦² à¦¸à¦¦à¦¸à§à¦¯ à¦¸à¦‚à¦–à§à¦¯à¦¾'}</label><input id="f_deps" type="number" min="0" value="${esc(d.deps || '')}"></div>
        <div class="quick-ans" style="margin-top:1rem">
          <strong>à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾à¦° à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¸à§€à¦®à¦¾:</strong> à¦¬à¦¾à¦°à§à¦·à¦¿à¦• à¦†à¦¯à¦¼ à§§,à§®à§¦,à§¦à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾à¦° à¦¨à¦¿à¦šà§‡ à¦¹à¦²à§‡ à¦¸à¦¾à¦§à¦¾à¦°à¦£à¦¤ à¦¯à§‹à¦—à§à¦¯à¥¤ à¦¨à¦¾à¦°à§€-à¦¶à¦¿à¦¶à§, à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€, à¦®à§à¦•à§à¦¤à¦¿à¦¯à§‹à¦¦à§à¦§à¦¾, à¦¬à¦¨à§à¦¦à§€ à¦“ à¦ªà¦¾à¦šà¦¾à¦°-à¦à¦¸à¦¿à¦¡ à¦¨à¦¿à¦°à§à¦¯à¦¾à¦¤à¦¨à§‡à¦° à¦¶à¦¿à¦•à¦¾à¦° à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦¯à§‹à¦—à§à¦¯à¥¤
        </div>`);
    } else if (state.step === 5) {
      stepHtml(`
        <div class="field"><label>${'à¦ªà§à¦°à¦¤à¦¿à¦ªà¦•à§à¦·à§‡à¦° à¦¨à¦¾à¦®'}</label><input id="f_oppName" value="${esc(d.oppName || '')}"></div>
        <div class="form-grid" style="margin-top:.9rem">
          <div class="field"><label>${'à¦ªà§à¦°à¦¤à¦¿à¦ªà¦•à§à¦·à§‡à¦° à¦§à¦°à¦¨'}</label><select id="f_oppType">
            <option>à¦¬à§à¦¯à¦•à§à¦¤à¦¿</option><option>à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨/à¦•à§‹à¦®à§à¦ªà¦¾à¦¨à¦¿</option><option>à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦…à¦«à¦¿à¦¸</option><option>à¦…à¦œà¦¾à¦¨à¦¾</option>
          </select></div>
          <div class="field"><label>${'à¦ªà§à¦°à¦¤à¦¿à¦ªà¦•à§à¦·à§‡à¦° à¦«à§‹à¦¨ (à¦œà¦¾à¦¨à¦²à§‡)'}</label><input id="f_oppPhone" value="${esc(d.oppPhone || '')}"></div>
        </div>
        <div class="quick-ans" style="margin-top:1rem"><strong>à¦¨à§‹à¦Ÿ:</strong> à¦ªà§à¦°à¦¤à¦¿à¦ªà¦•à§à¦·à§‡à¦° à¦¤à¦¥à§à¦¯ à¦†à¦ªà¦¨à¦¾à¦° à¦¤à¦¥à§à¦¯à§‡à¦° à¦®à¦¤à§‹ à¦¸à§à¦°à¦•à§à¦·à¦¿à¦¤ à¦¥à¦¾à¦•à¦¬à§‡ à¦à¦¬à¦‚ à¦ªà§à¦°à¦¤à¦¿à¦ªà¦•à§à¦·à¦•à§‡ à¦•à¦–à¦¨à§‹ à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨à§‡à¦° à¦¬à¦¿à¦¬à¦°à¦£ à¦¦à§‡à¦–à¦¾à¦¨à§‹ à¦¹à¦¬à§‡ à¦¨à¦¾à¥¤</div>`);
    } else {
      const d2 = state.data;
      stepHtml(`
        <h3>à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§à¦¨</h3>
        <div class="quick-ans" style="margin-top:.8rem">
          <p><strong>à¦§à¦°à¦¨:</strong> ${esc(BOOT.caseTypes.find((c) => c.id === d2.caseType)?.label || '')}</p>
          <p><strong>à¦¨à¦¾à¦®:</strong> ${esc(d2.name || 'â€”')} Â· <strong>à¦«à§‹à¦¨:</strong> ${esc(d2.phone || 'â€”')}</p>
          <p><strong>à¦œà§‡à¦²à¦¾:</strong> ${esc(d2.district || 'â€”')} Â· <strong>à¦œà¦°à§à¦°à¦¿:</strong> ${d2.emergency ? 'à¦¹à§à¦¯à¦¾à¦' : 'à¦¨à¦¾'} Â· <strong>à¦¸à§à¦ªà¦°à§à¦¶à¦•à¦¾à¦¤à¦°:</strong> ${d2.sensitive ? 'à¦¹à§à¦¯à¦¾à¦' : 'à¦¨à¦¾'}</p>
        </div>
        <div class="quick-ans" style="margin-top:.8rem;border-color:var(--brand)"><strong>ðŸ†“ à¦«à§à¦°à¦¿-à¦¸à¦¾à¦°à§à¦­à¦¿à¦¸ à¦¨à§‹à¦Ÿà¦¿à¦¶ (B4):</strong> à¦à¦‡ à¦¸à§‡à¦¬à¦¾ à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ â€” à¦†à¦¬à§‡à¦¦à¦¨ à¦«à¦¿, à¦†à¦‡à¦¨à¦œà§€à¦¬à§€à¦° à¦«à¦¿ à¦¬à¦¾ à¦†à¦¦à¦¾à¦²à¦¤ à¦«à¦¿ à¦•à¦¿à¦›à§à¦‡ à¦¦à¦¿à¦¤à§‡ à¦¹à¦¬à§‡ à¦¨à¦¾à¥¤ à¦•à§‡à¦‰ à¦Ÿà¦¾à¦•à¦¾ à¦šà¦¾à¦‡à¦²à§‡ à§§à§¬à§¬à§¯à§¯-à¦ à¦œà¦¾à¦¨à¦¾à¦¨à¥¤</div>
        <label class="check-line" style="margin-top:1rem"><input type="checkbox" id="f_true"> à¦†à¦®à¦¿ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à¦›à¦¿ à¦‰à¦ªà¦°à§‡à¦° à¦¸à¦¬ à¦¤à¦¥à§à¦¯ à¦¸à¦ à¦¿à¦•</label>
        <div class="quick-ans" style="margin-top:1rem"><strong>à¦†à¦ªà¦¨à¦¾à¦° à¦¤à¦¥à§à¦¯ à¦•à§€à¦­à¦¾à¦¬à§‡ à¦¬à§à¦¯à¦¬à¦¹à§ƒà¦¤ à¦¹à¦¯à¦¼:</strong> à¦¶à§à¦§à§à¦®à¦¾à¦¤à§à¦° à¦†à¦ªà¦¨à¦¾à¦° à¦•à§‡à¦¸ à¦¸à¦¾à¦®à¦²à¦¾à¦¨à§‹ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦¦à§‡à¦–à¦¬à§‡à¦¨; à¦ªà§à¦°à¦¤à¦¿à¦ªà¦•à§à¦· à¦•à¦–à¦¨à§‹ à¦¨à¦¯à¦¼à¥¤ à¦¨à¦¿à¦°à§à¦¯à¦¾à¦¤à¦¨-à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤ à¦•à§‡à¦¸ "à¦¸à§à¦ªà¦°à§à¦¶à¦•à¦¾à¦¤à¦°" à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦†à¦²à¦¾à¦¦à¦¾ à¦°à¦¾à¦–à¦¾ à¦¹à¦¯à¦¼à¥¤</div>
        <div id="applyErr" class="form-error hidden"></div>`);
    }
  }

  function collect() {
    const d = state.data;
    if (state.step === 1) {
      d.caseType = $('#f_caseType').value; d.purpose = $('#f_purpose').value;
      d.district = $('#f_district').value; d.problem = $('#f_problem').value.trim();
      d.emergency = $('#f_emergency').checked; d.sensitive = $('#f_sensitive').checked;
      if (!d.problem) { toast('à¦¸à¦®à¦¸à§à¦¯à¦¾à¦° à¦¬à¦¿à¦¬à¦°à¦£ à¦²à¦¿à¦–à§à¦¨'); return false; }
    } else if (state.step === 2) {
      d.name = $('#f_name').value.trim(); d.gender = $('#f_gender').value; d.age = $('#f_age').value; d.nid = $('#f_nid').value.trim();
      if (!d.name) { toast('à¦¨à¦¾à¦® à¦²à¦¿à¦–à§à¦¨'); return false; }
    } else if (state.step === 3) {
      d.phone = $('#f_phone').value.trim(); d.email = $('#f_email').value.trim(); d.addr = $('#f_addr').value.trim();
      d.safeNumber = $('#f_safe').value.trim(); d.window = $('#f_window').value.trim(); d.unsafeNumbers = $('#f_unsafe').value.trim();
      if (!/^01\d{9}$/.test(d.phone)) { toast('à¦¸à¦ à¦¿à¦• à§§à§§ à¦¡à¦¿à¦œà¦¿à¦Ÿà§‡à¦° à¦«à§‹à¦¨ à¦¨à¦®à§à¦¬à¦° à¦¦à¦¿à¦¨ (01XXXXXXXXX)'); return false; }
    } else if (state.step === 4) {
      d.occ = $('#f_occ').value.trim(); d.income = $('#f_income').value; d.deps = $('#f_deps').value;
    } else if (state.step === 5) {
      d.oppName = $('#f_oppName').value.trim(); d.oppType = $('#f_oppType').value; d.oppPhone = $('#f_oppPhone').value.trim();
    } else {
      if (!$('#f_true').checked) { toast('à¦¤à¦¥à§à¦¯ à¦¸à¦ à¦¿à¦• à¦¬à¦²à§‡ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à§à¦¨'); return false; }
    }
    return true;
  }

  async function submit() {
    const d = state.data;
    // B4: UDC à¦°à§‹à¦²à§‡ à¦²à¦—à¦‡à¦¨ à¦¥à¦¾à¦•à¦²à§‡ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦•à¦¾à¦°à§€ à¦°à§‡à¦•à¦°à§à¦¡ à¦¹à¦¯à¦¼
    if (ME && ME.role === 'udc') d.assistedBy = ME.name || 'UDC à¦‰à¦¦à§à¦¯à§‹à¦•à§à¦¤à¦¾';
    // A1: à¦¸à§‡à¦«-à¦•à¦¨à§à¦Ÿà¦¾à¦•à§à¦Ÿ à¦¸à§à¦Ÿà§à¦°à¦¾à¦•à¦šà¦¾à¦°
    if (d.safeNumber || d.unsafeNumbers || d.window) d.safeContact = { safeNumber: d.safeNumber, unsafeNumbers: (d.unsafeNumbers || '').split(',').map((s) => s.trim()).filter(Boolean), window: d.window };
    // A2: à¦ªà§à¦°à¦¤à¦¿à¦¨à¦¿à¦§à¦¿ (à¦†à¦¬à§‡à¦¦à¦¨à¦•à¦¾à¦°à§€à¦° à¦¬à¦¦à¦²à§‡ à¦…à¦¨à§à¦¯ à¦•à§‡à¦‰ à¦œà¦®à¦¾ à¦¦à¦¿à¦²à§‡)
    if (d.repName) d.representation = { repName: d.repName, repPhone: d.repPhone, relation: d.repRelation, scope: 'intake-only' };
    const r = await apiPost('applications', d);
    if (!r.ok) { toast(r.error || t('errGeneric')); return; }
    app.innerHTML = `
    <div class="container page-head"><h1>âœ… à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦œà¦®à¦¾ à¦¹à¦¯à¦¼à§‡à¦›à§‡</h1></div>
    <div class="container"><div class="form-card" style="text-align:center">
      <p style="color:var(--muted)">${t('appId')}</p>
      <div style="font-size:1.7rem;font-weight:800;font-family:ui-monospace,monospace;color:var(--brand);margin:.4rem 0 1rem">${esc(r.appId)}</div>
      ${r.freeServiceNotice ? `<div class="quick-ans" style="text-align:left">ðŸ†“ ${esc(r.freeServiceNotice)}</div>` : ''}
      <div class="form-success" style="text-align:left;margin-top:.8rem">
        <strong>à¦à¦°à¦ªà¦° à¦•à§€ à¦¹à¦¬à§‡?</strong>
        <ul style="margin:.6rem 0 0 1.2rem">${(r.nextSteps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>
      <div class="wizard-actions">
        <a class="btn btn-outline" href="#/track">${t('ctaTrack')}</a>
        <a class="btn btn-primary" href="#/">à¦¹à§‹à¦®à§‡ à¦¯à¦¾à¦¨</a>
      </div>
    </div></div>`;
  }
}

// ---------- à¦Ÿà§à¦°à§à¦¯à¦¾à¦• à¦ªà§‡à¦œ ----------
async function pageTrack() {
  const hash = location.hash || '';
  const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  const initialId = searchParams.get('id') || searchParams.get('appId') || '';
  const initialLast4 = searchParams.get('last4') || '';

  app.innerHTML = `
  <div class="container page-head">
    <span class="section-tag">à¦°à¦¿à¦¯à¦¼à§‡à¦²à¦Ÿà¦¾à¦‡à¦® à¦…à¦¨à§à¦¸à¦¨à§à¦§à¦¾à¦¨</span>
    <h1>ðŸ“¦ ${t('trackTitle')}</h1>
    <p>${t('trackLead')}</p>
  </div>
  <div class="container">
    <div class="form-card" style="max-width:720px">
      <div id="trackErr" class="form-error hidden"></div>
      
      <div class="field">
        <label>${t('appId')} <span class="req">*</span></label>
        <input id="t_id" value="${esc(initialId)}" placeholder="à¦¯à§‡à¦®à¦¨: APP-2026-0001 à¦¬à¦¾ DLAS-NET-2026-04417" autocomplete="off">
        <div class="hint">${t('appIdHint')}</div>
      </div>
      
      <div class="field" style="margin-top:1.1rem">
        <label>${t('last4')} <span class="req">*</span></label>
        <input id="t_last4" value="${esc(initialLast4)}" maxlength="4" inputmode="numeric" placeholder="à¦¯à§‡à¦®à¦¨: 3344" autocomplete="off">
        <div class="hint">à¦¨à¦¿à¦°à¦¾à¦ªà¦¤à§à¦¤à¦¾ à¦¯à¦¾à¦šà¦¾à¦‡à¦•à¦°à¦£: à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦«à§‹à¦¨ à¦¨à¦®à§à¦¬à¦° à¦¬à¦¾ à¦œà¦¾à¦¤à§€à¦¯à¦¼ à¦ªà¦°à¦¿à¦šà¦¯à¦¼à¦ªà¦¤à§à¦°à§‡à¦° à¦¶à§‡à¦· à§ª à¦…à¦™à§à¦•</div>
      </div>

      <div style="margin-top:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:0.84rem;color:var(--text-muted)">
        <span>à¦¡à§‡à¦®à§‹ à¦°à§‡à¦•à¦°à§à¦¡:</span>
        <button type="button" class="chip-demo" id="t_demo1" data-id="APP-2026-0001" data-last4="3344">APP-2026-0001 (à¦®à¦¯à¦¼à§‚à¦°à§€ / à§©à§©à§ªà§ª)</button>
        <button type="button" class="chip-demo" id="t_demo2" data-id="DLAS-NET-2026-04420" data-last4="3344">A1 Persona</button>
      </div>

      <div class="wizard-actions">
        <button class="btn btn-ghost" id="t_clear">${t('clear')}</button>
        <button class="btn btn-primary" id="t_go">
          <span>ðŸ”</span> <span>${t('lookup')}</span>
        </button>
      </div>

      <div id="trackResult"></div>
    </div>
  </div>`;

  $('#t_clear').onclick = () => {
    $('#t_id').value = '';
    $('#t_last4').value = '';
    $('#trackResult').innerHTML = '';
    $('#trackErr').classList.add('hidden');
  };

  const doTrack = async () => {
    const err = $('#trackErr');
    const resultBox = $('#trackResult');
    err.classList.add('hidden');
    resultBox.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--text-muted)">à¦…à¦¨à§à¦¸à¦¨à§à¦§à¦¾à¦¨ à¦•à¦°à¦¾ à¦¹à¦šà§à¦›à§‡â€¦</div>`;

    const appId = ($('#t_id').value || '').trim();
    const last4 = ($('#t_last4').value || '').trim();

    if (!appId || !last4) {
      err.textContent = 'à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦†à¦‡à¦¡à¦¿ à¦“ à¦¶à§‡à¦· à§ª à¦¡à¦¿à¦œà¦¿à¦Ÿ à¦‰à¦­à¦¯à¦¼à¦‡ à¦ªà§‚à¦°à¦£ à¦•à¦°à§à¦¨à¥¤';
      err.classList.remove('hidden');
      resultBox.innerHTML = '';
      return;
    }

    const r = await apiPost('track', { appId, last4 });
    if (r.error) {
      err.textContent = r.error;
      err.classList.remove('hidden');
      resultBox.innerHTML = '';
      return;
    }

    resultBox.innerHTML = `
      <div style="background:var(--surface-2);border-radius:var(--radius-lg);padding:1.4rem;margin-top:1.5rem;border:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:10px">
          <div>
            <span style="font-size:0.8rem;color:var(--text-muted);font-weight:600">à¦†à¦¬à§‡à¦¦à¦¨ à¦¨à¦®à§à¦¬à¦°</span>
            <div style="font-size:1.35rem;font-weight:800;color:var(--gov-green);font-family:monospace">${esc(r.appId)}</div>
            ${r.caseId ? `<div style="font-size:0.88rem;color:var(--gov-gold);font-weight:700">à¦•à§‡à¦¸ à¦¨à¦®à§à¦¬à¦°: ${esc(r.caseId)}</div>` : ''}
          </div>
          <div style="text-align:right">
            <span class="badge success" style="font-size:0.85rem">à¦§à¦¾à¦ª ${bnNum(r.stage + 1)}: ${esc(r.stageLabel)}</span>
            ${r.emergency ? '<div style="margin-top:4px"><span class="badge warn">à¦œà¦°à§à¦°à¦¿ à¦…à¦—à§à¦°à¦¾à¦§à¦¿à¦•à¦¾à¦°</span></div>' : ''}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;margin-bottom:12px;font-size:0.88rem">
          <div><strong>à¦†à¦¬à§‡à¦¦à¦¨à¦•à¦¾à¦°à§€:</strong> ${esc(r.applicantName || 'à¦¨à¦¾à¦—à¦°à¦¿à¦•')}</div>
          <div><strong>à¦…à¦«à¦¿à¦¸:</strong> ${esc(r.office || 'à¦œà§‡à¦²à¦¾ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸')}</div>
          <div><strong>à¦®à¦¾à¦®à¦²à¦¾à¦° à¦§à¦°à¦¨:</strong> ${esc(r.caseType || 'à¦¸à¦¾à¦§à¦¾à¦°à¦£')}</div>
          <div><strong>à¦¦à¦¾à¦–à¦¿à¦² à¦¤à¦¾à¦°à¦¿à¦–:</strong> ${esc(r.submitted ? new Date(r.submitted).toLocaleDateString('bn-BD') : 'â€”')}</div>
        </div>

        ${r.nextStep ? `
          <div class="quick-ans" style="margin:10px 0;background:var(--surface);border-color:var(--gov-green)">
            ðŸŽ¯ <strong>à¦ªà¦°à¦¬à¦°à§à¦¤à§€ à¦ªà¦¦à¦•à§à¦·à§‡à¦ª:</strong> ${esc(r.nextStep)}
          </div>
        ` : ''}

        ${(r.headsUp && r.headsUp.length) ? `
          <div class="quick-ans" style="margin:10px 0;background:var(--surface);border-color:var(--gov-gold)">
            ðŸ”” <strong>à¦—à§à¦°à§à¦¤à§à¦¬à¦ªà§‚à¦°à§à¦£ à¦¨à¦¿à¦°à§à¦¦à§‡à¦¶à¦¨à¦¾:</strong>
            <ul style="margin:6px 0 0 18px;font-size:0.88rem">
              ${r.headsUp.map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <h4 style="margin:1.4rem 0 0.8rem;font-size:1rem">à¦ªà§à¦°à¦•à§à¦°à¦¿à¦¯à¦¼à¦¾à¦° à¦…à¦—à§à¦°à¦—à¦¤à¦¿ à¦Ÿà¦¾à¦‡à¦®à¦²à¦¾à¦‡à¦¨:</h4>
        <ul class="timeline">
          ${(r.stages || []).map((s, i) => `
            <li class="${s.done ? 'done' : ''} ${s.current ? 'current' : ''}">
              <div class="tl-dot">${s.done ? 'âœ“' : bnNum(i + 1)}</div>
              <div class="tl-body">
                <strong>${esc(s.label)}</strong>
                ${s.current ? `<span>${t('currentStage')}</span>` : ''}
              </div>
            </li>
          `).join('')}
        </ul>

        <p style="color:var(--text-muted);font-size:0.84rem;margin-top:14px;border-top:1px solid var(--border);padding-top:10px">
          â„¹ï¸ ${esc(r.note || 'à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦¬à¦¿à¦¬à¦°à¦£à§‡à¦° à¦œà¦¨à§à¦¯ à¦¨à¦¿à¦•à¦Ÿà¦¬à¦°à§à¦¤à§€ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦…à¦«à¦¿à¦¸à§‡ à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— à¦•à¦°à§à¦¨ à¦…à¦¥à¦¬à¦¾ à¦Ÿà§‹à¦²-à¦«à§à¦°à¦¿ à§§à§¬à§¬à§¯à§¯-à¦ à¦•à¦² à¦•à¦°à§à¦¨à¥¤')}
        </p>
      </div>
    `;
  };

  $('#t_go').onclick = doTrack;

  $('#t_demo1').onclick = () => {
    $('#t_id').value = 'APP-2026-0001';
    $('#t_last4').value = '3344';
    doTrack();
  };

  $('#t_demo2').onclick = () => {
    $('#t_id').value = 'DLAS-NET-2026-04420';
    $('#t_last4').value = '3344';
    doTrack();
  };

  if (initialId && initialLast4) {
    doTrack();
  }
}

// ---------- à¦…à¦«à¦¿à¦¸ à¦ªà§‡à¦œ (Leaflet à¦®à§à¦¯à¦¾à¦ª) ----------
async function pageOffices() {
  app.innerHTML = `
  <div class="container page-head"><h1>ðŸ¢ ${t('officesTitle')}</h1><p>${t('officesBody')} ${t('mapHint')}</p></div>
  <div class="container">
    <div class="office-finder">
      <div>
        <div class="filter-row">
          <input id="offQ2" placeholder="${t('officesSearchPh')}" style="flex:1">
          <select id="offDiv"><option value="">à¦¸à¦¬ à¦¬à¦¿à¦­à¦¾à¦—</option>${BOOT.divisions.map((d) => `<option>${esc(d)}</option>`).join('')}</select>
        </div>
        <p id="offCount" style="color:var(--muted);margin-bottom:.7rem;font-size:.85rem"></p>
        <div class="office-list" id="offGrid"></div>
      </div>
      <div id="map"></div>
    </div>
  </div>`;
  const render = () => {
    const q = $('#offQ2').value.trim().toLowerCase();
    const div = $('#offDiv').value;
    const list = BOOT.offices.filter((o) => (!q || (o.name + o.district + o.address).toLowerCase().includes(q)) && (!div || o.division === div));
    $('#offCount').textContent = t('officesCount').replace('{n}', bnNum(list.length));
    $('#offGrid').innerHTML = list.map(officeCard).join('') || `<div class="empty-state">${t('noResults')}</div>`;
  };
  render();
  $('#offQ2').oninput = render;
  $('#offDiv').onchange = render;
  initOfficeMap();
}

// ---------- à¦¨à¦¿à¦‰à¦œ à¦ªà§‡à¦œ ----------
async function pageNews() {
  app.innerHTML = `
  <div class="container page-head"><h1>ðŸ“° ${t('newsTitle')}</h1></div>
  <div class="container"><div class="news-grid">${BOOT.news.map(newsCard).join('')}</div></div>`;
}

// à¦¨à¦¿à¦‰à¦œ à¦¡à¦¿à¦Ÿà§‡à¦‡à¦² â€” à¦•à§‡à¦¸ à¦¬à¦¿à¦¬à¦°à¦£à¦¸à¦¹
async function pageNewsDetail(id) {
  const n = await apiGet('newsitem', { id });
  if (!n || n.error) return pageNews();
  app.innerHTML = `
  <div class="container page-head article-wrap">
    <div class="breadcrumb"><a href="#/news">${t('backToNews')}</a></div>
    <span class="news-badge ${n.type}">${n.type === 'event' ? t('event') : t('news')}</span>
    <h1 style="margin-top:.5rem">${esc(n.title)}</h1>
    <div class="article-meta"><span>${t('posted')}: ${esc(n.date)}</span></div>
    <img class="news-detail-img" src="${esc(n.img)}" alt="" onerror="this.style.display='none'">
    <p style="font-size:1.05rem">${esc(n.body)}</p>
    ${(n.cases || []).length ? `<h2 style="margin-top:1.6rem">${t('caseDetail')}</h2>
      ${n.cases.map((c) => `<div class="case-block"><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p></div>`).join('')}` : ''}
    <div class="quick-ans">
      <strong>${t('needMoreHelp')}</strong>
      <p style="color:var(--muted);margin:.3rem 0 .7rem">${t('moreHelpBody')}</p>
      <a class="btn btn-primary btn-sm" href="#/apply">${t('ctaApply')}</a>
      <a class="btn btn-outline btn-sm" href="tel:16699" style="margin-left:.4rem">ðŸ“ž ${t('callNow')}</a>
    </div>
  </div>`;
}

// ---------- à¦¸à¦¾à¦°à§à¦š ----------
async function pageSearch() {
  app.innerHTML = `
  <div class="container page-head"><h1>ðŸ” ${t('searchTitle')}</h1></div>
  <div class="container">
    <div class="search-bar"><input id="sq" placeholder="${t('searchPh')}"><button class="btn btn-primary" id="sgo">${t('searchBtn')}</button></div>
    <div id="sres" style="margin-top:1.6rem"></div>
  </div>`;
  const doSearch = () => {
    const q = $('#sq').value.trim().toLowerCase();
    const box = $('#sres');
    if (!q) { box.innerHTML = ''; return; }
    const arts = BOOT.articles.filter((a) => (a.title + a.summary).toLowerCase().includes(q));
    const cats = BOOT.categories.filter((c) => (c.title + c.desc).toLowerCase().includes(q));
    const offs = BOOT.offices.filter((o) => (o.name + o.district).toLowerCase().includes(q));
    box.innerHTML = `
      ${cats.length ? `<h2>${t('navLibrary')}</h2><div class="topic-grid" style="margin:.8rem 0 1.4rem">${cats.map((c) => `<a class="topic-card" href="#/topic/${c.id}"><span class="topic-icon">${c.icon}</span><span><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p></span></a>`).join('')}</div>` : ''}
      ${arts.length ? `<h2>${t('navLibrary')} â€” à¦†à¦°à§à¦Ÿà¦¿à¦•à§‡à¦²</h2><div class="art-grid" style="margin:.8rem 0 1.4rem">${arts.map((a) => `<a class="art-card" href="#/article/${a.id}"><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p></a>`).join('')}</div>` : ''}
      ${offs.length ? `<h2>${t('navOffices')}</h2><div class="art-grid" style="margin:.8rem 0">${offs.slice(0, 6).map(officeCard).join('')}</div>` : ''}
      ${!cats.length && !arts.length && !offs.length ? `<div class="empty-state">${t('noResults')}</div>` : ''}`;
  };
  $('#sgo').onclick = doSearch;
  $('#sq').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
}

// ---------- à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ ----------
async function pageHelp() {
  app.innerHTML = `
  <div class="container page-head"><h1>ðŸ¤ ${t('helpTitle')}</h1><p>${t('helpLead')}</p></div>
  <div class="container"><div class="help-cards" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
    <a class="help-card" href="#/help/call"><div class="hc-art">ðŸ“ž</div><h3>${t('hCallT')}</h3><p>${t('hCallB')}</p><span class="btn btn-primary btn-sm">à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦¦à§‡à¦–à§à¦¨ â†’</span></a>
    <a class="help-card" href="#/help/udc"><div class="hc-art">ðŸ¢</div><h3>${t('hUdcT')}</h3><p>${t('hUdcB')}</p><span class="btn btn-outline btn-sm">à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦¦à§‡à¦–à§à¦¨ â†’</span></a>
    <a class="help-card" href="#/help/ussd"><div class="hc-art">#ï¸âƒ£</div><h3>${t('hUssdT')}</h3><p>${t('hUssdB')}</p><span class="btn btn-outline btn-sm">à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦¦à§‡à¦–à§à¦¨ â†’</span></a>
    <a class="help-card" href="#/help/ai"><div class="hc-art">ðŸ¤–</div><h3>${t('hAiT')}</h3><p>${t('hAiB')}</p><span class="btn btn-outline btn-sm">à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦¦à§‡à¦–à§à¦¨ â†’</span></a>
  </div></div>
  <div class="container section">
    <div class="form-card" style="max-width:none">
      <h2>${t('channelChoice')}</h2>
      <ul style="margin:.7rem 0 0 1.2rem;display:flex;flex-direction:column;gap:.4rem;color:var(--muted)">
        <li>${t('chanCompare1')}</li><li>${t('chanCompare2')}</li><li>${t('chanCompare3')}</li><li>${t('chanCompare4')}</li>
      </ul>
    </div>
  </div>
  <div class="container section" style="padding-top:0">
    <div class="form-card" style="max-width:none">
      <h2>à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦ªà§à¦°à¦¶à§à¦¨</h2>
      ${[
        ['à¦à¦‡ à¦¸à§‡à¦¬à¦¾ à¦•à¦¿ à¦¸à¦¤à§à¦¯à¦¿à¦‡ à¦«à§à¦°à¦¿?', 'à¦¹à§à¦¯à¦¾à¦à¥¤ à¦†à¦¬à§‡à¦¦à¦¨ à¦«à¦¿, à¦†à¦‡à¦¨à¦œà§€à¦¬à§€à¦° à¦«à¦¿, à¦†à¦¦à¦¾à¦²à¦¤ à¦«à¦¿ â€” à¦•à¦¿à¦›à§à¦‡ à¦¦à¦¿à¦¤à§‡ à¦¹à¦¬à§‡ à¦¨à¦¾à¥¤ à¦•à§‡à¦‰ à¦Ÿà¦¾à¦•à¦¾ à¦šà¦¾à¦‡à¦²à§‡ à¦…à¦­à¦¿à¦¯à§‹à¦— à¦«à¦°à¦®à§‡ à¦œà¦¾à¦¨à¦¾à¦¨à¥¤'],
        ['à¦†à¦®à¦¾à¦° à¦¤à¦¥à§à¦¯ à¦•à¦¿ à¦—à§‹à¦ªà¦¨ à¦¥à¦¾à¦•à¦¬à§‡?', 'à¦¹à§à¦¯à¦¾à¦à¥¤ à¦¶à§à¦§à§ à¦†à¦ªà¦¨à¦¾à¦° à¦•à§‡à¦¸ à¦¸à¦¾à¦®à¦²à¦¾à¦¨à§‹ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦¦à§‡à¦–à¦¬à§‡à¦¨à¥¤ à¦¨à¦¿à¦°à§à¦¯à¦¾à¦¤à¦¨-à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤ à¦•à§‡à¦¸ "à¦¸à§à¦ªà¦°à§à¦¶à¦•à¦¾à¦¤à¦°" à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦†à¦²à¦¾à¦¦à¦¾ à¦¥à¦¾à¦•à§‡à¥¤'],
        ['à¦¸à§à¦®à¦¾à¦°à§à¦Ÿà¦«à§‹à¦¨ à¦¨à§‡à¦‡, à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¬ à¦•à§€à¦­à¦¾à¦¬à§‡?', 'à§§à§¬à§¬à§¯à§¯-à¦ à¦•à¦² à¦•à¦°à§à¦¨ â€” à¦…à¦ªà¦¾à¦°à§‡à¦Ÿà¦° à¦«à§‹à¦¨à§‡à¦‡ à¦«à¦°à¦® à¦ªà§‚à¦°à¦£ à¦•à¦°à¦¬à§‡à¦¨à¥¤ à¦…à¦¥à¦¬à¦¾ à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à§‡à¦¨à§à¦Ÿà¦¾à¦°à§‡ à¦¯à¦¾à¦¨à¥¤'],
        ['à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾à¦° à¦¸à¦¿à¦¦à§à¦§à¦¾à¦¨à§à¦¤ à¦®à¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡ à¦¨à¦¾ à¦•à§€ à¦¹à¦¬à§‡?', 'à¦¦à§à¦‡ à¦ªà¦•à§à¦· à¦¸à¦‡ à¦¨à¦¾ à¦•à¦°à¦²à§‡ à¦¸à¦®à¦à§‹à¦¤à¦¾ à¦¬à¦¾à¦§à§à¦¯à¦¤à¦¾à¦®à§‚à¦²à¦• à¦¨à¦¯à¦¼ â€” à¦¤à¦–à¦¨ à¦¸à§à¦¬à¦¾à¦­à¦¾à¦¬à¦¿à¦• à¦†à¦¦à¦¾à¦²à¦¤ à¦ªà§à¦°à¦•à§à¦°à¦¿à¦¯à¦¼à¦¾ à¦šà¦²à¦¬à§‡à¥¤'],
        ['à¦•à¦¤ à¦¸à¦®à¦¯à¦¼ à¦²à¦¾à¦—à§‡?', 'à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦•à¦¯à¦¼à§‡à¦• à¦•à¦°à§à¦®à¦¦à¦¿à¦¬à¦¸à§‡ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§‡à¦¨à¥¤ à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾ à¦†à¦‡à¦¨à¦¤ à§¬à§¦ à¦¦à¦¿à¦¨à§‡ (à§©à§¦ à¦¦à¦¿à¦¨ à¦¬à¦¾à¦¡à¦¼à¦¤à¦¿ à¦¸à¦®à§à¦­à¦¬) à¦¶à§‡à¦· à¦¹à¦¤à§‡ à¦¹à¦¯à¦¼à¥¤']
      ].map(([q, a]) => `<details style="margin-top:.7rem"><summary style="font-weight:700;cursor:pointer">${esc(q)}</summary><p style="margin-top:.4rem;color:var(--muted)">${esc(a)}</p></details>`).join('')}
    </div>
  </div>`;
}

// à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦šà§à¦¯à¦¾à¦¨à§‡à¦² à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦ªà§‡à¦œ
async function pageHelpChannel(ch) {
  const map = {
    call: { icon: 'ðŸ“ž', title: t('callDeskTitle'), body: t('callDeskBody'),
      extra: `<h2 style="margin-top:1.4rem">${t('callPrepTitle')}</h2><ul style="margin:.5rem 0 0 1.2rem;display:flex;flex-direction:column;gap:.4rem;color:var(--muted)">
        <li>à¦à¦¨à¦†à¦‡à¦¡à¦¿/à¦œà¦¨à§à¦®à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨ à¦¨à¦®à§à¦¬à¦°</li><li>à¦¸à¦®à¦¸à§à¦¯à¦¾à¦° à¦¸à¦‚à¦•à§à¦·à¦¿à¦ªà§à¦¤ à¦¬à¦¿à¦¬à¦°à¦£ (à¦•à¦¬à§‡ à¦¥à§‡à¦•à§‡, à¦ªà§à¦°à¦¤à¦¿à¦ªà¦•à§à¦· à¦•à§‡)</li>
        <li>à¦œà§‡à¦²à¦¾ à¦“ à¦¥à¦¾à¦¨à¦¾à¦° à¦¨à¦¾à¦®</li><li>à¦†à¦—à§‡à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦¥à¦¾à¦•à¦²à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦†à¦‡à¦¡à¦¿</li></ul>`,
      action: `<div class="call-cta-row">
        <a class="btn btn-primary" href="tel:16699" style="font-size:1.1rem;padding:.9rem 1.6rem">ðŸ“ž ${t('callNow')}: à§§à§¬à§¬à§¯à§¯</a>
        <a class="btn btn-outline" href="#/call" style="font-size:1.1rem;padding:.9rem 1.6rem">ðŸ“± à¦‡à¦¨à§à¦Ÿà¦¾à¦°à¦…à§à¦¯à¦¾à¦•à¦Ÿà¦¿à¦­ à¦¡à§‡à¦®à§‹ à¦¦à§‡à¦–à§à¦¨</a>
      </div>
      <p style="color:var(--muted);margin-top:.6rem">à¦¬à¦¿à¦¦à§‡à¦¶ à¦¥à§‡à¦•à§‡: +à§®à§®à§¦ à§¯à§¬à§§à§¨ à§©à§¯ à§§à§¬à§¬à§¯à§¯</p>` },
    udc: { icon: 'ðŸ¢', title: t('udcTitle'), body: t('udcBody'),
      extra: `<div class="quick-ans" style="margin-top:1.2rem"><strong>à¦‡à¦‰à¦¡à¦¿à¦¸à¦¿à¦¤à§‡ à¦¯à¦¾ à¦¨à§‡à¦¬à§‡à¦¨</strong>
        <ul style="margin:.5rem 0 0 1.2rem;color:var(--muted)"><li>à¦à¦¨à¦†à¦‡à¦¡à¦¿/à¦œà¦¨à§à¦®à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨</li><li>à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¸à¦®à§à¦ªà¦°à§à¦•à¦¿à¦¤ à¦•à¦¾à¦—à¦œ (à¦¦à¦²à¦¿à¦²/à¦•à¦¾à¦¬à¦¿à¦¨à¦¨à¦¾à¦®à¦¾/à¦°à¦¶à¦¿à¦¦)</li><li>à¦¨à¦¿à¦œà§‡à¦° à¦«à§‹à¦¨ à¦¨à¦®à§à¦¬à¦°</li></ul></div>`,
      action: `<a class="btn btn-primary" href="#/offices">${t('navOffices')} â†’</a>` },
    ussd: { icon: '#ï¸âƒ£', title: t('ussdTitle'), body: t('ussdBody'),
      extra: `<h2 style="margin-top:1.4rem">à¦§à¦¾à¦ªà§‡ à¦§à¦¾à¦ªà§‡</h2><ol style="margin:.5rem 0 0 1.2rem;display:flex;flex-direction:column;gap:.4rem;color:var(--muted)">
        <li>à¦¶à¦°à§à¦Ÿà¦•à§‹à¦¡ à¦¡à¦¾à¦¯à¦¼à¦¾à¦² à¦•à¦°à§à¦¨</li><li>à¦­à¦¾à¦·à¦¾ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨ (à¦¬à¦¾à¦‚à¦²à¦¾/English)</li><li>à¦®à¦¾à¦®à¦²à¦¾à¦° à¦§à¦°à¦¨ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨ (à§§-à§¯)</li>
        <li>à¦¨à¦¾à¦® à¦“ à¦à¦¨à¦†à¦‡à¦¡à¦¿ à¦²à¦¿à¦–à§‡ à¦ªà¦¾à¦ à¦¾à¦¨</li><li>à¦à¦¸à¦à¦®à¦à¦¸à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦†à¦‡à¦¡à¦¿ à¦ªà¦¾à¦¬à§‡à¦¨</li></ol>`,
      action: `<div class="call-cta-row">
        <a class="btn btn-outline" href="#/track">${t('ctaTrack')} â†’</a>
        <a class="btn btn-primary" href="#/call" style="background:#0f172a;border-color:#0f172a">ðŸ“± à¦‡à¦¨à§à¦Ÿà¦¾à¦°à¦…à§à¦¯à¦¾à¦•à¦Ÿà¦¿à¦­ à¦®à§‡à¦¨à§ à¦¦à§‡à¦–à§à¦¨</a>
      </div>` },
    ai: { icon: 'ðŸ¤–', title: t('aiChanTitle'), body: t('aiChanBody'), extra: '',
      action: `<button class="btn btn-primary" onclick="document.getElementById('chatFab').click()">ðŸ¤– ${t('aiChanTitle')} à¦–à§à¦²à§à¦¨</button>` }
  };
  const c = map[ch];
  if (!c) return pageHelp();
  app.innerHTML = `
  <div class="container page-head article-wrap">
    <div class="breadcrumb"><a href="#/help">${t('helpTitle')}</a> / ${esc(c.title)}</div>
    <h1>${c.icon} ${esc(c.title)}</h1>
    <p style="font-size:1.03rem;margin-top:.5rem">${c.body}</p>
    ${c.extra}
    <div style="margin-top:1.6rem">${c.action}</div>
    <div class="quick-ans" style="margin-top:1.8rem">
      <strong>${t('needMoreHelp')}</strong>
      <p style="color:var(--muted);margin:.3rem 0 .7rem">${t('moreHelpBody')}</p>
      <a class="btn btn-primary btn-sm" href="#/guide">${t('useGuide')} â†’</a>
    </div>
  </div>`;
}

// ---------- auth ----------
const DEMO_STAFF_ACCOUNTS = [
  { username: 'officer.joypurhat', name: 'à¦°à¦¹à¦¿à¦®à¦¾ à¦–à¦¾à¦¤à§à¦¨', roleTitle: 'DLAO à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ (B1)', district: 'à¦œà¦¯à¦¼à¦ªà§à¦°à¦¹à¦¾à¦Ÿ', icon: 'ðŸ›ï¸' },
  { username: 'lawyer.kabir', name: 'à¦…à§à¦¯à¦¾à¦¡à¦­. à¦•à¦¬à¦¿à¦° à¦¹à§‹à¦¸à§‡à¦¨', roleTitle: 'à¦ªà§à¦¯à¦¾à¦¨à§‡à¦² à¦†à¦‡à¦¨à¦œà§€à¦¬à§€', district: 'à¦œà¦¯à¦¼à¦ªà§à¦°à¦¹à¦¾à¦Ÿ', icon: 'ðŸ‘¨â€âš–ï¸' },
  { username: 'mediator.joypurhat', name: 'à¦¨à¦¾à¦¸à¦°à¦¿à¦¨ à¦¸à§à¦²à¦¤à¦¾à¦¨à¦¾', roleTitle: 'à¦®à¦§à§à¦¯à¦¸à§à¦¥à¦¤à¦¾à¦•à¦¾à¦°à§€ (ADR)', district: 'à¦œà¦¯à¦¼à¦ªà§à¦°à¦¹à¦¾à¦Ÿ', icon: 'âš–ï¸' },
  { username: 'receiving.dhaka', name: 'à¦¤à¦¾à¦¨à¦­à§€à¦° à¦†à¦¹à¦®à§‡à¦¦', roleTitle: 'à¦—à§à¦°à¦¹à¦£à¦•à¦¾à¦°à§€ DLAO (B6)', district: 'à¦¢à¦¾à¦•à¦¾', icon: 'ðŸ“¥' },
  { username: 'udc.khagrachari', name: 'à¦œà¦¯à¦¼à¦¨à§à¦¤ à¦šà¦¾à¦•à¦®à¦¾', roleTitle: 'UDC à¦‰à¦¦à§à¦¯à§‹à¦•à§à¦¤à¦¾ (B4)', district: 'à¦–à¦¾à¦—à¦¡à¦¼à¦¾à¦›à¦¡à¦¼à¦¿', icon: 'ðŸ¢' },
  { username: 'helpline.agent1', name: 'à¦«à¦°à¦¿à¦¦ à¦®à¦¿à¦¯à¦¼à¦¾', roleTitle: 'à§§à§¬à§¬à§¯à§¯ à¦à¦œà§‡à¦¨à§à¦Ÿ (B3)', district: 'à¦œà¦¾à¦¤à§€à¦¯à¦¼', icon: 'ðŸ“ž' },
  { username: 'officer.jhenaidah', name: 'à¦®à¦¾à¦¹à¦®à§à¦¦à§à¦² à¦¹à¦¾à¦¸à¦¾à¦¨', roleTitle: 'DLAO à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾', district: 'à¦à¦¿à¦¨à¦¾à¦‡à¦¦à¦¹', icon: 'ðŸ›ï¸' },
  { username: 'lawyer.shahana', name: 'à¦…à§à¦¯à¦¾à¦¡à¦­. à¦¶à¦¾à¦¹à¦¾à¦¨à¦¾ à¦†à¦•à§à¦¤à¦¾à¦°', roleTitle: 'à¦ªà§à¦¯à¦¾à¦¨à§‡à¦² à¦†à¦‡à¦¨à¦œà§€à¦¬à§€', district: 'à¦œà¦¯à¦¼à¦ªà§à¦°à¦¹à¦¾à¦Ÿ', icon: 'ðŸ‘©â€âš–ï¸' },
  { username: 'support.staff1', name: 'à¦¸à¦¾à¦²à¦®à¦¾ à¦ªà¦¾à¦°à¦­à§€à¦¨', roleTitle: 'à¦•à§‡à¦¸-à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦•à¦°à§à¦®à§€', district: 'à¦œà¦¯à¦¼à¦ªà§à¦°à¦¹à¦¾à¦Ÿ', icon: 'ðŸ¤' },
  { username: 'ripon.rep', name: 'à¦°à¦¿à¦ªà¦¨ à¦†à¦•à§à¦¤à¦¾à¦°', roleTitle: 'à¦®à¦¨à§‹à¦¨à§€à¦¤ à¦ªà§à¦°à¦¤à¦¿à¦¨à¦¿à¦§à¦¿', district: 'à¦œà¦¯à¦¼à¦ªà§à¦°à¦¹à¦¾à¦Ÿ', icon: 'ðŸ¦¯' },
  { username: 'admin', name: 'à¦¸à¦¿à¦¸à§à¦Ÿà§‡à¦® à¦ªà§à¦°à¦¶à¦¾à¦¸à¦•', roleTitle: 'à¦¸à¦¿à¦¸à§à¦Ÿà§‡à¦® à¦ªà§à¦°à¦¶à¦¾à¦¸à¦•', district: 'à¦¢à¦¾à¦•à¦¾', icon: 'âš™ï¸' }
];

async function pageLogin() {
  if (ME) {
    if (ME.role && ME.role !== 'applicant' && ME.role !== 'CITIZEN') {
      return (location.hash = '#/console');
    }
    return (location.hash = '#/dashboard');
  }

  // Active tab state: 'staff' (default), 'citizen', 'door'
  let activeTab = 'staff';
  let selectedUser = 'officer.joypurhat';

  function render() {
    app.innerHTML = `
    <div class="container auth-wrapper">
      <div class="auth-card-wide">
        <div class="auth-header">
          <h1>ðŸ›ï¸ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦²à¦¿à¦—à§à¦¯à¦¾à¦² à¦à¦‡à¦¡ à¦ªà§‹à¦°à§à¦Ÿà¦¾à¦²</h1>
          <p>à¦†à¦‡à¦¨à¦—à¦¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦“ à¦¸à§‡à¦¬à¦¾ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾ â€” à¦ªà¦¦à¦¬à§€ à¦¬à¦¾ à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿà§‡ à¦ªà§à¦°à¦¬à§‡à¦¶ à¦•à¦°à§à¦¨</p>
        </div>

        <!-- Auth Tabs -->
        <div class="auth-tabs" role="tablist">
          <button class="auth-tab-btn ${activeTab === 'staff' ? 'active' : ''}" id="tabStaff" type="button">
            ðŸ›ï¸ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ / à¦ªà§à¦°à§‹à¦­à¦¾à¦‡à¦¡à¦¾à¦°
          </button>
          <button class="auth-tab-btn ${activeTab === 'citizen' ? 'active' : ''}" id="tabCitizen" type="button">
            ðŸ‘¤ à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ
          </button>
          <button class="auth-tab-btn ${activeTab === 'door' ? 'active' : ''}" id="tabDoor" type="button">
            ðŸšª à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦¡à§‹à¦° à¦à¦•à§à¦¸à§‡à¦¸
          </button>
        </div>

        <div id="authErr" class="form-error hidden"></div>

        <!-- 1. Staff / Provider Login Tab -->
        <div id="panelStaff" class="${activeTab === 'staff' ? '' : 'hidden'}">
          <div class="auth-subnote">
            <strong>ðŸ”‘ à§§-à¦•à§à¦²à¦¿à¦•à§‡ à¦ªà¦¦à¦¬à§€ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ (à¦¡à§‡à¦®à§‹ à¦ªà¦¿à¦¨: à§§à§¨à§©à§ª):</strong> à¦¨à¦¿à¦šà§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦¦à¦¬à§€à¦¤à§‡ à¦•à§à¦²à¦¿à¦• à¦•à¦°à¦²à§‡ à¦‡à¦‰à¦œà¦¾à¦°à¦¨à§‡à¦® à¦“ à¦ªà¦¿à¦¨ à¦¸à§à¦¬à¦¯à¦¼à¦‚à¦•à§à¦°à¦¿à¦¯à¦¼ à¦ªà§‚à¦°à¦£ à¦¹à¦¬à§‡à¥¤
          </div>

          <!-- 6 Role Presets -->
          <div class="role-preset-grid">
            ${DEMO_STAFF_ACCOUNTS.slice(0, 6).map((a) => `
              <button class="role-preset-btn ${selectedUser === a.username ? 'selected' : ''}" type="button" data-user="${a.username}">
                <span class="r-icon">${a.icon}</span>
                <span class="r-body">
                  <span class="r-title">${esc(a.roleTitle)}</span>
                  <span class="r-user">${esc(a.name)} Â· ${esc(a.district)}</span>
                </span>
                <span class="r-pin">à¦ªà¦¿à¦¨: à§§à§¨à§©à§ª</span>
              </button>
            `).join('')}
          </div>

          <div style="background:var(--surface-2);border-radius:12px;padding:1.1rem;border:1px solid var(--border);margin-top:.8rem">
            <div class="form-grid">
              <div class="field">
                <label>à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦°à¦•à¦¾à¦°à§€ à¦¨à¦¾à¦® (Username) <span class="req">*</span></label>
                <input id="s_user" value="${esc(selectedUser)}" placeholder="à¦¯à§‡à¦®à¦¨: officer.joypurhat">
              </div>
              <div class="field">
                <label>à§ª-à¦¸à¦‚à¦–à§à¦¯à¦¾à¦° à¦ªà¦¿à¦¨ (PIN) <span class="req">*</span></label>
                <input id="s_pin" type="password" value="1234" maxlength="8" placeholder="à§§à§¨à§©à§ª">
              </div>
            </div>
            <button class="btn btn-primary btn-block" id="s_go" style="margin-top:1.1rem;font-size:1.02rem">
              ðŸ” à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦•à¦¨à¦¸à§‹à¦²à§‡ à¦ªà§à¦°à¦¬à§‡à¦¶ à¦•à¦°à§à¦¨ â†’
            </button>
          </div>

          <!-- All 11 Accounts Accordion -->
          <details style="margin-top:1.2rem;font-size:.88rem;color:var(--muted)">
            <summary style="cursor:pointer;font-weight:600;padding:.4rem 0">
              ðŸ“‹ à¦¸à¦•à¦² à§§à§§ à¦œà¦¨ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦“ à¦ªà§à¦°à¦¤à¦¿à¦¨à¦¿à¦§à¦¿à¦° à¦ªà§‚à¦°à§à¦£ à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¦à§‡à¦–à§à¦¨ (à¦à¦¿à¦¨à¦¾à¦‡à¦¦à¦¹, à¦°à¦¿à¦ªà¦¨, à¦ªà§à¦°à¦¶à¦¾à¦¸à¦¨...)
            </summary>
            <div style="max-height:220px;overflow:auto;margin-top:.6rem">
              <table class="auth-demo-table">
                <thead>
                  <tr>
                    <th>à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦†à¦‡à¦¡à¦¿</th>
                    <th>à¦¨à¦¾à¦® à¦“ à¦ªà¦¦à¦¬à§€</th>
                    <th>à¦à¦²à¦¾à¦•à¦¾</th>
                    <th>à¦…à§à¦¯à¦¾à¦•à¦¶à¦¨</th>
                  </tr>
                </thead>
                <tbody>
                  ${DEMO_STAFF_ACCOUNTS.map((a) => `
                    <tr class="clickable" data-user="${a.username}">
                      <td><code style="font-weight:700;color:var(--brand)">${esc(a.username)}</code></td>
                      <td>${a.icon} <strong>${esc(a.name)}</strong> (${esc(a.roleTitle)})</td>
                      <td>${esc(a.district)}</td>
                      <td><span class="auth-chip">à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <!-- 2. Citizen Login Tab -->
        <div id="panelCitizen" class="${activeTab === 'citizen' ? '' : 'hidden'}">
          <div class="auth-subnote">
            <strong>ðŸ‘¤ à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦²à¦—à¦‡à¦¨:</strong> à¦†à¦ªà¦¨à¦¾à¦° à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦®à§à¦¬à¦° à¦“ à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦¦à¦¿à¦¯à¦¼à§‡ à¦ªà§à¦°à¦¬à§‡à¦¶ à¦•à¦°à§‡ à¦†à¦¬à§‡à¦¦à¦¨à§‡à¦° à¦¸à¦°à§à¦¬à¦¶à§‡à¦· à¦…à¦¬à¦¸à§à¦¥à¦¾ à¦œà¦¾à¦¨à§à¦¨ à¦¬à¦¾ à¦¨à¦¤à§à¦¨ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨à¥¤
          </div>
          <div class="field">
            <label>${t('phone')} <span class="req">*</span></label>
            <input id="c_phone" placeholder="01XXXXXXXXX" type="tel">
          </div>
          <div class="field" style="margin-top:.85rem">
            <label>${t('password')} <span class="req">*</span></label>
            <input id="c_pw" type="password" placeholder="à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡">
          </div>
          <button class="btn btn-primary btn-block" id="c_go" style="margin-top:1.2rem;font-size:1rem">
            ${t('login')} â†’
          </button>
          <div style="text-align:center;margin-top:1.2rem;padding-top:1rem;border-top:1px dashed var(--border)">
            <p style="color:var(--muted);font-size:.92rem;margin:0 0 .5rem">à¦•à§‹à¦¨à§‹ à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¨à§‡à¦‡?</p>
            <a class="btn btn-outline btn-sm" href="#/register">ðŸ“ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦¨à¦¤à§à¦¨ à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§à¦¨</a>
          </div>
        </div>

        <!-- 3. Citizen Door Verification Tab (No password) -->
        <div id="panelDoor" class="${activeTab === 'door' ? '' : 'hidden'}">
          <div class="auth-subnote">
            <strong>ðŸšª à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡à¦¬à¦¿à¦¹à§€à¦¨ à¦¦à§à¦°à§à¦¤ à¦¯à¦¾à¦šà¦¾à¦‡ (Citizen Door):</strong> à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦†à¦‡à¦¡à¦¿ à¦à¦¬à¦‚ à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦«à§‹à¦¨/à¦à¦¨à¦†à¦‡à¦¡à¦¿à¦° à¦¶à§‡à¦· à§ª à¦…à¦™à§à¦• à¦¦à¦¿à¦¯à¦¼à§‡ à¦•à§‹à¦¨à§‹ à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦›à¦¾à¦¡à¦¼à¦¾à¦‡ à¦¤à§Žà¦•à§à¦·à¦£à¦¾à§Ž à¦Ÿà§à¦°à§à¦¯à¦¾à¦• à¦•à¦°à§à¦¨à¥¤
          </div>
          <div style="margin-bottom:.9rem">
            <span class="auth-chip" id="doorFillDemo" title="à¦•à§à¦²à¦¿à¦• à¦•à¦°à§‡ à¦¡à§‡à¦®à§‹ à¦ªà§‚à¦°à¦£ à¦•à¦°à§à¦¨">
              ðŸ’¡ à¦¡à§‡à¦®à§‹ à¦¨à¦¾à¦—à¦°à¦¿à¦•: à¦®à¦¯à¦¼à§‚à¦°à§€ à¦†à¦•à§à¦¤à¦¾à¦° (à¦†à¦‡à¦¡à¦¿: <strong>APP-2026-0001</strong>, à¦¶à§‡à¦· à§ª: <strong>3344</strong>)
            </span>
          </div>
          <div class="form-grid">
            <div class="field">
              <label>à¦†à¦¬à§‡à¦¦à¦¨ à¦°à§‡à¦«à¦¾à¦°à§‡à¦¨à§à¦¸ à¦†à¦‡à¦¡à¦¿ <span class="req">*</span></label>
              <input id="d_appId" placeholder="APP-2026-0001" style="text-transform:uppercase">
            </div>
            <div class="field">
              <label>à¦«à§‹à¦¨ / à¦à¦¨à¦†à¦‡à¦¡à¦¿à¦° à¦¶à§‡à¦· à§ª à¦…à¦™à§à¦• <span class="req">*</span></label>
              <input id="d_last4" placeholder="3344" maxlength="4">
            </div>
          </div>
          <div class="field" style="margin-top:.85rem">
            <label>à¦ªà§à¦°à¦¬à§‡à¦¶à§‡à¦° à¦­à§‚à¦®à¦¿à¦•à¦¾</label>
            <select id="d_role">
              <option value="CITIZEN">à¦¨à¦¾à¦—à¦°à¦¿à¦• (à¦¨à¦¿à¦œà§‡)</option>
              <option value="REPRESENTATIVE">à¦®à¦¨à§‹à¦¨à§€à¦¤ à¦ªà§à¦°à¦¤à¦¿à¦¨à¦¿à¦§à¦¿ (à¦°à¦¿à¦ªà¦¨)</option>
            </select>
          </div>
          <button class="btn btn-primary btn-block" id="d_go" style="margin-top:1.2rem;font-size:1rem">
            ðŸšª à¦¦à¦°à¦œà¦¾-à¦¯à¦¾à¦šà¦¾à¦‡ à¦“ à¦Ÿà§à¦°à§à¦¯à¦¾à¦•à¦¿à¦‚ à¦¶à§à¦°à§ à¦•à¦°à§à¦¨ â†’
          </button>
        </div>

      </div>
    </div>`;

    // Wire Tabs
    $('#tabStaff').onclick = () => { activeTab = 'staff'; render(); };
    $('#tabCitizen').onclick = () => { activeTab = 'citizen'; render(); };
    $('#tabDoor').onclick = () => { activeTab = 'door'; render(); };

    // Wire Staff Preset Clicks
    $$('.role-preset-btn').forEach((btn) => {
      btn.onclick = () => {
        selectedUser = btn.dataset.user;
        const uInput = $('#s_user');
        const pInput = $('#s_pin');
        if (uInput) uInput.value = selectedUser;
        if (pInput) pInput.value = '1234';
        $$('.role-preset-btn').forEach((b) => b.classList.toggle('selected', b.dataset.user === selectedUser));
      };
    });

    // Wire Table Clickable Rows
    $$('.auth-demo-table tr.clickable').forEach((tr) => {
      tr.onclick = () => {
        selectedUser = tr.dataset.user;
        const uInput = $('#s_user');
        const pInput = $('#s_pin');
        if (uInput) uInput.value = selectedUser;
        if (pInput) pInput.value = '1234';
        $$('.role-preset-btn').forEach((b) => b.classList.toggle('selected', b.dataset.user === selectedUser));
      };
    });

    // Wire Staff Login Submit
    const sGo = $('#s_go');
    if (sGo) {
      sGo.onclick = async () => {
        const u = ($('#s_user').value || '').trim();
        const p = ($('#s_pin').value || '').trim();
        const errEl = $('#authErr');
        errEl.classList.add('hidden');
        if (!u || !p) {
          errEl.textContent = 'à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦°à¦•à¦¾à¦°à§€ à¦¨à¦¾à¦® à¦à¦¬à¦‚ à§ª-à¦¸à¦‚à¦–à§à¦¯à¦¾à¦° à¦ªà¦¿à¦¨ à¦ªà§à¦°à¦¦à¦¾à¦¨ à¦•à¦°à§à¦¨';
          errEl.classList.remove('hidden');
          return;
        }
        sGo.disabled = true;
        sGo.textContent = 'à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à¦¾ à¦¹à¦šà§à¦›à§‡â€¦';
        const r = await apiPost('login', { mode: 'staff', username: u, pin: p });
        sGo.disabled = false;
        sGo.textContent = 'ðŸ” à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾ à¦•à¦¨à¦¸à§‹à¦²à§‡ à¦ªà§à¦°à¦¬à§‡à¦¶ à¦•à¦°à§à¦¨ â†’';
        if (r.error) {
          errEl.textContent = r.error;
          errEl.classList.remove('hidden');
          return;
        }
        ME = r.user;
        renderAuthLink();
        toast(`à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®, ${ME.name}!`);
        location.hash = '#/console';
      };
    }

    // Wire Citizen Login Submit
    const cGo = $('#c_go');
    if (cGo) {
      cGo.onclick = async () => {
        const phone = ($('#c_phone').value || '').trim();
        const pw = $('#c_pw').value || '';
        const errEl = $('#authErr');
        errEl.classList.add('hidden');
        if (!phone || !pw) {
          errEl.textContent = 'à¦«à§‹à¦¨ à¦¨à¦®à§à¦¬à¦° à¦“ à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦¦à¦¿à¦¨';
          errEl.classList.remove('hidden');
          return;
        }
        cGo.disabled = true;
        cGo.textContent = 'à¦ªà§à¦°à¦¬à§‡à¦¶ à¦•à¦°à¦¾ à¦¹à¦šà§à¦›à§‡â€¦';
        const r = await apiPost('login', { phone, password: pw });
        cGo.disabled = false;
        cGo.textContent = t('login') + ' â†’';
        if (r.error) {
          errEl.textContent = r.error;
          errEl.classList.remove('hidden');
          return;
        }
        ME = r.user;
        renderAuthLink();
        toast(`à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®, ${ME.name}!`);
        location.hash = '#/dashboard';
      };
    }

    // Wire Door Demo Auto-Fill
    const fillBtn = $('#doorFillDemo');
    if (fillBtn) {
      fillBtn.onclick = () => {
        $('#d_appId').value = 'APP-2026-0001';
        $('#d_last4').value = '3344';
        toast('à¦®à¦¯à¦¼à§‚à¦°à§€ à¦†à¦•à§à¦¤à¦¾à¦°à§‡à¦° à¦¡à§‡à¦®à§‹ à¦¤à¦¥à§à¦¯ à¦ªà§‚à¦°à¦£ à¦•à¦°à¦¾ à¦¹à¦¯à¦¼à§‡à¦›à§‡');
      };
    }

    // Wire Door Login Submit
    const dGo = $('#d_go');
    if (dGo) {
      dGo.onclick = async () => {
        const appId = ($('#d_appId').value || '').trim().toUpperCase();
        const last4 = ($('#d_last4').value || '').trim();
        const role = $('#d_role').value;
        const errEl = $('#authErr');
        errEl.classList.add('hidden');
        if (!appId || !last4) {
          errEl.textContent = 'à¦†à¦¬à§‡à¦¦à¦¨ à¦†à¦‡à¦¡à¦¿ à¦à¦¬à¦‚ à¦¶à§‡à¦· à§ª à¦…à¦™à§à¦• à¦¦à¦¿à¦¨';
          errEl.classList.remove('hidden');
          return;
        }
        dGo.disabled = true;
        dGo.textContent = 'à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à¦¾ à¦¹à¦šà§à¦›à§‡â€¦';
        const r = await apiPost('login', { mode: 'citizen_door', applicationId: appId, contactLast4: last4, citizenRole: role });
        dGo.disabled = false;
        dGo.textContent = 'ðŸšª à¦¦à¦°à¦œà¦¾-à¦¯à¦¾à¦šà¦¾à¦‡ à¦“ à¦Ÿà§à¦°à§à¦¯à¦¾à¦•à¦¿à¦‚ à¦¶à§à¦°à§ à¦•à¦°à§à¦¨ â†’';
        if (r.error) {
          errEl.textContent = r.error;
          errEl.classList.remove('hidden');
          return;
        }
        if (r.user) ME = r.user;
        renderAuthLink();
        toast('à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦¦à¦°à¦œà¦¾ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦‰à¦¨à§à¦®à§à¦•à§à¦¤ à¦¹à¦¯à¦¼à§‡à¦›à§‡');
        location.hash = '#/track?appId=' + encodeURIComponent(appId);
      };
    }
  }

  render();
}

async function pageRegister() {
  if (ME) return (location.hash = '#/dashboard');
  const districtList = (BOOT && BOOT.offices ? [...new Set(BOOT.offices.map((o) => o.district))] : ['à¦œà¦¯à¦¼à¦ªà§à¦°à¦¹à¦¾à¦Ÿ', 'à¦¢à¦¾à¦•à¦¾', 'à¦à¦¿à¦¨à¦¾à¦‡à¦¦à¦¹', 'à¦–à¦¾à¦—à¦¡à¦¼à¦¾à¦›à¦¡à¦¼à¦¿', 'à¦šà¦Ÿà§à¦Ÿà¦—à§à¦°à¦¾à¦®']);

  app.innerHTML = `
  <div class="container auth-wrapper">
    <div class="auth-card-wide" style="max-width:620px;margin:0 auto">
      <div class="auth-header">
        <h1>ðŸ“ ${t('regTitle')}</h1>
        <p>${t('regLead')}</p>
      </div>

      <div id="authErr" class="form-error hidden"></div>

      <div class="field">
        <label>${t('name')} <span class="req">*</span></label>
        <input id="r_name" placeholder="à¦†à¦ªà¦¨à¦¾à¦° à¦ªà§‚à¦°à§à¦£ à¦¨à¦¾à¦® à¦²à¦¿à¦–à§à¦¨">
      </div>

      <div class="form-grid" style="margin-top:.85rem">
        <div class="field">
          <label>${t('phone')} <span class="req">*</span></label>
          <input id="r_phone" placeholder="01XXXXXXXXX" type="tel">
        </div>
        <div class="field">
          <label>à¦œà§‡à¦²à¦¾ (District) <span class="req">*</span></label>
          <select id="r_district">
            ${districtList.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="field" style="margin-top:.85rem">
        <label>${t('password')} <span class="req">*</span></label>
        <input id="r_pw" type="password" placeholder="à¦•à¦®à¦ªà¦•à§à¦·à§‡ à§¬ à¦…à¦•à§à¦·à¦°à§‡à¦° à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡">
        <div class="hint">à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦…à¦¬à¦¶à§à¦¯à¦‡ à¦•à¦®à¦ªà¦•à§à¦·à§‡ à§¬ à¦…à¦•à§à¦·à¦°à§‡à¦° à¦¹à¦¤à§‡ à¦¹à¦¬à§‡</div>
      </div>

      <div class="field" style="margin-top:.85rem">
        <label>${t('nid')} (à¦à¦šà§à¦›à¦¿à¦•)</label>
        <input id="r_nid" placeholder="à§§à§¦ à¦¬à¦¾ à§§à§­ à¦¡à¦¿à¦œà¦¿à¦Ÿà§‡à¦° à¦œà¦¾à¦¤à§€à¦¯à¦¼ à¦ªà¦°à¦¿à¦šà¦¯à¦¼à¦ªà¦¤à§à¦° à¦¨à¦®à§à¦¬à¦°">
      </div>

      <button class="btn btn-primary btn-block" id="r_go" style="margin-top:1.3rem;font-size:1.02rem">
        ðŸ“ à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨ à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦•à¦°à§à¦¨ â†’
      </button>

      <div style="text-align:center;margin-top:1.2rem;padding-top:1rem;border-top:1px dashed var(--border)">
        <p class="auth-alt" style="margin:0">${t('haveAccount')} <a href="#/login"><strong>${t('loginLinkTxt')}</strong></a></p>
      </div>
    </div>
  </div>`;

  $('#r_go').onclick = async () => {
    const errEl = $('#authErr');
    errEl.classList.add('hidden');
    const name = ($('#r_name').value || '').trim();
    const phone = ($('#r_phone').value || '').trim();
    const pw = $('#r_pw').value || '';
    const district = $('#r_district').value || '';
    const nid = ($('#r_nid').value || '').trim();

    if (!name || !phone || !pw) {
      errEl.textContent = 'à¦¨à¦¾à¦®, à¦«à§‹à¦¨ à¦¨à¦®à§à¦¬à¦° à¦à¦¬à¦‚ à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦ªà§à¦°à¦¦à¦¾à¦¨ à¦•à¦°à§à¦¨';
      errEl.classList.remove('hidden');
      return;
    }
    if (pw.length < 6) {
      errEl.textContent = 'à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦•à¦®à¦ªà¦•à§à¦·à§‡ à§¬ à¦…à¦•à§à¦·à¦°à§‡à¦° à¦¹à¦¤à§‡ à¦¹à¦¬à§‡';
      errEl.classList.remove('hidden');
      return;
    }

    const btn = $('#r_go');
    btn.disabled = true;
    btn.textContent = 'à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨ à¦•à¦°à¦¾ à¦¹à¦šà§à¦›à§‡â€¦';

    const r = await apiPost('register', { name, phone, password: pw, district, nid });
    btn.disabled = false;
    btn.textContent = 'ðŸ“ à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨ à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦•à¦°à§à¦¨ â†’';

    if (r.error) {
      errEl.textContent = r.error;
      errEl.classList.remove('hidden');
      return;
    }

    ME = r.user;
    renderAuthLink();
    toast('à¦…à¦­à¦¿à¦¨à¦¨à§à¦¦à¦¨! à¦†à¦ªà¦¨à¦¾à¦° à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¤à§ˆà¦°à¦¿ à¦¹à¦¯à¦¼à§‡à¦›à§‡à¥¤');
    location.hash = '#/dashboard';
  };
}

async function pageDashboard() {
  if (!ME) return (location.hash = '#/login');
  const r = await apiGet('applications');
  const apps = r.applications || [];
  const stageIcons = ['ðŸ“', 'ðŸ”', 'ðŸ‘¨â€âš–ï¸', 'ðŸ¤', 'âœ…'];
  app.innerHTML = `
  <div class="container page-head">
    <div class="dash-hero">
      <div class="dash-avatar">${esc((ME.name || 'à¦…').trim()[0])}</div>
      <div>
        <h1>${t('dashTitle')}</h1>
        <p>à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®, <strong>${esc(ME.name)}</strong>! ${ME.phone ? 'ðŸ“ž ' + esc(ME.phone) : ''}</p>
      </div>
      <button class="btn btn-outline btn-sm" id="d_logout" style="margin-left:auto">${t('logout')}</button>
    </div>
  </div>
  <div class="container">
    <div class="dash-grid">
      <div class="stat-card"><h3>à¦†à¦®à¦¾à¦° à¦†à¦¬à§‡à¦¦à¦¨</h3><div class="stat-num">${bnNum(apps.length)}</div></div>
      <div class="stat-card"><h3>à¦šà¦²à¦®à¦¾à¦¨</h3><div class="stat-num">${bnNum(apps.filter((a) => a.stage < 4).length)}</div></div>
      <div class="stat-card"><h3>à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿</h3><div class="stat-num">${bnNum(apps.filter((a) => a.stage >= 4).length)}</div></div>
      <div class="stat-card"><h3>à¦œà¦°à§à¦°à¦¿</h3><div class="stat-num">${bnNum(apps.filter((a) => a.emergency).length)}</div></div>
    </div>
    <div class="dash-head-row"><h2>${t('myApps')}</h2><a class="btn btn-primary btn-sm" href="#/apply">+ ${t('newApp')}</a></div>
    ${apps.length ? `<div class="myapps">${apps.map((a) => `
      <button class="app-card" data-app="${esc(a.appId)}">
        <span class="app-stage-icon">${stageIcons[a.stage] || 'ðŸ“'}</span>
        <span class="app-main">
          <span class="app-id">${esc(a.appId)}</span>
          <span class="app-meta">${esc(a.caseType || 'à¦¸à¦¾à¦§à¦¾à¦°à¦£')} ${a.district ? 'Â· ' + esc(a.district) : ''} Â· ${t('submittedAt')}: ${new Date(a.createdAt).toLocaleDateString('bn-BD')}</span>
        </span>
        <span class="app-right">
          ${a.emergency ? '<span class="badge warn">à¦œà¦°à§à¦°à¦¿</span>' : ''}
          <span class="badge">${esc(BOOT.stages[a.stage]?.label || '')}</span>
          <span class="app-chevron">â€º</span>
        </span>
      </button>`).join('')}</div>` : `<div class="empty-state">${t('noApps')} <a href="#/apply">${t('newApp')} â†’</a></div>`}
    <div class="quick-ans" style="margin-top:1.6rem">
      <strong>ðŸ“ž à¦«à§‹à¦¨à§‡ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦¨à¦¿à¦¨</strong>
      <p style="color:var(--muted);margin:.3rem 0 .7rem">à¦…à§à¦¯à¦¾à¦ª à¦›à¦¾à¦¡à¦¼à¦¾à¦‡ à§§à§¬à§¬à§¯à§¯ à¦¨à¦®à§à¦¬à¦°à§‡ à¦•à¦² à¦•à¦°à§‡ IVR à¦­à¦¯à¦¼à§‡à¦¸ à¦®à§‡à¦¨à§ à¦¥à§‡à¦•à§‡ à¦¸à¦¬ à¦¸à§‡à¦¬à¦¾ à¦¨à¦¿à¦¨ â€” à¦¡à§‡à¦®à§‹ à¦¦à§‡à¦–à§à¦¨à¥¤</p>
      <a class="btn btn-primary btn-sm" href="#/call">ðŸ“ž à¦•à¦² à¦¸à¦¿à¦®à§à¦²à§‡à¦Ÿà¦° à¦šà¦¾à¦²à¦¾à¦¨ â†’</a>
    </div>
  </div>
  <div id="appModal" class="modal hidden">
    <div class="modal-box">
      <button class="modal-x" id="mClose">âœ•</button>
      <div id="mBody"></div>
    </div>
  </div>`;
  $('#d_logout').onclick = async () => {
    await apiPost('logout', {});
    ME = null; renderAuthLink(); location.hash = '#/'; toast('à¦²à¦—à¦†à¦‰à¦Ÿ à¦¹à¦¯à¦¼à§‡à¦›à§‡');
  };
  const modal = $('#appModal');
  const closeModal = () => modal.classList.add('hidden');
  $('#mClose').onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  $$('.app-card').forEach((card) => {
    card.onclick = async () => {
      modal.classList.remove('hidden');
      $('#mBody').innerHTML = '<div class="empty-state">à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡â€¦</div>';
      const d = await apiGet('myapp', { id: card.dataset.app });
      if (d.error) { $('#mBody').innerHTML = `<div class="form-error">${esc(d.error)}</div>`; return; }
      $('#mBody').innerHTML = `
        <h2 style="margin-bottom:.2rem">${esc(d.appId)}</h2>
        <span class="badge">${esc(d.stageLabel)}</span>
        ${d.emergency ? '<span class="badge warn">à¦œà¦°à§à¦°à¦¿ à¦†à¦¬à§‡à¦¦à¦¨</span>' : ''}
        <div class="modal-facts">
          <div><span>à¦¨à¦¾à¦®</span><strong>${esc(d.name)}</strong></div>
          <div><span>à¦«à§‹à¦¨</span><strong>${esc(d.phone)}</strong></div>
          <div><span>à¦œà§‡à¦²à¦¾</span><strong>${esc(d.district || 'â€”')}</strong></div>
          <div><span>à¦®à¦¾à¦®à¦²à¦¾à¦° à¦§à¦°à¦¨</span><strong>${esc(d.caseType || 'â€”')}</strong></div>
          <div><span>à¦‰à¦¦à§à¦¦à§‡à¦¶à§à¦¯</span><strong>${esc(d.purpose || 'â€”')}</strong></div>
          <div><span>à¦œà¦®à¦¾à¦° à¦¤à¦¾à¦°à¦¿à¦–</span><strong>${new Date(d.submitted).toLocaleDateString('bn-BD')}</strong></div>
        </div>
        <h3 style="margin:1.1rem 0 .5rem">${t('currentStage')}: ${esc(d.stageLabel)}</h3>
        <ul class="timeline">
          ${d.stages.map((s, i) => `<li class="${s.done ? 'done' : ''} ${s.current ? 'current' : ''}">
            <div class="tl-dot">${s.done ? 'âœ“' : bnNum(i + 1)}</div>
            <div class="tl-body"><strong>${esc(s.label)}</strong>${s.current ? `<span>${t('currentStage')}</span>` : ''}</div>
          </li>`).join('')}
        </ul>
        <p style="color:var(--muted);font-size:.85rem;margin-top:.8rem">${esc(d.note)}</p>
        <div class="wizard-actions" style="margin-top:1rem">
          <a class="btn btn-outline btn-sm" href="#/track">ðŸ“¦ ${t('trackTitle')}</a>
          <a class="btn btn-primary btn-sm" href="#/call">ðŸ“ž à§§à§¬à§¬à§¯à§¯-à¦ à¦•à¦²</a>
        </div>`;
    };
  });
}

// ---------- à¦«à§‹à¦¨ à¦•à¦² à¦¸à¦¿à¦®à§à¦²à§‡à¦Ÿà¦° (DLAS-à¦¸à§à¦Ÿà¦¾à¦‡à¦² IVR) ----------
async function pageCall() {
  const bnDigit = (d) => bnNum(d);
  const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];
  const KEY_SUB = { '2':'ABC','3':'DEF','4':'GHI','5':'JKL','6':'MNO','7':'PQRS','8':'TUV','9':'WXYZ','0':'+','*':'',' #':'' };
  app.innerHTML = `
  <div class="container page-head">
    <a class="btn btn-ghost btn-sm" href="#/help">â† ${t('backHelp') || 'à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦¯à¦¼ à¦«à¦¿à¦°à§à¦¨'}</a>
    <h1>ðŸ“ž à¦«à§‹à¦¨à§‡ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦¨à¦¿à¦¨ â€” à¦…à§à¦¯à¦¾à¦¡à¦­à§‹à¦•à§‡à¦Ÿ à¦“ à¦‡à¦‰à¦à¦¸à¦à¦¸à¦¡à¦¿ à¦®à§‡à¦¨à§</h1>
    <p>à¦¦à§à¦Ÿà¦¿ à¦šà§à¦¯à¦¾à¦¨à§‡à¦²à§‡à¦‡ à§¨à§ª/à§­ à¦¬à¦¾ à¦…à¦«à¦¿à¦¸ à¦†à¦“à¦¯à¦¼à¦¾à¦°à§‡ à¦†à¦‡à¦¨à¦¿ à¦ªà§à¦°à¦¾à¦¥à¦®à¦¿à¦• à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà¦¾à¦¬à§‡à¦¨à¥¤ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦à¦•à¦Ÿà¦¿ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨ â€” à¦¡à§‡à¦®à§‹ à¦•à¦² à¦šà¦¾à¦²à¦¿à¦¯à¦¼à§‡ à¦¦à§‡à¦–à§à¦¨ à¦•à§€à¦­à¦¾à¦¬à§‡ à¦•à¦¾à¦œ à¦•à¦°à§‡à¥¤</p>
    <div class="call-tabs">
      <button class="call-tab active" id="tabPhone">ðŸ“ž à¦…à§à¦¯à¦¾à¦¡à¦­à§‹à¦•à§‡à¦Ÿ à¦•à¦² Â· à§§à§¬à§¬à§¯à§¯</button>
      <button class="call-tab" id="tabUssd">ðŸ“± à¦‡à¦‰à¦à¦¸à¦à¦¸à¦¡à¦¿ à¦®à§‡à¦¨à§</button>
    </div>
  </div>
  <div class="container call-layout">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-status"><span>à¦ªà§à¦°à¦¾à¦‡à¦­à§‡à¦Ÿ</span><span>à¦¬à§à¦¯à¦¾à¦Ÿà¦¾à¦°à¦¿ à§ªà§¨%</span></div>
      <div class="phone-screen" id="phScreen">
        <div class="ph-idle">
          <div class="ph-icon">ðŸ“ž</div>
          <p>à¦•à¦² à¦•à¦°à¦¤à§‡ à¦¨à¦¿à¦šà§‡à¦° à¦¬à§‹à¦¤à¦¾à¦® à¦šà¦¾à¦ªà§à¦¨ à¦…à¦¥à¦¬à¦¾ à¦¨à¦®à§à¦¬à¦° à¦¡à¦¾à¦¯à¦¼à¦¾à¦² à¦•à¦°à§à¦¨</p>
        </div>
        <div class="ph-digits" id="phDigits"></div>
        <div class="ph-timer hidden" id="phTimer">à§¦à§¦:à§¦à§¦</div>
        <div class="ph-visualizer hidden" id="phViz">${Array.from({length: 18}, (_, i) => `<span style="--h:${8 + Math.round(Math.abs(Math.sin(i * 1.7)) * 26)}px"></span>`).join('')}</div>
      </div>
      <div class="keypad" id="keypad">
        ${KEYS.map((k) => `<button class="key" data-k="${k}"><b>${bnDigit(k === '*' ? '*' : k === '#' ? '#' : bnNum(k))}</b>${KEY_SUB[k] ? `<small>${KEY_SUB[k]}</small>` : '<small>&nbsp;</small>'}</button>`).join('')}
      </div>
      <div class="phone-actions">
        <button class="ph-btn ghost" id="phHold">â¸ à¦§à¦°à§‡ à¦°à¦¾à¦–à§à¦¨</button>
        <button class="ph-btn danger hidden" id="phEnd">ðŸ“ž à¦•à¦² à¦•à¦¾à¦Ÿà§à¦¨</button>
        <button class="ph-btn green" id="phStart">âœ† à¦•à¦² à¦•à¦°à§à¦¨</button>
      </div>
    </div>
    <div class="call-right">
      <h2>à¦•à¦²à§‡à¦° à¦Ÿà§à¦°à¦¾à¦¨à§à¦¸à¦•à§à¦°à¦¿à¦ªà§à¦Ÿ</h2>
      <div class="live-badge" id="liveBadge" hidden><span class="dot"></span> à¦²à¦¾à¦‡à¦­ à¦•à§€-à¦²à¦—</div>
      <div class="transcript" id="transcript">
        <div class="tr-item sys"><span class="tr-tag">IVR</span> à¦¨à¦®à§à¦¬à¦° à¦¡à¦¾à¦¯à¦¼à¦¾à¦² à¦•à¦°à§‡ "à¦•à¦² à¦•à¦°à§à¦¨" à¦šà¦¾à¦ªà§à¦¨ â€” à¦à¦°à¦ªà¦° à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦§à¦¾à¦ª à¦à¦–à¦¾à¦¨à§‡ à¦¦à§‡à¦–à¦¾ à¦¯à¦¾à¦¬à§‡à¥¤</div>
      </div>
      <div class="call-hint">â„¹ï¸ à¦¬à¦¾à¦¸à§à¦¤à¦¬ à¦•à¦² à¦¨à¦¯à¦¼ â€” à¦‡à¦¨à§à¦Ÿà¦¾à¦°à¦…à§à¦¯à¦¾à¦•à¦Ÿà¦¿à¦­ à¦¡à§‡à¦®à§‹à¥¤ à¦†à¦¸à¦² à¦•à¦²à§‡ à¦­à¦¯à¦¼à§‡à¦¸-à¦•à§€-à¦ªà§à¦°à§‡à¦¸ à¦•à¦¾à¦œ à¦•à¦°à§‡à¥¤</div>
      <div class="call-steps" id="callSteps">
        <h3>à¦à¦• à¦¨à¦œà¦°à§‡ IVR à¦®à§‡à¦¨à§</h3>
        <ol>
          <li>à¦­à¦¾à¦·à¦¾ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ â€” à¦¬à¦¾à¦‚à¦²à¦¾à¦° à¦œà¦¨à§à¦¯ à§§, English à¦à¦° à¦œà¦¨à§à¦¯ à§¨</li>
          <li>à§§ â†’ à¦†à¦¬à§‡à¦¦à¦¨ à¦Ÿà§à¦°à§à¦¯à¦¾à¦• (à¦†à¦‡à¦¡à¦¿à¦° à¦¶à§‡à¦· à§¯ à¦¡à¦¿à¦œà¦¿à¦Ÿ + #)</li>
          <li>à§¨ â†’ à¦¨à¦¤à§à¦¨ à¦†à¦¬à§‡à¦¦à¦¨ / à¦à¦¸à¦à¦®à¦à¦¸ à¦²à¦¿à¦‚à¦•</li>
          <li>à§© â†’ à¦…à¦«à¦¿à¦¸à§‡à¦° à¦ à¦¿à¦•à¦¾à¦¨à¦¾ à¦à¦¸à¦à¦®à¦à¦¸à§‡</li>
          <li>à§ª â†’ à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦¨à¦¿à¦¯à¦¼à§‹à¦— à¦¤à¦¥à§à¦¯</li>
          <li>à§¦ â†’ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦•à¦²-à¦¸à§‡à¦¨à§à¦Ÿà¦¾à¦° à¦à¦œà§‡à¦¨à§à¦Ÿ</li>
        </ol>
      </div>
    </div>
  </div>`;
  // ---- à¦•à¦² à¦¸à§à¦Ÿà§‡à¦Ÿ ----
  let onCall = false, held = false, timer = null, secs = 0, digits = '', ivrState = 'start', lang = 'bn', mode = 'call', ussdPath = '';
  const $t = $('#transcript'), $digits = $('#phDigits'), $timer = $('#phTimer'), $viz = $('#phViz'), $idle = document.querySelector('.ph-idle');
  const $start = $('#phStart'), $end = $('#phEnd'), $hold = $('#phHold'), $live = $('#liveBadge');
  const addTr = (who, text) => {
    const div = document.createElement('div');
    div.className = 'tr-item ' + who;
    div.innerHTML = `<span class="tr-tag">${who === 'ivr' ? 'IVR' : who === 'user' ? 'à¦†à¦ªà¦¨à¦¿' : 'â„¹ï¸'}</span> ${esc(text)}`;
    $t.appendChild(div); $t.scrollTop = $t.scrollHeight;
  };
  const setScreen = () => {
    $digits.textContent = digits;
    if (onCall && !held) { $timer.classList.remove('hidden'); $viz.classList.remove('hidden'); $idle.style.display = 'none'; }
    else if (onCall && held) { $timer.classList.remove('hidden'); $viz.classList.add('hidden'); $idle.style.display = 'none'; }
    else if (digits) { $timer.classList.add('hidden'); $viz.classList.add('hidden'); $idle.style.display = 'none'; }
    else { $timer.classList.add('hidden'); $viz.classList.add('hidden'); $idle.style.display = ''; }
  };
  const fmt = (s) => bnNum(String(Math.floor(s / 60)).padStart(2, '0')) + ':' + bnNum(String(s % 60).padStart(2, '0'));
  const tick = () => { secs++; $timer.textContent = fmt(secs); };
  const ivr = async (payload) => {
    const r = await apiPost('ivr', payload);
    (r.say || []).forEach((s) => addTr('ivr', s));
    if (r.prompt) addTr('sys', r.prompt);
    if (r.next) ivrState = r.next;
    return r;
  };
  const startCall = async () => {
    if (onCall) return;
    onCall = true; held = false; secs = 0; digits = ''; ivrState = 'start';
    $start.classList.add('hidden'); $end.classList.remove('hidden'); $hold.classList.remove('hidden');
    $live.hidden = false; setScreen();
    $timer.textContent = fmt(0);
    if (mode === 'ussd') {
      // à¦‡à¦‰à¦à¦¸à¦à¦¸à¦¡à¦¿ â€” à¦«à§‹à¦¨à§‡à¦‡ à¦®à§‡à¦¨à§ à¦šà¦²à§‡
      ussdPath = '*à§§à§¬à§¬à§¯à§¯#';
      $digits.textContent = ussdPath;
      addTr('sys', 'ðŸ“² à¦¶à¦°à§à¦Ÿà¦•à§‹à¦¡ à¦ªà¦¾à¦ à¦¾à¦¨à§‹ à¦¹à¦šà§à¦›à§‡â€¦');
      setTimeout(async () => {
        addTr('sys', 'à¦‡à¦‰à¦à¦¸à¦à¦¸à¦¡à¦¿ à¦¸à§‡à¦¶à¦¨ à¦¶à§à¦°à§');
        await ivr({ state: 'start' });
        $digits.textContent = '';
      }, 700);
      return;
    }
    tick(); timer = setInterval(tick, 1000);
    addTr('sys', 'ðŸ“ž à§§à§¬à§¬à§¯à§¯-à¦ à¦•à¦² à¦¯à¦¾à¦šà§à¦›à§‡â€¦');
    setTimeout(async () => {
      addTr('sys', 'à¦§à¦°à¦¾ à¦ªà¦¡à¦¼à§‡à¦›à§‡ â€” à¦¸à¦¿à¦—à¦¨à§à¦¯à¦¾à¦² à¦­à¦¾à¦²à§‹');
      await ivr({ state: 'start' });
    }, 800);
  };
  const endCall = () => {
    if (!onCall) return;
    onCall = false; held = false; clearInterval(timer);
    $start.classList.remove('hidden'); $end.classList.add('hidden'); $hold.classList.add('hidden');
    $live.hidden = true; digits = ''; setScreen();
    addTr('sys', mode === 'ussd' ? 'à¦‡à¦‰à¦à¦¸à¦à¦¸à¦¡à¦¿ à¦¸à§‡à¦¶à¦¨ à¦¶à§‡à¦·' : `à¦•à¦² à¦¶à§‡à¦· â€” à¦¸à¦®à¦¯à¦¼à¦•à¦¾à¦² ${fmt(secs)}`);
  };
  const pressKey = async (k) => {
    if (!onCall) { digits += k; setScreen(); return; }
    if (held) { held = false; $hold.textContent = 'â¸ à¦§à¦°à§‡ à¦°à¦¾à¦–à§à¦¨'; addTr('sys', 'à¦•à¦² à¦ªà§à¦¨à¦°à¦¾à¦¯à¦¼ à¦šà¦¾à¦²à§'); }
    addTr('user', k === '#' ? '#' : k === '*' ? '*' : k);
    if (ivrState === 'track' || ivrState === 'trackResult') {
      if (k === '#') { await ivr({ state: 'track', digits: digits.replace(/\D/g, '') }); digits = ''; }
      else digits += k;
      setScreen(); return;
    }
    if (k === '*') { await ivr({ state: 'langBn', key: '*' }); return; }
    await ivr({ state: ivrState, key: k });
  };
  $$('#keypad .key').forEach((btn) => { btn.onclick = () => pressKey(btn.dataset.k); });
  $start.onclick = startCall;
  $end.onclick = endCall;
  $hold.onclick = () => {
    if (!onCall) return;
    held = !held;
    $hold.textContent = held ? 'â–¶ à¦šà¦¾à¦²à§ à¦•à¦°à§à¦¨' : 'â¸ à¦§à¦°à§‡ à¦°à¦¾à¦–à§à¦¨';
    addTr('sys', held ? 'à¦•à¦² à¦¹à§‹à¦²à§à¦¡à§‡' : 'à¦•à¦² à¦ªà§à¦¨à¦°à¦¾à¦¯à¦¼ à¦šà¦¾à¦²à§');
    setScreen();
  };
  // ---- USSD à¦Ÿà§à¦¯à¦¾à¦¬ â€” à¦à¦•à¦‡ à¦«à§‹à¦¨à§‡ à¦®à§‡à¦¨à§ à¦®à§‹à¦¡ ----
  $('#tabUssd').onclick = () => {
    $('#tabPhone').classList.remove('active'); $('#tabUssd').classList.add('active');
    mode = 'ussd';
    $('#phStart').innerHTML = 'ðŸ“² à¦¶à¦°à§à¦Ÿà¦•à§‹à¦¡ à¦ªà¦¾à¦ à¦¾à¦¨';
    if (!onCall) endCall();
    addTr('sys', 'à¦‡à¦‰à¦à¦¸à¦à¦¸à¦¡à¦¿ à¦®à§‹à¦¡ â€” à¦«à§‹à¦¨à§‡à¦° à¦¸à§à¦•à§à¦°à¦¿à¦¨à§‡à¦‡ à¦®à§‡à¦¨à§ à¦¦à§‡à¦–à¦¾ à¦¯à¦¾à¦¬à§‡à¥¤ "à¦¶à¦°à§à¦Ÿà¦•à§‹à¦¡ à¦ªà¦¾à¦ à¦¾à¦¨" à¦šà¦¾à¦ªà§à¦¨à¥¤');
  };
  $('#tabPhone').onclick = () => {
    $('#tabUssd').classList.remove('active'); $('#tabPhone').classList.add('active');
    mode = 'call';
    $('#phStart').innerHTML = 'âœ† à¦•à¦² à¦•à¦°à§à¦¨';
  };
}
async function pageComplaint() {
  app.innerHTML = `
  <div class="container page-head"><h1>ðŸ“£ ${t('complaintTitle')}</h1><p>${t('complaintLead')}</p></div>
  <div class="container"><div class="form-card">
    <div id="cErr" class="form-error hidden"></div>
    <div id="cBody">
      <div class="field"><label>${t('compCategory')}</label>
        <select id="c_cat">
          <option>à¦…à¦«à¦¿à¦¸ à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤</option><option>à¦†à¦‡à¦¨à¦œà§€à¦¬à§€ à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤</option><option>à¦Ÿà¦¾à¦•à¦¾-à¦ªà¦¯à¦¼à¦¸à¦¾ à¦šà¦¾à¦“à¦¯à¦¼à¦¾ à¦¹à¦¯à¦¼à§‡à¦›à§‡</option>
          <option>à¦“à¦¯à¦¼à§‡à¦¬à¦¸à¦¾à¦‡à¦Ÿ à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤</option><option>à¦…à¦¨à§à¦¯</option>
        </select></div>
      <div class="field" style="margin-top:.9rem"><label>${t('compCase')}</label><input id="c_case" placeholder="DLAS-NET-â€¦"></div>
      <div class="field" style="margin-top:.9rem"><label>${t('compDesc')} <span class="req">*</span></label><textarea id="c_desc"></textarea></div>
      <div class="field" style="margin-top:.9rem"><label>${t('phone')} (à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦—à§‡à¦° à¦œà¦¨à§à¦¯)</label><input id="c_phone" placeholder="${t('phonePh')}"></div>
      <button class="btn btn-primary btn-block" id="c_go" style="margin-top:1.2rem">${t('compSubmit')}</button>
    </div>
  </div></div>`;
  $('#c_go').onclick = async () => {
    const r = await apiPost('complaints', {
      category: $('#c_cat').value, caseRef: $('#c_case').value.trim(),
      desc: $('#c_desc').value.trim(), phone: $('#c_phone').value.trim()
    });
    if (r.error) { const e = $('#cErr'); e.textContent = r.error; e.classList.remove('hidden'); return; }
    $('#cBody').innerHTML = `<div class="form-success">âœ… ${t('compDone')}: <strong>${esc(r.id)}</strong><p style="margin-top:.4rem">${esc(r.message)}</p></div>`;
  };
}

// ---------- à¦¹à§‡à¦¡à¦¾à¦°à§‡à¦° à¦²à¦—à¦‡à¦¨ à¦²à¦¿à¦‚à¦• ----------
function renderAuthLink() {
  const el = $('#loginLink');
  if (ME) {
    if (ME.role && ME.role !== 'applicant' && ME.role !== 'CITIZEN') {
      el.textContent = 'ðŸ› ï¸ ' + (ME.name || 'à¦•à¦¨à¦¸à§‹à¦²');
      el.setAttribute('href', '#/console');
    } else {
      el.textContent = t('dashboard');
      el.setAttribute('href', '#/dashboard');
    }
  } else {
    el.textContent = t('login');
    el.setAttribute('href', '#/login');
  }
}

// ---------- boot ----------
(async function init() {
  initShell();
  applyI18n();
  try {
    BOOT = await apiGet('bootstrap');
  } catch (e) {
    app.innerHTML = '<div class="empty-state">à¦¸à¦¾à¦°à§à¦­à¦¾à¦°à§‡ à¦¸à¦‚à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¯à¦¾à¦šà§à¦›à§‡ à¦¨à¦¾à¥¤ <code>npm start</code> à¦šà¦¾à¦²à¦¾à¦¨à¥¤</div>';
    return;
  }
  const me = await apiGet('me');
  ME = me.user;
  renderAuthLink();
  window.addEventListener('hashchange', route);
  route();
})();

