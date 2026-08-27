const AlbumModel = require('../models/albums');
const EventModel = require('../models/events');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const AlbumsController = {
  async getAll(req, res) {
    try {
      const { eventId, event_id } = req.query;
      const albums = await AlbumModel.findAll({ eventId: eventId || event_id });
      res.json({ albums });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch albums' });
    }
  },

  async getOne(req, res) {
    try {
      const album = await AlbumModel.findById(req.params.id);
      if (!album) return res.status(404).json({ error: 'Album not found' });
      res.json({ album });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch album' });
    }
  },

  async create(req, res) {
    try {
      const { event_id, name, description } = req.body;
      if (!event_id || !name) {
        return res.status(400).json({ error: 'event_id and name are required' });
      }

      const event = await EventModel.findById(event_id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const slug = slugify(name);
      const album = await AlbumModel.create({ eventId: event_id, name, slug, description });
      res.status(201).json({ album });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'An album with this name already exists in this event' });
      }
      console.error('Create album error:', err);
      res.status(500).json({ error: 'Failed to create album' });
    }
  },

  async update(req, res) {
    try {
      const { name, description, cover_image_id, display_order, event_id } = req.body;
      const updates = {};
      if (name !== undefined) { updates.name = name; updates.slug = slugify(name); }
      if (description !== undefined) updates.description = description;
      if (cover_image_id !== undefined) updates.cover_image_id = cover_image_id;
      if (display_order !== undefined) updates.display_order = display_order;
      if (event_id !== undefined) updates.event_id = event_id;

      const album = await AlbumModel.update(req.params.id, updates);
      if (!album) return res.status(404).json({ error: 'Album not found' });
      res.json({ album });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update album' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await AlbumModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Album not found' });
      res.json({ message: 'Album deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete album' });
    }
  },
};

module.exports = AlbumsController;
