/**
 * SQLite adapter with a pg-compatible interface.
 *
 * Provides pool.query(sql, params) and pool.connect() just like the pg Pool,
 * so all models and controllers work without changes.
 *
 * SQLite uses ? placeholders; pg uses $1, $2 …
 * This adapter converts $N → ? automatically.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(DB_DIR, 'gallery.db');
const db = new Database(DB_PATH);

// Enable WAL mode and Foreign Keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Convert PostgreSQL $1, $2, … placeholders to SQLite ?
 */
function convertPlaceholders(sql) {
  return sql.replace(/\$\d+/g, '?');
}

/**
 * Normalize params
 */
function normalizeParams(params) {
  if (!params) return [];
  return params.map(p => {
    if (p === null || p === undefined) return null;
    if (typeof p === 'boolean') return p ? 1 : 0;
    if (Array.isArray(p)) return JSON.stringify(p);
    return p;
  });
}

/**
 * Normalize SQLite row
 */
function normalizeRow(row) {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === 'string' && v.startsWith('[')) {
      try { out[k] = JSON.parse(v); } catch { out[k] = v; }
    } else if (k === 'is_published') {
      out[k] = (v === 1 || v === true);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * pg-compatible query function.
 * Returns { rows: [...], rowCount: N }
 */
function query(sql, params = []) {
  const converted = convertPlaceholders(sql);
  const normalizedParams = normalizeParams(params);

  const isReturning = /RETURNING/i.test(sql);
  const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sql);

  try {
    const stmt = db.prepare(converted);

    if (isSelect || isReturning) {
      const rawRows = stmt.all(...normalizedParams);
      return Promise.resolve({
        rows: rawRows.map(normalizeRow),
        rowCount: rawRows.length,
      });
    } else {
      const info = stmt.run(...normalizedParams);
      return Promise.resolve({
        rows: [],
        rowCount: info.changes,
      });
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

function connect() {
  return Promise.resolve({
    query,
    release: () => {},
  });
}

function end() {
  return Promise.resolve();
}

module.exports = {
  query,
  connect,
  end,
  rawDb: db,
  DB_PATH,
};
