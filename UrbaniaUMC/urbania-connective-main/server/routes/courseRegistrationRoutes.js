const express = require('express');
const router = express.Router();
const { createCourseRegistration, getAllRegistrations, getMyRegistrations, updateRegistrationStatus } = require('../controller/courseRegistrationController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/', createCourseRegistration); // Registration is now public
router.get('/', auth, checkRole(['admin']), getAllRegistrations);
router.get('/my-registrations', auth, getMyRegistrations);
router.patch('/:id/status', auth, checkRole(['admin']), updateRegistrationStatus);

module.exports = router; 