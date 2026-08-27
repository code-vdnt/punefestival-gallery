const express = require('express');
const router = express.Router();
const EventsController = require('../controllers/events');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Optional auth — adds req.user if token present, doesn't fail without it
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, EventsController.getAll);
router.get('/stats', auth, EventsController.getStats);
router.get('/:id', EventsController.getOne);

// Support both multipart/form-data with cover_image file and JSON body
router.post('/', auth, upload.single('cover_image'), EventsController.create);
router.put('/:id', auth, upload.single('cover_image'), EventsController.update);
router.delete('/:id', auth, EventsController.delete);

module.exports = router;
