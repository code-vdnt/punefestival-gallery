const db = require('../config/database');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const EventModel = {
  async findAll({ includeUnpublished = false, year, page = 1, limit = 50 } = {}) {
    const conditions = [];
    const params = [];

    if (!includeUnpublished) conditions.push('e.is_published = 1');
    if (year) { conditions.push('e.year = ?'); params.push(year); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const { rows } = await db.query(
      `SELECT e.*,
         (SELECT COUNT(*) FROM albums a WHERE a.event_id = e.id) AS album_count,
         (SELECT COUNT(*) FROM photos p WHERE p.event_id = e.id AND p.is_published = 1) AS photo_count,
         COALESCE(e.cover_image_url, cp.thumbnail_path) AS cover_thumbnail,
         COALESCE(e.cover_image_url, cp.medium_path) AS cover_medium
       FROM events e
       LEFT JOIN photos cp ON cp.id = e.cover_image_id
       ${where}
       ORDER BY e.year DESC, e.display_order ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Normalize is_published boolean
    return rows.map(r => ({ 
      ...r, 
      is_published: r.is_published === 1 || r.is_published === true,
      cover_image_url: r.cover_image_url || r.cover_medium || r.cover_thumbnail || null
    }));
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT e.*, 
         COALESCE(e.cover_image_url, cp.thumbnail_path) AS cover_thumbnail,
         COALESCE(e.cover_image_url, cp.medium_path) AS cover_medium
       FROM events e
       LEFT JOIN photos cp ON cp.id = e.cover_image_id
       WHERE e.id = ?`,
      [id]
    );
    const r = rows[0];
    if (!r) return null;
    return { 
      ...r, 
      is_published: r.is_published === 1 || r.is_published === true,
      cover_image_url: r.cover_image_url || r.cover_medium || r.cover_thumbnail || null
    };
  },

  async findBySlug(slug) {
    const { rows } = await db.query(
      `SELECT e.*, 
         COALESCE(e.cover_image_url, cp.thumbnail_path) AS cover_thumbnail,
         COALESCE(e.cover_image_url, cp.medium_path) AS cover_medium
       FROM events e
       LEFT JOIN photos cp ON cp.id = e.cover_image_id
       WHERE e.slug = ?`,
      [slug]
    );
    const r = rows[0];
    if (!r) return null;
    return {
      ...r,
      is_published: r.is_published === 1 || r.is_published === true,
      cover_image_url: r.cover_image_url || r.cover_medium || r.cover_thumbnail || null
    };
  },

  async getYears() {
    const { rows } = await db.query(
      'SELECT DISTINCT year FROM events WHERE is_published = 1 ORDER BY year DESC'
    );
    return rows.map(r => r.year);
  },

  async create({ name, slug, year, description, coverImageUrl = null, displayOrder = 0 }) {
    const { rows } = await db.query(
      'INSERT INTO events (name, slug, year, description, cover_image_url, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, slug, year, description, coverImageUrl, displayOrder]
    );
    const r = rows[0];
    return r ? { ...r, is_published: r.is_published === 1 } : null;
  },

  async update(id, fields) {
    const sets = [];
    const params = [];
    const allowed = ['name', 'slug', 'year', 'description', 'cover_image_id', 'cover_image_url', 'is_published', 'display_order'];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        params.push(key === 'is_published' ? (value ? 1 : 0) : value);
        sets.push(`${key} = ?`);
      }
    }
    if (sets.length === 0) return null;
    sets.push(`updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')`);
    params.push(id);

    await db.query(`UPDATE events SET ${sets.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async delete(id) {
    const { rowCount } = await db.query('DELETE FROM events WHERE id = ?', [id]);
    return rowCount > 0;
  },

  async getStats() {
    const { rows } = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM events) AS total_events,
         (SELECT COUNT(*) FROM albums) AS total_albums,
         (SELECT COUNT(*) FROM photos) AS total_photos`
    );
    return rows[0];
  },
};

module.exports = EventModel;
