// ============================================================================
// DLAS SQLite Data Spine wrapper using native Node.js node:sqlite (DatabaseSync)
// Zero-dependency, thread-safe, synchronous and blazing fast.
// ============================================================================
'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'data', 'dev.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open SQLite database
const sqlite = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for high performance & integrity
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');

const db = {
  raw: sqlite,

  query(sql, params = []) {
    try {
      const stmt = sqlite.prepare(sql);
      return stmt.all(...params);
    } catch (err) {
      console.error('[DB Query Error]', err.message, '\nSQL:', sql, '\nParams:', params);
      throw err;
    }
  },

  all(sql, params = []) {
    return this.query(sql, params);
  },

  get(sql, params = []) {
    try {
      const stmt = sqlite.prepare(sql);
      const row = stmt.get(...params);
      return row || null;
    } catch (err) {
      console.error('[DB Get Error]', err.message, '\nSQL:', sql, '\nParams:', params);
      throw err;
    }
  },

  run(sql, params = []) {
    try {
      const stmt = sqlite.prepare(sql);
      return stmt.run(...params);
    } catch (err) {
      console.error('[DB Run Error]', err.message, '\nSQL:', sql, '\nParams:', params);
      throw err;
    }
  },

  exec(sql) {
    return sqlite.exec(sql);
  },

  transaction(fn) {
    sqlite.exec('BEGIN IMMEDIATE TRANSACTION;');
    try {
      const result = fn(db);
      sqlite.exec('COMMIT;');
      return result;
    } catch (err) {
      sqlite.exec('ROLLBACK;');
      throw err;
    }
  },

  nextId(prefix) {
    const year = new Date().getFullYear();
    const key = `${prefix}-${year}`;
    let val = 1;

    // Use transaction to atomically increment Counter
    this.transaction(() => {
      const existing = this.get('SELECT value FROM Counter WHERE key = ?', [key]);
      if (existing) {
        val = existing.value + 1;
        this.run('UPDATE Counter SET value = ? WHERE key = ?', [val, key]);
      } else {
        val = 1;
        this.run('INSERT INTO Counter (key, value) VALUES (?, ?)', [key, val]);
      }
    });

    return `${prefix}-${year}-${String(val).padStart(4, '0')}`;
  }
};

module.exports = db;
