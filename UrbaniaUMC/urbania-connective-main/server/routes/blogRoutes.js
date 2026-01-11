const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
    createBlogPost,
    getAllBlogPosts,
    getBlogPost,
    updateBlogPost,
    deleteBlogPost,
    publishBlogPost,
    addComment,
    toggleLike
} = require('../controller/blogController');

// Public routes
router.get('/', getAllBlogPosts);
router.get('/:slug', getBlogPost);

// Protected routes (require authentication)
router.post('/:id/comments', auth, addComment);
router.post('/:id/like', auth, toggleLike);

// Author routes (can create and edit their own posts)
router.post('/', auth, upload.single('featuredImage'), createBlogPost);
router.put('/:id', auth, upload.single('featuredImage'), updateBlogPost);

// Editor routes (can publish posts)
router.post('/:id/publish', auth, publishBlogPost);

// Admin routes (full access)
router.delete('/:id', auth, isAdmin, deleteBlogPost);

module.exports = router; 