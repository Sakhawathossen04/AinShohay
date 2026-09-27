// ============================================================================
// Auth Route Handler
// Staff PIN Login (1234), Citizen Door Verification, Session & Logout.
// ============================================================================
'use strict';

const db = require('../db');
const { createStaffSession, createCitizenSession, getSessionContext, SESSION_COOKIE } = require('../services/session');
const { hashPin } = require('../services/crypto');
const { writeAudit, SYSTEM_ACTOR } = require('../services/audit');
const { OFFICIAL_STAFF_EMAILS } = require('../constants-official-emails');

let sqliteDb = null;
try { sqliteDb = require('../db'); } catch (e) { /* SQLite unavailable */ }

function citizenDoorLogin({ applicationId, contactLast4 }) {
  if (!applicationId || !contactLast4) {
    return { status: 400, data: { error: 'আবেদন আইডি এবং মোবাইল/এনআইডির শেষ ৪ অঙ্ক দিন' } };
  }

  const cleanAppId = applicationId.trim().toUpperCase();
  const app = db.get(`
    SELECT a.*, ap.fullName, ap.primaryPhone, ap.nidRef
    FROM Application a
    JOIN Applicant ap ON a.applicantId = ap.id
    WHERE UPPER(a.id) = ?
  `, [cleanAppId]);

  if (!app) {
    // JSON application store fallback (DLAS-NET-* records created via the
    // public 6-step form are stored here by the compatibility router).
    try {
      const jdb = require('../app-db').load();
      const japp = (jdb.applications || []).find(a => (a.appId || '').toUpperCase() === cleanAppId);
      if (japp) {
        const jPhone = ((japp.phone || '') + '').replace(/\D/g, '');
        const jNid = ((japp.nid || '') + '').replace(/\D/g, '');
        if (!(jPhone.endsWith(contactLast4) || jNid.endsWith(contactLast4))) {
          return { status: 401, data: { error: 'যাচাইকরণ ব্যর্থ: শেষ ৪ অঙ্ক রেকর্ডের সাথে মেলেনি' } };
        }
        const session = createCitizenSession(japp.appId, 'CITIZEN');
        return {
          __setCookie: [
            `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
            `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
          ],
          session: {
            sessionId: session.id,
            role: 'CITIZEN',
            name: japp.name || 'নাগরিক',
            citizenApplicationId: japp.appId,
          }
        };
      }
    } catch (e) { /* JSON store unavailable */ }
    return { status: 404, data: { error: 'এই আইডিতে কোনো আবেদন পাওয়া যায়নি' } };
  }

  const phoneDigits = (app.primaryPhone || '').replace(/\D/g, '');
  const nidDigits = (app.nidRef || '').replace(/\D/g, '');
  const match = phoneDigits.endsWith(contactLast4) || nidDigits.endsWith(contactLast4);

  if (!match) {
    return { status: 401, data: { error: 'যাচাইকরণ ব্যর্থ: শেষ ৪ অঙ্ক রেকর্ডের সাথে মেলেনি' } };
  }

  const session = createCitizenSession(app.id, 'CITIZEN');
  return {
    __setCookie: [
      `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
      `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
    ],
    session: {
      sessionId: session.id,
      role: 'CITIZEN',
      name: app.fullName,
      citizenApplicationId: app.id,
    }
  };
}

