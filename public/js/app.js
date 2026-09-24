/**
 * আইনসহায় — SPA router ও সব পেজের লজিক।
 * রাউট: #/, #/topics, #/topic/:id, #/article/:id, #/guide, #/search?q=,
 *       #/apply, #/track, #/offices, #/news, #/help, #/login, #/register,
 *       #/dashboard, #/complaint
 */
'use strict';

// ---------- ছোট helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');

let BOOT = null;           // /api/bootstrap থেকে আসা ডেটা
let ME = null;             // লগইন করা ইউজার
const bnNum = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

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

// ---------- থিম / ভাষা / a11y ----------
function initShell() {
  // ডায়নামিক লাইভ বাংলা তারিখ
  const dateEl = $('#govLiveDate');
  if (dateEl) {
    const now = new Date();
    const days = ['রবিবার', 'সোমাবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    dateEl.textContent = `${days[now.getDay()]}, ${bnNum(now.getDate())} ${months[now.getMonth()]}, ${bnNum(now.getFullYear())}`;
  }

  // Force light theme – dark mode disabled
  document.documentElement.dataset.theme = 'light';
  // Hide theme toggle button if present
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.style.display = 'none';
  }

  // ভাষা
  const savedLang = localStorage.getItem('lang');
  if (savedLang) document.documentElement.lang = savedLang;
  if ($('#langToggle')) {
    $('#langToggle').textContent = document.documentElement.lang === 'bn' ? '文A English' : 'বাং বাংলা';
  }
  $('#langToggle').onclick = () => {
    const next = document.documentElement.lang === 'bn' ? 'en' : 'bn';
    document.documentElement.lang = next;
    localStorage.setItem('lang', next);
    $('#langToggle').textContent = next === 'bn' ? '文A English' : 'বাং বাংলা';
    applyI18n();
    route();
  };

  // প্রবেশগম্যতা
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

  // মোবাইল মেনু
  $('#navBurger').onclick = () => $('#mainNav').classList.toggle('open');

  // চ্যাট
  const chatBody = $('#chatBody');
  const chatOpen = () => { $('#chatWidget').classList.remove('hidden'); $('#chatText').focus(); };
  $('#chatFab').onclick = () => { const w = $('#chatWidget'); if (w.classList.contains('hidden')) chatOpen(); else w.classList.add('hidden'); };
  $('#chatClose').onclick = () => $('#chatWidget').classList.add('hidden');
  window.__chatOpen = chatOpen;

  const chatNav = (route, label) => {
    if (route === location.hash) return;
    const div = document.createElement('div');
    div.className = 'msg bot chat-acted';
    div.textContent = '➡️ ' + (label || route);
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
        home: ['#/','🏠 হোম'], library: ['#/topics','📚 লাইব্রেরি'], guide: ['#/guide','🧭 গাইড'],
        apply: ['#/apply','📝 আবেদন'], track: ['#/track','📦 ট্র্যাক'], offices: ['#/offices','🗺️ অফিস'],
        news: ['#/news','📰 নিউজ'], help: ['#/help','🤝 সহায়তা'], call: ['#/call','📞 কল করুন'],
        login: ['#' + (ME ? '/dashboard' : '/login'), ME ? '👤 ড্যাশবোর্ড' : '🔐 লগইন'],
        dashboard: ['#/dashboard','👤 ড্যাশবোর্ড'], complaint: ['#/complaint','📣 অভিযোগ'], search: ['#/search','🔍 খুঁজুন']
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
      // অটো নেভিগেট — সাইট কন্ট্রোল
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
  app.innerHTML = `<div class="empty-state"><h2>৪০৪</h2><p>পেজটি পাওয়া যায়নি।</p></div>`;
}

// ---------- ম্যাপ (Leaflet) ----------
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
    marker.bindPopup(`<div class="map-popup"><strong>${esc(o.name)}</strong><span>${esc(o.address)}</span><br>📞 <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br>🕘 ${esc(o.hours)}</div>`);
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

// ---------- হোম পেজ (Reference Site Inspired UI) ----------
async function pageHome() {
  app.innerHTML = `
  <!-- ১. হিরো সেকশন (Gavel Background & Judicial Atmosphere) -->
  <section class="ref-hero">
    <div class="container ref-hero-inner">
      <h1 class="ref-hero-title">
        ন্যায়বিচারের পথে,<br>আমরা আছি আপনার পাশে, এক ঠিকানায়
      </h1>
      <p class="ref-hero-subtitle">
        আইনি পরামর্শ, আইনি সহায়তার জন্য আবেদন, মধ্যস্থতা এবং মামলার অগ্রগতি—সবকিছু সহজেই পান এক প্ল্যাটফর্মে
      </p>
      <div class="ref-hero-actions">
        <a class="btn-ref-hero-primary" href="#/apply">
          <span>নতুন আবেদন করুন</span> <span>→</span>
        </a>
        <a class="btn-ref-hero-outline" href="#/track">
          <span>🔍</span> <span>আবেদন ট্র্যাক করুন</span>
        </a>
      </div>
      <div class="hero-demo-chips">
        <span>ডেমো ট্র্যাকিং টেস্ট:</span>
        <button type="button" class="chip-ref-demo" data-id="APP-2026-0001" data-phone="01711223344" data-last4="3344">APP-2026-0001 (ময়ূরী / ৩৩৪৪)</button>
        <button type="button" class="chip-ref-demo" data-id="DLAS-NET-2026-04420" data-phone="01711223344" data-last4="3344">DLAS-NET-2026-04420 (৩৩৪৪)</button>
      </div>
    </div>
  </section>

  <!-- ২. আপনার জন্য আমরা যে আইনি সহায়তাগুলো দিচ্ছি (Services & Stats) -->
  <section class="ref-section">
    <div class="container">
      <div class="sec-header-split">
        <div>
          <h2 class="sec-heading-serif">আপনার জন্য আমরা যে আইনি সহায়তাগুলো দিচ্ছি</h2>
        </div>
        <div>
          <p class="sec-heading-desc">
            আপনার আইনি সমস্যার ধরন যাই হোক না কেন, সঠিক সহায়তা পেতে আপনাকে একা পথ খুঁজতে হবে না। আমরা থাকছি আপনার পাশে।
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
          <h3>মধ্যস্থতার মাধ্যমে বিরোধ নিষ্পত্তি</h3>
          <p>আদালতের দীর্ঘ প্রক্রিয়ায় না গিয়ে উপযুক্ত বিরোধ মধ্যস্থতার মাধ্যমে শান্তিপূর্ণভাবে নিষ্পত্তির সুযোগ।</p>
        </div>

        <div class="ref-service-card">
          <div class="ref-service-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>আইনগত পরামর্শ</h3>
          <p>আপনার আইনি সমস্যা সম্পর্কে প্রয়োজনীয় পরামর্শ ও সরকারি আইন কর্মকর্তার সঠিক দিকনির্দেশনা।</p>
        </div>

        <div class="ref-service-card">
          <div class="ref-service-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v18M7 21h10M12 6l7 2M12 6L5 8M19 8l-2.5 6a3.5 3.5 0 0 1-5 0L19 8zM5 8l2.5 6a3.5 3.5 0 0 0 5 0L5 8z"/>
            </svg>
          </div>
          <h3>আইনজীবী ও আদালত সহায়তা</h3>
          <p>যোগ্যতার ভিত্তিতে প্যানেল আইনজীবীর মাধ্যমে মামলা পরিচালনা ও আদালত-সংক্রান্ত আইনি সহায়তা।</p>
        </div>

        <div class="ref-service-card">
          <div class="ref-service-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3>জরুরি আইনি সহায়তা</h3>
          <p>জরুরি নির্যাতন, বিনা বিচারে আটক ও আইনি সমস্যায় তাৎক্ষণিক সহায়তা ও সরকারি আইনি পদক্ষেপ।</p>
        </div>
      </div>

      <!-- Metrics Bar -->
      <div class="ref-metrics-bar">
        <div class="ref-metric-item">
          <h4>৩ বছর</h4>
          <span>প্রকল্পের সময়কাল</span>
        </div>
        <div class="ref-metric-item">
          <h4>৩০০</h4>
          <span>ইউনিয়নসমূহ</span>
        </div>
        <div class="ref-metric-item">
          <h4>৬৪</h4>
          <span>জেলায় পূর্ণ কভারেজ</span>
        </div>
        <div class="ref-metric-item">
          <h4>৬.৫ লক্ষ+</h4>
          <span>সেবাগ্রহীতা নাগরিক</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ৩. আপনি কোন ধরনের আইনি সাহায্য চান? (Photographic Topic Cards) -->
  <section class="ref-section-alt">
    <div class="container">
      <div class="sec-header-split">
        <div>
          <h2 class="sec-heading-serif">আপনি কোন ধরনের আইনি সাহায্য চান?</h2>
        </div>
        <div>
          <p class="sec-heading-desc">
            বিভিন্ন বিষয়ে সহায়তার জন্য উপযুক্ত বিভাগ নির্বাচন করুন।
          </p>
        </div>
      </div>

      <div class="ref-topics-grid">
        <a class="ref-topic-card" href="#/topic/family">
          <div class="ref-topic-img-wrap">
            <img src="/img/topic_family.jpg" alt="পারিবারিক আইনি সহায়তা" loading="lazy">
          </div>
          <div class="ref-topic-body">
            <h3>পারিবারিক</h3>
            <p>পারিবারিক সম্পর্ক, বিবাহ, দেনমোহর, বিচ্ছেদ, সন্তানের হেফাজত ও অন্যান্য পারিবারিক বিষয়।</p>
          </div>
        </a>

        <a class="ref-topic-card" href="#/topic/land">
          <div class="ref-topic-img-wrap">
            <img src="/img/topic_land.jpg" alt="জমি সংক্রান্ত আইনি সহায়তা" loading="lazy">
          </div>
          <div class="ref-topic-body">
            <h3>জমি সংক্রান্ত</h3>
            <p>জমি ক্রয়-বিক্রয়, রেকর্ড সংশোধন ও অগ্রক্রয় (Pre-emption) অধিকার-সংক্রান্ত।</p>
          </div>
        </a>

        <a class="ref-topic-card" href="#/topic/elder">
          <div class="ref-topic-img-wrap">
            <img src="/img/topic_elder.jpg" alt="অভিভাবকদের ভরণপোষণ" loading="lazy">
          </div>
          <div class="ref-topic-body">
            <h3>অভিভাবকদের ভরণপোষণ</h3>
            <p>পিতা-মাতার ভরণপোষণ আইন ২০১৩ ও প্রবীণদের সুরক্ষা ও তাঁদের অধিকার-সংক্রান্ত।</p>
          </div>
        </a>

        <a class="ref-topic-card" href="#/topic/civil">
          <div class="ref-topic-img-wrap">
            <img src="/img/topic_civil.jpg" alt="দেওয়ানি বিরোধ" loading="lazy">
          </div>
          <div class="ref-topic-body">
            <h3>দেওয়ানি</h3>
            <p>সম্পত্তি, চুক্তি, অধিকার, সালিস ও ক্ষতিপূরণ-সংক্রান্ত আইনি সহায়তা।</p>
          </div>
        </a>
      </div>

      <div style="text-align:center">
        <a class="btn-ref-more" href="#/topics">আরও আইনি বিষয় দেখুন →</a>
      </div>
    </div>
  </section>

  <!-- ৪. আমি কি আর্থিক সহযোগিতা পাবো? (Eligibility Checker) -->
  <section class="ref-section">
    <div class="container">
      <div class="ref-eligibility-wrap">
        <div>
          <h2 class="sec-heading-serif">আমি কি আর্থিক সহযোগিতা পাবো?</h2>
          <p style="font-weight:700;margin-top:1.5rem;font-size:1.1rem;color:#0F172A">কারা বিশেষ সহায়তা পাবেন:</p>
          <ul class="eligibility-check-list">
            <li class="eligibility-check-item">
              <span class="check-circle">✓</span>
              <span><strong>নারী এবং শিশু</strong> (নির্ধারিত আয়ের শর্ত শিথিল ও অগ্রাধিকার)</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">✓</span>
              <span><strong>অসচ্ছল ও দরিদ্র নাগরিক</strong> (বার্ষিক পারিবারিক আয় ₹১,৫০,০০০-এর কম)</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">✓</span>
              <span><strong>প্রতিবন্ধী ব্যক্তি</strong> (শারীরিক বা মানসিক প্রতিবন্ধী)</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">✓</span>
              <span><strong>বীর মুক্তিযোদ্ধা</strong> ও অসচ্ছল মুক্তিযোদ্ধা পরিবার</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">✓</span>
              <span><strong>কারাগারে বিনা বিচারে আটক</strong> ও হেফাজতে থাকা ব্যক্তি</span>
            </li>
            <li class="eligibility-check-item">
              <span class="check-circle">✓</span>
              <span><strong>মানবপাচার ও অ্যাসিড সহিংসতার শিকার</strong> ব্যক্তি</span>
            </li>
          </ul>
        </div>

        <div class="ref-card-box">
          <h3>আপনি কি আর্থিক সহায়তা পাওয়ার যোগ্য?</h3>
          <p style="font-size:0.88rem;color:#64748B;margin-bottom:1.5rem">
            আপনার আয়, মামলার ধরন ও অবস্থানের তথ্য দিয়ে জেনে নিন আপনি আর্থিক সহায়তার জন্য যোগ্য কি না
          </p>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">বার্ষিক আয় (টাকা) *</label>
              <input id="homeIncomeInput" type="number" value="84000" placeholder="যেমন ৮৪০০০" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">আবেদনকারীর ধরন *</label>
              <select id="homeCategorySelect" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
                <option value="general">সাধারণ অসচ্ছল নাগরিক</option>
                <option value="women">নারী বা শিশু</option>
                <option value="freedom">বীর মুক্তিযোদ্ধা বা পরিবার</option>
                <option value="disabled">প্রতিবন্ধী ব্যক্তি</option>
                <option value="prisoner">কারাবন্দী / হেফাজতে আটক</option>
                <option value="victim">অ্যাসিড আক্রান্ত / পাচারের শিকার</option>
              </select>
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">মামলার ধরন *</label>
              <select id="homeCaseTypeSelect" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
                <option value="family">পারিবারিক বিরোধ</option>
                <option value="land">জমি সংক্রান্ত</option>
                <option value="elder">অভিভাবকদের ভরণপোষণ</option>
                <option value="civil">দেওয়ানি</option>
                <option value="criminal">ফৌজদারি</option>
              </select>
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">জেলা *</label>
              <select id="homeDistrictSelect" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
                <option value="ঢাকা">ঢাকা</option>
                <option value="কুমিল্লা">কুমিল্লা</option>
                <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                <option value="সিলেট">সিলেট</option>
                <option value="রাজশাহী">রাজশাহী</option>
                <option value="খুলনা">খুলনা</option>
                <option value="বরিশাল">বরিশাল</option>
                <option value="রংপুর">রংপুর</option>
                <option value="নেত্রকোনা">নেত্রকোনা</option>
              </select>
            </div>
            <button class="btn-ref-submit" id="homeCheckBtn" type="button">যাচাই করুন</button>
            <div id="homeEligibilityResult" style="margin-top:10px"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ৫. আইনি সহায়তা এখন আরও সহজ এবং স্বচ্ছ (Emerald Banner with 5 Steps) -->
  <section class="ref-emerald-section">
    <div class="container">
      <div class="ref-emerald-grid">
        <div class="ref-emerald-left">
          <h2>আইনি সহায়তা এখন<br>আরও সহজ এবং স্বচ্ছ</h2>
          <p>
            কয়েকটি সহজ ধাপে আইনি সহায়তার জন্য আবেদন করুন এবং পরবর্তী প্রক্রিয়া সম্পর্কে সব সময় আপডেট থাকুন।
          </p>
          <a class="btn-ref-white" href="#/apply">
            <span>আবেদন শুরু করুন</span> <span>→</span>
          </a>
        </div>

        <div class="ref-steps-list">
          <div class="ref-step-item">
            <span class="ref-step-num">০১</span>
            <div class="ref-step-content">
              <h4>আপনার সমস্যার কথা জানান</h4>
              <p>আপনার তথ্য এবং আপনি কী ধরনের আইনি সহায়তা চান, তা আমাদের জানান।</p>
            </div>
          </div>
          <div class="ref-step-item">
            <span class="ref-step-num">০২</span>
            <div class="ref-step-content">
              <h4>আবেদন জমা দিন</h4>
              <p>আবেদনটি সম্পন্ন করুন এবং প্রয়োজনীয় তথ্য ও কাগজপত্র জমা দিন।</p>
            </div>
          </div>
          <div class="ref-step-item">
            <span class="ref-step-num">০৩</span>
            <div class="ref-step-content">
              <h4>আবেদন যাচাই</h4>
              <p>জেলা লিগ্যাল এইড আপনার আবেদন ও প্রয়োজনীয় তথ্য যাচাই করবে।</p>
            </div>
          </div>
          <div class="ref-step-item">
            <span class="ref-step-num">০৪</span>
            <div class="ref-step-content">
              <h4>আইনি সহায়তা নিন</h4>
              <p>আপনার প্রয়োজন ও যোগ্যতা অনুযায়ী আইনগত পরামর্শ, মধ্যস্থতা, আইনজীবী ও আদালত-সংক্রান্ত সহায়তা পাবেন।</p>
            </div>
          </div>
          <div class="ref-step-item">
            <span class="ref-step-num">০৫</span>
            <div class="ref-step-content">
              <h4>আবেদনের অগ্রগতি দেখুন</h4>
              <p>আপনার আবেদন বা মামলার অগ্রগতি সম্পর্কে আপডেট থাকুন এবং পরবর্তী করণীয় সম্পর্কে জানুন।</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ৬. আপনার আইনি সহায়তার বর্তমান আপডেট (Tracking Layout) -->
  <section class="ref-section-alt">
    <div class="container">
      <div class="ref-track-wrap">
        <div>
          <div class="ref-track-photo-box">
            <img src="/img/tracking_citizen.jpg" alt="আইনি সহায়তা প্রার্থী নাগরিক" loading="lazy">
          </div>
          <h2 class="sec-heading-serif" style="margin-top:1.5rem">আপনার আইনি সহায়তার বর্তমান আপডেট</h2>
          <p style="color:#64748B;font-size:1rem;margin-top:6px">যেকোনো সময় আপনার আবেদন বা মামলার বর্তমান অবস্থা দেখুন।</p>
        </div>

        <div class="ref-card-box">
          <h3>আবেদন ট্র্যাক করুন</h3>
          <p style="font-size:0.86rem;color:#64748B;margin-bottom:1.2rem">
            আপনার রসিদে লেখা মামলা নম্বর ও মোবাইলের শেষ ৪ সংখ্যা দিয়ে লাইভ অগ্রগতি জানুন
          </p>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">মামলা নম্বর *</label>
              <input id="trackAppId" value="APP-2026-0001" placeholder="যেমন DLAS-NET-2026-04417 বা APP-2026-0001" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
              <small style="color:#94A3B8;display:block;margin-top:3px">আপনার রসিদে লেখা থাকে এবং এসএমএসে পাঠানো হয়</small>
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">মোবাইল নম্বর *</label>
              <input id="trackPhone" value="01711223344" placeholder="01XXXXXXXXX" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
              <small style="color:#94A3B8;display:block;margin-top:3px">আবেদন করার সময় যে মোবাইল নম্বরটি ব্যবহার করেছেন</small>
            </div>
            <div class="field">
              <label style="font-size:0.86rem;font-weight:600;margin-bottom:4px;display:block">ফোন নম্বর বা এনআইডির শেষ ৪ সংখ্যা *</label>
              <input id="trackLast4" value="3344" maxlength="4" placeholder="৭৮৯০" style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:8px">
              <small style="color:#94A3B8;display:block;margin-top:3px">আবেদনের সময় যে নম্বরটি দিয়েছিলেন</small>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button type="button" class="chip-ref-demo" style="background:#E2E8F0;color:#0F172A;border:none" onclick="fillHomeTrack('APP-2026-0001','01711223344','3344')">ডেমো: APP-2026-0001</button>
              <button type="button" class="chip-ref-demo" style="background:#E2E8F0;color:#0F172A;border:none" onclick="fillHomeTrack('DLAS-NET-2026-04420','01711223344','3344')">ডেমো: DLAS-NET-2026-04420</button>
            </div>
            <button class="btn-ref-submit" id="trackSearchBtn" type="button">আবেদনের অবস্থা দেখুন</button>
            <div id="trackHomeResult"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ৭. আপনার সুবিধামতো আইনি সহায়তা নিন (The 5 Doors) -->
  <section class="ref-section">
    <div class="container">
      <div class="sec-header-split">
        <div>
          <h2 class="sec-heading-serif">আপনার সুবিধামতো আইনি সহায়তা নিন</h2>
        </div>
        <div>
          <p class="sec-heading-desc">
            অনলাইনে আবেদন করতে পারছেন না বা সরাসরি সহায়তা প্রয়োজন? আপনার সুবিধামতো বিভিন্ন মাধ্যমে আইনি সহায়তা ও প্রয়োজনীয় তথ্য নিন।
          </p>
        </div>
      </div>

      <div class="ref-doors-grid">
        <a class="ref-door-card" href="tel:16699">
          <div class="ref-door-icon">📞</div>
          <h4>ফোন কলের মাধ্যমে</h4>
          <p>আইনি সহায়তা সম্পর্কে তথ্য, পরামর্শ বা আপনার আবেদন নিয়ে সহায়তা পেতে হেল্পলাইনে কথা বলুন।</p>
          <span class="ref-door-link">কল করুন ১৬৬৯৯ ›</span>
        </a>

        <a class="ref-door-card" href="#/offices">
          <div class="ref-door-icon">🏢</div>
          <h4>লিগ্যাল এইড অফিস</h4>
          <p>আপনার নিকটস্থ লিগ্যাল এইড অফিসে গিয়ে সরাসরি প্রয়োজনীয় তথ্য ও সহায়তা নিন।</p>
          <span class="ref-door-link">কার্যালয় খুঁজুন ›</span>
        </a>

        <a class="ref-door-card" href="#/help">
          <div class="ref-door-icon">🏛️</div>
          <h4>ইউডিসি সহায়তা</h4>
          <p>আপনার নিকটস্থ ইউনিয়ন ডিজিটাল সেন্টারে (UDC) গিয়ে DLAS-এর মাধ্যমে আইনি সহায়তা নিন।</p>
          <span class="ref-door-link">নিকটস্থ ইউডিসি ›</span>
        </a>

        <a class="ref-door-card" href="#/call">
          <div class="ref-door-icon">#️⃣</div>
          <h4>IVR / সাধারণ ফোন</h4>
          <p>স্মার্টফোন বা ইন্টারনেট ছাড়াই ১৬৬৯৯ নম্বরে কল করে আইনি তথ্য ও নির্ধারিত সেবা সম্পর্কে জানুন।</p>
          <span class="ref-door-link">বিস্তারিত ›</span>
        </a>

        <a class="ref-door-card" href="javascript:void(0)" onclick="window.__chatOpen && window.__chatOpen()">
          <div class="ref-door-icon">🤖</div>
          <h4>AI-এর সহায়তা নিন</h4>
          <p>স্মার্টফোন বা ইন্টারনেটের মাধ্যমে AI সহকারীর সাহায্যে সাধারণ আইনি তথ্য, দিকনির্দেশনা ও সেবা জানুন।</p>
          <span class="ref-door-link">স্মার্ট সহকারী ›</span>
        </a>
      </div>

      <div style="margin-top:2rem;background:#F8FAF9;border:1px solid #E5E7EB;border-radius:12px;padding:22px;display:flex;align-items:flex-start;gap:14px">
        <span style="font-size:24px">🔒</span>
        <div>
          <strong style="color:#0F172A;font-size:1.05rem">প্রাইভেট ও নিরাপদ</strong>
          <p style="color:#64748B;font-size:0.92rem;margin-top:4px;line-height:1.55">
            আইনি সহায়তা চাওয়া সম্পূর্ণ গোপনীয়। আপনার তথ্য কেবল আপনার আবেদনটি দেখছেন এমন দায়িত্বপ্রাপ্ত লিগ্যাল এইড অফিসাররাই দেখেন, বিপরীত পক্ষকে কখনো কোনো তথ্য বা নোটিশ জানানো হয় না।
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ৮. আপনার কি কোনো প্রশ্ন আছে? (Interactive FAQ Accordion) -->
  <section class="ref-faq-section">
    <div class="container">
      <div class="ref-faq-grid">
        <div>
          <h2 style="font-family:'Noto Serif Bengali',serif;font-size:clamp(2rem,3vw,2.7rem);color:#FFF;line-height:1.25">
            আপনার কি কোনো প্রশ্ন আছে?
          </h2>
          <p style="color:#A7F3D0;font-size:1.05rem;margin-top:14px;line-height:1.6">
            প্রয়োজনীয় আইনি সহায়তা সম্পর্কে সচরাচর প্রশ্ন এবং উত্তর
          </p>
        </div>

        <div class="ref-accordion" id="refFaqAccordion">
          <div class="ref-faq-item open">
            <div class="ref-faq-header">
              <span>এই সেবা কি সত্যিই বিনামূল্যে?</span>
              <span class="ref-faq-arrow">▼</span>
            </div>
            <div class="ref-faq-body">
              হ্যাঁ। আইনি সহায়তায় আপনার কোনো খরচ নেই — আবেদন ফি নেই, আইনজীবীর ফি নেই, কোর্ট ফি নেই। রাষ্ট্র সম্পূর্ণ খরচ বহন করে। কেউ এই সেবার জন্য টাকা চাইলে ১৬৬৯৯-এ জানান।
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>আমার তথ্য কি গোপন থাকবে?</span>
              <span class="ref-faq-arrow">▼</span>
            </div>
            <div class="ref-faq-body">
              সম্পূর্ণ গোপন থাকবে। Five Doors, One Record প্রযুক্তিতে আপনার আবেদন ও ব্যক্তিগত তথ্য সুরক্ষিত ডাটাবেজে এনক্রিপ্টেড থাকে এবং বিপরীত পক্ষকে কখনোই কোনো নোটিশ দেখানো হয় না।
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>আমার কাছে স্মার্টফোন নেই, তাহলে কীভাবে আবেদন করব?</span>
              <span class="ref-faq-arrow">▼</span>
            </div>
            <div class="ref-faq-body">
              আপনি যেকোনো সাধারণ বাটন ফোন থেকে টোল-ফ্রি ১৬৬৯৯ নম্বরে কল করে কথা বলতে পারেন অথবা নিকটস্থ ইউনিয়ন ডিজিটাল সেন্টারে (UDC) গিয়ে উদ্যোক্তার সহায়তায় আবেদন করতে পারেন।
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>আমি কি ইউনিয়ন ডিজিটাল সেন্টার থেকে সাহায্য পেতে পারি?</span>
              <span class="ref-faq-arrow">▼</span>
            </div>
            <div class="ref-faq-body">
              হ্যাঁ, দেশের সব ইউনিয়ন ডিজিটাল সেন্টারের উদ্যোক্তারা DLAS পোর্টালে সরাসরি সাধারণ নাগরিকদের আবেদন দাখিল ও ট্র্যাকিংয়ে সাহায্য করেন।
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>সিদ্ধান্ত না মানলে কী হবে?</span>
              <span class="ref-faq-arrow">▼</span>
            </div>
            <div class="ref-faq-body">
              মধ্যস্থতা (ADR) উভয় পক্ষের সম্মতির ভিত্তিতে হয়। যদি কোনো পক্ষ সম্মত না হয়, তাহলে আদালতে বিনামূল্যে পূর্ণাঙ্গ মামলা লড়ার জন্য রাষ্ট্রীয় খরচে প্যানেল আইনজীবী নিয়োগ করা হয়।
            </div>
          </div>

          <div class="ref-faq-item">
            <div class="ref-faq-header">
              <span>কত সময় লাগে?</span>
              <span class="ref-faq-arrow">▼</span>
            </div>
            <div class="ref-faq-body">
              প্রাথমিক স্ক্রিনিং ৩ কার্যদিবসের মধ্যে সম্পন্ন হয় এবং জরুরি নির্যাতন বা বিনা বিচারে আটক সংক্রান্ত আবেদন ২৪ ঘণ্টার মধ্যে অগ্রাধিকার ভিত্তিতে নিষ্পত্তি করা হয়।
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ৯. ৬৪ জেলা লিগ্যাল এইড অফিস ও ট্রাইব্যুনাল (District Map & Directory) -->
  <section class="ref-section">
    <div class="container">
      <div class="sec-header-split">
        <div>
          <h2 class="sec-heading-serif">৬৪ জেলা লিগ্যাল এইড অফিস ও ট্রাইব্যুনাল</h2>
        </div>
        <div>
          <p class="sec-heading-desc">
            আপনার জেলার লিগ্যাল এইড অফিসের সরাসরি ফোন নম্বর, কোর্টের অবস্থান এবং দায়িত্বরত কর্মকর্তার তথ্য খুঁজুন।
          </p>
        </div>
      </div>
      <div class="office-finder">
        <div>
          <div class="search-bar" style="margin:0 0 1rem">
            <input id="offQ" placeholder="জেলার নাম লিখুন — যেমন: ঢাকা, কুমিল্লা, চট্টগ্রাম, খুলনা, সিলেট, জয়পুরহাট…">
          </div>
          <div class="office-list" id="homeOffices"></div>
        </div>
        <div id="map"></div>
      </div>
    </div>
  </section>

  <!-- ১০. প্রোভাইডার ও কর্মকর্তা কনসোল ব্যানার -->
  <section class="section" style="background:#003628;color:#fff;padding:45px 0">
    <div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px">
      <div style="max-width:700px">
        <span class="badge warn" style="margin-bottom:8px">🏛️ কর্মকর্তা ও প্রোভাইডার লগইন</span>
        <h2 style="color:#FFF;margin-bottom:8px;font-size:1.6rem">জেলা কর্মকর্তা, প্যানেল আইনজীবী ও মধ্যস্থতাকারী কনসোল</h2>
        <p style="color:rgba(255,255,255,0.85);font-size:0.92rem">
          DLAO অফিসার, মধ্যস্থতাকারী, আইনজীবী, ইউডিসি অপারেটর ও হেল্পলাইন এজেন্টের জন্য সমন্বিত কার্যব্যবস্থা। ডেমো পিন: <strong>1234</strong>
        </p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a href="#/console" class="btn btn-gold btn-lg">🛠️ প্রোভাইডার কনসোলে প্রবেশ →</a>
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
      `<div class="empty-state" style="padding:1.5rem;text-align:center">কোনো অফিস পাওয়া যায়নি</div>`;
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
      box.innerHTML = `<div class="badge danger" style="padding:8px 12px;margin-top:12px;display:block">অনুগ্রহ করে আবেদন আইডি ও শেষ ৪ সংখ্যা দিন</div>`;
      return;
    }
    box.innerHTML = `<div style="padding:12px;color:#64748B;font-size:0.9rem">যাচাই করা হচ্ছে…</div>`;
    const r = await apiPost('track', { appId: id, last4 });
    if (r.error) {
      box.innerHTML = `<div class="badge danger" style="padding:8px 12px;margin-top:12px;display:block">❌ ${esc(r.error)}</div>`;
      return;
    }
    box.innerHTML = `
      <div style="background:#F8FAF9;border-radius:12px;padding:16px;margin-top:14px;border:1px solid #05513A">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="color:#05513A;font-size:1.1rem">ধাপ ${bnNum(r.stage + 1)}: ${esc(r.stageLabel)}</strong>
          ${r.emergency ? '<span class="badge warn">জরুরি</span>' : '<span class="badge success">সক্রিয়</span>'}
        </div>
        ${r.nextStep ? `<p style="font-size:0.9rem;color:#1E293B;margin-bottom:8px">🎯 <strong>পরবর্তী পদক্ষেপ:</strong> ${esc(r.nextStep)}</p>` : ''}
        ${(r.headsUp && r.headsUp.length) ? `<ul style="font-size:0.85rem;color:#64748B;padding-left:18px;margin:6px 0">${r.headsUp.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
          <small style="color:#64748B">আইডি: ${esc(r.appId)}</small>
          <a href="#/track?id=${encodeURIComponent(id)}" class="btn btn-outline btn-sm">বিস্তারিত টাইমলাইন →</a>
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
          <strong>✅ আপনি অগ্রাধিকার ভিত্তিতে ১০০% বিনামূল্যে আইনি সহায়তার যোগ্য!</strong>
          <p style="margin-top:4px;font-size:0.84rem;color:#1E293B">সরকারি নীতিমালা অনুযায়ী এই ক্যাটাগরির নাগরিকগণ আয়ের শর্ত ব্যতিরেকেই সরকারি খরচে আইনজীবী ও মধ্যস্থতা পাবেন।</p>
          <a href="#/apply" class="btn btn-primary btn-sm" style="margin-top:8px;display:inline-block">আবেদন করুন →</a>
        </div>`;
    } else if (inc <= 150000) {
      res.innerHTML = `
        <div style="background:#E8F5EF;border:1px solid #05513A;border-radius:8px;padding:12px;color:#05513A;font-size:0.92rem">
          <strong>✅ আপনি সরকারি খরচে বিনামূল্যে আইনি সহায়তা পাওয়ার যোগ্য!</strong>
          <p style="margin-top:4px;font-size:0.84rem;color:#1E293B">আপনার বার্ষিক আয় (৳${bnNum(inc)}) সরকারি আইনি সহায়তা প্রাপ্তির সাধারণ সীমার মধ্যে রয়েছে।</p>
          <a href="#/apply" class="btn btn-primary btn-sm" style="margin-top:8px;display:inline-block">আবেদন করুন →</a>
        </div>`;
    } else {
      res.innerHTML = `
        <div style="background:#FEF3C7;border:1px solid #D97706;border-radius:8px;padding:12px;color:#92400E;font-size:0.92rem">
          <strong>⚖️ বিশেষ বিবেচনায় আবেদন পর্যালোচনা করা হবে</strong>
          <p style="margin-top:4px;font-size:0.84rem;color:#1E293B">বার্ষিক আয় সাধারণ সীমার বেশি হলেও মামলার ব্যয়ভার ও বিশেষ পারিবারিক পরিস্থিতি বিবেচনায় জেলা আইন কর্মকর্তা অনুমোদন দিতে পারেন।</p>
          <a href="#/apply" class="btn btn-outline btn-sm" style="margin-top:8px;display:inline-block">যাচাইয়ের আবেদন →</a>
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

// ---------- সেবাসমূহ পেজ ----------
async function pageServices() {
  app.innerHTML = `
  <div class="container page-head">
    <span class="section-tag">সরকারি আইনি সেবা</span>
    <h1>⚖️ জাতীয় লিগ্যাল এইড সেবাসমূহ</h1>
    <p>আইনগত সহায়তা প্রদান আইন ২০০০-এর অধীনে অসচ্ছল ও সুবিধা-বঞ্চিত নাগরিকদের জন্য সরকারি খরচে সকল আইনি প্রতিকার।</p>
  </div>
  <div class="container">
    <div class="services-grid" style="margin-bottom:2.5rem">
      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">💬</div>
          <div>
            <span class="service-tag-badge">পরামর্শ</span>
            <h3>বিনামূল্যে আইনি পরামর্শ</h3>
          </div>
        </div>
        <p>যেকোনো মামলা করার আগে আপনার অধিকার, আইনগত সুযোগ ও মামলার সম্ভাব্যতা নিয়ে জেলা লিগ্যাল এইড অফিস বা টোল-ফ্রি হেল্পলাইন ১৬৬৯৯-এ তাৎক্ষণিক পরামর্শ।</p>
        <a class="btn btn-outline btn-block" href="#/guide">আইনি পরামর্শ চান →</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">⚖️</div>
          <div>
            <span class="service-tag-badge">আইনজীবী নিয়োগ</span>
            <h3>সরকারি খরচে আইনজীবী নিয়োগ</h3>
          </div>
        </div>
        <p>আদালতে দেওয়ানি, ফৌজদারি ও পারিবারিক মোকদ্দমায় সম্পূর্ণ রাষ্ট্রীয় খরচে অভিজ্ঞ প্যানেল আইনজীবী নিয়োগ। কোনো ফি প্রদান করতে হবে না।</p>
        <a class="btn btn-primary btn-block" href="#/apply">আইনজীবী পেতে আবেদন →</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">🤝</div>
          <div>
            <span class="service-tag-badge">ADR</span>
            <h3>বিকল্প বিরোধ নিষ্পত্তি (ADR)</h3>
          </div>
        </div>
        <p>আদালতের বাইরে দুই পক্ষের সম্মতিতে আপস-মীমাংসার মাধ্যমে কম সময়ে ও বিনা খরচে বিরোধ নিষ্পত্তি। আদালতের ডিক্রির সমান মর্যাদা সম্পন্ন।</p>
        <a class="btn btn-outline btn-block" href="#/apply?purpose=mediation">মধ্যস্থতার আবেদন →</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">🛡️</div>
          <div>
            <span class="service-tag-badge">পারিবারিক</span>
            <h3>পারিবারিক ও দেনমোহর বিরোধ</h3>
          </div>
        </div>
        <p>যৌতুক, বিবাহবিচ্ছেদ, দেনমোহর আদায়, নাবালক সন্তানের অভিভাবকত্ব ও পারিবারিক ভরণপোষণ আদায়ে বিশেষ আইনি সেল।</p>
        <a class="btn btn-outline btn-block" href="#/topic/family">পারিবারিক সমাধান →</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">📜</div>
          <div>
            <span class="service-tag-badge">ভূমি</span>
            <h3>ভূমি ও সম্পত্তি বিরোধ প্রতিকার</h3>
          </div>
        </div>
        <p>জমি জবরদখল, ভুয়া দলিল, খতিয়ান সংশোধন, নামজারি ও উত্তরাধিকার সম্পত্তি বণ্টনের বিরোধে আইনি সহায়তা।</p>
        <a class="btn btn-outline btn-block" href="#/topic/land">ভূমি অধিকার দেখুন →</a>
      </div>

      <div class="service-card">
        <div class="service-head">
          <div class="service-icon-box">🚨</div>
          <div>
            <span class="service-tag-badge">কারা অধিকার</span>
            <h3>কারাবন্দী ও জামিন সহায়তা</h3>
          </div>
        </div>
        <p>আটক বিচারাধীন বন্দীদের জামিন আবেদন ও আইনজীবী নিয়োগের জন্য জেলখানা পরিদর্শনের ব্যবস্থা ও বিশেষাধিকার সেল।</p>
        <a class="btn btn-gold btn-block" href="#/apply?emergency=true">জরুরি জামিন আবেদন →</a>
      </div>
    </div>
  </div>`;
}

// ---------- যোগ্যতা যাচাই পেজ ----------
async function pageEligibility() {
  app.innerHTML = `
  <div class="container page-head">
    <span class="section-tag">আইনগত যোগ্যতা</span>
    <h1>✅ বিনামূল্যে আইনি সহায়তা পাওয়ার অধিকার যাচাই</h1>
    <p>আপনি বা আপনার পরিবার সরকারি অর্থায়নে বিনামূল্যে আইনি সহায়তা পাওয়ার যোগ্য কিনা তা ২ মিনিটে যাচাই করুন।</p>
  </div>
  <div class="container">
    <div class="eligibility-box" style="margin-bottom:3rem">
      <div class="eligibility-form">
        <div class="field">
          <label>আপনার নাগরিক শ্রেণি/বিবেচ্য বিষয়:</label>
          <select id="elPageGroup">
            <option value="general">সাধারণ অসচ্ছল নাগরিক</option>
            <option value="women_child">নির্যাতিতা/অসহায় নারী ও শিশু</option>
            <option value="disabled">প্রতিবন্ধী ব্যক্তি (শারীরিক/মানসিক)</option>
            <option value="prisoner">কারাবন্দী ও বিনা বিচারে আটক ব্যক্তি</option>
            <option value="freedom_fighter">অসচ্ছল বীর মুক্তিযোদ্ধা বা পরিবার</option>
            <option value="acid_victim">এসিডদগ্ধ বা পাচারের শিকার ব্যক্তি</option>
            <option value="garments_worker">শ্রমিক বা দিনমজুর (কর্মক্ষেত্রে ক্ষতিগ্রস্ত)</option>
          </select>
        </div>
        <div class="field">
          <label>পরিবারের মাসিক মোট আয় (টাকা):</label>
          <input type="number" id="elPageIncome" placeholder="যেমন: ১২০০০" value="12000" min="0">
        </div>
      </div>
      <div class="eligibility-result" id="elPageResult"></div>

      <div style="margin-top:2rem;border-top:1px solid var(--border);padding-top:1.5rem">
        <h3 style="font-size:1.15rem;margin-bottom:10px">আইনি সহায়তা নীতিমালা অনুযায়ী সরাসরি যোগ্যতার তালিকা:</h3>
        <ul style="color:var(--text-muted);font-size:0.92rem;line-height:1.7;padding-left:20px">
          <li>যেকোনো অসচ্ছল ব্যক্তি যার বাৎসরিক আয় ১,৮০,০০০ টাকার নিচে (অথবা সুপ্রীম কোর্টে ২,৪০,০০০ টাকার নিচে)।</li>
          <li>নারী ও শিশু নির্যাতন দমন আইনের আওতাধীন যেকোনো ভিকটিম নারী বা শিশু।</li>
          <li>প্রতিবন্ধী নাগরিক এবং মানবপাচার বা এসিড সন্ত্রাসের শিকার যেকোনো ব্যক্তি (আয়ের সীমা প্রযোজ্য নয়)।</li>
          <li>আদালতে বা কারাগারে আটক অসচ্ছল বিচারাধীন বা সাজাপ্রাপ্ত বন্দী।</li>
          <li>অসচ্ছল বীর মুক্তিযোদ্ধা ও বীরাঙ্গনাগণ।</li>
          <li>শ্রমিক যার চাকরি অন্যায়ভাবে বরখাস্ত হয়েছে বা ন্যায্য পাওনা থেকে বঞ্চিত।</li>
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
          <strong style="color:var(--gov-green)">✅ আপনি সম্পূর্ণ বিনামূল্যে সরকারি আইনি সহায়তার যোগ্য!</strong>
          <p>আইনি সহায়তা প্রদান আইন ২০০০ অনুযায়ী আপনার ক্যাটাগরির জন্য শতভাগ সরকারি খরচে সেবা নিশ্চিত করা হয়েছে।</p>
        </div>
        <a class="btn btn-primary" href="#/apply">আবেদন জমা দিন →</a>
      `;
    } else if (income <= 15000) {
      resBox.innerHTML = `
        <div class="result-text">
          <strong style="color:var(--gov-green)">✅ আপনি শতভাগ বিনামূল্যে সরকারি আইনি সহায়তা পাওয়ার যোগ্য!</strong>
          <p>আপনার মাসিক পারিবারিক আয় সরকারি আইনি সহায়তা প্রদান নীতিমালার মধ্যে রয়েছে।</p>
        </div>
        <a class="btn btn-primary" href="#/apply">আবেদন জমা দিন →</a>
      `;
    } else if (income <= 25000) {
      resBox.innerHTML = `
        <div class="result-text">
          <strong style="color:var(--gov-gold)">⚖️ আপনি সুপ্রীম কোর্ট লিগ্যাল এইড বা বিশেষ বিবেচনায় যোগ্য</strong>
          <p>আপনার আয় জেলা আদালতের সাধারণ সীমার কাছাকাছি, তবে বিশেষ ব্যয় বিবেচনায় লিগ্যাল এইড কমিটি অনুমোদন দিতে পারে।</p>
        </div>
        <a class="btn btn-gold" href="#/apply">যাচাইয়ের জন্য আবেদন করুন →</a>
      `;
    } else {
      resBox.innerHTML = `
        <div class="result-text">
          <strong>ℹ️ আয়ের সাধারণ সীমার উপরে — তবে বিশেষ বিবেচনায় আবেদন গ্রাহ্য হতে পারে</strong>
          <p>পরিবারের সদস্যদের চিকিৎসা ও নির্ভরতার ব্যয় বিবেচনায় কর্মকর্তা বিশেষ ছাড় দিতে পারেন।</p>
        </div>
        <a class="btn btn-outline" href="#/guide">বিকল্প গাইড দেখুন →</a>
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
    <p>🕘 ${esc(o.hours)}</p>
    <a class="office-phone" href="tel:${esc(o.phone)}">📞 ${esc(o.phone)}</a>
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
    <div class="news-img"><img src="${esc(n.img)}" alt="" loading="lazy" onerror="this.style.display='none';this.parentElement.style.fontSize='3rem';this.parentElement.innerHTML='📰'"></div>
    <div class="news-body">
      <span class="news-badge ${n.type}">${n.type === 'event' ? t('event') : t('news')}</span>
      <h3>${esc(n.title)}</h3>
      <div class="news-date">${t('posted')}: ${esc(n.date)}</div>
    </div>
  </a>`;
}

// ---------- টপিক পেজ ----------
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
        <small style="color:var(--brand)">${bnNum(count)}টি আর্টিকেল</small></span>
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
          <span class="topic-icon">${s.icon || (s.kind === 'form' ? '📄' : '📖')}</span>
          <span><h3>${esc(s.title)}</h3>
          ${s.desc ? `<p>${esc(s.desc)}</p>` : ''}
          <small style="color:var(--brand)">${s.kind === 'form' ? t('formBadge') : s.children ? bnNum(countAll(s.children)) + 'টি আইটেম' : t('readArt')}</small></span>
        </a>`).join('')}
    </div>
    <div class="quick-ans" style="margin-top:1.6rem">
      <strong>${t('needMoreHelp')}</strong>
      <p style="color:var(--muted);margin:.3rem 0 .7rem">${t('moreHelpBody')}</p>
      <a class="btn btn-primary btn-sm" href="#/guide">${t('useGuide')} →</a>
    </div>
  </div>`;
}

// সেকশন (folder) পেজ — সাব-সাব-আইটেম
async function pageSection(id) {
  // সব টপিকের সেকশনগুলোতে খুঁজি
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
          <p>${t('fillForm')} →</p>
        </a>`;
      }
      const a = BOOT.articles.find((x) => x.id === ch.id);
      return `<a class="art-card" href="#/article/${ch.id}">
        <h3>${esc(ch.title)}</h3>
        <p>${a ? esc(a.summary) : ''}</p>
        ${a ? `<div class="art-meta"><span>⏱ ${esc(a.read)}</span></div>` : ''}
      </a>`;
    }).join('')}
  </div></div>`;
}

// ---------- ফরম পেজ (input → generated output) ----------
async function pageForm(id) {
  const f = await apiGet('form', { id });
  if (!f || f.error) return pageTopics();
  app.innerHTML = `
  <div class="container page-head">
    <div class="breadcrumb"><a href="#/topics">${t('navLibrary')}</a> / ${esc(f.title)}</div>
    <h1>📄 ${esc(f.title)}</h1>
    ${f.law ? `<p>📜 আইন: ${esc(f.law)}</p>` : ''}
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
      e.textContent = 'প্রয়োজনীয় ঘর পূরণ করুন: ' + missing.join(', ');
      e.classList.remove('hidden');
      return;
    }
    $('#formErr').classList.add('hidden');
    const today = new Date().toLocaleDateString('bn-BD');
    let out = `তারিখ: ${today}\n\n`;
    out += `বিষয়: ${f.title}\n`;
    if (f.law) out += `আইন: ${f.law}\n`;
    out += `\n${'—'.repeat(24)}\n\n`;
    for (const fd of f.fields) out += `${fd.label}: ${vals[fd.id] || '—'}\n`;
    out += `\n${'—'.repeat(24)}\n\n`;
    out += `আবেদনকারী/নোটিশদাতা\nস্বাক্ষর: ______________\n\n`;
    out += `(সংশ্লিষ্ট অফিসে জমা দেওয়ার আগে পড়ে নিন। এই নোটিশ/আবেদনটি সহায়তার জন্য তৈরি — আইনি পরামর্শ নয়।)`;
    $('#formOut').innerHTML = `
      <h2 style="margin-top:1.6rem">✅ আপনার ${t('formBadge')} তৈরি হয়েছে</h2>
      <div class="output-doc" id="outDoc">${esc(out)}</div>
      <div class="output-actions">
        <button class="btn btn-outline" id="outCopy">📋 ${t('printCopy')}</button>
        <a class="btn btn-primary" href="#/apply">${t('ctaApply')} →</a>
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
    if (b.warn) return `<div class="warn">⚠️ ${esc(b.warn)}</div>`;
    return '';
  }).join('');
  const related = BOOT.articles.filter((x) => x.topic === a.topic && x.id !== a.id).slice(0, 3);
  app.innerHTML = `
  <div class="container page-head article-wrap">
    <div class="breadcrumb"><a href="#/topics">${t('navLibrary')}</a> / <a href="#/topic/${esc(a.topic)}">${esc(cat?.title || '')}</a></div>
    <h1>${esc(a.title)}</h1>
    <div class="article-meta"><span>${t('updated')}: ${esc(a.updated)}</span><span>⏱ ${t('read')}: ${esc(a.read)}</span></div>
    <p><strong>${esc(a.summary)}</strong></p>
    ${bodyHtml}
    <div class="quick-ans">
      <strong>এই বিষয়ে সাহায্য দরকার?</strong>
      <p style="margin:.4rem 0 .8rem;color:var(--muted)">আবেদন করুন — যোগ্য হলে বিনামূল্যে আইনজীবী ও মধ্যস্থতা পাবেন।</p>
      <a class="btn btn-primary btn-sm" href="#/apply">${t('ctaApply')}</a>
      <a class="btn btn-outline btn-sm" href="tel:16699" style="margin-left:.5rem">📞 ১৬৬৯৯</a>
    </div>
    ${related.length ? `<h2 style="margin-top:2rem">${t('relatedArt')}</h2>
      <div class="art-grid" style="margin-top:1rem">${related.map((r) => `<a class="art-card" href="#/article/${r.id}"><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p></a>`).join('')}</div>` : ''}
  </div>`;
}

// ---------- গাইড উইজার্ড ----------
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
    <div class="container page-head"><h1>🧭 ${t('navGuide')}</h1><p>${t('guideLead')}</p></div>
    <div class="container"><div class="form-card">
      <div class="wizard-steps">
        ${[1, 2, 3].map((i) => `<div class="wstep ${i === guideState.q ? 'active' : i < guideState.q ? 'done' : ''}">${bnNum(i)}</div>`).join('')}
      </div>
      <h2 style="margin-bottom:1rem">${esc(step.title)}</h2>
      ${step.options.map((o, i) => `<button class="guide-option" data-i="${i}">${esc(o.label)}</button>`).join('')}
      <div class="wizard-actions">
        ${guideState.q > 1 ? `<button class="btn btn-ghost" id="gBack">← ${t('guideBack')}</button>` : '<span></span>'}
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
  <div class="container page-head"><h1>🎯 ${t('guideResult')}</h1></div>
  <div class="container"><div class="form-card" style="max-width:760px">
    ${r.topic ? `<div class="section-eyebrow">${r.topic.icon} ${esc(r.topic.title)}</div>` : ''}
    ${r.eligibility ? `<div class="quick-ans"><strong>${esc(r.eligibility.title)}</strong><p style="color:var(--muted)">${esc(r.eligibility.sub)}</p></div>` : ''}
    <p style="margin:1rem 0">${esc(r.next)}</p>
    ${r.articles.length ? `<h3>${t('guideReadArt')}</h3>
      <div class="art-grid" style="margin-top:.8rem">${r.articles.map((a) => `<a class="art-card" href="#/article/${a.id}"><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p></a>`).join('')}</div>` : ''}
    <div class="wizard-actions">
      <button class="btn btn-ghost" id="gRestart">↺ ${t('guideRestart')}</button>
      <a class="btn btn-primary" href="#/apply">${t('ctaApply')} →</a>
    </div>
  </div></div>`;
  $('#gRestart').onclick = () => pageGuide();
}

