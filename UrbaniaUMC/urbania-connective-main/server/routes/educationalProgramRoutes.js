const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, checkRole } = require('../middleware/auth');
const {
    createProgram,
    getAllPrograms,
    getProgram,
    updateProgram,
    deleteProgram,
    enrollInProgram,
    updateEnrollmentStatus,
    addResource
} = require('../controller/educationalProgramController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public routes
router.get('/', getAllPrograms);
router.get('/:id', getProgram);

// Protected routes (require authentication)
router.post('/:id/enroll', auth, enrollInProgram);

// Instructor routes
router.post('/', auth, checkRole(['admin', 'instructor']), createProgram);
router.put('/:id', auth, checkRole(['admin', 'instructor']), updateProgram);
router.post('/:id/resources', auth, checkRole(['admin', 'instructor']), upload.single('file'), addResource);
router.put('/:id/enrollment/:userId', auth, checkRole(['admin', 'instructor']), updateEnrollmentStatus);

// Admin only routes
router.delete('/:id', auth, checkRole(['admin']), deleteProgram);

module.exports = router; 