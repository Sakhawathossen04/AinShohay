// ============================================================================
// কর্মকর্তা প্যানেল (Provider Console) — login view.pdf প্রোটোটাইপ অনুযায়ী
// রিডিজাইন: নাগরিকের জমা দেওয়া আবেদন কর্মকর্তার ড্যাশবোর্ডে দেখা যায়,
// view details খুলে পূর্ণ রেকর্ড দেখা যায় এবং ডকুমেন্ট চেকলিস্ট/আপলোড যাচাই হয়।
// পুরনো টেস্ট টুল (রোল সুইচ, T-মডিউল, কভারেজ) নিচে টেস্ট ল্যাব হিসেবে রাখা আছে।
// ============================================================================
async function modFetch(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}

// কেস টাইপ আইডি → বাংলা (টেবিলে দেখানোর জন্য)
const OFF_CASE_TYPE_BN = {
  Civil: 'দেওয়ানি', 'Civil Appeal': 'দেওয়ানি আপিল', 'Civil Revision': 'দেওয়ানি রিভিশন',
  Criminal: 'ফৌজদারি', 'Criminal Appeal': 'ফৌজদারি আপিল', 'Criminal Revision': 'ফৌজদারি রিভিশন',
  Family: 'পারিবারিক', 'Grievance Redress': 'অভিযোগ নিষ্পত্তি', 'Jail Appeal': 'জেল আপিল',
  'Labour Civil': 'শ্রম দেওয়ানি', 'Labour Criminal': 'শ্রম ফৌজদারি', Writ: 'রিট'
};
const OFF_PURPOSE_BN = {
  mediation: 'আপোষ মিমাংসা', 'new-case': 'নতুন মামলা', financial: 'আর্থিক সহায়তা', advice: 'আইনি পরামর্শ'
};
const OFF_REFERRAL_BN = {
  adc: 'কিশোর উন্নয়ন কেন্দ্র', 'govt-office': 'সরকারি অফিস', brac: 'ব্র্যাক', court: 'আদালত',
  'court-clerk': 'আদালতের কেরানি', 'dc-office': 'ডিসি অফিস', direct: 'সরাসরি', dlao: 'জেলা লিগ্যাল এইড অফিস',
  expatriate: 'প্রবাসী', facebook: 'ফেসবুক', 'jail-super': 'জেল সুপার', lawyer: 'আইনজীবী',
  'local-elected': 'স্থানীয় সংস্থা', newspaper: 'সংবাদপত্র', ngo: 'এনজিও', 'nlaso-staff': 'এনএলএএসও কর্মী',
  'nlaso-benef': 'এনএলএএসও সুবিধাভোগী', others: 'অন্যান্য', paralegal: 'প্যারালিগ্যাল', police: 'পুলিশ',
  'public-rep': 'জনপ্রতিনিধি', 'refer-109': '১০৯ রেফার', 'refer-999': '৯৯৯ রেফার', television: 'টেলিভিশন',
  'trade-union': 'ট্রেড ইউনিয়ন', 'union-committee': 'ইউনিয়ন কমিটি', 'upazila-committee': 'উপজেলা কমিটি'
};
// মামলার ধরন ভেদে ডকুমেন্ট চেকলিস্ট (T6 বেসলাইন)
const OFF_DOC_BASE = {
  Family: ['Copy of National ID', 'Marriage certificate (Nikahnama)', 'Income certificate'],
  Civil: ['Copy of National ID', 'Land deed / parcha', 'Income certificate'],
  Criminal: ['Copy of National ID', 'FIR copy / Thana receipt', 'Income certificate'],
  Writ: ['Copy of National ID', 'Relevant government correspondence', 'Income certificate'],
  'Grievance Redress': ['Copy of National ID', 'Written complaint copy', 'Income certificate'],
  'Jail Appeal': ['Copy of National ID', 'Court judgment copy', 'Income certificate']
};

