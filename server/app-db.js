/**
 * আইনসহায় অ্যাপ ডেটাবেজ (app-db.json)
 * Handles client accounts, sessions, applications, and provider console workflows.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'app-db.json');

function emptyDb() {
  return {
    users: [],
    sessions: {},
    applications: [],
    complaints: [],
    chatlogs: [],
    otps: {},
    counters: { application: 4417, complaint: 100, user: 1, case: 900 }
  };
}

let db = null;

function load() {
  if (db) return db;
  try {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    const frontDb = path.join(__dirname, '..', 'Front', 'server', 'data', 'db.json');
    if (fs.existsSync(frontDb)) {
      try {
        db = JSON.parse(fs.readFileSync(frontDb, 'utf8'));
        save();
        return db;
      } catch (err) {}
    }
    db = emptyDb();
    save();
  }
  return db;
}

function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
  try {
    fs.renameSync(tmp, DB_PATH);
  } catch (err) {
    fs.copyFileSync(tmp, DB_PATH);
    fs.unlinkSync(tmp);
  }
}

function hashPassword(pw) {
  return require('crypto').createHash('sha256').update('dlas-salt::' + pw).digest('hex');
}

function nextId(kind, prefix, year) {
  const d = load();
  d.counters[kind] = (d.counters[kind] || 1000) + 1;
  return `${prefix}-${year || 2026}-${String(d.counters[kind]).padStart(5, '0')}`;
}

module.exports = { load, save, hashPassword, nextId, DB_PATH };
