const EventModel = require('../models/events');
const { processImage } = require('../services/imageProcessor');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const EventsController = {
  async getAll(req, res) {
    try {
      const { year, page, limit } = req.query;
      const isAdmin = req.user?.role === 'admin';
      const events = await EventModel.findAll({
        includeUnpublished: isAdmin,
        year: year ? parseInt(year) : undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
      });
      const years = await EventModel.getYears();
      res.json({ events, years });
    } catch (err) {
      console.error('Get events error:', err);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  },

  async getOne(req, res) {
    try {
      const event = await EventModel.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      res.json({ event });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  },

  async create(req, res) {
    try {
      const { name, year, description } = req.body;
      if (!name || !year) {
        return res.status(400).json({ error: 'Name and year are required' });
      }

      let slug = slugify(name + '-' + year);
      let existing = await EventModel.findBySlug(slug);
      if (existing) slug = slug + '-' + Date.now();

      let coverImageUrl = null;

      // Handle uploaded cover image file
      if (req.file) {
        try {
          const processed = await processImage(req.file.buffer, {
            year: String(year),
            eventSlug: slug,
            originalName: req.file.originalname,
          });
          coverImageUrl = processed.paths.medium || processed.paths.thumbnail;
        } catch (imgErr) {
          console.error('Failed to process cover image:', imgErr);
        }
      }

      const event = await EventModel.create({
        name,
        slug,
        year: parseInt(year),
        description,
        coverImageUrl,
        displayOrder: 0,
      });

      res.status(201).json({ event });
    } catch (err) {
      console.error('Create event error:', err);
      res.status(500).json({ error: 'Failed to create event' });
    }
  },

  async update(req, res) {
    try {
      const { name, year, description, is_published, display_order, cover_image_id, cover_image_url, remove_cover } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (year !== undefined) updates.year = parseInt(year);
      if (description !== undefined) updates.description = description;
      if (is_published !== undefined) updates.is_published = is_published === 'true' || is_published === true;
      if (display_order !== undefined) updates.display_order = parseInt(display_order);
      if (cover_image_id !== undefined) updates.cover_image_id = cover_image_id;
      if (name) updates.slug = slugify(name + '-' + (year || ''));

      // If explicit remove cover request
      if (remove_cover === 'true' || remove_cover === true) {
        updates.cover_image_url = null;
        updates.cover_image_id = null;
      } else if (cover_image_url !== undefined) {
        updates.cover_image_url = cover_image_url;
      }

      // If new cover image file uploaded
      if (req.file) {
        const currentEvent = await EventModel.findById(req.params.id);
        const eventYear = year || currentEvent?.year || new Date().getFullYear();
        const eventSlug = updates.slug || currentEvent?.slug || 'event';

        try {
          const processed = await processImage(req.file.buffer, {
            year: String(eventYear),
            eventSlug,
            originalName: req.file.originalname,
          });
          updates.cover_image_url = processed.paths.medium || processed.paths.thumbnail;
        } catch (imgErr) {
          console.error('Failed to process cover image:', imgErr);
        }
      }

      const event = await EventModel.update(req.params.id, updates);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      res.json({ event });
    } catch (err) {
      console.error('Update event error:', err);
      res.status(500).json({ error: 'Failed to update event' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await EventModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Event not found' });
      res.json({ message: 'Event deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete event' });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await EventModel.getStats();
      res.json({ stats });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  },
};

module.exports = EventsController;
