const express = require('express');
const router = express.Router();
const workshopController = require('../controller/workshopController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', workshopController.getWorkshops);
router.get('/upcoming', workshopController.getUpcomingWorkshops);
router.get('/category/:category', workshopController.getWorkshopsByCategory);
router.get('/instructor/:instructorId', workshopController.getWorkshopsByInstructor);
router.get('/:id', workshopController.getWorkshop);

// Protected routes
router.use(auth);
router.post('/', upload.single('image'), workshopController.createWorkshop);
router.put('/:id', upload.single('image'), workshopController.updateWorkshop);
router.delete('/:id', workshopController.deleteWorkshop);
router.post('/:id/register', workshopController.registerForWorkshop);
router.post('/:id/unregister', workshopController.unregisterFromWorkshop);
router.post('/:id/review', workshopController.addReview);

module.exports = router; 