const express = require('express');
const router = express.Router();
const PhotosController = require('../controllers/photos');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, next);
  }
  next();
};

// Public
router.get('/', optionalAuth, PhotosController.getAll);
router.get('/recent', auth, PhotosController.getRecent);
router.get('/:id', PhotosController.getOne);

// Admin — protected
router.post('/upload', auth, upload.array('photos', 100), PhotosController.upload);
router.post('/bulk-delete', auth, PhotosController.bulkDelete);
router.post('/bulk-move', auth, PhotosController.bulkMove);
router.put('/:id', auth, PhotosController.update);
router.delete('/:id', auth, PhotosController.delete);

module.exports = router;
