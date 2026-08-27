/**
 * Seed script — Creates admin user and sample events/albums.
 * Run: npm run seed
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../..', '.env') });
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { DB_PATH } = require('../config/database');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function seed() {
  console.log('🌱 Seeding database...');

  // ── Admin User ─────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@punefestival.com');
  if (!existing) {
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(uuid(), 'Admin', 'admin@punefestival.com', passwordHash, 'admin');
    console.log('✅ Admin user created: admin@punefestival.com / Admin@123');
  } else {
    // Update password to ensure it matches
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, 'admin@punefestival.com');
    console.log('ℹ️  Admin user updated with fresh password hash.');
  }

  // ── Sample Events ───────────────────────────────────────────────
  const events = [
    { name: 'Opening Ceremony', slug: 'opening-ceremony', year: 2025, description: 'Grand opening of Pune Festival 2025 with cultural performances and traditional rituals.' },
    { name: 'Music Events',     slug: 'music-events',     year: 2025, description: 'Classical and contemporary music performances featuring artists from across India.' },
    { name: 'Dance Events',     slug: 'dance-events',     year: 2025, description: 'Traditional and modern dance performances celebrating India\'s rich dance heritage.' },
    { name: 'Cultural Events',  slug: 'cultural-events',  year: 2025, description: 'Exhibitions, workshops, and cultural displays showcasing Pune\'s vibrant heritage.' },
    { name: 'Music',            slug: 'music-2024',        year: 2024, description: 'Music events from Pune Festival 2024.' },
    { name: 'Dance',            slug: 'dance-2024',        year: 2024, description: 'Dance performances from Pune Festival 2024.' },
  ];

  const insertEvent = db.prepare(
    'INSERT OR IGNORE INTO events (id, name, slug, year, description, is_published, display_order) VALUES (?, ?, ?, ?, ?, 1, ?)'
  );
  const insertAlbum = db.prepare(
    'INSERT OR IGNORE INTO albums (id, event_id, name, slug, description) VALUES (?, ?, ?, ?, ?)'
  );

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const evId = uuid();
    insertEvent.run(evId, ev.name, ev.slug, ev.year, ev.description, i);

    // Add sample albums to first two events
    if (i < 2) {
      const existingEvent = db.prepare('SELECT id FROM events WHERE slug = ?').get(ev.slug);
      const eid = existingEvent?.id || evId;
      insertAlbum.run(uuid(), eid, 'Highlights',        'highlights',        `Highlights from ${ev.name}`);
      insertAlbum.run(uuid(), eid, 'Behind the Scenes', 'behind-the-scenes', `Behind the scenes of ${ev.name}`);
    }
  }

  console.log('✅ Sample events and albums seeded.');
  console.log('');
  console.log('🎉 Database seeding complete!');
  console.log('─────────────────────────────────');
  console.log('Admin login: admin@punefestival.com');
  console.log('Password:    Admin@123');
  console.log('─────────────────────────────────');
  db.close();
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
