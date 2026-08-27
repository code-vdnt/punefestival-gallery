const db = require('../config/database');

const AlbumModel = {
  async findAll({ eventId } = {}) {
    const conditions = [];
    const params = [];

    if (eventId) { conditions.push('a.event_id = ?'); params.push(eventId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await db.query(
      `SELECT a.*,
         e.name AS event_name, e.slug AS event_slug, e.year,
         (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id AND p.is_published = 1) AS photo_count,
         cp.thumbnail_path AS cover_thumbnail
       FROM albums a
       JOIN events e ON e.id = a.event_id
       LEFT JOIN photos cp ON cp.id = a.cover_image_id
       ${where}
       ORDER BY a.display_order ASC, a.created_at DESC`,
      params
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT a.*, e.name AS event_name, e.slug AS event_slug, e.year,
         cp.thumbnail_path AS cover_thumbnail
       FROM albums a
       JOIN events e ON e.id = a.event_id
       LEFT JOIN photos cp ON cp.id = a.cover_image_id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ eventId, name, slug, description, displayOrder = 0 }) {
    const { rows } = await db.query(
      'INSERT INTO albums (event_id, name, slug, description, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [eventId, name, slug, description, displayOrder]
    );
    return rows[0];
  },

  async update(id, fields) {
    const sets = [];
    const params = [];
    const allowed = ['name', 'slug', 'description', 'cover_image_id', 'display_order', 'event_id'];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key) && value !== undefined) {
        params.push(value);
        sets.push(`${key} = ?`);
      }
    }
    if (sets.length === 0) return null;
    sets.push(`updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')`);
    params.push(id);

    await db.query(`UPDATE albums SET ${sets.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async delete(id) {
    const { rowCount } = await db.query('DELETE FROM albums WHERE id = ?', [id]);
    return rowCount > 0;
  },
};

module.exports = AlbumModel;
