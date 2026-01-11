const express = require('express');
const router = express.Router();
const communityController = require('../controller/communityController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', communityController.getCommunities);
router.get('/active', communityController.getActiveCommunities);
router.get('/category/:category', communityController.getCommunitiesByCategory);
router.get('/creator/:creatorId', communityController.getCommunitiesByCreator);
router.get('/:id', communityController.getCommunity);

// Protected routes
router.use(auth);
router.post('/', upload.single('image'), communityController.createCommunity);
router.put('/:id', upload.single('image'), communityController.updateCommunity);
router.delete('/:id', communityController.deleteCommunity);
router.post('/:id/join', communityController.joinCommunity);
router.post('/:id/leave', communityController.leaveCommunity);
router.post('/:id/moderator', communityController.addModerator);
router.delete('/:id/moderator', communityController.removeModerator);
router.post('/:id/announcement', communityController.addAnnouncement);

module.exports = router; 