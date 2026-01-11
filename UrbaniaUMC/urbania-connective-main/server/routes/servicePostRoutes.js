const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { createServicePost, getServicePosts, getServicePostById } = require('../controller/servicePostController');

// Public: list posts (optionally filter by serviceId)
router.get('/', getServicePosts);
router.get('/:id', getServicePostById);

// Admin: create post
router.post('/', auth, checkRole(['admin']), createServicePost);

module.exports = router;
