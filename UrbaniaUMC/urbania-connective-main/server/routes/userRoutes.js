const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getProfile, updateProfile, updatePassword, updatePreferences, getAllUsers, getUsersByOwner, exportUsersCSV, exportUsersPDF, exportUsersExcel, importUsers, deleteUser, updateUser, deleteMyProfile, createUser } = require('../controller/userController');

// All routes are protected with auth middleware
router.use(auth);

// Admin routes
router.get('/all', getAllUsers);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteMyProfile);
router.put('/password', updatePassword);
router.put('/preferences', updatePreferences);
// Family code endpoints removed (feature deprecated)
// Get members by owner id
router.get('/by-owner/:id', getUsersByOwner);

// Export endpoints
router.get('/export/csv', exportUsersCSV);
router.get('/export/pdf', exportUsersPDF);
router.get('/export/excel', exportUsersExcel);
// Import endpoint
router.post('/import', importUsers);

// Delete user endpoint
router.delete('/:id', deleteUser);

// Add update user endpoint for admin
router.put('/:id', updateUser);

// Add user endpoint for admin
router.post('/', createUser);

module.exports = router;