// ---------- আবেদন ফরম ----------
async function pageApply() {
  const districts = Object.values(BOOT.mediationDistricts && BOOT.divisions ? BOOT.divisions : []).flat();
  const allDistricts = [...new Set(BOOT.offices.map((o) => o.district))];
  const state = { step: 1, data: {} };
  render();

  function render() {
    const steps = ['সমস্যা', 'পরিচয়', 'যোগাযোগ', 'আর্থ-সামাজিক', 'বিরোধী পক্ষ', 'যাচাই ও জমা'];
    app.innerHTML = `
    <div class="container page-head"><h1>📝 ${t('applyTitle')}</h1><p>${t('applyLead')}</p></div>
    <div class="container"><div class="form-card" style="max-width:720px">
      <div class="wizard-steps">${steps.map((s, i) => `<div class="wstep ${i + 1 === state.step ? 'active' : i + 1 < state.step ? 'done' : ''}">${bnNum(i + 1)}. ${s}</div>`).join('')}</div>
      <div id="stepBody"></div>
      <div class="wizard-actions">
        <button class="btn btn-ghost" id="aPrev" ${state.step === 1 ? 'style="visibility:hidden"' : ''}>← ${t('guideBack')}</button>
        <button class="btn btn-primary" id="aNext">${state.step === 6 ? '✓ জমা দিন' : t('guideNext') + ' →'}</button>
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
        <div class="field"><label>${'আপনার সমস্যা কোন ধরনের?'} <span class="req">*</span></label>
          <select id="f_caseType">${BOOT.caseTypes.map((c) => `<option value="${c.id}" ${d.caseType === c.id ? 'selected' : ''}>${esc(c.label)} — ${esc(c.desc)}</option>`).join('')}</select></div>
        <div class="field" style="margin-top:.9rem"><label>${'আপনার উদ্দেশ্য'}</label>
          <select id="f_purpose">
            <option value="new" ${d.purpose === 'new' ? 'selected' : ''}>নতুন মামলা/সমস্যা নিষ্পত্তি</option>
            <option value="mediation" ${d.purpose === 'mediation' ? 'selected' : ''}>মধ্যস্থতায় নিষ্পত্তি চাই</option>
            <option value="lawyer" ${d.purpose === 'lawyer' ? 'selected' : ''}>আইনজীবী ও আদালত সহায়তা</option>
            <option value="change-lawyer" ${d.purpose === 'change-lawyer' ? 'selected' : ''}>আইনজীবী পরিবর্তনের অনুরোধ (চলমান মামলায়)</option>
            <option value="advice" ${d.purpose === 'advice' ? 'selected' : ''}>শুধু পরামর্শ</option>
          </select></div>
        <div class="field" style="margin-top:.9rem"><label>${'জেলা'} <span class="req">*</span></label>
          <select id="f_district">${allDistricts.map((x) => `<option ${d.district === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
        <div class="field" style="margin-top:.9rem"><label>${'সমস্যার বিবরণ'} <span class="req">*</span></label>
          <textarea id="f_problem" placeholder="কী ঘটেছে, কবে থেকে, প্রতিপক্ষ কে — সংক্ষেপে লিখুন">${esc(d.problem || '')}</textarea></div>
        <label class="check-line" style="margin-top:.8rem"><input type="checkbox" id="f_emergency" ${d.emergency ? 'checked' : ''}> জরুরি আইনগত সহায়তা প্রয়োজন</label>
        <label class="check-line"><input type="checkbox" id="f_sensitive" ${d.sensitive ? 'checked' : ''}> এটি স্পর্শকাতর অভিযোগ (নির্যাতন/নিরাপত্তা ঝুঁকি) — সীমিত অ্যাক্সেসে রাখুন</label>`);
    } else if (state.step === 2) {
      stepHtml(`
        <div class="field"><label>${t('name')} <span class="req">*</span></label><input id="f_name" value="${esc(d.name || '')}"></div>
        <div class="form-grid" style="margin-top:.9rem">
          <div class="field"><label>${'লিঙ্গ'}</label><select id="f_gender"><option>পুরুষ</option><option>মহিলা</option><option>অন্য</option></select></div>
          <div class="field"><label>${'বয়স'}</label><input id="f_age" type="number" min="0" value="${esc(d.age || '')}"></div>
        </div>
        <div class="field" style="margin-top:.9rem"><label>${t('nid')}</label><input id="f_nid" value="${esc(d.nid || '')}" placeholder="১০/১৩/১৭ ডিজিট"></div>`);
    } else if (state.step === 3) {
      stepHtml(`
        <div class="field"><label>${t('phone')} <span class="req">*</span></label><input id="f_phone" value="${esc(d.phone || '')}" placeholder="${t('phonePh')}"><div class="hint">এই নম্বরেই আপডেট এসএমএস যাবে</div></div>
        <div class="field" style="margin-top:.9rem"><label>${t('email')}</label><input id="f_email" value="${esc(d.email || '')}"></div>
        <div class="field" style="margin-top:.9rem"><label>${'বর্তমান ঠিকানা'}</label><textarea id="f_addr" style="min-height:70px">${esc(d.addr || '')}</textarea></div>
        <div class="quick-ans" style="margin-top:1rem">
          <strong>📵 নিরাপদ যোগাযোগ (A1)</strong> — আপনার ফোন অন্য কেউ নিয়ন্ত্রণ করলে এখানে লিখুন; অফিস শুধু নিরাপদ নম্বরে, নিরপেক্ষ ভাষায় কথা বলবে।
        </div>
        <div class="form-grid" style="margin-top:.9rem">
          <div class="field"><label>নিরাপদ নম্বর (না দিলে উপরের ফোনই ধরা হবে)</label><input id="f_safe" value="${esc(d.safeNumber || '')}" placeholder="01XXXXXXXXX"></div>
          <div class="field"><label>যোগাযোগের নিরাপদ সময়</label><input id="f_window" value="${esc(d.window || '')}" placeholder="যেমন: সকাল ১১টা–দুপুর ১টা"></div>
        </div>
        <div class="field" style="margin-top:.9rem"><label>যে নম্বরে কল করা যাবে না (কমা দিয়ে আলাদা করুন)</label><input id="f_unsafe" value="${esc(d.unsafeNumbers || '')}" placeholder="018XXXXXXXX, 019XXXXXXXX"><div class="hint">এই নম্বরে রিং গেলে কল বিলম্বিত হবে ও লগ হবে — কারণসহ রেকর্ডে থাকবে</div></div>`);
    } else if (state.step === 4) {
      stepHtml(`
        <div class="form-grid">
          <div class="field"><label>${'পেশা'}</label><input id="f_occ" value="${esc(d.occ || '')}"></div>
          <div class="field"><label>${'মাসিক আয় (টাকা)'}</label><input id="f_income" type="number" min="0" value="${esc(d.income || '')}"></div>
        </div>
        <div class="field" style="margin-top:.9rem"><label>${'নির্ভরশীল সদস্য সংখ্যা'}</label><input id="f_deps" type="number" min="0" value="${esc(d.deps || '')}"></div>
        <div class="quick-ans" style="margin-top:1rem">
          <strong>যোগ্যতার সাধারণ সীমা:</strong> বার্ষিক আয় ১,৮০,০০০ টাকার নিচে হলে সাধারণত যোগ্য। নারী-শিশু, প্রতিবন্ধী, মুক্তিযোদ্ধা, বন্দী ও পাচার-এসিড নির্যাতনের শিকার সবসময় যোগ্য।
        </div>`);
    } else if (state.step === 5) {
      stepHtml(`
        <div class="field"><label>${'প্রতিপক্ষের নাম'}</label><input id="f_oppName" value="${esc(d.oppName || '')}"></div>
        <div class="form-grid" style="margin-top:.9rem">
          <div class="field"><label>${'প্রতিপক্ষের ধরন'}</label><select id="f_oppType">
            <option>ব্যক্তি</option><option>প্রতিষ্ঠান/কোম্পানি</option><option>সরকারি অফিস</option><option>অজানা</option>
          </select></div>
          <div class="field"><label>${'প্রতিপক্ষের ফোন (জানলে)'}</label><input id="f_oppPhone" value="${esc(d.oppPhone || '')}"></div>
        </div>
        <div class="quick-ans" style="margin-top:1rem"><strong>নোট:</strong> প্রতিপক্ষের তথ্য আপনার তথ্যের মতো সুরক্ষিত থাকবে এবং প্রতিপক্ষকে কখনো আপনার আবেদনের বিবরণ দেখানো হবে না।</div>`);
    } else {
      const d2 = state.data;
      stepHtml(`
        <h3>আপনার আবেদন যাচাই করুন</h3>
        <div class="quick-ans" style="margin-top:.8rem">
          <p><strong>ধরন:</strong> ${esc(BOOT.caseTypes.find((c) => c.id === d2.caseType)?.label || '')}</p>
          <p><strong>নাম:</strong> ${esc(d2.name || '—')} · <strong>ফোন:</strong> ${esc(d2.phone || '—')}</p>
          <p><strong>জেলা:</strong> ${esc(d2.district || '—')} · <strong>জরুরি:</strong> ${d2.emergency ? 'হ্যাঁ' : 'না'} · <strong>স্পর্শকাতর:</strong> ${d2.sensitive ? 'হ্যাঁ' : 'না'}</p>
        </div>
        <div class="quick-ans" style="margin-top:.8rem;border-color:var(--brand)"><strong>🆓 ফ্রি-সার্ভিস নোটিশ (B4):</strong> এই সেবা সম্পূর্ণ বিনামূল্যে — আবেদন ফি, আইনজীবীর ফি বা আদালত ফি কিছুই দিতে হবে না। কেউ টাকা চাইলে ১৬৬৯৯-এ জানান।</div>
        <label class="check-line" style="margin-top:1rem"><input type="checkbox" id="f_true"> আমি নিশ্চিত করছি উপরের সব তথ্য সঠিক</label>
        <div class="quick-ans" style="margin-top:1rem"><strong>আপনার তথ্য কীভাবে ব্যবহৃত হয়:</strong> শুধুমাত্র আপনার কেস সামলানো কর্মকর্তা দেখবেন; প্রতিপক্ষ কখনো নয়। নির্যাতন-সংক্রান্ত কেস "স্পর্শকাতর" হিসেবে আলাদা রাখা হয়।</div>
        <div id="applyErr" class="form-error hidden"></div>`);
    }
  }

  function collect() {
    const d = state.data;
    if (state.step === 1) {
      d.caseType = $('#f_caseType').value; d.purpose = $('#f_purpose').value;
      d.district = $('#f_district').value; d.problem = $('#f_problem').value.trim();
      d.emergency = $('#f_emergency').checked; d.sensitive = $('#f_sensitive').checked;
      if (!d.problem) { toast('সমস্যার বিবরণ লিখুন'); return false; }
    } else if (state.step === 2) {
      d.name = $('#f_name').value.trim(); d.gender = $('#f_gender').value; d.age = $('#f_age').value; d.nid = $('#f_nid').value.trim();
      if (!d.name) { toast('নাম লিখুন'); return false; }
    } else if (state.step === 3) {
      d.phone = $('#f_phone').value.trim(); d.email = $('#f_email').value.trim(); d.addr = $('#f_addr').value.trim();
      d.safeNumber = $('#f_safe').value.trim(); d.window = $('#f_window').value.trim(); d.unsafeNumbers = $('#f_unsafe').value.trim();
      if (!/^01\d{9}$/.test(d.phone)) { toast('সঠিক ১১ ডিজিটের ফোন নম্বর দিন (01XXXXXXXXX)'); return false; }
    } else if (state.step === 4) {
      d.occ = $('#f_occ').value.trim(); d.income = $('#f_income').value; d.deps = $('#f_deps').value;
    } else if (state.step === 5) {
      d.oppName = $('#f_oppName').value.trim(); d.oppType = $('#f_oppType').value; d.oppPhone = $('#f_oppPhone').value.trim();
    } else {
      if (!$('#f_true').checked) { toast('তথ্য সঠিক বলে নিশ্চিত করুন'); return false; }
    }
    return true;
  }

  async function submit() {
    const d = state.data;
    // B4: UDC রোলে লগইন থাকলে সহায়তাকারী রেকর্ড হয়
    if (ME && ME.role === 'udc') d.assistedBy = ME.name || 'UDC উদ্যোক্তা';
    // A1: সেফ-কন্টাক্ট স্ট্রাকচার
    if (d.safeNumber || d.unsafeNumbers || d.window) d.safeContact = { safeNumber: d.safeNumber, unsafeNumbers: (d.unsafeNumbers || '').split(',').map((s) => s.trim()).filter(Boolean), window: d.window };
    // A2: প্রতিনিধি (আবেদনকারীর বদলে অন্য কেউ জমা দিলে)
    if (d.repName) d.representation = { repName: d.repName, repPhone: d.repPhone, relation: d.repRelation, scope: 'intake-only' };
    const r = await apiPost('applications', d);
    if (!r.ok) { toast(r.error || t('errGeneric')); return; }
    app.innerHTML = `
    <div class="container page-head"><h1>✅ আপনার আবেদন জমা হয়েছে</h1></div>
    <div class="container"><div class="form-card" style="text-align:center">
      <p style="color:var(--muted)">${t('appId')}</p>
      <div style="font-size:1.7rem;font-weight:800;font-family:ui-monospace,monospace;color:var(--brand);margin:.4rem 0 1rem">${esc(r.appId)}</div>
      ${r.freeServiceNotice ? `<div class="quick-ans" style="text-align:left">🆓 ${esc(r.freeServiceNotice)}</div>` : ''}
      <div class="form-success" style="text-align:left;margin-top:.8rem">
        <strong>এরপর কী হবে?</strong>
        <ul style="margin:.6rem 0 0 1.2rem">${(r.nextSteps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>
      <div class="wizard-actions">
        <a class="btn btn-outline" href="#/track">${t('ctaTrack')}</a>
        <a class="btn btn-primary" href="#/">হোমে যান</a>
      </div>
    </div></div>`;
  }
}

// ---------- ট্র্যাক পেজ ----------
async function pageTrack() {
  const hash = location.hash || '';
  const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  const initialId = searchParams.get('id') || searchParams.get('appId') || '';
  const initialLast4 = searchParams.get('last4') || '';

  app.innerHTML = `
  <div class="container page-head">
    <span class="section-tag">রিয়েলটাইম অনুসন্ধান</span>
    <h1>📦 ${t('trackTitle')}</h1>
    <p>${t('trackLead')}</p>
  </div>
  <div class="container">
    <div class="form-card" style="max-width:720px">
      <div id="trackErr" class="form-error hidden"></div>
      
      <div class="field">
        <label>${t('appId')} <span class="req">*</span></label>
        <input id="t_id" value="${esc(initialId)}" placeholder="যেমন: APP-2026-0001 বা DLAS-NET-2026-04417" autocomplete="off">
        <div class="hint">${t('appIdHint')}</div>
      </div>
      
      <div class="field" style="margin-top:1.1rem">
        <label>${t('last4')} <span class="req">*</span></label>
        <input id="t_last4" value="${esc(initialLast4)}" maxlength="4" inputmode="numeric" placeholder="যেমন: 3344" autocomplete="off">
        <div class="hint">নিরাপত্তা যাচাইকরণ: নিবন্ধিত ফোন নম্বর বা জাতীয় পরিচয়পত্রের শেষ ৪ অঙ্ক</div>
      </div>

      <div style="margin-top:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:0.84rem;color:var(--text-muted)">
        <span>ডেমো রেকর্ড:</span>
        <button type="button" class="chip-demo" id="t_demo1" data-id="APP-2026-0001" data-last4="3344">APP-2026-0001 (ময়ূরী / ৩৩৪৪)</button>
        <button type="button" class="chip-demo" id="t_demo2" data-id="DLAS-NET-2026-04420" data-last4="3344">A1 Persona</button>
      </div>

      <div class="wizard-actions">
        <button class="btn btn-ghost" id="t_clear">${t('clear')}</button>
        <button class="btn btn-primary" id="t_go">
          <span>🔍</span> <span>${t('lookup')}</span>
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
    resultBox.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--text-muted)">অনুসন্ধান করা হচ্ছে…</div>`;

    const appId = ($('#t_id').value || '').trim();
    const last4 = ($('#t_last4').value || '').trim();

    if (!appId || !last4) {
      err.textContent = 'অনুগ্রহ করে আবেদন আইডি ও শেষ ৪ ডিজিট উভয়ই পূরণ করুন।';
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
            <span style="font-size:0.8rem;color:var(--text-muted);font-weight:600">আবেদন নম্বর</span>
            <div style="font-size:1.35rem;font-weight:800;color:var(--gov-green);font-family:monospace">${esc(r.appId)}</div>
            ${r.caseId ? `<div style="font-size:0.88rem;color:var(--gov-gold);font-weight:700">কেস নম্বর: ${esc(r.caseId)}</div>` : ''}
          </div>
          <div style="text-align:right">
            <span class="badge success" style="font-size:0.85rem">ধাপ ${bnNum(r.stage + 1)}: ${esc(r.stageLabel)}</span>
            ${r.emergency ? '<div style="margin-top:4px"><span class="badge warn">জরুরি অগ্রাধিকার</span></div>' : ''}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;margin-bottom:12px;font-size:0.88rem">
          <div><strong>আবেদনকারী:</strong> ${esc(r.applicantName || 'নাগরিক')}</div>
          <div><strong>অফিস:</strong> ${esc(r.office || 'জেলা লিগ্যাল এইড অফিস')}</div>
          <div><strong>মামলার ধরন:</strong> ${esc(r.caseType || 'সাধারণ')}</div>
          <div><strong>দাখিল তারিখ:</strong> ${esc(r.submitted ? new Date(r.submitted).toLocaleDateString('bn-BD') : '—')}</div>
        </div>

        ${r.nextStep ? `
          <div class="quick-ans" style="margin:10px 0;background:var(--surface);border-color:var(--gov-green)">
            🎯 <strong>পরবর্তী পদক্ষেপ:</strong> ${esc(r.nextStep)}
          </div>
        ` : ''}

        ${(r.headsUp && r.headsUp.length) ? `
          <div class="quick-ans" style="margin:10px 0;background:var(--surface);border-color:var(--gov-gold)">
            🔔 <strong>গুরুত্বপূর্ণ নির্দেশনা:</strong>
            <ul style="margin:6px 0 0 18px;font-size:0.88rem">
              ${r.headsUp.map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <h4 style="margin:1.4rem 0 0.8rem;font-size:1rem">প্রক্রিয়ার অগ্রগতি টাইমলাইন:</h4>
        <ul class="timeline">
          ${(r.stages || []).map((s, i) => `
            <li class="${s.done ? 'done' : ''} ${s.current ? 'current' : ''}">
              <div class="tl-dot">${s.done ? '✓' : bnNum(i + 1)}</div>
              <div class="tl-body">
                <strong>${esc(s.label)}</strong>
                ${s.current ? `<span>${t('currentStage')}</span>` : ''}
              </div>
            </li>
          `).join('')}
        </ul>

        <p style="color:var(--text-muted);font-size:0.84rem;margin-top:14px;border-top:1px solid var(--border);padding-top:10px">
          ℹ️ ${esc(r.note || 'সম্পূর্ণ বিবরণের জন্য নিকটবর্তী লিগ্যাল এইড অফিসে যোগাযোগ করুন অথবা টোল-ফ্রি ১৬৬৯৯-এ কল করুন।')}
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

// ---------- অফিস পেজ (Leaflet ম্যাপ) ----------
async function pageOffices() {
  app.innerHTML = `
  <div class="container page-head"><h1>🏢 ${t('officesTitle')}</h1><p>${t('officesBody')} ${t('mapHint')}</p></div>
  <div class="container">
    <div class="office-finder">
      <div>
        <div class="filter-row">
          <input id="offQ2" placeholder="${t('officesSearchPh')}" style="flex:1">
          <select id="offDiv"><option value="">সব বিভাগ</option>${BOOT.divisions.map((d) => `<option>${esc(d)}</option>`).join('')}</select>
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

// ---------- নিউজ পেজ ----------
async function pageNews() {
  app.innerHTML = `
  <div class="container page-head"><h1>📰 ${t('newsTitle')}</h1></div>
  <div class="container"><div class="news-grid">${BOOT.news.map(newsCard).join('')}</div></div>`;
}

// নিউজ ডিটেইল — কেস বিবরণসহ
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
      <a class="btn btn-outline btn-sm" href="tel:16699" style="margin-left:.4rem">📞 ${t('callNow')}</a>
    </div>
  </div>`;
}

// ---------- সার্চ ----------
async function pageSearch() {
  app.innerHTML = `
  <div class="container page-head"><h1>🔍 ${t('searchTitle')}</h1></div>
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
      ${arts.length ? `<h2>${t('navLibrary')} — আর্টিকেল</h2><div class="art-grid" style="margin:.8rem 0 1.4rem">${arts.map((a) => `<a class="art-card" href="#/article/${a.id}"><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p></a>`).join('')}</div>` : ''}
      ${offs.length ? `<h2>${t('navOffices')}</h2><div class="art-grid" style="margin:.8rem 0">${offs.slice(0, 6).map(officeCard).join('')}</div>` : ''}
      ${!cats.length && !arts.length && !offs.length ? `<div class="empty-state">${t('noResults')}</div>` : ''}`;
  };
  $('#sgo').onclick = doSearch;
  $('#sq').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
}

// ---------- সহায়তা ----------
async function pageHelp() {
  app.innerHTML = `
  <div class="container page-head"><h1>🤝 ${t('helpTitle')}</h1><p>${t('helpLead')}</p></div>
  <div class="container"><div class="help-cards" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
    <a class="help-card" href="#/help/call"><div class="hc-art">📞</div><h3>${t('hCallT')}</h3><p>${t('hCallB')}</p><span class="btn btn-primary btn-sm">বিস্তারিত দেখুন →</span></a>
    <a class="help-card" href="#/help/udc"><div class="hc-art">🏢</div><h3>${t('hUdcT')}</h3><p>${t('hUdcB')}</p><span class="btn btn-outline btn-sm">বিস্তারিত দেখুন →</span></a>
    <a class="help-card" href="#/help/ussd"><div class="hc-art">#️⃣</div><h3>${t('hUssdT')}</h3><p>${t('hUssdB')}</p><span class="btn btn-outline btn-sm">বিস্তারিত দেখুন →</span></a>
    <a class="help-card" href="#/help/ai"><div class="hc-art">🤖</div><h3>${t('hAiT')}</h3><p>${t('hAiB')}</p><span class="btn btn-outline btn-sm">বিস্তারিত দেখুন →</span></a>
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
      <h2>সাধারণ প্রশ্ন</h2>
      ${[
        ['এই সেবা কি সত্যিই ফ্রি?', 'হ্যাঁ। আবেদন ফি, আইনজীবীর ফি, আদালত ফি — কিছুই দিতে হবে না। কেউ টাকা চাইলে অভিযোগ ফরমে জানান।'],
        ['আমার তথ্য কি গোপন থাকবে?', 'হ্যাঁ। শুধু আপনার কেস সামলানো কর্মকর্তা দেখবেন। নির্যাতন-সংক্রান্ত কেস "স্পর্শকাতর" হিসেবে আলাদা থাকে।'],
        ['স্মার্টফোন নেই, আবেদন করব কীভাবে?', '১৬৬৯৯-এ কল করুন — অপারেটর ফোনেই ফরম পূরণ করবেন। অথবা ইউনিয়ন ডিজিটাল সেন্টারে যান।'],
        ['মধ্যস্থতার সিদ্ধান্ত মানতে চাই না কী হবে?', 'দুই পক্ষ সই না করলে সমঝোতা বাধ্যতামূলক নয় — তখন স্বাভাবিক আদালত প্রক্রিয়া চলবে।'],
        ['কত সময় লাগে?', 'কর্মকর্তা কয়েক কর্মদিবসে যাচাই করেন। মধ্যস্থতা আইনত ৬০ দিনে (৩০ দিন বাড়তি সম্ভব) শেষ হতে হয়।']
      ].map(([q, a]) => `<details style="margin-top:.7rem"><summary style="font-weight:700;cursor:pointer">${esc(q)}</summary><p style="margin-top:.4rem;color:var(--muted)">${esc(a)}</p></details>`).join('')}
    </div>
  </div>`;
}

// সহায়তা চ্যানেল বিস্তারিত পেজ
async function pageHelpChannel(ch) {
  const map = {
    call: { icon: '📞', title: t('callDeskTitle'), body: t('callDeskBody'),
      extra: `<h2 style="margin-top:1.4rem">${t('callPrepTitle')}</h2><ul style="margin:.5rem 0 0 1.2rem;display:flex;flex-direction:column;gap:.4rem;color:var(--muted)">
        <li>এনআইডি/জন্মনিবন্ধন নম্বর</li><li>সমস্যার সংক্ষিপ্ত বিবরণ (কবে থেকে, প্রতিপক্ষ কে)</li>
        <li>জেলা ও থানার নাম</li><li>আগের আবেদন থাকলে আবেদন আইডি</li></ul>`,
      action: `<div class="call-cta-row">
        <a class="btn btn-primary" href="tel:16699" style="font-size:1.1rem;padding:.9rem 1.6rem">📞 ${t('callNow')}: ১৬৬৯৯</a>
        <a class="btn btn-outline" href="#/call" style="font-size:1.1rem;padding:.9rem 1.6rem">📱 ইন্টারঅ্যাকটিভ ডেমো দেখুন</a>
      </div>
      <p style="color:var(--muted);margin-top:.6rem">বিদেশ থেকে: +৮৮০ ৯৬১২ ৩৯ ১৬৬৯৯</p>` },
    udc: { icon: '🏢', title: t('udcTitle'), body: t('udcBody'),
      extra: `<div class="quick-ans" style="margin-top:1.2rem"><strong>ইউডিসিতে যা নেবেন</strong>
        <ul style="margin:.5rem 0 0 1.2rem;color:var(--muted)"><li>এনআইডি/জন্মনিবন্ধন</li><li>সমস্যা সম্পর্কিত কাগজ (দলিল/কাবিননামা/রশিদ)</li><li>নিজের ফোন নম্বর</li></ul></div>`,
      action: `<a class="btn btn-primary" href="#/offices">${t('navOffices')} →</a>` },
    ussd: { icon: '#️⃣', title: t('ussdTitle'), body: t('ussdBody'),
      extra: `<h2 style="margin-top:1.4rem">ধাপে ধাপে</h2><ol style="margin:.5rem 0 0 1.2rem;display:flex;flex-direction:column;gap:.4rem;color:var(--muted)">
        <li>শর্টকোড ডায়াল করুন</li><li>ভাষা বেছে নিন (বাংলা/English)</li><li>মামলার ধরন বেছে নিন (১-৯)</li>
        <li>নাম ও এনআইডি লিখে পাঠান</li><li>এসএমএসে আবেদন আইডি পাবেন</li></ol>`,
      action: `<div class="call-cta-row">
        <a class="btn btn-outline" href="#/track">${t('ctaTrack')} →</a>
        <a class="btn btn-primary" href="#/call" style="background:#0f172a;border-color:#0f172a">📱 ইন্টারঅ্যাকটিভ মেনু দেখুন</a>
      </div>` },
    ai: { icon: '🤖', title: t('aiChanTitle'), body: t('aiChanBody'), extra: '',
      action: `<button class="btn btn-primary" onclick="document.getElementById('chatFab').click()">🤖 ${t('aiChanTitle')} খুলুন</button>` }
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
      <a class="btn btn-primary btn-sm" href="#/guide">${t('useGuide')} →</a>
    </div>
  </div>`;
}

// ---------- auth ----------
const DEMO_STAFF_ACCOUNTS = [
  { username: 'officer.joypurhat', name: 'রহিমা খাতুন', roleTitle: 'DLAO কর্মকর্তা (B1)', district: 'জয়পুরহাট', icon: '🏛️' },
  { username: 'lawyer.kabir', name: 'অ্যাডভ. কবির হোসেন', roleTitle: 'প্যানেল আইনজীবী', district: 'জয়পুরহাট', icon: '👨‍⚖️' },
  { username: 'mediator.joypurhat', name: 'নাসরিন সুলতানা', roleTitle: 'মধ্যস্থতাকারী (ADR)', district: 'জয়পুরহাট', icon: '⚖️' },
  { username: 'receiving.dhaka', name: 'তানভীর আহমেদ', roleTitle: 'গ্রহণকারী DLAO (B6)', district: 'ঢাকা', icon: '📥' },
  { username: 'udc.khagrachari', name: 'জয়ন্ত চাকমা', roleTitle: 'UDC উদ্যোক্তা (B4)', district: 'খাগড়াছড়ি', icon: '🏢' },
  { username: 'helpline.agent1', name: 'ফরিদ মিয়া', roleTitle: '১৬৬৯৯ এজেন্ট (B3)', district: 'জাতীয়', icon: '📞' },
  { username: 'officer.jhenaidah', name: 'মাহমুদুল হাসান', roleTitle: 'DLAO কর্মকর্তা', district: 'ঝিনাইদহ', icon: '🏛️' },
  { username: 'lawyer.shahana', name: 'অ্যাডভ. শাহানা আক্তার', roleTitle: 'প্যানেল আইনজীবী', district: 'জয়পুরহাট', icon: '👩‍⚖️' },
  { username: 'support.staff1', name: 'সালমা পারভীন', roleTitle: 'কেস-সহায়তা কর্মী', district: 'জয়পুরহাট', icon: '🤝' },
  { username: 'ripon.rep', name: 'রিপন আক্তার', roleTitle: 'মনোনীত প্রতিনিধি', district: 'জয়পুরহাট', icon: '🦯' },
  { username: 'admin', name: 'সিস্টেম প্রশাসক', roleTitle: 'সিস্টেম প্রশাসক', district: 'ঢাকা', icon: '⚙️' }
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
          <h1>🏛️ সরকারি লিগ্যাল এইড পোর্টাল</h1>
          <p>আইনগত সহায়তা ও সেবা ব্যবস্থাপনা — পদবী বা নাগরিক অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        <!-- Auth Tabs -->
        <div class="auth-tabs" role="tablist">
          <button class="auth-tab-btn ${activeTab === 'staff' ? 'active' : ''}" id="tabStaff" type="button">
            🏛️ কর্মকর্তা / প্রোভাইডার
          </button>
          <button class="auth-tab-btn ${activeTab === 'citizen' ? 'active' : ''}" id="tabCitizen" type="button">
            👤 নাগরিক অ্যাকাউন্ট
          </button>
          <button class="auth-tab-btn ${activeTab === 'door' ? 'active' : ''}" id="tabDoor" type="button">
            🚪 নাগরিক ডোর এক্সেস
          </button>
        </div>

        <div id="authErr" class="form-error hidden"></div>

        <!-- 1. Staff / Provider Login Tab -->
        <div id="panelStaff" class="${activeTab === 'staff' ? '' : 'hidden'}">
          <div class="auth-subnote">
            <strong>🔑 ১-ক্লিকে পদবী নির্বাচন (ডেমো পিন: ১২৩৪):</strong> নিচে আপনার পদবীতে ক্লিক করলে ইউজারনেম ও পিন স্বয়ংক্রিয় পূরণ হবে।
          </div>

          <!-- 6 Role Presets -->
          <div class="role-preset-grid">
            ${DEMO_STAFF_ACCOUNTS.slice(0, 6).map((a) => `
              <button class="role-preset-btn ${selectedUser === a.username ? 'selected' : ''}" type="button" data-user="${a.username}">
                <span class="r-icon">${a.icon}</span>
                <span class="r-body">
                  <span class="r-title">${esc(a.roleTitle)}</span>
                  <span class="r-user">${esc(a.name)} · ${esc(a.district)}</span>
                </span>
                <span class="r-pin">পিন: ১২৩৪</span>
              </button>
            `).join('')}
          </div>

          <div style="background:var(--surface-2);border-radius:12px;padding:1.1rem;border:1px solid var(--border);margin-top:.8rem">
            <div class="form-grid">
              <div class="field">
                <label>ব্যবহারকারী নাম (Username) <span class="req">*</span></label>
                <input id="s_user" value="${esc(selectedUser)}" placeholder="যেমন: officer.joypurhat">
              </div>
              <div class="field">
                <label>৪-সংখ্যার পিন (PIN) <span class="req">*</span></label>
                <input id="s_pin" type="password" value="1234" maxlength="8" placeholder="১২৩৪">
              </div>
            </div>
            <button class="btn btn-primary btn-block" id="s_go" style="margin-top:1.1rem;font-size:1.02rem">
              🔐 কর্মকর্তা কনসোলে প্রবেশ করুন →
            </button>
          </div>

          <!-- All 11 Accounts Accordion -->
          <details style="margin-top:1.2rem;font-size:.88rem;color:var(--muted)">
            <summary style="cursor:pointer;font-weight:600;padding:.4rem 0">
              📋 সকল ১১ জন কর্মকর্তা ও প্রতিনিধির পূর্ণ তালিকা দেখুন (ঝিনাইদহ, রিপন, প্রশাসন...)
            </summary>
            <div style="max-height:220px;overflow:auto;margin-top:.6rem">
              <table class="auth-demo-table">
                <thead>
                  <tr>
                    <th>অ্যাকাউন্ট আইডি</th>
                    <th>নাম ও পদবী</th>
                    <th>এলাকা</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  ${DEMO_STAFF_ACCOUNTS.map((a) => `
                    <tr class="clickable" data-user="${a.username}">
                      <td><code style="font-weight:700;color:var(--brand)">${esc(a.username)}</code></td>
                      <td>${a.icon} <strong>${esc(a.name)}</strong> (${esc(a.roleTitle)})</td>
                      <td>${esc(a.district)}</td>
                      <td><span class="auth-chip">নির্বাচন করুন</span></td>
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
            <strong>👤 নাগরিক অ্যাকাউন্ট লগইন:</strong> আপনার নিবন্ধিত মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করে আবেদনের সর্বশেষ অবস্থা জানুন বা নতুন আবেদন করুন।
          </div>
          <div class="field">
            <label>${t('phone')} <span class="req">*</span></label>
            <input id="c_phone" placeholder="01XXXXXXXXX" type="tel">
          </div>
          <div class="field" style="margin-top:.85rem">
            <label>${t('password')} <span class="req">*</span></label>
            <input id="c_pw" type="password" placeholder="আপনার পাসওয়ার্ড">
          </div>
          <button class="btn btn-primary btn-block" id="c_go" style="margin-top:1.2rem;font-size:1rem">
            ${t('login')} →
          </button>
          <div style="text-align:center;margin-top:1.2rem;padding-top:1rem;border-top:1px dashed var(--border)">
            <p style="color:var(--muted);font-size:.92rem;margin:0 0 .5rem">কোনো অ্যাকাউন্ট নেই?</p>
            <a class="btn btn-outline btn-sm" href="#/register">📝 বিনামূল্যে নতুন নাগরিক অ্যাকাউন্ট তৈরি করুন</a>
          </div>
        </div>

        <!-- 3. Citizen Door Verification Tab (No password) -->
        <div id="panelDoor" class="${activeTab === 'door' ? '' : 'hidden'}">
          <div class="auth-subnote">
            <strong>🚪 পাসওয়ার্ডবিহীন দ্রুত যাচাই (Citizen Door):</strong> আপনার আবেদন আইডি এবং নিবন্ধিত ফোন/এনআইডির শেষ ৪ অঙ্ক দিয়ে কোনো পাসওয়ার্ড ছাড়াই তৎক্ষণাৎ ট্র্যাক করুন।
          </div>
          <div style="margin-bottom:.9rem">
            <span class="auth-chip" id="doorFillDemo" title="ক্লিক করে ডেমো পূরণ করুন">
              💡 ডেমো নাগরিক: ময়ূরী আক্তার (আইডি: <strong>APP-2026-0001</strong>, শেষ ৪: <strong>3344</strong>)
            </span>
          </div>
          <div class="form-grid">
            <div class="field">
              <label>আবেদন রেফারেন্স আইডি <span class="req">*</span></label>
              <input id="d_appId" placeholder="APP-2026-0001" style="text-transform:uppercase">
            </div>
            <div class="field">
              <label>ফোন / এনআইডির শেষ ৪ অঙ্ক <span class="req">*</span></label>
              <input id="d_last4" placeholder="3344" maxlength="4">
            </div>
          </div>
          <div class="field" style="margin-top:.85rem">
            <label>প্রবেশের ভূমিকা</label>
            <select id="d_role">
              <option value="CITIZEN">নাগরিক (নিজে)</option>
              <option value="REPRESENTATIVE">মনোনীত প্রতিনিধি (রিপন)</option>
            </select>
          </div>
          <button class="btn btn-primary btn-block" id="d_go" style="margin-top:1.2rem;font-size:1rem">
            🚪 দরজা-যাচাই ও ট্র্যাকিং শুরু করুন →
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
          errEl.textContent = 'ব্যবহারকারী নাম এবং ৪-সংখ্যার পিন প্রদান করুন';
          errEl.classList.remove('hidden');
          return;
        }
        sGo.disabled = true;
        sGo.textContent = 'যাচাই করা হচ্ছে…';
        const r = await apiPost('login', { mode: 'staff', username: u, pin: p });
        sGo.disabled = false;
        sGo.textContent = '🔐 কর্মকর্তা কনসোলে প্রবেশ করুন →';
        if (r.error) {
          errEl.textContent = r.error;
          errEl.classList.remove('hidden');
          return;
        }
        ME = r.user;
        renderAuthLink();
        toast(`স্বাগতম, ${ME.name}!`);
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
          errEl.textContent = 'ফোন নম্বর ও পাসওয়ার্ড দিন';
          errEl.classList.remove('hidden');
          return;
        }
        cGo.disabled = true;
        cGo.textContent = 'প্রবেশ করা হচ্ছে…';
        const r = await apiPost('login', { phone, password: pw });
        cGo.disabled = false;
        cGo.textContent = t('login') + ' →';
        if (r.error) {
          errEl.textContent = r.error;
          errEl.classList.remove('hidden');
          return;
        }
        ME = r.user;
        renderAuthLink();
        toast(`স্বাগতম, ${ME.name}!`);
        location.hash = '#/dashboard';
      };
    }

    // Wire Door Demo Auto-Fill
    const fillBtn = $('#doorFillDemo');
    if (fillBtn) {
      fillBtn.onclick = () => {
        $('#d_appId').value = 'APP-2026-0001';
        $('#d_last4').value = '3344';
        toast('ময়ূরী আক্তারের ডেমো তথ্য পূরণ করা হয়েছে');
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
          errEl.textContent = 'আবেদন আইডি এবং শেষ ৪ অঙ্ক দিন';
          errEl.classList.remove('hidden');
          return;
        }
        dGo.disabled = true;
        dGo.textContent = 'যাচাই করা হচ্ছে…';
        const r = await apiPost('login', { mode: 'citizen_door', applicationId: appId, contactLast4: last4, citizenRole: role });
        dGo.disabled = false;
        dGo.textContent = '🚪 দরজা-যাচাই ও ট্র্যাকিং শুরু করুন →';
        if (r.error) {
          errEl.textContent = r.error;
          errEl.classList.remove('hidden');
          return;
        }
        if (r.user) ME = r.user;
        renderAuthLink();
        toast('নাগরিক দরজা সফলভাবে উন্মুক্ত হয়েছে');
        location.hash = '#/track?appId=' + encodeURIComponent(appId);
      };
    }
  }

  render();
}

async function pageRegister() {
  if (ME) return (location.hash = '#/dashboard');
  const districtList = (BOOT && BOOT.offices ? [...new Set(BOOT.offices.map((o) => o.district))] : ['জয়পুরহাট', 'ঢাকা', 'ঝিনাইদহ', 'খাগড়াছড়ি', 'চট্টগ্রাম']);

  app.innerHTML = `
  <div class="container auth-wrapper">
    <div class="auth-card-wide" style="max-width:620px;margin:0 auto">
      <div class="auth-header">
        <h1>📝 ${t('regTitle')}</h1>
        <p>${t('regLead')}</p>
      </div>

      <div id="authErr" class="form-error hidden"></div>

      <div class="field">
        <label>${t('name')} <span class="req">*</span></label>
        <input id="r_name" placeholder="আপনার পূর্ণ নাম লিখুন">
      </div>

      <div class="form-grid" style="margin-top:.85rem">
        <div class="field">
          <label>${t('phone')} <span class="req">*</span></label>
          <input id="r_phone" placeholder="01XXXXXXXXX" type="tel">
        </div>
        <div class="field">
          <label>জেলা (District) <span class="req">*</span></label>
          <select id="r_district">
            ${districtList.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="field" style="margin-top:.85rem">
        <label>${t('password')} <span class="req">*</span></label>
        <input id="r_pw" type="password" placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড">
        <div class="hint">পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে</div>
      </div>

      <div class="field" style="margin-top:.85rem">
        <label>${t('nid')} (ঐচ্ছিক)</label>
        <input id="r_nid" placeholder="১০ বা ১৭ ডিজিটের জাতীয় পরিচয়পত্র নম্বর">
      </div>

      <button class="btn btn-primary btn-block" id="r_go" style="margin-top:1.3rem;font-size:1.02rem">
        📝 নিবন্ধন সম্পন্ন করুন →
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
      errEl.textContent = 'নাম, ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন';
      errEl.classList.remove('hidden');
      return;
    }
    if (pw.length < 6) {
      errEl.textContent = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
      errEl.classList.remove('hidden');
      return;
    }

    const btn = $('#r_go');
    btn.disabled = true;
    btn.textContent = 'নিবন্ধন করা হচ্ছে…';

    const r = await apiPost('register', { name, phone, password: pw, district, nid });
    btn.disabled = false;
    btn.textContent = '📝 নিবন্ধন সম্পন্ন করুন →';

    if (r.error) {
      errEl.textContent = r.error;
      errEl.classList.remove('hidden');
      return;
    }

    ME = r.user;
    renderAuthLink();
    toast('অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।');
    location.hash = '#/dashboard';
  };
}

async function pageDashboard() {
  if (!ME) return (location.hash = '#/login');
  const r = await apiGet('applications');
  const apps = r.applications || [];
  const stageIcons = ['📝', '🔍', '👨‍⚖️', '🤝', '✅'];
  app.innerHTML = `
  <div class="container page-head">
    <div class="dash-hero">
      <div class="dash-avatar">${esc((ME.name || 'অ').trim()[0])}</div>
      <div>
        <h1>${t('dashTitle')}</h1>
        <p>স্বাগতম, <strong>${esc(ME.name)}</strong>! ${ME.phone ? '📞 ' + esc(ME.phone) : ''}</p>
      </div>
      <button class="btn btn-outline btn-sm" id="d_logout" style="margin-left:auto">${t('logout')}</button>
    </div>
  </div>
  <div class="container">
    <div class="dash-grid">
      <div class="stat-card"><h3>আমার আবেদন</h3><div class="stat-num">${bnNum(apps.length)}</div></div>
      <div class="stat-card"><h3>চলমান</h3><div class="stat-num">${bnNum(apps.filter((a) => a.stage < 4).length)}</div></div>
      <div class="stat-card"><h3>নিষ্পত্তি</h3><div class="stat-num">${bnNum(apps.filter((a) => a.stage >= 4).length)}</div></div>
      <div class="stat-card"><h3>জরুরি</h3><div class="stat-num">${bnNum(apps.filter((a) => a.emergency).length)}</div></div>
    </div>
    <div class="dash-head-row"><h2>${t('myApps')}</h2><a class="btn btn-primary btn-sm" href="#/apply">+ ${t('newApp')}</a></div>
    ${apps.length ? `<div class="myapps">${apps.map((a) => `
      <button class="app-card" data-app="${esc(a.appId)}">
        <span class="app-stage-icon">${stageIcons[a.stage] || '📝'}</span>
        <span class="app-main">
          <span class="app-id">${esc(a.appId)}</span>
          <span class="app-meta">${esc(a.caseType || 'সাধারণ')} ${a.district ? '· ' + esc(a.district) : ''} · ${t('submittedAt')}: ${new Date(a.createdAt).toLocaleDateString('bn-BD')}</span>
        </span>
        <span class="app-right">
          ${a.emergency ? '<span class="badge warn">জরুরি</span>' : ''}
          <span class="badge">${esc(BOOT.stages[a.stage]?.label || '')}</span>
          <span class="app-chevron">›</span>
        </span>
      </button>`).join('')}</div>` : `<div class="empty-state">${t('noApps')} <a href="#/apply">${t('newApp')} →</a></div>`}
    <div class="quick-ans" style="margin-top:1.6rem">
      <strong>📞 ফোনে সহায়তা নিন</strong>
      <p style="color:var(--muted);margin:.3rem 0 .7rem">অ্যাপ ছাড়াই ১৬৬৯৯ নম্বরে কল করে IVR ভয়েস মেনু থেকে সব সেবা নিন — ডেমো দেখুন।</p>
      <a class="btn btn-primary btn-sm" href="#/call">📞 কল সিমুলেটর চালান →</a>
    </div>
  </div>
  <div id="appModal" class="modal hidden">
    <div class="modal-box">
      <button class="modal-x" id="mClose">✕</button>
      <div id="mBody"></div>
    </div>
  </div>`;
  $('#d_logout').onclick = async () => {
    await apiPost('logout', {});
    ME = null; renderAuthLink(); location.hash = '#/'; toast('লগআউট হয়েছে');
  };
  const modal = $('#appModal');
  const closeModal = () => modal.classList.add('hidden');
  $('#mClose').onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  $$('.app-card').forEach((card) => {
    card.onclick = async () => {
      modal.classList.remove('hidden');
      $('#mBody').innerHTML = '<div class="empty-state">লোড হচ্ছে…</div>';
      const d = await apiGet('myapp', { id: card.dataset.app });
      if (d.error) { $('#mBody').innerHTML = `<div class="form-error">${esc(d.error)}</div>`; return; }
      $('#mBody').innerHTML = `
        <h2 style="margin-bottom:.2rem">${esc(d.appId)}</h2>
        <span class="badge">${esc(d.stageLabel)}</span>
        ${d.emergency ? '<span class="badge warn">জরুরি আবেদন</span>' : ''}
        <div class="modal-facts">
          <div><span>নাম</span><strong>${esc(d.name)}</strong></div>
          <div><span>ফোন</span><strong>${esc(d.phone)}</strong></div>
          <div><span>জেলা</span><strong>${esc(d.district || '—')}</strong></div>
          <div><span>মামলার ধরন</span><strong>${esc(d.caseType || '—')}</strong></div>
          <div><span>উদ্দেশ্য</span><strong>${esc(d.purpose || '—')}</strong></div>
          <div><span>জমার তারিখ</span><strong>${new Date(d.submitted).toLocaleDateString('bn-BD')}</strong></div>
        </div>
        <h3 style="margin:1.1rem 0 .5rem">${t('currentStage')}: ${esc(d.stageLabel)}</h3>
        <ul class="timeline">
          ${d.stages.map((s, i) => `<li class="${s.done ? 'done' : ''} ${s.current ? 'current' : ''}">
            <div class="tl-dot">${s.done ? '✓' : bnNum(i + 1)}</div>
            <div class="tl-body"><strong>${esc(s.label)}</strong>${s.current ? `<span>${t('currentStage')}</span>` : ''}</div>
          </li>`).join('')}
        </ul>
        <p style="color:var(--muted);font-size:.85rem;margin-top:.8rem">${esc(d.note)}</p>
        <div class="wizard-actions" style="margin-top:1rem">
          <a class="btn btn-outline btn-sm" href="#/track">📦 ${t('trackTitle')}</a>
          <a class="btn btn-primary btn-sm" href="#/call">📞 ১৬৬৯৯-এ কল</a>
        </div>`;
    };
  });
}

// ---------- ফোন কল সিমুলেটর (DLAS-স্টাইল IVR) ----------
async function pageCall() {
  const bnDigit = (d) => bnNum(d);
  const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];
  const KEY_SUB = { '2':'ABC','3':'DEF','4':'GHI','5':'JKL','6':'MNO','7':'PQRS','8':'TUV','9':'WXYZ','0':'+','*':'',' #':'' };
  app.innerHTML = `
  <div class="container page-head">
    <a class="btn btn-ghost btn-sm" href="#/help">← ${t('backHelp') || 'সহায়তায় ফিরুন'}</a>
    <h1>📞 ফোনে সহায়তা নিন — অ্যাডভোকেট ও ইউএসএসডি মেনু</h1>
    <p>দুটি চ্যানেলেই ২৪/৭ বা অফিস আওয়ারে আইনি প্রাথমিক সহায়তা পাবেন। যেকোনো একটি বেছে নিন — ডেমো কল চালিয়ে দেখুন কীভাবে কাজ করে।</p>
    <div class="call-tabs">
      <button class="call-tab active" id="tabPhone">📞 অ্যাডভোকেট কল · ১৬৬৯৯</button>
      <button class="call-tab" id="tabUssd">📱 ইউএসএসডি মেনু</button>
    </div>
  </div>
  <div class="container call-layout">
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-status"><span>প্রাইভেট</span><span>ব্যাটারি ৪২%</span></div>
      <div class="phone-screen" id="phScreen">
        <div class="ph-idle">
          <div class="ph-icon">📞</div>
          <p>কল করতে নিচের বোতাম চাপুন অথবা নম্বর ডায়াল করুন</p>
        </div>
        <div class="ph-digits" id="phDigits"></div>
        <div class="ph-timer hidden" id="phTimer">০০:০০</div>
        <div class="ph-visualizer hidden" id="phViz">${Array.from({length: 18}, (_, i) => `<span style="--h:${8 + Math.round(Math.abs(Math.sin(i * 1.7)) * 26)}px"></span>`).join('')}</div>
      </div>
      <div class="keypad" id="keypad">
        ${KEYS.map((k) => `<button class="key" data-k="${k}"><b>${bnDigit(k === '*' ? '*' : k === '#' ? '#' : bnNum(k))}</b>${KEY_SUB[k] ? `<small>${KEY_SUB[k]}</small>` : '<small>&nbsp;</small>'}</button>`).join('')}
      </div>
      <div class="phone-actions">
        <button class="ph-btn ghost" id="phHold">⏸ ধরে রাখুন</button>
        <button class="ph-btn danger hidden" id="phEnd">📞 কল কাটুন</button>
        <button class="ph-btn green" id="phStart">✆ কল করুন</button>
      </div>
    </div>
    <div class="call-right">
      <h2>কলের ট্রান্সক্রিপ্ট</h2>
      <div class="live-badge" id="liveBadge" hidden><span class="dot"></span> লাইভ কী-লগ</div>
      <div class="transcript" id="transcript">
        <div class="tr-item sys"><span class="tr-tag">IVR</span> নম্বর ডায়াল করে "কল করুন" চাপুন — এরপর প্রতিটি ধাপ এখানে দেখা যাবে।</div>
      </div>
      <div class="call-hint">ℹ️ বাস্তব কল নয় — ইন্টারঅ্যাকটিভ ডেমো। আসল কলে ভয়েস-কী-প্রেস কাজ করে।</div>
      <div class="call-steps" id="callSteps">
        <h3>এক নজরে IVR মেনু</h3>
        <ol>
          <li>ভাষা নির্বাচন — বাংলার জন্য ১, English এর জন্য ২</li>
          <li>১ → আবেদন ট্র্যাক (আইডির শেষ ৯ ডিজিট + #)</li>
          <li>২ → নতুন আবেদন / এসএমএস লিংক</li>
          <li>৩ → অফিসের ঠিকানা এসএমএসে</li>
          <li>৪ → আইনজীবী নিয়োগ তথ্য</li>
          <li>০ → সরাসরি কল-সেন্টার এজেন্ট</li>
        </ol>
      </div>
    </div>
  </div>`;
  // ---- কল স্টেট ----
  let onCall = false, held = false, timer = null, secs = 0, digits = '', ivrState = 'start', lang = 'bn', mode = 'call', ussdPath = '';
  const $t = $('#transcript'), $digits = $('#phDigits'), $timer = $('#phTimer'), $viz = $('#phViz'), $idle = document.querySelector('.ph-idle');
  const $start = $('#phStart'), $end = $('#phEnd'), $hold = $('#phHold'), $live = $('#liveBadge');
  const addTr = (who, text) => {
    const div = document.createElement('div');
    div.className = 'tr-item ' + who;
    div.innerHTML = `<span class="tr-tag">${who === 'ivr' ? 'IVR' : who === 'user' ? 'আপনি' : 'ℹ️'}</span> ${esc(text)}`;
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
      // ইউএসএসডি — ফোনেই মেনু চলে
      ussdPath = '*১৬৬৯৯#';
      $digits.textContent = ussdPath;
      addTr('sys', '📲 শর্টকোড পাঠানো হচ্ছে…');
      setTimeout(async () => {
        addTr('sys', 'ইউএসএসডি সেশন শুরু');
        await ivr({ state: 'start' });
        $digits.textContent = '';
      }, 700);
      return;
    }
    tick(); timer = setInterval(tick, 1000);
    addTr('sys', '📞 ১৬৬৯৯-এ কল যাচ্ছে…');
    setTimeout(async () => {
      addTr('sys', 'ধরা পড়েছে — সিগন্যাল ভালো');
      await ivr({ state: 'start' });
    }, 800);
  };
  const endCall = () => {
    if (!onCall) return;
    onCall = false; held = false; clearInterval(timer);
    $start.classList.remove('hidden'); $end.classList.add('hidden'); $hold.classList.add('hidden');
    $live.hidden = true; digits = ''; setScreen();
    addTr('sys', mode === 'ussd' ? 'ইউএসএসডি সেশন শেষ' : `কল শেষ — সময়কাল ${fmt(secs)}`);
  };
  const pressKey = async (k) => {
    if (!onCall) { digits += k; setScreen(); return; }
    if (held) { held = false; $hold.textContent = '⏸ ধরে রাখুন'; addTr('sys', 'কল পুনরায় চালু'); }
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
    $hold.textContent = held ? '▶ চালু করুন' : '⏸ ধরে রাখুন';
    addTr('sys', held ? 'কল হোল্ডে' : 'কল পুনরায় চালু');
    setScreen();
  };
  // ---- USSD ট্যাব — একই ফোনে মেনু মোড ----
  $('#tabUssd').onclick = () => {
    $('#tabPhone').classList.remove('active'); $('#tabUssd').classList.add('active');
    mode = 'ussd';
    $('#phStart').innerHTML = '📲 শর্টকোড পাঠান';
    if (!onCall) endCall();
    addTr('sys', 'ইউএসএসডি মোড — ফোনের স্ক্রিনেই মেনু দেখা যাবে। "শর্টকোড পাঠান" চাপুন।');
  };
  $('#tabPhone').onclick = () => {
    $('#tabUssd').classList.remove('active'); $('#tabPhone').classList.add('active');
    mode = 'call';
    $('#phStart').innerHTML = '✆ কল করুন';
  };
}
async function pageComplaint() {
  app.innerHTML = `
  <div class="container page-head"><h1>📣 ${t('complaintTitle')}</h1><p>${t('complaintLead')}</p></div>
  <div class="container"><div class="form-card">
    <div id="cErr" class="form-error hidden"></div>
    <div id="cBody">
      <div class="field"><label>${t('compCategory')}</label>
        <select id="c_cat">
          <option>অফিস সংক্রান্ত</option><option>আইনজীবী সংক্রান্ত</option><option>টাকা-পয়সা চাওয়া হয়েছে</option>
          <option>ওয়েবসাইট সংক্রান্ত</option><option>অন্য</option>
        </select></div>
      <div class="field" style="margin-top:.9rem"><label>${t('compCase')}</label><input id="c_case" placeholder="DLAS-NET-…"></div>
      <div class="field" style="margin-top:.9rem"><label>${t('compDesc')} <span class="req">*</span></label><textarea id="c_desc"></textarea></div>
      <div class="field" style="margin-top:.9rem"><label>${t('phone')} (যোগাযোগের জন্য)</label><input id="c_phone" placeholder="${t('phonePh')}"></div>
      <button class="btn btn-primary btn-block" id="c_go" style="margin-top:1.2rem">${t('compSubmit')}</button>
    </div>
  </div></div>`;
  $('#c_go').onclick = async () => {
    const r = await apiPost('complaints', {
      category: $('#c_cat').value, caseRef: $('#c_case').value.trim(),
      desc: $('#c_desc').value.trim(), phone: $('#c_phone').value.trim()
    });
    if (r.error) { const e = $('#cErr'); e.textContent = r.error; e.classList.remove('hidden'); return; }
    $('#cBody').innerHTML = `<div class="form-success">✅ ${t('compDone')}: <strong>${esc(r.id)}</strong><p style="margin-top:.4rem">${esc(r.message)}</p></div>`;
  };
}

// ---------- হেডারের লগইন লিংক ----------
function renderAuthLink() {
  const el = $('#loginLink');
  if (ME) {
    if (ME.role && ME.role !== 'applicant' && ME.role !== 'CITIZEN') {
      el.textContent = '🛠️ ' + (ME.name || 'কনসোল');
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
    app.innerHTML = '<div class="empty-state">সার্ভারে সংযোগ করা যাচ্ছে না। <code>npm start</code> চালান।</div>';
    return;
  }
  const me = await apiGet('me');
  ME = me.user;
  renderAuthLink();
  window.addEventListener('hashchange', route);
  route();
})();
