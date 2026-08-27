const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
const auth = require('../middleware/auth');

router.post('/login', AuthController.login);
router.post('/logout', auth, AuthController.logout);
router.get('/me', auth, AuthController.me);

module.exports = router;
