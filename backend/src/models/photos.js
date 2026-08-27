const db = require('../config/database');

const PhotoModel = {
  async findAll({
    eventId, albumId, year, search,
    onlyPublished = true,
    page = 1, limit = 24,
    orderBy = 'display_order', orderDir = 'ASC',
  } = {}) {
    const conditions = [];
    const params = [];

    if (onlyPublished) conditions.push('p.is_published = 1');
    if (eventId) { conditions.push('p.event_id = ?'); params.push(eventId); }
    if (albumId) { conditions.push('p.album_id = ?'); params.push(albumId); }
    if (year)    { conditions.push('e.year = ?'); params.push(year); }
    if (search)  { conditions.push('(p.title LIKE ? OR p.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const validOrder = ['display_order', 'created_at', 'title'];
    const safeOrderBy = validOrder.includes(orderBy) ? `p.${orderBy}` : 'p.display_order';
    const safeDir = orderDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM photos p
      JOIN events e ON e.id = p.event_id
      LEFT JOIN albums a ON a.id = p.album_id
      ${where}`;

    const rowsSql = `
      SELECT p.*,
        e.name AS event_name, e.slug AS event_slug, e.year,
        a.name AS album_name, a.slug AS album_slug
      FROM photos p
      JOIN events e ON e.id = p.event_id
      LEFT JOIN albums a ON a.id = p.album_id
      ${where}
      ORDER BY ${safeOrderBy} ${safeDir}, p.created_at DESC
      LIMIT ? OFFSET ?`;

    const [countRes, rowsRes] = await Promise.all([
      db.query(countSql, params),
      db.query(rowsSql, [...params, limit, offset]),
    ]);

    const total = countRes.rows[0]?.total || 0;
    const photos = rowsRes.rows.map(r => ({
      ...r,
      is_published: r.is_published === 1 || r.is_published === true,
      tags: typeof r.tags === 'string' ? (() => { try { return JSON.parse(r.tags); } catch { return []; } })() : (r.tags || []),
    }));

    return { photos, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT p.*, e.name AS event_name, e.slug AS event_slug, e.year,
         a.name AS album_name, a.slug AS album_slug
       FROM photos p
       JOIN events e ON e.id = p.event_id
       LEFT JOIN albums a ON a.id = p.album_id
       WHERE p.id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      is_published: r.is_published === 1 || r.is_published === true,
      tags: typeof r.tags === 'string' ? (() => { try { return JSON.parse(r.tags); } catch { return []; } })() : (r.tags || []),
    };
  },

  async create({ eventId, albumId, title, description, tags, originalPath, thumbnailPath, mediumPath, largePath, fileSize, width, height, displayOrder = 0 }) {
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
    const { rows } = await db.query(
      `INSERT INTO photos
         (event_id, album_id, title, description, tags, original_path, thumbnail_path, medium_path, large_path, file_size, width, height, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [eventId, albumId || null, title || null, description || null, tagsJson, originalPath, thumbnailPath, mediumPath, largePath, fileSize || 0, width || 0, height || 0, displayOrder]
    );
    const r = rows[0];
    if (!r) return null;
    return { ...r, is_published: r.is_published === 1, tags: JSON.parse(r.tags || '[]') };
  },

  async update(id, fields) {
    const sets = [];
    const params = [];
    const allowed = ['title', 'description', 'tags', 'is_published', 'display_order', 'event_id', 'album_id'];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key) && value !== undefined) {
        if (key === 'tags') params.push(JSON.stringify(Array.isArray(value) ? value : []));
        else if (key === 'is_published') params.push(value ? 1 : 0);
        else params.push(value);
        sets.push(`${key} = ?`);
      }
    }
    if (sets.length === 0) return null;
    sets.push(`updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')`);
    params.push(id);

    await db.query(`UPDATE photos SET ${sets.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async bulkUpdateAlbum(photoIds, albumId) {
    const raw = db.rawDb;
    const placeholders = photoIds.map(() => '?').join(',');
    const info = raw.prepare(`UPDATE photos SET album_id = ? WHERE id IN (${placeholders})`).run(albumId, ...photoIds);
    return info.changes;
  },

  async bulkDelete(photoIds) {
    const raw = db.rawDb;
    const placeholders = photoIds.map(() => '?').join(',');
    const rows = raw.prepare(`SELECT original_path, thumbnail_path, medium_path, large_path FROM photos WHERE id IN (${placeholders})`).all(...photoIds);
    raw.prepare(`DELETE FROM photos WHERE id IN (${placeholders})`).run(...photoIds);
    return rows;
  },

  async delete(id) {
    const { rows } = await db.query(
      'SELECT original_path, thumbnail_path, medium_path, large_path FROM photos WHERE id = ?',
      [id]
    );
    if (!rows[0]) return null;
    await db.query('DELETE FROM photos WHERE id = ?', [id]);
    return rows[0];
  },

  async getRecentUploads(limit = 10) {
    const { rows } = await db.query(
      `SELECT p.*, e.name AS event_name, a.name AS album_name
       FROM photos p
       JOIN events e ON e.id = p.event_id
       LEFT JOIN albums a ON a.id = p.album_id
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map(r => ({
      ...r,
      is_published: r.is_published === 1,
      tags: typeof r.tags === 'string' ? (() => { try { return JSON.parse(r.tags); } catch { return []; } })() : [],
    }));
  },
};

module.exports = PhotoModel;
