// ============================================================================
// Applications Route Handler
// 5 Doors Intake, Provenance Tracking, Review & Acceptance (Case ID Minting).
// ============================================================================
'use strict';

const crypto = require('crypto');
const db = require('../db');
const { writeAudit, SYSTEM_ACTOR } = require('../services/audit');
const { acceptApplication, assertApplicationTransition } = require('../services/lifecycle');
const { CHANNEL_LIST, CASE_TYPE_IDS, PROVENANCE_LIST } = require('../constants');

function handleApplications(req, res, pathParts, query, body, ctx) {
  const appId = pathParts[0];

  // ---------- Single Application Operations: /api/applications/:id ----------
  if (appId) {
    const app = db.get(`
      SELECT a.*, ap.fullName, ap.district as applicantDistrict, ap.upazila,
             ap.nidRef, ap.primaryPhone, ap.altPhone, ap.contactNote
      FROM Application a
      JOIN Applicant ap ON a.applicantId = ap.id
      WHERE a.id = ?
    `, [appId]);

    if (!app) return { status: 404, data: { error: 'Application not found' } };

    // GET /api/applications/:id
    if (req.method === 'GET') {
      const records = db.query('SELECT * FROM RecordEntry WHERE applicationId = ? ORDER BY createdAt ASC', [appId]);
      const tasks = db.query('SELECT * FROM Task WHERE applicationId = ? OR caseId = ? ORDER BY createdAt DESC', [appId, app.caseId || '']);
      const documents = db.query('SELECT * FROM DocumentRecord WHERE applicationId = ? OR caseId = ?', [appId, app.caseId || '']);
      const consents = db.query('SELECT * FROM Consent WHERE applicationId = ?', [appId]);
      const caseRecord = app.caseId ? db.get('SELECT * FROM "Case" WHERE id = ?', [app.caseId]) : null;

      return {
        application: app,
        records,
        tasks,
        documents,
        consents,
        case: caseRecord,
      };
    }

    // POST /api/applications/:id (Transition actions: start_review, accept, reject, request_info)
    if (req.method === 'POST') {
      const action = body.action;
      const actor = ctx ? { userId: ctx.userId, name: ctx.name, role: ctx.role } : { name: "দায়িত্বপ্রাপ্ত কর্মকর্তা", role: "DLAO_OFFICER" };
      const channel = "WEB";
      const now = new Date().toISOString();

      if (action === 'start_review') {
        assertApplicationTransition(app.status, "UNDER_REVIEW");
        db.run('UPDATE Application SET status = ?, updatedAt = ? WHERE id = ?', ["UNDER_REVIEW", now, appId]);
        writeAudit({
          actor,
          channel,
          action: "APPLICATION_REVIEW_STARTED",
          entityType: "Application",
          entityId: appId,
          applicationId: appId,
          before: app.status,
          after: "UNDER_REVIEW",
          onWhoseAuthority: actor.name,
        });
        return { success: true, status: "UNDER_REVIEW" };
      }

      if (action === 'accept') {
        // Mint Case ID and transition
        const newCase = acceptApplication(appId, actor, channel, {
          priority: body.priority || "MEDIUM",
          priorityReason: body.priorityReason || "কর্মকর্তার সিদ্ধান্ত",
          sensitive: !!body.sensitive,
        });
        return { success: true, caseId: newCase.id, status: "CONVERTED_TO_CASE" };
      }

      if (action === 'reject') {
        assertApplicationTransition(app.status, "REJECTED");
        const reason = body.reason || "আইনি সহায়তার মানদণ্ড পূরণ হয়নি";
        db.run('UPDATE Application SET status = ?, updatedAt = ? WHERE id = ?', ["REJECTED", now, appId]);
        writeAudit({
          actor,
          channel,
          action: "APPLICATION_REJECTED",
          entityType: "Application",
          entityId: appId,
          applicationId: appId,
          before: app.status,
          after: "REJECTED",
          reason,
          onWhoseAuthority: actor.name,
        });
        return { success: true, status: "REJECTED", reason };
      }

      if (action === 'request_info') {
        assertApplicationTransition(app.status, "MORE_INFO_NEEDED");
        const note = body.note || "অতিরিক্ত তথ্য প্রয়োজন";
        db.run('UPDATE Application SET status = ?, updatedAt = ? WHERE id = ?', ["MORE_INFO_NEEDED", now, appId]);
        writeAudit({
          actor,
          channel,
          action: "MORE_INFO_REQUESTED",
          entityType: "Application",
          entityId: appId,
          applicationId: appId,
          before: app.status,
          after: "MORE_INFO_NEEDED",
          reason: note,
          onWhoseAuthority: actor.name,
        });
        return { success: true, status: "MORE_INFO_NEEDED" };
      }

      return { status: 400, data: { error: `Unknown action: ${action}` } };
    }

    return { status: 405, data: { error: 'Method not allowed' } };
  }

  // ---------- Collection Operations: /api/applications ----------

  // GET /api/applications
  if (req.method === 'GET') {
    let whereClause = '1=1';
    const params = [];

    // Role-based privacy (G9): CITIZEN / REPRESENTATIVE see only their bound application
    if (ctx && (ctx.role === 'CITIZEN' || ctx.role === 'REPRESENTATIVE')) {
      whereClause += ' AND a.id = ?';
      params.push(ctx.citizenApplicationId || '__none__');
    }

    if (query.status) {
      whereClause += ' AND a.status = ?';
      params.push(query.status);
    }
    if (query.q) {
      whereClause += ' AND (a.id LIKE ? OR a.narrative LIKE ? OR ap.fullName LIKE ?)';
      const term = `%${query.q}%`;
      params.push(term, term, term);
    }

    const applications = db.query(`
      SELECT a.*, ap.fullName, ap.district as applicantDistrict, ap.primaryPhone,
             c.id as caseId, c.status as caseStatus
      FROM Application a
      JOIN Applicant ap ON a.applicantId = ap.id
      LEFT JOIN "Case" c ON a.caseId = c.id
      WHERE ${whereClause}
      ORDER BY a.createdAt DESC
      LIMIT 100
    `, params);

    return { applications };
  }

  // POST /api/applications (New Application Submission)
  if (req.method === 'POST') {
    const {
      channel = "WEB",
      caseType,
      narrative,
      district,
      applicantName,
      applicantPhone,
      applicantNidRef,
      upazila,
      urgencyFlag = false,
      sensitiveFlag = false,
      provenance = "APPLICANT_CONFIRMED",
      tempUuid,
      assistedByUserId,
      consentScope,
      contactNote,
    } = body;

    if (!channel || !caseType || !narrative || !district || !applicantName || !provenance) {
      return { status: 400, data: { error: "Missing required fields: channel, caseType, narrative, district, applicantName, provenance" } };
    }

    if (!CHANNEL_LIST.includes(channel)) return { status: 400, data: { error: `INVALID_CHANNEL: ${channel}` } };
    if (!CASE_TYPE_IDS.includes(caseType)) return { status: 400, data: { error: `INVALID_CASE_TYPE: ${caseType}` } };
    if (!PROVENANCE_LIST.includes(provenance)) return { status: 400, data: { error: `INVALID_PROVENANCE: ${provenance}` } };

    // T9 Idempotency check: if tempUuid already synced, return existing application
    if (tempUuid) {
      const existingSync = db.get('SELECT * FROM OfflineSyncRecord WHERE tempUuid = ?', [tempUuid]);
      if (existingSync) {
        return {
          applicationId: existingSync.syncedEntityId,
          duplicateOfTempUuid: tempUuid,
          alreadySynced: true
        };
      }
    }

    const applicationId = db.nextId('APP');
    const applicantId = 'applc_' + crypto.randomBytes(8).toString('hex');
    const office = `জেলা আইনি সহায়তা কার্যালয়, ${district}`;
    const now = new Date().toISOString();

    const actor = ctx
      ? { userId: ctx.userId, name: ctx.name, role: ctx.role }
      : { name: applicantName, role: "CITIZEN" };

    db.transaction(() => {
      // 1. Create Applicant
      db.run(`
        INSERT INTO Applicant (id, fullName, district, upazila, nidRef, primaryPhone, contactNote, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [applicantId, applicantName, district, upazila || null, applicantNidRef || null, applicantPhone || null, contactNote || null, now]);

      // 2. Create Application
      db.run(`
        INSERT INTO Application (
          id, applicantId, channel, status, caseType, narrative,
          district, office, urgencyFlag, sensitiveFlag, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        applicationId, applicantId, channel, "SUBMITTED", caseType, narrative,
        district, office, urgencyFlag ? 1 : 0, sensitiveFlag ? 1 : 0, now, now
      ]);

      // 3. Create initial RecordEntry with Provenance
      const entryId = 'rec_' + crypto.randomBytes(8).toString('hex');
      db.run(`
        INSERT INTO RecordEntry (
          id, applicationId, kind, text, provenance,
          statedByName, statedByRole, channel, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        entryId, applicationId, "STATEMENT", narrative, provenance,
        applicantName, "APPLICANT", channel, now
      ]);

      // 4. If assisted UDC intake: record consent and free service notice (B4)
      if (channel === "ASSISTED_UDC") {
        const consentId = 'cons_' + crypto.randomBytes(8).toString('hex');
        db.run(`
          INSERT INTO Consent (
            id, applicationId, scope, scopeDetail, authorityStatus,
            grantedByApplicantId, representativeUserId, representativeName,
            relationship, channel, grantedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          consentId, applicationId, consentScope || "FULL_INTAKE",
          "ইউডিসি উদ্যোক্তার সহায়তায় আবেদন প্রস্তুত ও দাখিল", "ACTIVE",
          applicantId, assistedByUserId || null, representativeName || "UDC উদ্যোক্তা",
          "REPRESENTATIVE", channel, now
        ]);
      }

      // 5. If tempUuid provided, record offline sync record (T9)
      if (tempUuid) {
        const syncId = 'sync_' + crypto.randomBytes(8).toString('hex');
        db.run(`
          INSERT INTO OfflineSyncRecord (id, tempUuid, entityType, syncedEntityId, syncedAt)
          VALUES (?, ?, ?, ?, ?)
        `, [syncId, tempUuid, "Application", applicationId, now]);
      }
    });

    // Write audit trail
    writeAudit({
      actor,
      channel,
      action: "APPLICATION_SUBMITTED",
      entityType: "Application",
      entityId: applicationId,
      applicationId,
      onWhoseAuthority: applicantName,
      metadata: { caseType, district, channel, provenance }
    });

    return {
      success: true,
      applicationId,
      freeServiceNotice: "এই সেবা সম্পূর্ণ বিনামূল্যে — আবেদন ফি, আইনজীবীর ফি বা আদালত ফি কিছুই দিতে হবে না (B4)। কেউ টাকা চাইলে ১৬৬৯৯-এ জানান।",
      nextSteps: [
        "একজন কর্মকর্তা যাচাই করবেন আপনি বিনামূল্যে আইনি সহায়তার যোগ্য কিনা।",
        "আবেদন গৃহীত হলে এসএমএসে কেস আইডি পাবেন।",
        "এই আইডি দিয়েই 'আবেদন ট্র্যাক করুন' পেজে অবস্থা দেখতে পারবেন।"
      ]
    };
  }

  return { status: 405, data: { error: 'Method not allowed' } };
}

module.exports = { handleApplications };
