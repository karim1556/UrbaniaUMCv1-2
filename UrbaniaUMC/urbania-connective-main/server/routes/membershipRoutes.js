const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
    createMembership,
    getUserMembership,
    getAllMemberships,
    updateMembershipStatus,
    cancelMembership
} = require('../controller/membershipController');

// User routes
router.post('/', auth, createMembership);
router.get('/my-membership', auth, getUserMembership);
router.post('/cancel', auth, cancelMembership);

// Admin routes
router.get('/', auth, checkRole(['admin']), getAllMemberships);
router.patch('/:membershipId/status', auth, checkRole(['admin']), updateMembershipStatus);

module.exports = router; 