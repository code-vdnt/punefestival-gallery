const PhotoModel = require('../models/photos');
const EventModel = require('../models/events');
const { processImage } = require('../services/imageProcessor');
const storage = require('../config/storage');
const path = require('path');

const PhotosController = {
  async getAll(req, res) {
    try {
      const {
        event_id, album_id, year, search, tags,
        page = 1, limit = 24, orderBy, orderDir,
      } = req.query;

      const isAdmin = req.user?.role === 'admin';

      const result = await PhotoModel.findAll({
        eventId: event_id,
        albumId: album_id,
        year: year ? parseInt(year) : undefined,
        search,
        tags: tags ? tags.split(',') : undefined,
        onlyPublished: !isAdmin,
        page: parseInt(page),
        limit: Math.min(parseInt(limit) || 24, 100),
        orderBy,
        orderDir,
      });

      res.json(result);
    } catch (err) {
      console.error('Get photos error:', err);
      res.status(500).json({ error: 'Failed to fetch photos' });
    }
  },

  async getOne(req, res) {
    try {
      const photo = await PhotoModel.findById(req.params.id);
      if (!photo) return res.status(404).json({ error: 'Photo not found' });
      res.json({ photo });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch photo' });
    }
  },

  async upload(req, res) {
    try {
      const { event_id, album_id, title, description, tags } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      if (!event_id) {
        return res.status(400).json({ error: 'event_id is required' });
      }

      // Get event info for directory naming
      const event = await EventModel.findById(event_id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const results = [];
      const errors = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const processed = await processImage(file.buffer, {
            year: String(event.year),
            eventSlug: event.slug,
            originalName: file.originalname,
          });

          const photo = await PhotoModel.create({
            eventId: event_id,
            albumId: album_id || null,
            title: files.length === 1 ? (title || null) : (title ? `${title} ${i + 1}` : null),
            description: description || null,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            originalPath: processed.paths.original,
            thumbnailPath: processed.paths.thumbnail,
            mediumPath: processed.paths.medium,
            largePath: processed.paths.large,
            fileSize: processed.metadata.fileSize,
            width: processed.metadata.width,
            height: processed.metadata.height,
          });

          results.push(photo);
        } catch (fileErr) {
          console.error(`Failed to process file ${file.originalname}:`, fileErr);
          errors.push({ file: file.originalname, error: fileErr.message });
        }
      }

      res.status(201).json({
        uploaded: results.length,
        failed: errors.length,
        photos: results,
        errors,
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed: ' + err.message });
    }
  },

  async update(req, res) {
    try {
      const { title, description, tags, is_published, display_order, album_id, event_id } = req.body;
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      if (is_published !== undefined) updates.is_published = is_published;
      if (display_order !== undefined) updates.display_order = display_order;
      if (album_id !== undefined) updates.album_id = album_id;
      if (event_id !== undefined) updates.event_id = event_id;

      const photo = await PhotoModel.update(req.params.id, updates);
      if (!photo) return res.status(404).json({ error: 'Photo not found' });
      res.json({ photo });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update photo' });
    }
  },

  async delete(req, res) {
    try {
      const photo = await PhotoModel.delete(req.params.id);
      if (!photo) return res.status(404).json({ error: 'Photo not found' });

      // Delete all file variants from storage
      const paths = [photo.original_path, photo.thumbnail_path, photo.medium_path, photo.large_path];
      await Promise.allSettled(
        paths.map(p => {
          if (!p) return Promise.resolve();
          // Strip leading /uploads/ to get relative path
          const rel = p.replace(/^\/uploads\//, '');
          return storage.deleteFile(rel);
        })
      );

      res.json({ message: 'Photo deleted successfully' });
    } catch (err) {
      console.error('Delete photo error:', err);
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  },

  async bulkDelete(req, res) {
    try {
      const { photo_ids } = req.body;
      if (!Array.isArray(photo_ids) || photo_ids.length === 0) {
        return res.status(400).json({ error: 'photo_ids array is required' });
      }

      const deletedPhotos = await PhotoModel.bulkDelete(photo_ids);

      // Delete files from storage
      for (const photo of deletedPhotos) {
        const paths = [photo.original_path, photo.thumbnail_path, photo.medium_path, photo.large_path];
        await Promise.allSettled(
          paths.map(p => {
            if (!p) return Promise.resolve();
            const rel = p.replace(/^\/uploads\//, '');
            return storage.deleteFile(rel);
          })
        );
      }

      res.json({ message: `${deletedPhotos.length} photos deleted`, count: deletedPhotos.length });
    } catch (err) {
      console.error('Bulk delete error:', err);
      res.status(500).json({ error: 'Failed to bulk delete photos' });
    }
  },

  async bulkMove(req, res) {
    try {
      const { photo_ids, album_id } = req.body;
      if (!Array.isArray(photo_ids) || photo_ids.length === 0) {
        return res.status(400).json({ error: 'photo_ids array is required' });
      }
      const count = await PhotoModel.bulkUpdateAlbum(photo_ids, album_id || null);
      res.json({ message: `${count} photos moved`, count });
    } catch (err) {
      res.status(500).json({ error: 'Failed to move photos' });
    }
  },

  async getRecent(req, res) {
    try {
      const photos = await PhotoModel.getRecentUploads(10);
      res.json({ photos });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch recent photos' });
    }
  },
};

module.exports = PhotosController;
