const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
    subscribe,
    unsubscribe,
    getAllSubscribers,
    updatePreferences,
    sendNewsletter,
    getStatistics
} = require('../controller/newsletterController');

// Public routes
router.post('/subscribe', subscribe);
router.get('/unsubscribe/:token', unsubscribe);

// Protected routes (require authentication)
router.put('/preferences/:email', auth, updatePreferences);

// Admin only routes
router.get('/subscribers', auth, checkRole(['admin']), getAllSubscribers);
router.post('/send', auth, checkRole(['admin']), sendNewsletter);
router.get('/statistics', auth, checkRole(['admin']), getStatistics);

module.exports = router; 