const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Volunteer = require('../models/Volunteer');
const {
    submitVolunteerRequest,
    submitVolunteerApplication,
    getAllVolunteerRequests,
    getVolunteerRequest,
    approveVolunteerRequest,
    rejectVolunteerRequest,
    getUserVolunteerRequest,
    getMyVolunteerProfile,
    getVolunteersByUserId,
    getVolunteersByVolunteerId
} = require('../controller/volunteerController');

// Test route to verify API connectivity
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Volunteer API is working properly',
        timestamp: new Date().toISOString()
    });
});

// Check if an email exists but don't treat it as an error
router.get('/check-email/:email', auth, async (req, res) => {
    try {
        const { email } = req.params;

        if (!email || email.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Email parameter is required'
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if email exists in database
        const existingApplication = await Volunteer.findOne({
            email: email.trim().toLowerCase()
        });

        res.status(200).json({
            success: true,
            exists: !!existingApplication,
            message: existingApplication ?
                'An application with this email already exists, but you can still submit another one.' :
                'Email is available for a new application.'
        });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking email availability'
        });
    }
});

// Protected routes for volunteer applications
router.post('/apply', auth, submitVolunteerApplication);
router.post('/submit', auth, submitVolunteerRequest);
router.get('/my-request', auth, getUserVolunteerRequest);
router.get('/my-profile', auth, getMyVolunteerProfile);

// Admin routes
router.get('/:id', auth, isAdmin, getVolunteerRequest);
router.get('/', auth, isAdmin, getAllVolunteerRequests);
router.post('/:id/approve', auth, isAdmin, approveVolunteerRequest);
router.post('/:id/reject', auth, isAdmin, rejectVolunteerRequest);

// New routes for fetching volunteers by user id and volunteer id
router.get('/by-user/:userId', auth, getVolunteersByUserId);
router.get('/by-volunteer/:volunteerId', auth, getVolunteersByVolunteerId);

module.exports = router; 