function handleAuth(req, res, pathParts, query, body, ctx) {
  // GET /api/auth?roster=1 -> স্টাফ ইমেইল রোস্টার (SS2 অটোকমপ্লিট ড্রপডাউনের উৎস)
  if (req.method === 'GET' && query && query.roster === '1') {
    return {
      roster: OFFICIAL_STAFF_EMAILS.map(({ email, label, office, role }) => ({ email, label, office, role })),
    };
  }

  // GET /api/auth -> Current Session (enrich citizen door sessions with
  // name/phone from the JSON application store so the UI can greet & merge).
  if (req.method === 'GET') {
    if (ctx && !ctx.userId && ctx.citizenApplicationId) {
      try {
        const jdb = require('../app-db').load();
        const japp = (jdb.applications || []).find(a => (a.appId || '').toUpperCase() === String(ctx.citizenApplicationId).toUpperCase());
        if (japp) {
          ctx = {
            ...ctx,
            name: japp.name || ctx.name,
            nameBn: japp.name || ctx.name,
            phone: japp.phone || null,
            phoneDigits: ((japp.phone || '') + '').replace(/\D/g, ''),
          };
        }
      } catch (e) { /* JSON store unavailable */ }
    }
    return { session: ctx };
  }

  const finish = (result) => {
    if (result && result.__setCookie) {
      res.setHeader('Set-Cookie', result.__setCookie);
      delete result.__setCookie;
    }
    return result;
  };

  // ---------- Applicant (নাগরিক) OTP Login — prototype 2-step flow ----------
  // POST /api/auth { mode:'send_otp',  phone }           -> issues 6-digit code (stored in app-db otps{})
  // POST /api/auth { mode:'verify_otp', phone, code }    -> verifies + creates CITIZEN session
  // ডেমো ব্যবস্থা: SMS গেটওয়ে নেই বলে কোডটি রেসপন্সে ফেরত দেওয়া হয় (demoCode)
  // এবং যেকোনো ভ্যালিড ৬-ডিজিট কোডও (প্রোটোটাইপের মতো) গ্রহণ করা হয়।
  if (req.method === 'POST' && (body.mode === 'send_otp' || body.mode === 'verify_otp')) {
    const phoneDigits = String(body.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      return { status: 400, data: { error: 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 01712345678)' } };
    }
    try {
      const appDb = require('../app-db');
      const d = appDb.load();
      d.otps = d.otps || {};
      const key = phoneDigits.slice(-11);

      if (body.mode === 'send_otp') {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        d.otps[key] = { code, createdAt: new Date().toISOString(), expiresAt: Date.now() + 10 * 60000 };
        // পুরনো (১০ মিনিট+) OTP পরিষ্কার
        Object.keys(d.otps).forEach((k) => { if (d.otps[k].expiresAt < Date.now()) delete d.otps[k]; });
        try { appDb.save(); } catch (e) { /* read-only fs */ }
        return {
          ok: true,
          sent: true,
          demoCode: code, // SMS নেই — ডেমোতে UI দেখায়
          message: phoneDigits.slice(0, 5) + 'xxxxxx' + phoneDigits.slice(-2) + ' নম্বরে ৬ সংখ্যার যাচাই কোড পাঠানো হয়েছে।'
        };
      }

      // verify_otp
      const code = String(body.code || '').replace(/\D/g, '');
      if (code.length !== 6) {
        return { status: 400, data: { error: '৬ সংখ্যার কোড লিখুন' } };
      }
      const rec = d.otps[key];
      const codeOk = (rec && rec.code === code && rec.expiresAt > Date.now()) || /^[0-9]{6}$/.test(code);
      if (!codeOk) {
        return { status: 401, data: { error: 'কোড সঠিক নয় — আবার চেষ্টা করুন' } };
      }
      if (rec) delete d.otps[key];
      try { appDb.save(); } catch (e) {}

      // ১) আগে SQLite User (সাইনআপ করা নাগরিক) খুঁজি
      let user = null;
      if (sqliteDb) {
        try {
          user = sqliteDb.get(
            "SELECT * FROM User WHERE active = 1 AND REPLACE(REPLACE(phone, '-', ''), ' ', '') LIKE ?",
            ['%' + phoneDigits.slice(-10)]
          );
        } catch (e) {}
      }
      if (user) {
        const session = createStaffSession(user.id);
        return finish({
          __setCookie: [
            `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
            `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
          ],
          session: {
            sessionId: session.id,
            userId: user.id,
            role: 'CITIZEN',
            name: user.nameBn || user.name,
            office: user.office,
            citizenApplicationId: session.citizenApplicationId,
          }
        });
      }

      // ২) ইউজার অ্যাকাউন্ট না থাকলে ফোন-ভিত্তিক নাগরিক সেশন (আবেদন খুঁজে দেখাবে)
      let appName = 'নাগরিক';
      let appIdRef = null;
      try {
        const japp = (d.applications || [])
          .filter((a) => String(a.phone || '').replace(/\D/g, '').endsWith(phoneDigits.slice(-10)))
          .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0];
        if (japp) { appName = japp.name || appName; appIdRef = japp.appId; }
      } catch (e) {}

      const session = createCitizenSession(appIdRef || 'WEB-' + phoneDigits.slice(-6), 'CITIZEN');
      return finish({
        __setCookie: [
          `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
          `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
        ],
        session: {
          sessionId: session.id,
          role: 'CITIZEN',
          name: appName,
          phone: phoneDigits,
          citizenApplicationId: appIdRef,
        }
      });
    } catch (err) {
      console.error('[auth] OTP flow error:', err);
      return { status: 500, data: { error: 'ওটিপি প্রক্রিয়ায় সমস্যা হয়েছে — আবার চেষ্টা করুন' } };
    }
  }

  // POST /api/auth -> Login
  if (req.method === 'POST') {
    const mode = body.mode || 'staff';

    // Staff Login — username অথবা অফিসিয়াল ইমেইল (…@dbla.gov.bd) দুটোই চলে।
    // SS2 স্ক্রিনে ড্রপডাউন থেকে ইমেইল সিলেক্ট করে পিন দিয়ে লগইন করা যায়।
    if (mode === 'staff') {
      const { username, pin } = body;
      if (!username || !pin) {
        return { status: 400, data: { error: 'Username and PIN are required' } };
      }

      const uname = String(username).trim();
      const unameLower = uname.toLowerCase();
      const byEmail = unameLower.endsWith('@dbla.gov.bd') || uname.includes('@');
      let user = null;
      if (byEmail) {
        user = db.get(
          'SELECT * FROM User WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND active = 1',
          [unameLower, unameLower]
        );
        if (!user) {
          // ইমেইল রোস্টারে আছে কিন্তু DB-তে ব্যাকফিল হয়নি — username-এ ফলব্যাক
          const { OFFICIAL_STAFF_EMAILS } = require('../constants-official-emails');
          const rosterHit = OFFICIAL_STAFF_EMAILS.find((s) => s.email.toLowerCase() === unameLower);
          if (rosterHit) {
            user = db.get('SELECT * FROM User WHERE username = ? AND active = 1', [rosterHit.username]);
          }
        }
      } else {
        user = db.get('SELECT * FROM User WHERE (username = ? OR LOWER(email) = ?) AND active = 1', [uname, unameLower]);
      }
      if (!user) {
        return { status: 401, data: { error: 'অফিসিয়াল ইমেইল / ইউজার আইডি সঠিক নয় বা অ্যাকাউন্ট নিষ্ক্রিয়' } };
      }

      const pinValid = user.pinHash === hashPin(pin) || pin === '1234';
      if (!pinValid) {
        return { status: 401, data: { error: 'ভুল পিন নম্বর' } };
      }

      const session = createStaffSession(user.id);
      res.setHeader('Set-Cookie', [
        `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
        `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
      ]);

      writeAudit({
        actor: { userId: user.id, name: user.name, role: user.role },
        channel: 'WEB',
        action: 'STAFF_LOGIN',
        entityType: 'User',
        entityId: user.id,
        onWhoseAuthority: user.name,
      });

      return {
        session: {
          sessionId: session.id,
          userId: user.id,
          role: user.role,
          name: user.name,
          nameBn: user.nameBn || user.name,
          username: user.username,
          email: user.email || null,
          office: user.office,
          citizenApplicationId: session.citizenApplicationId,
        }
      };
    }

    // ── Citizen Signup (নতুন নাগরিক অ্যাকাউন্ট তৈরি: নাম + ফোন + পাসওয়ার্ড) ──
    // অ্যাকাউন্টটি SQLite User টেবিলে CITIZEN রোলে সংরক্ষিত হয় — পরে একই
    // ফোন + পাসওয়ার্ড দিয়ে 'নাগরিক লগইন' ট্যাব থেকে প্রবেশ করা যায়।
    if (mode === 'signup') {
      const name = (body.name || '').trim();
      const phoneRaw = (body.phone || '').trim();
      const password = String(body.password || '').trim();
      if (!name || !phoneRaw || !password) {
        return { status: 400, data: { error: 'নাম, মোবাইল নম্বর ও পাসওয়ার্ড — তিনটিই দিন' } };
      }
      const phoneDigits = phoneRaw.replace(/\D/g, '');
      if (phoneDigits.length < 11) {
        return { status: 400, data: { error: 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 01712345678)' } };
      }
      if (password.length < 4) {
        return { status: 400, data: { error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের দিন' } };
      }
      // ডুপ্লিকেট চেক — একই ফোনে আগে থেকে অ্যাকাউন্ট থাকলে লগইনে পাঠান
      const exists = db.get(
        `SELECT id FROM User WHERE active = 1 AND REPLACE(REPLACE(phone, '-', ''), ' ', '') LIKE ?`,
        ['%' + phoneDigits.slice(-10)]
      ) || db.get('SELECT id FROM User WHERE username = ? AND active = 1', [phoneDigits]);
      if (exists) {
        return { status: 409, data: { error: 'এই মোবাইল নম্বরে অ্যাকাউন্ট আছে — লগইন করুন', alreadyRegistered: true } };
      }
      const userId = 'usr_' + require('crypto').randomBytes(8).toString('hex');
      db.run(
        `INSERT INTO User (id, username, name, nameBn, role, office, phone, lang, pinHash, active, createdAt)
         VALUES (?, ?, ?, ?, 'CITIZEN', NULL, ?, 'bn', ?, 1, ?)`,
        [userId, phoneDigits, name, name, phoneRaw, hashPin(password), new Date().toISOString()]
      );
      const session = createStaffSession(userId);
      res.setHeader('Set-Cookie', [
        `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
        `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
      ]);
      writeAudit({
        actor: { userId, name, role: 'CITIZEN' },
        channel: 'WEB',
        action: 'CITIZEN_SIGNUP',
        entityType: 'User',
        entityId: userId,
        onWhoseAuthority: name,
      });
      return {
        session: {
          sessionId: session.id,
          userId,
          role: 'CITIZEN',
          name,
          nameBn: name,
          office: null,
          citizenApplicationId: session.citizenApplicationId || null,
        }
      };
    }

    // Citizen Login (phone OR application ID + PIN/last-4 verification)
    // Accepts: mode='citizen' { phone|id|applicationId, pin|password|last4|contactLast4 }
    if (mode === 'citizen') {
      const idInput = (body.phone || body.id || body.applicationId || body.appId || '').trim();
      const secret = String(body.pin || body.password || body.last4 || body.contactLast4 || '').trim();
      if (!idInput || !secret) {
        return { status: 400, data: { error: 'মোবাইল নম্বর/আবেদন আইডি এবং পিন (বা শেষ ৪ অঙ্ক) দিন' } };
      }

      // 1) Try as registered phone in User table (citizen accounts, demo pin 3344)
      const phoneDigits = idInput.replace(/\D/g, '');
      let user = null;
      if (phoneDigits.length >= 10) {
        user = db.get('SELECT * FROM User WHERE active = 1 AND REPLACE(REPLACE(phone, \'-\', \'\'), \' \', \'\') LIKE ?', ['%' + phoneDigits.slice(-10)]);
      }
      if (!user && !idInput.includes('-')) {
        user = db.get('SELECT * FROM User WHERE username = ? AND active = 1', [idInput]);
      }

      if (user) {
        const pinOk = user.pinHash === hashPin(secret) || secret === '1234' || secret === '3344';
        if (!pinOk) {
          return { status: 401, data: { error: 'ভুল পিন নম্বর' } };
        }
        const session = createStaffSession(user.id);
        res.setHeader('Set-Cookie', [
          `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
          `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
        ]);
        writeAudit({
          actor: { userId: user.id, name: user.name, role: 'CITIZEN' },
          channel: 'WEB',
          action: 'CITIZEN_LOGIN',
          entityType: 'User',
          entityId: user.id,
          onWhoseAuthority: user.name,
        });
        return {
          session: {
            sessionId: session.id,
            userId: user.id,
            role: 'CITIZEN',
            name: user.nameBn || user.name,
            office: user.office,
            citizenApplicationId: session.citizenApplicationId,
          }
        };
      }

      // 2) Phone-style input without a user account: find the latest
      //    application registered with this phone and verify the PIN/last-4.
      //    Checks the SQLite spine first, then the JSON application store.
      if (phoneDigits.length >= 10 && !idInput.toUpperCase().includes('APP')) {
        const last10 = phoneDigits.slice(-10);
        const appByPhone = db.get(`
          SELECT a.id FROM Application a
          JOIN Applicant ap ON a.applicantId = ap.id
          WHERE REPLACE(REPLACE(ap.primaryPhone, '-', ''), ' ', '') LIKE ?
          ORDER BY a.createdAt DESC LIMIT 1
        `, ['%' + last10]);
        if (appByPhone) {
          return finish(citizenDoorLogin({ applicationId: appByPhone.id, contactLast4: secret }));
        }

        // JSON application store fallback (DLAS-NET-* records)
        try {
          const jdb = require('../app-db').load();
          const japp = (jdb.applications || []).find(a => ((a.phone || '') + '').replace(/\D/g, '').endsWith(last10));
          if (japp) {
            const jPhone = ((japp.phone || '') + '').replace(/\D/g, '');
            const jNid = ((japp.nid || '') + '').replace(/\D/g, '');
            if (!(jPhone.endsWith(secret) || jNid.endsWith(secret))) {
              return { status: 401, data: { error: 'ভুল পিন নম্বর' } };
            }
            const session = createCitizenSession(japp.appId, 'CITIZEN');
            return finish({
              __setCookie: [
                `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
                `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
              ],
              session: {
                sessionId: session.id,
                role: 'CITIZEN',
                name: japp.name || 'নাগরিক',
                citizenApplicationId: japp.appId,
              }
            });
          }
        } catch (e) { /* JSON store unavailable */ }

        return { status: 404, data: { error: 'এই মোবাইল নম্বরে কোনো আবেদন পাওয়া যায়নি' } };
      }

      // 3) Fall back to citizen-door verification (application ID + last 4)
      return finish(citizenDoorLogin({ applicationId: idInput, contactLast4: secret }));
    }

    // Citizen Door Login (No account needed: Application ID + phone/NID last 4 digits)
    if (mode === 'citizen_door') {
      return finish(citizenDoorLogin(body));
    }

    return { status: 400, data: { error: 'Invalid auth mode' } };
  }

  // DELETE /api/auth (or POST /api/logout) → Logout.
  // দুটি সেশন কুকি (dlas_session + session) একসাথে মুছে দিতে হয় — নইলে
  // পুরনো কুকি থেকে সেশন পুনরুদ্ধার হয়ে "লগআউট হয় না" সমস্যা তৈরি করে।
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', [
      `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
      `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    ]);
    return { ok: true, message: 'Logged out successfully' };
  }

  return { status: 405, data: { error: 'Method not allowed' } };
}

module.exports = { handleAuth };
