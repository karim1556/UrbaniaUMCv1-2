const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
    processDonation,
    handleSuccessfulPayment,
    getAllDonations,
    getUserDonations,
    getDonationById,
    getDonationStats,
    cancelRecurringDonation
} = require('../controller/donationController');

// Allow both authenticated and unauthenticated users to process donations
router.post('/process', processDonation);
router.post('/payment-success', handleSuccessfulPayment);

// User routes (require authentication)
router.get('/my-donations', auth, getUserDonations);
router.get('/my-donations/:id', auth, getDonationById);
router.post('/cancel/:id', auth, cancelRecurringDonation);

// Admin routes
router.get('/', auth, checkRole(['admin']), getAllDonations);
router.get('/stats', auth, checkRole(['admin']), getDonationStats);
router.get('/:id', auth, checkRole(['admin']), getDonationById);

module.exports = router; 