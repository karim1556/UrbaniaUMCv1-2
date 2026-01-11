const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventController');
const eventRegistrationController = require('../controller/eventRegistrationController');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/category/:category', eventController.getEventsByCategory);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/:id', eventController.getEvent);
router.get('/', eventController.getEvents);
router.get('/:id/total-attendees', eventController.getTotalAttendees);

// Protected routes (require authentication)
router.use(auth);

// Admin only routes
router.post('/', isAdmin, upload.array('images', 10), eventController.createEvent);
router.put('/:id', isAdmin, upload.array('images', 10), eventController.updateEvent);
router.delete('/:id', isAdmin, eventController.deleteEvent);

// User routes (require authentication)
router.post('/:id/register', eventController.registerForEvent);
router.post('/:id/unregister', eventController.unregisterFromEvent);
router.post('/:id/testimonial', eventController.addTestimonial);

module.exports = router; 