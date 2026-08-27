/**
 * Seed script — Creates default admin user.
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
  console.log('🌱 Ensuring admin user exists...');

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
    console.log('ℹ️  Admin user credentials verified.');
  }

  console.log('');
  console.log('🎉 Database setup complete (No sample dummy events)!');
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
