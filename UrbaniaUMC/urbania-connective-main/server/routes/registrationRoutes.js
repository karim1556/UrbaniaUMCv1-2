const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');

// Import controllers
const {
    getAllRegistrations,
    getUserRegistrations,
    getRegistrationById,
    updateRegistrationStatus,
    deleteRegistration,
    getRegistrationStats
} = require('../controller/registrationController');

const {
    createGeneralRegistration,
    renewGeneralRegistration,
    updateGeneralRegistration,
    getGeneralRegistrations,
    getMembershipStats
} = require('../controller/generalRegistrationController');

const {
    createProgramRegistration,
    getProgramRegistrations,
    updateProgramRegistration,
    getProgramStats
} = require('../controller/programRegistrationController');

const {
    createEventRegistration,
    getEventRegistrations,
    updateEventRegistration,
    checkInAttendee,
    getEventStats,
    createEventRegistrationPaymentOrder,
    getEventRegistrationsByEventId,
    getMyEventRegistrations
} = require('../controller/eventRegistrationController');

const {
    createServiceRequest,
    getServiceRequests,
    updateServiceRequest,
    assignServiceRequest,
    getServiceStats
} = require('../controller/serviceRequestController');

const {
    createVolunteerRegistration,
    getVolunteerRegistrations,
    updateVolunteerRegistration,
    updateVolunteerStatus,
    getVolunteerStats
} = require('../controller/volunteerRegistrationController');

// Debug route
router.get('/test', (req, res) => {
    console.log('Registration API test endpoint hit');
    res.status(200).json({
        message: 'Registration API is working',
        timestamp: new Date().toISOString(),
        endpoints: {
            general: "/api/registrations/general",
            program: "/api/registrations/program",
            event: "/api/registrations/event",
            service: "/api/registrations/service",
            volunteer: "/api/registrations/volunteer"
        }
    });
});

// Request logging middleware for registrations
router.use((req, res, next) => {
    // Log only POST requests (form submissions)
    if (req.method === 'POST') {
        console.log(`[${new Date().toISOString()}] Registration request: ${req.method} ${req.url}`);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Admin routes (must be before other routes to be matched correctly)
router.get('/stats', auth, checkRole(['admin']), getRegistrationStats);

// Public routes - These are the main form submission endpoints
router.post('/general', auth, (req, res, next) => {
    console.log('General registration form submitted:', req.body);
    createGeneralRegistration(req, res, next);
});

router.post('/program', auth, (req, res, next) => {
    console.log('Program registration form submitted:', req.body);
    createProgramRegistration(req, res, next);
});

router.post('/event', auth, (req, res, next) => {
    console.log('Event registration form submitted:', req.body);
    createEventRegistration(req, res, next);
});

router.post('/service', auth, (req, res, next) => {
    console.log('Service request form submitted:', req.body);
    createServiceRequest(req, res, next);
});

router.post('/volunteer', auth, (req, res, next) => {
    console.log('Volunteer registration form submitted:', req.body);
    createVolunteerRegistration(req, res, next);
});

// Routes that require authentication
router.get('/user', auth, getUserRegistrations);

// General Registration routes
router.get('/general/stats', auth, checkRole(['admin']), getMembershipStats);
router.get('/general', auth, getGeneralRegistrations);
router.put('/general/:id', auth, updateGeneralRegistration);
router.post('/general/:id/renew', auth, renewGeneralRegistration);

// Program Registration routes
router.get('/program/stats', auth, checkRole(['admin']), getProgramStats);
router.get('/program', auth, getProgramRegistrations);
router.put('/program/:id', auth, updateProgramRegistration);

// Event Registration routes
router.get('/event/stats', auth, checkRole(['admin']), getEventStats);
router.get('/event/my', auth, getMyEventRegistrations);
router.get('/event', auth, getEventRegistrationsByEventId);
router.put('/event/:id', auth, updateEventRegistration);
router.put('/event/:id/check-in', auth, checkRole(['admin']), checkInAttendee);

// Service Request routes
router.get('/service/stats', auth, checkRole(['admin']), getServiceStats);
router.get('/service', auth, getServiceRequests);
router.put('/service/:id', auth, updateServiceRequest);
router.put('/service/:id/assign', auth, checkRole(['admin']), assignServiceRequest);

// Volunteer Registration routes
router.get('/volunteer/stats', auth, checkRole(['admin']), getVolunteerStats);
router.get('/volunteer', auth, getVolunteerRegistrations);
router.put('/volunteer/:id', auth, updateVolunteerRegistration);
router.put('/volunteer/:id/status', auth, checkRole(['admin']), updateVolunteerStatus);

// Get specific registration
router.get('/:id', auth, getRegistrationById);
router.put('/:id/status', auth, checkRole(['admin']), updateRegistrationStatus);
router.delete('/:id', auth, deleteRegistration);

// Catch-all admin route to get all registrations (must be last)
router.get('/', auth, checkRole(['admin']), getAllRegistrations);

// Add route for event registration payment order
router.post('/event/payment', createEventRegistrationPaymentOrder);

// Error handler middleware for registration routes
router.use((err, req, res, next) => {
    console.error('Registration route error:', err);
    res.status(500).json({
        message: 'Error processing registration',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An internal server error occurred'
    });
});

module.exports = router; 