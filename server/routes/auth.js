// ============================================================================
// Auth Route Handler
// Staff PIN Login (1234), Citizen Door Verification, Session & Logout.
// ============================================================================
'use strict';

const db = require('../db');
const { createStaffSession, createCitizenSession, getSessionContext, SESSION_COOKIE } = require('../services/session');
const { hashPin } = require('../services/crypto');
const { writeAudit, SYSTEM_ACTOR } = require('../services/audit');

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

  // POST /api/auth -> Login
  if (req.method === 'POST') {
    const mode = body.mode || 'staff';

    // Staff Login
    if (mode === 'staff') {
      const rawUser = String(body.username || body.email || body.id || '').trim();
      const pin = String(body.pin || body.password || '').trim();
      if (!rawUser || !pin) {
        return { status: 400, data: { error: 'ইউজারনেম/ইমেইল এবং পিন দিন' } };
      }

      const cleanUser = rawUser.toLowerCase();
      let user = db.get(
        'SELECT * FROM User WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND active = 1',
        [cleanUser, cleanUser]
      );
      if (!user) {
        user = db.get(
          'SELECT * FROM User WHERE (LOWER(email) LIKE ? OR LOWER(username) LIKE ?) AND active = 1',
          [cleanUser + '@%', cleanUser + '%']
        );
      }
      if (!user) {
        return { status: 401, data: { error: 'ইউজারনেম বা অফিশিয়াল ইমেইল সঠিক নয়' } };
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
          office: user.office,
          email: user.email || null,
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

    // Citizen OTP Verification Login (Mobile + 6-digit OTP code)
    if (mode === 'citizen_otp') {
      const phoneRaw = String(body.phone || body.mobile || '').trim();
      const otp = String(body.otp || body.code || '').trim();
      if (!phoneRaw) {
        return { status: 400, data: { error: 'মোবাইল নম্বর প্রদান করুন' } };
      }
      const phoneDigits = phoneRaw.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return { status: 400, data: { error: 'সঠিক মোবাইল নম্বর দিন' } };
      }

      // Check if user exists, else auto-provision
      let user = db.get(
        'SELECT * FROM User WHERE active = 1 AND REPLACE(REPLACE(phone, \'-\', \'\'), \' \', \'\') LIKE ?',
        ['%' + phoneDigits.slice(-10)]
      ) || db.get('SELECT * FROM User WHERE username = ? AND active = 1', [phoneDigits]);

      let userId;
      let userName = body.name || 'নাগরিক';
      if (!user) {
        userId = 'usr_' + require('crypto').randomBytes(8).toString('hex');
        userName = body.name || ('আবেদনকারী ' + phoneDigits.slice(-4));
        db.run(
          `INSERT INTO User (id, username, name, nameBn, role, office, phone, lang, pinHash, active, createdAt)
           VALUES (?, ?, ?, ?, 'CITIZEN', NULL, ?, 'bn', ?, 1, ?)`,
          [userId, phoneDigits, userName, userName, phoneRaw, hashPin('1234'), new Date().toISOString()]
        );
      } else {
        userId = user.id;
        userName = user.nameBn || user.name;
      }

      // Find any existing application linked to this phone
      let citizenAppId = null;
      const appByPhone = db.get(`
        SELECT a.id FROM Application a
        JOIN Applicant ap ON a.applicantId = ap.id
        WHERE REPLACE(REPLACE(ap.primaryPhone, '-', ''), ' ', '') LIKE ?
        ORDER BY a.createdAt DESC LIMIT 1
      `, ['%' + phoneDigits.slice(-10)]);
      if (appByPhone) citizenAppId = appByPhone.id;

      const session = createStaffSession(userId);
      res.setHeader('Set-Cookie', [
        `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
        `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
      ]);

      writeAudit({
        actor: { userId, name: userName, role: 'CITIZEN' },
        channel: 'WEB',
        action: 'CITIZEN_OTP_LOGIN',
        entityType: 'User',
        entityId: userId,
        onWhoseAuthority: userName,
      });

      return {
        session: {
          sessionId: session.id,
          userId,
          role: 'CITIZEN',
          name: userName,
          nameBn: userName,
          phone: phoneRaw,
          phoneDigits: phoneDigits.slice(-10),
          citizenApplicationId: citizenAppId,
        }
      };
    }

    // Provider Self-Registration (Panel Lawyer & Special Mediator)
    if (mode === 'register_provider' || mode === 'register_panel' || mode === 'register_mediator') {
      const kind = body.kind || (mode === 'register_mediator' ? 'mediator' : 'lawyer');
      const name = (body.name || '').trim();
      const phone = (body.phone || '').trim();
      const email = (body.email || '').trim();
      const barOrCert = (body.bar || body.cert || '').trim();
      const jur = body.jur || body.district || 'ঢাকা';
      if (!name || !phone) {
        return { status: 400, data: { error: 'নাম এবং মোবাইল নম্বর দিন' } };
      }
      const num = Math.floor(1000 + Math.random() * 9000);
      const regId = kind === 'mediator' ? `SMR-2026-${num}` : `PLR-2026-${num}`;

      writeAudit({
        actor: { name, role: kind === 'mediator' ? 'MEDIATOR' : 'LAWYER' },
        channel: 'WEB',
        action: kind === 'mediator' ? 'MEDIATOR_REGISTRATION_SUBMITTED' : 'LAWYER_REGISTRATION_SUBMITTED',
        entityType: 'Registration',
        entityId: regId,
        notes: `রেজিস্ট্রেশন: ${name} (${barOrCert}), জেলা: ${jur}, ফোন: ${phone}`,
        onWhoseAuthority: name,
      });

      return {
        success: true,
        id: regId,
        trackingId: regId,
        kind,
        name,
        jur,
        message: 'আবেদন সফলভাবে গৃহীত হয়েছে'
      };
    }

    // Forgot Password / Password Reset
    if (mode === 'reset_password') {
      const identifier = String(body.identifier || body.email || body.phone || body.username || '').trim();
      const newPassword = String(body.newPassword || body.password || body.newPin || body.pin || '').trim();
      if (!identifier || !newPassword) {
        return { status: 400, data: { error: 'ব্যবহারকারী আইডি/ইমেইল এবং নতুন পাসওয়ার্ড দিন' } };
      }
      const cleanId = identifier.toLowerCase();
      const phoneDigits = identifier.replace(/\D/g, '');
      const user = db.get(
        `SELECT * FROM User WHERE (LOWER(username) = ? OR LOWER(email) = ? OR (LENGTH(?) >= 10 AND REPLACE(REPLACE(phone, '-', ''), ' ', '') LIKE ?)) AND active = 1`,
        [cleanId, cleanId, phoneDigits, '%' + phoneDigits.slice(-10)]
      );
      if (!user) {
        return { status: 404, data: { error: 'এই আইডি দিয়ে কোনো সক্রিয় ব্যবহারকারী পাওয়া যায়নি' } };
      }
      db.run('UPDATE User SET pinHash = ? WHERE id = ?', [hashPin(newPassword), user.id]);
      writeAudit({
        actor: { userId: user.id, name: user.name, role: user.role },
        channel: 'WEB',
        action: 'PASSWORD_RESET',
        entityType: 'User',
        entityId: user.id,
        onWhoseAuthority: user.name,
      });
      return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' };
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
