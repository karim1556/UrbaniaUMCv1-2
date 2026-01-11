const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getContactMessages,
    markMessageAsRead,
    replyToMessage,
    getMessageCounts
} = require('../controller/contactController');

// Submit a new contact message
router.post('/submit', submitContactForm);

// Get all messages with optional status filter
router.get('/messages', getContactMessages);

// Mark a message as read
router.patch('/messages/:messageId/read', markMessageAsRead);

// Reply to a message
router.post('/messages/:messageId/reply', replyToMessage);

// Get message counts by status
router.get('/counts', getMessageCounts);

// Delete a contact message by ID
router.delete('/messages/:messageId', require('../controller/contactController').deleteContactMessage);

module.exports = router;