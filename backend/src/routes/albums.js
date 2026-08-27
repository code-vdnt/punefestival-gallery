const express = require('express');
const router = express.Router();
const AlbumsController = require('../controllers/albums');
const auth = require('../middleware/auth');

router.get('/', AlbumsController.getAll);
router.get('/:id', AlbumsController.getOne);

router.post('/', auth, AlbumsController.create);
router.put('/:id', auth, AlbumsController.update);
router.delete('/:id', auth, AlbumsController.delete);

module.exports = router;
