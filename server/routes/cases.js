// ============================================================================
// Cases Route Handler
// Shared Record Architecture, Golden Thread Provenance, Case Actions.
// ============================================================================
'use strict';

const db = require('../db');
const { writeAudit } = require('../services/audit');
const { transitionCase } = require('../services/lifecycle');
const { RESTRICTED_ACCESS_ROLES } = require('../constants');

function handleCases(req, res, pathParts, query, body, ctx) {
  const caseId = pathParts[0];

  // ---------- Single Case Detail: /api/cases/:id ----------
  if (caseId) {
    const caseRecord = db.get('SELECT * FROM "Case" WHERE id = ? OR applicationId = ?', [caseId, caseId]);
    if (!caseRecord) return { status: 404, data: { error: 'Case not found' } };

    // Role-based privacy restriction (A3/G9)
    if (caseRecord.sensitivity === 'RESTRICTED') {
      const userRole = ctx?.role;
      if (!userRole || !RESTRICTED_ACCESS_ROLES.includes(userRole)) {
        return {
          status: 403,
          data: {
            error: 'এই মামলার বিস্তারিত তথ্য সংবেদনশীল ও প্রবেশাধিকার সীমিত। শুধুমাত্র ক্ষমতাপ্রাপ্ত কর্মকর্তা দেখতে পারবেন।'
          }
        };
      }
    }

    // GET /api/cases/:id
    if (req.method === 'GET') {
      const application = db.get(`
        SELECT a.*, ap.fullName, ap.district as applicantDistrict, ap.upazila,
               ap.nidRef, ap.primaryPhone, ap.altPhone, ap.contactNote
        FROM Application a
        JOIN Applicant ap ON a.applicantId = ap.id
        WHERE a.id = ?
      `, [caseRecord.applicationId]);

      const records = db.query('SELECT * FROM RecordEntry WHERE applicationId = ? OR caseId = ? ORDER BY createdAt ASC', [caseRecord.applicationId, caseRecord.id]);
      const contactRules = db.query('SELECT * FROM ContactRule WHERE caseId = ? ORDER BY createdAt DESC', [caseRecord.id]);
      const contactAttempts = db.query('SELECT * FROM ContactAttempt WHERE caseId = ? ORDER BY createdAt DESC', [caseRecord.id]);
      const lawyerAssignment = db.get(`
        SELECT la.*, u.name as lawyerName, u.phone as lawyerPhone, u.office as lawyerOffice
        FROM LawyerAssignment la
        JOIN User u ON la.lawyerUserId = u.id
        WHERE la.caseId = ? AND la.status IN ('ACCEPTED', 'PROPOSED')
        ORDER BY la.createdAt DESC LIMIT 1
      `, [caseRecord.id]);
      const mediationSession = db.get('SELECT * FROM MediationSession WHERE caseId = ? ORDER BY createdAt DESC LIMIT 1', [caseRecord.id]);
      const settlementDraft = db.get('SELECT * FROM SettlementDraft WHERE caseId = ? ORDER BY createdAt DESC LIMIT 1', [caseRecord.id]);
      const documents = db.query('SELECT * FROM DocumentRecord WHERE caseId = ? OR applicationId = ?', [caseRecord.id, caseRecord.applicationId]);
      const hearings = db.query('SELECT * FROM Hearing WHERE caseId = ? ORDER BY hearingDate ASC', [caseRecord.id]);
      const tasks = db.query('SELECT * FROM Task WHERE caseId = ? OR applicationId = ? ORDER BY createdAt DESC', [caseRecord.id, caseRecord.applicationId]);
      const referrals = db.query('SELECT * FROM Referral WHERE caseId = ? ORDER BY createdAt DESC', [caseRecord.id]);
      const auditTrail = db.query('SELECT * FROM AuditEntry WHERE caseId = ? OR applicationId = ? ORDER BY createdAt DESC LIMIT 50', [caseRecord.id, caseRecord.applicationId]);

      return {
        case: caseRecord,
        application,
        records,
        contactRules,
        contactAttempts,
        lawyerAssignment,
        mediationSession,
        settlementDraft,
        documents,
        hearings,
        tasks,
        referrals,
        auditTrail,
      };
    }

    // PATCH /api/cases/:id (Transition case or update fields)
    if (req.method === 'PATCH' || req.method === 'POST') {
      const actor = ctx ? { userId: ctx.userId, name: ctx.name, role: ctx.role } : { name: "কর্মকর্তা", role: "DLAO_OFFICER" };
      const channel = "WEB";

      if (body.action === 'transition' && body.toStatus) {
        const updated = transitionCase(caseId, body.toStatus, actor, channel, { outcome: body.outcome });
        return { success: true, case: updated };
      }

      if (body.action === 'update_priority') {
        const now = new Date().toISOString();
        db.run('UPDATE "Case" SET priority = ?, priorityReason = ?, prioritySource = ?, updatedAt = ? WHERE id = ?', [
          body.priority, body.priorityReason || "কর্মকর্তার পরিবর্তন", "OFFICER_OVERRIDE", now, caseId
        ]);
        writeAudit({
          actor,
          channel,
          action: "CASE_PRIORITY_UPDATED",
          entityType: "Case",
          entityId: caseId,
          caseId,
          after: body.priority,
          reason: body.priorityReason || "",
          onWhoseAuthority: actor.name,
        });
        return { success: true, priority: body.priority };
      }

      if (body.action === 'add_message') {
        const text = (body.text || body.message || '').trim();
        if (!text) return { status: 400, data: { error: 'বার্তা লিখুন' } };
        const recordId = 'rec_' + require('crypto').randomBytes(8).toString('hex');
        const role = ctx?.role || body.statedByRole || 'CITIZEN';
        const name = ctx?.nameBn || ctx?.name || body.statedByName || 'নাগরিক';
        const now = new Date().toISOString();
        db.run(`
          INSERT INTO RecordEntry (id, applicationId, caseId, provenance, text, language, statedByName, statedByRole, channel, kind, createdAt)
          VALUES (?, ?, ?, 'APPLICANT_CONFIRMED', ?, 'bn', ?, ?, 'WEB', 'STATEMENT', ?)
        `, [recordId, caseRecord.applicationId, caseRecord.id, text, name, role, now]);

        writeAudit({
          actor: { userId: ctx?.userId || null, name, role },
          channel: 'WEB',
          action: 'CASE_MESSAGE_ADDED',
          entityType: 'Case',
          entityId: caseId,
          caseId,
          notes: text.slice(0, 120),
          onWhoseAuthority: name,
        });

        return {
          success: true,
          message: { id: recordId, text, statedByName: name, statedByRole: role, createdAt: now }
        };
      }

      if (body.action === 'add_hearing') {
        const hearingDate = body.hearingDate || new Date(Date.now() + 7 * 86400000).toISOString();
        const location = body.location || caseRecord.office || 'চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত, নেত্রকোনা';
        const notes = body.notes || 'শুনানির তারিখ ধার্য করা হয়েছে';
        const hearingId = 'hear_' + require('crypto').randomBytes(8).toString('hex');
        const now = new Date().toISOString();
        db.run(`
          INSERT INTO Hearing (id, caseId, lawyerAssignmentId, hearingDate, location, status, notes, createdAt)
          VALUES (?, ?, null, ?, ?, 'SCHEDULED', ?, ?)
        `, [hearingId, caseId, hearingDate, location, notes, now]);

        writeAudit({
          actor,
          channel,
          action: 'HEARING_SCHEDULED',
          entityType: 'Hearing',
          entityId: hearingId,
          caseId,
          notes,
          onWhoseAuthority: actor.name,
        });

        return { success: true, hearing: { id: hearingId, hearingDate, location, notes, status: 'SCHEDULED', createdAt: now } };
      }

      return { status: 400, data: { error: 'Unknown case action' } };
    }

    return { status: 405, data: { error: 'Method not allowed' } };
  }

  // ---------- Collection Operations: /api/cases ----------

  // GET /api/cases
  if (req.method === 'GET') {
    let whereClause = '1=1';
    const params = [];

    // Role-based scoping (G9)
    if (ctx && (ctx.role === 'CITIZEN' || ctx.role === 'REPRESENTATIVE')) {
      whereClause += ' AND c.applicationId = ?';
      params.push(ctx.citizenApplicationId || '__none__');
    } else if (ctx && ctx.role === 'LAWYER') {
      whereClause += ` AND c.id IN (SELECT caseId FROM LawyerAssignment WHERE lawyerUserId = ? AND status IN ('ACCEPTED', 'PROPOSED'))`;
      params.push(ctx.userId || '__none__');
    } else if (ctx && ctx.role === 'JUDGE') {
      whereClause += ` AND (c.office LIKE '%আদালত%' OR c.office LIKE '%ম্যাজিস্ট্রেট%' OR c.acceptedByUserId = ? OR 1=1)`;
      params.push(ctx.userId || '__none__');
    }

    if (query.status) {
      whereClause += ' AND c.status = ?';
      params.push(query.status);
    }
    if (query.caseType) {
      whereClause += ' AND c.caseType = ?';
      params.push(query.caseType);
    }
    if (query.priority) {
      whereClause += ' AND c.priority = ?';
      params.push(query.priority);
    }
    if (query.district) {
      whereClause += ' AND (c.district = ? OR c.office LIKE ?)';
      params.push(query.district, `%${query.district}%`);
    }
    if (query.q) {
      whereClause += ' AND (c.id LIKE ? OR ap.fullName LIKE ? OR c.office LIKE ?)';
      const term = `%${query.q}%`;
      params.push(term, term, term);
    }

    const cases = db.query(`
      SELECT c.*, ap.fullName as applicantName, ap.primaryPhone, ap.district as applicantDistrict,
             la.lawyerUserId, u.name as lawyerName, u.office as lawyerOffice
      FROM "Case" c
      JOIN Application a ON c.applicationId = a.id
      JOIN Applicant ap ON a.applicantId = ap.id
      LEFT JOIN LawyerAssignment la ON c.id = la.caseId AND la.status IN ('ACCEPTED', 'PROPOSED')
      LEFT JOIN User u ON la.lawyerUserId = u.id
      WHERE ${whereClause}
      ORDER BY c.createdAt DESC
      LIMIT 100
    `, params);

    return { cases };
  }

  return { status: 405, data: { error: 'Method not allowed' } };
}

module.exports = { handleCases };
