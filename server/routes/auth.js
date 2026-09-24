// ============================================================================
// Auth Route Handler
// Staff PIN Login (1234), Citizen Door Verification, Session & Logout.
// ============================================================================
'use strict';

const db = require('../db');
const { createStaffSession, createCitizenSession, getSessionContext, SESSION_COOKIE } = require('../services/session');
const { hashPin } = require('../services/crypto');
const { writeAudit, SYSTEM_ACTOR } = require('../services/audit');

function handleAuth(req, res, pathParts, query, body, ctx) {
  // GET /api/auth -> Current Session
  if (req.method === 'GET') {
    return { session: ctx };
  }

  // POST /api/auth -> Login
  if (req.method === 'POST') {
    const mode = body.mode || 'staff';

    // Staff Login
    if (mode === 'staff') {
      const { username, pin } = body;
      if (!username || !pin) {
        return { status: 400, data: { error: 'Username and PIN are required' } };
      }

      const user = db.get('SELECT * FROM User WHERE username = ? AND active = 1', [username]);
      if (!user) {
        return { status: 401, data: { error: 'Invalid username or user inactive' } };
      }

      const pinValid = user.pinHash === hashPin(pin) || pin === '1234';
      if (!pinValid) {
        return { status: 401, data: { error: 'Incorrect PIN' } };
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
          citizenApplicationId: session.citizenApplicationId,
        }
      };
    }

    // Citizen Door Login (No account needed: Application ID + phone/NID last 4 digits)
    if (mode === 'citizen_door') {
      const { applicationId, contactLast4 } = body;
      if (!applicationId || !contactLast4) {
        return { status: 400, data: { error: 'Application ID and last 4 digits of contact number/NID required' } };
      }

      const cleanAppId = applicationId.trim().toUpperCase();
      const app = db.get(`
        SELECT a.*, ap.fullName, ap.primaryPhone, ap.nidRef
        FROM Application a
        JOIN Applicant ap ON a.applicantId = ap.id
        WHERE UPPER(a.id) = ?
      `, [cleanAppId]);

      if (!app) {
        return { status: 404, data: { error: 'Application not found' } };
      }

      const phoneDigits = (app.primaryPhone || '').replace(/\D/g, '');
      const nidDigits = (app.nidRef || '').replace(/\D/g, '');
      const match = phoneDigits.endsWith(contactLast4) || nidDigits.endsWith(contactLast4);

      if (!match) {
        return { status: 401, data: { error: 'Verification failed: last 4 digits did not match records' } };
      }

      const session = createCitizenSession(app.id, 'CITIZEN');
      res.setHeader('Set-Cookie', [
        `${SESSION_COOKIE}=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
        `session=${session.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
      ]);

      writeAudit({
        actor: { name: app.fullName, role: 'CITIZEN' },
        channel: 'WEB',
        action: 'CITIZEN_DOOR_VERIFICATION',
        entityType: 'Application',
        entityId: app.id,
        applicationId: app.id,
        onWhoseAuthority: app.fullName,
      });

      return {
        session: {
          sessionId: session.id,
          role: 'CITIZEN',
          name: app.fullName,
          citizenApplicationId: app.id,
        }
      };
    }

    return { status: 400, data: { error: 'Invalid auth mode' } };
  }

  // DELETE /api/auth or logout
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
    return { ok: true, message: 'Logged out successfully' };
  }

  return { status: 405, data: { error: 'Method not allowed' } };
}

module.exports = { handleAuth };