async function pageConsole() {
  if (!ME) return (location.hash = '#/login');
  // কর্মকর্তা হলে নতুন অফিসার প্যানেল, নাগরিক হলে ড্যাশবোর্ডে পাঠাই
  if (ME.role === 'applicant' || ME.role === 'CITIZEN') return (location.hash = '#/dashboard');

  // ---------- ১. অফিসার ড্যাশবোর্ড (PDF স্ক্রিনশট অনুযায়ী) ----------
  app.innerHTML = `
  <div class="off-shell">
    <div class="container off-head">
      <div>
        <h1>কর্মকর্তা প্যানেল</h1>
        <p id="offSub">আপনার অফিসে আসা আবেদনসমূহ — যাচাই করে গ্রহণ বা অতিরিক্ত ডকুমেন্ট চান</p>
      </div>
      <div class="off-head-right">
        <span class="off-badge">${esc(ME.name || 'কর্মকর্তা')}${ME.office ? ' · ' + esc(ME.office) : ''}</span>
        <button class="btn btn-outline btn-sm" id="consoleLogout">🚪 লগআউট</button>
      </div>
    </div>
    <div class="container">
      <div class="off-stats" id="offStats"></div>

      <h2 class="off-sec-title" id="offNeedTitle">প্রয়োজনীয় অ্যাকশন</h2>
      <div class="off-table-wrap" id="offNeedWrap"></div>

      <h2 class="off-sec-title" id="offAllTitle">সব আবেদন</h2>
      <div class="off-search-row">
        <input id="offQ" placeholder="নাম, আবেদন আইডি, জেলা বা ফোন দিয়ে খুঁজুন…">
        <button class="btn btn-primary btn-sm" id="offQGo">🔍 খুঁজুন</button>
        <button class="btn btn-outline btn-sm" id="offQReset">সব দেখুন</button>
      </div>
      <div class="off-table-wrap" id="offAllWrap"></div>

      <div id="offDetail"></div>

      <!-- ---------- পুরনো টেস্ট ল্যাব (টেস্টযোগ্যতার জন্য সংরক্ষিত) ---------- -->
      <details class="off-lab" id="offLab">
        <summary>🧪 টেস্ট ল্যাব — রুলবুক সিনারিও, রোল ভিউ ও T-মডিউল (ডেভেলপার)</summary>
        <div id="labBody"></div>
      </details>
    </div>
  </div>`;

  const loadDashboard = async (q = '') => {
    const r = await apiGet('officer_applications', q ? { q } : {});
    if (r.error || r.needAuth) { app.innerHTML = `<div class="container"><div class="empty-state">${esc(r.error || 'লগইন করুন')}</div></div>`; return; }
    const s = r.stats;
    $('#offStats').innerHTML = `
      <div class="off-stat"><span>মোট আবেদন</span><strong>${bnNum(s.total)}</strong><small>আপনার অফিসে জমা হয়েছে</small></div>
      <div class="off-stat"><span>চলমান</span><strong>${bnNum(s.active)}</strong><small>যাচাই/পর্যালোচনাধীন</small></div>
      <div class="off-stat warn"><span>অ্যাকশন প্রয়োজন</span><strong>${bnNum(s.actionRequired)}</strong><small>কিছু একটা আপনার দৃষ্টি আকর্ষণ করছে</small></div>
      <div class="off-stat ok"><span>নিষ্পত্তি সম্পন্ন</span><strong>${bnNum(s.resolved)}</strong><small>সফলভাবে শেষ হয়েছে</small></div>`;

    const needRows = r.applications.filter((a) => a.needsAction);
    $('#offNeedTitle').style.display = needRows.length ? '' : 'none';
    $('#offNeedWrap').innerHTML = needRows.length ? offTable(needRows, true) : '';
    $('#offAllWrap').innerHTML = r.applications.length ? offTable(r.applications, false) : '<div class="empty-state">এখনো কোনো আবেদন আসেনি। নাগরিক নতুন আবেদন জমা দিলে এখানে দেখা যাবে।</div>';

    // টেবিলের row click → ডিটেইল
    $$('#offNeedWrap .off-row, #offAllWrap .off-row').forEach((row) => {
      row.onclick = () => openDetail(row.dataset.app);
    });
  };

  const offTable = (list, needMode) => `
    <table class="off-table">
      <thead><tr>
        ${needMode ? '<th>কী করতে হবে</th>' : '<th>আবেদন আইডি</th>'}
        <th>আবেদনকারী</th><th>ধরন</th><th>জেলা</th><th>দাখিল</th><th>স্টেটাস</th><th>ডকুমেন্ট</th><th>অ্যাকশন</th>
      </tr></thead>
      <tbody>
        ${list.map((a) => `
        <tr class="off-row ${a.needsAction ? 'off-row-need' : ''}" data-app="${esc(a.appId)}">
          ${needMode
            ? `<td>${a.emergency ? '🚨 জরুরি আবেদন — ২৪ ঘণ্টার মধ্যে যাচাই করুন।' : a.stage === 0 ? 'নতুন আবেদন — এখনো যাচাই হয়নি।' : `${bnNum(a.ageDays)} দিন পুরোনো — আপডেট দিন।`}</td>`
            : `<td class="off-mono">${esc(a.appId)}</td>`}
          <td>${esc(a.name)}</td>
          <td>${esc(OFF_CASE_TYPE_BN[a.caseType] || a.caseType)}</td>
          <td>${esc(a.district)}</td>
          <td>${a.createdAt ? new Date(a.createdAt).toLocaleDateString('bn-BD') : '—'}</td>
          <td><span class="off-pill ${a.stage >= 4 || a.rejected ? 'off-pill-ok' : a.stage === 0 ? 'off-pill-warn' : 'off-pill-info'}">${offStatusBn(a)}</span></td>
          <td>${a.docsRequired ? `${bnNum(a.docsReceived)}/${bnNum(a.docsRequired)}` : '—'}</td>
          <td><span class="off-link">View details</span></td>
        </tr>`).join('')}
      </tbody>
    </table>`;

  const offStatusBn = (a) => a.rejected ? 'বাতিল' : a.caseId ? 'কেস খোলা হয়েছে' : a.stage === 0 ? 'নতুন (যাচাই বাকি)' : a.stage >= 4 ? 'নিষ্পত্তি সম্পন্ন' : 'পর্যালোচনাধীন';

  // ---------- ২. View Details — পূর্ণ রেকর্ড + ডকুমেন্ট চেকলিস্ট ----------
  const openDetail = async (appId) => {
    // ডিটেইল ডেটা: officer_applications তালিকা + role_view (অডিট সহ)
    const listRes = await apiGet('officer_applications');
    const a = (listRes.applications || []).find((x) => x.appId === appId);
    if (!a) { toast('রেকর্ড পাওয়া যায়নি'); return; }
    const rv = await apiGet('role_view', { appId });
    const rec = (rv && rv.record) || {};

    const catBn = { general: 'সাধারণ', freedom: 'মুক্তিযোদ্ধা', prisoner: 'কারাবন্দী', child: 'শিশু', disability: 'প্রতিবন্ধী', july: 'জুলাই যোদ্ধা', disappeared: 'গুম', trafficking: 'পাচার', acid: 'এসিডদগ্ধ', vgd: 'ভিজিডি', widow: 'বিধবা', dv: 'পারিবারিক সহিংসতা' };
    const occBn = { agriculture: 'কৃষি', business: 'ব্যবসা', 'day-labour': 'দিনমজুর', govt: 'সরকারি চাকরি', housewife: 'গৃহিণী', ngo: 'এনজিও', private: 'বেসরকারি চাকরি', professional: 'পেশাজীবী', self: 'স্বনির্ভর', student: 'শিক্ষার্থী', other: 'অন্যান্য' };
    const genderBn = { male: 'পুরুষ', female: 'নারী', child: 'শিশু', third: 'তৃতীয় লিঙ্গ' };
    const incomeBn = (b) => b === 'b20' ? '১,০০,০০০+ ৳' : b && b.startsWith('b') ? `${bnNum((+b.slice(1)) * 5)}–${bnNum((+b.slice(1) + 1) * 5)} হাজার ৳` : '—';

    // ডকুমেন্ট চেকলিস্ট: কর্মকর্তা সেট করলে সেটাই, নইলে কেস-টাইপ বেসলাইন প্রস্তাব
    const baseline = OFF_DOC_BASE[a.caseType] || OFF_DOC_BASE.Civil;
    const checklist = (rec.docChecklist || []).length ? rec.docChecklist : baseline.map((t) => ({ title: t, received: (rec.documents || []).some((d) => normText(d.name || d.title || '') === normText(t)) }));
    const docs = rec.documents || [];
    const receivedNames = docs.map((d) => d.name || d.title || '');

    const row = (label, value) => `<div class="off-drow"><span>${label}</span><strong>${value || '—'}</strong></div>`;

    $('#offDetail').innerHTML = `
    <div class="off-detail" id="offDetailCard">
      <button class="btn btn-ghost btn-sm off-back" id="offBack">← তালিকায় ফিরুন</button>
      <div class="off-detail-card">
        <div class="off-detail-top">
          <div>
            <span class="off-mono off-appid">${esc(a.appId)}</span>
            <h2>${esc(OFF_CASE_TYPE_BN[a.caseType] || a.caseType)} বিষয়ক আবেদন${a.appType === 'post' ? ' (চলমান মামলা)' : ' (নতুন বিরোধ)'}</h2>
            <span class="off-pill ${a.stage >= 4 || a.rejected ? 'off-pill-ok' : a.stage === 0 ? 'off-pill-warn' : 'off-pill-info'}">${offStatusBn(a)}</span>
          </div>
        </div>
        <div class="off-detail-meta">
          ${row('দাখিল', a.createdAt ? new Date(a.createdAt).toLocaleDateString('bn-BD') : '')}
          ${row('মোবাইল', esc(a.phone))}
          ${row('অফিস', esc(a.office))}
          ${a.caseId ? row('কেস আইডি', `<span class="off-mono">${esc(a.caseId)}</span>`) : ''}
        </div>
      </div>

      <div class="off-detail-grid">
        <div class="off-card">
          <h3>আবেদনের তথ্য</h3>
          ${row('উদ্দেশ্য', esc(OFF_PURPOSE_BN[a.purposeId] || a.purposeId))}
          ${row('আবেদনকারীর শ্রেণি', (a.categories || []).map((c) => catBn[c.id] || c.id).join(', ') || '—')}
          ${row('লিঙ্গ / বয়স', `${genderBn[a.gender] || a.gender || '—'}${a.age ? ' · ' + bnNum(a.age) + ' বছর' : ''}`)}
          ${row('পেশা / শিক্ষা', `${occBn[a.occupation] || a.occupation || '—'} · ${esc(a.education || '—')}`)}
          ${row('মাসিক আয়', incomeBn(a.incomeBand))}
          ${row('রেফারেল মাধ্যম', esc(OFF_REFERRAL_BN[a.referral] || a.referral || '—'))}
          ${row('সম্মতি (PDP ২০২৬)', a.consent ? '✅ দেওয়া হয়েছে' : '—')}
        </div>
        <div class="off-card">
          <h3>ঠিকানা ও পরিবার</h3>
          ${row('বর্তমান ঠিকানা', a.address && Object.keys(a.address).length ? `${esc(a.address.village || '')}, ${esc(a.address.post || '')}, ${esc(a.address.thana || '')}, ${esc(a.address.district || '')}` : esc(a.district))}
          ${row('পিতা / মাতা', `${esc(a.relations?.father || '—')} · ${esc(a.relations?.mother || '—')}`)}
          ${row('স্বামী/স্ত্রী', esc(a.relations?.spouse || '—'))}
          ${a.depsBreakdown ? row('নির্ভরশীল', `${bnNum((a.depsBreakdown.male || 0) + (a.depsBreakdown.female || 0) + (a.depsBreakdown.children || 0))} জন (পু${bnNum(a.depsBreakdown.male || 0)}/না${bnNum(a.depsBreakdown.female || 0)}/শি${bnNum(a.depsBreakdown.children || 0)})`) : ''}
          ${a.representative ? row('প্রতিনিধি (তদবিরকারক)', esc(a.representative.name || a.representative.repName || '')) : ''}
        </div>
        <div class="off-card">
          <h3>প্রতিপক্ষ</h3>
          ${(a.oppositeParties || []).length ? a.oppositeParties.map((p, i) => `
            <div class="off-drow"><span>প্রতিপক্ষ ${bnNum(i + 1)} (${p.type === 'individual' ? 'ব্যক্তি' : p.type === 'institution' ? 'প্রতিষ্ঠান' : 'রাষ্ট্র'})</span>
            <strong>${esc(p.name)}${p.phone ? ' · ' + esc(p.phone) : ''}</strong></div>`).join('') : '<div class="off-drow"><span>প্রতিপক্ষ</span><strong>—</strong></div>'}
          ${a.emergency ? '<div class="off-alert">🚨 জরুরি আইনগত সহায়তা চিহ্নিত করা হয়েছে — অগ্রাধিকার ভিত্তিতে যাচাই করুন।</div>' : ''}
        </div>
        <div class="off-card">
          <h3>সমস্যার বিবরণ</h3>
          <p class="off-problem">${esc(a.problem || rec.problem || '—')}</p>
        </div>
      </div>

      <div class="off-card off-doc-card">
        <h3>ডকুমেন্ট চেকলিস্ট <span class="off-doc-count">${bnNum(checklist.filter((c) => c.received).length)} / ${bnNum(checklist.length)} গৃহীত</span></h3>
        <p class="hint">প্রয়োজনীয় ডকুমেন্ট চিহ্নিত করুন — নাগরিক ট্র্যাকিং পেজে মিসিং তালিকা দেখে আপলোড করবেন। জমা পড়া ফাইল নিচে দেখা যাবে।</p>
        <div class="off-doc-list">
          ${checklist.map((c, i) => `
            <div class="off-doc-item ${c.received ? 'got' : 'missing'}">
              <div><strong>${esc(c.title)}</strong>${c.received ? `<small>গৃহীত হয়েছে</small>` : `<small>এখনো জমা পড়েনি</small>`}</div>
              <button type="button" class="off-doc-act ${c.received ? '' : 'off-doc-act-warn'}" data-i="${i}" data-received="${c.received ? 1 : 0}">${c.received ? '✓ গৃহীত' : '⏳ বাকি'}</button>
            </div>`).join('')}
        </div>
        ${docs.length ? `<div class="off-uploaded"><h4>📎 নাগরিকের আপলোড করা ফাইল (${bnNum(docs.length)}টি)</h4>
          ${docs.map((d) => `<a class="off-file" href="${esc(d.url || '#')}" target="_blank" rel="noopener">${d.kind === 'image' ? '🖼️' : d.kind === 'pdf' ? '📄' : '📎'} ${esc(d.name || 'ফাইল')} <small>(${Math.max(1, Math.round((d.size || 0) / 1024))} KB)</small></a>`).join('')}
        </div>` : ''}
        <div class="off-doc-actions">
          <button class="btn btn-primary btn-sm" id="offSaveDocs">💾 চেকলিস্ট সংরক্ষণ করুন (নাগরিককে জানান)</button>
          ${!a.caseId && !a.rejected ? '<button class="btn btn-outline btn-sm" id="offAccept">✅ গ্রহণ করুন — কেস আইডি তৈরি করুন</button>' : ''}
          ${!a.caseId && !a.rejected ? '<button class="btn btn-ghost btn-sm" id="offReject">❌ বাতিল করুন</button>' : ''}
        </div>
        <div id="offDocMsg" class="hidden form-success"></div>
      </div>

      ${(rec.audit || []).length ? `
      <div class="off-card">
        <h3>অডিট ট্রেইল</h3>
        <ul class="timeline">
          ${rec.audit.slice().reverse().slice(0, 12).map((x) => `<li class="done"><div class="tl-dot">•</div>
            <div class="tl-body"><strong>${esc(x.action)}</strong> — ${esc(x.actor || x.role || 'system')}
            <span style="color:var(--muted);font-size:.8rem">${x.at ? new Date(x.at).toLocaleString('bn-BD') : ''}</span>
            ${x.detail ? `<div style="font-size:.85rem;color:var(--muted)">${esc(x.detail)}</div>` : ''}</div></li>`).join('')}
        </ul>
      </div>` : ''}
    </div>`;

    $('#offBack').onclick = () => { $('#offDetail').innerHTML = ''; window.scrollTo({ top: 0, behavior: 'smooth' }); };

    // ডকুমেন্ট স্টেট টগল
    $$('.off-doc-act').forEach((b) => {
      b.onclick = () => { checklist[+b.dataset.i].received = b.dataset.received !== '1'; openDetail(appId); };
    });
    $('#offSaveDocs').onclick = async () => {
      const r2 = await apiPost('officer_request_docs', { appId, titles: checklist.map((c) => c.title), received: checklist.map((c) => c.received) });
      const m = $('#offDocMsg');
      m.textContent = r2.error ? r2.error : '✅ চেকলিস্ট সংরক্ষিত — নাগরিক এখন ট্র্যাকিং পেজে মিসিং ডকুমেন্ট দেখতে পাবেন ও আপলোড করতে পারবেন।';
      m.classList.remove('hidden');
    };
    const acc = $('#offAccept');
    if (acc) acc.onclick = async () => {
      const r2 = await apiPost('accept_application', { appId, decision: 'accept', note: 'যোগ্যতা যাচাইকৃত — কর্মকর্তার সিদ্ধান্ত' });
      if (r2.caseId) { toast('কেস তৈরি: ' + r2.caseId); openDetail(appId); }
      else if (r2.error) toast(r2.error);
    };
    const rej = $('#offReject');
    if (rej) rej.onclick = async () => {
      const reason = prompt('বাতিলের কারণ লিখুন:') || '';
      if (!reason) return;
      await apiPost('accept_application', { appId, decision: 'reject', note: reason });
      toast('আবেদন বাতিল করা হয়েছে'); openDetail(appId);
    };
    window.scrollTo({ top: $('#offDetailCard').offsetTop - 80, behavior: 'smooth' });
  };

  $('#offQGo').onclick = () => loadDashboard($('#offQ').value.trim());
  $('#offQReset').onclick = () => { $('#offQ').value = ''; loadDashboard(); };
  $('#offQ').onkeydown = (e) => { if (e.key === 'Enter') loadDashboard($('#offQ').value.trim()); };

  const cOut = $('#consoleLogout');
  if (cOut) cOut.onclick = async () => {
    if (typeof doLogout === 'function') await doLogout();
    else { try { await apiPost('logout', {}); } catch (e) {} ME = null; }
    location.hash = '#/login';
    toast('কনসোল থেকে লগআউট সম্পন্ন হয়েছে');
  };

  await loadDashboard();

  // ---------- ৩. পুরনো টেস্ট ল্যাব (ভাঁজ করা) ----------
  const lab = $('#offLab');
  if (lab) {
    lab.addEventListener('toggle', () => {
      if (!lab.open || $('#labBody').dataset.loaded) return;
      $('#labBody').dataset.loaded = '1';
      $('#labBody').innerHTML = `
      <div class="form-card" style="max-width:none">
        <div class="field"><label>রোল নির্বাচন করুন (রোল-ভিত্তিক ভিউ — G9)</label>
          <select id="csRole">
            <option value="dlao">🏛️ DLAO কর্মকর্তা (B1)</option>
            <option value="mediator">⚖️ মধ্যস্থতাকারী (B2)</option>
            <option value="agent16699">📞 ১৬৬৯৯ এজেন্ট (B3)</option>
            <option value="udc">🏢 UDC উদ্যোক্তা (B4)</option>
            <option value="lawyer">👨‍⚖️ প্যানেল আইনজীবী (B5)</option>
            <option value="receiving">📥 গ্রহণকারী DLAO (B6)</option>
            <option value="staff">🗂️ কেস-সাপোর্ট স্টাফ (B7)</option>
          </select>
        </div>
        <div class="field" style="margin-top:.7rem"><label>আবেদন/কেস আইডি</label>
          <input id="csApp" placeholder="DLAS-NET-2026-… অথবা DLAS-CASE-…">
        </div>
        <div class="field" style="margin-top:.7rem"><label>🧑‍🤝‍🧑 রুলবুক সিনারিও (Part A) — এক ক্লিকে লোড</label>
          <div class="persona-row">
            <button class="btn btn-outline btn-sm" data-persona="A1">A1 ময়ূরী — সেফ-কন্টাক্ট</button>
            <button class="btn btn-outline btn-sm" data-persona="A2">A2 রিপন — প্রতিনিধি</button>
            <button class="btn btn-outline btn-sm" data-persona="A3">A3 নাবিলা — স্পর্শকাতর</button>
            <button class="btn btn-outline btn-sm" data-persona="A4">A4 নুচিং — UDC সহায়তা</button>
            <button class="btn btn-outline btn-sm" data-persona="A5">A5 মালেক — দীর্ঘস্থায়ী</button>
          </div>
        </div>
        <button class="btn btn-primary" id="csLoad" style="margin-top:.9rem">রেকর্ড লোড করুন</button>
        <div id="csOut" style="margin-top:1rem"></div>
        <div class="form-error hidden" id="csErr" style="margin-top:.8rem"></div>
      </div>
      <h3 style="margin:1.4rem 0 .6rem">🧪 টেকনিক্যাল মডিউল (T1–T11)</h3>
      <div class="module-grid" id="modGrid">
        ${[['T1','👨‍⚖️','আইনজীবী আপডেট মিস — ওভারডিউ অ্যালার্ট','miss'],['T2','🔀','জুরিসডিকশন পিং-পং — এস্কালেশন','t2'],['T3','🔗','এক ঘটনা, একাধিক কেস — লিংক','t3'],['T4','👥','ডুপ্লিকেট ডিটেকশন','t4'],['T5','💬','কথোপকথনে ইনটেক (AI সহায়ক)','t5'],['T6','📄','ডকুমেন্ট ব্রিফিং + চেকলিস্ট','t6'],['T7','✍️','সেটেলমেন্ট ড্রাফট','t7'],['T8','🧠','মাল্টি-এজেন্ট ট্রায়াজ','t8'],['T9','📡','অফলাইন সিঙ্ক','t9'],['T11','🖋️','ই-সিগনেচার + ভেরিফাই','t11']].map(([id, ic, label, act]) => `
          <button class="module-card" data-m="${act}"><span class="mod-badge">${id}</span><span class="mod-ic">${ic}</span><span>${label}</span></button>`).join('')}
      </div>
      <div id="modOut" style="margin-top:1rem"></div>`;
      initTestLab();
    });
  }

  function initTestLab() {
    const $err = () => $('#csErr');
    const showErr = (m) => { const e = $err(); e.textContent = m; e.classList.remove('hidden'); };
    const hideErr = () => $err().classList.add('hidden');
    const currentRole = () => $('#csRole').value;
    const appId2 = () => $('#csApp').value.trim();

    const loadPersona = async (key) => {
      hideErr();
      const s = await apiPost('demo_seed', {});
      if (s.error) return showErr(s.error);
      $('#csApp').value = s.personas[key] || '';
      $('#csLoad').click();
    };
    $$('[data-persona]').forEach((b) => { b.onclick = () => loadPersona(b.dataset.persona); });
    $$('[data-role]').forEach((b) => {
      b.onclick = async () => {
        hideErr();
        $('#csRole').value = b.dataset.role;
        $('#csApp').value = '';
        $('#csLoad').click();
      };
    });

    $('#csLoad') && ($('#csLoad').onclick = async () => {
      hideErr();
      const role = currentRole();
      await apiPost('role_switch', { role });
      const id = appId2();
      if (!id) {
        const q = await apiGet('dlao_queue');
        if (q.error) return showErr(q.error);
        $('#csOut').innerHTML = `
          <div class="quick-ans"><strong>📋 অপারেশনাল কিউ (B1)</strong> — ${bnNum(q.queue.length)}টি রেকর্ড; ${esc(q.note)}</div>
          ${q.queue.map((x) => `
            <div class="app-card" data-app="${esc(x.appId)}">
              <span class="app-stage-icon">${x.emergency ? '🚨' : '📝'}</span>
              <span class="app-main">
                <span class="app-id">${esc(x.appId)} ${x.caseId ? '· ' + esc(x.caseId) : ''}</span>
                <span class="app-meta">${esc(x.name)} · ${esc(x.district)} · ${bnNum(x.ageDays)} দিন</span>
              </span>
              <span class="app-right"><span class="badge">${bnNum(x.priorityHint)}</span><span class="app-chevron">›</span></span>
            </div>`).join('') || '<div class="empty-state">কিউ খালি</div>'}`;
        $$('#csOut .app-card').forEach((c) => c.onclick = () => { $('#csApp').value = c.dataset.app; $('#csLoad').click(); });
        return;
      }
      const rv = await apiGet('role_view', { appId: id });
      if (rv.error) return showErr(rv.error);
      const r = rv.record || {};
      $('#csOut').innerHTML = `
        <div class="quick-ans"><strong>${esc(rv.view)} ভিউ</strong> — ${esc(r.appId || id)} ${r.stageLabel ? `<span class="badge">${esc(r.stageLabel)}</span>` : ''}</div>
        <ul class="timeline">
          ${(r.audit || []).slice().reverse().slice(0, 10).map((a) => `<li class="done"><div class="tl-dot">•</div>
            <div class="tl-body"><strong>${esc(a.action)}</strong> — ${esc(a.actor || a.role || 'system')}</div></li>`).join('') || '<li>অডিট খালি</li>'}
        </ul>`;
    });

    $$('#modGrid .module-card').forEach((card) => {
      card.onclick = async () => {
        const m = card.dataset.m;
        const out = $('#modOut');
        const id = appId2() || (BOOT.demoAppId || '');
        const run = async (label, p) => {
          const r = await p;
          out.innerHTML = `<div class="quick-ans"><strong>${label}</strong><pre class="mod-json">${esc(JSON.stringify(r, null, 1))}</pre></div>`;
        };
        if (m === 'miss') return run('T1 — আইনজীবী ২টি আপডেট মিস', apiPost('lawyer', { appId: id, action: 'miss' }));
        if (m === 't2') return run('T2 — পিং-পং এস্কালেশন', apiPost('jurisdiction', { appId: id, action: 'return', from: 'শ্রম সেল', reason: 'এখতিয়ার নেই' }));
        if (m === 't3') return run('T3 — লিংক', apiPost('link_cases', { appIds: [id, id], sharedEvidence: 'রিপোর্ট' }));
        if (m === 't4') return run('T4 — ডুপ্লিকেট চেক', apiPost('duplicate_check', { name: 'ময়ূরী আক্তার', phone: '01700000001', district: 'জয়পুরহাট', caseType: 'পারিবারিক' }));
        if (m === 't5') { location.hash = '#/'; setTimeout(() => window.__chatOpen && window.__chatOpen(), 500); return; }
        if (m === 't6') return run('T6 — ডকুমেন্ট ব্রিফিং', modFetch('/api/doc_brief', { caseType: 'ভূমি', documents: [{ name: 'দলিল-স্ক্যান.pdf', summary: '৭২ ডিমান্ড' }, { name: 'অস্পষ্ট-ছবি.jpg', unclear: true }] }));
        if (m === 't7') return run('T7 — সেটেলমেন্ট ড্রাফট', modFetch('/api/settlement_draft', { kind: 'maintenance', notes: 'মাসিক ৫০০০ টাকা' }));
        if (m === 't8') return run('T8 — মাল্টি-এজেন্ট ট্রায়াজ', modFetch('/api/triage', { caseType: 'পারিবারিক', emergency: true, nid: '', district: 'জয়পুরহাট' }));
        if (m === 't9') return run('T9 — অফলাইন সিঙ্ক', apiPost('sync_push', { items: [{ clientId: 'uuid-d-' + Date.now(), name: 'নুচিং মারমা', phone: '01900000001', district: 'খাগড়াছড়ি', caseType: 'ভূমি', problem: 'অফলাইন টেস্ট' }] }));
        if (m === 't11') {
          const prep = await apiPost('esign', { appId: id, action: 'prepare', document: 'ভরণপোষণ সমঝোতা' });
          await apiPost('esign', { appId: id, action: 'sign', party: 'স্ত্রী', pin: '1234' });
          await apiPost('esign', { appId: id, action: 'sign', party: 'স্বামী', pin: '5678' });
          const ver = await apiPost('esign', { appId: id, action: 'verify' });
          return run('T11 — ই-সিগনেচার (' + (prep.ok ? 'প্রস্তুত' : 'n/a') + ')', Promise.resolve(ver));
        }
      };
    });
  }
}
