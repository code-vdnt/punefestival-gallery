/**
 * SQLite Migration — Creates all tables for Pune Festival Gallery.
 * Run: npm run migrate
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../..', '.env') });
const Database = require('better-sqlite3');
const { DB_PATH } = require('../config/database');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('🔄 Running database migrations...');

db.exec(`
  -- Users
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random())%4+1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'admin',
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );

  -- Events
  CREATE TABLE IF NOT EXISTS events (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random())%4+1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name          TEXT NOT NULL,
    slug          TEXT UNIQUE NOT NULL,
    year          INTEGER NOT NULL,
    description   TEXT,
    cover_image_id TEXT,
    cover_image_url TEXT,
    is_published  INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);
  CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);

  -- Albums
  CREATE TABLE IF NOT EXISTS albums (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random())%4+1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    event_id      TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL,
    description   TEXT,
    cover_image_id TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    UNIQUE(event_id, slug)
  );

  CREATE INDEX IF NOT EXISTS idx_albums_event ON albums(event_id);

  -- Photos
  CREATE TABLE IF NOT EXISTS photos (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random())%4+1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    album_id        TEXT REFERENCES albums(id) ON DELETE SET NULL,
    title           TEXT,
    description     TEXT,
    tags            TEXT DEFAULT '[]',
    original_path   TEXT NOT NULL,
    thumbnail_path  TEXT NOT NULL,
    medium_path     TEXT NOT NULL,
    large_path      TEXT NOT NULL,
    file_size       INTEGER DEFAULT 0,
    width           INTEGER DEFAULT 0,
    height          INTEGER DEFAULT 0,
    is_published    INTEGER NOT NULL DEFAULT 1,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_photos_event ON photos(event_id);
  CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id);
  CREATE INDEX IF NOT EXISTS idx_photos_published ON photos(is_published);
  CREATE INDEX IF NOT EXISTS idx_photos_created ON photos(created_at);
`);

console.log('✅ SQLite migration completed.');
console.log(`📁 Database: ${DB_PATH}`);
db.close();
